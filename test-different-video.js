// Test with a video that DEFINITELY has captions
// Run this in YouTube console on a DIFFERENT video

console.log('🎯 TESTING CAPTION AVAILABILITY');
console.log('================================\n');

// Try these videos that are KNOWN to have captions:
const VIDEOS_WITH_CAPTIONS = [
  'jNQXAC9IVRw', // Me at the zoo - First YouTube video
  'dQw4w9WgXcQ', // Rick Astley - Popular video with captions
  'Ct6BUPvE2sM', // PewDiePie - Has captions
  'kJQP7kiw5Fk', // Luis Fonsi - Despacito - Has multiple language captions
];

console.log('Try these videos that HAVE captions:');
VIDEOS_WITH_CAPTIONS.forEach(id => {
  console.log(`https://www.youtube.com/watch?v=${id}`);
});

console.log('\n🔍 Checking current video...\n');

// Check current video
const currentVideoId = new URLSearchParams(window.location.search).get('v');
console.log('Current video ID:', currentVideoId);

// Check if it has captions
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
  console.log('❌ THIS VIDEO HAS NO CAPTIONS!');
  console.log('The extension CANNOT extract transcripts from videos without captions.');
  console.log('\n📺 Please try one of the videos listed above that HAS captions.');
} else {
  console.log('✅ This video HAS captions!');
  console.log('Found', tracks.length, 'caption track(s)');
  
  // Try extracting
  const track = tracks[0];
  const url = track.baseUrl.replace(/\\u0026/g, '&');
  
  console.log('\n📥 Attempting to extract transcript...');
  
  fetch(url)
    .then(async response => {
      if (response.status === 429) {
        console.log('⚠️ RATE LIMITED - YouTube is blocking requests');
        console.log('SOLUTION: Wait 5-10 minutes and try again');
        console.log('Or try a different video/browser/network');
      } else if (response.ok) {
        const xml = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(xml, 'text/xml');
        const textNodes = doc.getElementsByTagName('text');
        
        if (textNodes.length > 0) {
          const transcript = Array.from(textNodes)
            .map(node => node.textContent.trim())
            .filter(t => t.length > 0)
            .join(' ');
          
          console.log('✅ TRANSCRIPT EXTRACTED SUCCESSFULLY!');
          console.log('Length:', transcript.length, 'characters');
          console.log('Preview:', transcript.substring(0, 200) + '...');
          console.log('\n🎉 The extension WILL WORK with this video!');
        }
      }
    })
    .catch(e => console.log('Error:', e.message));
}