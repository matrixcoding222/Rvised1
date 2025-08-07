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
            <label><input type="checkbox" id="includeCode" checked> Code Snippets</label>
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
      includeCode: document.getElementById('includeCode').checked,
      includeQuiz: document.getElementById('includeQuiz').checked,
      includeTimestamps: document.getElementById('includeTimestamps').checked
    };
    
    // Try to extract transcript locally first
    console.log('🔍 Attempting to extract transcript locally...');
    const localTranscript = await extractTranscriptFromPage();
    
    // Send to our API
    const response = await fetch(`${API_BASE_URL}/api/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        videoUrl: window.location.href,
        settings: settings,
        extensionTranscript: localTranscript // Send locally extracted transcript
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

  if (data.timestampedSections && data.timestampedSections.length > 0) {
    html += `
      <div class="timestamped-sections">
        <h3>📍 Timestamped Sections</h3>
        <ul>
          ${data.timestampedSections.map(section => `<li><strong>[${section.time}]</strong> ${section.description}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  if (data.codeSnippets && data.codeSnippets.length > 0) {
    html += `
      <div class="code-snippets">
        <h3>💻 Code Snippets</h3>
        ${data.codeSnippets.map(snippet => `
          <div class="snippet">
            <div class="snippet-header">${snippet.language}: ${snippet.description}</div>
            <pre><code>${snippet.code}</code></pre>
          </div>
        `).join('')}
      </div>
    `;
  }

  if (data.quiz && data.quiz.length > 0) {
    html += `
      <div class="quiz-section">
        <h3>🧪 Test Your Knowledge</h3>
        ${data.quiz.map(q => `
          <div class="quiz-item">
            <p><strong>Q:</strong> ${q.question}</p>
            <p><em>A: ${q.answer}</em></p>
          </div>
        `).join('')}
      </div>
    `;
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