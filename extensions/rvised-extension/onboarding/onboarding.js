// Onboarding page script
document.addEventListener('DOMContentLoaded', () => {
    const signinBtn = document.getElementById('signin-btn');
    const loadingDiv = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    
    // Check if already authenticated
    checkAuthentication();
    
    async function checkAuthentication() {
        try {
            // Check if user is already authenticated
            chrome.storage.local.get(['userEmail', 'authToken'], (result) => {
                if (result.userEmail && result.userEmail !== 'guest' && result.authToken) {
                    console.log('User already authenticated:', result.userEmail);
                    // Close onboarding and optionally open YouTube
                    completeOnboarding();
                }
            });
        } catch (error) {
            console.error('Error checking authentication:', error);
        }
    }
    
    // Handle sign in button click
    signinBtn.addEventListener('click', async () => {
        console.log('Sign in button clicked');
        errorDiv.classList.remove('active');
        loadingDiv.classList.add('active');
        signinBtn.disabled = true;
        
        try {
            // Determine API base URL
            const apiBase = await resolveApiBase();
            const signInUrl = `${apiBase}/sign-in?redirect_url=${encodeURIComponent(apiBase + '/dashboard?extension=true')}`;
            
            console.log('Opening sign-in URL:', signInUrl);
            
            // Open sign-in page in new tab
            chrome.tabs.create({ url: signInUrl }, (tab) => {
                // Listen for the tab to close or navigate to dashboard
                chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo, updatedTab) {
                    if (tabId === tab.id) {
                        // Check if navigated to dashboard
                        if (changeInfo.url && (changeInfo.url.includes('/dashboard') || changeInfo.url.includes('extension=true'))) {
                            console.log('User signed in successfully');
                            chrome.tabs.onUpdated.removeListener(listener);
                            
                            // Give it a moment for the auth to save
                            setTimeout(() => {
                                // Extract user info from the page if possible
                                chrome.tabs.sendMessage(tabId, { action: 'getUserInfo' }, (response) => {
                                    if (response && response.email) {
                                        // Save user info
                                        chrome.storage.local.set({
                                            userEmail: response.email,
                                            authToken: response.token || 'authenticated',
                                            userTier: response.tier || 'free'
                                        }, () => {
                                            completeOnboarding();
                                        });
                                    } else {
                                        // Fallback: Just mark as authenticated
                                        chrome.storage.local.set({
                                            userEmail: 'authenticated@rvised.app',
                                            authToken: 'authenticated',
                                            userTier: 'free'
                                        }, () => {
                                            completeOnboarding();
                                        });
                                    }
                                });
                            }, 2000);
                        }
                    }
                });
            });
            
            // Timeout after 2 minutes
            setTimeout(() => {
                loadingDiv.classList.remove('active');
                signinBtn.disabled = false;
            }, 120000);
            
        } catch (error) {
            console.error('Sign-in error:', error);
            loadingDiv.classList.remove('active');
            errorDiv.classList.add('active');
            signinBtn.disabled = false;
        }
    });
    
    async function resolveApiBase() {
        // Check if we're in development or production
        try {
            // Try localhost first for development
            const response = await fetch('http://localhost:3002/api/health', {
                method: 'GET',
                mode: 'cors'
            });
            if (response.ok) {
                return 'http://localhost:3002';
            }
        } catch (e) {
            // Localhost not available, use production
        }
        return 'https://rvised.vercel.app';
    }
    
    function completeOnboarding() {
        console.log('Onboarding complete!');
        
        // Mark onboarding as complete
        chrome.storage.local.set({ onboardingComplete: true }, () => {
            // Show success message
            const container = document.querySelector('.container');
            container.innerHTML = `
                <div class="success-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>
                <div class="logo">
                    <img src="../icons/glasses.svg" alt="Rvised">
                    <h1>Rvised</h1>
                </div>
                <h2>You're all set!</h2>
                <p class="subtitle">Opening YouTube now. Look for the Rvised button below any video to start summarizing!</p>
                <div style="text-align: center; margin-top: 30px;">
                    <div class="spinner"></div>
                </div>
            `;
            
            // Open YouTube and close this tab after a moment
            setTimeout(() => {
                chrome.tabs.create({ url: 'https://www.youtube.com' }, () => {
                    // Close the onboarding tab
                    window.close();
                });
            }, 2000);
        });
    }
    
    // Skip link handler (for development only)
    const skipLink = document.getElementById('skip');
    if (skipLink) {
        skipLink.addEventListener('click', (e) => {
            e.preventDefault();
            chrome.storage.local.set({
                onboardingComplete: true,
                userEmail: 'guest',
                authToken: null,
                userTier: 'free'
            }, () => {
                window.close();
            });
        });
    }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'authenticationComplete') {
        console.log('Authentication complete message received');
        chrome.storage.local.set({
            userEmail: request.email,
            authToken: request.token,
            userTier: request.tier || 'free',
            onboardingComplete: true
        }, () => {
            location.reload();
        });
    }
});