// Screen navigation
function goToScreen(screenNumber) {
    console.log('goToScreen called with:', screenNumber);
    
    // Hide all screens
    const screens = document.querySelectorAll('.screen');
    console.log('Found screens:', screens.length);
    screens.forEach(screen => {
        screen.classList.remove('active');
    });

    // Show target screen
    const targetScreen = document.getElementById(`screen-${screenNumber}`);
    if (targetScreen) {
        targetScreen.classList.add('active');
        console.log('Successfully navigated to screen:', screenNumber);
    } else {
        console.error('Target screen not found:', screenNumber);
    }
}

// Get current settings from the UI
function getCurrentSettings() {
    const learningMode = document.querySelector('input[name="learningMode"]:checked')?.value || 'student';
    const summaryDepth = document.querySelector('input[name="summaryDepth"]:checked')?.value || 'standard';
    const project = document.querySelector('input[name="project"]:checked')?.value || 'general';
    
    return {
        learningMode,
        summaryDepth,
        project,
        includeTimestamps: document.getElementById('includeTimestamps')?.checked || false,
        includeActionItems: document.getElementById('includeActionItems')?.checked || false,
        includeEmojis: document.getElementById('includeEmojis')?.checked || false,
        includeQuiz: document.getElementById('includeQuiz')?.checked || false,
        quizCount: '5', // Default quiz count
        includeResources: document.getElementById('includeResources')?.checked || false,
        includeKeyTerms: document.getElementById('includeKeyTerms')?.checked || false
    };
}

// Send settings to content script
function sendSettingsToContentScript() {
    const settings = getCurrentSettings();
    
    // Send message to content script
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0] && tabs[0].url && tabs[0].url.includes('youtube.com')) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'updateSettings',
                settings: settings
            });
        }
    });
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'openDashboard') {
        // Open the web app dashboard
        chrome.tabs.create({
            url: 'https://rvised-1u5gahd9g-tysonso1122-2100s-projects.vercel.app/'
        });
    }
});

// Save settings when user finishes setup
function saveSettings() {
    console.log('saveSettings called');
    const settings = getCurrentSettings();
    
    // Save to chrome storage
    chrome.storage.sync.set({
        rvisedSettings: settings
    }, function() {
        console.log('Settings saved:', settings);
        
        // Send to content script
        sendSettingsToContentScript();
        
        // Close popup and trigger summarization on current YouTube page
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0] && tabs[0].url && tabs[0].url.includes('youtube.com/watch')) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'startSummarization',
                    settings: settings
                });
                window.close();
            }
        });
    });
}

// Load settings from storage
function loadSettings() {
    chrome.storage.sync.get(['rvisedSettings'], function(result) {
        if (result.rvisedSettings) {
            const settings = result.rvisedSettings;
            
            // Apply settings to UI
            if (settings.learningMode) {
                document.querySelector(`input[name="learningMode"][value="${settings.learningMode}"]`)?.checked = true;
            }
            if (settings.summaryDepth) {
                document.querySelector(`input[name="summaryDepth"][value="${settings.summaryDepth}"]`)?.checked = true;
            }
            if (settings.project) {
                document.querySelector(`input[name="project"][value="${settings.project}"]`)?.checked = true;
            }
            if (settings.includeTimestamps !== undefined) {
                document.getElementById('includeTimestamps').checked = settings.includeTimestamps;
            }
            if (settings.includeActionItems !== undefined) {
                document.getElementById('includeActionItems').checked = settings.includeActionItems;
            }
            if (settings.includeEmojis !== undefined) {
                document.getElementById('includeEmojis').checked = settings.includeEmojis;
            }
            if (settings.includeQuiz !== undefined) {
                document.getElementById('includeQuiz').checked = settings.includeQuiz;
            }
            if (settings.includeResources !== undefined) {
                document.getElementById('includeResources').checked = settings.includeResources;
            }
            if (settings.includeKeyTerms !== undefined) {
                document.getElementById('includeKeyTerms').checked = settings.includeKeyTerms;
            }
        }
    });
}

