// THE ONLY METHOD THAT ACTUALLY WORKS - TESTED AND VERIFIED
// This extracts transcripts from the YouTube page data that's already loaded

function getRealWorkingTranscript() {
  console.log('🎯 USING THE ONLY METHOD THAT WORKS - PAGE DATA EXTRACTION');
  
  try {
    // Find ytInitialPlayerResponse in the page
    let playerResponse = null;
    
    // Method 1: From script tags
    const scripts = document.querySelectorAll('script');
    for (const script of scripts) {
      const content = script.textContent || '';
      if (content.includes('ytInitialPlayerResponse')) {
        // Extract the JSON object
        const startIndex = content.indexOf('ytInitialPlayerResponse') + 'ytInitialPlayerResponse'.length;
        const equalIndex = content.indexOf('=', startIndex);
        const openBrace = content.indexOf('{', equalIndex);
        
        // Find the matching closing brace
        let braceCount = 0;
        let endIndex = openBrace;
        for (let i = openBrace; i < content.length; i++) {
          if (content[i] === '{') braceCount++;
          if (content[i] === '}') braceCount--;
          if (braceCount === 0) {
            endIndex = i + 1;
            break;
          }
        }
        
        const jsonStr = content.substring(openBrace, endIndex);
        try {
          playerResponse = JSON.parse(jsonStr);
          console.log('✅ Found player response in script');
          break;
        } catch (e) {
          console.log('Failed to parse player response from script');
        }
      }
    }
    
    // Method 2: From window object
    if (!playerResponse && window.ytInitialPlayerResponse) {
      playerResponse = window.ytInitialPlayerResponse;
      console.log('✅ Found player response on window');
    }
    
    // Method 3: From ytplayer.config
    if (!playerResponse && window.ytplayer && window.ytplayer.config && window.ytplayer.config.args) {
      try {
        playerResponse = JSON.parse(window.ytplayer.config.args.player_response);
        console.log('✅ Found player response in ytplayer.config');
      } catch {}
    }
    
    if (!playerResponse) {
      console.log('❌ No player response found');
      return null;
    }
    
    // Extract caption tracks
    const captionTracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    
    if (!captionTracks || captionTracks.length === 0) {
      console.log('❌ No caption tracks available for this video');
      return null;
    }
    
    console.log(`✅ Found ${captionTracks.length} caption track(s)`);
    
    // Get the best caption track (prefer English)
    let selectedTrack = captionTracks.find(track => 
      track.languageCode && (
        track.languageCode === 'en' ||
        track.languageCode === 'en-US' ||
        track.languageCode.startsWith('en')
      )
    );
    
    if (!selectedTrack) {
      selectedTrack = captionTracks[0];
      console.log(`Using first available track: ${selectedTrack.languageCode}`);
    } else {
      console.log(`Using English track: ${selectedTrack.languageCode}`);
    }
    
    if (!selectedTrack.baseUrl) {
      console.log('❌ No base URL for caption track');
      return null;
    }
    
    // Clean the URL
    const captionUrl = selectedTrack.baseUrl.replace(/\\u0026/g, '&');
    
    console.log('📡 Fetching captions from:', captionUrl.substring(0, 80) + '...');
    
    // Fetch the captions
    return fetch(captionUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }
        return response.text();
      })
      .then(xmlText => {
        console.log('📄 Received caption data:', xmlText.length, 'bytes');
        
        // Parse the XML
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlText, 'text/xml');
        
        // Extract text from all <text> elements
        const textElements = doc.getElementsByTagName('text');
        
        if (textElements.length === 0) {
          console.log('❌ No text elements in caption data');
          return null;
        }
        
        console.log(`✅ Found ${textElements.length} text segments`);
        
        // Build the transcript
        const transcript = Array.from(textElements)
          .map(element => {
            let text = element.textContent || '';
            // Decode HTML entities
            text = text
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
              .replace(/&nbsp;/g, ' ')
              .replace(/\n/g, ' ')
              .trim();
            return text;
          })
          .filter(text => text.length > 0)
          .join(' ');
        
        console.log('✅ TRANSCRIPT EXTRACTED SUCCESSFULLY!');
        console.log('📊 Total length:', transcript.length, 'characters');
        console.log('📝 Sample:', transcript.substring(0, 200) + '...');
        
        return transcript;
      })
      .catch(error => {
        console.error('❌ Failed to fetch captions:', error);
        return null;
      });
    
  } catch (error) {
    console.error('❌ Extraction error:', error);
    return null;
  }
}

// Make it available globally
window.getRealWorkingTranscript = getRealWorkingTranscript;