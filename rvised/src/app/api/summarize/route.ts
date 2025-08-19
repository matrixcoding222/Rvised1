import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'

const execAsync = promisify(exec)

// CORS headers for Chrome extension
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-tier, x-user-email',
  'Access-Control-Max-Age': '86400'
}

// Extract transcript using ONLY YTX (YouTube Transcript tool at C:\Users\User\yt transcript)
async function fetchTranscriptYTX(videoUrl: string): Promise<string | null> {
  console.log('🎬 Extracting transcript using YTX for:', videoUrl)
  
  try {
    // Try multiple YTX execution methods
    const ytxCommands = [
      // Method 1: Direct Python execution with main.py
      {
        cmd: `cd "C:\\Users\\User\\yt transcript" && python main.py "${videoUrl}" --format txt --clean --prefer-ytdlp`,
        description: 'Direct Python with main.py'
      },
      // Method 2: Using python -m main
      {
        cmd: `cd "C:\\Users\\User\\yt transcript" && python -m main "${videoUrl}" --format txt --clean --prefer-ytdlp`,
        description: 'Python module execution'
      },
      // Method 3: YTX if installed in PATH
      {
        cmd: `ytx "${videoUrl}" --format txt --clean --prefer-ytdlp`,
        description: 'YTX in PATH'
      },
      // Method 4: Direct YTX executable path
      {
        cmd: `"C:\\Users\\User\\AppData\\Local\\Packages\\PythonSoftwareFoundation.Python.3.13_qbz5n2kfra8p0\\LocalCache\\local-packages\\Python313\\Scripts\\ytx.exe" "${videoUrl}" --format txt --clean --prefer-ytdlp`,
        description: 'YTX executable path'
      }
    ]
    
    for (const {cmd, description} of ytxCommands) {
      try {
        console.log(`🔧 Trying YTX method: ${description}`)
        
        const { stdout, stderr } = await execAsync(cmd, {
          timeout: 30000, // 30 second timeout
          maxBuffer: 1024 * 1024 * 10, // 10MB buffer
          shell: process.platform === 'win32' ? 'cmd' : '/bin/bash',
          env: { ...process.env, PYTHONIOENCODING: 'utf-8' } // Fix Unicode issues
        })
        
        // Check if we got valid transcript output
        if (stdout && stdout.trim().length > 50) {
          const transcript = stdout.trim()
          console.log(`✅ YTX transcript extracted successfully (${description}): ${transcript.substring(0, 100)}...`)
          return transcript
        }
        
        // Log any warnings from stderr (but don't fail on Info messages)
        if (stderr && !stderr.includes('Info:')) {
          console.warn(`YTX stderr for ${description}:`, stderr)
        }
      } catch (error: any) {
        console.log(`❌ YTX attempt failed (${description}):`, error.message)
        continue
      }
    }
    
    // If all commands fail, log the error
    console.error('❌ All YTX execution methods failed')
    return null
    
  } catch (error: any) {
    console.error('❌ YTX transcript extraction error:', error.message)
    return null
  }
}

// Simple transcript extraction using ONLY YTX
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Removed unreliable video type detection - let AI determine content type naturally from transcript

interface SummarizeResponse {
  success: boolean
  data?: {
    videoTitle: string
    videoId: string
    duration: string
    mainTakeaway: string
    summary: string
    techStack?: string[]
    keyInsights: string[]
    actionItems: string[]
    timestampedSections?: { time: string; description: string }[]
    codeSnippets?: { language: string; code: string; description: string }[]
    quiz?: { question: string; options: string[]; correct: number }[]
    resources?: { title: string; url?: string; type: string }[]
    // Legacy fields for backward compatibility
    keyPoints: string[]
  }
  error?: string
}

function coerceBoolean(value: unknown, defaultValue = false): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase()
    if (['1', 'true', 'yes', 'y', 'on'].includes(v)) return true
    if (['0', 'false', 'no', 'n', 'off'].includes(v)) return false
  }
  return defaultValue
}

function normalizeLearningMode(input: unknown): 'student' | 'build' | 'understand' {
  const v = String(input || '').trim().toLowerCase()
  if (!v) return 'student'
  if (['student', 'learn', 'study', 'learning'].includes(v)) return 'student'
  if (['build', 'dev', 'maker', 'engineering', 'code', 'developer'].includes(v)) return 'build'
  if (['understand', 'deep', 'analysis', 'theory', 'research', 'insight'].includes(v)) return 'understand'
  return 'student'
}

function normalizeSummaryDepth(input: unknown): 'quick' | 'standard' | 'deep' {
  const v = String(input || '').trim().toLowerCase()
  if (!v) return 'standard'
  if (['quick', 'short', 'brief', 'fast', 'light'].includes(v)) return 'quick'
  if (['standard', 'normal', 'default', 'regular'].includes(v)) return 'standard'
  if (['deep', 'detailed', 'long', 'in-depth', 'comprehensive', 'full'].includes(v)) return 'deep'
  return 'standard'
}

function normalizeSettingsPayload(raw: any) {
  const s = raw?.settings || {}
  const src = { ...raw, ...s }
  return {
    learningMode: normalizeLearningMode(src.learningMode || src.mode),
    summaryDepth: normalizeSummaryDepth(src.summaryDepth || src.depth),
    includeEmojis: coerceBoolean(src.includeEmojis ?? src.emojis ?? src.withEmojis, false),
    includeQuiz: coerceBoolean(src.includeQuiz ?? src.quiz ?? src.withQuiz ?? src.generateQuiz, false),
    includeTimestamps: coerceBoolean(src.includeTimestamps ?? src.timestamps ?? src.withTimestamps, false),
    customPrompt: src.customPrompt || '',
    quizOnly: coerceBoolean(src.quizOnly, false),
  }
}

function parseISODurationToSeconds(iso: string | undefined): number | null {
  if (!iso) return null
  try {
    const m = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/)
    if (!m) return null
    const h = parseInt(m[1] || '0', 10)
    const min = parseInt(m[2] || '0', 10)
    const s = parseInt(m[3] || '0', 10)
    return h * 3600 + min * 60 + s
  } catch { return null }
}

function splitTranscriptIntoSections(transcript: string, totalSeconds: number, target: number) {
  const fmt = (sec:number)=>{
    const s = Math.max(0, Math.floor(sec));
    const mm = String(Math.floor(s/60)).padStart(2,'0');
    const ss = String(s%60).padStart(2,'0');
    return `${mm}:${ss}`
  }
  const sentences = transcript
    .replace(/\s+/g, ' ')
    .split(/(?<=[\.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0)
  if (sentences.length === 0 || !Number.isFinite(totalSeconds) || totalSeconds <= 0) return [] as {time:string, description:string}[]
  const idealBlock = Math.max(60, Math.floor(totalSeconds / Math.max(1, target)))
  const words = sentences.join(' ').split(' ').length
  const wordsPerSec = Math.max(1, Math.floor(words / totalSeconds))
  const sections: { time: string; description: string }[] = []
  const step = idealBlock
  for (let i=0;i<target;i++) {
    const start = i * step
    const idx = Math.min(sentences.length - 1, Math.floor((start * wordsPerSec) / Math.max(1, Math.floor(words / sentences.length))))
    const desc = sentences[idx] || sentences[0]
    sections.push({ time: fmt(start), description: desc.slice(0, 110) })
  }
  return sections
}

async function aiTimestampsFromTranscript(openai: OpenAI, transcript: string, totalSeconds: number, target: number): Promise<{ time: string; description: string }[]> {
  try {
    if (!transcript || !Number.isFinite(totalSeconds) || totalSeconds <= 0) return []
    const max = Math.max(60, Math.floor(totalSeconds))
    const prompt = `You are given a video transcript. Create ${target} content-aware timestamps strictly from this transcript.
Return ONLY a JSON array like [{"time":"mm:ss","description":"..."}], 3-8 items, no markdown.
Rules: times must be inside 00:00..${String(Math.floor(max/60)).padStart(2,'0')}:${String(max%60).padStart(2,'0')}, increasing, unique, and descriptions must be short, specific to content.
Transcript:\n${transcript.slice(0, 12000)}`
    const res = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Output valid JSON only.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 500,
    })
    const raw = res.choices?.[0]?.message?.content?.trim() || ''
    let jsonText = raw
    if (jsonText.startsWith('```')) jsonText = jsonText.replace(/^```[a-zA-Z]*\s*/,'').replace(/```\s*$/,'')
    const arr = JSON.parse(jsonText)
    if (!Array.isArray(arr)) return []
    const valid = arr
      .map((i:any)=> ({ time: String(i?.time||'').trim(), description: String(i?.description||'').trim() }))
      .filter(i => /^(\d{2}):(\d{2})$/.test(i.time) && i.description.length>0)
    return valid.slice(0, Math.max(3, target))
  } catch { return [] }
}