// Generate summary immediately
function generateSummaryNow() {
    console.log('generateSummaryNow called');
    const settings = getCurrentSettings();
    
    // Save settings first
    chrome.storage.sync.set({
        rvisedSettings: settings
    }, function() {
        console.log('Settings saved and generating summary:', settings);
        
        // Send to content script and trigger summarization
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0] && tabs[0].url && tabs[0].url.includes('youtube.com/watch')) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'startSummarization',
                    settings: settings
                });
                window.close();
            } else {
                alert('Please navigate to a YouTube video first!');
            }
        });
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Popup DOM loaded, initializing...');
    
    // Load saved settings
    loadSettings();
    
    // Add event listeners for navigation
    document.addEventListener('click', function(e) {
        console.log('Click event detected on:', e.target);
        console.log('Target tagName:', e.target.tagName);
        console.log('Target className:', e.target.className);
        console.log('Target id:', e.target.id);
        console.log('Target textContent:', e.target.textContent);
        console.log('Target hasAttribute data-screen:', e.target.hasAttribute('data-screen'));
        console.log('Target data-screen value:', e.target.getAttribute('data-screen'));
        
        // Handle screen navigation buttons (support clicking inner elements)
        const navEl = e.target.closest('[data-screen]');
        if (navEl) {
            const screenNumber = navEl.getAttribute('data-screen');
            console.log('Navigating to screen:', screenNumber);
            goToScreen(screenNumber);
            return;
        }
        
        // Handle setup item clicks
        // Setup items use same [data-screen] handling above
        
        // Handle back button clicks
        if (e.target.classList.contains('back-btn')) {
            const screenNumber = e.target.getAttribute('data-screen');
            console.log('Back button clicked, navigating to screen:', screenNumber);
            goToScreen(screenNumber);
            return;
        }
        
        // Handle finish setup button (text or data-screen=6)
        const isElement = e.target && typeof e.target.matches === 'function';
        if (e.target.textContent === 'Finish Setup' || (isElement && e.target.matches('button[data-screen="6"]') && e.target.closest('#screen-5'))) {
            console.log('Finish Setup clicked');
            saveSettings();
            return;
        }
        
        // Handle generate summary button
        if (e.target.id === 'generateSummaryBtn') {
            console.log('Generate Summary clicked');
            generateSummaryNow();
            return;
        }
        
        // Handle start using button
        if (e.target.id === 'startUsingBtn') {
            console.log('Start Using clicked');
            window.close();
            return;
        }
        
        console.log('No specific handler found for this click');
    });
    
    // Handle form interactions
    document.addEventListener('change', function(e) {
        if (e.target.type === 'radio' || e.target.type === 'checkbox') {
            console.log('Form element changed:', e.target.name, e.target.value);
            // Update display values based on selections
            updateDisplayValues();
        }
    });
    
    // Initialize display values
    updateDisplayValues();
    
    console.log('Popup initialization complete');
    
    // Debug: Check if elements exist
    console.log('Debug: Checking if elements exist...');
    console.log('Setup items:', document.querySelectorAll('.setup-item').length);
    console.log('Buttons with data-screen:', document.querySelectorAll('[data-screen]').length);
    console.log('Back buttons:', document.querySelectorAll('.back-btn').length);
    // Debug presence checks without unsupported :contains selector
    const finishBtn = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent && btn.textContent.trim() === 'Finish Setup');
    console.log('Finish Setup button present:', !!finishBtn);
    console.log('Generate Summary button:', document.getElementById('generateSummaryBtn'));
    console.log('Start Using button:', document.getElementById('startUsingBtn'));
});

function updateDisplayValues() {
    // Update learning mode display
    const learningMode = document.querySelector('input[name="learningMode"]:checked');
    if (learningMode) {
        const display = document.querySelector('.setup-item[data-screen="2"] .subtitle');
        if (display && learningMode.value) {
            display.textContent = learningMode.value.charAt(0).toUpperCase() + learningMode.value.slice(1);
        }
    }

    // Update summary depth display  
    const summaryDepth = document.querySelector('input[name="summaryDepth"]:checked');
    if (summaryDepth) {
        const display = document.querySelector('.setup-item[data-screen="3"] .subtitle');
        if (display && summaryDepth.value) {
            display.textContent = summaryDepth.value.charAt(0).toUpperCase() + summaryDepth.value.slice(1);
        }
    }
}