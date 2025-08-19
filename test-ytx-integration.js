// Test YTX integration with the API

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function testYTX() {
  console.log('🧪 Testing YTX transcript extraction...\n');
  
  const testVideos = [
    'https://www.youtube.com/watch?v=jNQXAC9IVRw', // First YouTube video ever
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Rick Roll (good test)
  ];
  
  for (const videoUrl of testVideos) {
    console.log(`\n📹 Testing video: ${videoUrl}`);
    console.log('=' .repeat(50));
    
    try {
      // Test Method 1: Direct Python execution
      console.log('\n🔧 Method 1: Direct Python execution');
      const cmd1 = `cd "C:\\Users\\User\\yt transcript" && python main.py "${videoUrl}" --format txt --clean --prefer-ytdlp`;
      
      const { stdout: stdout1, stderr: stderr1 } = await execAsync(cmd1, {
        timeout: 30000,
        maxBuffer: 1024 * 1024 * 10,
        shell: 'cmd'
      });
      
      if (stdout1 && stdout1.trim().length > 50) {
        console.log('✅ Success! Transcript length:', stdout1.trim().length, 'chars');
        console.log('📝 First 200 chars:', stdout1.trim().substring(0, 200) + '...');
      } else {
        console.log('❌ Failed - no transcript output');
        if (stderr1) console.log('Stderr:', stderr1);
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
    
    try {
      // Test Method 2: YTX if in PATH
      console.log('\n🔧 Method 2: YTX command');
      const cmd2 = `ytx "${videoUrl}" --format txt --clean --prefer-ytdlp`;
      
      const { stdout: stdout2, stderr: stderr2 } = await execAsync(cmd2, {
        timeout: 30000,
        maxBuffer: 1024 * 1024 * 10
      });
      
      if (stdout2 && stdout2.trim().length > 50) {
        console.log('✅ Success! Transcript length:', stdout2.trim().length, 'chars');
        console.log('📝 First 200 chars:', stdout2.trim().substring(0, 200) + '...');
      } else {
        console.log('❌ Failed - no transcript output');
        if (stderr2) console.log('Stderr:', stderr2);
      }
    } catch (error) {
      console.log('⚠️ YTX not in PATH or error:', error.message.substring(0, 100));
    }
  }
  
  console.log('\n\n🎯 Testing API integration with YTX...\n');
  
  // Test the API endpoint
  try {
    const response = await fetch('http://localhost:3003/api/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-tier': 'free'
      },
      body: JSON.stringify({
        videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
        settings: {
          learningMode: 'student',
          summaryDepth: 'quick',
          includeTimestamps: false,
          includeActionItems: true,
          includeQuiz: false,
          includeEmojis: false
        }
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        console.log('✅ API summarization successful!');
        console.log('📊 Summary:', data.data.summary?.substring(0, 200) + '...');
        console.log('🎯 Main takeaway:', data.data.mainTakeaway);
      } else {
        console.log('❌ API error:', data.error);
      }
    } else {
      console.log('❌ API response not OK:', response.status);
      const text = await response.text();
      console.log('Response:', text.substring(0, 500));
    }
  } catch (error) {
    console.log('❌ API test failed:', error.message);
    console.log('Make sure the Next.js server is running on port 3003');
  }
}

// Run the test
testYTX().then(() => {
  console.log('\n✅ Test complete!');
}).catch(err => {
  console.error('\n❌ Test failed:', err);
});