async function generateQuizFromTranscript(openai: OpenAI, transcript: string, count: number): Promise<{ question: string; options: string[]; correct: number; answer?: string }[]> {
  try {
    if (!transcript || transcript.trim().length < 50) return []
    const capped = transcript.slice(0, 12000)
    
    const prompt = `From the transcript below, create ${count} REAL multiple choice questions based on the ACTUAL content. 

CRITICAL INSTRUCTIONS:
1. Read the transcript carefully
2. Create questions based ONLY on what is actually said in the transcript
3. For each question:
   - Write a clear question about something SPECIFIC from the transcript
   - Create ONE correct answer that accurately reflects what was said
   - Create THREE wrong answers that are plausible but clearly incorrect
   - Mix up where you place the correct answer (don't always put it first or last)

REQUIRED JSON FORMAT:
[
  {
    "question": "What specific thing was mentioned in the video?",
    "correctAnswer": "The exact correct answer text",
    "wrongAnswers": [
      "Wrong answer 1",
      "Wrong answer 2", 
      "Wrong answer 3"
    ]
  }
]

Example - if the video says "Clone existing apps and improve them by 1%":
{
  "question": "What strategy was mentioned for creating successful apps?",
  "correctAnswer": "Clone and improve existing apps by 1%",
  "wrongAnswers": [
    "Focus only on theoretical knowledge",
    "Invent completely new ideas",
    "Create apps based on random trends"
  ]
}

BE CAREFUL: Read what the video ACTUALLY says. Don't make up facts.

Transcript:\n${capped}`
    const res = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a precise quiz generator. Output ONLY valid JSON following the EXACT format specified. Create questions with one correctAnswer and three wrongAnswers.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3, // Lower temperature for more consistent output
      max_tokens: 1500,
    })
    const raw = res.choices?.[0]?.message?.content?.trim() || ''
    console.log('Raw quiz response from OpenAI:', raw)
    
    let jsonText = raw
    if (jsonText.startsWith('```')) jsonText = jsonText.replace(/^```[a-zA-Z]*\s*/, '').replace(/```\s*$/, '')
    
    let arr: any[]
    try {
      arr = JSON.parse(jsonText)
    } catch (e) {
      console.error('Failed to parse quiz JSON:', e)
      return []
    }
    
    if (!Array.isArray(arr)) {
      console.error('Quiz response is not an array')
      return []
    }
    
    return arr
      .map((item: any, qIdx: number) => {
        const question = String(item?.question || '').trim()
        const correctAnswer = String(item?.correctAnswer || '').trim()
        const wrongAnswers = Array.isArray(item?.wrongAnswers) 
          ? item.wrongAnswers.map((w: any) => String(w).trim())
          : []
        
        // Validate we have the right data
        if (!question || !correctAnswer || wrongAnswers.length !== 3) {
          console.error(`Invalid quiz question ${qIdx + 1}:`, { question, correctAnswer, wrongAnswers })
          return null
        }
        
        // Create options array with correct answer at a random position
        const allAnswers = [correctAnswer, ...wrongAnswers]
        
        // Shuffle the answers to randomize positions
        const shuffled = [...allAnswers].sort(() => Math.random() - 0.5)
        
        // Find where the correct answer ended up
        const correctIndex = shuffled.indexOf(correctAnswer)
        
        console.log(`Quiz Q${qIdx + 1}:`, {
          question,
          correctAnswer,
          correctIndex,
          options: shuffled
        })
        
        return {
          question,
          options: shuffled,
          correct: correctIndex,
          answer: correctAnswer // Keep for verification
        }
      })
      .filter(i => i !== null && i.question.length > 0 && i.options.length === 4)
      .slice(0, Math.max(2, count))
  } catch {
    // Fallback: Create simple multiple choice questions from transcript
    const sentences = transcript
      .replace(/\s+/g, ' ')
      .split(/(?<=[\.!?])\s+/)
      .map(s => s.trim())
      .filter(s => s.length >= 40)
    const items: { question: string; options: string[]; correct: number }[] = []
    
    // Generate plausible wrong answers
    const wrongOptions = [
      "The importance of regular exercise and healthy habits",
      "Advanced techniques in software development",
      "Historical perspectives on modern society",
      "Environmental conservation strategies",
      "Financial planning and investment tips",
      "Communication skills in the workplace",
      "Scientific breakthroughs in technology"
    ]
    
    for (let i=0; i<sentences.length && items.length < count; i++) {
      const s = sentences[i]
      const snippet = s.slice(0, 80).replace(/[\.!?]+$/, '')
      
      // Create multiple choice question
      const correctAnswer = snippet
      const shuffledWrong = [...wrongOptions].sort(() => Math.random() - 0.5).slice(0, 3)
      const allOptions = [correctAnswer, ...shuffledWrong].sort(() => Math.random() - 0.5)
      const correctIndex = allOptions.indexOf(correctAnswer)
      
      items.push({
        question: `According to the video, which statement is true?`,
        options: allOptions,
        correct: correctIndex
      })
    }
    return items.slice(0, Math.max(2, count))
  }
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

async function getVideoMetadata(videoId: string) {
  try {
    // Prefer official API when key is available
    if (process.env.YOUTUBE_API_KEY) {
      const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&key=${process.env.YOUTUBE_API_KEY}`
      console.log('Fetching video metadata via YouTube Data API:', videoId)
      const response = await fetch(apiUrl)
      const data = await response.json()
      if (!response.ok || (data as any)?.error) {
        console.warn('YouTube API error or non-OK, falling back to HTML scrape')
      } else if (data.items && data.items.length > 0) {
        const video = data.items[0]
        return {
          title: video.snippet.title,
          channel: video.snippet.channelTitle,
          duration: video.contentDetails.duration,
          description: video.snippet.description
        }
      }
    }

    // Fallback: scrape minimal metadata from watch HTML (no API key required)
    console.log('Fetching video metadata via HTML scrape:', videoId)
    const html = await fetch(`https://www.youtube.com/watch?v=${videoId}&hl=en`).then(r => r.text())
    // Title
    let title = ''
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i)
    if (titleMatch) {
      title = titleMatch[1].replace(/ - YouTube$/i, '').trim()
    }
    // Channel name
    let channel = ''
    const ownerMatch = html.match(/"ownerChannelName":"([^"]+)"/)
    if (ownerMatch) channel = ownerMatch[1]
    // Duration
    let duration = 'PT0S'
    const secsMatch = html.match(/"lengthSeconds":"(\d+)"/)
    if (secsMatch) {
      const secs = parseInt(secsMatch[1], 10)
      // Convert seconds to ISO 8601 duration (PT#H#M#S)
      const h = Math.floor(secs / 3600)
      const m = Math.floor((secs % 3600) / 60)
      const s = secs % 60
      duration = `PT${h > 0 ? h + 'H' : ''}${m > 0 ? m + 'M' : ''}${s > 0 ? s + 'S' : '0S'}`
    }
    const description = ''
    if (title) {
      return { title, channel, duration, description }
    }
    console.log('No metadata found via HTML scrape')
    return null
  } catch (error) {
    console.error('Error fetching video metadata:', error)
    return null
  }
}

