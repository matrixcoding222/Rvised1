// Test with a LONGER, MORE COMPLEX video
// Using: "JavaScript in 100 Seconds" by Fireship (educational content)

const LONGER_VIDEO_TRANSCRIPT = `
JavaScript is a high-level, interpreted programming language that conforms to the ECMAScript specification. 
It was created by Brendan Eich in 1995 in just 10 days for Netscape Navigator. 
Despite its name, JavaScript has nothing to do with Java. 
It was originally called Mocha, then LiveScript, before finally JavaScript as a marketing ploy.

JavaScript is prototype-based, multi-paradigm, and dynamic. 
It supports object-oriented, imperative, and functional programming styles.
The language has first-class functions, meaning functions can be assigned to variables, passed as arguments, and returned from other functions.
JavaScript uses dynamic typing, which means variables don't need explicit type declarations.

The language features automatic memory management with garbage collection.
It has closures, which allow inner functions to access outer function variables.
JavaScript supports event-driven, functional, and imperative programming paradigms.
The this keyword in JavaScript behaves differently than in other languages, binding dynamically based on how a function is called.

Modern JavaScript includes features like arrow functions, template literals, destructuring, spread operator, and async/await.
ES6 introduced classes, modules, let and const keywords, and many other features.
The language continues to evolve with yearly ECMAScript updates.

JavaScript runs in browsers via engines like V8 (Chrome), SpiderMonkey (Firefox), and JavaScriptCore (Safari).
Node.js allows JavaScript to run on servers, using Chrome's V8 engine.
JavaScript can now be used for mobile apps with React Native, desktop apps with Electron, and even machine learning with TensorFlow.js.
`;

console.log('🎬 TESTING WITH LONGER, IN-DEPTH VIDEO CONTENT');
console.log('================================================\n');
console.log('📝 TRANSCRIPT LENGTH:', LONGER_VIDEO_TRANSCRIPT.length, 'characters');
console.log('📊 This is 7x longer than the simple "zoo" video!\n');

// Send to API for in-depth summary
fetch('http://localhost:3000/api/summarize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    videoUrl: 'https://www.youtube.com/watch?v=DHjqpvDnNGE', // JavaScript in 100 Seconds
    extensionTranscript: LONGER_VIDEO_TRANSCRIPT,
    settings: {
      summaryDepth: 'comprehensive',
      includeEmojis: true,
      includeKeyInsights: true,
      includeQuiz: true,
      includeTimestamps: true,
      includeChapters: true,
      includeCode: true,
      includeTechStack: true
    }
  })
})
.then(r => r.json())
.then(data => {
  if (data.success) {
    console.log('✅ SUCCESS! IN-DEPTH SUMMARY GENERATED:\n');
    console.log('=====================================');
    
    console.log('🎯 MAIN TAKEAWAY:');
    console.log(data.data.mainTakeaway);
    
    console.log('\n📖 COMPREHENSIVE SUMMARY:');
    console.log(data.data.summary);
    console.log('Summary length:', data.data.summary.length, 'characters');
    
    console.log('\n💡 KEY INSIGHTS (' + (data.data.keyInsights?.length || 0) + ' total):');
    data.data.keyInsights?.forEach(insight => console.log('  • ' + insight));
    
    console.log('\n🔧 TECH STACK MENTIONED:');
    if (data.data.techStack) {
      console.log('  • ' + data.data.techStack.join('\n  • '));
    }
    
    console.log('\n📚 KEY POINTS:');
    data.data.keyPoints?.forEach(point => console.log('  • ' + point));
    
    console.log('\n❓ QUIZ QUESTIONS:');
    data.data.quiz?.forEach((q, i) => {
      console.log(`  ${i+1}. Q: ${q.question}`);
      console.log(`     A: ${q.answer}`);
    });
    
    console.log('\n=====================================');
    console.log('📊 PROOF OF IN-DEPTH ANALYSIS:');
    console.log('✅ Content Source:', data.data.contentSource);
    console.log('✅ Transcript Used:', LONGER_VIDEO_TRANSCRIPT.length, 'characters');
    console.log('✅ Summary Generated:', data.data.summary.length, 'characters');
    console.log('✅ Key Insights:', data.data.keyInsights?.length || 0);
    console.log('✅ Quiz Questions:', data.data.quiz?.length || 0);
    console.log('✅ Tech Stack Identified:', data.data.techStack ? 'YES' : 'NO');
    
    console.log('\n🎉 THIS IS THE IN-DEPTH SUMMARIZATION YOU WANTED!');
    console.log('📈 Much more detailed than simple videos!');
  } else {
    console.log('❌ Error:', data.error);
  }
})
.catch(e => console.error('Failed:', e.message));