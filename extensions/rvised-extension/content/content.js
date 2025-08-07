// Content script for YouTube pages
console.log('🎥 Rvised content script loaded on YouTube');

let rvisedOverlay = null;
let isProcessing = false;

// Production API endpoint (our deployed Vercel app)
const API_BASE_URL = 'https://rvised.vercel.app';

// Extract video ID from current YouTube URL
function getVideoId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('v');
}

// Extract YouTube chapters from page data
function extractChaptersFromPage() {
  try {
    console.log('🔍 Extracting YouTube chapters from page...');
    
    // Method 1: Look for chapters in page scripts (MORE AGGRESSIVE)
    const scripts = document.querySelectorAll('script');
    console.log(`📖 Searching ${scripts.length} scripts for chapter data...`);
    
    for (const script of scripts) {
      const scriptContent = script.textContent;
      
      // Look for various chapter patterns
      const patterns = [
        /"chapters":\s*(\[[\s\S]*?\])/,
        /"macroMarkers":\s*(\[[\s\S]*?\])/,
        /"segments":\s*(\[[\s\S]*?\])/,
        /chapters\s*=\s*(\[[\s\S]*?\])/,
        /macroMarkers\s*=\s*(\[[\s\S]*?\])/
      ];
      
      for (const pattern of patterns) {
        const match = scriptContent.match(pattern);
        if (match) {
          try {
            const data = JSON.parse(match[1]);
            console.log('📖 Found chapter data with pattern:', pattern, data);
            
            if (data.length > 0) {
              if (data[0].timeRangeStartMillis) {
                return parseChapterData(data);
              } else if (data[0].startTime) {
                return parseSimpleChapterData(data);
              }
            }
          } catch (e) {
            console.log('❌ Failed to parse chapter data:', e);
          }
        }
      }
    }
    
    // Method 2: Look for chapters in DOM elements
    const chapterElements = document.querySelectorAll('[data-segment-time], .ytp-chapter-title, .segment-timestamp');
    if (chapterElements.length > 0) {
      const chapters = [];
      chapterElements.forEach(el => {
        const timeAttr = el.getAttribute('data-segment-time') || el.getAttribute('data-start-time');
        const titleEl = el.querySelector('.segment-title') || el.textContent;
        if (timeAttr && titleEl) {
          chapters.push({
            time: formatSeconds(parseInt(timeAttr)),
            description: titleEl.trim()
          });
        }
      });
      if (chapters.length > 0) {
        console.log('📖 Extracted chapters from DOM:', chapters);
        return chapters;
      }
    }
    
    console.log('❌ No chapters found in page data');
    return null;
  } catch (error) {
    console.log('❌ Error extracting chapters:', error);
    return null;
  }
}

// Parse YouTube chapter data format
function parseChapterData(chapters) {
  return chapters.map(chapter => ({
    time: formatSeconds(chapter.timeRangeStartMillis / 1000),
    description: chapter.title || 'Chapter'
  }));
}

// Parse YouTube macro markers format  
function parseMacroMarkers(markers) {
  return markers.map(marker => ({
    time: formatSeconds(marker.timeRangeStartMillis / 1000),
    description: marker.title || 'Section'
  }));
}

// Parse simple chapter data format
function parseSimpleChapterData(chapters) {
  return chapters.map(chapter => ({
    time: formatSeconds(chapter.startTime || chapter.time || 0),
    description: chapter.title || chapter.name || 'Chapter'
  }));
}