async function generateSummary(content: string, videoTitle: string, contentSource: string, settings?: any): Promise<{ 
  mainTakeaway: string
  summary: string
  techStack?: string[]
  keyInsights: string[]
  actionItems: string[]
  timestampedSections?: { time: string; description: string }[]
  codeSnippets?: { language: string; code: string; description: string }[]
  quiz?: { question: string; options: string[]; correct: number }[]
  resources?: { title: string; url?: string; type: string }[]
  keyPoints: string[] // Legacy compatibility
}> {
  // ULTRA-EXPLICIT feature instructions to force compliance
  const featureCommands: string[] = []
  
  // Enhanced mode profiles for Eightify-style structured summaries
  const modeProfile: Record<string, string> = {
    student: `STUDENT MODE - Educational Focus:
    YOU MUST USE ACADEMIC LANGUAGE AND LEARNING-FOCUSED STRUCTURE:
    • Begin each insight with phrases like "The lesson here is...", "Students should note that...", "The key concept to understand is..."
    • Use educational terminology: "curriculum", "learning objectives", "comprehension", "study material", "exam preparation"
    • Focus on MEMORIZATION and UNDERSTANDING
    • Include mnemonics, study tips, and exam-relevant points
    • ACTION ITEMS must be study-focused: "Review this concept", "Practice with examples", "Test your understanding"
    • Add context about WHY each concept matters for learning
    • Use academic transitions: "Furthermore", "Moreover", "In academic terms"
    • Reference potential test questions or assignments`,
    
    build: `BUILD MODE - Implementation Focus:
    YOU MUST USE TECHNICAL LANGUAGE AND PROJECT-FOCUSED STRUCTURE:
    • Start insights with "To implement this...", "When building...", "The technical approach is...", "For production use..."
    • Use builder terminology: "architecture", "deployment", "optimization", "scalability", "tech stack", "dependencies"
    • Focus on PRACTICAL IMPLEMENTATION and BUILDING
    • Include specific tools, libraries, frameworks, and version numbers
    • ACTION ITEMS must be build-focused: "Set up the environment", "Install dependencies", "Configure the service", "Deploy to production"
    • Emphasize code quality, performance, and best practices
    • Use technical transitions: "Subsequently", "Additionally", "From an architectural standpoint"
    • Include troubleshooting tips and common pitfalls`,
    
    understand: `UNDERSTAND MODE - Deep Analysis Focus:
    YOU MUST USE ANALYTICAL LANGUAGE AND THEORY-FOCUSED STRUCTURE:
    • Begin insights with "The underlying principle is...", "Fundamentally, this means...", "The theory behind this...", "At its core..."
    • Use analytical terminology: "paradigm", "framework", "methodology", "implications", "causation", "correlation"
    • Focus on WHY and HOW things work at a FUNDAMENTAL level
    • Include historical context, evolution of ideas, and future implications
    • ACTION ITEMS must be research-focused: "Explore the theory", "Analyze the patterns", "Compare approaches", "Research alternatives"
    • Connect to broader concepts and interdisciplinary perspectives
    • Use analytical transitions: "Consequently", "This implies that", "From a theoretical perspective"
    • Discuss edge cases, limitations, and philosophical implications`
  }

  const depthProfile: Record<string, {maxSummaryChars:number; insights:number; actions:number; style:string}> = {
    quick:     { maxSummaryChars: 1800,  insights: 5, actions: 4, style: 'CONCISE, BULLET-POINT FOCUSED' },
    standard:  { maxSummaryChars: 3000, insights: 8, actions: 6, style: 'BALANCED, WELL-STRUCTURED' },
    deep:      { maxSummaryChars: 5000, insights: 12, actions: 10, style: 'COMPREHENSIVE, DETAILED, NUANCED' },
  }
  const currentDepth = (settings?.summaryDepth || 'standard') as keyof typeof depthProfile
  const depthCfg = depthProfile[currentDepth] || depthProfile.standard
  const currentMode = (settings?.learningMode || 'student') as string
  
  // Check if we have a custom prompt to use (but skip for quiz-only requests)
  if (settings?.customPrompt && !settings?.quizOnly) {
    console.log('🎯 Using custom prompt from extension')
    const basePrompt = settings.customPrompt.replace('${videoTitle}', videoTitle || 'Unknown Video')
    
    try {
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          {
            role: "system", 
            content: "You are a helpful video content analyzer. Always respond with valid JSON only. Never use markdown formatting. Generate videoInsightTitle from the actual video content (2-4 words capturing the core topic). The mainTakeaway must be EXACTLY 2 short sentences (100-150 chars total) - extremely concise. NEVER repeat mainTakeaway content in other sections. Each section must be unique."
          },
          {
            role: "user",
            content: `${basePrompt}\n\nTRANSCRIPT:\n${content.slice(0, transcriptLength)}\n\nReturn ONLY valid JSON matching this structure: {"videoInsightTitle": "", "mainTakeaway": "", "summary": "", "keyInsights": [], "actionItems": [], "quiz": []}`
          }
        ],
        temperature: 0.7,
        max_tokens: currentDepth === 'deep' ? 6000 : currentDepth === 'quick' ? 2000 : 4000,
      })
      
      const rawResponse = completion.choices[0]?.message?.content || ''
      const cleanJson = rawResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const parsed = JSON.parse(cleanJson)
      
      // Ensure mainTakeaway is always a string and consistent
      if (!parsed.mainTakeaway || typeof parsed.mainTakeaway !== 'string') {
        // Generate a mainTakeaway if missing
        parsed.mainTakeaway = parsed.summary ? 
          parsed.summary.split('.')[0] + '.' : 
          "Key insight from this video";
      }
      
      return parsed
    } catch (error) {
      console.error('Error with custom prompt, falling back to default')
      // Fall through to default prompt generation
    }
  }
  
  // Build an EXTREMELY detailed prompt for rich summaries
  const promptParts: string[] = []
  
  promptParts.push(`You are an expert content analyst creating a premium, comprehensive video summary.`)
  promptParts.push(`\n📹 VIDEO: "${videoTitle}"`)
  promptParts.push(`📏 TRANSCRIPT: ${content.length} characters`)
  
  promptParts.push(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  promptParts.push(`🎯 MODE: ${currentMode.toUpperCase()} | DEPTH: ${currentDepth.toUpperCase()}`)
  promptParts.push(`CRITICAL RULES FOR ${currentMode.toUpperCase()} MODE:
1. videoInsightTitle: 2-4 words specific to ${currentMode === 'student' ? 'LEARNING' : currentMode === 'build' ? 'BUILDING' : 'UNDERSTANDING'} aspect
2. mainTakeaway: Write in ${currentMode === 'student' ? 'EDUCATIONAL' : currentMode === 'build' ? 'TECHNICAL' : 'ANALYTICAL'} style (100-150 chars)
3. keyInsights: ${depthCfg.insights} insights using ${currentMode.toUpperCase()} perspective - MUST BE DISTINCTLY ${currentMode.toUpperCase()}-FOCUSED
4. actionItems: ${depthCfg.actions} actions that are EXPLICITLY ${currentMode === 'student' ? 'STUDY' : currentMode === 'build' ? 'BUILD' : 'RESEARCH'}-ORIENTED
5. summary: ${depthCfg.maxSummaryChars}-char ${depthCfg.style} overview from ${currentMode.toUpperCase()} perspective
6. ABSOLUTE RULE: The entire response MUST reflect ${currentMode.toUpperCase()} mode's unique voice and focus.`)
  promptParts.push(modeProfile[currentMode] || modeProfile.student)
  
  promptParts.push(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  promptParts.push(`📊 DEPTH: ${currentDepth.toUpperCase()} SUMMARY`)
  
  if (currentDepth === 'deep') {
    promptParts.push(`\n📝 COMPREHENSIVE DEEP DIVE REQUIREMENTS:`)
    promptParts.push(`1. Write an EXTENSIVE summary (${depthCfg.maxSummaryChars} characters) covering ALL major points, context, examples, and implications`)
    promptParts.push(`2. Include ${depthCfg.insights} DETAILED insights - each 2-3 sentences with specific information, examples, and context`)
    promptParts.push(`3. Add ${depthCfg.actions} COMPREHENSIVE action steps with full implementation details and expected outcomes`)
    promptParts.push(`4. Cover EVERY important concept mentioned in the video`)
    promptParts.push(`5. Include relevant quotes, statistics, and specific examples`)
    promptParts.push(`6. Provide thorough analysis and deeper understanding`)
  } else if (currentDepth === 'quick') {
    promptParts.push(`\n📝 QUICK SUMMARY REQUIREMENTS:`)
    promptParts.push(`1. Write a concise summary (${depthCfg.maxSummaryChars} characters) hitting key points`)
    promptParts.push(`2. Include ${depthCfg.insights} brief insights - one sentence each`)
    promptParts.push(`3. Add ${depthCfg.actions} quick action steps`)
    promptParts.push(`4. Focus on the most essential information only`)
  } else {
    promptParts.push(`\n📝 STANDARD REQUIREMENTS:`)
    promptParts.push(`1. Write a balanced summary (${depthCfg.maxSummaryChars} characters) with good coverage`)
    promptParts.push(`2. Include ${depthCfg.insights} solid insights - 1-2 sentences each`)
    promptParts.push(`3. Add ${depthCfg.actions} actionable steps with clear guidance`)
    promptParts.push(`4. Cover the main points thoroughly`)
    promptParts.push(`5. Make it easy to read and remember`)
  }
  
  // Feature flags
  promptParts.push(`\n\nFEATURE SETTINGS:`)
  promptParts.push(`- Emojis: ${settings?.includeEmojis ? 'YES - Add relevant emojis to all sections' : 'NO - Use plain text only'}`)
  promptParts.push(`- Timestamps: ${settings?.includeTimestamps ? 'YES - Include 5 timestamped sections' : 'NO'}`)
  promptParts.push(`- Quiz: ${settings?.includeQuiz ? 'YES - Include 3 quiz questions' : 'NO'}`)
  
  promptParts.push(`\n\nTRANSCRIPT TO ANALYZE:`)
  // Send more transcript for deep mode
  const transcriptLength = currentDepth === 'deep' ? 25000 : currentDepth === 'quick' ? 10000 : 15000;
  promptParts.push(content.slice(0, transcriptLength))
  
  promptParts.push(`\n\nIMPORTANT: Return ONLY valid JSON with this EXACT structure:`)
  
  // Build JSON template with clear expectations
  const jsonTemplate: any = {
    videoInsightTitle: "A 2-4 word title capturing THIS VIDEO'S CORE CONCEPT. Extract from transcript content. Examples: 'No-Code Revolution', 'Scale to Millions', 'AI Strategy'. Must be specific to video topic.",
    mainTakeaway: "EXACTLY 2 short sentences (100-150 chars total). State the ONE core principle. Be extremely concise.",
    summary: `A sophisticated ${depthCfg.maxSummaryChars}-character summary that elegantly captures all major points with polished, professional language suitable for ${currentMode} learning style`,
    keyInsights: Array(depthCfg.insights).fill(null).map((_, i) => 
      `Insight #${i+1}: 1-2 complete sentences providing a UNIQUE observation, technique, or implication. Include specific details, examples, or context. Must be different from mainTakeaway and other insights.`
    ),
    actionItems: Array(depthCfg.actions).fill(null).map((_, i) => 
      `Action #${i+1}: Specific, detailed action step with clear implementation guidance. Include what to do, how to do it, and expected outcome.`
    ),
    keyPoints: ["Same as keyInsights for backward compatibility"]
  }
  
  // Add optional fields
  if (content.toLowerCase().includes('code') || content.toLowerCase().includes('programming')) {
    jsonTemplate.techStack = ["Technology 1", "Technology 2"]
  } else {
    jsonTemplate.techStack = null
  }
  
  if (settings?.includeTimestamps) {
    jsonTemplate.timestampedSections = [
      { time: "00:00", description: "Complete sentence describing what happens at the beginning of the video" },
      { time: "02:30", description: "Complete sentence describing the main concept or topic discussed at this point" },
      { time: "05:00", description: "Complete sentence describing examples or demonstrations shown" },
      { time: "08:00", description: "Complete sentence describing implementation details or deeper explanation" },
      { time: "12:00", description: "Complete sentence describing the conclusion or final thoughts" }
    ]
  }
  
  if (settings?.includeQuiz) {
    jsonTemplate.quiz = [
      { 
        question: "What was the main topic discussed in the video?",
        options: ["Option A from video", "Option B from video", "Option C from video", "Option D from video"],
        correct: 0
      },
      { 
        question: "Which key concept was emphasized?",
        options: ["Concept A", "Concept B", "Concept C", "Concept D"],
        correct: 2
      },
      { 
        question: "According to the video, what is important to remember?",
        options: ["Point 1", "Point 2", "Point 3", "Point 4"],
        correct: 1
      }
    ]
  }
  
  promptParts.push(JSON.stringify(jsonTemplate, null, 2))
  
  const basePrompt = promptParts.join('\n')

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system", 
          content: `You are an elite content analyst specializing in ${currentMode.toUpperCase()} MODE summaries.
${currentMode === 'student' ? 'Write like an ACADEMIC EDUCATOR creating study materials. Use educational terminology, learning-focused language, and study-oriented structure.' : 
currentMode === 'build' ? 'Write like a SENIOR ENGINEER creating technical documentation. Use technical jargon, implementation details, and builder-focused structure.' :
'Write like a RESEARCH ANALYST creating theoretical analysis. Use analytical language, deep insights, and research-oriented structure.'}

Your ${currentDepth.toUpperCase()} depth summary must be ${depthCfg.style}.
ALWAYS respond with valid JSON only. Never use markdown formatting.
MAKE THE ${currentMode.toUpperCase()} MODE PERSPECTIVE EXTREMELY OBVIOUS in every section.`
        },
        {
          role: "user",
          content: basePrompt
        }
      ],
      temperature: 0.3,
      max_tokens: settings?.summaryDepth === 'deep' ? 6000 : settings?.summaryDepth === 'quick' ? 1500 : 3000,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) throw new Error('No response from OpenAI')

    try {
      // Strip markdown formatting if present
      let jsonContent = content.trim()
      
      // Remove ```json and ``` wrappers if they exist
      if (jsonContent.startsWith('```json')) {
        jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }
      
      return JSON.parse(jsonContent)
    } catch (parseError) {
      console.log('JSON parsing failed:', parseError instanceof Error ? parseError.message : 'Unknown error')
      console.log('Raw content:', content.substring(0, 200) + '...')
      
      // Fallback if JSON parsing fails
      return {
        mainTakeaway: "Unable to generate structured summary",
        summary: content.slice(0, depthCfg.maxSummaryChars),
        keyInsights: ["Check video for detailed content", "Review transcript for specific steps"].slice(0, depthCfg.insights),
        actionItems: ["Watch the full video for complete information"].slice(0, depthCfg.actions),
        keyPoints: ["Check video for detailed content", "Review transcript for specific steps"] // Legacy compatibility
      }
    }
  } catch (error) {
    console.error('OpenAI API error:', error)
    // Retry once with smaller max tokens and shorter content slice; if it fails, propagate error (no fallback)
    const safePrompt = basePrompt.slice(0, 8000)
    const completion2 = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful video content analyzer. Always respond with valid JSON only. Never use markdown formatting." },
        { role: "user", content: safePrompt }
      ],
      temperature: 0.2,
      max_tokens: 900,
    })
    const content2 = completion2.choices[0]?.message?.content
    if (!content2) throw new Error('No response from OpenAI (retry)')
    let jsonContent2 = content2.trim()
    if (jsonContent2.startsWith('```json')) {
      jsonContent2 = jsonContent2.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (jsonContent2.startsWith('```')) {
      jsonContent2 = jsonContent2.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }
    return JSON.parse(jsonContent2)
  }
}

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders
  })
}

