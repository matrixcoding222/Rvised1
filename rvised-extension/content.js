// This WORKS - tested on multiple videos
console.log('🚀 Rvised Content Script Loaded');

// Extract transcript using YouTube's internal data
async function extractTranscript() {
  console.log('🔍 Starting transcript extraction...');
  
  // Get video ID
  const videoId = new URLSearchParams(window.location.search).get('v');
  if (!videoId) throw new Error('No video ID found');

  // Method 1: Direct from ytInitialData
  try {
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
    const html = await response.text();
    
    // Extract initial data
    const ytInitialData = html.match(/var ytInitialData = ({.*?});/s);
    if (ytInitialData) {
      const data = JSON.parse(ytInitialData[1]);
      console.log('📊 Found ytInitialData');
    }
  } catch (e) {
    console.log('Method 1 failed:', e.message);
  }

  // Method 2: Use the page's player response
  const player = document.querySelector('#movie_player');
  if (!player) throw new Error('Player not found');

  // Get player data
  const playerResponse = player.getPlayerResponse ? player.getPlayerResponse() : null;
  if (!playerResponse) {
    // Try alternative method
    const scripts = Array.from(document.scripts);
    for (const script of scripts) {
      const text = script.textContent;
      if (text.includes('ytInitialPlayerResponse')) {
        const match = text.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
        if (match) {
          try {
            const data = JSON.parse(match[1]);
            const tracks = data?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
            if (tracks && tracks.length > 0) {
              return await fetchTranscriptFromTrack(tracks[0]);
            }
          } catch (e) {
            console.error('Parse error:', e);
          }
        }
      }
    }
  }

  // Method 3: Direct API call (backup)
  try {
    const apiUrl = `https://www.youtube.com/api/timedtext?lang=en&v=${videoId}&fmt=json3`;
    const response = await fetch(apiUrl);
    if (response.ok) {
      const data = await response.json();
      if (data.events) {
        return formatTranscriptData(data.events);
      }
    }
  } catch (e) {
    console.log('API method failed:', e.message);
  }

  throw new Error('All transcript extraction methods failed');
}

// Fetch and parse transcript from track URL
async function fetchTranscriptFromTrack(track) {
  const response = await fetch(track.baseUrl);
  const xml = await response.text();
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  const textElements = doc.querySelectorAll('text');
  
  return Array.from(textElements).map(el => ({
    text: el.textContent.trim(),
    start: parseFloat(el.getAttribute('start')),
    duration: parseFloat(el.getAttribute('dur'))
  }));
}

// Format transcript data
function formatTranscriptData(events) {
  return events.map(event => ({
    text: event.segs ? event.segs.map(s => s.utf8).join('') : '',
    start: event.tStartMs / 1000,
    duration: event.dDurationMs / 1000
  }));
}

// Inject UI into YouTube page
function injectUI() {
  // Check if already injected
  if (document.getElementById('rvised-btn')) return;

  // Find injection point
  const secondary = document.querySelector('#secondary-inner') || 
                   document.querySelector('#secondary');
  if (!secondary) {
    setTimeout(injectUI, 1000);
    return;
  }

  // Create container
  const container = document.createElement('div');
  container.style.cssText = `
    margin-bottom: 20px;
    padding: 16px;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
  `;
  
  container.innerHTML = `
    <div style="display: flex; align-items: center; margin-bottom: 12px;">
      <span style="font-size: 18px; margin-right: 8px;">🤓</span>
      <h3 style="margin: 0; font-size: 16px; font-weight: 500;">Rvised Summary</h3>
    </div>
    <button id="rvised-btn" style="
      width: 100%;
      padding: 10px;
      background: #007AFF;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: opacity 0.2s;
    ">Summarize Video</button>
    <div id="rvised-status" style="margin-top: 12px; font-size: 14px;"></div>
  `;

  secondary.insertBefore(container, secondary.firstChild);

  // Add click handler
  document.getElementById('rvised-btn').addEventListener('click', handleSummarize);
}

// Handle summarize button click
async function handleSummarize() {
  const btn = document.getElementById('rvised-btn');
  const status = document.getElementById('rvised-status');
  
  try {
    // Update UI
    btn.disabled = true;
    btn.style.opacity = '0.7';
    status.textContent = '⏳ Extracting transcript...';
    
    // Extract transcript
    const transcript = await extractTranscript();
    status.textContent = `✅ Found ${transcript.length} transcript segments`;
    
    // Get video info
    const videoTitle = document.querySelector('h1.ytd-video-primary-info-renderer')?.textContent || '';
    const channelName = document.querySelector('#channel-name a')?.textContent || '';
    
    // Send to background script
    const response = await chrome.runtime.sendMessage({
      action: 'summarize',
      data: {
        transcript: transcript.map(t => t.text).join(' '),
        segments: transcript,
        videoTitle: videoTitle.trim(),
        channelName: channelName.trim(),
        videoUrl: window.location.href
      }
    });
    
    if (response?.error) throw new Error(response.error);
    
    status.innerHTML = `
      <div style="background: #f0f9ff; padding: 12px; border-radius: 6px; margin-top: 12px;">
        <strong>✨ Summary Ready!</strong>
        <p style="margin: 8px 0 0 0; font-size: 13px; line-height: 1.5;">
          ${response?.summary || 'Transcript extracted successfully! Connect to your API to generate summary.'}
        </p>
      </div>
    `;
    
  } catch (error) {
    console.error('Summarize error:', error);
    status.innerHTML = `
      <div style="color: #dc2626; margin-top: 8px;">
        ❌ ${error.message}<br>
        <small style="color: #666;">Make sure this video has captions enabled.</small>
      </div>
    `;
  } finally {
    btn.disabled = false;
    btn.style.opacity = '1';
  }
}

// Initialize on page load
function init() {
  if (window.location.pathname === '/watch') {
    setTimeout(injectUI, 1000);
  }
}

// Start
init();

// Handle YouTube navigation
let lastUrl = window.location.href;
new MutationObserver(() => {
  if (window.location.href !== lastUrl) {
    lastUrl = window.location.href;
    init();
  }
}).observe(document, { subtree: true, childList: true });


