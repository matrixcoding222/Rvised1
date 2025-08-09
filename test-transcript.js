// Using native fetch in Node.js 18+

async function testTranscript() {
  const videoId = 'W6NZfCO5SIk'; // JavaScript tutorial
  
  console.log('Testing transcript extraction for video:', videoId);
  
  // Test 1: Check available languages
  try {
    const listUrl = `https://video.google.com/timedtext?type=list&v=${videoId}`;
    const response = await fetch(listUrl);
    const xml = await response.text();
    
    if (xml.includes('lang_code')) {
      console.log('✅ Languages available!');
      const langs = xml.match(/lang_code="([^"]+)"/g);
      if (langs) {
        console.log('Available languages:', langs.slice(0, 5).join(', '));
      }
    } else {
      console.log('❌ No languages found');
    }
  } catch (e) {
    console.log('Error checking languages:', e.message);
  }
  
  // Test 2: Try to fetch English transcript
  const urls = [
    `https://video.google.com/timedtext?v=${videoId}&lang=en&fmt=json3`,
    `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&fmt=json3`,
    `https://video.google.com/timedtext?v=${videoId}&lang=en-US&fmt=json3`,
  ];
  
  for (const url of urls) {
    try {
      console.log(`\nTrying: ${url.substring(0, 60)}...`);
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        }
      });
      
      console.log('Status:', response.status);
      
      if (response.ok) {
        const text = await response.text();
        if (text.length > 100) {
          console.log('✅ Got transcript! Length:', text.length);
          
          // Try to parse as JSON
          try {
            const json = JSON.parse(text);
            if (json.events) {
              console.log('Events found:', json.events.length);
            }
          } catch {
            console.log('Not JSON format');
          }
          break;
        }
      }
    } catch (e) {
      console.log('Error:', e.message);
    }
  }
}

testTranscript().catch(console.error);