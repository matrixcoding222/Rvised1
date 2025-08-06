import { NextRequest, NextResponse } from 'next/server'
import { YoutubeTranscript } from 'youtube-transcript'

import { Innertube } from 'youtubei.js'

// Fallback 0 – Innertube API (robust, no scraping)
async function fetchTranscriptInnertube(videoId: string): Promise<string[]> {
  try {
    const youtube = await Innertube.create();
    const info = await youtube.getInfo(videoId);
    const transcript = await info.getTranscript('en'); // prefer English
    if (!transcript?.content?.body?.initial_segments?.length) return [];
    return transcript.content.body.initial_segments
      .filter((seg:any)=> seg.text)
      .map((seg:any)=> seg.text);
  } catch (e) {
    console.log('Innertube transcript error:', e instanceof Error ? e.message : 'Unknown error');
    return [];
  }
}

// Direct transcript fetch fallback (parses captionTracks JSON directly from the watch page)
async function fetchTranscriptDirect(videoId: string): Promise<string[]> {
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

  // Settings-based customization
  const learningModeInstructions = {
    'student': 'Focus on clear explanations, step-by-step learning, and educational value. Make concepts easy to understand.',
    'build': 'Emphasize practical implementation, actionable steps, and hands-on guidance. Focus on what can be built or done.',
    'understand': 'Provide deep theoretical insights, conceptual understanding, and comprehensive analysis. Focus on the "why" behind concepts.'
  }

  const depthInstructions = {
    'quick': 'Create a concise summary focused on key highlights (2-3 min read).',
    'standard': 'Provide a balanced, comprehensive summary (5-7 min read).',
    'deep': 'Generate an in-depth, detailed analysis with extensive insights (10+ min read).'
  }

  const featureInstructions = [
    settings?.includeEmojis ? 'Use relevant emojis and visual indicators throughout the summary.' : 'Use minimal emojis, focus on professional text.',
    settings?.includeCode ? 'Extract and include any code examples or technical snippets mentioned.' : 'Summarize code concepts without including actual code.',
    settings?.generateQuiz ? 'Include 2-3 quiz questions to test understanding.' : 'Do not include quiz questions.',
    settings?.includeTimestamps && contentSource === 'transcript' ? 'Include timestamped sections for major topics.' : 'Do not include timestamp information.'
  ].filter(Boolean).join(' ')

  const prompt = `
You are an expert at creating comprehensive, actionable summaries of YouTube videos optimized for busy developers and students.

Video Details:
- Title: "${videoTitle}"
- Type: ${videoType}
- Content Source: ${sourceDescription}
- Learning Mode: ${settings?.learningMode || 'student'}
- Summary Depth: ${settings?.summaryDepth || 'standard'}

${contentQualityNote}

Content:
${content}

INSTRUCTIONS:
${videoTypePrompts[videoType as keyof typeof videoTypePrompts]}

LEARNING MODE: ${learningModeInstructions[settings?.learningMode as keyof typeof learningModeInstructions] || learningModeInstructions.student}

DEPTH: ${depthInstructions[settings?.summaryDepth as keyof typeof depthInstructions] || depthInstructions.standard}

FEATURES: ${featureInstructions}

IMPORTANT: ${contentSource === 'transcript' ? 'Use the full transcript to create detailed, specific summaries with exact quotes, timestamps, and comprehensive insights.' : 'Based on limited description - extract maximum value possible.'}

Create a comprehensive learning resource with the following structure. Respond with PURE JSON only:

{
  "mainTakeaway": "Single sentence capturing the core value/lesson",
  "summary": "${contentSource === 'transcript' ? 'Detailed 300-500 word summary with specific examples from the transcript' : 'Comprehensive 200-300 word summary based on available content'}",
  "techStack": ["Technology1", "Technology2"] // Only if technical content, otherwise null,
  "keyInsights": ["${contentSource === 'transcript' ? 'Detailed insight with specific examples/quotes' : 'Key insight from available content'}", "..."] // 5-7 detailed learnings,
  "actionItems": ["${contentSource === 'transcript' ? 'Specific actionable step mentioned in video' : 'General actionable step'}", "..."] // 3-7 specific next steps,
  ${contentSource === 'transcript' ? '"timestampedSections": [{"time": "00:00", "description": "Section description"}], // Major sections if transcript available' : '"timestampedSections": null, // No transcript available'}
  "codeSnippets": [{"language": "javascript", "code": "example code", "description": "What this does"}] // Only if code is mentioned, otherwise null,
  "quiz": [{"question": "Test question", "answer": "Correct answer"}] // 2-3 questions, otherwise null,
  "resources": [{"title": "Resource name", "url": "if_mentioned", "type": "documentation|tool|course"}] // Mentioned resources, otherwise null,
  "keyPoints": ["Point 1", "Point 2"] // Legacy field - copy from keyInsights
}

Important:
- Return PURE JSON with no markdown formatting
- Use null for optional fields that don't apply
- Keep actionItems specific and immediately actionable
- Make quiz questions test understanding, not memorization
- Only include codeSnippets if actual code is discussed
`

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system", 
          content: "You are an expert content summarizer specializing in educational and technical content. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: settings?.summaryDepth === 'deep' ? 2500 : 
                  settings?.summaryDepth === 'quick' ? 1000 : 
                  2000, // Dynamic token allocation based on depth setting
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

export async function POST(request: NextRequest): Promise<NextResponse<SummarizeResponse>> {
  try {
    const { videoUrl, settings } = await request.json()
    console.log('Request received with settings:', settings)

    if (!videoUrl) {
      return NextResponse.json({ 
        success: false, 
        error: 'Video URL is required' 
      }, { status: 400 })
    }

    // Extract video ID
    const videoId = extractVideoId(videoUrl)
    if (!videoId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid YouTube URL' 
      }, { status: 400 })
    }

    // Get video metadata
    const metadata = await getVideoMetadata(videoId)
    if (!metadata) {
      return NextResponse.json({ 
        success: false, 
        error: 'Could not fetch video information. Video may be private or unavailable.' 
      }, { status: 404 })
    }

    // ONLY use transcripts - no description fallback as requested
    let contentToSummarize = ''
    let contentSource = ''

    try {
      console.log('📝 Simple transcript extraction (exact user example)...')
      
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
    } catch (transcriptError) {
      console.log('❌ Transcript failed:', transcriptError instanceof Error ? transcriptError.message : 'Unknown error')
      
      // NO FALLBACK TO DESCRIPTION - return error as requested
      return NextResponse.json({ 
        success: false, 
        error: `This video does not have accessible transcripts. Error: ${transcriptError instanceof Error ? transcriptError.message : 'Unknown error'}. Please try a different video with captions/subtitles enabled.` 
      }, { status: 422 })
    }

    // Detect video type first
    const detectedVideoType = detectVideoType(metadata.title, metadata.description, metadata.duration)
    
    // Generate summary with OpenAI
    console.log(`Generating summary from ${contentSource} with settings:`, settings)
    const summaryData = await generateSummary(contentToSummarize, metadata.title, contentSource, detectedVideoType, settings)

    return NextResponse.json({
      success: true,
      data: {
        videoTitle: metadata.title,
        videoId,
        duration: metadata.duration,
        videoType: detectedVideoType,
        mainTakeaway: summaryData.mainTakeaway,
        summary: summaryData.summary,
        techStack: summaryData.techStack,
        keyInsights: summaryData.keyInsights,
        actionItems: summaryData.actionItems,
        timestampedSections: summaryData.timestampedSections,
        codeSnippets: summaryData.codeSnippets,
        quiz: summaryData.quiz,
        resources: summaryData.resources,
        keyPoints: summaryData.keyPoints // Legacy compatibility
      }
    })

  } catch (error) {
    console.error('Summarization error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to process video' 
    }, { status: 500 })
  }
}