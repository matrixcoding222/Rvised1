// Test if a YouTube video has captions available
// Run this in YouTube console

function testVideoCaptions() {
  console.log('🔍 CHECKING VIDEO FOR CAPTIONS');
  console.log('================================\n');
  
  const videoId = new URLSearchParams(window.location.search).get('v');
  console.log('Video ID:', videoId);
  console.log('URL:', window.location.href);
  
  // Check ytInitialPlayerResponse
  let playerResponse = null;
  
  if (window.ytInitialPlayerResponse) {
    playerResponse = window.ytInitialPlayerResponse;
  } else {
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
  
  if (!playerResponse) {
    console.log('❌ No player response found');
    return;
  }
  
  // Check for captions
  const captionRenderer = playerResponse?.captions?.playerCaptionsTracklistRenderer;
  
  if (!captionRenderer) {
    console.log('❌ NO CAPTIONS AVAILABLE FOR THIS VIDEO');
    console.log('This video does not have any caption tracks');
    return;
  }
  
  const tracks = captionRenderer.captionTracks || [];
  const translationLanguages = captionRenderer.translationLanguages || [];
  
  console.log('✅ CAPTIONS FOUND!');
  console.log(`📝 ${tracks.length} caption track(s) available:`);
  
  tracks.forEach((track, i) => {
    console.log(`  ${i+1}. ${track.name?.simpleText || 'Unknown'} (${track.languageCode})`);
    console.log(`     URL: ${track.baseUrl?.substring(0, 80)}...`);
  });
  
  if (translationLanguages.length > 0) {
    console.log(`\n🌍 Can be translated to ${translationLanguages.length} languages`);
  }
  
  // Test fetching the first track
  if (tracks.length > 0 && tracks[0].baseUrl) {
    const url = tracks[0].baseUrl.replace(/\\u0026/g, '&');
    console.log('\n📥 Testing caption fetch...');
    
    fetch(url)
      .then(r => {
        console.log('Response status:', r.status);
        if (r.status === 429) {
          console.log('⚠️ RATE LIMITED - Try again later or use a different method');
        } else if (r.ok) {
          console.log('✅ Captions can be fetched successfully!');
        }
      })
      .catch(e => console.log('Fetch error:', e.message));
  }
}

testVideoCaptions();