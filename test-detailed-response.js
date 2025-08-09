// Test to see detailed API response
const TEST_TRANSCRIPT = `All right, so here we are in front of the elephants. The cool thing about these guys is that they have really, really, really long trunks. And that's, that's cool. And that's pretty much all there is to say.`;

async function testDetailedResponse() {
  console.log('🔍 DETAILED API RESPONSE TEST');
  console.log('================================\n');
  
  const response = await fetch('http://localhost:3000/api/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
      extensionTranscript: TEST_TRANSCRIPT,
      settings: {
        summaryDepth: 'comprehensive',
        includeEmojis: true,
        includeChapters: true,
        includeKeyInsights: true,
        includeQuiz: true,
        includeTimestamps: true
      }
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    console.log('✅ SUCCESS! Full response:');
    console.log(JSON.stringify(data.data, null, 2));
    
    // Check for emojis
    console.log('\n🔍 EMOJI CHECK:');
    console.log('Main takeaway has emoji:', /[\u{1F300}-\u{1F9FF}]/u.test(data.data?.mainTakeaway || ''));
    console.log('Summary has emoji:', /[\u{1F300}-\u{1F9FF}]/u.test(data.data?.summary || ''));
    console.log('Key insights have emojis:', data.data?.keyInsights?.some(k => /[\u{1F300}-\u{1F9FF}]/u.test(k)));
    
    // Check what we want
    console.log('\n✅ WHAT YOU WANT:');
    console.log('1. Transcript extraction:', data.data?.contentSource === 'extension-transcript' ? '✅ WORKING' : '❌ NOT WORKING');
    console.log('2. In-depth summary:', data.data?.summary?.length > 100 ? '✅ YES' : '❌ NO');
    console.log('3. Key insights:', data.data?.keyInsights?.length > 0 ? '✅ YES' : '❌ NO');
    console.log('4. Quiz questions:', data.data?.quiz?.length > 0 ? '✅ YES' : '❌ NO');
    console.log('5. Timestamps:', data.data?.timestampedSections?.length > 0 ? '✅ YES' : '❌ NO');
    
  } else {
    console.log('❌ ERROR:', data.error);
  }
}

testDetailedResponse();