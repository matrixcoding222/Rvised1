import { YoutubeTranscript } from 'youtube-transcript';

async function test() {
  // TED talk - these always have professional captions
  const videoId = 'Ge7c7otG2mk';
  console.log(`Testing youtube-transcript library for video: ${videoId}`);
  
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    
    if (transcript && transcript.length > 0) {
      console.log('✅ SUCCESS! Got transcript with', transcript.length, 'segments');
      console.log('First segment:', transcript[0]);
      console.log('Sample text:', transcript.slice(0, 3).map(t => t.text).join(' '));
      
      // Full transcript text
      const fullText = transcript.map(t => t.text).join(' ');
      console.log('Total length:', fullText.length, 'characters');
    } else {
      console.log('❌ No transcript returned');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

test();