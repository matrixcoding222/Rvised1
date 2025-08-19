// Test script for transcript capping functionality

async function testTranscriptCapping() {
  const API_URL = 'http://localhost:3002/api/summarize';
  
  // Test videos of different lengths
  const testCases = [
    {
      name: 'Short video (5 min)',
      videoId: 'dQw4w9WgXcQ', // Rick Astley - Never Gonna Give You Up
      tier: 'free'
    },
    {
      name: 'Medium video (30 min)',  
      videoId: 'Ks-_Mh1QhMc', // Your body language may shape who you are
      tier: 'free'
    },
    {
      name: 'Long video (1+ hour)',
      videoId: 'hBMoPUAeLnY', // Harvard CS50 lecture (publicly available)
      tier: 'free'
    },
    {
      name: 'Long video - Pro tier',
      videoId: 'hBMoPUAeLnY', // Same long video
      tier: 'pro'
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n🧪 Testing: ${testCase.name}`);
    console.log(`Video ID: ${testCase.videoId}`);
    console.log(`User Tier: ${testCase.tier}`);
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-tier': testCase.tier
        },
        body: JSON.stringify({
          videoUrl: `https://www.youtube.com/watch?v=${testCase.videoId}`,
          settings: {
            learningMode: 'student',
            summaryDepth: 'standard',
            includeTimestamps: true,
            includeQuiz: false,
            includeEmojis: false
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Summary generated successfully');
        console.log(`- Main takeaway: ${data.data.mainTakeaway?.substring(0, 100)}...`);
        console.log(`- Summary length: ${data.data.summary?.length} chars`);
        console.log(`- Partial summary: ${data.data.partialSummary || false}`);
        
        if (data.data.transcriptCapped) {
          console.log(`📊 Transcript was capped:`);
          console.log(`  - Original: ${data.data.transcriptCapped.original} chars`);
          console.log(`  - Capped to: ${data.data.transcriptCapped.capped} chars`);
          console.log(`  - Reduction: ${Math.round((1 - data.data.transcriptCapped.capped/data.data.transcriptCapped.original) * 100)}%`);
        }
        
        if (data.data.coverageInfo) {
          console.log(`📝 Coverage: ${data.data.coverageInfo}`);
        }
      } else {
        console.log(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.log(`❌ Request failed: ${error.message}`);
    }
  }
}

// Run the test
console.log('🚀 Starting transcript capping tests...');
console.log('=====================================');
testTranscriptCapping()
  .then(() => console.log('\n✅ All tests completed'))
  .catch(err => console.error('\n❌ Test failed:', err));