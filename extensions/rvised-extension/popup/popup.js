// Popup script for Rvised Chrome Extension
console.log('🎯 Rvised popup loaded');

document.addEventListener('DOMContentLoaded', function() {
  const summarizeBtn = document.getElementById('summarizeBtn');
  const status = document.getElementById('status');
  
  // Check if user is on YouTube
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const currentTab = tabs[0];
    const isYouTube = currentTab.url && currentTab.url.includes('youtube.com/watch');
    
    if (isYouTube) {
      summarizeBtn.disabled = false;
      summarizeBtn.textContent = '✨ Summarize This Video';
      status.textContent = 'Ready to summarize!';
      status.style.display = 'block';
      status.style.background = 'rgba(34, 197, 94, 0.2)';
    } else {
      summarizeBtn.disabled = true;
      summarizeBtn.textContent = '❌ No YouTube Video Detected';
      summarizeBtn.style.opacity = '0.5';
      status.textContent = 'Please navigate to a YouTube video first';
      status.style.display = 'block';
      status.style.background = 'rgba(239, 68, 68, 0.2)';
    }
  });
  
  // Handle summarize button click
  summarizeBtn.addEventListener('click', function() {
    if (summarizeBtn.disabled) return;
    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const currentTab = tabs[0];
      
      // Send message to content script to trigger summarization
      chrome.tabs.sendMessage(currentTab.id, {
        action: 'startSummarization'
      }, function(response) {
        if (chrome.runtime.lastError) {
          console.error('Error communicating with content script:', chrome.runtime.lastError);
          status.textContent = 'Error: Please refresh the YouTube page and try again';
          status.style.background = 'rgba(239, 68, 68, 0.2)';
        } else {
          status.textContent = 'Summarization started! Check the page.';
          status.style.background = 'rgba(34, 197, 94, 0.2)';
          // Close popup after successful trigger
          setTimeout(() => window.close(), 1500);
        }
      });
    });
  });
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type === 'summaryComplete') {
    const status = document.getElementById('status');
    status.textContent = 'Summary completed! Check the YouTube page.';
    status.style.background = 'rgba(34, 197, 94, 0.2)';
    status.style.display = 'block';
  }
});