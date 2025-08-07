import { NextRequest, NextResponse } from 'next/server'
import { YoutubeTranscript } from 'youtube-transcript'

import { Innertube } from 'youtubei.js'

// CORS headers for Chrome extension
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400'
}

// Fallback 0 – Innertube API (temporarily disabled due to API changes)
async function fetchTranscriptInnertube(videoId: string): Promise<string[]> {
  try {
    // TODO: Fix Innertube API integration after library update
    console.log('Innertube method temporarily disabled for deployment');
    return [];
  } catch (e) {
    console.log('Innertube transcript error:', e instanceof Error ? e.message : 'Unknown error');
    return [];
  }
}

// Direct transcript fetch fallback (parses captionTracks JSON directly from the watch page)
async function fetchTranscriptDirect(videoId: string): Promise<string[]> {
  // Returns [] if nothing found; does not throw

  try {
    const watchUrl = `https://www.youtube.com/watch?v=${videoId}&hl=en`
    const html = await fetch(watchUrl).then(res => res.text())
    // Find the captionTracks JSON blob
    const match = html.match(/"captionTracks":\s*(\[[\s\S]*?\])/)
    if (!match) {
      console.log('❌ No captionTracks found in HTML')
      return []
    }
    const captionTracksRaw = match[1]
    const captionTracks = JSON.parse(captionTracksRaw)
    // Prefer English captions
    const englishTrack = captionTracks.find((track: any) => track.languageCode && track.languageCode.startsWith('en')) || captionTracks[0]
    if (!englishTrack || !englishTrack.baseUrl) {
      console.log('❌ No suitable caption track found')
      return []
    }
    let trackUrl: string = englishTrack.baseUrl
    // Unescape \u0026 sequences
    trackUrl = trackUrl.replace(/\\u0026/g, '&')
    // Request WebVTT so we can parse easily
    if (!trackUrl.includes('fmt=')) {
      trackUrl += '&fmt=vtt'
    }
    const vtt = await fetch(trackUrl).then(res=>res.text())
    // Parse VTT - remove header and timestamps, keep text lines
    let lines = vtt
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('WEBVTT') && !/^\d+$/.test(line) && !/^\d{2}:\d{2}:\d{2}\.\d{3}/.test(line))

    // If VTT is empty (common for auto-generated), fall back to timed-text JSON
    if (lines.length === 0) {
      console.log('⚠️ VTT empty, trying timed-text JSON fallback…')
      try {
        const json3 = await fetch(`https://video.google.com/timedtext?v=${videoId}&lang=en&fmt=json3`).then(r => r.ok ? r.json() : null)
        if (json3?.events?.length) {
          lines = json3.events
            .filter((e:any)=>e.segs)
            .flatMap((e:any)=> e.segs.map((s:any)=> s.utf8.trim()))
            .filter((t:string)=> t.length)
        }
      } catch (jsonErr) {
        console.log('Timed-text JSON error:', jsonErr instanceof Error ? jsonErr.message : 'Unknown error')
      }
    }
    return lines
  } catch (err) {
    console.log('❌ Direct transcript fetch error:', err instanceof Error ? err.message : 'Unknown error')
    return []
  }
}

// Timed-text JSON fallback (auto captions)
async function fetchTranscriptTimedText(videoId: string): Promise<string[]> {
  try {
    const json3 = await fetch(`https://video.google.com/timedtext?v=${videoId}&lang=en&fmt=json3`).then(r => r.ok ? r.json() : null)
    if (json3?.events?.length) {
      const lines = json3.events
        .filter((e:any)=>e.segs)
        .flatMap((e:any)=> e.segs.map((s:any)=> s.utf8.trim()))
        .filter((t:string)=> t.length)
      return lines
    }
    return []
  } catch(err) {
    console.log('Timed-text JSON error:', err instanceof Error ? err.message : 'Unknown')
    return []
  }
}

// Simple transcript extraction - primary library then direct fallback
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Enhanced video type detection
const VIDEO_TYPES = [
  { 
    type: "tutorial", 
    keywords: ["tutorial", "how to", "step by step", "guide", "learn", "course", "build", "create", "make", "coding", "programming", "walkthrough", "follow along"]
  },
  { 
    type: "lecture", 
    keywords: ["lecture", "professor", "class", "university", "academic", "education", "explain", "theory", "concept", "fundamentals", "basics", "introduction to"]
  },
  { 
    type: "podcast", 
    keywords: ["podcast", "interview", "conversation", "discussion", "talk", "chat", "episode", "show", "guest", "host"]
  }
]

