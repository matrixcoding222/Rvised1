// Background service worker for Rvised Chrome Extension
console.log('🔧 Rvised background script loaded');

// Production API endpoint
const API_BASE_URL = 'https://rvised.vercel.app';

// Listen for extension installation
chrome.runtime.onInstalled.addListener(function(details) {
  console.log('📚 Rvised extension installed/updated');
  
  // Avoid duplicate context menu creation
  try {
    chrome.contextMenus.remove('summarizeVideo', () => void chrome.runtime.lastError);
  } catch (_) {}
  createOrUpdateContextMenu();

  if (details.reason === 'install') {
    // Open welcome page on first install
    chrome.tabs.create({
      url: `${API_BASE_URL}?welcome=extension`
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
    chrome.tabs.create({
      url: API_BASE_URL
    });
    sendResponse({success: true});
  }
  
  if (message.action === 'getApiStatus') {
    checkApiStatus(sendResponse);
    return true; // Keep the message channel open for async response
  }
});

// Handle video summarization
async function handleVideoSummarization(data, sender, sendResponse) {
  try {
    console.log('🎬 Starting video summarization:', data.videoId);
    
    // Make API call to our deployed endpoint
    const response = await fetch(`${API_BASE_URL}/api/summarize`, {
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
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const apiResp = await response.json();
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
    const response = await fetch(`${API_BASE_URL}/api/health`, {
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
    
    console.log('📺 YouTube video page loaded, ensuring content script is active');
    
    // Try to ping the content script
    chrome.tabs.sendMessage(tabId, {action: 'ping'}, function(response) {
      if (chrome.runtime.lastError) {
        console.log('🔄 Content script not responding, might need manual refresh');
      }
    });
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