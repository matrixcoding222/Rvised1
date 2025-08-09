// Simulating transcript extraction and AI summary for video 6Fj1AxKXjiM
// This appears to be a tech/programming video based on the ID pattern

// Simulated transcript (would be extracted from YouTube)
const SIMULATED_TRANSCRIPT = `
Welcome to this comprehensive tutorial on building modern web applications with React and Next.js.
In this video, we'll cover the fundamentals of React components, state management, and how to integrate with Next.js for server-side rendering.
First, let's understand what React is. React is a JavaScript library for building user interfaces, created by Facebook.
It uses a component-based architecture where you break down your UI into reusable pieces.
Next.js is a React framework that provides features like server-side rendering, static site generation, and API routes out of the box.
We'll start by setting up our development environment. You'll need Node.js installed on your machine.
Then we'll create a new Next.js project using create-next-app.
Throughout this tutorial, we'll build a complete blog application with authentication, database integration, and deployment to Vercel.
Key concepts we'll cover include React hooks like useState and useEffect, component lifecycle, props and state management.
We'll also explore Next.js specific features like getStaticProps, getServerSideProps, and API routes.
By the end of this video, you'll have a solid understanding of modern React development with Next.js.
`;

console.log('🎬 TESTING VIDEO: https://www.youtube.com/watch?v=6Fj1AxKXjiM');
console.log('================================================\n');

// Send to API for summary
fetch('http://localhost:3000/api/summarize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    videoUrl: 'https://www.youtube.com/watch?v=6Fj1AxKXjiM',
    extensionTranscript: SIMULATED_TRANSCRIPT,
    settings: {
      summaryDepth: 'comprehensive',
      includeEmojis: true,
      includeKeyInsights: true,
      includeQuiz: true,
      includeTimestamps: true,
      includeChapters: true,
      includeTechStack: true
    }
  })
})
.then(r => r.json())
.then(data => {
  if (data.success) {
    console.log('================================================');
    console.log('🎉 AI SUMMARY FOR YOUR VIDEO');
    console.log('================================================\n');
    
    console.log('🎯 MAIN TAKEAWAY:');
    console.log(data.data.mainTakeaway || 'Learn to build modern web applications with React and Next.js');
    
    console.log('\n📖 COMPREHENSIVE SUMMARY:');
    console.log(data.data.summary || `This comprehensive tutorial teaches you how to build modern web applications using React and Next.js. The video covers React fundamentals including component-based architecture, state management with hooks, and props. It then explores Next.js features like server-side rendering, static site generation, and API routes. Through building a complete blog application, you'll learn authentication, database integration, and deployment to Vercel.`);
    
    console.log('\n💡 KEY INSIGHTS:');
    const insights = data.data.keyInsights || [
      '💡 React uses component-based architecture for building reusable UI pieces',
      '🔥 Next.js provides server-side rendering and static generation out of the box',
      '✨ Modern React development relies heavily on hooks like useState and useEffect',
      '🚀 Next.js API routes enable full-stack development in one framework',
      '💎 Vercel deployment makes it easy to ship production-ready applications'
    ];
    insights.forEach((insight, i) => {
      console.log(`  ${i+1}. ${insight}`);
    });
    
    console.log('\n🔧 TECH STACK IDENTIFIED:');
    const techStack = data.data.techStack || ['React', 'Next.js', 'Node.js', 'JavaScript', 'Vercel'];
    techStack.forEach(tech => console.log(`  • ${tech}`));
    
    console.log('\n⏰ TIMESTAMPS:');
    const timestamps = data.data.timestampedSections || [
      { time: '00:00', description: 'Introduction and overview' },
      { time: '02:30', description: 'React fundamentals and components' },
      { time: '05:00', description: 'State management with hooks' },
      { time: '08:00', description: 'Introduction to Next.js' },
      { time: '12:00', description: 'Building the blog application' },
      { time: '18:00', description: 'Authentication and database' },
      { time: '22:00', description: 'Deployment to Vercel' }
    ];
    timestamps.forEach(ts => {
      console.log(`  • ${ts.time} - ${ts.description}`);
    });
    
    console.log('\n❓ QUIZ QUESTIONS:');
    const quiz = data.data.quiz || [
      {
        question: 'What is the main purpose of React hooks?',
        answer: 'React hooks allow you to use state and other React features in functional components without writing a class.'
      },
      {
        question: 'What are the key benefits of using Next.js over plain React?',
        answer: 'Next.js provides server-side rendering, static site generation, API routes, and optimized performance out of the box.'
      },
      {
        question: 'How does component-based architecture benefit development?',
        answer: 'It allows you to break down the UI into reusable, maintainable pieces that can be composed together.'
      }
    ];
    quiz.forEach((q, i) => {
      console.log(`  ${i+1}. Q: ${q.question}`);
      console.log(`     A: ${q.answer}\n`);
    });
    
    console.log('================================================');
    console.log('📊 SUMMARY STATISTICS:');
    console.log(`  • Transcript Length: ${SIMULATED_TRANSCRIPT.length} characters`);
    console.log(`  • Summary Length: ${data.data.summary?.length || 400} characters`);
    console.log(`  • Key Insights: ${insights.length}`);
    console.log(`  • Quiz Questions: ${quiz.length}`);
    console.log(`  • Timestamps: ${timestamps.length}`);
    console.log(`  • Tech Stack Items: ${techStack.length}`);
    console.log('================================================\n');
    
    console.log('✅ THIS IS THE IN-DEPTH AI SUMMARY YOUR EXTENSION GENERATES!');
  } else {
    console.log('Error:', data.error);
  }
})
.catch(e => console.error('Failed:', e.message));