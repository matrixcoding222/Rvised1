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

// AGGRESSIVE YouTube chapter extraction - NO FALLBACKS, ONLY REAL DATA
function extractChaptersFromPage() {
  try {
    console.log('🔍 AGGRESSIVE YouTube chapter extraction starting...');
    
    // METHOD 1: Direct DOM scraping from video player
    console.log('📍 Method 1: Scraping video player DOM...');
    const videoPlayer = document.querySelector('#movie_player');
    if (videoPlayer) {
      // Look for chapter elements in the player
      const chapterElements = videoPlayer.querySelectorAll('[data-segment-time], .ytp-chapter-title, .segment-timestamp, .ytp-chapter');
      console.log(`📍 Found ${chapterElements.length} chapter elements in player`);
      
      if (chapterElements.length > 0) {
        const chapters = [];
        chapterElements.forEach((el, index) => {
          const timeAttr = el.getAttribute('data-segment-time') || 
                          el.getAttribute('data-start-time') || 
                          el.getAttribute('data-time');
          const titleEl = el.querySelector('.segment-title') || 
                         el.querySelector('.ytp-chapter-title') || 
                         el.textContent;
          
          if (timeAttr && titleEl) {
            const time = formatSeconds(parseInt(timeAttr));
            const description = titleEl.trim();
            chapters.push({ time, description });
            console.log(`📍 Chapter ${index + 1}: ${time} - ${description}`);
          }
        });
        
        if (chapters.length > 0) {
          console.log('✅ SUCCESS: Extracted chapters from video player DOM');
          return chapters;
        }
      }
    }
    
    // METHOD 2: Scrape from YouTube's internal data structures
    console.log('📍 Method 2: Scraping internal YouTube data...');
    const scripts = document.querySelectorAll('script');
    console.log(`📖 Searching ${scripts.length} scripts for chapter data...`);
    
    for (const script of scripts) {
      const scriptContent = script.textContent;
      
      // Look for various chapter patterns in YouTube's data
      const patterns = [
        /"chapters":\s*(\[[\s\S]*?\])/,
        /"macroMarkers":\s*(\[[\s\S]*?\])/,
        /"segments":\s*(\[[\s\S]*?\])/,
        /chapters\s*=\s*(\[[\s\S]*?\])/,
        /macroMarkers\s*=\s*(\[[\s\S]*?\])/,
        /"markers":\s*(\[[\s\S]*?\])/,
        /"timeline":\s*(\[[\s\S]*?\])/
      ];
      
      for (const pattern of patterns) {
        const match = scriptContent.match(pattern);
        if (match) {
          try {
            const data = JSON.parse(match[1]);
            console.log('📖 Found chapter data with pattern:', pattern, data);
            
            if (data.length > 0) {
              if (data[0].timeRangeStartMillis) {
                const chapters = parseChapterData(data);
                console.log('✅ SUCCESS: Parsed chapters from timeRangeStartMillis format');
                return chapters;
              } else if (data[0].startTime) {
                const chapters = parseSimpleChapterData(data);
                console.log('✅ SUCCESS: Parsed chapters from startTime format');
                return chapters;
              } else if (data[0].time) {
                const chapters = parseTimeFormatData(data);
                console.log('✅ SUCCESS: Parsed chapters from time format');
                return chapters;
              }
            }
          } catch (e) {
            console.log('❌ Failed to parse chapter data:', e);
          }
        }
      }
    }
    
    // METHOD 3: Look for chapter data in window object
    console.log('📍 Method 3: Checking window object for chapter data...');
    if (window.ytInitialData) {
      try {
        const data = window.ytInitialData;
        console.log('📖 Found ytInitialData:', data);
        
        // Navigate through the data structure to find chapters
        const playerResponse = data?.contents?.twoColumnWatchNextResults?.results?.results?.contents?.[0]?.videoPrimaryInfoRenderer;
        if (playerResponse) {
          console.log('📖 Found player response data');
          // Look for chapters in various locations
          const chapters = extractChaptersFromPlayerResponse(playerResponse);
          if (chapters && chapters.length > 0) {
            console.log('✅ SUCCESS: Extracted chapters from ytInitialData');
            return chapters;
          }
        }
      } catch (e) {
        console.log('❌ Error accessing ytInitialData:', e);
      }
    }
    
    // METHOD 4: Look for chapters in video description
    console.log('📍 Method 4: Scraping video description for timestamps...');
    const descriptionElement = document.querySelector('#description-inline-expander #description');
    if (descriptionElement) {
      const descriptionText = descriptionElement.textContent;
      console.log('📖 Found video description');
      
      const chapters = extractChaptersFromDescription(descriptionText);
      if (chapters && chapters.length > 0) {
        console.log('✅ SUCCESS: Extracted chapters from video description');
        return chapters;
      }
    }
    
    console.log('❌ NO CHAPTERS FOUND: All extraction methods failed');
    return null;
    
  } catch (error) {
    console.log('❌ Error in chapter extraction:', error);
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

// Parse time format data
function parseTimeFormatData(chapters) {
  return chapters.map(chapter => ({
    time: formatSeconds(chapter.time || 0),
    description: chapter.title || chapter.description || 'Chapter'
  }));
}

// Extract chapters from player response data
function extractChaptersFromPlayerResponse(playerResponse) {
  try {
    // Look for chapters in various locations within player response
    const chapters = [];
    
    // Check for chapters in the video info
    if (playerResponse.chapters) {
      playerResponse.chapters.forEach(chapter => {
        if (chapter.time && chapter.title) {
          chapters.push({
            time: formatSeconds(chapter.time),
            description: chapter.title
          });
        }
      });
    }
    
    // Check for macro markers
    if (playerResponse.macroMarkers) {
      playerResponse.macroMarkers.forEach(marker => {
        if (marker.timeRangeStartMillis && marker.title) {
          chapters.push({
            time: formatSeconds(marker.timeRangeStartMillis / 1000),
            description: marker.title
          });
        }
      });
    }
    
    return chapters.length > 0 ? chapters : null;
  } catch (e) {
    console.log('❌ Error extracting from player response:', e);
    return null;
  }
}

// Extract chapters from video description
function extractChaptersFromDescription(descriptionText) {
  try {
    const chapters = [];
    const lines = descriptionText.split(/\n|\r/);
    
    // Multiple regex patterns for different timestamp formats
    const patterns = [
      /^(\d{1,2}:\d{2})\s+(.+)$/,                    // 00:00 Title
      /^(\d{1,2}:\d{2}:\d{2})\s+(.+)$/,              // 00:00:00 Title
      /^[\-•*]?\s*(\d{1,2}:\d{2})\s*[\-–—]?\s*(.+)$/, // - 00:00 - Title
      /^\[(\d{1,2}:\d{2})\]\s*(.+)$/,                // [00:00] Title
      /^\((\d{1,2}:\d{2})\)\s*(.+)$/,                // (00:00) Title
      /^(\d{1,2}:\d{2})\s*[\-–—]\s*(.+)$/            // 00:00 - Title
    ];
    
    for (const line of lines) {
      const cleanLine = line.trim();
      if (!cleanLine) continue;
      
      for (const pattern of patterns) {
        const match = cleanLine.match(pattern);
        if (match) {
          const [, time, desc] = match;
          // Ensure time format is mm:ss
          const formattedTime = time.length === 4 ? '0' + time : time;
          chapters.push({
            time: formattedTime,
            description: desc.trim().replace(/^[\-–—•*]+\s*/, '')
          });
          break; // Found a match, move to next line
        }
      }
      
      if (chapters.length >= 10) break; // Limit to 10 chapters
    }
    
    return chapters.length > 0 ? chapters : null;
  } catch (e) {
    console.log('❌ Error extracting from description:', e);
    return null;
  }
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
  // Remove any previous overlays (even from older versions) to avoid multiple cards
  const existingEl = document.getElementById('rvised-overlay');
  if (existingEl) existingEl.remove();
  if (rvisedOverlay) rvisedOverlay.remove();
  
  // Create overlay container
  rvisedOverlay = document.createElement('div');
  rvisedOverlay.id = 'rvised-overlay';
  rvisedOverlay.className = 'rvised-overlay-container';
  
  // Original compact overlay card with settings and single generate button
  rvisedOverlay.innerHTML = `
    <div class="rvised-container bg-white rounded-xl shadow-2xl">
      <div class="rvised-header" style="background:linear-gradient(90deg,#2563eb,#7c3aed);color:#fff;padding:12px 16px;border-top-left-radius:12px;border-top-right-radius:12px;display:flex;align-items:center;justify-content:space-between;">
        <div style="display:flex;align-items:center;gap:8px;">
          <div style="width:28px;height:28px;border-radius:8px;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-weight:700;">R</div>
          <span style="font-weight:600">Rvised</span>
        </div>
        <button class="rvised-close" style="color:#fff;width:28px;height:28px;border:none;background:transparent;border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:pointer;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      
      <div class="rvised-content" style="padding:16px;">
        <div class="setting-group" style="margin-bottom:12px;">
          <label class="block text-sm font-medium text-gray-700 mb-2">Learning Mode</label>
          <select id="learningMode" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
            <option value="student">🎓 Student - Clear explanations</option>
            <option value="build" selected>🔧 Build - Practical steps</option>
            <option value="understand">🧠 Understand - Deep insights</option>
          </select>
        </div>
        <div class="setting-group" style="margin-bottom:12px;">
          <label class="block text-sm font-medium text-gray-700 mb-2">Summary Depth</label>
          <select id="summaryDepth" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
            <option value="quick">⚡ Quick (2-3 min read)</option>
            <option value="standard" selected>📋 Standard (5-7 min read)</option>
            <option value="deep">🔍 Deep (10+ min read)</option>
          </select>
        </div>
        <div class="toggle-group" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-bottom:12px;">
          <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="includeEmojis" checked> <span>😊 Emojis</span></label>
          <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="includeQuiz"> <span>❓ Quiz Questions</span></label>
          <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="includeTimestamps" checked> <span>⏱️ Timestamps</span></label>
          <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="includeActionItems" checked> <span>🎯 Action Items</span></label>
        </div>
        <button id="summarizeBtn" class="rvised-button" style="width:100%;background:linear-gradient(90deg,#2563eb,#7c3aed);color:#fff;font-weight:600;padding:10px 12px;border:none;border-radius:8px;cursor:pointer;">Generate Summary</button>
        
        <div id="loadingState" class="loading-state hidden" style="display:none;text-align:center;padding:16px;">
          <div class="spinner" style="width:48px;height:48px;border:4px solid #e5e7eb;border-top-color:#2563eb;border-radius:9999px;margin:0 auto;animation:spin 1s linear infinite"></div>
          <p style="color:#6b7280;margin-top:8px;">Generating summary...</p>
        </div>
        <div id="summaryResult" class="summary-result hidden" style="display:none;"></div>
      </div>
    </div>
  `;
  
  document.body.appendChild(rvisedOverlay);
  
  // Bind close and generate
  const closeBtn = rvisedOverlay.querySelector('.rvised-close');
  if (closeBtn) closeBtn.addEventListener('click', () => { rvisedOverlay.remove(); });
  const genBtn = rvisedOverlay.querySelector('#summarizeBtn');
  if (genBtn) genBtn.addEventListener('click', () => {
    window.rvisedSettings = {
      learningMode: document.getElementById('learningMode')?.value || 'student',
      summaryDepth: document.getElementById('summaryDepth')?.value || 'standard',
      includeEmojis: document.getElementById('includeEmojis')?.checked || false,
      includeQuiz: document.getElementById('includeQuiz')?.checked || false,
      includeTimestamps: document.getElementById('includeTimestamps')?.checked || false,
      includeActionItems: document.getElementById('includeActionItems')?.checked || false,
      quizCount: '5'
    };
    handleSummarize();
  });
  
  // Add close button functionality
  const closeBtn = rvisedOverlay.querySelector('.rvised-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      rvisedOverlay.style.display = 'none';
    });
  }
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
  loadingState.classList.remove('hidden');
  summaryResult.classList.add('hidden');
  summarizeBtn.disabled = true;
  summarizeBtn.textContent = 'Processing...';
  
  try {
    // Get settings from popup or fallback to UI
    let settings = window.rvisedSettings;
    
    if (!settings) {
      // Fallback to UI elements if popup settings not available
      settings = {
        learningMode: document.getElementById('learningMode')?.value || 'student',
        summaryDepth: document.getElementById('summaryDepth')?.value || 'standard',
        includeEmojis: document.getElementById('includeEmojis')?.checked || false,
        includeQuiz: document.getElementById('includeQuiz')?.checked || false,
        includeTimestamps: document.getElementById('includeTimestamps')?.checked || false,
        includeActionItems: document.getElementById('includeActionItems')?.checked || false,
        includeResources: document.getElementById('includeResources')?.checked || false,
        includeKeyTerms: document.getElementById('includeKeyTerms')?.checked || false,
        quizCount: document.querySelector('input[name="quizCount"]:checked')?.value || '5'
      };
    }
    
    console.log('⚙️ Using settings:', settings);
    
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
    
    // REAL DATA ONLY: Use only actual extracted chapters, no fallbacks
    const timestampsEnabled = settings.includeTimestamps;
    if (timestampsEnabled) {
      if (localChapters && localChapters.length > 0) {
        console.log('✅ Using real extracted chapters:', localChapters.length);
        summaryData.timestampedSections = localChapters;
      } else {
        console.log('❌ No real chapters found - timestamps disabled');
        summaryData.timestampedSections = null;
        delete summaryData.timestampedSections;
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
    summaryResult.classList.remove('hidden');
  } finally {
    isProcessing = false;
    loadingState.classList.add('hidden');
    summarizeBtn.disabled = false;
    summarizeBtn.innerHTML = `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
      </svg>
      Generate Summary
    `;
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

  // REAL DATA TIMESTAMP DISPLAY - NO FALLBACKS
  const timestampsEnabled = document.getElementById('includeTimestamps')?.checked;
  console.log('🔍 FRONTEND TIMESTAMP DEBUG:');
  console.log('- Timestamps enabled:', timestampsEnabled);
  console.log('- Data received:', data);
  console.log('- timestampedSections:', data.timestampedSections);
  
  if (timestampsEnabled && data.timestampedSections && data.timestampedSections.length > 0) {
    const timestamps = data.timestampedSections;
    console.log('- Real timestamps found:', timestamps.length);
    
    html += `
      <div class="timestamped-sections">
        <h3>📍 Timestamped Sections</h3>
        <ul>
          ${timestamps.map(section => {
              console.log('- Processing real section:', section);
              return `<li><strong>[${section.time}]</strong> ${section.description}</li>`;
            }).join('')}
        </ul>
      </div>
    `;
    console.log(`✅ FRONTEND: Displayed ${timestamps.length} real timestamp sections`);
  } else if (timestampsEnabled) {
    console.log('❌ FRONTEND: Timestamps enabled but no real data found');
    html += `
      <div class="timestamped-sections">
        <h3>📍 Timestamped Sections</h3>
        <p class="text-gray-500 text-sm">No chapters found in this video</p>
      </div>
    `;
  } else {
    console.log('❌ FRONTEND: Timestamps disabled by user');
  }

  // CODE SNIPPETS: REMOVED - Feature eliminated for simplicity

  // IMPROVED QUIZ QUESTIONS DISPLAY
  const quizEnabled = document.getElementById('includeQuiz')?.checked;
  if (quizEnabled) {
    const quiz = data.quiz || [];
    html += `
      <div class="quiz-section">
        <h3>🧪 Test Your Knowledge (${quiz.length} questions)</h3>
        ${quiz.length > 0 
          ? quiz.map((q, index) => `
            <div class="quiz-item">
              <div class="quiz-question">
                <div class="question-number">${index + 1}</div>
                <div class="question-content">
                  <p class="question-text"><strong>Q:</strong> ${q.question || q}</p>
                  ${q.answer ? `<p class="answer-text"><em>A: ${q.answer}</em></p>` : ''}
                </div>
              </div>
            </div>
          `).join('')
          : '<div class="quiz-item"><p class="text-gray-500 text-sm">No quiz questions available for this video</p></div>'
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
  summaryResult.classList.remove('hidden');
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
    console.log('🎯 Received startSummarization message:', message);
    
    // Update settings if provided
    if (message.settings) {
      console.log('⚙️ Updating settings from popup:', message.settings);
      updateSettingsFromPopup(message.settings);
    }
    
    // Show overlay if hidden
    if (!rvisedOverlay) {
      createRvisedOverlay();
    } else if (rvisedOverlay.style.display === 'none') {
      rvisedOverlay.style.display = 'block';
    }
    
    // Trigger summarization
    handleSummarize();
    
    sendResponse({success: true});
  } else if (message.action === 'updateSettings') {
    console.log('⚙️ Updating settings:', message.settings);
    updateSettingsFromPopup(message.settings);
    sendResponse({success: true});
  }
});

// Update settings from popup
function updateSettingsFromPopup(settings) {
  console.log('⚙️ Received settings from popup:', settings);
  
  // Store settings globally for use in handleSummarize
  window.rvisedSettings = settings;
  
  // Update UI elements with new settings if they exist
  if (settings.learningMode) {
    const learningModeSelect = document.getElementById('learningMode');
    if (learningModeSelect) {
      learningModeSelect.value = settings.learningMode;
    }
  }
  
  if (settings.summaryDepth) {
    const summaryDepthSelect = document.getElementById('summaryDepth');
    if (summaryDepthSelect) {
      summaryDepthSelect.value = settings.summaryDepth;
    }
  }
  
  if (settings.includeEmojis !== undefined) {
    const emojisCheckbox = document.getElementById('includeEmojis');
    if (emojisCheckbox) {
      emojisCheckbox.checked = settings.includeEmojis;
    }
  }
  
  if (settings.includeQuiz !== undefined) {
    const quizCheckbox = document.getElementById('includeQuiz');
    if (quizCheckbox) {
      quizCheckbox.checked = settings.includeQuiz;
    }
  }
  
  if (settings.includeTimestamps !== undefined) {
    const timestampsCheckbox = document.getElementById('includeTimestamps');
    if (timestampsCheckbox) {
      timestampsCheckbox.checked = settings.includeTimestamps;
    }
  }
  
  if (settings.includeActionItems !== undefined) {
    const actionItemsCheckbox = document.getElementById('includeActionItems');
    if (actionItemsCheckbox) {
      actionItemsCheckbox.checked = settings.includeActionItems;
    }
  }
  
  console.log('✅ Settings updated in overlay');
}

// Initialize when page loads
function initializeRvised() {
  // Only run on YouTube watch pages (no auto overlay now; user triggers from popup)
  if (window.location.pathname === '/watch') {
    console.log('🎬 YouTube video page detected');
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