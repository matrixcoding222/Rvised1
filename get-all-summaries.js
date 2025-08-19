// Script to get ALL summary variations and transcript from the API
const http = require('http');
const fs = require('fs');

const videoId = 'HfdLLl1Odjk';

function makeRequest(mode, depth) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            videoId: videoId,
            videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
            learningMode: mode,
            summaryDepth: depth,
            includeTimestamps: true,
            includeEmojis: true,
            generateQuiz: true,
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

// Get just the transcript
function getTranscript() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: `/api/transcript?videoId=${videoId}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
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
        req.end();
    });
}

async function getAllSummaries() {
    const modes = ['student', 'build', 'deep'];
    const depths = ['quick', 'standard', 'detailed'];
    const allSummaries = {};
    
    // First get the transcript
    console.log('Getting transcript...');
    let transcript = '';
    try {
        const transcriptData = await getTranscript();
        transcript = transcriptData.transcript || transcriptData.data?.transcript || '';
        console.log(`✅ Got transcript (${transcript.length} characters)`);
    } catch (error) {
        console.error('❌ Error getting transcript:', error.message);
    }
    
    // Get all combinations of modes and depths
    for (const mode of modes) {
        allSummaries[mode] = {};
        
        for (const depth of depths) {
            console.log(`\nGetting ${mode} mode with ${depth} depth...`);
            
            try {
                const data = await makeRequest(mode, depth);
                allSummaries[mode][depth] = data;
                console.log(`✅ Got ${mode}/${depth} summary`);
                
                // Add transcript to each if not already there
                if (data.data && !data.data.transcript && transcript) {
                    data.data.transcript = transcript;
                }
                
                // Print key info
                if (data.data) {
                    if (data.data.mainTakeaway) {
                        console.log(`  Main: ${data.data.mainTakeaway.substring(0, 80)}...`);
                    }
                    if (data.data.keyInsights) {
                        console.log(`  Insights: ${data.data.keyInsights.length} items`);
                    }
                    if (data.data.quiz) {
                        console.log(`  Quiz: ${data.data.quiz.length} questions`);
                    }
                }
            } catch (error) {
                console.error(`❌ Error getting ${mode}/${depth}:`, error.message);
            }
            
            // Small delay to avoid overwhelming the API
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
    
    // Add the full transcript to the result
    allSummaries.fullTranscript = transcript;
    
    // Save to file
    fs.writeFileSync('all-summaries.json', JSON.stringify(allSummaries, null, 2));
    console.log('\n📁 All summaries saved to all-summaries.json');
    
    // Also save a smaller version for easier reading
    const simplified = {};
    for (const mode of modes) {
        simplified[mode] = {};
        for (const depth of depths) {
            if (allSummaries[mode][depth]?.data) {
                const data = allSummaries[mode][depth].data;
                simplified[mode][depth] = {
                    mainTakeaway: data.mainTakeaway || '',
                    keyInsightsCount: data.keyInsights?.length || 0,
                    actionItemsCount: data.actionItems?.length || 0,
                    timestampsCount: data.timestampedSections?.length || 0,
                    quizCount: data.quiz?.length || 0,
                    hasTranscript: !!data.transcript
                };
            }
        }
    }
    simplified.transcriptLength = transcript.length;
    
    fs.writeFileSync('summaries-overview.json', JSON.stringify(simplified, null, 2));
    console.log('📊 Overview saved to summaries-overview.json');
    
    return allSummaries;
}

// Run it
getAllSummaries().then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
}).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});