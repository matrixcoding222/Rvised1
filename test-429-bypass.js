// TEST 429 BYPASS - Run this in YouTube console
// This extracts transcripts WITHOUT making HTTP requests

async function test429Bypass() {
  console.log('🎯 TESTING 429 BYPASS METHOD');
  console.log('================================\n');
  
  console.log('📝 Method 1: Opening transcript panel...');
  
  try {
    // Find the More Actions button (three dots)
    let moreBtn = document.querySelector('#button[aria-label*="More"]');
    if (!moreBtn) {
      moreBtn = document.querySelector('button[aria-label*="More actions"]');
    }
    if (!moreBtn) {
      moreBtn = Array.from(document.querySelectorAll('button'))
        .find(b => b.querySelector('svg') && b.getAttribute('aria-label')?.includes('More'));
    }
    
    if (moreBtn) {
      console.log('✅ Found More button, clicking...');
      moreBtn.click();
      await new Promise(r => setTimeout(r, 1000));
      
      // Find "Show transcript" option
      const transcriptBtn = Array.from(document.querySelectorAll('yt-formatted-string, tp-yt-paper-item'))
        .find(el => {
          const text = el.textContent?.toLowerCase();
          return text?.includes('transcript') || text?.includes('subtitles');
        });
      
      if (transcriptBtn) {
        console.log('✅ Found transcript button, clicking...');
        transcriptBtn.click();
        await new Promise(r => setTimeout(r, 2000));
        
        // Extract from transcript panel
        const segments = document.querySelectorAll('ytd-transcript-segment-renderer');
        
        if (segments.length > 0) {
          const transcript = Array.from(segments)
            .map(seg => {
              const text = seg.querySelector('.segment-text')?.textContent?.trim();
              const time = seg.querySelector('.segment-timestamp')?.textContent?.trim();
              return text;
            })
            .filter(text => text)
            .join(' ');
          
          console.log('✅ SUCCESS! BYPASSED 429!');
          console.log('📊 Extracted', transcript.length, 'characters');
          console.log('📝 First 300 chars:', transcript.substring(0, 300) + '...');
          
          // Copy to clipboard
          navigator.clipboard.writeText(transcript);
          console.log('📋 Full transcript copied to clipboard!');
          
          console.log('\n🎉 NO HTTP REQUESTS MADE - NO 429 ERROR!');
          return transcript;
        } else {
          console.log('⚠️ No segments found in panel');
        }
      } else {
        console.log('⚠️ Transcript button not found');
        console.log('This video may not have transcripts available');
      }
    } else {
      console.log('⚠️ More actions button not found');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  console.log('\n📝 Method 2: Checking if video has captions...');
  
  // Check if captions exist
  const captionBtn = document.querySelector('.ytp-subtitles-button');
  if (captionBtn && !captionBtn.disabled) {
    console.log('✅ This video has captions available');
    console.log('The bypass method should work!');
  } else {
    console.log('❌ No captions available for this video');
  }
}

// Run the test
test429Bypass();