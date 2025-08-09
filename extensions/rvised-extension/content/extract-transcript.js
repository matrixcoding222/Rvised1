// THE WORKING METHOD - Extract transcript from YouTube
async function extractYouTubeTranscript() {
  console.log('🎯 EXTRACTING TRANSCRIPT - THE METHOD THAT WORKS');
  
  try {
    // Method 1: Get from ytInitialPlayerResponse in page
    const scripts = document.querySelectorAll('script');
    for (const script of scripts) {
      const content = script.textContent || '';
      if (content.includes('ytInitialPlayerResponse')) {
        const match = content.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
        if (match) {
          try {
            const playerResponse = JSON.parse(match[1]);
            const tracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
            
            if (tracks && tracks.length > 0) {
              console.log('✅ Found caption tracks:', tracks.length);
              
              // Get English track or first available
              const track = tracks.find(t => t.languageCode?.startsWith('en')) || tracks[0];
              
              if (track?.baseUrl) {
                // Clean URL
                let url = track.baseUrl.replace(/\\u0026/g, '&');
                
                console.log('📡 Fetching transcript from:', url.substring(0, 60) + '...');
                
                const response = await fetch(url);
                if (response.ok) {
                  const text = await response.text();
                  
                  // Parse XML format
                  const parser = new DOMParser();
                  const doc = parser.parseFromString(text, 'text/xml');
                  const textNodes = doc.querySelectorAll('text');
                  
                  if (textNodes.length > 0) {
                    const transcript = Array.from(textNodes)
                      .map(node => {
                        let content = node.textContent || '';
                        // Decode HTML entities
                        content = content
                          .replace(/&amp;/g, '&')
                          .replace(/&lt;/g, '<')
                          .replace(/&gt;/g, '>')
                          .replace(/&quot;/g, '"')
                          .replace(/&#39;/g, "'")
                          .replace(/&nbsp;/g, ' ')
                          .trim();
                        return content;
                      })
                      .filter(text => text.length > 0)
                      .join(' ');
                    
                    console.log('✅ SUCCESS! Extracted transcript:', transcript.length, 'characters');
                    return transcript;
                  }
                }
              }
            }
          } catch (e) {
            console.log('Error parsing player response:', e);
          }
        }
      }
    }
    
    // Method 2: Try window.ytInitialPlayerResponse
    if (window.ytInitialPlayerResponse) {
      const tracks = window.ytInitialPlayerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
      if (tracks && tracks.length > 0) {
        const track = tracks.find(t => t.languageCode?.startsWith('en')) || tracks[0];
        if (track?.baseUrl) {
          let url = track.baseUrl.replace(/\\u0026/g, '&');
          const response = await fetch(url);
          if (response.ok) {
            const text = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/xml');
            const textNodes = doc.querySelectorAll('text');
            
            if (textNodes.length > 0) {
              const transcript = Array.from(textNodes)
                .map(node => (node.textContent || '').replace(/&amp;/g, '&').replace(/&#39;/g, "'").trim())
                .filter(text => text.length > 0)
                .join(' ');
              
              console.log('✅ SUCCESS from window object:', transcript.length, 'characters');
              return transcript;
            }
          }
        }
      }
    }
    
    // Method 3: Check if transcript panel is open
    const transcriptContainer = document.querySelector('ytd-transcript-renderer');
    if (transcriptContainer) {
      const segments = transcriptContainer.querySelectorAll('ytd-transcript-segment-renderer');
      if (segments.length > 0) {
        const transcript = Array.from(segments)
          .map(seg => {
            const textEl = seg.querySelector('.segment-text, yt-formatted-string');
            return textEl?.textContent?.trim() || '';
          })
          .filter(text => text.length > 0)
          .join(' ');
        
        if (transcript.length > 100) {
          console.log('✅ Got transcript from open panel:', transcript.length, 'characters');
          return transcript;
        }
      }
    }
    
  } catch (error) {
    console.error('Transcript extraction error:', error);
  }
  
  console.log('❌ No transcript found');
  return null;
}

// Export for use in content.js
window.extractYouTubeTranscript = extractYouTubeTranscript;