function detectVideoType(title: string, description: string = "", duration?: string): "tutorial" | "lecture" | "podcast" | "other" {
  const haystack = `${title} ${description}`.toLowerCase()
  
  // Check duration hints (longer videos more likely to be lectures/podcasts)
  const isLongForm = duration && (duration.includes('H') || parseInt(duration.replace(/\D/g, '')) > 30)
  
  // Score each type
  const scores = VIDEO_TYPES.map(entry => ({
    type: entry.type,
    score: entry.keywords.reduce((acc, keyword) => {
      const matches = (haystack.match(new RegExp(keyword, 'g')) || []).length
      return acc + matches
    }, 0)
  }))
  
  // Boost podcast/lecture scores for long-form content
  if (isLongForm) {
    scores.find(s => s.type === 'podcast')!.score *= 1.5
    scores.find(s => s.type === 'lecture')!.score *= 1.3
  }
  
  // Return highest scoring type, or "other" if no matches
  const bestMatch = scores.reduce((max, current) => current.score > max.score ? current : max)
  return bestMatch.score > 0 ? bestMatch.type as any : "other"
}

interface SummarizeResponse {
  success: boolean
  data?: {
    videoTitle: string
    videoId: string
    duration: string
    videoType: "tutorial" | "lecture" | "podcast" | "other"
    mainTakeaway: string
    summary: string
    techStack?: string[]
    keyInsights: string[]
    actionItems: string[]
    timestampedSections?: { time: string; description: string }[]
    codeSnippets?: { language: string; code: string; description: string }[]
    quiz?: { question: string; answer: string }[]
    resources?: { title: string; url?: string; type: string }[]
    // Legacy fields for backward compatibility
    keyPoints: string[]
  }
  error?: string
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
    // Use YouTube Data API to get video metadata
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&key=${process.env.YOUTUBE_API_KEY}`
    console.log('Fetching video metadata for:', videoId)
    
    const response = await fetch(apiUrl)
    const data = await response.json()
    
    console.log('YouTube API response:', data)
    
    if (data.error) {
      console.error('YouTube API error:', data.error)
      return null
    }
    
    if (data.items && data.items.length > 0) {
      const video = data.items[0]
      return {
        title: video.snippet.title,
        channel: video.snippet.channelTitle,
        duration: video.contentDetails.duration,
        description: video.snippet.description
      }
    }
    
    console.log('No video found with ID:', videoId)
    return null
  } catch (error) {
    console.error('Error fetching video metadata:', error)
    return null
  }
}

async function generateSummary(content: string, videoTitle: string, contentSource: string, videoType: string, settings?: any): Promise<{ 
  mainTakeaway: string
  summary: string
  techStack?: string[]
  keyInsights: string[]
  actionItems: string[]
  timestampedSections?: { time: string; description: string }[]
  codeSnippets?: { language: string; code: string; description: string }[]
  quiz?: { question: string; answer: string }[]
  resources?: { title: string; url?: string; type: string }[]
  keyPoints: string[] // Legacy compatibility
}> {
  const sourceDescription = {
    'transcript': 'video transcript',
    'description': 'video description', 
    'metadata': 'video title and metadata'
  }[contentSource] || 'available content'

  const videoTypePrompts = {
    'tutorial': 'Focus on step-by-step instructions, code examples, and actionable learning outcomes. Extract specific tech stack, implementation details, and practical examples from the content.',
    'lecture': 'Emphasize theoretical concepts, academic insights, and foundational knowledge. Structure for educational comprehension with detailed explanations.',
    'podcast': 'Highlight key discussion points, guest insights, and conversational takeaways. Focus on perspectives, opinions, and detailed conversations shared.',
    'other': 'Provide a comprehensive summary capturing the main value and detailed learnings from the content.'
  }

  const contentQualityNote = contentSource === 'transcript' 
    ? 'You have access to the full video transcript. Use this rich content to create detailed, comprehensive summaries with specific examples and quotes.' 
    : 'Limited to video description only. Extract maximum value from available content.'

  // Strong learning mode personalities for system prompt
  const learningModePersonalities = {
    'student': 'You are a patient educator who explains complex topics in simple terms. Use clear language, break down concepts step-by-step, and ensure educational clarity.',
    'build': 'You are a hands-on coding mentor focused on practical implementation. Emphasize actionable steps, concrete examples, and what can be built immediately.',
    'understand': 'You are a theoretical expert who dives deep into concepts. Focus on the "why" behind ideas, provide comprehensive analysis, and explore underlying principles.'
  }

  // Explicit word count limits for depth
  const depthInstructions = {
    quick: 'SUMMARY MUST BE 150-200 WORDS. Provide only the most essential insights (3 max) and immediate actions (2 max).',
    standard: 'SUMMARY MUST BE 300-450 WORDS. Include comprehensive insights (5-7) and practical actions (3-5).',
    deep: 'SUMMARY MUST BE 600-800 WORDS. Provide extensive analysis with detailed insights (7+) and thorough actionable steps (5+).'
  }

  // Explicit feature instructions
  const featureInstructions: string[] = []
  
  if (settings?.includeEmojis) {
    featureInstructions.push('REQUIRED: Use relevant emojis in ALL section headings and key points for visual appeal.')
  } else {
    featureInstructions.push('FORBIDDEN: Do NOT use any emojis anywhere in the response.')
  }
  
  if (settings?.includeCode && contentSource === 'transcript') {
    featureInstructions.push('REQUIRED: Include "codeSnippets" section with actual code examples from the video (if any code is discussed).')
  } else {
    featureInstructions.push('FORBIDDEN: Set "codeSnippets": null - do not include this section.')
  }
  
  if (settings?.generateQuiz) {
    featureInstructions.push('REQUIRED: Include "quiz" section with 2-3 challenging questions that test deep understanding.')
  } else {
    featureInstructions.push('FORBIDDEN: Set "quiz": null - do not include quiz questions.')
  }
  
  if (settings?.includeTimestamps && contentSource === 'transcript') {
    featureInstructions.push('REQUIRED: Include "timestampedSections" with [mm:ss] timestamps for major video sections.')
  } else {
    featureInstructions.push('FORBIDDEN: Set "timestampedSections": null - do not include timestamps.')
  }

  const prompt = `
Video: "${videoTitle}"
Type: ${videoType} | Source: ${sourceDescription}
Mode: ${settings?.learningMode || 'student'} | Depth: ${settings?.summaryDepth || 'standard'}

${contentQualityNote}

CONTENT:
${content}

INSTRUCTIONS:
${videoTypePrompts[videoType as keyof typeof videoTypePrompts]}

DEPTH REQUIREMENT: ${depthInstructions[settings?.summaryDepth as keyof typeof depthInstructions] || depthInstructions.standard}

FEATURE REQUIREMENTS:
${featureInstructions.join('\n')}

Respond with PURE JSON only - no markdown, no explanations:

{
  "mainTakeaway": "Single powerful sentence capturing core value",
  "summary": "EXACT word count as specified in depth requirement above",
  "techStack": ["tech1", "tech2"] // null if not technical,
  "keyInsights": ["insight with examples", "..."], // Match depth requirements
  "actionItems": ["specific actionable step", "..."], // Match depth requirements  
  ${settings?.includeTimestamps && contentSource === 'transcript' ? '"timestampedSections": [{"time": "mm:ss", "description": "section"}],' : '"timestampedSections": null,'}
  ${settings?.includeCode ? '"codeSnippets": [{"language": "js", "code": "code", "description": "what it does"}],' : '"codeSnippets": null,'}
  ${settings?.generateQuiz ? '"quiz": [{"question": "challenging question", "answer": "detailed answer"}],' : '"quiz": null,'}
  "resources": [{"title": "name", "url": "if_mentioned", "type": "type"}], // null if none
  "keyPoints": [] // copy from keyInsights for legacy
}`

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system", 
          content: `${learningModePersonalities[settings?.learningMode as keyof typeof learningModePersonalities] || learningModePersonalities.student} Always respond with valid JSON. Never use markdown formatting.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: settings?.summaryDepth === 'deep' ? 2800 : 
                  settings?.summaryDepth === 'quick' ? 1200 : 
                  2000, // Adjusted for stricter word limits
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
        summary: content.slice(0, 500),
        keyInsights: ["Check video for detailed content", "Review transcript for specific steps"],
        actionItems: ["Watch the full video for complete information"],
        keyPoints: ["Check video for detailed content", "Review transcript for specific steps"] // Legacy compatibility
      }
    }
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw new Error('Failed to generate summary')
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
    // Normalize settings keys to lowercase to ensure prompt matches
    const settings = {
      learningMode: (rawBody.settings?.learningMode || 'student').toLowerCase(),
      summaryDepth: (rawBody.settings?.summaryDepth || 'standard').toLowerCase(),
      includeEmojis: !!rawBody.settings?.includeEmojis,
      includeCode: !!rawBody.settings?.includeCode,
      includeQuiz: !!rawBody.settings?.includeQuiz,
      includeTimestamps: !!rawBody.settings?.includeTimestamps
    }
    const videoUrl: string = rawBody.videoUrl || rawBody.url // support old key
    const extensionTranscript = rawBody.extensionTranscript
    console.log('Request received with settings:', settings)
    console.log('Extension transcript provided:', !!extensionTranscript)

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

    try {
      console.log('📝 Transcript extraction starting...')
      
      // Prioritize extension-provided transcript
      if (extensionTranscript && extensionTranscript.length > 50) {
        console.log('🔌 Using transcript from Chrome extension')
        contentToSummarize = extensionTranscript.trim()
        contentSource = 'extension-transcript'
        console.log(`📊 Extension transcript: ${contentToSummarize.length} characters`)
      } else {
        console.log('📡 Extension transcript not available, using server-side extraction...')
        
        // Use the EXACT syntax from user's example
        let transcript: any[] = []
        try {
          transcript = await YoutubeTranscript.fetchTranscript(videoId)
        } catch (libErr) {
          console.log('Library fetch failed:', libErr instanceof Error ? libErr.message : 'Unknown error')
        }

        // If library returns empty, try Innertube first, then direct scrape
        if (!transcript || transcript.length === 0) {
          console.log('📡 Library empty. Trying Innertube API...')
          const tubeLines = await fetchTranscriptInnertube(videoId)
          if (tubeLines.length) {
            transcript = tubeLines.map(text => ({ text }))
          } else {
            console.log('🌐 Innertube empty. Trying captionTracks scraping...')
            const directLines = await fetchTranscriptDirect(videoId)
            transcript = directLines.map(text => ({ text }))
            if (transcript.length === 0) {
              console.log('⚠️ Direct scrape empty, trying timed-text JSON endpoint…')
              const timedLines = await fetchTranscriptTimedText(videoId)
              transcript = timedLines.map(text => ({ text }))
            }
          }
        }
        
        console.log('✅ Raw transcript response:')
        console.log('Type:', typeof transcript)
        console.log('Is array:', Array.isArray(transcript))
        console.log('Length:', transcript?.length || 0)
        
        if (transcript && Array.isArray(transcript) && transcript.length > 0) {
          console.log('✅ First transcript item:', transcript[0])
          
          // Simple processing - just extract text
          const transcriptText = transcript
            .map(item => item.text || '')
            .filter(text => text.trim().length > 0)
            .join(' ')
            .trim()
          
          console.log(`📊 Transcript processed: ${transcriptText.length} characters`)
          console.log(`Preview: "${transcriptText.substring(0, 300)}..."`)
          
          if (transcriptText.length > 50) {
            contentToSummarize = transcriptText
            contentSource = 'transcript'
            console.log(`🎉 SUCCESS: Using transcript for AI summarization`)
          } else {
            throw new Error(`Transcript exists but too short: ${transcriptText.length} characters`)
          }
        } else {
          throw new Error('Transcript response was empty or invalid format')
        }
      }
    } catch (transcriptError) {
      console.log('❌ Transcript failed:', transcriptError instanceof Error ? transcriptError.message : 'Unknown error')
      
      // Fallback: use title + description when transcript unavailable
      console.log('📄 Falling back to title + description for summarization')
      contentToSummarize = `${metadata.title}\n\n${metadata.description || ''}`.trim()
      contentSource = 'title-description'
    }

    // Detect video type first
    const detectedVideoType = detectVideoType(metadata.title, metadata.description, metadata.duration)
    
    // Generate summary with OpenAI
    console.log(`Generating summary from ${contentSource} with settings:`, settings)
    const summaryData = await generateSummary(contentToSummarize, metadata.title, contentSource, detectedVideoType, settings)

    // Apply feature toggles
    if (!settings.includeTimestamps) delete summaryData.timestampedSections;
    if (!settings.includeQuiz) delete summaryData.quiz;
    if (!settings.includeCode) delete summaryData.codeSnippets;

    return NextResponse.json({
      success: true,
      data: {
        videoTitle: metadata.title,
        title: metadata.title,
        channel: metadata.channel || '',
        videoId,
        duration: metadata.duration,
        videoType: detectedVideoType,
        ...summaryData
      }
    }, {
      headers: corsHeaders
    });

  } catch (error) {
    console.error('Summarization error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to process video' 
    }, { 
      status: 500,
      headers: corsHeaders
    })
  }
}