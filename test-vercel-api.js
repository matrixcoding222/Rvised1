// Test the DEPLOYED Vercel API
console.log('🚀 TESTING VERCEL DEPLOYMENT');
console.log('================================\n');

const VERCEL_URL = 'https://rvised-cnsj24on7-tysonso1122-2100s-projects.vercel.app';
const TEST_TRANSCRIPT = `
JavaScript is a high-level programming language created in 1995.
It supports multiple paradigms including object-oriented and functional programming.
Modern JavaScript includes ES6 features like arrow functions and async/await.
JavaScript runs in browsers and on servers with Node.js.
`;

console.log('📡 Testing Vercel API at:', VERCEL_URL);
console.log('📝 Using test transcript:', TEST_TRANSCRIPT.length, 'characters\n');

fetch(`${VERCEL_URL}/api/summarize`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    videoUrl: 'https://www.youtube.com/watch?v=test',
    extensionTranscript: TEST_TRANSCRIPT,
    settings: {
      summaryDepth: 'comprehensive',
      includeEmojis: true,
      includeKeyInsights: true,
      includeQuiz: true
    }
  })
})
.then(r => {
  console.log('Response status:', r.status);
  return r.json();
})
.then(data => {
  if (data.success) {
    console.log('✅ VERCEL API WORKING!\n');
    console.log('📖 Summary Generated:');
    console.log(data.data.summary);
    console.log('\n💡 Key Insights:');
    data.data.keyInsights?.forEach(k => console.log('  •', k));
    console.log('\n📊 Stats:');
    console.log('  • Content Source:', data.data.contentSource);
    console.log('  • Summary Length:', data.data.summary?.length, 'chars');
    console.log('  • Insights Count:', data.data.keyInsights?.length);
    console.log('\n🎉 VERCEL DEPLOYMENT CONFIRMED WORKING!');
  } else {
    console.log('❌ Error:', data.error);
  }
})
.catch(e => console.error('Failed:', e.message));