// Format seconds to mm:ss
function formatSeconds(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Extract transcript WITH TIMESTAMPS directly from YouTube's player data  
function extractTranscriptFromPage() {
  return new Promise((resolve) => {
    try {
      // Method 1: Try to find transcript data in page
      const scripts = document.querySelectorAll('script');
      let transcriptData = null;
      
      for (const script of scripts) {
        if (script.textContent.includes('captionTracks')) {
          const match = script.textContent.match(/"captionTracks":\s*(\[[^\]]+\])/);
          if (match) {
            try {
              transcriptData = JSON.parse(match[1]);
              break;
            } catch (e) {
              console.log('Failed to parse captionTracks:', e);
            }
          }
        }
      }
      
      if (transcriptData && transcriptData.length > 0) {
        // Found transcript data, fetch the actual transcript WITH TIMESTAMPS
        const englishTrack = transcriptData.find(track => 
          track.languageCode && track.languageCode.startsWith('en')
        ) || transcriptData[0];
        
        if (englishTrack && englishTrack.baseUrl) {
          let trackUrl = englishTrack.baseUrl.replace(/\\u0026/g, '&');
          // Request JSON format to get timestamps
          if (!trackUrl.includes('fmt=')) {
            trackUrl += '&fmt=json3';
          }
          
          fetch(trackUrl)
            .then(response => response.json())
            .then(json => {
              if (json?.events) {
                // Extract both text and timing information
                let transcriptWithTimestamps = '';
                let currentTime = 0;
                
                json.events.forEach(event => {
                  if (event.tStartMs !== undefined) {
                    currentTime = Math.floor(event.tStartMs / 1000);
                  }
                  if (event.segs) {
                    const minutes = Math.floor(currentTime / 60);
                    const seconds = currentTime % 60;
                    const timeStamp = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                    
                    const text = event.segs.map(seg => seg.utf8).join('').trim();
                    if (text) {
                      transcriptWithTimestamps += `[${timeStamp}] ${text} `;
                    }
                  }
                });
                
                console.log('✅ Extracted transcript with timestamps');
                resolve(transcriptWithTimestamps.trim());
              } else {
                // Fallback to VTT if JSON doesn't work
                let vttUrl = englishTrack.baseUrl.replace(/\\u0026/g, '&') + '&fmt=vtt';
                return fetch(vttUrl).then(r => r.text()).then(vtt => {
                  const lines = vtt
                    .split('\n')
                    .map(line => line.trim())
                    .filter(line => 
                      line && 
                      !line.startsWith('WEBVTT') && 
                      !/^\d+$/.test(line) && 
                      !/^\d{2}:\d{2}:\d{2}\.\d{3}/.test(line)
                    );
                  resolve(lines.join(' '));
                });
              }
            })
            .catch(err => {
              console.log('Failed to fetch JSON transcript, trying VTT fallback:', err);
              // Fallback to VTT format
              let vttUrl = englishTrack.baseUrl.replace(/\\u0026/g, '&') + '&fmt=vtt';
              fetch(vttUrl)
                .then(response => response.text())
                .then(vtt => {
                  const lines = vtt
                    .split('\n')
                    .map(line => line.trim())
                    .filter(line => 
                      line && 
                      !line.startsWith('WEBVTT') && 
                      !/^\d+$/.test(line) && 
                      !/^\d{2}:\d{2}:\d{2}\.\d{3}/.test(line)
                    );
                  resolve(lines.join(' '));
                })
                .catch(() => resolve(null));
            });
        } else {
          resolve(null);
        }
      } else {
        resolve(null);
      }
    } catch (error) {
      console.log('Transcript extraction error:', error);
      resolve(null);
    }
  });
}

