// BYPASS 429: Extract captions from YouTube's DOM directly
// This avoids making HTTP requests that trigger rate limiting

function extractCaptionsFromDOM() {
  console.log('🎯 BYPASSING 429: Extracting from DOM...');
  
  try {
    // Method 1: Get from YouTube's caption panel if visible
    const captionPanel = document.querySelector('ytd-transcript-segment-list-renderer');
    if (captionPanel) {
      const segments = captionPanel.querySelectorAll('ytd-transcript-segment-renderer');
      if (segments.length > 0) {
        const transcript = Array.from(segments)
          .map(seg => seg.querySelector('.segment-text')?.textContent?.trim())
          .filter(text => text)
          .join(' ');
        
        if (transcript.length > 100) {
          console.log('✅ Extracted from caption panel:', transcript.length, 'chars');
          return transcript;
        }
      }
    }
    
    // Method 2: Enable captions programmatically and extract
    const video = document.querySelector('video');
    const player = document.querySelector('#movie_player');
    
    if (player && video) {
      // Check if captions are available
      const captionButton = document.querySelector('.ytp-subtitles-button');
      const isAvailable = captionButton && !captionButton.disabled;
      
      if (isAvailable) {
        // Enable captions if not already on
        if (captionButton.getAttribute('aria-pressed') === 'false') {
          captionButton.click();
          console.log('📝 Enabled captions');
        }
        
        // Wait for captions to load
        return new Promise((resolve) => {
          let attempts = 0;
          const checkInterval = setInterval(() => {
            attempts++;
            
            // Try to get captions from player
            const captionWindow = document.querySelector('.caption-window');
            const captionTexts = document.querySelectorAll('.ytp-caption-segment');
            
            if (captionTexts.length > 0) {
              // Collect all visible caption text
              const texts = Array.from(captionTexts)
                .map(el => el.textContent?.trim())
                .filter(text => text);
              
              if (texts.length > 0) {
                clearInterval(checkInterval);
                console.log('✅ Extracted from video captions');
                resolve(texts.join(' '));
              }
            }
            
            // Timeout after 5 seconds
            if (attempts > 50) {
              clearInterval(checkInterval);
              resolve(null);
            }
          }, 100);
        });
      }
    }
    
    // Method 3: Extract from ytInitialData if available
    if (window.ytInitialData) {
      const engagementPanels = window.ytInitialData?.engagementPanels;
      if (engagementPanels) {
        for (const panel of engagementPanels) {
          const transcript = panel?.engagementPanelSectionListRenderer?.content?.transcriptRenderer;
          if (transcript) {
            console.log('✅ Found transcript in ytInitialData');
            // This would need further processing
            return null; // Placeholder
          }
        }
      }
    }
    
    return null;
  } catch (error) {
    console.log('DOM extraction error:', error.message);
    return null;
  }
}

// Method 4: Open transcript panel and extract
async function extractFromTranscriptPanel() {
  console.log('🎯 Opening transcript panel...');
  
  try {
    // Find and click the "Show transcript" button
    const moreActionsButton = document.querySelector('#button[aria-label*="More actions"]');
    if (moreActionsButton) {
      moreActionsButton.click();
      await new Promise(r => setTimeout(r, 500));
      
      // Find transcript option
      const transcriptOption = Array.from(document.querySelectorAll('yt-formatted-string'))
        .find(el => el.textContent?.includes('Show transcript'));
      
      if (transcriptOption) {
        transcriptOption.click();
        await new Promise(r => setTimeout(r, 1000));
        
        // Extract from panel
        const segments = document.querySelectorAll('ytd-transcript-segment-renderer');
        if (segments.length > 0) {
          const transcript = Array.from(segments)
            .map(seg => {
              const text = seg.querySelector('.segment-text')?.textContent?.trim();
              return text;
            })
            .filter(text => text)
            .join(' ');
          
          console.log('✅ Extracted from transcript panel:', transcript.length, 'chars');
          return transcript;
        }
      }
    }
  } catch (error) {
    console.log('Panel extraction error:', error.message);
  }
  
  return null;
}

// Export for use
window.bypass429Extraction = {
  extractCaptionsFromDOM,
  extractFromTranscriptPanel
};