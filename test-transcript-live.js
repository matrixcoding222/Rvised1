// TEST THIS CODE DIRECTLY IN YOUTUBE CONSOLE
// Go to any YouTube video and paste this in the console

async function testTranscriptExtraction() {
  console.log('🔬 TESTING TRANSCRIPT EXTRACTION...');
  
  const videoId = new URLSearchParams(window.location.search).get('v');
  console.log('Video ID:', videoId);
  
  // Method 1: YouTube's InnerTube API (what YouTube uses internally)
  try {
    console.log('\n📡 Testing YouTube InnerTube API...');
    const response = await fetch(`https://www.youtube.com/youtubei/v1/get_transcript?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: 'WEB',
            clientVersion: '2.20240101.00.00'
          }
        },
        params: btoa(`\n\x0b${videoId}`)
      })
    });
    
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
    
    if (data?.actions?.[0]?.updateEngagementPanelAction) {
      console.log('✅ InnerTube API WORKS!');
    } else {
      console.log('❌ InnerTube API failed');
    }
  } catch (e) {
    console.log('❌ InnerTube error:', e);
  }
  
  // Method 2: Direct caption URL from player response
  try {
    console.log('\n📡 Testing direct caption URL extraction...');
    
    // Find ytInitialPlayerResponse in page
    let playerResponse = null;
    const scripts = document.querySelectorAll('script');
    for (const script of scripts) {
      const content = script.textContent || '';
      if (content.includes('ytInitialPlayerResponse')) {
        const match = content.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
        if (match) {
          playerResponse = JSON.parse(match[1]);
          break;
        }
      }
    }
    
    if (playerResponse) {
      const tracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
      console.log('Caption tracks found:', tracks?.length || 0);
      
      if (tracks && tracks.length > 0) {
        const track = tracks[0];
        console.log('First track:', track);
        
        if (track.baseUrl) {
          const url = track.baseUrl.replace(/\\u0026/g, '&');
          console.log('Caption URL:', url);
          
          const response = await fetch(url);
          console.log('Fetch status:', response.status);
          
          if (response.ok) {
            const text = await response.text();
            console.log('Response length:', text.length);
            console.log('First 200 chars:', text.substring(0, 200));
            
            if (text.includes('<text')) {
              console.log('✅ DIRECT CAPTION URL WORKS!');
            }
          }
        }
      }
    }
  } catch (e) {
    console.log('❌ Direct caption error:', e);
  }
  
  // Method 3: Simple timedtext API
  try {
    console.log('\n📡 Testing simple timedtext API...');
    const response = await fetch(`https://video.google.com/timedtext?v=${videoId}&lang=en`);
    console.log('Timedtext status:', response.status);
    
    if (response.ok) {
      const text = await response.text();
      console.log('Response length:', text.length);
      
      if (text.includes('<text')) {
        console.log('✅ TIMEDTEXT API WORKS!');
      }
    }
  } catch (e) {
    console.log('❌ Timedtext error:', e);
  }
  
  // Method 4: Check transcript panel
  console.log('\n📡 Checking for transcript panel...');
  const transcriptButton = document.querySelector('button[aria-label*="Show transcript"]');
  if (transcriptButton) {
    console.log('✅ Transcript button found - video has transcript available');
  } else {
    console.log('❌ No transcript button - video may not have captions');
  }
}

// Run the test
testTranscriptExtraction();