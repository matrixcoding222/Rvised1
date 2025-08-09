// Test with the specific video: https://www.youtube.com/watch?v=6Fj1AxKXjiM
// This will extract the transcript and generate an AI summary

console.log('🎬 TESTING VIDEO: https://www.youtube.com/watch?v=6Fj1AxKXjiM');
console.log('================================================\n');

// Step 1: Check if video has captions
async function testVideo() {
  // Get player response
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

  // Get video info
  const videoDetails = playerResponse?.videoDetails;
  console.log('📺 Video Title:', videoDetails?.title);
  console.log('👤 Channel:', videoDetails?.author);
  console.log('⏱️ Duration:', videoDetails?.lengthSeconds, 'seconds');
  
  // Check for captions
  const tracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
  
  if (!tracks || tracks.length === 0) {
    console.log('❌ This video has NO captions available');
    return null;
  }
  
  console.log('✅ Found', tracks.length, 'caption track(s)');
  
  // Try to extract using DOM method (bypass 429)
  console.log('\n🎯 Attempting 429 BYPASS extraction...\n');
  
  // Click More actions
  const moreBtn = Array.from(document.querySelectorAll('button'))
    .find(b => b.getAttribute('aria-label')?.includes('More'));
  
  if (moreBtn) {
    moreBtn.click();
    await new Promise(r => setTimeout(r, 1000));
    
    // Find transcript option
    const transcriptBtn = Array.from(document.querySelectorAll('yt-formatted-string, tp-yt-paper-item'))
      .find(el => el.textContent?.toLowerCase().includes('transcript'));
    
    if (transcriptBtn) {
      transcriptBtn.click();
      await new Promise(r => setTimeout(r, 2000));
      
      // Extract transcript
      const segments = document.querySelectorAll('ytd-transcript-segment-renderer');
      
      if (segments.length > 0) {
        const transcript = Array.from(segments)
          .map(seg => seg.querySelector('.segment-text')?.textContent?.trim())
          .filter(text => text)
          .join(' ');
        
        console.log('✅ TRANSCRIPT EXTRACTED!');
        console.log('📊 Length:', transcript.length, 'characters');
        console.log('\n📝 TRANSCRIPT PREVIEW (first 500 chars):');
        console.log(transcript.substring(0, 500) + '...\n');
        
        // Send to API for AI summary
        console.log('🤖 Generating AI Summary...\n');
        
        const response = await fetch('http://localhost:3000/api/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            videoUrl: 'https://www.youtube.com/watch?v=6Fj1AxKXjiM',
            extensionTranscript: transcript,
            settings: {
              summaryDepth: 'comprehensive',
              includeEmojis: true,
              includeKeyInsights: true,
              includeQuiz: true,
              includeTimestamps: true,
              includeChapters: true
            }
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          console.log('================================================');
          console.log('🎉 AI SUMMARY GENERATED SUCCESSFULLY!');
          console.log('================================================\n');
          
          console.log('🎯 MAIN TAKEAWAY:');
          console.log(data.data.mainTakeaway);
          
          console.log('\n📖 COMPREHENSIVE SUMMARY:');
          console.log(data.data.summary);
          
          console.log('\n💡 KEY INSIGHTS:');
          data.data.keyInsights?.forEach((insight, i) => {
            console.log(`  ${i+1}. ${insight}`);
          });
          
          if (data.data.chapters?.length > 0) {
            console.log('\n📚 CHAPTERS:');
            data.data.chapters.forEach(ch => {
              console.log(`  • ${ch.timestamp} - ${ch.title}`);
            });
          }
          
          console.log('\n❓ QUIZ QUESTIONS:');
          data.data.quiz?.forEach((q, i) => {
            console.log(`  ${i+1}. Q: ${q.question}`);
            console.log(`     A: ${q.answer}\n`);
          });
          
          console.log('================================================');
          console.log('📊 SUMMARY STATS:');
          console.log(`  • Video Title: ${videoDetails?.title}`);
          console.log(`  • Transcript Used: ${transcript.length} characters`);
          console.log(`  • Summary Generated: ${data.data.summary?.length} characters`);
          console.log(`  • Content Source: ${data.data.contentSource}`);
          console.log(`  • Key Insights: ${data.data.keyInsights?.length || 0}`);
          console.log(`  • Quiz Questions: ${data.data.quiz?.length || 0}`);
          console.log('================================================\n');
          
          return data.data;
        }
      }
    }
  }
  
  console.log('⚠️ Could not extract transcript');
  return null;
}

// Run the test
testVideo().then(result => {
  if (result) {
    console.log('✅ TEST SUCCESSFUL!');
    console.log('This is the AI summary your extension will generate!');
  }
});