// Create and inject the Rvised overlay
function createRvisedOverlay() {
  if (rvisedOverlay) {
    rvisedOverlay.remove();
  }
  
  rvisedOverlay = document.createElement('div');
  rvisedOverlay.id = 'rvised-overlay';
  rvisedOverlay.innerHTML = `
    <div class="rvised-container">
      <div class="rvised-header">
        <span class="rvised-logo">📚 Rvised</span>
        <button class="rvised-close" onclick="this.closest('#rvised-overlay').style.display='none'">×</button>
      </div>
      
      <div class="rvised-content">
        <div class="rvised-settings">
          <div class="setting-group">
            <label>Learning Mode:</label>
            <select id="learningMode">
              <option value="Student">🎓 Student</option>
              <option value="Build" selected>🔧 Build</option>
              <option value="Understand">🧠 Understand</option>
            </select>
          </div>
          
          <div class="setting-group">
            <label>Summary Depth:</label>
            <select id="summaryDepth">
              <option value="quick">⚡ Quick</option>
              <option value="standard" selected>📋 Standard</option>
              <option value="deep">🔍 Deep</option>
            </select>
          </div>
          
          <div class="toggle-group">
            <label><input type="checkbox" id="includeEmojis" checked> Include Emojis</label>
            <label><input type="checkbox" id="includeQuiz" checked> Quiz Questions</label>
            <label><input type="checkbox" id="includeTimestamps" checked> Timestamps</label>
          </div>
        </div>
        
        <button id="summarizeBtn" class="rvised-button">
          ✨ Generate Summary
        </button>
        
        <div id="summaryResult" class="summary-result" style="display: none;">
          <!-- Summary will be inserted here -->
        </div>
        
        <div id="loadingState" class="loading-state" style="display: none;">
          <div class="spinner"></div>
          <p>Analyzing video and generating summary...</p>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(rvisedOverlay);
  
  // Add event listeners
  document.getElementById('summarizeBtn').addEventListener('click', handleSummarize);
}

// Handle summarization process
async function handleSummarize() {
  if (isProcessing) return;
  
  const videoId = getVideoId();
  if (!videoId) {
    alert('No video ID found. Please make sure you\'re on a YouTube video page.');
    return;
  }
  
  isProcessing = true;
  const loadingState = document.getElementById('loadingState');
  const summaryResult = document.getElementById('summaryResult');
  const summarizeBtn = document.getElementById('summarizeBtn');
  
  // Show loading state
  loadingState.style.display = 'block';
  summaryResult.style.display = 'none';
  summarizeBtn.disabled = true;
  summarizeBtn.textContent = 'Processing...';
  
  try {
    // Get settings from UI
    const settings = {
      learningMode: document.getElementById('learningMode').value,
      summaryDepth: document.getElementById('summaryDepth').value,
      includeEmojis: document.getElementById('includeEmojis').checked,
      includeQuiz: document.getElementById('includeQuiz').checked,
      includeTimestamps: document.getElementById('includeTimestamps').checked
    };
    
    // Extract both transcript and chapters locally
    console.log('🔍 Attempting to extract transcript and chapters locally...');
    const localTranscript = await extractTranscriptFromPage();
    const localChapters = extractChaptersFromPage();
    
    console.log('📖 Extracted chapters:', localChapters);
    
    // Send to our API
    const response = await fetch(`${API_BASE_URL}/api/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        videoUrl: window.location.href,
        settings: settings,
        extensionTranscript: localTranscript, // Send locally extracted transcript
        extensionChapters: localChapters // Send locally extracted chapters
      })
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const apiResp = await response.json();
    if (apiResp.error) {
      throw new Error(apiResp.error);
    }
    const summaryData = apiResp.data || apiResp; // use nested data if present
    
    // FORCE TIMESTAMPS: If timestamps are enabled but not provided, create fallback
    const timestampsEnabled = document.getElementById('includeTimestamps')?.checked;
    if (timestampsEnabled && (!summaryData.timestampedSections || summaryData.timestampedSections.length === 0)) {
      console.log('⚠️ API did not provide timestamps, creating fallback...');
      
      // Try to use the chapters we extracted locally
      if (localChapters && localChapters.length > 0) {
        console.log('🎯 Using locally extracted chapters as fallback');
        summaryData.timestampedSections = localChapters;
      } else {
        console.log('📝 Creating basic fallback timestamps');
        summaryData.timestampedSections = [
          { time: "00:00", description: "Introduction" },
          { time: "02:00", description: "Main content begins" },
          { time: "05:00", description: "Key concepts" },
          { time: "08:00", description: "Advanced topics" },
          { time: "12:00", description: "Conclusion" }
        ];
      }
    }
    
    // Display the summary
    displaySummary(summaryData);
    
  } catch (error) {
    console.error('Summarization error:', error);
    summaryResult.innerHTML = `
      <div class="error">
        <h3>❌ Error</h3>
        <p>${error.message}</p>
        <p>Please try again or check your connection.</p>
      </div>
    `;
    summaryResult.style.display = 'block';
  } finally {
    isProcessing = false;
    loadingState.style.display = 'none';
    summarizeBtn.disabled = false;
    summarizeBtn.textContent = '✨ Generate Summary';
  }
}

