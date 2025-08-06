import { NextRequest, NextResponse } from 'next/server'
import { YoutubeTranscript } from 'youtube-transcript'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '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',
})

interface SummarizeResponse {
  success: boolean
  data?: {
    videoTitle: string
    summary: string
    keyPoints: string[]
    duration: string
    videoId: string
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
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&key=${process.env.YOUTUBE_API_KEY || 'AIzaSyAAE3KmOwacc-YZY3NQl-yWei2wGFyq8C4'}`
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

async function generateSummary(content: string, videoTitle: string, contentSource: string): Promise<{ summary: string; keyPoints: string[] }> {
  const sourceDescription = {
    'transcript': 'video transcript',
    'description': 'video description', 
    'metadata': 'video title and metadata'
  }[contentSource] || 'available content'

  const prompt = `
You are an expert at creating concise, actionable summaries of YouTube videos. 

Video Title: "${videoTitle}"
Content Source: ${sourceDescription}

Content:
${content}

Create a comprehensive summary based on the available ${sourceDescription} that:
1. Captures the main message and purpose
2. Highlights key insights and takeaways  
3. Identifies actionable steps or recommendations
4. ${contentSource === 'transcript' ? 'Notes important timestamps or sequences' : 'Provides context about what viewers can expect'}

${contentSource !== 'transcript' ? 'Note: This summary is based on ' + sourceDescription + ' since no transcript was available.' : ''}

Format your response as JSON with:
- "summary": A 150-200 word comprehensive summary
- "keyPoints": An array of 5-7 specific, actionable key points

Keep the tone professional but accessible. Focus on what busy professionals and students can actually use.
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
      max_tokens: 800,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) throw new Error('No response from OpenAI')

    try {
      return JSON.parse(content)
    } catch (parseError) {
      // Fallback if JSON parsing fails
      return {
        summary: content.slice(0, 500),
        keyPoints: ["Check video for detailed content", "Review transcript for specific steps"]
      }
    }
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw new Error('Failed to generate summary')
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<SummarizeResponse>> {
  try {
    const { videoUrl } = await request.json()

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

    // Try multiple methods to get content for summarization
    let contentToSummarize = ''
    let contentSource = ''

    // Method 1: Try to get transcript with multiple language options
    try {
      console.log('Attempting to fetch transcript...')
      let transcript = null
      
      // Try different language codes
      const languageCodes = ['en', 'en-US', 'en-GB', 'auto']
      
      for (const lang of languageCodes) {
        try {
          transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang })
          console.log(`Transcript found with language: ${lang}`)
          break
        } catch (langError) {
          console.log(`Failed to get transcript with ${lang}, trying next...`)
        }
      }
      
      // If language-specific attempts fail, try without language specification
      if (!transcript) {
        transcript = await YoutubeTranscript.fetchTranscript(videoId)
        console.log('Transcript found without language specification')
      }

      if (transcript && transcript.length > 0) {
        contentToSummarize = transcript
          .map(item => item.text)
          .join(' ')
          .replace(/\[.*?\]/g, '') // Remove timestamp markers
          .trim()
        contentSource = 'transcript'
        console.log(`Transcript extracted: ${contentToSummarize.length} characters`)
      }
    } catch (transcriptError) {
      console.log('Transcript extraction failed:', transcriptError.message)
    }

    // Method 2: If no transcript, use video description as fallback
    if (!contentToSummarize || contentToSummarize.length < 50) {
      console.log('Using video description as fallback')
      if (metadata.description && metadata.description.length > 100) {
        contentToSummarize = metadata.description.slice(0, 2000) // Limit description length
        contentSource = 'description'
        console.log(`Description used: ${contentToSummarize.length} characters`)
      }
    }

    // Method 3: If still no content, create summary from title and available metadata
    if (!contentToSummarize || contentToSummarize.length < 30) {
      console.log('Using title and metadata as fallback')
      contentToSummarize = `Video Title: ${metadata.title}\nDuration: ${metadata.duration}\nDescription: ${metadata.description || 'No description available'}`
      contentSource = 'metadata'
    }

    if (contentToSummarize.length < 20) {
      return NextResponse.json({ 
        success: false, 
        error: 'Insufficient content available for summarization. This video may be private or have very limited information.' 
      }, { status: 422 })
    }

    // Generate summary with OpenAI
    console.log(`Generating summary from ${contentSource}...`)
    const { summary, keyPoints } = await generateSummary(contentToSummarize, metadata.title, contentSource)

    return NextResponse.json({
      success: true,
      data: {
        videoTitle: metadata.title,
        summary,
        keyPoints,
        duration: metadata.duration,
        videoId
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