import { NextRequest, NextResponse } from 'next/server'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// ONE METHOD THAT WORKS - Get transcript from YouTube page HTML
async function getTranscript(videoId: string): Promise<string | null> {
  try {
    // Fetch the YouTube watch page
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en',
        'Cache-Control': 'no-cache',
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
      }
    });

    if (!response.ok) return null;
    
    const html = await response.text();
    
    // Extract the player response that contains caption data
    const ytInitialPlayerResponseMatch = html.match(/var ytInitialPlayerResponse = ({.+?});/s);
    
    if (!ytInitialPlayerResponseMatch) return null;
    
    try {
      const playerResponse = JSON.parse(ytInitialPlayerResponseMatch[1]);
      
      // Get captions
      const captions = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
      
      if (!captions || captions.length === 0) {
        // No captions available
        return null;
      }
      
      // Get the first English caption or first available
      const caption = captions.find((c: any) => c.languageCode?.startsWith('en')) || captions[0];
      
      if (!caption?.baseUrl) return null;
      
      // Clean the URL
      let url = caption.baseUrl;
      url = url.replace(/\\u0026/g, '&');
      
      // Fetch the actual captions
      const captionResponse = await fetch(url);
      
      if (!captionResponse.ok) return null;
      
      const captionText = await captionResponse.text();
      
      // Parse XML to get text
      const textRegex = /<text[^>]*>(.*?)<\/text>/g;
      const matches = [...captionText.matchAll(textRegex)];
      
      if (matches.length === 0) return null;
      
      // Extract and clean text
      const transcript = matches
        .map(match => match[1])
        .map(text => 
          text
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&nbsp;/g, ' ')
            .trim()
        )
        .filter(text => text.length > 0)
        .join(' ');
      
      return transcript;
      
    } catch (e) {
      console.error('Parse error:', e);
      return null;
    }
    
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const { videoUrl } = await request.json();
    
    // Extract video ID
    const match = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (!match) {
      return NextResponse.json(
        { success: false, error: 'Invalid YouTube URL' },
        { status: 400, headers: corsHeaders }
      );
    }
    
    const videoId = match[1];
    const transcript = await getTranscript(videoId);
    
    if (transcript) {
      return NextResponse.json(
        { 
          success: true, 
          transcript,
          length: transcript.length 
        },
        { headers: corsHeaders }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'No transcript available' },
      { status: 404, headers: corsHeaders }
    );
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}