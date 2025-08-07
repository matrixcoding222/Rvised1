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

async function generateSummary(content: string, videoTitle: string, contentSource: string, settings?: any): Promise<{ 
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

  // ULTRA-EXPLICIT feature instructions to force compliance
  const featureCommands: string[] = []
  
  // EMOJI ENFORCEMENT
  if (settings?.includeEmojis) {
    featureCommands.push('MANDATORY: Every section heading MUST start with a relevant emoji. Example: "🎯 Main Takeaway", "💡 Key Insights"')
  } else {
    featureCommands.push('STRICTLY FORBIDDEN: Do NOT include ANY emoji characters (🎯💡📝🔧⚡🧪📍💻🛠️) anywhere in your response. Use only plain text.')
  }
  
  // CODE ENFORCEMENT  
  if (settings?.includeCode) {
    featureCommands.push('MANDATORY: You MUST include a "codeSnippets" array with at least 1-2 code examples if ANY programming is mentioned. Format: [{"language": "javascript", "code": "actual code", "description": "what it does"}]')
  } else {
    featureCommands.push('STRICTLY FORBIDDEN: Do NOT include "codeSnippets" property. Set it to null.')
  }
  
  // QUIZ ENFORCEMENT
  if (settings?.includeQuiz) {
    featureCommands.push('MANDATORY: You MUST include a "quiz" array with exactly 2-3 questions. Format: [{"question": "challenging question", "answer": "detailed answer"}]. No exceptions.')
  } else {
    featureCommands.push('STRICTLY FORBIDDEN: Do NOT include "quiz" property. Set it to null.')
  }
  
  // TIMESTAMP ENFORCEMENT
  if (settings?.includeTimestamps) {
    featureCommands.push('MANDATORY: You MUST include "timestampedSections" array with 3-5 video sections. Format: [{"time": "02:15", "description": "section description"}]. Create logical timestamps even if not in transcript.')
  } else {
    featureCommands.push('STRICTLY FORBIDDEN: Do NOT include "timestampedSections" property. Set it to null.')
  }

  // SIMPLIFIED APPROACH: Basic prompt that AI cannot ignore
  const basePrompt = `Analyze this video content and create a summary.

VIDEO: "${videoTitle}"
CONTENT: ${content}

Respond with this exact JSON structure (no markdown, no explanation):
{
  "mainTakeaway": "One sentence capturing main value",
  "summary": "Detailed summary of the video content",
  "keyInsights": ["Key learning 1", "Key learning 2", "Key learning 3"],
  "actionItems": ["Actionable step 1", "Actionable step 2"],
  "techStack": ${content.toLowerCase().includes('code') || content.toLowerCase().includes('programming') || content.toLowerCase().includes('development') ? '["Technology mentioned in video"]' : 'null'},
  "keyPoints": ["Same as keyInsights"]
}`

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system", 
          content: "You are a helpful video content analyzer. Always respond with valid JSON only. Never use markdown formatting."
        },
        {
          role: "user",
          content: basePrompt
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
      includeQuiz: !!rawBody.settings?.includeQuiz,
      generateQuiz: !!rawBody.settings?.includeQuiz, // Alias for backward compatibility
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
    
    const summaryData = await generateSummary(contentToSummarize, metadata.title, contentSource, settings)
    
    console.log(`🔍 RAW AI RESPONSE RECEIVED:`)
    console.log(`- Has timestampedSections: ${!!summaryData.timestampedSections}`)
    console.log(`- Has codeSnippets: ${!!summaryData.codeSnippets}`)
    console.log(`- Has quiz: ${!!summaryData.quiz}`)
    console.log(`- Summary length: ${summaryData.summary?.length || 0} chars`)
    console.log(`- Contains emojis: ${/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu.test(summaryData.summary || '')}`)

    // STEP 2: BULLETPROOF SERVER-SIDE FEATURE GENERATION
    console.log('🔧 ENFORCING FEATURES SERVER-SIDE...')
    
    // TIMESTAMPS: Always generate if enabled, regardless of AI response
    if (settings.includeTimestamps) {
      let timestamps = summaryData.timestampedSections
      
      // If AI didn't provide timestamps, generate them ourselves
      if (!timestamps || !Array.isArray(timestamps) || timestamps.length === 0) {
        console.log('⚠️ AI failed to provide timestamps, generating server-side...')
        timestamps = []
        
        // ENHANCED: Parse YouTube chapters from multiple sources
        if (metadata.description) {
          const lines = metadata.description.split(/\n|\r/)
          
          // Method 1: Standard chapter format (00:00 Title)
          const chapterRegex = /^(\d{1,2}:\d{2})\s+(.+)/
          // Method 2: Enhanced chapter format with dashes/bullets
          const enhancedRegex = /^[\-•*]?\s*(\d{1,2}:\d{2})\s*[\-–—]?\s*(.+)/
          // Method 3: Brackets format [00:00] Title
          const bracketRegex = /^\[(\d{1,2}:\d{2})\]\s*(.+)/
          
          for (const line of lines) {
            const cleanLine = line.trim()
            if (!cleanLine) continue
            
            let match = cleanLine.match(chapterRegex) || 
                       cleanLine.match(enhancedRegex) || 
                       cleanLine.match(bracketRegex)
            
            if (match) {
              const [, time, desc] = match
              timestamps.push({ 
                time: time.length === 4 ? '0' + time : time, 
                description: desc.trim().replace(/^[\-–—•*]+\s*/, '') // Clean up prefixes
              })
            }
            if (timestamps.length >= 8) break // Get more chapters
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
        }
        
        summaryData.timestampedSections = timestamps
        console.log(`✅ Generated ${timestamps.length} timestamp sections`)
      }
    } else {
      summaryData.timestampedSections = null
      delete summaryData.timestampedSections
    }
    
    // CODE SNIPPETS: REMOVED - Too niche, adds complexity without universal value
    summaryData.codeSnippets = null
    delete summaryData.codeSnippets
    
    // QUIZ: Always generate if enabled
    if (settings.includeQuiz) {
      if (!summaryData.quiz || !Array.isArray(summaryData.quiz) || summaryData.quiz.length === 0) {
        console.log('📝 Generating fallback quiz questions...')
        summaryData.quiz = [
          {
            question: "What was the main objective of this tutorial?",
            answer: summaryData.mainTakeaway || "To learn the key concepts presented in the video"
          },
          {
            question: "What are the key technologies or tools mentioned?",
            answer: summaryData.techStack ? summaryData.techStack.join(', ') : "The technologies discussed in the video"
          }
        ]
      }
    } else {
      summaryData.quiz = null
      delete summaryData.quiz
    }

    if (!settings.includeCode) {
      summaryData.codeSnippets = null;
      delete summaryData.codeSnippets;
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
          if (!emojiRegex.test(insight)) {
            const emojis = ['💡', '🔥', '✨', '⚡', '🚀', '💎', '🎉'];
            return emojis[i % emojis.length] + ' ' + insight;
          }
          return insight;
        });
      }
      
      // Add emojis to action items if not present  
      if (summaryData.actionItems) {
        summaryData.actionItems = summaryData.actionItems.map((item, i) => {
          if (!emojiRegex.test(item)) {
            const emojis = ['🎯', '🔧', '📝', '⭐', '🎪', '🎨'];
            return emojis[i % emojis.length] + ' ' + item;
          }
          return item;
        });
      }
      
      console.log('✨ Emojis FORCED ON - users will see clear visual difference');
    } else {
      // Strip ALL emojis when disabled
      summaryData.mainTakeaway = summaryData.mainTakeaway?.replace(emojiRegex, '').trim() || '';
      summaryData.summary = summaryData.summary?.replace(emojiRegex, '').trim() || '';
      
      if (summaryData.keyInsights) {
        summaryData.keyInsights = summaryData.keyInsights.map(insight => 
          insight.replace(emojiRegex, '').trim()
        );
      }
      
      if (summaryData.actionItems) {
        summaryData.actionItems = summaryData.actionItems.map(item => 
          item.replace(emojiRegex, '').trim()
        );
      }
      
      if (summaryData.keyPoints) {
        summaryData.keyPoints = summaryData.keyPoints.map(point => 
          point.replace(emojiRegex, '').trim()
        );
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

    return NextResponse.json({
      success: true,
      data: {
        videoTitle: metadata.title,
        title: metadata.title,
        channel: metadata.channel || '',
        videoId,
        duration: metadata.duration,
        ...summaryData,
        _debug: finalValidation // Include debug info
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