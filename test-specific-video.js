// Test the specific video that's failing
// Run this in the YouTube console on video jBqYLe6m92E

console.log('🔍 TESTING VIDEO: jBqYLe6m92E');
console.log('================================\n');

// Check if this video has captions
let playerResponse = window.ytInitialPlayerResponse;
if (!playerResponse) {
  const scripts = document.querySelectorAll('script');
  for (const script of scripts) {
    if (script.textContent?.includes('ytInitialPlayerResponse')) {
      const match = script.textContent.match(/ytInitialPlayerResponse\s*=\s*({[\s\S]*?});/);
      if (match) {
        try { 
          playerResponse = JSON.parse(match[1]); 
          break; 
        } catch {}
      }
    }
  }
}

const tracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

if (!tracks || tracks.length === 0) {
  console.log('❌ THIS VIDEO HAS NO CAPTIONS AVAILABLE');
  console.log('The API will use title & description as fallback');
  console.log('\n💡 Try a different video that has captions:');
  console.log('- https://www.youtube.com/watch?v=jNQXAC9IVRw (Me at the zoo)');
  console.log('- Any video with CC button enabled');
} else {
  console.log('✅ This video HAS captions!');
  console.log('Found', tracks.length, 'caption track(s):');
  tracks.forEach(t => {
    console.log('-', t.name?.simpleText, '(' + t.languageCode + ')');
    console.log('  URL:', t.baseUrl?.substring(0, 100) + '...');
  });
  
  // Try to fetch
  const url = tracks[0].baseUrl.replace(/\\u0026/g, '&');
  console.log('\n📥 Testing fetch...');
  
  fetch(url).then(r => {
    if (r.status === 429) {
      console.log('⚠️ RATE LIMITED (429)');
      console.log('YouTube is blocking caption requests');
      console.log('Wait a few minutes and try again');
    } else if (r.ok) {
      console.log('✅ Captions accessible!');
      r.text().then(t => {
        console.log('Received', t.length, 'bytes of caption data');
      });
    } else {
      console.log('❌ Failed with status:', r.status);
    }
  }).catch(e => console.log('❌ Fetch error:', e.message));
}