// Test ALL features with a real transcript
const TEST_TRANSCRIPT = `All right, so here we are in front of the elephants. The cool thing about these guys is that they have really, really, really long trunks. And that's, that's cool. And that's pretty much all there is to say.`;

async function testAllFeatures() {
  console.log('🧪 TESTING ALL RVISED FEATURES');
  console.log('================================\n');
  
  const tests = [];
  
  // Test 1: Basic summary
  console.log('📝 Test 1: Basic Summary...');
  try {
    const response = await fetch('http://localhost:3000/api/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
        extensionTranscript: TEST_TRANSCRIPT,
        settings: {
          summaryDepth: 'concise',
          includeEmojis: false,
          includeChapters: false,
          includeKeyInsights: false,
          includeQuiz: false,
          includeTimestamps: false
        }
      })
    });
    
    const data = await response.json();
    tests.push({
      name: 'Basic Summary',
      pass: data.success && data.data?.summary?.length > 50,
      details: `Generated ${data.data?.summary?.length || 0} char summary`
    });
  } catch (e) {
    tests.push({ name: 'Basic Summary', pass: false, details: e.message });
  }
  
  // Test 2: Full features
  console.log('📝 Test 2: All Features Enabled...');
  try {
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
      const features = {
        'Content Source': data.data?.contentSource === 'extension-transcript',
        'Summary Generated': data.data?.summary?.length > 100,
        'Has Emojis': data.data?.summary?.includes('🎯') || data.data?.summary?.includes('📝'),
        'Key Insights': data.data?.keyInsights?.length > 0,
        'Chapters': data.data?.chapters?.length > 0,
        'Quiz Questions': data.data?.quiz?.length > 0,
        'Timestamps': data.data?.timestampedSections?.length > 0
      };
      
      Object.entries(features).forEach(([name, pass]) => {
        tests.push({ name, pass, details: pass ? '✓' : '✗' });
      });
      
      console.log('\n📊 Response details:');
      console.log('- Content source:', data.data?.contentSource);
      console.log('- Summary length:', data.data?.summary?.length);
      console.log('- Key insights:', data.data?.keyInsights?.length || 0);
      console.log('- Chapters:', data.data?.chapters?.length || 0);
      console.log('- Quiz questions:', data.data?.quiz?.length || 0);
      console.log('- Timestamps:', data.data?.timestampedSections?.length || 0);
    }
  } catch (e) {
    tests.push({ name: 'Full Features', pass: false, details: e.message });
  }
  
  // Test 3: Fallback (no transcript)
  console.log('\n📝 Test 3: Fallback Mode (no transcript)...');
  try {
    const response = await fetch('http://localhost:3000/api/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
        settings: { summaryDepth: 'standard' }
      })
    });
    
    const data = await response.json();
    tests.push({
      name: 'Fallback Mode',
      pass: data.success && data.data?.contentSource === 'title-description',
      details: `Using: ${data.data?.contentSource}`
    });
  } catch (e) {
    tests.push({ name: 'Fallback Mode', pass: false, details: e.message });
  }
  
  // Results
  console.log('\n================================');
  console.log('📊 TEST RESULTS:');
  console.log('================================');
  
  tests.forEach(test => {
    const icon = test.pass ? '✅' : '❌';
    console.log(`${icon} ${test.name}: ${test.details}`);
  });
  
  const passed = tests.filter(t => t.pass).length;
  const total = tests.length;
  const allPass = passed === total;
  
  console.log('\n================================');
  if (allPass) {
    console.log('🎉 ALL TESTS PASSED! (' + passed + '/' + total + ')');
    console.log('✨ READY FOR DEPLOYMENT!');
  } else {
    console.log('⚠️ SOME TESTS FAILED (' + passed + '/' + total + ')');
    console.log('Please fix issues before deploying');
  }
  
  return { passed, total, tests };
}

// Run the tests
testAllFeatures().then(results => {
  console.log('\n💾 Test results saved to window.testResults');
  window.testResults = results;
});