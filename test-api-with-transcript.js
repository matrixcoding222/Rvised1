// Test the API with a real transcript
// Run this after extracting transcript from YouTube

async function testAPIWithTranscript() {
  // This is a real transcript from "Me at the zoo" video
  const testTranscript = `All right, so here we are in front of the elephants. The cool thing about these guys is that they have really, really, really long trunks. And that's, that's cool. And that's pretty much all there is to say.`;
  
  console.log('Testing API with real transcript...');
  console.log('Transcript length:', testTranscript.length, 'characters');
  
  try {
    const response = await fetch('http://localhost:3000/api/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
        extensionTranscript: testTranscript,
        settings: {
          summaryDepth: 'comprehensive',
          includeEmojis: true,
          includeChapters: true,
          includeKeyInsights: true
        }
      })
    });
    
    const data = await response.json();
    console.log('\n📊 API Response:');
    console.log('Success:', data.success);
    console.log('Content Source:', data.data?.contentSource);
    console.log('Video Title:', data.data?.videoTitle);
    console.log('Summary Preview:', data.data?.summary?.substring(0, 200) + '...');
    console.log('Key Insights:', data.data?.keyInsights?.length || 0, 'items');
    console.log('Chapters:', data.data?.chapters?.length || 0, 'items');
    
    if (data.data?.contentSource === 'extension-transcript' || data.data?.contentSource === 'transcript') {
      console.log('\n✅ SUCCESS! API is using actual transcript from extension!');
      console.log('Content source:', data.data?.contentSource);
    } else {
      console.log('\n❌ FAILURE! API is using fallback:', data.data?.contentSource);
    }
    
    return data;
  } catch (error) {
    console.error('❌ API Error:', error);
  }
}

// For Node.js
if (typeof module !== 'undefined' && module.exports) {
  testAPIWithTranscript();
}

// For browser console
if (typeof window !== 'undefined') {
  window.testAPIWithTranscript = testAPIWithTranscript;
}