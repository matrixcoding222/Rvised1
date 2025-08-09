// Test the LIVE Vercel deployment
const VERCEL_URL = 'https://rvised-o8bgsehav-tysonso1122-2100s-projects.vercel.app';

console.log('🚀 Testing LIVE Vercel Deployment');
console.log('================================\n');
console.log('URL:', VERCEL_URL);

// Test 1: Health check
fetch(`${VERCEL_URL}/api/health`)
  .then(r => {
    console.log('Health check status:', r.status);
    return r.text();
  })
  .then(text => {
    console.log('Health response:', text);
  })
  .catch(e => console.log('Health check failed:', e.message));

// Test 2: Summarize API
const testTranscript = `
This is a test video about building apps.
We discuss monetization strategies and tools.
The 1-minute rule states apps solving problems quickly can charge $100/year.
`;

fetch(`${VERCEL_URL}/api/summarize`, {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Origin': 'chrome-extension://test' // Simulate extension origin
  },
  body: JSON.stringify({
    videoUrl: 'https://www.youtube.com/watch?v=test',
    extensionTranscript: testTranscript,
    settings: {
      summaryDepth: 'standard',
      includeEmojis: true,
      includeKeyInsights: true
    }
  })
})
.then(r => {
  console.log('\nSummarize API status:', r.status);
  console.log('Response headers:', Object.fromEntries(r.headers.entries()));
  return r.json();
})
.then(data => {
  if (data.success) {
    console.log('✅ API WORKING!');
    console.log('Summary preview:', data.data?.summary?.substring(0, 100) + '...');
  } else {
    console.log('❌ API Error:', data.error);
    if (data.error?.includes('API key')) {
      console.log('\n⚠️ SOLUTION: Add OPENAI_API_KEY to Vercel environment variables!');
      console.log('Go to: https://vercel.com/tysonso1122-2100s-projects/rvised/settings/environment-variables');
    }
  }
})
.catch(e => console.log('API call failed:', e.message));