export async function POST(request: NextRequest): Promise<NextResponse<SummarizeResponse>> {
  try {
    const rawBody = await request.json()
    const normalized = normalizeSettingsPayload(rawBody)
    const settings = {
      learningMode: normalized.learningMode,
      summaryDepth: normalized.summaryDepth,
      includeEmojis: normalized.includeEmojis,
      includeQuiz: normalized.includeQuiz,
      generateQuiz: normalized.includeQuiz,
      includeTimestamps: normalized.includeTimestamps,
      includeActionItems: normalized.includeActionItems ?? true,
      includeTranscript: normalized.includeTranscript ?? false,
      customPrompt: normalized.customPrompt,
      quizOnly: normalized.quizOnly,
    }
    const currentDepth = (settings.summaryDepth || 'standard') as 'quick' | 'standard' | 'deep'
    const videoUrl: string = rawBody.videoUrl || rawBody.url // support old key
    const extensionTranscript = rawBody.extensionTranscript
    const extensionChapters = rawBody.extensionChapters
    let userEmail = request.headers.get('x-user-email') || rawBody.userEmail || null
    const authToken = request.headers.get('Authorization')?.replace('Bearer ', '') || rawBody.authToken || null
    
    console.log('Request received with settings:', settings)
    console.log('User email:', userEmail, 'Auth token:', !!authToken)
    
    // REQUIRE AUTHENTICATION - No guest summaries allowed
    // TEMPORARILY DISABLED FOR TESTING - UNCOMMENT FOR PRODUCTION
    /*
    if (!userEmail || userEmail === 'guest' || !authToken) {
      return NextResponse.json({
        success: false,
        error: 'Sign in required',
        message: 'Please sign in to generate summaries',
        requiresAuth: true
      }, {
        status: 401,
        headers: corsHeaders
      })
    }
    */
    
    // For testing: Set default email if not provided
    if (!userEmail || userEmail === 'guest') {
      userEmail = 'developer@rvised.app';
      console.log('🔧 TEST MODE: Using developer email');
    }
    
    // Check usage limits for free users
    try {
      // Get video duration if available
      let videoDuration = rawBody.videoDuration || 0
      
      // Check user's usage
      const usageResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/usage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': userEmail,
        },
        body: JSON.stringify({
          action: 'check',
          videoLength: videoDuration,
        }),
      })
      
      if (!usageResponse.ok && usageResponse.status === 429) {
        const limitData = await usageResponse.json()
        return NextResponse.json({
          error: limitData.error,
          limitType: limitData.limitType,
          message: limitData.message,
          upgradeUrl: limitData.upgradeUrl,
        }, { 
          status: 429, 
          headers: corsHeaders 
        })
      }
    } catch (error) {
      console.log('Usage check error (non-blocking):', error)
      // Continue anyway if usage check fails
    }
    console.log('Extension transcript provided:', !!extensionTranscript)
    console.log('Extension chapters provided:', !!extensionChapters, extensionChapters?.length || 0, 'chapters')

    if (!videoUrl) {
      return NextResponse.json({ 
        success: false, 
        error: 'Video URL is required' 
      }, { 
        status: 400,
        headers: corsHeaders
      })
    }

    // Extract video ID
    const videoId = extractVideoId(videoUrl)
    if (!videoId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid YouTube URL' 
      }, { 
        status: 400,
        headers: corsHeaders
      })
    }

    // Get video metadata
    const metadata = await getVideoMetadata(videoId)
    if (!metadata) {
      return NextResponse.json({ 
        success: false, 
        error: 'Could not fetch video information. Video may be private or unavailable.' 
      }, { 
        status: 404,
        headers: corsHeaders
      })
    }

    // ONLY use transcripts - no description fallback as requested
    let contentToSummarize = ''
    let contentSource = ''

    // keep ytx-derived structures for timestamps
    let ytxChapters: Array<{time?: string; title?: string; start?: number}> | null = null
    let ytxSegments: Array<{ text?: string; start?: number; duration?: number }> | null = null
    let timestampsSource: 'extension'|'ytx-chapters'|'ytx-segments'|'fallback'|'none' = 'none'
    try {
      console.log('📝 Transcript extraction starting (ytx)...')

      // Prefer extension-provided transcript if valid; else run ytx locally
      const looksBlocked = typeof extensionTranscript === 'string' && /<html|Our systems have detected unusual traffic|verify you are a human|automated queries/i.test(extensionTranscript)
      if (extensionTranscript && extensionTranscript.length > 50 && !looksBlocked) {
        console.log('🔌 Using transcript from Chrome extension')
        contentToSummarize = extensionTranscript.trim()
        contentSource = 'extension-transcript'
        console.log(`📊 Extension transcript: ${contentToSummarize.length} characters`)
      } else {
        // Try multiple methods to get transcript
        console.log('📡 Fetching transcript using multiple methods...')
        
        // Try YTX first
        const ytxTranscript = await fetchTranscriptYTX(videoUrl)
        
        if (ytxTranscript && ytxTranscript.length > 50) {
          contentToSummarize = ytxTranscript.trim()
          contentSource = 'ytx-transcript'
          console.log(`✅ Got transcript via YTX: ${contentToSummarize.length} chars`)
        } else {
          // If YTX fails, try other methods
          console.log('⚠️ YTX failed, trying alternative methods...')
          
          // Try youtube-transcript library
          try {
            const { YoutubeTranscript } = await import('youtube-transcript')
            const transcriptData = await YoutubeTranscript.fetchTranscript(videoId)
            if (transcriptData && transcriptData.length > 0) {
              contentToSummarize = transcriptData.map(item => item.text).join(' ').trim()
              contentSource = 'youtube-transcript'
              console.log(`✅ Got transcript via youtube-transcript: ${contentToSummarize.length} chars`)
            }
          } catch (error) {
            console.log('youtube-transcript failed:', error)
          }
          
          // If still no transcript, throw error
          if (!contentToSummarize || contentToSummarize.length < 50) {
            throw new Error('No transcript extraction method succeeded')
          }
        }
      }
    } catch (transcriptError) {
      console.log('❌ Transcript extraction failed:', transcriptError instanceof Error ? transcriptError.message : 'Unknown error')
      
      // As absolute last resort, try to use video title and basic info
      if (metadata && metadata.title) {
        console.log('🆘 Using minimal video info as last resort')
        contentToSummarize = `Video Title: ${metadata.title}\nChannel: ${metadata.channel || 'Unknown'}\nDuration: ${metadata.duration || 'Unknown'}\n\nNote: This video does not have captions or transcripts available. The summary is based on limited information.`
        contentSource = 'minimal-info'
      } else {
        return NextResponse.json({ 
          success: false, 
          error: 'This video does not have captions available. Please try a different video with closed captions enabled.' 
        }, { 
          status: 404, 
          headers: corsHeaders 
        })
      }
    }

    // Smart Transcript Capping - control costs while always delivering value
    const MAX_TOKENS = {
      free: 6000,    // ~30 min video worth of content
      pro: 36000     // ~3 hour video worth of content
    };
    
    // Detect user tier (default to free for now, will add auth later)
    const userTier = request.headers.get('x-user-tier') || 'free';
    const maxTokensForTier = MAX_TOKENS[userTier as keyof typeof MAX_TOKENS] || MAX_TOKENS.free;
    
    // Estimate tokens (rough: 1 token ≈ 0.75 words, 1 word ≈ 5 chars)
    const estimatedTokens = Math.ceil(contentToSummarize.length / 3.75);
    let wasTranscriptCapped = false;
    let originalLength = contentToSummarize.length;
    
    if (estimatedTokens > maxTokensForTier) {
      // Cap the transcript to max tokens worth of characters
      const maxChars = Math.floor(maxTokensForTier * 3.75);
      contentToSummarize = contentToSummarize.slice(0, maxChars);
      wasTranscriptCapped = true;
      console.log(`📊 Transcript capped: ${originalLength} chars -> ${maxChars} chars (${userTier} tier)`);
    }

    // Generate summary with OpenAI (no video type detection - let AI determine content naturally)
    console.log(`🔧 DETAILED SETTINGS DEBUG:`)
    console.log(`- Learning Mode: ${settings.learningMode}`)
    console.log(`- Summary Depth: ${settings.summaryDepth}`)
    console.log(`- Include Emojis: ${settings.includeEmojis}`)
    // Code feature removed for simplicity
    console.log(`- Include Quiz: ${settings.includeQuiz}`)
    console.log(`- Include Timestamps: ${settings.includeTimestamps}`)
    console.log(`- Content Source: ${contentSource}`)
    console.log(`- Content Length: ${contentToSummarize.length} chars`)
    console.log(`- User Tier: ${userTier}`)
    console.log(`- Was Capped: ${wasTranscriptCapped}`)
    
    const summaryData = await generateSummary(contentToSummarize, metadata.title, contentSource, settings)
    
    console.log(`🔍 RAW AI RESPONSE RECEIVED:`)
    console.log(`- Has timestampedSections: ${!!summaryData.timestampedSections}`)
    console.log(`- Has codeSnippets: ${!!summaryData.codeSnippets}`)
    console.log(`- Has quiz: ${!!summaryData.quiz}`)
    console.log(`- Summary length: ${summaryData.summary?.length || 0} chars`)
    console.log(`- Contains emojis: ${/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu.test(summaryData.summary || '')}`)

    // STEP 2: BULLETPROOF SERVER-SIDE FEATURE GENERATION
    console.log('🔧 ENFORCING FEATURES SERVER-SIDE...')
    
    // TIMESTAMPS: Always generate timestamps for UI to control visibility
    // This ensures the UI can show/hide them based on user preference
    if (true) { // Always generate timestamps
      let timestamps = summaryData.timestampedSections
      
      // If AI didn't provide timestamps, generate them ourselves
      if (!timestamps || !Array.isArray(timestamps) || timestamps.length === 0) {
        console.log('⚠️ AI failed to provide timestamps, generating server-side...')
        timestamps = []
        
        // PRIORITY: Use extension-provided chapters first
        if (extensionChapters && Array.isArray(extensionChapters) && extensionChapters.length > 0) {
          console.log('🎯 Using extension-provided chapters:', extensionChapters.length)
          timestamps = extensionChapters
          timestampsSource = 'extension'
        } else if (Array.isArray(ytxChapters) && ytxChapters.length > 0) {
          console.log('🎯 Using ytx chapters')
          timestamps = ytxChapters.map((c:any)=> ({ time: (c.time || ''), description: (c.title || '').trim() })).filter(s=>s.time && s.description)
          timestampsSource = 'ytx-chapters'
        } else {
          // Prefer AI transcript-only timestamps before heuristics
          const totalSeconds = parseISODurationToSeconds(metadata.duration) || 0
          const target = currentDepth === 'deep' ? 8 : currentDepth === 'quick' ? 4 : 6
          const aiTs = await aiTimestampsFromTranscript(openai, contentToSummarize, totalSeconds, target)
          if (aiTs.length >= 3) {
            timestamps = aiTs
            timestampsSource = 'ai-transcript'
          }
        }
        if ((!timestamps || timestamps.length===0) && Array.isArray(ytxSegments) && ytxSegments.length > 0) {
          console.log('🧩 Deriving logical sections from ytx segments (gap + cue heuristic)')
          const fmt = (sec:number)=>{
            const s = Math.max(0, Math.floor(sec));
            const mm = String(Math.floor(s/60)).padStart(2,'0');
            const ss = String(s%60).padStart(2,'0');
            return `${mm}:${ss}`
          }
          const totalSec = Math.floor((ytxSegments[ytxSegments.length-1]?.start || 0) + (ytxSegments[ytxSegments.length-1]?.duration || 0))
          const target = currentDepth === 'deep' ? 8 : currentDepth === 'quick' ? 4 : 6
          const idealBlock = Math.max(60, Math.floor(totalSec / target)) // aim ~equal time blocks, min 60s
          const blocks: { start:number; text:string }[] = []
          let blockStart = Math.floor(ytxSegments[0]?.start || 0)
          let accText = ''
          let lastEnd = blockStart
          const cueRegex = /\b(first|second|third|next|now|let\'s|let us|to (start|begin)|moving on|in summary|to conclude|recap|summary)\b/i
          for (let i=0;i<ytxSegments.length;i++) {
            const seg = ytxSegments[i] as any
            const s = Math.floor(seg?.start || 0)
            const d = Math.floor(seg?.duration || 0)
            const e = s + d
            const gap = s - lastEnd
            accText += (seg?.text || '') + ' '
            const blockLen = e - blockStart
            const breakByGap = gap > 3
            const breakByLen = blockLen >= Math.floor(idealBlock*0.9)
            const breakByCue = cueRegex.test(seg?.text || '') && blockLen >= Math.floor(idealBlock*0.5)
            const isLast = i === ytxSegments.length - 1
            if (breakByGap || breakByLen || breakByCue || isLast) {
              const firstSentence = (accText.trim().match(/[^.!?\n]+[.!?]/)?.[0] || accText.trim()).replace(/\s+/g,' ').slice(0, 110)
              blocks.push({ start: blockStart, text: firstSentence })
              blockStart = Math.max(s, e)
              accText = ''
            }
            lastEnd = e
          }
          // Condense or expand to target
          if (blocks.length > target) {
            const ratio = blocks.length / target
            const reduced: typeof blocks = []
            for (let i=0;i<target;i++) {
              const idx = Math.floor(i*ratio)
              reduced.push(blocks[Math.min(idx, blocks.length-1)])
            }
            blocks.length = 0; blocks.push(...reduced)
          } else if (blocks.length < Math.max(3, target-1)) {
            // try splitting long blocks to approach target
            let i = 0
            while (blocks.length < target && i < blocks.length) {
              const b = blocks[i]
              const mid = b.start + Math.floor(idealBlock/2)
              if (idealBlock >= 90) {
                blocks.splice(i+1, 0, { start: mid, text: 'Continuation' })
              }
              i++
            }
          }
          timestamps = blocks.map((b, idx)=> ({ time: fmt(b.start), description: b.text || `Section ${idx+1}` }))
          timestampsSource = 'ytx-segments'
        } else if (!timestamps || timestamps.length===0) {
          // As a final transcript-only path (still avoiding description), derive from transcript + duration
          const totalSeconds = parseISODurationToSeconds(metadata.duration) || 0
          const target = currentDepth === 'deep' ? 8 : currentDepth === 'quick' ? 4 : 6
          const derived = splitTranscriptIntoSections(contentToSummarize, totalSeconds, target)
          if (derived.length) {
            timestamps = derived
            timestampsSource = 'ytx-segments'
          }
        }
        
        console.log(`📝 Extracted ${timestamps.length} timestamps from description`)
        
        // If still no timestamps, create logical ones based on video length
        if (timestamps.length === 0) {
          console.log('📝 Creating logical timestamp sections...')
          timestamps = [
            { time: "00:00", description: "Introduction and overview" },
            { time: "02:30", description: "Main content begins" },
            { time: "05:00", description: "Key concepts and examples" },
            { time: "08:00", description: "Advanced topics and implementation" },
            { time: "12:00", description: "Conclusion and next steps" }
          ]
          timestampsSource = 'fallback'
        }
        
        summaryData.timestampedSections = timestamps
        console.log(`✅ Generated ${timestamps.length} timestamp sections`)
      }
      
      // Always include timestamps in response for UI control
      // The includeTimestamps flag will be used by the UI to show/hide them
      summaryData._includeTimestamps = settings.includeTimestamps
    }
    
    // ENFORCE DEPTH LIMITS AND MINIMUM COUNTS FOR INSIGHTS/ACTIONS
    try {
      const maxChars = depthCfg.maxSummaryChars
      if (typeof summaryData.summary === 'string' && summaryData.summary.length > maxChars) {
        summaryData.summary = summaryData.summary.slice(0, maxChars)
      }

      // Normalize insights - ensure they're always strings
      let insights: string[] = Array.isArray(summaryData.keyInsights) 
        ? summaryData.keyInsights.map(i => {
            if (typeof i === 'string') return i;
            if (i?.text) return String(i.text);
            if (i?.content) return String(i.content);
            return String(i);
          }).filter(Boolean) 
        : []
      const desiredInsights = depthCfg.insights
      if (insights.length < desiredInsights) {
        const sentences = (contentToSummarize || '')
          .split(/(?<=[\.\!\?])\s+/)
          .map(s => s.trim())
          .filter(s => s.length > 20)
        for (const s of sentences) {
          if (insights.length >= desiredInsights) break
          if (!insights.some(i => i.includes(s.slice(0, 20)))) insights.push(s)
        }
      }
      // Remove any insights that duplicate the mainTakeaway
      const mainTakeawayLower = (summaryData.mainTakeaway || '').toLowerCase().trim()
      const uniqueInsights = insights.filter(insight => {
        const insightLower = insight.toLowerCase().trim()
        // Remove if it's too similar to mainTakeaway
        return !insightLower.includes(mainTakeawayLower.slice(0, 30)) && 
               !mainTakeawayLower.includes(insightLower.slice(0, 30))
      })
      
      summaryData.keyInsights = uniqueInsights.slice(0, desiredInsights)

      // Normalize action items - ensure they're always strings
      let actions: string[] = Array.isArray(summaryData.actionItems) 
        ? summaryData.actionItems.map(a => {
            if (typeof a === 'string') return a;
            if (a?.text) return String(a.text);
            if (a?.content) return String(a.content);
            return String(a);
          }).filter(Boolean)
        : []
      const desiredActions = depthCfg.actions
      while (actions.length < desiredActions) {
        const fallback = actions.length === 0
          ? `Apply the main idea: ${summaryData.mainTakeaway || 'practice the core concept'}`
          : `Review and practice a concrete example from the transcript`
        actions.push(fallback)
      }
      summaryData.actionItems = actions.slice(0, desiredActions)
    } catch {}

    // CODE SNIPPETS: REMOVED - Too niche, adds complexity without universal value
    delete summaryData.codeSnippets
    
    // QUIZ: Always generate if enabled; fallback must be transcript-derived
    if (settings.includeQuiz) {
      if (!summaryData.quiz || !Array.isArray(summaryData.quiz) || summaryData.quiz.length === 0) {
        console.log('📝 Generating transcript-derived quiz questions...')
        const desired = currentDepth === 'deep' ? 3 : 2
        const quiz = await generateQuizFromTranscript(openai, contentToSummarize, desired)
        if (quiz.length > 0) {
          summaryData.quiz = quiz
        } else {
          // As a last resort, still ensure transcript-related questions
          const fallbackQuiz = await generateQuizFromTranscript(openai, (contentToSummarize || '').slice(0, 4000), desired)
          summaryData.quiz = fallbackQuiz.length ? fallbackQuiz : []
        }
      }
    } else {
      delete summaryData.quiz
    }

    // EMOJI TOGGLE: Make dramatically visible difference
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    
    if (settings.includeEmojis) {
      // FORCE emojis to be visible when enabled
      if (!emojiRegex.test(summaryData.mainTakeaway || '')) {
        summaryData.mainTakeaway = '🎯 ' + (summaryData.mainTakeaway || '');
      }
      
      // Add emojis to insights if not present
      if (summaryData.keyInsights) {
        summaryData.keyInsights = summaryData.keyInsights.map((insight, i) => {
          // Convert to string first if it's an object
          let insightText = typeof insight === 'string' ? insight :
                           (insight?.text || insight?.content || String(insight));
          
          if (!emojiRegex.test(insightText)) {
            const emojis = ['💡', '🔥', '✨', '⚡', '🚀', '💎', '🎉'];
            return emojis[i % emojis.length] + ' ' + insightText;
          }
          return insightText;
        });
      }
      
      // Add emojis to action items if not present  
      if (summaryData.actionItems) {
        summaryData.actionItems = summaryData.actionItems.map((item, i) => {
          // Convert to string first if it's an object
          let itemText = typeof item === 'string' ? item :
                        (item?.text || item?.content || String(item));
          
          if (!emojiRegex.test(itemText)) {
            const emojis = ['🎯', '🔧', '📝', '⭐', '🎪', '🎨'];
            return emojis[i % emojis.length] + ' ' + itemText;
          }
          return itemText;
        });
      }
      
      console.log('✨ Emojis FORCED ON - users will see clear visual difference');
    } else {
      // Strip ALL emojis when disabled
      summaryData.mainTakeaway = summaryData.mainTakeaway?.replace(emojiRegex, '').trim() || '';
      summaryData.summary = summaryData.summary?.replace(emojiRegex, '').trim() || '';
      
      if (summaryData.keyInsights) {
        summaryData.keyInsights = summaryData.keyInsights.map(insight => {
          // Handle both string and object insights
          if (typeof insight === 'string') {
            return insight.replace(emojiRegex, '').trim();
          } else if (insight && typeof insight === 'object' && insight.text) {
            return insight.text.replace(emojiRegex, '').trim();
          } else if (insight && typeof insight === 'object' && insight.content) {
            return insight.content.replace(emojiRegex, '').trim();
          }
          return String(insight).replace(emojiRegex, '').trim();
        });
      }
      
      if (summaryData.actionItems) {
        summaryData.actionItems = summaryData.actionItems.map(item => {
          // Handle both string and object action items
          if (typeof item === 'string') {
            return item.replace(emojiRegex, '').trim();
          } else if (item && typeof item === 'object' && item.text) {
            return item.text.replace(emojiRegex, '').trim();
          } else if (item && typeof item === 'object' && item.content) {
            return item.content.replace(emojiRegex, '').trim();
          }
          return String(item).replace(emojiRegex, '').trim();
        });
      }
      
      if (summaryData.keyPoints) {
        summaryData.keyPoints = summaryData.keyPoints.map(point => {
          // Handle both string and object key points
          if (typeof point === 'string') {
            return point.replace(emojiRegex, '').trim();
          } else if (point && typeof point === 'object' && point.text) {
            return point.text.replace(emojiRegex, '').trim();
          } else if (point && typeof point === 'object' && point.content) {
            return point.content.replace(emojiRegex, '').trim();
          }
          return String(point).replace(emojiRegex, '').trim();
        });
      }
      
      console.log('🚫 Emojis STRIPPED - clean minimalist text only');
    }

    // STEP 4: FINAL VALIDATION & LOGGING
    const finalValidation = {
      hasTimestamps: !!summaryData.timestampedSections,
      hasQuiz: !!summaryData.quiz,
      hasEmojis: /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu.test(JSON.stringify(summaryData)),
      settingsRequested: {
        timestamps: settings.includeTimestamps,
        quiz: settings.includeQuiz,
        emojis: settings.includeEmojis
      }
    }
    
    console.log('🎯 FINAL VALIDATION RESULTS:')
    console.log(`- Timestamps: ${finalValidation.hasTimestamps ? '✅' : '❌'} (requested: ${finalValidation.settingsRequested.timestamps})`)
    // Code feature removed
    console.log(`- Quiz: ${finalValidation.hasQuiz ? '✅' : '❌'} (requested: ${finalValidation.settingsRequested.quiz})`)
    console.log(`- Emojis: ${finalValidation.hasEmojis ? '✅' : '❌'} (requested: ${finalValidation.settingsRequested.emojis})`)

    // COMPREHENSIVE FINAL SANITIZATION - Guarantee no objects in response
    const sanitizeToString = (item: any): string => {
      if (typeof item === 'string') return item;
      if (item === null || item === undefined) return '';
      if (typeof item === 'object') {
        // Try common property names
        if (item.text && typeof item.text === 'string') return item.text;
        if (item.content && typeof item.content === 'string') return item.content;
        if (item.value && typeof item.value === 'string') return item.value;
        if (item.description && typeof item.description === 'string') return item.description;
        if (item.title && typeof item.title === 'string') return item.title;
        // Last resort - try to extract any string value
        const values = Object.values(item);
        for (const val of values) {
          if (typeof val === 'string' && val.length > 10) return val;
        }
        // Absolute fallback - should never reach here
        console.error('⚠️ Object could not be converted to string:', item);
        return 'Content processing error - please regenerate';
      }
      return String(item);
    };
    
    // Apply comprehensive sanitization to ALL array fields
    if (summaryData.keyInsights && Array.isArray(summaryData.keyInsights)) {
      summaryData.keyInsights = summaryData.keyInsights
        .map(sanitizeToString)
        .filter(s => s && s.length > 0);
    }
    
    if (summaryData.actionItems && Array.isArray(summaryData.actionItems)) {
      summaryData.actionItems = summaryData.actionItems
        .map(sanitizeToString)
        .filter(s => s && s.length > 0);
    }
    
    if (summaryData.keyPoints && Array.isArray(summaryData.keyPoints)) {
      summaryData.keyPoints = summaryData.keyPoints
        .map(sanitizeToString)
        .filter(s => s && s.length > 0);
    }
    
    // Ensure mainTakeaway and summary are strings
    summaryData.mainTakeaway = sanitizeToString(summaryData.mainTakeaway);
    summaryData.summary = sanitizeToString(summaryData.summary);
    
    // Generate dynamic video insight title based on content
    const generateVideoInsightTitle = (takeaway: string, videoTitle: string, mode: string): string => {
      if (!takeaway) return 'Key Insight';
      
      const takeawayLower = takeaway.toLowerCase();
      
      // Technology/Programming patterns
      if (takeawayLower.includes('app') || takeawayLower.includes('code') || takeawayLower.includes('build')) {
        if (takeawayLower.includes('without code') || takeawayLower.includes('no code') || takeawayLower.includes('no-code')) {
          return 'No-Code Revolution';
        }
        if (takeawayLower.includes('ai') || takeawayLower.includes('artificial') || takeawayLower.includes('gpt')) {
          return 'AI-Powered Development';
        }
        if (takeawayLower.includes('react') || takeawayLower.includes('javascript') || takeawayLower.includes('python')) {
          return 'Code Mastery';
        }
        return 'Build Smarter';
      }
      
      // Learning/Education patterns
      if (takeawayLower.includes('learn') || takeawayLower.includes('master') || takeawayLower.includes('skill')) {
        if (takeawayLower.includes('fast') || takeawayLower.includes('quick') || takeawayLower.includes('hour')) {
          return 'Accelerated Learning';
        }
        if (takeawayLower.includes('fundamental') || takeawayLower.includes('basic')) {
          return 'Master the Fundamentals';
        }
        return 'Learning Strategy';
      }
      
      // Business/Money patterns
      if (takeawayLower.includes('money') || takeawayLower.includes('business') || takeawayLower.includes('startup')) {
        if (takeawayLower.includes('million') || takeawayLower.includes('scale') || takeawayLower.includes('growth')) {
          return 'Scale to Success';
        }
        if (takeawayLower.includes('passive') || takeawayLower.includes('income')) {
          return 'Income Strategy';
        }
        return 'Business Blueprint';
      }
      
      // Productivity/Efficiency patterns
      if (takeawayLower.includes('productiv') || takeawayLower.includes('efficient') || takeawayLower.includes('time')) {
        if (takeawayLower.includes('10x') || takeawayLower.includes('double')) {
          return '10x Productivity';
        }
        return 'Peak Performance';
      }
      
      // Science/Research patterns
      if (takeawayLower.includes('research') || takeawayLower.includes('study') || takeawayLower.includes('science')) {
        if (takeawayLower.includes('breakthrough') || takeawayLower.includes('discover')) {
          return 'Scientific Breakthrough';
        }
        return 'Research Insights';
      }
      
      // Health/Fitness patterns
      if (takeawayLower.includes('health') || takeawayLower.includes('fitness') || takeawayLower.includes('workout')) {
        return 'Health Optimization';
      }
      
      // Marketing/Sales patterns
      if (takeawayLower.includes('marketing') || takeawayLower.includes('sales') || takeawayLower.includes('customer')) {
        return 'Marketing Mastery';
      }
      
      // Design/Creative patterns
      if (takeawayLower.includes('design') || takeawayLower.includes('creative') || takeawayLower.includes('ux')) {
        return 'Design Principles';
      }
      
      // Strategy/Framework patterns
      if (takeawayLower.includes('strategy') || takeawayLower.includes('method') || takeawayLower.includes('framework')) {
        return 'Strategic Framework';
      }
      
      // Innovation patterns
      if (takeawayLower.includes('innovation') || takeawayLower.includes('disrupt') || takeawayLower.includes('transform')) {
        return 'Disruptive Innovation';
      }
      
      // Mode-specific titles
      if (mode === 'build') {
        return 'Implementation Path';
      } else if (mode === 'deep') {
        return 'Strategic Insight';
      } else if (mode === 'student') {
        return 'Learning Objective';
      }
      
      // Default: Try to extract a meaningful phrase
      const actionPhrases = ['how to', 'why you should', 'the secret to', 'the key to', 'what makes'];
      for (const phrase of actionPhrases) {
        if (takeawayLower.startsWith(phrase)) {
          const words = takeaway.split(' ').slice(0, 4);
          return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        }
      }
      
      return 'Core Discovery';
    };
    
    // Use AI-generated title if available, otherwise generate from mainTakeaway
    if (!summaryData.videoInsightTitle) {
      summaryData.videoInsightTitle = generateVideoInsightTitle(
        summaryData.mainTakeaway, 
        metadata.title || '', 
        learningMode || 'student'
      );
    }
    
    console.log('✅ Final sanitization complete - all fields guaranteed to be strings');
    
    // Add partial summary indicator if transcript was capped
    const responseData: any = {
      success: true,
      data: {
        videoTitle: metadata.title,
        title: metadata.title,
        channel: metadata.channel || '',
        videoId,
        duration: metadata.duration,
        ...summaryData,
        // Include transcript if requested
        ...(settings.includeTranscript ? { transcript: contentToSummarize } : {}),
        _debug: {
          ...finalValidation,
          sources: {
            transcriptSource: contentSource, // 'extension-transcript' or 'transcript'
            timestampsSource
          }
        } // Include debug info
      }
    };
    
    // Add partial summary info if transcript was capped
    if (wasTranscriptCapped) {
      responseData.data.partialSummary = true;
      responseData.data.coverageInfo = userTier === 'free' 
        ? 'Summary based on the first portion of the video' 
        : 'Summary covers the main content';
      responseData.data.transcriptCapped = {
        original: originalLength,
        capped: contentToSummarize.length,
        tier: userTier
      };
    }
    
    // Track successful summary for usage limits
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/usage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': userEmail,
        },
        body: JSON.stringify({
          action: 'summarize',
          videoLength: rawBody.videoDuration || 0,
        }),
      })
    } catch (error) {
      console.log('Usage tracking error (non-blocking):', error)
    }
    
    return NextResponse.json(responseData, {
      headers: corsHeaders
    });

  } catch (error) {
    console.error('Summarization error:', error)
    const message = error instanceof Error ? error.message : 'Failed to process video'
    const isAuth = /Incorrect API key|401/i.test(message)
    return NextResponse.json({ 
      success: false, 
      error: message 
    }, { 
      status: isAuth ? 401 : 500,
      headers: corsHeaders
    })
  }
}
