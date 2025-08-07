// Initialize Lucide icons
lucide.createIcons();

// Screen navigation
function goToScreen(screenNumber) {
    // Hide current screen
    const currentScreen = document.querySelector('.screen.active');
    if (currentScreen) {
        currentScreen.classList.remove('active');
        currentScreen.classList.add('slide-out');
        
        setTimeout(() => {
            currentScreen.classList.remove('slide-out');
        }, 300);
    }

    // Show new screen
    setTimeout(() => {
        const newScreen = document.getElementById(`screen-${screenNumber}`);
        if (newScreen) {
            newScreen.classList.add('active');
            
            // Re-initialize icons for the new screen
            setTimeout(() => {
                lucide.createIcons();
            }, 100);
        }
    }, 150);
}

// Initialize icons on page load
document.addEventListener('DOMContentLoaded', function() {
    lucide.createIcons();
    
    // Handle quiz checkbox toggle
    const quizCheckbox = document.getElementById('includeQuiz');
    const quizCountSection = document.getElementById('quizCountSection');
    
    if (quizCheckbox && quizCountSection) {
        quizCheckbox.addEventListener('change', function() {
            if (this.checked) {
                quizCountSection.classList.remove('hidden');
            } else {
                quizCountSection.classList.add('hidden');
            }
        });
    }
    
    // Handle form interactions
    document.addEventListener('change', function(e) {
        if (e.target.type === 'radio') {
            // Update display values based on selections
            updateDisplayValues();
        }
    });
    
    // Initialize display values
    updateDisplayValues();
});

function updateDisplayValues() {
    // Update learning mode display
    const learningMode = document.querySelector('input[name="learningMode"]:checked');
    if (learningMode) {
        const display = document.querySelector('.setup-item:first-child .text-xs');
        if (display && learningMode.value) {
            display.textContent = learningMode.value.charAt(0).toUpperCase() + learningMode.value.slice(1);
        }
    }

    // Update summary depth display  
    const summaryDepth = document.querySelector('input[name="summaryDepth"]:checked');
    if (summaryDepth) {
        const display = document.querySelector('.setup-item:nth-child(2) .text-xs');
        if (display && summaryDepth.value) {
            display.textContent = summaryDepth.value.charAt(0).toUpperCase() + summaryDepth.value.slice(1);
        }
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
        quizCount: document.querySelector('input[name="quizCount"]:checked')?.value || '5',
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
    const settings = getCurrentSettings();
    
    // Save to chrome storage
    chrome.storage.sync.set({
        rvisedSettings: settings
    }, function() {
        console.log('Settings saved:', settings);
        
        // Send to content script
        sendSettingsToContentScript();
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
                if (settings.includeQuiz) {
                    document.getElementById('quizCountSection').classList.remove('hidden');
                }
            }
            if (settings.quizCount) {
                document.querySelector(`input[name="quizCount"][value="${settings.quizCount}"]`)?.checked = true;
            }
            if (settings.includeResources !== undefined) {
                document.getElementById('includeResources').checked = settings.includeResources;
            }
            if (settings.includeKeyTerms !== undefined) {
                document.getElementById('includeKeyTerms').checked = settings.includeKeyTerms;
            }
            
            updateDisplayValues();
        }
    });
}

// Load settings when popup opens
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
});

// Save settings when user clicks "Finish Setup"
document.addEventListener('click', function(e) {
    if (e.target.textContent === 'Finish Setup') {
        saveSettings();
    }
});