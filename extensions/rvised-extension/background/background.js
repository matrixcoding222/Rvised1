// Background service worker for Rvised Chrome Extension
console.log('🔧 Rvised background script loaded');

// Resolve API base dynamically (local → https local → prod)
async function resolveApiBaseUrl() {
  // DEV-ONLY: hard-pin to local during testing
  // Try multiple possible ports
  const possiblePorts = [3003, 3002, 3001, 3000];
  for (const port of possiblePorts) {
    const base = `http://localhost:${port}`;
    try {
      const r = await fetch(`${base}/api/health`, { method: 'GET', timeout: 1000 });
      if (r.ok) {
        console.log(`✅ Found API at ${base}`);
        return base;
      }
    } catch (_) {}
  }
  // Fallback to first port
  return 'http://localhost:3003';
}

// Listen for extension installation
chrome.runtime.onInstalled.addListener(function(details) {
  console.log('📚 Rvised extension installed/updated');
  
  // Avoid duplicate context menu creation
  try {
    chrome.contextMenus.remove('summarizeVideo', () => void chrome.runtime.lastError);
  } catch (_) {}
  createOrUpdateContextMenu();

  if (details.reason === 'install') {
    // Check if onboarding has been completed
    chrome.storage.local.get(['onboardingComplete', 'userEmail'], (result) => {
      if (!result.onboardingComplete || !result.userEmail || result.userEmail === 'guest') {
        // Open onboarding page for first-time users
        chrome.tabs.create({ 
          url: chrome.runtime.getURL('onboarding/onboarding.html')
        });
      } else {
        // User already onboarded, open YouTube
        chrome.tabs.create({ url: 'https://www.youtube.com' });
      }
    });
  } else if (details.reason === 'update') {
    // For updates, just ensure user is still authenticated
    chrome.storage.local.get(['userEmail', 'authToken'], (result) => {
      if (!result.userEmail || result.userEmail === 'guest' || !result.authToken) {
        // Re-authenticate if needed
        chrome.tabs.create({ 
          url: chrome.runtime.getURL('onboarding/onboarding.html')
        });
      }
    });
  }
});

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  
  if (message.action === 'summarizeVideo') {
    handleVideoSummarization(message.data, sender, sendResponse);
    return true; // Keep the message channel open for async response
  }
  
  if (message.action === 'openDashboard') {
    resolveApiBaseUrl().then((base) => {
      chrome.tabs.create({ url: `${base}/library` });
    });
    sendResponse({success: true});
  }
  
  if (message.action === 'openOnboarding') {
    chrome.tabs.create({ 
      url: chrome.runtime.getURL('onboarding/onboarding.html')
    });
    sendResponse({success: true});
  }
  
  if (message.action === 'getApiStatus') {
    checkApiStatus(sendResponse);
    return true; // Keep the message channel open for async response
  }
  
  // Allow popup to request showing overlay explicitly so both UIs stay consistent
  if (message.action === 'showOverlay') {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      const tab = tabs[0];
      if (tab && tab.url && tab.url.includes('youtube.com/watch')) {
        chrome.tabs.sendMessage(tab.id, {action: 'startSummarization', settings: message.settings || {}}, ()=>{});
      }
    });
    sendResponse({success: true});
  }
});

// Handle video summarization
async function handleVideoSummarization(data, sender, sendResponse) {
  try {
    console.log('🎬 Starting video summarization:', data.videoId);
    
    const BASE = await resolveApiBaseUrl();
    console.log('🔌 Using API base:', BASE);
    // Make API call to resolved endpoint
    const response = await fetch(`${BASE}/api/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        videoUrl: data.url,
        settings: data.settings || {},
        extensionTranscript: data.transcript
      })
    });
    const rawText = await response.text();
    if (!response.ok) {
      console.error('Summarize API failure:', response.status, response.statusText, 'base:', BASE, rawText);
      throw new Error(`Summarize failed (${response.status}): ${rawText?.slice(0,300) || response.statusText}`);
    }
    let apiResp;
    try { apiResp = rawText ? JSON.parse(rawText) : {}; } catch (e) {
      console.error('Invalid JSON from summarize:', rawText);
      throw new Error('Summarize returned invalid JSON');
    }
    if (apiResp.error) {
      throw new Error(apiResp.error);
    }
    const summaryData = apiResp.data || apiResp;
    console.log('✅ Summarization completed successfully');
    
    // Send result back to content script
    sendResponse({
      success: true,
      data: summaryData
    });
    
    // Notify popup if open
    try {
      chrome.runtime.sendMessage({
        type: 'summaryComplete',
        data: summaryData
      });
    } catch (e) {
      // Popup might not be open, that's fine
    }
    
  } catch (error) {
    console.error('❌ Summarization error:', error);
    
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

// Check API status
async function checkApiStatus(sendResponse) {
  try {
    const base = await resolveApiBaseUrl();
    const response = await fetch(`${base}/api/health`, {
      method: 'GET',
      timeout: 5000
    });
    
    sendResponse({
      success: response.ok,
      status: response.status
    });
  } catch (error) {
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

// Handle tab updates to reinject content script if needed
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  // Only act on YouTube watch pages that have finished loading
  if (changeInfo.status === 'complete' && 
      tab.url && 
      tab.url.includes('youtube.com/watch')) {
    
    console.log('📺 YouTube video page loaded');
  }
});

// Context menu for quick summarization (optional enhancement)
function createOrUpdateContextMenu() {
  chrome.contextMenus.create({
    id: 'summarizeVideo',
    title: '📚 Summarize with Rvised',
    contexts: ['page'],
    documentUrlPatterns: ['https://www.youtube.com/watch*']
  }, () => {
    if (chrome.runtime.lastError) {
      // If duplicate, remove and recreate once
      chrome.contextMenus.remove('summarizeVideo', () => {
        chrome.contextMenus.create({
          id: 'summarizeVideo',
          title: '📚 Summarize with Rvised',
          contexts: ['page'],
          documentUrlPatterns: ['https://www.youtube.com/watch*']
        }, () => void chrome.runtime.lastError);
      });
    }
  });
}

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId === 'summarizeVideo') {
    chrome.tabs.sendMessage(tab.id, {action: 'startSummarization'});
  }
});

// Listen for external messages from the web app
chrome.runtime.onMessageExternal.addListener(
  function(request, sender, sendResponse) {
    console.log('📨 External message received:', request);
    
    if (request.action === 'authComplete' && request.data) {
      // Save auth data to extension storage
      chrome.storage.local.set(request.data, () => {
        console.log('✅ Auth data saved from web app');
        
        // Notify all YouTube tabs to refresh their UI
        chrome.tabs.query({url: "*://*.youtube.com/*"}, (tabs) => {
          tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, {
              action: 'authenticationComplete',
              data: request.data
            }, () => {
              // Ignore errors if tab doesn't have content script
              if (chrome.runtime.lastError) {
                console.log('Tab notification error (expected):', chrome.runtime.lastError.message);
              }
            });
          });
        });
        
        sendResponse({success: true, message: 'Auth data received'});
      });
      
      return true; // Keep channel open for async response
    }
  }
);