// Test YouTube transcript methods from Node.js

async function testYouTubeTranscript() {
  const videoId = 'jNQXAC9IVRw'; // "Me at the zoo" - first YouTube video
  
  console.log('Testing transcript extraction for:', videoId);
  console.log('Video URL: https://www.youtube.com/watch?v=' + videoId);
  console.log('-------------------------------------------\n');
  
  // Test 1: InnerTube API (YouTube's internal API)
  try {
    console.log('📡 Test 1: YouTube InnerTube API');
    const response = await fetch(`https://www.youtube.com/youtubei/v1/get_transcript?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Origin': 'https://www.youtube.com',
        'Referer': `https://www.youtube.com/watch?v=${videoId}`
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: 'WEB',
            clientVersion: '2.20240101.00.00',
            hl: 'en',
            gl: 'US'
          }
        },
        params: Buffer.from(`\n\x0b${videoId}`).toString('base64')
      })
    });
    
    console.log('Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      const hasTranscript = !!data?.actions?.[0]?.updateEngagementPanelAction;
      console.log('Has transcript data:', hasTranscript);
      
      if (hasTranscript) {
        console.log('✅ InnerTube API WORKS!\n');
      } else {
        console.log('❌ No transcript in response\n');
      }
    } else {
      console.log('❌ Request failed:', response.status, '\n');
    }
  } catch (e) {
    console.log('❌ InnerTube error:', e.message, '\n');
  }
  
  // Test 2: Timedtext API
  try {
    console.log('📡 Test 2: Google Timedtext API');
    const response = await fetch(`https://video.google.com/timedtext?v=${videoId}&lang=en`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    console.log('Status:', response.status);
    
    if (response.ok) {
      const text = await response.text();
      console.log('Response length:', text.length);
      
      if (text.includes('<text')) {
        const matches = text.match(/<text/g);
        console.log('Found', matches.length, 'text segments');
        console.log('✅ Timedtext API WORKS!\n');
      } else {
        console.log('❌ No text elements in response\n');
      }
    } else if (response.status === 429) {
      console.log('❌ Rate limited (429)\n');
    } else {
      console.log('❌ Request failed\n');
    }
  } catch (e) {
    console.log('❌ Timedtext error:', e.message, '\n');
  }
  
  // Test 3: YouTube page scraping
  try {
    console.log('📡 Test 3: YouTube Page Scraping');
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    
    console.log('Status:', response.status);
    
    if (response.ok) {
      const html = await response.text();
      
      // Check for ytInitialPlayerResponse
      if (html.includes('ytInitialPlayerResponse')) {
        console.log('Found ytInitialPlayerResponse');
        
        // Check for captions
        if (html.includes('captionTracks')) {
          console.log('✅ Page has caption tracks!\n');
        } else {
          console.log('❌ No caption tracks in page\n');
        }
      }
    }
  } catch (e) {
    console.log('❌ Page scrape error:', e.message, '\n');
  }
  
  console.log('-------------------------------------------');
  console.log('SUMMARY: Testing complete');
}

testYouTubeTranscript().catch(console.error);