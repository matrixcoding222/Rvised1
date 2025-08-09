// RUN THIS CODE IN YOUTUBE CONSOLE TO VERIFY EXTENSION METHOD WORKS
// This simulates exactly what the Chrome extension does

async function verifyExtensionWorks() {
  console.log('🔬 VERIFYING EXTENSION TRANSCRIPT EXTRACTION');
  console.log('============================================\n');
  
  const videoId = new URLSearchParams(window.location.search).get('v');
  console.log('📺 Video ID:', videoId);
  console.log('🔗 URL:', window.location.href);
  
  // STEP 1: Find ytInitialPlayerResponse (exactly like extension does)
  console.log('\n📡 Step 1: Finding player response...');
  let playerResponse = null;
  
  // Try window object first
  if (window.ytInitialPlayerResponse) {
    playerResponse = window.ytInitialPlayerResponse;
    console.log('✅ Found on window.ytInitialPlayerResponse');
  } else {
    // Search in script tags
    const scripts = document.querySelectorAll('script');
    for (const script of scripts) {
      const content = script.textContent || '';
      if (content.includes('ytInitialPlayerResponse')) {
        const match = content.match(/ytInitialPlayerResponse\s*=\s*({[\s\S]*?});/);
        if (match) {
          try {
            playerResponse = JSON.parse(match[1]);
            console.log('✅ Found in script tag');
            break;
          } catch (e) {
            console.log('Failed to parse from script:', e.message);
          }
        }
      }
    }
  }
  
  if (!playerResponse) {
    console.log('❌ FAILED: No player response found');
    console.log('This video may not have captions available');
    return null;
  }
  
  // STEP 2: Extract caption tracks
  console.log('\n📡 Step 2: Extracting caption tracks...');
  const tracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
  
  if (!tracks || tracks.length === 0) {
    console.log('❌ FAILED: No caption tracks available');
    console.log('This video does not have captions/subtitles');
    return null;
  }
  
  console.log(`✅ Found ${tracks.length} caption track(s):`);
  tracks.forEach((track, i) => {
    console.log(`  ${i+1}. ${track.name?.simpleText || 'Unknown'} (${track.languageCode})`);
  });
  
  // STEP 3: Select best track (prefer English)
  console.log('\n📡 Step 3: Selecting best caption track...');
  let selectedTrack = tracks.find(t => 
    t.languageCode === 'en' || 
    t.languageCode === 'en-US' || 
    t.languageCode?.startsWith('en')
  ) || tracks[0];
  
  console.log(`✅ Selected: ${selectedTrack.name?.simpleText} (${selectedTrack.languageCode})`);
  
  if (!selectedTrack.baseUrl) {
    console.log('❌ FAILED: No baseUrl in selected track');
    return null;
  }
  
  // STEP 4: Fetch captions
  console.log('\n📡 Step 4: Fetching caption data...');
  const captionUrl = selectedTrack.baseUrl.replace(/\\u0026/g, '&');
  console.log('📥 Fetching from:', captionUrl.substring(0, 100) + '...');
  
  try {
    const response = await fetch(captionUrl);
    console.log('📡 Response status:', response.status);
    
    if (!response.ok) {
      console.log('❌ FAILED: HTTP', response.status);
      return null;
    }
    
    const xmlText = await response.text();
    console.log(`✅ Received ${xmlText.length} bytes of XML data`);
    
    // STEP 5: Parse XML
    console.log('\n📡 Step 5: Parsing XML caption data...');
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'text/xml');
    const textNodes = doc.getElementsByTagName('text');
    
    if (textNodes.length === 0) {
      console.log('❌ FAILED: No text nodes in XML');
      console.log('XML sample:', xmlText.substring(0, 300));
      return null;
    }
    
    console.log(`✅ Found ${textNodes.length} caption segments`);
    
    // STEP 6: Build transcript
    console.log('\n📡 Step 6: Building final transcript...');
    const transcript = Array.from(textNodes)
      .map(node => {
        let text = node.textContent || '';
        // Decode HTML entities
        return text
          .replace(/&amp;/g, '&')
          .replace(/&#39;/g, "'")
          .replace(/&quot;/g, '"')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&nbsp;/g, ' ')
          .replace(/\n/g, ' ')
          .trim();
      })
      .filter(text => text.length > 0)
      .join(' ');
    
    console.log('\n============================================');
    console.log('✅ TRANSCRIPT EXTRACTION SUCCESSFUL!');
    console.log('============================================');
    console.log('📊 Total length:', transcript.length, 'characters');
    console.log('📝 First 500 characters:');
    console.log(transcript.substring(0, 500) + '...\n');
    
    // Copy to clipboard
    await navigator.clipboard.writeText(transcript);
    console.log('📋 Full transcript copied to clipboard!');
    console.log('\n🎯 This proves the extension method works 100%!');
    
    return transcript;
    
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    return null;
  }
}

// Run the verification
verifyExtensionWorks().then(transcript => {
  if (transcript) {
    console.log('\n🚀 Next step: Test the extension on this video');
    console.log('The extension should extract this same transcript!');
  } else {
    console.log('\n⚠️ Try a different video that has captions');
  }
});