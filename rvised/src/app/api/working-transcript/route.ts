import { NextRequest, NextResponse } from 'next/server'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// THE ONE METHOD THAT ACTUALLY WORKS
async function getRealTranscript(videoId: string): Promise<string | null> {
  try {
    // Use the caption track URL pattern that YouTube uses
    const urls = [
      `https://www.youtube.com/api/timedtext?v=${videoId}&ei=abcd&caps=asr&opi=112496729&xoaf=5&lang=en&fmt=srv3`,
      `https://www.youtube.com/api/timedtext?v=${videoId}&asr_langs=de,en,es,fr,it,ja,ko,nl,pt,ru&caps=asr&exp=xftt&xorp=true&xoaf=5&lang=en&fmt=srv3`,
      `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&fmt=srv1`,
    ];

    for (const url of urls) {
      try {
        const response = await fetch(url, {
          headers: {
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': `https://www.youtube.com/watch?v=${videoId}`,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Origin': 'https://www.youtube.com',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
          }
        });

        if (response.ok) {
          const text = await response.text();
          
          // Parse XML
          if (text.includes('<text')) {
            const matches = [...text.matchAll(/<text[^>]*>(.*?)<\/text>/g)];
            if (matches.length > 0) {
              const transcript = matches
                .map(m => m[1])
                .map(t => t.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"'))
                .join(' ');
              
              if (transcript.length > 100) {
                return transcript;
              }
            }
          }
        }
      } catch {}
    }

    // If that doesn't work, try the timedtext list to get ANY available language
    try {
      const listResponse = await fetch(`https://www.youtube.com/api/timedtext?type=list&v=${videoId}`);
      if (listResponse.ok) {
        const xml = await listResponse.text();
        const langMatch = xml.match(/lang_code="([^"]+)"/);
        
        if (langMatch) {
          const lang = langMatch[1];
          const transcriptUrl = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${lang}&fmt=srv1`;
          
          const response = await fetch(transcriptUrl);
          if (response.ok) {
            const text = await response.text();
            const matches = [...text.matchAll(/<text[^>]*>(.*?)<\/text>/g)];
            
            if (matches.length > 0) {
              return matches
                .map(m => m[1])
                .map(t => t.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"'))
                .join(' ');
            }
          }
        }
      }
    } catch {}

    return null;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  const { videoUrl } = await request.json();
  
  const match = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  if (!match) {
    return NextResponse.json({ success: false, error: 'Invalid URL' }, { status: 400, headers: corsHeaders });
  }
  
  const videoId = match[1];
  const transcript = await getRealTranscript(videoId);
  
  if (transcript) {
    return NextResponse.json({ 
      success: true, 
      transcript,
      message: 'Transcript extracted successfully!'
    }, { headers: corsHeaders });
  }
  
  return NextResponse.json({ 
    success: false, 
    error: 'Could not extract transcript' 
  }, { status: 404, headers: corsHeaders });
}