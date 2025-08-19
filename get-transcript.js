// Get just the transcript
const http = require('http');
const fs = require('fs');

const videoId = 'HfdLLl1Odjk';

// Use the summarize endpoint to get transcript
function getTranscript() {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            videoId: videoId,
            videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
            learningMode: 'student',
            summaryDepth: 'quick',
            includeTimestamps: false,
            includeEmojis: false,
            generateQuiz: false,
            includeTranscript: true
        });
        
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/summarize',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        const parsed = JSON.parse(data);
                        // Extract transcript from response
                        const transcript = parsed.data?.transcript || 
                                         parsed.transcript || 
                                         parsed.data?.rawTranscript ||
                                         '';
                        resolve(transcript);
                    } catch (e) {
                        reject(new Error('Invalid JSON response'));
                    }
                } else {
                    reject(new Error(`HTTP ${res.statusCode}`));
                }
            });
        });
        
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

async function main() {
    console.log('Getting transcript for video:', videoId);
    
    try {
        const transcript = await getTranscript();
        
        if (transcript) {
            console.log(`✅ Got transcript (${transcript.length} characters)`);
            console.log('\nFirst 500 characters:');
            console.log(transcript.substring(0, 500));
            
            // Save to file
            fs.writeFileSync('video-transcript.txt', transcript);
            console.log('\n📁 Full transcript saved to video-transcript.txt');
        } else {
            console.log('❌ No transcript found in response');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

main();