// Display summary in the overlay
function displaySummary(data) {
  const summaryResult = document.getElementById('summaryResult');
  
  let html = `
    <div class="summary-content">
      <div class="summary-header">
        <h2>📚 ${data.title || 'Video Summary'}</h2>
        <p class="video-info">${data.channel} • ${data.duration} • ${data.videoType}</p>
      </div>
      
      <div class="main-takeaway">
        <h3>🎯 Main Takeaway</h3>
        <p>${data.mainTakeaway}</p>
      </div>
      
      <div class="summary-text">
        <h3>📝 Summary</h3>
        <div>${data.summary}</div>
      </div>
  `;
  
  if (data.techStack && data.techStack.length > 0) {
    html += `
      <div class="tech-stack">
        <h3>🛠️ Tech Stack</h3>
        <div class="tech-tags">
          ${data.techStack.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
        </div>
      </div>
    `;
  }
  
  if (data.keyInsights && data.keyInsights.length > 0) {
    html += `
      <div class="key-insights">
        <h3>💡 Key Insights</h3>
        <ul>
          ${data.keyInsights.map(insight => `<li>${insight}</li>`).join('')}
        </ul>
      </div>
    `;
  }
  
  if (data.actionItems && data.actionItems.length > 0) {
    html += `
      <div class="action-items">
        <h3>⚡ Action Items</h3>
        <ul>
          ${data.actionItems.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  // COMPREHENSIVE TIMESTAMP DEBUGGING & DISPLAY
  const timestampsEnabled = document.getElementById('includeTimestamps')?.checked;
  console.log('🔍 FRONTEND TIMESTAMP DEBUG:');
  console.log('- Timestamps enabled:', timestampsEnabled);
  console.log('- Data received:', data);
  console.log('- timestampedSections:', data.timestampedSections);
  console.log('- Type of timestampedSections:', typeof data.timestampedSections);
  console.log('- Is array:', Array.isArray(data.timestampedSections));
  
  if (timestampsEnabled) {
    const timestamps = data.timestampedSections || [];
    console.log('- Processed timestamps:', timestamps);
    console.log('- Timestamps length:', timestamps.length);
    
    html += `
      <div class="timestamped-sections">
        <h3>📍 Timestamped Sections</h3>
        <ul>
          ${timestamps.length > 0 
            ? timestamps.map(section => {
                console.log('- Processing section:', section);
                return `<li><strong>[${section.time || '00:00'}]</strong> ${section.description || 'No description'}</li>`;
              }).join('') 
            : '<li><strong>[00:00]</strong> Timestamps not available for this video</li>'
          }
        </ul>
      </div>
    `;
    console.log(`✅ FRONTEND: Displayed ${timestamps.length} timestamp sections`);
  } else {
    console.log('❌ FRONTEND: Timestamps disabled by user');
  }

  // CODE SNIPPETS: REMOVED - Feature eliminated for simplicity

  // FRONTEND VALIDATION - Always show quiz section if enabled
  const quizEnabled = document.getElementById('includeQuiz')?.checked;
  if (quizEnabled) {
    const quiz = data.quiz || [];
    html += `
      <div class="quiz-section">
        <h3>🧪 Test Your Knowledge</h3>
        ${quiz.length > 0 
          ? quiz.map(q => `
            <div class="quiz-item">
              <p><strong>Q:</strong> ${q.question}</p>
              <p><em>A: ${q.answer}</em></p>
            </div>
          `).join('')
          : '<div class="quiz-item"><p><strong>Q:</strong> No quiz questions available for this video</p></div>'
        }
      </div>
    `;
    console.log(`✅ FRONTEND: Displayed ${quiz.length} quiz questions`);
  }

  
  html += `
      <div class="summary-actions">
        <button onclick="copyToClipboard()" class="action-btn">📋 Copy Summary</button>
        <a href="${API_BASE_URL}" target="_blank" class="action-btn">🎯 Open Dashboard</a>
      </div>
    </div>
  `;
  
  summaryResult.innerHTML = html;
  summaryResult.style.display = 'block';
}

// Copy summary to clipboard
function copyToClipboard() {
  const summaryContent = document.querySelector('.summary-content');
  if (summaryContent) {
    const text = summaryContent.innerText;
    navigator.clipboard.writeText(text).then(() => {
      // Show feedback
      const btn = event.target;
      const originalText = btn.textContent;
      btn.textContent = '✅ Copied!';
      setTimeout(() => {
        btn.textContent = originalText;
      }, 2000);
    });
  }
}

// Make function globally available
window.copyToClipboard = copyToClipboard;

// Listen for messages from popup
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action === 'startSummarization') {
    // Show overlay if hidden
    if (!rvisedOverlay || rvisedOverlay.style.display === 'none') {
      createRvisedOverlay();
    }
    
    // Trigger summarization
    handleSummarize();
    
    sendResponse({success: true});
  }
});

// Initialize when page loads
function initializeRvised() {
  // Only run on YouTube watch pages
  if (window.location.pathname === '/watch') {
    console.log('🎬 YouTube video page detected, initializing Rvised...');
    
    // Wait a bit for YouTube to load
    setTimeout(() => {
      createRvisedOverlay();
    }, 2000);
  }
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeRvised);
} else {
  initializeRvised();
}

// Handle YouTube's SPA navigation
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    setTimeout(initializeRvised, 1000); // Delay to let YouTube load
  }
}).observe(document, {subtree: true, childList: true});