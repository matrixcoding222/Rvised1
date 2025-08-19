// popup-simple.js - External script for popup to avoid CSP issues

document.addEventListener('DOMContentLoaded', () => {
    // Go to YouTube button
    const goToYouTubeBtn = document.getElementById('goToYouTube');
    if (goToYouTubeBtn) {
        goToYouTubeBtn.addEventListener('click', () => {
            chrome.tabs.create({ url: 'https://www.youtube.com' });
        });
    }
    
    // Check if on YouTube
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const statusEl = document.getElementById('status');
        if (statusEl && tabs[0]?.url?.includes('youtube.com')) {
            statusEl.textContent = '✓ Active on this page';
            statusEl.classList.add('active');
        }
    });
});