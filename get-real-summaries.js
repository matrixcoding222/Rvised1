// Script to get real summaries from the API for the demo
const https = require('https');
const http = require('http');

const videoId = 'HfdLLl1Odjk';
const apiBase = 'http://localhost:3000';

function makeRequest(mode) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            videoId: videoId,
            videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
            learningMode: mode,
            summaryDepth: 'standard',
            includeTimestamps: true,
            includeEmojis: true,
            generateQuiz: true
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
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(new Error('Invalid JSON response'));
                    }
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${data.substring(0, 200)}`));
                }
            });
        });
        
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

async function getSummaries() {
    const modes = ['student', 'build', 'deep'];
    const allSummaries = {};
    
    for (const mode of modes) {
        console.log(`\nGetting summary for ${mode} mode...`);
        
        try {
            const data = await makeRequest(mode);
            allSummaries[mode] = data;
            console.log(`✅ Got ${mode} summary`);
            
            // Print key parts
            if (data.mainTakeaway) {
                console.log(`Main Takeaway: ${data.mainTakeaway.substring(0, 100)}...`);
            }
            if (data.keyInsights) {
                console.log(`Key Insights: ${data.keyInsights.length} items`);
            }
            if (data.quiz) {
                console.log(`Quiz: ${data.quiz.length} questions`);
            }
        } catch (error) {
            console.error(`❌ Error getting ${mode} summary:`, error.message);
        }
    }
    
    // Save to file for easy copying
    const fs = require('fs');
    fs.writeFileSync('demo-summaries.json', JSON.stringify(allSummaries, null, 2));
    console.log('\n📁 Summaries saved to demo-summaries.json');
    
    return allSummaries;
}

// Run it
getSummaries().then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
}).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});