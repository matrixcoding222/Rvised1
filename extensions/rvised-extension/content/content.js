// Enhanced content script for YouTube pages with full UI functionality
(function() {
  'use strict';
  
  console.log('🎥 Rvised content script initializing...');

  // Global state variables
  let rvisedContainer = null;
  let rvisedButton = null;
  let isProcessing = false;
  let isSummarized = false;
  let isCollapsed = false;
  let isCardVisible = true;
  let activeMode = 'student';
  let readingDepth = 'standard';
  let includeTimestamps = true;
  let includeEmojis = false; // Default OFF
  let generateQuiz = false;
  let includeTranscript = false;
  let activeTab = 'summary';
  let summaryData = null;
  let userEmail = null;
  let userTier = 'free';
  let showSettings = false;
  let showCreateProject = false;
  let showQuiz = false;
  let rawTranscript = null;
  let showProfileDropdown = false;
  let showOptionsDropdown = false;

  // Wait for the UI function to be available
  let checkCount = 0;
  const maxChecks = 20;
  
  function waitForUI() {
    if (typeof window.getNewOverlayUI === 'function') {
      console.log('✅ New overlay UI function found');
      initializeExtension();
    } else if (checkCount < maxChecks) {
      checkCount++;
      console.log(`⏳ Waiting for UI function... (${checkCount}/${maxChecks})`);
      setTimeout(waitForUI, 100);
    } else {
      console.error('❌ Failed to load new overlay UI after', maxChecks, 'attempts');
    }
  }

  // Main initialization function
  function initializeExtension() {
    console.log('🚀 Starting Rvised extension initialization');
    
    // Use config to determine mode
    const config = window.RVISED_CONFIG || { SKIP_ONBOARDING: false, AUTO_AUTH: { enabled: false } };
    const isTestMode = window.RVISED_TEST_MODE || false;
    
    if (isTestMode) {
      console.log('🔧 TEST MODE ACTIVE - Local testing enabled');
      
      // Don't auto-authenticate - let user sign in normally
      // This ensures the extension uses the actual signed-in user's email
      console.log('📝 Please sign in to use the extension');
    }
    
    if (config.SKIP_ONBOARDING) {
      console.log('📋 Skipping onboarding check');
      initializeExtensionCore();
      return;
    }
    
    // Check if onboarding is complete (PRODUCTION MODE)
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['onboardingComplete', 'userEmail', 'authToken'], (result) => {
        if (!result.onboardingComplete || !result.userEmail || result.userEmail === 'guest' || !result.authToken) {
          console.log('👋 User needs to complete onboarding');
          // Open onboarding page
          chrome.runtime.sendMessage({ action: 'openOnboarding' });
          return; // Don't initialize the extension until onboarding is complete
        }
        console.log('✅ Onboarding complete, initializing extension');
        initializeExtensionCore();
      });
    } else {
      // Fallback for development without Chrome APIs
      initializeExtensionCore();
    }
  }
  
  // Core initialization logic
  function initializeExtensionCore() {
    console.log('🎯 Starting core extension functionality');
    
    // Get dashboard URL
    async function getDashboardUrl() {
      const apiBase = await resolveApiBaseUrl();
      return `${apiBase}/dashboard`;
    }

    // Save settings to storage
    function saveSettings() {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set({
          learningMode: activeMode,
          summaryDepth: readingDepth,
          includeTimestamps: includeTimestamps,
          generateQuiz: generateQuiz,
          includeTranscript: includeTranscript,
          includeEmojis: includeEmojis
        }, () => {
          console.log('💾 Settings saved:', { includeEmojis, includeTimestamps });
        });
      }
    }

    // Load user data and preferences from storage
    async function loadUserData() {
      return new Promise((resolve) => {
        if (typeof chrome !== 'undefined' && chrome.storage) {
          chrome.storage.local.get([
            'userEmail', 'userTier', 'authToken', 'userId',
            'learningMode', 'summaryDepth', 'includeTimestamps', 
            'generateQuiz', 'includeTranscript', 'includeEmojis'
          ], async (result) => {
            userEmail = result.userEmail || null;
            userTier = result.userTier || 'free';
            
            // Load saved preferences
            activeMode = result.learningMode || 'student';
            readingDepth = result.summaryDepth || 'standard';
            // Default timestamps to true if not explicitly set to false
            includeTimestamps = result.includeTimestamps === undefined ? true : result.includeTimestamps;
            generateQuiz = result.generateQuiz || false;
            includeTranscript = result.includeTranscript || false;
            includeEmojis = result.includeEmojis === true; // Default false (OFF)
            
            // If we have an auth token, try to fetch latest user info
            if (result.authToken) {
              try {
                const apiBase = await resolveApiBaseUrl();
                const response = await fetch(`${apiBase}/api/user/profile`, {
                  headers: {
                    'Authorization': `Bearer ${result.authToken}`,
                    'x-user-email': result.userEmail || ''
                  }
                });
                
                if (response.ok) {
                  const userData = await response.json();
                  userEmail = userData.email || result.userEmail;
                  userTier = userData.tier || userData.plan || result.userTier || 'free';
                  
                  // Update storage with latest data
                  chrome.storage.local.set({
                    userEmail: userEmail,
                    userTier: userTier
                  });
                }
              } catch (error) {
                console.log('⚠️ Could not fetch user profile:', error);
              }
            }
            
            console.log('👤 User loaded:', userEmail || 'Guest', `(${userTier})`);
            console.log('⚙️ Settings loaded:', { 
              includeTimestamps, 
              includeEmojis, 
              activeMode, 
              readingDepth 
            });
            resolve();
          });
        } else {
          console.log('👤 Running without Chrome storage API');
          // Try to get from localStorage as fallback
          try {
            userEmail = localStorage.getItem('rvised_userEmail') || null;
            userTier = localStorage.getItem('rvised_userTier') || 'free';
          } catch (e) {
            // Silent fail
          }
          resolve();
        }
      });
    }

    // Resolve API base URL
    async function resolveApiBaseUrl() {
      // For now, hardcode to port 3000 since that's where the server is running
      const apiBase = 'http://localhost:3000';
      console.log(`📡 Using API at ${apiBase}`);
      return apiBase;
      
      // Old config-based approach
      /*
      const config = window.RVISED_CONFIG || { API_BASE: 'http://localhost:3002' };
      const apiBase = config.API_BASE || 'http://localhost:3002';
      console.log(`📡 Using API at ${apiBase}`);
      return apiBase;
        'http://127.0.0.1:3000'
      ];
      
      console.log('🔍 Checking API endpoints...');
      for (const base of bases) {
        try {
          console.log(`Trying ${base}/api/health...`);
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);
          
          const r = await fetch(`${base}/api/health`, { 
            method: 'GET',
            mode: 'cors',
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (r.ok) {
            console.log(`✅ API found at ${base}`);
            return base;
          }
        } catch (e) {
          console.log(`❌ ${base} failed:`, e.message);
        }
      }
      
      return null;
      */
    }

    // Show Pro feature message in the card with minimal overlay
    function showProFeatureMessage(feature) {
      const existingModal = rvisedContainer?.querySelector('#rvised-pro-overlay');
      if (existingModal) {
        existingModal.remove();
      }
      
      const overlay = document.createElement('div');
      overlay.id = 'rvised-pro-overlay';
      overlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.98);
        z-index: 10000;
        display: flex;
        flex-direction: column;
        animation: fadeIn 0.2s ease-out;
        border-radius: 12px;
        overflow-y: auto;
      `;
      
      overlay.innerHTML = `
        <style>
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          #rvised-pro-overlay .feature-item {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            padding: 10px 0;
            border-bottom: 1px solid #f0f0f0;
          }
          #rvised-pro-overlay .feature-item:last-child {
            border-bottom: none;
          }
          #rvised-pro-overlay .feature-check {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #10b981;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            margin-top: 2px;
          }
        </style>
        
        <!-- Header with close -->
        <div style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #e5e7eb;
          background: linear-gradient(to right, #f9fafb, #f3f4f6);
        ">
          <div style="display: flex; align-items: center; gap: 8px;">
            <img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjUxMiIgaGVpZ2h0PSI1MTIiPgo8cGF0aCBkPSJNMCAwIEM4Ljg5NjE1ODIgNy4zOTE3NjcyMiAxNi43Mzk0NzYzOSAxNS4zNTU4Nzc4MyAyMi44NzUgMjUuMTg3NSBDMjMuNDgyMTQ4NDQgMjYuMTU4MTY0MDYgMjQuMDg5Mjk2ODggMjcuMTI4ODI4MTIgMjQuNzE0ODQzNzUgMjguMTI4OTA2MjUgQzMzLjg3NSA0My4yOTI1NDc1NyAzMy44NzUgNDMuMjkyNTQ3NTcgMzMuODc1IDUwLjE4NzUgQzM0Ljg0NDM3NSA0OS43Nzc1NzgxMiAzNS44MTM3NSA0OS4zNjc2NTYyNSAzNi44MTI1IDQ4Ljk0NTMxMjUgQzU3Ljc0Mzg1NzY0IDQwLjQwMTkwMTIyIDc1LjA1MTEyMjQ5IDQxLjU4NzUwOTAzIDk1Ljg3NSA1MC4xODc1IEM5NS45NjkxMDE1NiA0OS4zNTIxODc1IDk2LjA2MzIwMzEyIDQ4LjUxNjg3NSA5Ni4xNjAxNTYyNSA0Ny42NTYyNSBDOTYuOTgyNzE4MDIgNDMuNjY0ODAyNzQgOTguNDc5Mjg4NjggNDAuMjkxNzQyNSAxMDAuMzEyNSAzNi42ODc1IEMxMDAuNjY3Mzk1MDIgMzUuOTg5NzE0MzYgMTAxLjAyMjI5MDA0IDM1LjI5MTkyODcxIDEwMS4zODc5Mzk0NSAzNC41NzI5OTgwNSBDMTE0LjU2NzU5NTY1IDkuMzg2NDE1NCAxMzYuNTMxNzk0OTcgLTkuNDU3NzMwMDYgMTYzLjY4NzUgLTE4LjE4NzUgQzE4My43NjQ3MDk0MSAtMjQuMTEzNzM4MzYgMjA2LjkxNzI3ODYgLTI0LjMwMDk5Njg3IDIyNi44NzUgLTE3LjgxMjUgQzIyNy44NDUxODA2NiAtMTcuNDk5MDE2MTEgMjI3Ljg0NTE4MDY2IC0xNy40OTkwMTYxMSAyMjguODM0OTYwOTQgLTE3LjE3OTE5OTIyIEMyNDQuOTgzMzEyOTYgLTExLjc0ODk1OTk0IDI1Ny45NzQ3MzE4OCAtMi44MzU4MTk1OSAyNjkuODc1IDkuMTg3NSBDMjcwLjc1OTI5Njg4IDEwLjA0OTg4MjgxIDI3MS42NDM1OTM3NSAxMC45MTIyNjU2MyAyNzIuNTU0Njg3NSAxMS44MDA3ODEyNSBDMjgyLjUwMjAyMTc1IDIyLjAxMTUxODQzIDI4OC42MTUzMDQyNiAzNC4wMzgyNjA2NiAyOTMuODc1IDQ3LjE4NzUgQzMwNy4yNCA0Ny42ODI1IDMwNy4yNCA0Ny42ODI1IDMyMC44NzUgNDguMTg3NSBDMzIwLjg3NSA1NS43Nzc1IDMyMC44NzUgNjMuMzY3NSAzMjAuODc1IDcxLjE4NzUgQzMxMy42MTUgNzEuMTg3NSAzMDYuMzU1IDcxLjE4NzUgMjk4Ljg3NSA3MS4xODc1IEMyOTkuMDgxMjUgNzIuNzU1IDI5OS4yODc1IDc0LjMyMjUgMjk5LjUgNzUuOTM3NSBDMzAxLjYwMDQxMTY0IDEwMi4xNjE3NTcwNSAyOTIuNjUyMzE4NCAxMjguOTg0NDQ2NDMgMjc1Ljg3NSAxNDkuMTg3NSBDMjU4LjA2Mjg1ODM1IDE2OS41Nzk0NzkwOCAyMzUuNzU1MzY1NDkgMTgyLjIxMDY2MTgxIDIwOC44NzUgMTg2LjE4NzUgQzE3Ni43Nzg1MTkxMyAxODguMTAzMDM3NDIgMTQ5LjQ0Mjk0MTUgMTgxLjY5ODYwMDg1IDEyNC44NzUgMTYwLjE4NzUgQzExNy45MDE4NzU5NSAxNTMuNzY0MTI0MzIgMTExLjk0NDMzNzI1IDE0Ny4yMDExNDkyOSAxMDYuODc1IDEzOS4xODc1IEMxMDYuMzY0NTMxMjUgMTM4LjQyMTc5Njg4IDEwNS44NTQwNjI1IDEzNy42NTYwOTM3NSAxMDUuMzI4MTI1IDEzNi44NjcxODc1IEM5NS4xMTcyOTczOCAxMjAuOTE5MzQ4NDggOTAuNTc0NDQ5MiAxMDIuNDE0ODMwODMgOTAuMjQ2MDkzNzUgODMuNjQwNjI1IEM4OS44NDE0MDUyOCA3OS44NzQ4OTIzMyA4OC42ODg0Mjk0NSA3Ny40Nzc2NDc4NiA4Ni44NzUgNzQuMTg3NSBDODYuODc1IDczLjUyNzUgODYuODc1IDcyLjg2NzUgODYuODc1IDcyLjE4NzUgQzc2LjQ1MzY2MzU0IDY2Ljg1Njc3MDI5IDY2LjM2NTA2NDMxIDYzLjk2NjM4MjkzIDU0LjY3OTY4NzUgNjcuMDIzNDM3NSBDNTIuMDA4MjI1MTYgNjcuOTcwOTE2MTQgNDkuNDQ0ODk5MTEgNjguOTk0MDIxNDMgNDYuODc1IDcwLjE4NzUgQzQ2LjEzODk0NTMxIDcwLjUxMTA1NDY5IDQ1LjQwMjg5MDYyIDcwLjgzNDYwOTM4IDQ0LjY0NDUzMTI1IDcxLjE2Nzk2ODc1IEM0Mi4wODE5MDQ1OCA3Mi42NDQ0NDkwMiA0MS43NDc5NTE0NiA3NC40MzQzNDUzOSA0MC44NzUgNzcuMTg3NSBDNDAuNTQ1IDc4LjE3NzUgNDAuMjE1IDc5LjE2NzUgMzkuODc1IDgwLjE4NzUgQzM5Ljc0NDEyNTQ4IDgyLjU0MDMzMzAzIDM5LjY0NTAwODM5IDg0Ljg5NDk3NDc5IDM5LjU2MjUgODcuMjUgQzM4LjExNTI1NTU2IDExNC4xNTE1MzkzNSAyNy4zNzgxNjk3NiAxMzYuODI0NTE3NTIgOC44NzUgMTU2LjE4NzUgQzguMDUxMjg5MDYgMTU3LjEwNTk1NzAzIDguMDUxMjg5MDYgMTU3LjEwNTk1NzAzIDcuMjEwOTM3NSAxNTguMDQyOTY4NzUgQy03Ljc1OTgwNDM4IDE3NC4xNTY3OTY4MyAtMzIuMjE5NDc2MTUgMTg1LjA1OTIwNjg4IC01NC4wOTA4MjAzMSAxODYuMzY0NTAxOTUgQy02OC44NzgzMjM1NyAxODYuNjU1NjU4NDcgLTgyLjk1NTE1MDE4IDE4Ni43OTQyODk3NCAtOTcuMTI1IDE4Mi4xODc1IEMtOTguMDk1MTgwNjYgMTgxLjg3NDAxNjExIC05OC4wOTUxODA2NiAxODEuODc0MDE2MTEgLTk5LjA4NDk2MDk0IDE4MS41NTQxOTkyMiBDLTExNC43NTc1NzA4NyAxNzYuMjgzOTM4NyAtMTI3LjQ1MTA4MTMyIDE2Ny43MjMwNjExMiAtMTM5LjEyNSAxNTYuMTg3NSBDLTEzOS44NDA0Mjk2OSAxNTUuNTQ0MjU3ODEgLTE0MC41NTU4NTkzOCAxNTQuOTAxMDE1NjMgLTE0MS4yOTI5Njg3NSAxNTQuMjM4MjgxMjUgQy0xNTguMzc2Njc0NzQgMTM4LjUxODU0MzgxIC0xNjcuMjUyNjMwMzEgMTE0LjUyNjQ0NjYyIC0xNjkuNDM3NSA5MS45Mzc1IEMtMTY5LjUyNjIwMzYxIDkxLjAyNjYxNjIxIC0xNjkuNjE0OTA3MjMgOTAuMTE1NzMyNDIgLTE2OS43MDYyOTg4MyA4OS4xNzcyNDYwOSBDLTE3MC4yMjMzNTE0NCA4Mi44MzM0MzA0MSAtMTY5Ljc4NTc4MjM5IDc3Ljc5NTMyMzk0IC0xNjkuMTI1IDcxLjE4NzUgQy0xNzYuMzg1IDcxLjE4NzUgLTE4My42NDUgNzEuMTg3NSAtMTkxLjEyNSA3MS4xODc1IEMtMTkxLjEyNSA2My41OTc1IC0xOTEuMTI1IDU2LjAwNzUgLTE5MS4xMjUgNDguMTg3NSBDLTE4Mi4yMTUgNDcuODU3NSAtMTczLjMwNSA0Ny41Mjc1IC0xNjQuMTI1IDQ3LjE4NzUgQy0xNjMuMzIwNjI1IDQ1LjE2NjI1IC0xNjIuNTE2MjUgNDMuMTQ1IC0xNjEuNjg3NSA0MS4wNjI1IEMtMTU2LjE2MjQ5MDAxIDI3LjkxNjU3Mjc1IC0xNDguMTUzMjI4NTUgMTcuMjI5Njk1NDQgLTEzOC4xMjUgNy4xODc1IEMtMTM3LjI2MTMyODEzIDYuMzEyMjI2NTYgLTEzNi4zOTc2NTYyNSA1LjQzNjk1MzEzIC0xMzUuNTA3ODEyNSA0LjUzNTE1NjI1IEMtMTI0LjYwMzUyNjAzIC01Ljk2NDY2ODU1IC0xMTEuNDg2MDk0MDEgLTEzLjE3MjE1NjQ3IC05Ny4xMjUgLTE3LjgxMjUgQy05Ni4xNTQ4MTkzNCAtMTguMTI3OTE3NDggLTk2LjE1NDgxOTM0IC0xOC4xMjc5MTc0OCAtOTUuMTY1MDM5MDYgLTE4LjQ0OTcwNzAzIEMtNjIuMzYzMzQ2ODggLTI4LjU1OTE1OTc1IC0yNi43OTI5OTAxNCAtMjAuNjMyNzEyMSAwIDAgWiBNLTEwOC4xMjUgMTIuMTg3NSBDLTEwOC45NjQxNzk2OSAxMi42NDc2OTUzMSAtMTA5LjgwMzM1OTM3IDEzLjEwNzg5MDYyIC0xMTAuNjY3OTY4NzUgMTMuNTgyMDMxMjUgQy0xMjIuNjA2MzgyNzIgMjAuNzc5ODcyODIgLTEzMS42OTA5OTcyNyAzMi4wMjQxNzEwMyAtMTM4LjEyNSA0NC4xODc1IEMtMTM4LjYwNDUzMTI1IDQ1LjA2NjY0MDYyIC0xMzkuMDg0MDYyNSA0NS45NDU3ODEyNSAtMTM5LjU3ODEyNSA0Ni44NTE1NjI1IEMtMTQ4LjgwNDUyMDEyIDY1LjI0ODc3MjA0IC0xNTAuMTExNTcxNzQgODcuNTg3MDE0MjUgLTE0My44NzAxMTcxOSAxMDcuMTIzMDQ2ODggQy0xNDEuNTg0Mjg0NyAxMTMuNDU2MjcwODMgLTEzOC40NDc5MDA3NiAxMTkuMzQ4MDI4MzQgLTEzNS4xMjUgMTI1LjE4NzUgQy0xMzQuNjY0ODA0NjkgMTI2LjAyNjY3OTY5IC0xMzQuMjA0NjA5MzggMTI2Ljg2NTg1OTM4IC0xMzMuNzMwNDY4NzUgMTI3LjczMDQ2ODc1IEMtMTI2LjUzMjYyNzE4IDEzOS42Njg4ODI3MiAtMTE1LjI4ODMyODk3IDE0OC43NTM0OTcyNyAtMTAzLjEyNSAxNTUuMTg3NSBDLTEwMi4yNDU4NTkzOCAxNTUuNjY3MDMxMjUgLTEwMS4zNjY3MTg3NSAxNTYuMTQ2NTYyNSAtMTAwLjQ2MDkzNzUgMTU2LjY0MDYyNSBDLTgyLjA1NzA4Nzc0IDE2NS44NzAzNTAyNiAtNTkuNzIwNjM5NDcgMTY3LjE3Mjg4OTQ3IC00MC4xODA2NjQwNiAxNjAuOTIzODI4MTIgQy0xNy45MjY2MDIxNSAxNTIuOTUyNTM5NDQgLTEuMDYyMjU4NSAxMzcuNTc0MTc1MzcgOS42NjQwNjI1IDExNi43MDcwMzEyNSBDMTguMjg2OTg2ODkgOTcuOTEwNzU1MTcgMTkuOTU1MjkwOTggNzUuODk0NTU3MjUgMTMuMTkwOTE3OTcgNTYuMTk1MzEyNSBDNS4wNjUyMTI2MyAzNC4zMTcyMDQ1MSAtOS45MjM1OTY5NyAxNy45MzE3MDU5OSAtMzAuNjM2NzE4NzUgNy40MDIzNDM3NSBDLTU2LjgzMjkzNzE0IC00LjUzNzAzMDE0IC04My42MDgyNDIyNyAtMS43NjM1NDg1OSAtMTA4LjEyNSAxMi4xODc1IFogTTEzMC44NzUgMzAuMTg3NSBDMTE2LjIzMjUzMDkzIDQ5LjM2MDc1NzI0IDExMC42NzI4MDc4IDcxLjMwODI1MTQ4IDExMy4zMDg1OTM3NSA5NS4xMDE1NjI1IEMxMTYuODg4NDUyNjIgMTE2LjIyNDk1MzM1IDEyOC43NjQ3NDEwMyAxMzYuMDU3OTgzOTggMTQ2LjE5NTMxMjUgMTQ4LjY2MDE1NjI1IEMxNjUuMDk5OTgwNSAxNjEuNjQzOTQwOTMgMTg2LjYzMDg4MTU1IDE2Ny4xMjUwODU0MSAyMDkuMzcxMDkzNzUgMTYzLjU2NjQwNjI1IEMyMTkuNzI2Njk1MjYgMTYxLjU5MzYzMDY0IDIyOC43NjMwMzc4OSAxNTcuMzcyNTgzMSAyMzcuODc1IDE1Mi4xODc1IEMyMzguNzE0MTc5NjkgMTUxLjcyNzMwNDY5IDIzOS41NTMzNTkzOCAxNTEuMjY3MTA5MzggMjQwLjQxNzk2ODc1IDE1MC43OTI5Njg3NSBDMjUyLjM1NjM4MjcyIDE0My41OTUxMjcxOCAyNjEuNDQwOTk3MjcgMTMyLjM1MDgyODk3IDI2Ny44NzUgMTIwLjE4NzUgQzI2OC4zNTQ1MzEyNSAxMTkuMzA4MzU5MzggMjY4LjgzNDA2MjUgMTE4LjQyOTIxODc1IDI2OS4zMjgxMjUgMTE3LjUyMzQzNzUgQzI3OC41NTQ1MjAxMiA5OS4xMjYyMjc5NiAyNzkuODYxNTcxNzQgNzYuNzg3OTg1NzUgMjczLjYyMDExNzE5IDU3LjI1MTk1MzEyIEMyNzEuMzM0Mjg0NyA1MC45MTg3MjkxNyAyNjguMTk3OTAwNzYgNDUuMDI2OTcxNjYgMjY0Ljg3NSAzOS4xODc1IEMyNjQuNDE0ODA0NjkgMzguMzQ4MzIwMzEgMjYzLjk1NDYwOTM4IDM3LjUwOTE0MDYyIDI2My40ODA0Njg3NSAzNi42NDQ1MzEyNSBDMjU2LjI4MjYyNzE4IDI0LjcwNjExNzI4IDI0NS4wMzgzMjg5NyAxNS42MjE1MDI3MyAyMzIuODc1IDkuMTg3NSBDMjMxLjk5NTg1OTM4IDguNzA3OTY4NzUgMjMxLjExNjcxODc1IDguMjI4NDM3NSAyMzAuMjEwOTM3NSA3LjczNDM3NSBDMTk2LjA3NjQxMjMgLTkuMzg0NDUwMzMgMTU1LjEzODM0MjU3IDEuODQxMDA1OTIgMTMwLjg3NSAzMC4xODc1IFogIiBmaWxsPSIjMDAwMDAwIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxOTEuMTI1LDE3My44MTI1KSIvPgo8L3N2Zz4K" 
              style="width: 32px; height: 32px;" 
              alt="Rvised"/>
            <div>
              <div style="
                font-size: 16px;
                font-weight: 700;
                color: #111827;
                letter-spacing: -0.3px;
              ">Rvised Pro</div>
              <div style="
                font-size: 10px;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              ">Premium Features</div>
            </div>
          </div>
          <button id="rvised-pro-close" style="
            background: none;
            border: none;
            color: #6b7280;
            cursor: pointer;
            font-size: 20px;
            line-height: 1;
            padding: 0;
            width: 24px;
            height: 24px;
          ">×</button>
        </div>
        
        <!-- Content -->
        <div style="padding: 20px;">
          <!-- Lock message -->
          <div style="
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
          ">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
              <rect x="5" y="11" width="14" height="10" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            <div>
              <div style="
                font-size: 14px;
                font-weight: 600;
                color: #1e40af;
                margin-bottom: 2px;
              ">${feature} is a Rvised Pro feature</div>
              <div style="
                font-size: 12px;
                color: #1e3a8a;
              ">Join thousands of Pro learners</div>
            </div>
          </div>
          
          <!-- Features list -->
          <div style="margin-bottom: 20px;">
            <p style="
              font-size: 13px;
              font-weight: 600;
              color: #374151;
              margin: 0 0 12px 0;
            ">What's included in Rvised Pro:</p>
            
            <div class="feature-item">
              <div class="feature-check">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div>
                <div style="font-size: 13px; font-weight: 500; color: #111827;">Unlimited Summaries</div>
                <div style="font-size: 11px; color: #6b7280;">No daily limits, summarize as much as you want</div>
              </div>
            </div>
            
            <div class="feature-item">
              <div class="feature-check">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div>
                <div style="font-size: 13px; font-weight: 500; color: #111827;">Full Dashboard Access</div>
                <div style="font-size: 11px; color: #6b7280;">Analytics, insights, and progress tracking</div>
              </div>
            </div>
            
            <div class="feature-item">
              <div class="feature-check">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div>
                <div style="font-size: 13px; font-weight: 500; color: #111827;">Priority Processing</div>
                <div style="font-size: 11px; color: #6b7280;">Faster AI responses and no queue waiting</div>
              </div>
            </div>
            
            <div class="feature-item">
              <div class="feature-check">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div>
                <div style="font-size: 13px; font-weight: 500; color: #111827;">Longer Videos</div>
                <div style="font-size: 11px; color: #6b7280;">Summarize videos of any length</div>
              </div>
            </div>
          </div>
          
          <!-- Pricing -->
          <div style="
            background: linear-gradient(135deg, #f3f4f6, #f9fafb);
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 16px;
            text-align: center;
          ">
            <div style="
              font-size: 11px;
              font-weight: 600;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 8px;
            ">Rvised Pro Subscription</div>
            <div style="
              font-size: 24px;
              font-weight: 700;
              color: #111827;
              margin-bottom: 4px;
            ">$8.99<span style="font-size: 14px; font-weight: 400; color: #6b7280;">/month</span></div>
            <div style="
              font-size: 12px;
              color: #6b7280;
            ">or $4.17/mo billed annually • Cancel anytime</div>
          </div>
          
          <!-- CTA Buttons -->
          <div style="display: flex; gap: 8px;">
            <button id="rvised-pro-upgrade" style="
              flex: 1;
              background: #3b82f6;
              color: white;
              border: none;
              padding: 10px 16px;
              border-radius: 8px;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s;
              box-shadow: 0 1px 3px rgba(59, 130, 246, 0.2);
            " onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">
              Get Rvised Pro
            </button>
            <button id="rvised-pro-later" style="
              padding: 10px 16px;
              background: white;
              color: #6b7280;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s;
            " onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background='white'">
              Maybe Later
            </button>
          </div>
          
          <!-- Footer branding -->
          <div style="
            margin-top: 20px;
            padding-top: 16px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
          ">
            <div style="
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 6px;
              margin-bottom: 8px;
            ">
              <img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjUxMiIgaGVpZ2h0PSI1MTIiPgo8cGF0aCBkPSJNMCAwIEM4Ljg5NjE1ODIgNy4zOTE3NjcyMiAxNi43Mzk0NzYzOSAxNS4zNTU4Nzc4MyAyMi44NzUgMjUuMTg3NSBDMjMuNDgyMTQ4NDQgMjYuMTU4MTY0MDYgMjQuMDg5Mjk2ODggMjcuMTI4ODI4MTIgMjQuNzE0ODQzNzUgMjguMTI4OTA2MjUgQzMzLjg3NSA0My4yOTI1NDc1NyAzMy44NzUgNDMuMjkyNTQ3NTcgMzMuODc1IDUwLjE4NzUgQzM0Ljg0NDM3NSA0OS43Nzc1NzgxMiAzNS44MTM3NSA0OS4zNjc2NTYyNSAzNi44MTI1IDQ4Ljk0NTMxMjUgQzU3Ljc0Mzg1NzY0IDQwLjQwMTkwMTIyIDc1LjA1MTEyMjQ5IDQxLjU4NzUwOTAzIDk1Ljg3NSA1MC4xODc1IEM5NS45NjkxMDE1NiA0OS4zNTIxODc1IDk2LjA2MzIwMzEyIDQ4LjUxNjg3NSA5Ni4xNjAxNTYyNSA0Ny42NTYyNSBDOTYuOTgyNzE4MDIgNDMuNjY0ODAyNzQgOTguNDc5Mjg4NjggNDAuMjkxNzQyNSAxMDAuMzEyNSAzNi42ODc1IEMxMDAuNjY3Mzk1MDIgMzUuOTg5NzE0MzYgMTAxLjAyMjI5MDA0IDM1LjI5MTkyODcxIDEwMS4zODc5Mzk0NSAzNC41NzI5OTgwNSBDMTE0LjU2NzU5NTY1IDkuMzg2NDE1NCAxMzYuNTMxNzk0OTcgLTkuNDU3NzMwMDYgMTYzLjY4NzUgLTE4LjE4NzUgQzE4My43NjQ3MDk0MSAtMjQuMTEzNzM4MzYgMjA2LjkxNzI3ODYgLTI0LjMwMDk5Njg3IDIyNi44NzUgLTE3LjgxMjUgQzIyNy44NDUxODA2NiAtMTcuNDk5MDE2MTEgMjI3Ljg0NTE4MDY2IC0xNy40OTkwMTYxMSAyMjguODM0OTYwOTQgLTE3LjE3OTE5OTIyIEMyNDQuOTgzMzEyOTYgLTExLjc0ODk1OTk0IDI1Ny45NzQ3MzE4OCAtMi44MzU4MTk1OSAyNjkuODc1IDkuMTg3NSBDMjcwLjc1OTI5Njg4IDEwLjA0OTg4MjgxIDI3MS42NDM1OTM3NSAxMC45MTIyNjU2MyAyNzIuNTU0Njg3NSAxMS44MDA3ODEyNSBDMjgyLjUwMjAyMTc1IDIyLjAxMTUxODQzIDI4OC42MTUzMDQyNiAzNC4wMzgyNjA2NiAyOTMuODc1IDQ3LjE4NzUgQzMwNy4yNCA0Ny42ODI1IDMwNy4yNCA0Ny42ODI1IDMyMC44NzUgNDguMTg3NSBDMzIwLjg3NSA1NS43Nzc1IDMyMC44NzUgNjMuMzY3NSAzMjAuODc1IDcxLjE4NzUgQzMxMy42MTUgNzEuMTg3NSAzMDYuMzU1IDcxLjE4NzUgMjk4Ljg3NSA3MS4xODc1IEMyOTkuMDgxMjUgNzIuNzU1IDI5OS4yODc1IDc0LjMyMjUgMjk5LjUgNzUuOTM3NSBDMzAxLjYwMDQxMTY0IDEwMi4xNjE3NTcwNSAyOTIuNjUyMzE4NCAxMjguOTg0NDQ2NDMgMjc1Ljg3NSAxNDkuMTg3NSBDMjU4LjA2Mjg1ODM1IDE2OS41Nzk0NzkwOCAyMzUuNzU1MzY1NDkgMTgyLjIxMDY2MTgxIDIwOC44NzUgMTg2LjE4NzUgQzE3Ni43Nzg1MTkxMyAxODguMTAzMDM3NDIgMTQ5LjQ0Mjk0MTUgMTgxLjY5ODYwMDg1IDEyNC44NzUgMTYwLjE4NzUgQzExNy45MDE4NzU5NSAxNTMuNzY0MTI0MzIgMTExLjk0NDMzNzI1IDE0Ny4yMDExNDkyOSAxMDYuODc1IDEzOS4xODc1IEMxMDYuMzY0NTMxMjUgMTM4LjQyMTc5Njg4IDEwNS44NTQwNjI1IDEzNy42NTYwOTM3NSAxMDUuMzI4MTI1IDEzNi44NjcxODc1IEM5NS4xMTcyOTczOCAxMjAuOTE5MzQ4NDggOTAuNTc0NDQ5MiAxMDIuNDE0ODMwODMgOTAuMjQ2MDkzNzUgODMuNjQwNjI1IEM4OS44NDE0MDUyOCA3OS44NzQ4OTIzMyA4OC42ODg0Mjk0NSA3Ny40Nzc2NDc4NiA4Ni44NzUgNzQuMTg3NSBDODYuODc1IDczLjUyNzUgODYuODc1IDcyLjg2NzUgODYuODc1IDcyLjE4NzUgQzc2LjQ1MzY2MzU0IDY2Ljg1Njc3MDI5IDY2LjM2NTA2NDMxIDYzLjk2NjM4MjkzIDU0LjY3OTY4NzUgNjcuMDIzNDM3NSBDNTIuMDA4MjI1MTYgNjcuOTcwOTE2MTQgNDkuNDQ0ODk5MTEgNjguOTk0MDIxNDMgNDYuODc1IDcwLjE4NzUgQzQ2LjEzODk0NTMxIDcwLjUxMTA1NDY5IDQ1LjQwMjg5MDYyIDcwLjgzNDYwOTM4IDQ0LjY0NDUzMTI1IDcxLjE2Nzk2ODc1IEM0Mi4wODE5MDQ1OCA3Mi42NDQ0NDkwMiA0MS43NDc5NTE0NiA3NC40MzQzNDUzOSA0MC44NzUgNzcuMTg3NSBDNDAuNTQ1IDc4LjE3NzUgNDAuMjE1IDc5LjE2NzUgMzkuODc1IDgwLjE4NzUgQzM5Ljc0NDEyNTQ4IDgyLjU0MDMzMzAzIDM5LjY0NTAwODM5IDg0Ljg5NDk3NDc5IDM5LjU2MjUgODcuMjUgQzM4LjExNTI1NTU2IDExNC4xNTE1MzkzNSAyNy4zNzgxNjk3NiAxMzYuODI0NTE3NTIgOC44NzUgMTU2LjE4NzUgQzguMDUxMjg5MDYgMTU3LjEwNTk1NzAzIDguMDUxMjg5MDYgMTU3LjEwNTk1NzAzIDcuMjEwOTM3NSAxNTguMDQyOTY4NzUgQy03Ljc1OTgwNDM4IDE3NC4xNTY3OTY4MyAtMzIuMjE5NDc2MTUgMTg1LjA1OTIwNjg4IC01NC4wOTA4MjAzMSAxODYuMzY0NTAxOTUgQy02OC44NzgzMjM1NyAxODYuNjU1NjU4NDcgLTgyLjk1NTE1MDE4IDE4Ni43OTQyODk3NCAtOTcuMTI1IDE4Mi4xODc1IEMtOTguMDk1MTgwNjYgMTgxLjg3NDAxNjExIC05OC4wOTUxODA2NiAxODEuODc0MDE2MTEgLTk5LjA4NDk2MDk0IDE4MS41NTQxOTkyMiBDLTExNC43NTc1NzA4NyAxNzYuMjgzOTM4NyAtMTI3LjQ1MTA4MTMyIDE2Ny43MjMwNjExMiAtMTM5LjEyNSAxNTYuMTg3NSBDLTEzOS44NDA0Mjk2OSAxNTUuNTQ0MjU3ODEgLTE0MC41NTU4NTkzOCAxNTQuOTAxMDE1NjMgLTE0MS4yOTI5Njg3NSAxNTQuMjM4MjgxMjUgQy0xNTguMzc2Njc0NzQgMTM4LjUxODU0MzgxIC0xNjcuMjUyNjMwMzEgMTE0LjUyNjQ0NjYyIC0xNjkuNDM3NSA5MS45Mzc1IEMtMTY5LjUyNjIwMzYxIDkxLjAyNjYxNjIxIC0xNjkuNjE0OTA3MjMgOTAuMTE1NzMyNDIgLTE2OS43MDYyOTg4MyA4OS4xNzcyNDYwOSBDLTE3MC4yMjMzNTE0NCA4Mi44MzM0MzA0MSAtMTY5Ljc4NTc4MjM5IDc3Ljc5NTMyMzk0IC0xNjkuMTI1IDcxLjE4NzUgQy0xNzYuMzg1IDcxLjE4NzUgLTE4My42NDUgNzEuMTg3NSAtMTkxLjEyNSA3MS4xODc1IEMtMTkxLjEyNSA2My41OTc1IC0xOTEuMTI1IDU2LjAwNzUgLTE5MS4xMjUgNDguMTg3NSBDLTE4Mi4yMTUgNDcuODU3NSAtMTczLjMwNSA0Ny41Mjc1IC0xNjQuMTI1IDQ3LjE4NzUgQy0xNjMuMzIwNjI1IDQ1LjE2NjI1IC0xNjIuNTE2MjUgNDMuMTQ1IC0xNjEuNjg3NSA0MS4wNjI1IEMtMTU2LjE2MjQ5MDAxIDI3LjkxNjU3Mjc1IC0xNDguMTUzMjI4NTUgMTcuMjI5Njk1NDQgLTEzOC4xMjUgNy4xODc1IEMtMTM3LjI2MTMyODEzIDYuMzEyMjI2NTYgLTEzNi4zOTc2NTYyNSA1LjQzNjk1MzEzIC0xMzUuNTA3ODEyNSA0LjUzNTE1NjI1IEMtMTI0LjYwMzUyNjAzIC01Ljk2NDY2ODU1IC0xMTEuNDg2MDk0MDEgLTEzLjE3MjE1NjQ3IC05Ny4xMjUgLTE3LjgxMjUgQy05Ni4xNTQ4MTkzNCAtMTguMTI3OTE3NDggLTk2LjE1NDgxOTM0IC0xOC4xMjc5MTc0OCAtOTUuMTY1MDM5MDYgLTE4LjQ0OTcwNzAzIEMtNjIuMzYzMzQ2ODggLTI4LjU1OTE1OTc1IC0yNi43OTI5OTAxNCAtMjAuNjMyNzEyMSAwIDAgWiBNLTEwOC4xMjUgMTIuMTg3NSBDLTEwOC45NjQxNzk2OSAxMi42NDc2OTUzMSAtMTA5LjgwMzM1OTM3IDEzLjEwNzg5MDYyIC0xMTAuNjY3OTY4NzUgMTMuNTgyMDMxMjUgQy0xMjIuNjA2MzgyNzIgMjAuNzc5ODcyODIgLTEzMS42OTA5OTcyNyAzMi4wMjQxNzEwMyAtMTM4LjEyNSA0NC4xODc1IEMtMTM4LjYwNDUzMTI1IDQ1LjA2NjY0MDYyIC0xMzkuMDg0MDYyNSA0NS45NDU3ODEyNSAtMTM5LjU3ODEyNSA0Ni44NTE1NjI1IEMtMTQ4LjgwNDUyMDEyIDY1LjI0ODc3MjA0IC0xNTAuMTExNTcxNzQgODcuNTg3MDE0MjUgLTE0My44NzAxMTcxOSAxMDcuMTIzMDQ2ODggQy0xNDEuNTg0Mjg0NyAxMTMuNDU2MjcwODMgLTEzOC40NDc5MDA3NiAxMTkuMzQ4MDI4MzQgLTEzNS4xMjUgMTI1LjE4NzUgQy0xMzQuNjY0ODA0NjkgMTI2LjAyNjY3OTY5IC0xMzQuMjA0NjA5MzggMTI2Ljg2NTg1OTM4IC0xMzMuNzMwNDY4NzUgMTI3LjczMDQ2ODc1IEMtMTI2LjUzMjYyNzE4IDEzOS42Njg4ODI3MiAtMTE1LjI4ODMyODk3IDE0OC43NTM0OTcyNyAtMTAzLjEyNSAxNTUuMTg3NSBDLTEwMi4yNDU4NTkzOCAxNTUuNjY3MDMxMjUgLTEwMS4zNjY3MTg3NSAxNTYuMTQ2NTYyNSAtMTAwLjQ2MDkzNzUgMTU2LjY0MDYyNSBDLTgyLjA1NzA4Nzc0IDE2NS44NzAzNTAyNiAtNTkuNzIwNjM5NDcgMTY3LjE3Mjg4OTQ3IC00MC4xODA2NjQwNiAxNjAuOTIzODI4MTIgQy0xNy45MjY2MDIxNSAxNTIuOTUyNTM5NDQgLTEuMDYyMjU4NSAxMzcuNTc0MTc1MzcgOS42NjQwNjI1IDExNi43MDcwMzEyNSBDMTguMjg2OTg2ODkgOTcuOTEwNzU1MTcgMTkuOTU1MjkwOTggNzUuODk0NTU3MjUgMTMuMTkwOTE3OTcgNTYuMTk1MzEyNSBDNS4wNjUyMTI2MyAzNC4zMTcyMDQ1MSAtOS45MjM1OTY5NyAxNy45MzE3MDU5OSAtMzAuNjM2NzE4NzUgNy40MDIzNDM3NSBDLTU2LjgzMjkzNzE0IC00LjUzNzAzMDE0IC04My42MDgyNDIyNyAtMS43NjM1NDg1OSAtMTA4LjEyNSAxMi4xODc1IFogTTEzMC44NzUgMzAuMTg3NSBDMTE2LjIzMjUzMDkzIDQ5LjM2MDc1NzI0IDExMC42NzI4MDc4IDcxLjMwODI1MTQ4IDExMy4zMDg1OTM3NSA5NS4xMDE1NjI1IEMxMTYuODg4NDUyNjIgMTE2LjIyNDk1MzM1IDEyOC43NjQ3NDEwMyAxMzYuMDU3OTgzOTggMTQ2LjE5NTMxMjUgMTQ4LjY2MDE1NjI1IEMxNjUuMDk5OTgwNSAxNjEuNjQzOTQwOTMgMTg2LjYzMDg4MTU1IDE2Ny4xMjUwODU0MSAyMDkuMzcxMDkzNzUgMTYzLjU2NjQwNjI1IEMyMTkuNzI2Njk1MjYgMTYxLjU5MzYzMDY0IDIyOC43NjMwMzc4OSAxNTcuMzcyNTgzMSAyMzcuODc1IDE1Mi4xODc1IEMyMzguNzE0MTc5NjkgMTUxLjcyNzMwNDY5IDIzOS41NTMzNTkzOCAxNTEuMjY3MTA5MzggMjQwLjQxNzk2ODc1IDE1MC43OTI5Njg3NSBDMjUyLjM1NjM4MjcyIDE0My41OTUxMjcxOCAyNjEuNDQwOTk3MjcgMTMyLjM1MDgyODk3IDI2Ny44NzUgMTIwLjE4NzUgQzI2OC4zNTQ1MzEyNSAxMTkuMzA4MzU5MzggMjY4LjgzNDA2MjUgMTE4LjQyOTIxODc1IDI2OS4zMjgxMjUgMTE3LjUyMzQzNzUgQzI3OC41NTQ1MjAxMiA5OS4xMjYyMjc5NiAyNzkuODYxNTcxNzQgNzYuNzg3OTg1NzUgMjczLjYyMDExNzE5IDU3LjI1MTk1MzEyIEMyNzEuMzM0Mjg0NyA1MC45MTg3MjkxNyAyNjguMTk3OTAwNzYgNDUuMDI2OTcxNjYgMjY0Ljg3NSAzOS4xODc1IEMyNjQuNDE0ODA0NjkgMzguMzQ4MzIwMzEgMjYzLjk1NDYwOTM4IDM3LjUwOTE0MDYyIDI2My40ODA0Njg3NSAzNi42NDQ1MzEyNSBDMjU2LjI4MjYyNzE4IDI0LjcwNjExNzI4IDI0NS4wMzgzMjg5NyAxNS42MjE1MDI3MyAyMzIuODc1IDkuMTg3NSBDMjMxLjk5NTg1OTM4IDguNzA3OTY4NzUgMjMxLjExNjcxODc1IDguMjI4NDM3NSAyMzAuMjEwOTM3NSA3LjczNDM3NSBDMTk2LjA3NjQxMjMgLTkuMzg0NDUwMzMgMTU1LjEzODM0MjU3IDEuODQxMDA1OTIgMTMwLjg3NSAzMC4xODc1IFogIiBmaWxsPSIjMDAwMDAwIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxOTEuMTI1LDE3My44MTI1KSIvPgo8L3N2Zz4K" 
                style="width: 16px; height: 16px;" 
                alt="Rvised"/>
              <span style="
                font-size: 12px;
                font-weight: 600;
                color: #374151;
              ">Rvised Pro</span>
            </div>
            <p style="
              font-size: 11px;
              color: #9ca3af;
              margin: 0;
            ">Transform your YouTube learning experience</p>
          </div>
        </div>
      `;
      
      rvisedContainer.appendChild(overlay);
      
      // Add event listeners
      const upgradeBtn = overlay.querySelector('#rvised-pro-upgrade');
      const closeBtn = overlay.querySelector('#rvised-pro-close');
      const laterBtn = overlay.querySelector('#rvised-pro-later');
      
      upgradeBtn?.addEventListener('click', async () => {
        const dashboardUrl = await getDashboardUrl();
        window.open(`${dashboardUrl}/upgrade`, '_blank');
        overlay.style.animation = 'fadeIn 0.3s ease-out reverse';
        setTimeout(() => overlay.remove(), 300);
      });
      
      const closeOverlay = () => {
        overlay.style.animation = 'fadeIn 0.3s ease-out reverse';
        setTimeout(() => overlay.remove(), 300);
      };
      
      closeBtn?.addEventListener('click', closeOverlay);
      laterBtn?.addEventListener('click', closeOverlay);
      
      // Don't auto-close - user must explicitly close
    }
    
    // Load projects from API
    let availableProjects = [];
    async function loadProjects() {
      try {
        const apiBase = await resolveApiBaseUrl();
        
        // Skip if no API base available
        if (!apiBase) {
          console.log('⚠️ No API base available, using default projects');
          availableProjects = [{
            id: 'default',
            name: 'My Library',
            emoji: '📚'
          }];
          return;
        }
        
        console.log('📁 Loading projects from:', `${apiBase}/api/projects`);
        
        const response = await fetch(`${apiBase}/api/projects?type=projects`, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': userEmail || 'guest',
            'x-user-tier': userTier || 'free'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          availableProjects = data.projects || [];
          console.log('📁 Projects loaded:', availableProjects.length);
          
          // Update project dropdown if visible
          const projectSelect = rvisedContainer?.querySelector('#rvised-project-select');
          if (projectSelect) {
            projectSelect.innerHTML = '<option value="">Choose project...</option>';
            availableProjects.forEach(project => {
              const option = document.createElement('option');
              option.value = project.id;
              option.textContent = `${project.emoji || '📁'} ${project.name}`;
              projectSelect.appendChild(option);
            });
          }
        } else {
          console.log('⚠️ Projects API returned:', response.status);
          throw new Error(`API returned ${response.status}`);
        }
      } catch (error) {
        console.error('❌ Failed to load projects:', error.message);
        // Use default projects as fallback
        availableProjects = [{
          id: 'default',
          name: 'My Library',
          emoji: '📚'
        }];
      }
    }

    // Show notification in extension UI
    function showNotification(message, type = 'success') {
      const container = document.querySelector('#rvised-extension-container');
      if (!container) return;
      
      // Remove any existing notification
      const existingNotif = container.querySelector('.rvised-notification');
      if (existingNotif) existingNotif.remove();
      
      // Create notification element
      const notification = document.createElement('div');
      notification.className = 'rvised-notification';
      notification.style.cssText = `
        position: absolute;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-size: 14px;
        font-weight: 600;
        z-index: 10000;
        white-space: nowrap;
        animation: slideDown 0.3s ease-out;
        max-width: 90%;
        text-align: center;
      `;
      notification.textContent = message;
      
      // Add animation styles
      const style = document.createElement('style');
      style.textContent = `
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `;
      document.head.appendChild(style);
      
      container.appendChild(notification);
      
      // Auto-remove after 3 seconds
      setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease-out';
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    }

    // Extract video ID from YouTube URL
    function getVideoId() {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('v');
    }

    // Extract video info from YouTube page
    function getVideoInfo() {
      const videoTitle = document.querySelector('h1.ytd-video-primary-info-renderer')?.textContent?.trim() || 
                         document.querySelector('h1.title')?.textContent?.trim() || 
                         document.querySelector('[itemprop="name"]')?.content || 
                         document.querySelector('#title h1')?.textContent?.trim() || '';
      
      const channelName = document.querySelector('#channel-name a')?.textContent?.trim() || 
                          document.querySelector('#owner #text')?.textContent?.trim() || 
                          document.querySelector('[itemprop="author"] [itemprop="name"]')?.content || 
                          document.querySelector('#upload-info #channel-name')?.textContent?.trim() || '';
      
      return { videoTitle, channelName };
    }

    // Parse time to seconds for timestamp navigation
    function parseTimeToSeconds(time) {
      const trimmed = (time || '').trim();
      if (!trimmed) return 0;
      const parts = trimmed.split(':').map((p) => p.trim());
      const toNumber = (s) => { const m = s.match(/\d+/); return m ? parseInt(m[0], 10) : 0 };
      if (parts.length === 3) { 
        const [h,m,s] = parts; 
        return toNumber(h)*3600 + toNumber(m)*60 + toNumber(s);
      }
      if (parts.length === 2) { 
        const [m,s] = parts; 
        return toNumber(m)*60 + toNumber(s);
      }
      return toNumber(trimmed);
    }

    // Create the prominent summarize button
    function createSummarizeButton() {
      if (rvisedButton) {
        rvisedButton.remove();
      }
      
      rvisedButton = document.createElement('button');
      rvisedButton.id = 'rvised-main-button';
      rvisedButton.className = 'rvised-summarize-button';
      
      let iconUrl = '';
      try {
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
          try {
            iconUrl = chrome.runtime.getURL('icons/glasses.svg');
          } catch (e) {
            // Extension context might be invalidated
            iconUrl = '';
          }
        }
      } catch (e) {
        console.log('⚠️ Could not get icon URL:', e);
        iconUrl = ''; // Fallback to no icon
      }
      
      rvisedButton.innerHTML = `
        <style>
          .rvised-summarize-button {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 8px 16px;
            margin-left: 8px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 20px;
            font-family: Roboto, Arial, sans-serif;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            position: relative;
            z-index: 999;
          }
          .rvised-summarize-button:hover {
            background: #2563eb;
            transform: scale(1.02);
          }
          .rvised-summarize-button.processing {
            background: #6b7280;
            pointer-events: none;
          }
          .rvised-summarize-button.summarized {
            background: #10b981;
          }
          .rvised-summarize-button img {
            width: 18px;
            height: 18px;
          }
        </style>
        <img src="${iconUrl}" alt="">
        <span>${isSummarized ? 'View Summary' : 'Summarize'}</span>
      `;
      
      const actionsSection = document.querySelector('#actions') || 
                            document.querySelector('#menu-container') ||
                            document.querySelector('ytd-menu-renderer');
      
      if (actionsSection) {
        const buttonsContainer = actionsSection.querySelector('#top-level-buttons-computed') ||
                                actionsSection.querySelector('#top-level-buttons') ||
                                actionsSection;
        
        if (buttonsContainer) {
          buttonsContainer.appendChild(rvisedButton);
          console.log('✅ Rvised button added to video controls');
        }
        
        rvisedButton.addEventListener('click', handleMainButtonClick);
      }
    }

    // Extract transcript from YouTube
    async function extractTranscript(videoId) {
      console.log('🎬 Extracting transcript for video:', videoId);
      
      try {
        // Method 1: Try to get from YouTube's timedtext API
        const timedTextUrls = [
          `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&fmt=json3`,
          `https://video.google.com/timedtext?v=${videoId}&lang=en&fmt=json3`,
          `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en-US&fmt=json3`,
        ];
        
        for (const url of timedTextUrls) {
          try {
            const response = await fetch(url);
            if (response.ok) {
              const data = await response.json();
              if (data?.events?.length) {
                const transcript = data.events
                  .filter(e => e.segs)
                  .flatMap(e => e.segs.map(s => (s.utf8 || '').trim()))
                  .filter(t => t.length > 0)
                  .join(' ');
                
                if (transcript.length > 50) {
                  console.log('✅ Transcript extracted via timedtext API:', transcript.length, 'chars');
                  return transcript;
                }
              }
            }
          } catch (e) {
            // Try next URL
          }
        }
        
        // Method 2: Try to extract from page HTML
        const html = document.documentElement.innerHTML;
        const captionTracksMatch = html.match(/"captionTracks":\s*(\[[\s\S]*?\])/);
        
        if (captionTracksMatch) {
          try {
            const captionTracks = JSON.parse(captionTracksMatch[1]);
            const englishTrack = captionTracks.find(track => 
              track.languageCode && track.languageCode.startsWith('en')
            ) || captionTracks[0];
            
            if (englishTrack?.baseUrl) {
              let trackUrl = englishTrack.baseUrl;
              // Unescape Unicode
              trackUrl = trackUrl.replace(/\\u0026/g, '&');
              
              // Request VTT format
              if (!trackUrl.includes('fmt=')) {
                trackUrl += '&fmt=vtt';
              }
              
              const vttResponse = await fetch(trackUrl);
              if (vttResponse.ok) {
                const vtt = await vttResponse.text();
                // Parse VTT - remove headers and timestamps
                const lines = vtt
                  .split('\n')
                  .map(line => line.trim())
                  .filter(line => 
                    line && 
                    !line.startsWith('WEBVTT') && 
                    !/^\d+$/.test(line) && 
                    !/^\d{2}:\d{2}:\d{2}\.\d{3}/.test(line)
                  )
                  .join(' ');
                
                if (lines.length > 50) {
                  console.log('✅ Transcript extracted from caption tracks:', lines.length, 'chars');
                  return lines;
                }
              }
            }
          } catch (e) {
            console.log('⚠️ Failed to parse caption tracks:', e);
          }
        }
        
        console.log('⚠️ Could not extract transcript from any method');
        return null;
        
      } catch (error) {
        console.error('❌ Error extracting transcript:', error);
        return null;
      }
    }

    // Handle main button click
    function handleMainButtonClick() {
      if (isProcessing) return;
      
      if (!isSummarized) {
        isCardVisible = true;
        isCollapsed = false;
        createExtensionUI();
        setTimeout(() => handleSummarize(), 100);
      } else {
        isCollapsed = !isCollapsed;
        isCardVisible = true;
        createExtensionUI();
      }
    }

    // Create the extension UI
    async function createExtensionUI() {
      console.log('🎨 Creating extension UI...');
      console.log('UI State:', {
        isCardVisible,
        isCollapsed,
        isSummarized,
        isProcessing,
        hasSummaryData: !!summaryData
      });
      
      if (!window.getNewOverlayUI) {
        console.error('❌ UI function not available');
        return;
      }
      
      // Only hide the card if explicitly requested, don't remove when we have summary data
      if (!isCardVisible && !isSummarized) {
        if (rvisedContainer) {
          rvisedContainer.style.display = 'none';
        }
        return;
      }
      
      // If we have a summary and the card is visible, keep it visible
      if (isSummarized && isCardVisible) {
        // Don't remove the container unnecessarily
      }
      
      if (rvisedContainer) {
        rvisedContainer.remove();
      }
      
      const { videoTitle, channelName } = getVideoInfo();
      
      rvisedContainer = document.createElement('div');
      rvisedContainer.id = 'rvised-extension-container';
      
      const uiHTML = window.getNewOverlayUI({
        isCollapsed,
        isSummarized,
        isLoading: isProcessing,
        activeMode,
        readingDepth,
        activeTab,
        includeTimestamps,
        includeEmojis,
        generateQuiz,
        includeTranscript,
        showSettings,
        showCreateProject,
        showQuiz,
        showProfileDropdown,
        showOptionsDropdown,
        userEmail,
        userTier,
        videoTitle,
        channelName,
        summaryData,
        availableProjects
      });
      
      rvisedContainer.innerHTML = uiHTML;
      
      // Insert into page
      const insertCard = () => {
        const secondaryColumn = document.querySelector('#secondary') || 
                               document.querySelector('#secondary-inner') ||
                               document.querySelector('#related');
        
        if (secondaryColumn) {
          const overlayContainer = rvisedContainer.querySelector('#rvised-overlay-container');
          if (overlayContainer) {
            overlayContainer.style.cssText = `
              position: relative !important;
              top: auto !important;
              right: auto !important;
              width: 100% !important;
              display: flex !important;
              justify-content: flex-start !important;
              pointer-events: auto !important;
              z-index: 999 !important;
            `;
          }
          
          const mainCard = rvisedContainer.querySelector('#rvised-main-card');
          if (mainCard) {
            mainCard.style.cssText = `
              width: 100% !important;
              max-width: 400px !important;
              height: auto !important;
              max-height: 600px !important;
              background: white !important;
              border: 1px solid #e5e7eb !important;
              border-radius: 8px !important;
              box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1) !important;
              display: flex !important;
              flex-direction: column !important;
              overflow: hidden !important;
              pointer-events: auto !important;
            `;
          }
          
          rvisedContainer.style.cssText = `
            width: 100% !important;
            max-width: 400px !important;
            margin-bottom: 16px !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            position: relative !important;
            z-index: 999 !important;
          `;
          
          if (secondaryColumn.firstChild) {
            secondaryColumn.insertBefore(rvisedContainer, secondaryColumn.firstChild);
          } else {
            secondaryColumn.appendChild(rvisedContainer);
          }
          console.log('✅ Rvised card inserted in secondary column');
          return true;
        }
        return false;
      };
      
      if (!insertCard()) {
        document.body.appendChild(rvisedContainer);
        const overlayContainer = rvisedContainer.querySelector('#rvised-overlay-container');
        if (overlayContainer) {
          overlayContainer.style.cssText = `
            position: fixed !important;
            top: 80px !important;
            right: 20px !important;
            display: flex !important;
            justify-content: flex-end !important;
            pointer-events: none !important;
            z-index: 2147483647 !important;
          `;
        }
        
        const mainCard = rvisedContainer.querySelector('#rvised-main-card');
        if (mainCard) {
          mainCard.style.cssText = `
            width: 400px !important;
            height: auto !important;
            max-height: 600px !important;
            background: white !important;
            border: 1px solid #e5e7eb !important;
            border-radius: 8px !important;
            box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1) !important;
            display: flex !important;
            flex-direction: column !important;
            overflow: hidden !important;
            pointer-events: auto !important;
          `;
        }
        console.log('✅ Rvised card added as overlay (fallback)');
      }
      
      // Verify container is in DOM
      const isInDOM = document.body.contains(rvisedContainer) || document.querySelector('#secondary')?.contains(rvisedContainer);
      console.log('📍 Container in DOM:', isInDOM, 'Container element:', rvisedContainer);
      
      setupEventListeners();
    }

    // Set up all event listeners
    function setupEventListeners() {
      // Tab buttons
      const tabSummary = rvisedContainer.querySelector('#rvised-tab-summary');
      const tabTranscript = rvisedContainer.querySelector('#rvised-tab-transcript');
      const tabQuiz = rvisedContainer.querySelector('#rvised-tab-quiz');
      const tabDashboard = rvisedContainer.querySelector('#rvised-tab-dashboard');
      
      if (tabSummary) {
        tabSummary.addEventListener('click', () => {
          activeTab = 'summary';
          createExtensionUI();
        });
      }
      
      if (tabTranscript) {
        tabTranscript.addEventListener('click', async () => {
          activeTab = 'transcript';
          // Fetch transcript if not already loaded
          if (!rawTranscript && !isProcessing) {
            await fetchTranscript();
          }
          createExtensionUI();
        });
      }
      
      if (tabQuiz) {
        tabQuiz.addEventListener('click', () => {
          activeTab = 'quiz';
          createExtensionUI();
        });
      }
      
      if (tabDashboard) {
        tabDashboard.addEventListener('click', async () => {
          // Check if user is Pro before opening dashboard
          if (userTier !== 'pro' && userTier !== 'premium') {
            // Show Pro feature message in the card
            showProFeatureMessage('Dashboard');
            return;
          }
          // Reload projects before opening dashboard to ensure it's fresh
          await loadProjects();
          // Don't set activeTab, just open dashboard
          const dashboardUrl = await getDashboardUrl();
          window.open(dashboardUrl, '_blank');
          console.log('📊 Opening dashboard:', dashboardUrl);
        });
      }
      
      // Mode select
      const modeSelect = rvisedContainer.querySelector('#rvised-mode-select');
      if (modeSelect) {
        modeSelect.addEventListener('change', (e) => {
          activeMode = e.target.value;
          console.log('📚 Mode changed to:', activeMode);
        });
      }
      
      // Depth select
      const depthSelect = rvisedContainer.querySelector('#rvised-depth-select');
      if (depthSelect) {
        depthSelect.addEventListener('change', (e) => {
          readingDepth = e.target.value;
          console.log('📊 Depth changed to:', readingDepth);
        });
      }
      
      // Options dropdown
      const optionsSelect = rvisedContainer.querySelector('#rvised-options-select');
      const optionsDropdown = rvisedContainer.querySelector('#rvised-options-dropdown');
      
      if (optionsSelect && optionsDropdown) {
        optionsSelect.addEventListener('click', (e) => {
          e.preventDefault();
          optionsDropdown.style.display = optionsDropdown.style.display === 'none' ? 'block' : 'none';
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
          if (!optionsSelect.contains(e.target) && !optionsDropdown.contains(e.target)) {
            optionsDropdown.style.display = 'none';
          }
        });
      }
      
      // Option checkboxes
      const timestampsCheck = rvisedContainer.querySelector('#opt-timestamps');
      if (timestampsCheck) {
        timestampsCheck.addEventListener('change', (e) => {
          includeTimestamps = e.target.checked;
          console.log('⏰ Timestamps:', includeTimestamps);
        });
      }
      
      const quizCheck = rvisedContainer.querySelector('#opt-quiz');
      if (quizCheck) {
        quizCheck.addEventListener('change', async (e) => {
          generateQuiz = e.target.checked;
          console.log('🧩 Quiz option changed:', generateQuiz);
          // If quiz is enabled and we have a summary, generate quiz questions
          if (generateQuiz && isSummarized && summaryData) {
            console.log('📝 Generating quiz questions...');
            await generateQuizQuestions();
          }
        });
      }
      
      const emojisSettingsCheck = rvisedContainer.querySelector('#opt-emojis');
      if (emojisSettingsCheck) {
        emojisSettingsCheck.addEventListener('change', (e) => {
          includeEmojis = e.target.checked;
          console.log('😀 Include emojis:', includeEmojis);
          saveSettings();
        });
      }
      
      // Summarize button
      const summarizeBtn = rvisedContainer.querySelector('#rvised-summarize-btn');
      if (summarizeBtn) {
        summarizeBtn.addEventListener('click', handleSummarize);
      }
      
      // Sign-in button (when user is not authenticated)
      const signinBtn = rvisedContainer.querySelector('#rvised-signin-btn');
      if (signinBtn) {
        signinBtn.addEventListener('click', async (event) => {
          console.log('🔐 Opening sign-in page...');
          
          // DEVELOPER SHORTCUT - Hold Shift+Click to instantly authenticate for testing
          if (event.shiftKey) {
            console.log('🔧 Developer shortcut: Instant auth');
            const testAuth = {
              userEmail: 'developer@rvised.app',
              authToken: 'dev-token-' + Date.now(),
              userTier: 'free',
              onboardingComplete: true
            };
            
            chrome.storage.local.set(testAuth, () => {
              userEmail = testAuth.userEmail;
              userTier = testAuth.userTier;
              isSummarized = false;
              createExtensionUI();
              
              // Show success
              const msg = document.createElement('div');
              msg.style.cssText = 'position:fixed;top:20px;right:20px;background:#10b981;color:white;padding:12px 20px;border-radius:8px;z-index:999999;';
              msg.textContent = '✅ Dev auth activated!';
              document.body.appendChild(msg);
              setTimeout(() => msg.remove(), 2000);
            });
            return;
          }
          
          const apiBase = await resolveApiBaseUrl();
          
          // Create sign-in URL with proper redirect
          const redirectUrl = encodeURIComponent(`${apiBase}/dashboard?extension=true&autoclose=true`);
          
          // For testing: Add timestamp to force fresh auth check
          const timestamp = Date.now();
          const signInUrl = `${apiBase}/sign-in?redirect_url=${redirectUrl}&t=${timestamp}`;
          
          console.log('📍 Sign-in URL:', signInUrl);
          
          // Open sign-in in new tab
          const authWindow = window.open(signInUrl, '_blank');
          
          // For testing: Listen for successful auth
          let checkCount = 0;
          let checkInterval = setInterval(() => {
            checkCount++;
            
            // Check auth status from storage
            chrome.storage.local.get(['userEmail', 'authToken', 'onboardingComplete'], (result) => {
              if (result.userEmail && result.userEmail !== 'guest' && result.authToken) {
                clearInterval(checkInterval);
                console.log('✅ Authentication detected!');
                userEmail = result.userEmail;
                userTier = result.userTier || 'free';
                
                // Refresh the UI immediately
                isSummarized = false; // Reset state
                createExtensionUI();
                
                // Show success message
                const successMsg = document.createElement('div');
                successMsg.style.cssText = `
                  position: fixed;
                  top: 20px;
                  right: 20px;
                  background: #10b981;
                  color: white;
                  padding: 16px 24px;
                  border-radius: 8px;
                  font-size: 14px;
                  font-weight: 600;
                  z-index: 999999;
                  animation: slideIn 0.3s ease-out;
                `;
                successMsg.textContent = '✅ Signed in successfully!';
                document.body.appendChild(successMsg);
                
                setTimeout(() => successMsg.remove(), 3000);
              }
            });
            
            // Also check if window is closed
            try {
              if (authWindow && authWindow.closed) {
                console.log('🔄 Auth window closed');
                // Continue checking for a bit after window closes
                if (checkCount > 5) {
                  clearInterval(checkInterval);
                }
              }
            } catch (e) {
              // Window from different origin, can't check
            }
            
            // Stop after 60 checks (1 minute)
            if (checkCount > 60) {
              clearInterval(checkInterval);
              console.log('⏱️ Auth check timeout');
            }
          }, 1000);
        });
      }
      
      // Regenerate button
      const regenerateBtn = rvisedContainer.querySelector('#rvised-regenerate-btn');
      if (regenerateBtn) {
        regenerateBtn.addEventListener('click', () => {
          console.log('🔄 Regenerating summary...');
          // Clear existing summary to show fresh generation
          summaryData = null;
          isSummarized = false;
          handleSummarize();
        });
      }
      
      // Settings button - opens settings screen
      const settingsBtn = rvisedContainer.querySelector('#rvised-settings-btn');
      if (settingsBtn && !settingsBtn.dataset.listenerAdded) {
        settingsBtn.dataset.listenerAdded = 'true';
        settingsBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          console.log('⚙️ Settings button clicked');
          showSettings = !showSettings;
          showCreateProject = false;
          showProfileDropdown = false;
          showOptionsDropdown = false;
          createExtensionUI();
        });
      }
      
      // Note: Close button removed per user request
      
      // Download button
      const downloadBtn = rvisedContainer.querySelector('#rvised-download-btn');
      if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
          handleDownload();
        });
      }
      
      // Profile button handler moved below to avoid duplication
      
      // Settings change handlers - use let and check existence
      {
        let modeSelect = rvisedContainer.querySelector('#rvised-mode-select');
        if (modeSelect && !modeSelect.dataset.listenerAdded) {
          modeSelect.dataset.listenerAdded = 'true';
          modeSelect.addEventListener('change', (e) => {
            activeMode = e.target.value;
            console.log('🎯 Learning mode changed to:', activeMode);
            // Save preference
            if (chrome.storage) {
              chrome.storage.local.set({ learningMode: activeMode });
            }
          });
        }
        
        let depthSelect = rvisedContainer.querySelector('#rvised-depth-select');
        if (depthSelect && !depthSelect.dataset.listenerAdded) {
          depthSelect.dataset.listenerAdded = 'true';
          depthSelect.addEventListener('change', (e) => {
            readingDepth = e.target.value;
            console.log('📚 Summary depth changed to:', readingDepth);
            // Save preference
            if (chrome.storage) {
              chrome.storage.local.set({ summaryDepth: readingDepth });
            }
          });
        }
        
        let timestampsToggle = rvisedContainer.querySelector('#rvised-timestamps-toggle');
        if (timestampsToggle && !timestampsToggle.dataset.listenerAdded) {
          timestampsToggle.dataset.listenerAdded = 'true';
          timestampsToggle.addEventListener('change', (e) => {
            includeTimestamps = e.target.checked;
            console.log('⏰ Include timestamps:', includeTimestamps);
            // Save preference
            if (chrome.storage) {
              chrome.storage.local.set({ includeTimestamps });
            }
          });
        }
        
        let quizToggle = rvisedContainer.querySelector('#rvised-quiz-toggle');
        if (quizToggle && !quizToggle.dataset.listenerAdded) {
          quizToggle.dataset.listenerAdded = 'true';
          quizToggle.addEventListener('change', (e) => {
            generateQuiz = e.target.checked;
            console.log('🧩 Generate quiz:', generateQuiz);
            // Save preference
            if (chrome.storage) {
              chrome.storage.local.set({ generateQuiz });
            }
          });
        }
        
        let transcriptToggle = rvisedContainer.querySelector('#rvised-transcript-toggle');
        if (transcriptToggle && !transcriptToggle.dataset.listenerAdded) {
          transcriptToggle.dataset.listenerAdded = 'true';
          transcriptToggle.addEventListener('change', (e) => {
            includeTranscript = e.target.checked;
            console.log('📝 Include transcript:', includeTranscript);
            // Save preference
            if (chrome.storage) {
              chrome.storage.local.set({ includeTranscript });
            }
          });
        }
      }
      
      // Close settings
      {
        let closeSettingsBtn = rvisedContainer.querySelector('#rvised-close-settings');
        if (closeSettingsBtn && !closeSettingsBtn.dataset.listenerAdded) {
          closeSettingsBtn.dataset.listenerAdded = 'true';
          closeSettingsBtn.addEventListener('click', () => {
            showSettings = false;
            createExtensionUI();
          });
        }
      }
      
      // Apply settings
      {
        let applySettingsBtn = rvisedContainer.querySelector('#rvised-apply-settings');
        if (applySettingsBtn && !applySettingsBtn.dataset.listenerAdded) {
          applySettingsBtn.dataset.listenerAdded = 'true';
          applySettingsBtn.addEventListener('click', () => {
            // Get settings from the form
            const modeInputs = rvisedContainer.querySelectorAll('input[name="mode"]');
            const depthInputs = rvisedContainer.querySelectorAll('input[name="depth"]');
          
          modeInputs.forEach(input => {
            if (input.checked) activeMode = input.value;
          });
          
          depthInputs.forEach(input => {
            if (input.checked) readingDepth = input.value;
          });
          
          // Get checkbox states
          const timestampsOpt = rvisedContainer.querySelector('input[type="checkbox"][id*="timestamps"]');
          const quizOpt = rvisedContainer.querySelector('input[type="checkbox"][id*="quiz"]');
          const transcriptOpt = rvisedContainer.querySelector('input[type="checkbox"][id*="transcript"]');
          
          if (timestampsOpt) includeTimestamps = timestampsOpt.checked;
          if (quizOpt) generateQuiz = quizOpt.checked;
          if (transcriptOpt) includeTranscript = transcriptOpt.checked;
          
            console.log('⚙️ Settings applied:', { activeMode, readingDepth, includeTimestamps, generateQuiz, includeTranscript });
            showSettings = false;
            createExtensionUI();
          });
        }
      }
      
      // Copy button
      const copyBtn = rvisedContainer.querySelector('#rvised-copy-btn');
      if (copyBtn) {
        copyBtn.addEventListener('click', handleCopy);
      }
      
      
      // Profile button - Toggle profile dropdown
      const profileBtn = rvisedContainer.querySelector('#rvised-profile-btn');
      if (profileBtn && !profileBtn.dataset.listenerAdded) {
        profileBtn.dataset.listenerAdded = 'true';
        profileBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          console.log('👤 Profile button clicked');
          showProfileDropdown = !showProfileDropdown;
          showOptionsDropdown = false; // Close options when opening profile
          createExtensionUI();
        });
      }
      
      // Options button - Toggle options dropdown
      const optionsBtn = rvisedContainer.querySelector('#rvised-options-btn');
      if (optionsBtn) {
        optionsBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          showOptionsDropdown = !showOptionsDropdown;
          showProfileDropdown = false; // Close profile when opening options
          createExtensionUI();
        });
      }
      
      // Options checkboxes
      const timestampsCheckbox = rvisedContainer.querySelector('#opt-timestamps');
      if (timestampsCheckbox) {
        timestampsCheckbox.addEventListener('change', (e) => {
          e.stopPropagation();
          includeTimestamps = timestampsCheckbox.checked;
          saveSettings();
          // Don't close dropdown, just update state
        });
      }
      
      const emojisCheckbox = rvisedContainer.querySelector('#opt-emojis');
      if (emojisCheckbox) {
        emojisCheckbox.addEventListener('change', (e) => {
          e.stopPropagation();
          includeEmojis = emojisCheckbox.checked;
          saveSettings();
          // Don't close dropdown, just update state
        });
      }
      
      // Profile dropdown links
      const dashboardLink = rvisedContainer.querySelector('#rvised-dashboard-link');
      if (dashboardLink) {
        dashboardLink.addEventListener('click', async () => {
          // Check if user is Pro before opening dashboard
          if (userTier !== 'pro' && userTier !== 'premium') {
            showProfileDropdown = false;
            showProFeatureMessage('Dashboard');
            return;
          }
          // Reload projects before opening dashboard
          await loadProjects();
          const dashboardUrl = await getDashboardUrl();
          window.open(dashboardUrl, '_blank');
          showProfileDropdown = false;
          createExtensionUI();
        });
      }
      
      
      const upgradeLink = rvisedContainer.querySelector('#rvised-upgrade-link');
      if (upgradeLink) {
        upgradeLink.addEventListener('click', async () => {
          const dashboardUrl = await getDashboardUrl();
          window.open(`${dashboardUrl}/upgrade`, '_blank');
          showProfileDropdown = false;
          createExtensionUI();
        });
      }
      
      // Sign out button
      const signoutBtn = rvisedContainer.querySelector('#rvised-signout-btn');
      if (signoutBtn) {
        signoutBtn.addEventListener('click', () => {
          // Clear stored user data
          if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.clear(() => {
              console.log('✅ User signed out');
              userEmail = null;
              userTier = 'free';
              showProfileDropdown = false;
              createExtensionUI();
              alert('You have been signed out successfully.');
            });
          } else {
            userEmail = null;
            userTier = 'free';
            showProfileDropdown = false;
            createExtensionUI();
          }
        });
      }
      
      // Close dropdowns when clicking outside
      document.addEventListener('click', (e) => {
        const profileDropdown = rvisedContainer?.querySelector('#rvised-profile-dropdown');
        const profileBtn = rvisedContainer?.querySelector('#rvised-profile-btn');
        const optionsDropdown = rvisedContainer?.querySelector('#rvised-options-dropdown');
        const optionsBtn = rvisedContainer?.querySelector('#rvised-options-btn');
        
        if (showProfileDropdown && profileDropdown && !profileDropdown.contains(e.target) && !profileBtn?.contains(e.target)) {
          showProfileDropdown = false;
          createExtensionUI();
        }
        
        if (showOptionsDropdown && optionsDropdown && !optionsDropdown.contains(e.target) && !optionsBtn?.contains(e.target)) {
          showOptionsDropdown = false;
          createExtensionUI();
        }
      });
      
      // Create project button
      const createProjectBtn = rvisedContainer.querySelector('#rvised-create-project');
      if (createProjectBtn) {
        createProjectBtn.addEventListener('click', () => {
          showCreateProject = true;
          createExtensionUI();
        });
      }
      
      // Close project screen
      const closeProjectBtn = rvisedContainer.querySelector('#rvised-close-project');
      if (closeProjectBtn) {
        closeProjectBtn.addEventListener('click', () => {
          showCreateProject = false;
          createExtensionUI();
        });
      }
      
      // Cancel project
      const cancelProjectBtn = rvisedContainer.querySelector('#rvised-cancel-project');
      if (cancelProjectBtn) {
        cancelProjectBtn.addEventListener('click', () => {
          showCreateProject = false;
          createExtensionUI();
        });
      }
      
      // Create project submit
      const createProjectSubmitBtn = rvisedContainer.querySelector('#rvised-create-project-btn');
      if (createProjectSubmitBtn) {
        createProjectSubmitBtn.addEventListener('click', async () => {
          const projectName = rvisedContainer.querySelector('#rvised-project-name')?.value || '';
          const projectDesc = rvisedContainer.querySelector('#rvised-project-desc')?.value || '';
          
          if (projectName.trim()) {
            console.log('📁 Creating project:', projectName);
            // Send to API
            try {
              const apiBase = await resolveApiBaseUrl();
              const response = await fetch(`${apiBase}/api/projects`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-user-email': userEmail || 'guest',
                  'x-user-tier': userTier
                },
                body: JSON.stringify({
                  action: 'create',
                  name: projectName,
                  description: projectDesc,
                  emoji: '📁'
                })
              });
              
              console.log('📬 Create project response:', response.status, response.statusText);
              
              if (response.ok) {
                const data = await response.json();
                console.log('✅ Project created successfully:', data.project);
                
                // Also save to local storage for persistence
                chrome.storage.local.get(['localProjects'], (result) => {
                  const localProjects = result.localProjects || [];
                  localProjects.push(data.project);
                  chrome.storage.local.set({ localProjects }, () => {
                    console.log('📁 Project saved locally');
                  });
                });
                
                // Add to available projects immediately
                availableProjects.push(data.project);
                
                showCreateProject = false;
                // Refresh UI
                createExtensionUI();
                // Show success notification
                showNotification(`✅ Project "${projectName}" created successfully!`);
              } else {
                const errorData = await response.text();
                console.error('❌ Create project failed:', errorData);
                showNotification(`Failed to create project`, 'error');
              }
            } catch (error) {
              console.error('❌ Failed to create project:', error);
              showNotification(`Error creating project`, 'error');
            }
          }
        });
      }
      
      // Generate quiz button (in quiz tab)
      const generateQuizTabBtn = rvisedContainer.querySelector('#rvised-generate-quiz-tab');
      if (generateQuizTabBtn) {
        generateQuizTabBtn.addEventListener('click', async () => {
          console.log('🧩 Generate Quiz button clicked from tab');
          generateQuizTabBtn.disabled = true;
          generateQuizTabBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
              <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
            <span>Generating...</span>
          `;
          await generateQuizQuestions();
        });
      }
      
      // Quiz option click handler using event delegation for dynamic content
      rvisedContainer.addEventListener('click', function(e) {
        // Check if clicked element is a quiz option or child of one
        const quizOption = e.target.closest('.quiz-option');
        if (!quizOption) return;
        
        const questionId = quizOption.dataset.question;
        const clickedOptionIndex = parseInt(quizOption.dataset.option, 10);
        const isCorrect = quizOption.dataset.correct === 'true';
        const questionCard = quizOption.closest('.quiz-question-card');
        const feedback = questionCard.querySelector('.quiz-feedback');
        const allOptions = questionCard.querySelectorAll('.quiz-option');
        const optionCircle = quizOption.querySelector('.option-circle');
        const indicator = quizOption.querySelector('.option-indicator');
        
        // CRITICAL DEBUG: Log what we're actually checking
        console.log(`🔴 CLICK DEBUG:`, {
          questionId,
          clickedOptionIndex,
          dataCorrect: quizOption.dataset.correct,
          isCorrect,
          clickedText: quizOption.textContent.trim()
        });
        
        // Debug logging
        console.log('🎯 Quiz option clicked:', {
          questionId,
          isCorrect,
          dataCorrect: quizOption.dataset.correct,
          optionIndex: quizOption.dataset.option,
          allOptionsData: Array.from(allOptions).map(opt => ({
            text: opt.textContent.trim(),
            correct: opt.dataset.correct,
            optionIdx: opt.dataset.option
          }))
        });
        
        // Also log the actual quiz data from memory
        if (summaryData && summaryData.quiz && summaryData.quiz[questionId]) {
          const quizQuestion = summaryData.quiz[questionId];
          console.log('📚 Quiz data from memory:', {
            question: quizQuestion.question,
            correctIndex: quizQuestion.correct,
            correctAnswer: quizQuestion.options[quizQuestion.correct],
            clickedOption: quizQuestion.options[quizOption.dataset.option],
            allOptions: quizQuestion.options
          });
          
          // Double-check the data attributes
          console.log('🔍 Data attribute check:');
          allOptions.forEach((opt, i) => {
            console.log(`  Option ${i}: data-correct="${opt.dataset.correct}" (should be ${i === quizQuestion.correct ? 'true' : 'false'})`);
          });
        }
        
        // Check if already answered
        if (quizOption.disabled) {
          return;
        }
        
        // Disable all options for this question
        allOptions.forEach(opt => {
          opt.disabled = true;
          opt.style.cursor = 'not-allowed';
          opt.style.opacity = '0.7';
        });
        
        // Mark selected option
        quizOption.classList.add('selected');
        quizOption.style.opacity = '1';
        
        if (isCorrect) {
          // Correct answer - make it green
          quizOption.style.background = '#dcfce7';
          quizOption.style.borderColor = '#22c55e';
          quizOption.style.color = '#166534';
          if (optionCircle) {
            optionCircle.style.background = '#22c55e';
            optionCircle.style.borderColor = '#22c55e';
          }
          if (indicator) {
            indicator.innerHTML = '✓';
            indicator.style.display = 'block';
            indicator.style.color = 'white';
            indicator.style.fontWeight = 'bold';
          }
          
          if (feedback) {
            feedback.style.display = 'block';
            feedback.style.background = '#dcfce7';
            feedback.style.borderLeft = '4px solid #22c55e';
            feedback.style.color = '#166534';
            feedback.innerHTML = '✅ Correct! Well done!';
          }
        } else {
          // Wrong answer - make it red
          quizOption.style.background = '#fee2e2';
          quizOption.style.borderColor = '#ef4444';
          quizOption.style.color = '#991b1b';
          if (optionCircle) {
            optionCircle.style.background = '#ef4444';
            optionCircle.style.borderColor = '#ef4444';
          }
          if (indicator) {
            indicator.innerHTML = '✗';
            indicator.style.display = 'block';
            indicator.style.color = 'white';
            indicator.style.fontWeight = 'bold';
          }
          
          // Highlight the correct answer in green
          let foundCorrect = false;
          allOptions.forEach(opt => {
            console.log('Checking option for correct:', {
              optionText: opt.textContent.trim(),
              dataCorrect: opt.dataset.correct,
              isTrue: opt.dataset.correct === 'true'
            });
            if (opt.dataset.correct === 'true') {
              foundCorrect = true;
              opt.style.background = '#dcfce7';
              opt.style.borderColor = '#22c55e';
              opt.style.color = '#166534';
              opt.style.opacity = '1';
              const correctCircle = opt.querySelector('.option-circle');
              const correctIndicator = opt.querySelector('.option-indicator');
              if (correctCircle) {
                correctCircle.style.background = '#22c55e';
                correctCircle.style.borderColor = '#22c55e';
              }
              if (correctIndicator) {
                correctIndicator.innerHTML = '✓';
                correctIndicator.style.display = 'block';
                correctIndicator.style.color = 'white';
                correctIndicator.style.fontWeight = 'bold';
              }
            }
          });
          
          if (!foundCorrect) {
            console.error('⚠️ No correct answer found in options!');
          }
          
          if (feedback) {
            feedback.style.display = 'block';
            feedback.style.background = '#fee2e2';
            feedback.style.borderLeft = '4px solid #ef4444';
            feedback.style.color = '#991b1b';
            feedback.innerHTML = '❌ Incorrect. The correct answer is highlighted in green above.';
          }
        }
      });
      
      // Generate quiz button (legacy - appears when no quiz exists)
      const generateQuizBtn = rvisedContainer.querySelector('#rvised-generate-quiz');
      if (generateQuizBtn) {
        generateQuizBtn.addEventListener('click', async () => {
          console.log('🧩 Generate Quiz button clicked');
          generateQuizBtn.disabled = true;
          generateQuizBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
              <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
            <span>Generating...</span>
          `;
          await generateQuizQuestions();
        });
      }
      
      // Toggle quiz button (shows/hides existing quiz)
      const toggleQuizBtn = rvisedContainer.querySelector('#rvised-toggle-quiz');
      if (toggleQuizBtn) {
        toggleQuizBtn.addEventListener('click', () => {
          showQuiz = !showQuiz;
          console.log('🧩 Quiz toggled:', showQuiz);
          createExtensionUI();
        });
      }
      
      // Save summary button
      const saveSummaryBtn = rvisedContainer.querySelector('#rvised-save-summary');
      if (saveSummaryBtn) {
        saveSummaryBtn.addEventListener('click', handleSaveSummary);
      }
      
      // Timestamp clicks for navigation
      const timestampElements = rvisedContainer.querySelectorAll('.rvised-summary-item[data-timestamp]');
      timestampElements.forEach(element => {
        element.addEventListener('click', () => {
          const timestamp = element.dataset.timestamp;
          const seconds = parseTimeToSeconds(timestamp);
          const video = document.querySelector('video');
          if (video) {
            video.currentTime = seconds;
            video.play();
            console.log(`⏰ Jumping to ${timestamp} (${seconds}s)`);
          }
        });
      });
      
      // Also handle timestamp badges
      const timestampBadges = rvisedContainer.querySelectorAll('.rvised-timestamp-badge');
      timestampBadges.forEach(badge => {
        badge.style.cursor = 'pointer';
        badge.addEventListener('click', (e) => {
          e.stopPropagation();
          const timestamp = badge.textContent.trim();
          const seconds = parseTimeToSeconds(timestamp);
          const video = document.querySelector('video');
          if (video) {
            video.currentTime = seconds;
            video.play();
            console.log(`⏰ Jumping to ${timestamp} (${seconds}s)`);
          }
        });
      });
    }

    // Fetch transcript directly from YouTube
    async function fetchTranscript() {
      console.log('📄 Fetching transcript...');
      const videoId = getVideoId();
      if (!videoId) {
        console.error('❌ No video ID found');
        return;
      }
      
      try {
        // Try to get transcript from API
        const apiBase = await resolveApiBaseUrl();
        const response = await fetch(`${apiBase}/api/transcript`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            videoUrl: `https://www.youtube.com/watch?v=${videoId}`
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.transcript) {
            rawTranscript = result.transcript;
            console.log('✅ Transcript fetched successfully');
            
            // Update the transcript in summaryData if it exists
            if (summaryData) {
              summaryData.transcript = rawTranscript;
            }
          }
        }
      } catch (error) {
        console.error('❌ Failed to fetch transcript:', error);
      }
    }

    // Generate quiz questions for existing summary
    async function generateQuizQuestions() {
      if (!summaryData) {
        console.error('❌ No summary data available for quiz generation');
        alert('Please generate a summary first before creating quiz questions.');
        return;
      }
      
      console.log('🧩 Generating quiz questions...');
      
      try {
        const videoId = getVideoId();
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const { videoTitle } = getVideoInfo();
        
        // Don't use custom prompt for quiz - let the API generate from actual transcript
        // This ensures quiz questions are based on actual video content, not summary
        console.log('🎯 Generating quiz from actual transcript for mode:', activeMode);
        
        // Call API to generate quiz
        const apiBase = await resolveApiBaseUrl();
        const response = await fetch(`${apiBase}/api/summarize`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-tier': userTier || 'free'
          },
          body: JSON.stringify({
            videoUrl: videoUrl,
            settings: {
              learningMode: activeMode,
              summaryDepth: 'quick', // Use quick for quiz generation
              includeTimestamps: false,
              includeActionItems: false,
              includeQuiz: true,
              includeTranscript: false,
              // Don't send customPrompt - let API generate quiz from transcript
              quizOnly: true // Flag to indicate we only want quiz
            }
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            // Update only the quiz portion of summaryData
            if (result.data.quiz || result.data.quizQuestions) {
              let quizData = result.data.quiz || result.data.quizQuestions || [];
              
              // Validate and fix quiz data
              quizData = quizData.map((q, idx) => {
                let correctIdx = q.correct !== undefined ? q.correct : (q.correctIndex !== undefined ? q.correctIndex : 0);
                correctIdx = parseInt(correctIdx, 10);
                
                // Ensure correct index is within bounds
                if (isNaN(correctIdx) || correctIdx < 0 || correctIdx >= (q.options?.length || 4)) {
                  console.error(`Invalid correct index for question ${idx + 1}: ${correctIdx}`);
                  return null;
                }
                
                return {
                  ...q,
                  correct: correctIdx
                };
              }).filter(q => q !== null);
              
              summaryData.quiz = quizData;
              console.log('✅ Quiz questions generated:', summaryData.quiz.length);
              console.log('📋 Quiz data structure:', JSON.stringify(summaryData.quiz, null, 2));
              
              // Log each question's correct answer index
              summaryData.quiz.forEach((q, idx) => {
                console.log(`Question ${idx + 1}:`, {
                  question: q.question,
                  options: q.options,
                  correct: q.correct,
                  correctAnswerText: q.options[q.correct]
                });
              });
              
              // Update UI to show quiz
              showQuiz = true;
              activeTab = 'quiz'; // Switch to quiz tab automatically
              createExtensionUI();
            }
          }
        } else {
          console.error('❌ Failed to generate quiz questions');
          alert('Failed to generate quiz questions. Please try again.');
        }
      } catch (error) {
        console.error('❌ Error generating quiz:', error);
        alert('Error generating quiz questions. Please try again.');
      }
    }
    
    // Handle summarize - Using new enhanced prompts
    async function handleSummarize() {
      console.log('🎯 Summarize button clicked');
      
      const videoId = getVideoId();
      if (!videoId) {
        console.error('❌ No video ID found');
        alert('Could not find video ID. Please make sure you are on a YouTube video page.');
        return;
      }
      
      // Check usage limits FIRST before processing
      try {
        const apiBase = await resolveApiBaseUrl();
        const video = document.querySelector('video');
        const videoLengthSeconds = video ? Math.floor(video.duration) : 0;
        
        // Check usage limits
        const usageResponse = await fetch(`${apiBase}/api/usage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': userEmail || 'guest'
          },
          body: JSON.stringify({
            action: 'check',
            videoLength: videoLengthSeconds
          })
        });
        
        if (!usageResponse.ok) {
          const usageError = await usageResponse.json();
          
          // Handle limit reached
          if (usageError.limitType === 'daily') {
            const upgradeConfirm = confirm(`${usageError.message}\n\nWould you like to upgrade to Pro for unlimited summaries?`);
            if (upgradeConfirm) {
              const dashboardUrl = await getDashboardUrl();
              window.open(`${dashboardUrl}/upgrade`, '_blank');
            }
            return;
          } else if (usageError.limitType === 'videoLength') {
            const upgradeConfirm = confirm(`${usageError.message}\n\nWould you like to upgrade to Pro to summarize videos of any length?`);
            if (upgradeConfirm) {
              const dashboardUrl = await getDashboardUrl();
              window.open(`${dashboardUrl}/upgrade`, '_blank');
            }
            return;
          }
        }
      } catch (error) {
        console.log('Usage check failed, continuing anyway:', error);
      }
      
      if (rvisedButton) {
        rvisedButton.classList.add('processing');
        const span = rvisedButton.querySelector('span');
        if (span) span.textContent = 'Summarizing...';
      }
      
      isProcessing = true;
      isSummarized = false;
      isCollapsed = false;
      showProfileDropdown = false;
      createExtensionUI();
      
      try {
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const { videoTitle, channelName } = getVideoInfo();
        console.log('📤 Sending request to API with video:', videoUrl);
        
        // Generate custom prompt based on mode and depth
        let customPrompt = '';
        if (typeof window.generateSummaryPrompt === 'function') {
          customPrompt = window.generateSummaryPrompt(activeMode, readingDepth, videoTitle, channelName);
          console.log('🎯 Using custom prompt for mode:', activeMode, 'depth:', readingDepth);
        }
        
        const apiBase = await resolveApiBaseUrl();
        
        // Get auth token from storage
        let authToken = null;
        if (chrome?.storage?.local) {
          await new Promise((resolve) => {
            chrome.storage.local.get(['authToken'], (result) => {
              authToken = result.authToken;
              resolve();
            });
          });
        }
        
        console.log('🚀 Sending summarize request to:', `${apiBase}/api/summarize`);
        console.log('📦 Request payload:', {
          videoUrl: videoUrl,
          userEmail: userEmail,
          settings: {
            learningMode: activeMode,
            summaryDepth: readingDepth,
            includeTimestamps: false,
            includeActionItems: true,
            includeQuiz: generateQuiz,
            includeTranscript,
            includeEmojis: includeEmojis,
            customPrompt: customPrompt
          }
        });
        
        const response = await fetch(`${apiBase}/api/summarize`, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            'x-user-tier': userTier || 'free',
            'x-user-email': userEmail || 'guest',
            'Authorization': authToken ? `Bearer ${authToken}` : ''
          },
          body: JSON.stringify({
            videoUrl: videoUrl,
            userEmail: userEmail,
            authToken: authToken,
            settings: {
              learningMode: activeMode,
              summaryDepth: readingDepth,
              includeTimestamps: false, // Changed to false to match working API
              includeActionItems: true,
              includeQuiz: generateQuiz,
              includeTranscript,
              includeEmojis: includeEmojis,
              customPrompt: customPrompt // Pass the custom prompt
            }
          })
        });
        
        console.log('📥 Response received:', response.status, response.statusText);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('🔴 API Error Response:', errorText);
          throw new Error(`API error (${response.status}): ${errorText || response.statusText}`);
        }
        
        // Check for authentication failure first
        if (response.status === 401) {
          const authError = await response.json();
          console.log('🔐 Authentication required:', authError);
          isProcessing = false;
          if (rvisedButton) {
            rvisedButton.classList.remove('processing');
            const span = rvisedButton.querySelector('span');
            if (span) span.textContent = 'Sign In Required';
          }
          
          // Show sign-in prompt in the UI
          createExtensionUI();
          
          const signinConfirm = confirm('Sign in is required to generate summaries.\n\nWould you like to sign in now?');
          if (signinConfirm) {
            const apiBase = await resolveApiBaseUrl();
            const signInUrl = apiBase.replace('http://localhost:3002', 'http://localhost:3002') + '/sign-in?redirect_url=/dashboard';
            window.open(signInUrl, '_blank');
          }
          return;
        }
        
        const result = await response.json();
        console.log('✅ API Response:', result);
        
        if (!result.success) {
          throw new Error(result.error || 'API returned unsuccessful response');
        }
        
        if (result.success && result.data) {
          console.log('📊 Summary data received, updating UI...');
          // Extract timestamps from various possible locations
          const timestamps = result.data.timestampedSections || 
                             result.data.timestamps || 
                             result.data._debug?.timestamps || 
                             [];
          
          // Transform timestampedSections to match UI expectations
          const transformedTimestamps = timestamps.map(section => {
            if (section.time && section.description) {
              // Extract title from description (first sentence or first few words)
              const title = section.description.split('.')[0] || 
                           section.description.substring(0, 50) || 
                           'Section';
              
              return {
                time: section.time,
                title: title.substring(0, 50), // Limit title length
                content: section.description || '',
                keywords: [] // Extract keywords from content if needed
              };
            }
            return section; // Return as-is if already in correct format
          });
          
          // Process quiz data - DO NOT MODIFY THE INDICES
          let quizData = result.data.quiz || result.data.quizQuestions || [];
          
          // Validate quiz data but DO NOT change the correct indices
          quizData = quizData.map((q, idx) => {
            let correctIdx = q.correct !== undefined ? q.correct : (q.correctIndex !== undefined ? q.correctIndex : null);
            
            console.log(`📋 Quiz Q${idx + 1} from API:`, {
              question: q.question,
              options: q.options,
              correct: correctIdx,
              answer: q.answer
            });
            
            if (correctIdx === null || correctIdx === undefined) {
              console.error(`No correct index provided for question ${idx + 1}`);
              return null;
            }
            
            correctIdx = parseInt(correctIdx, 10);
            
            // Ensure correct index is within bounds
            if (isNaN(correctIdx) || correctIdx < 0 || correctIdx >= (q.options?.length || 4)) {
              console.error(`Invalid correct index for question ${idx + 1}: ${correctIdx}`);
              return null;
            }
            
            // Log what we're keeping
            console.log(`✅ Keeping Q${idx + 1}: correct index = ${correctIdx}, answer = "${q.options[correctIdx]}"`);
            
            return {
              question: q.question,
              options: q.options, // Keep options in exact order from API
              correct: correctIdx, // Keep exact index from API
              answer: q.answer || q.options[correctIdx] // Preserve answer field
            };
          }).filter(q => q !== null);
          
          // Generate a dynamic title based on the main takeaway and video context
          const generateVideoTitle = (takeaway, videoTitle, mode) => {
            if (!takeaway) return 'Key Insight';
            
            // Extract core concepts from the takeaway
            const takeawayLower = takeaway.toLowerCase();
            
            // Technology/Programming keywords
            if (takeawayLower.includes('app') || takeawayLower.includes('code') || takeawayLower.includes('build')) {
              if (takeawayLower.includes('without code') || takeawayLower.includes('no code') || takeawayLower.includes('no-code')) {
                return 'No-Code Revolution';
              }
              if (takeawayLower.includes('ai') || takeawayLower.includes('artificial') || takeawayLower.includes('gpt')) {
                return 'AI-Powered Development';
              }
              if (takeawayLower.includes('react') || takeawayLower.includes('javascript') || takeawayLower.includes('python')) {
                return 'Code Mastery';
              }
              if (takeawayLower.includes('clone') || takeawayLower.includes('copy')) {
                return 'Clone & Improve Strategy';
              }
              return 'Build Smarter';
            }
            
            // Learning/Education keywords
            if (takeawayLower.includes('learn') || takeawayLower.includes('master') || takeawayLower.includes('skill')) {
              if (takeawayLower.includes('fast') || takeawayLower.includes('quick')) {
                return 'Accelerated Learning';
              }
              return 'Master the Fundamentals';
            }
            
            // Business/Success keywords
            if (takeawayLower.includes('money') || takeawayLower.includes('business') || takeawayLower.includes('success')) {
              if (takeawayLower.includes('million') || takeawayLower.includes('scale')) {
                return 'Scale to Millions';
              }
              if (takeawayLower.includes('passive') || takeawayLower.includes('income')) {
                return 'Passive Income Blueprint';
              }
              if (takeawayLower.includes('startup') || takeawayLower.includes('entrepreneur')) {
                return 'Startup Success Formula';
              }
              return 'Business Blueprint';
            }
            
            // Productivity/Self-improvement keywords
            if (takeawayLower.includes('productiv') || takeawayLower.includes('habit') || takeawayLower.includes('routine')) {
              if (takeawayLower.includes('morning') || takeawayLower.includes('daily')) {
                return 'Daily Success Routine';
              }
              if (takeawayLower.includes('10x') || takeawayLower.includes('double')) {
                return '10x Your Output';
              }
              return 'Peak Performance';
            }
            
            // Health/Fitness keywords
            if (takeawayLower.includes('health') || takeawayLower.includes('fitness') || takeawayLower.includes('diet')) {
              if (takeawayLower.includes('weight') || takeawayLower.includes('fat')) {
                return 'Body Transformation';
              }
              if (takeawayLower.includes('mental') || takeawayLower.includes('mind')) {
                return 'Mental Health Mastery';
              }
              return 'Health Optimization';
            }
            
            // Marketing/Growth keywords
            if (takeawayLower.includes('marketing') || takeawayLower.includes('growth') || takeawayLower.includes('viral')) {
              if (takeawayLower.includes('social') || takeawayLower.includes('content')) {
                return 'Content That Converts';
              }
              if (takeawayLower.includes('seo') || takeawayLower.includes('traffic')) {
                return 'Traffic Explosion';
              }
              return 'Growth Hacking';
            }
            
            // Design/Creative keywords
            if (takeawayLower.includes('design') || takeawayLower.includes('creative') || takeawayLower.includes('ui')) {
              if (takeawayLower.includes('ux') || takeawayLower.includes('user')) {
                return 'User-Centered Design';
              }
              return 'Design Excellence';
            }
            
            // Science/Research keywords
            if (takeawayLower.includes('research') || takeawayLower.includes('study') || takeawayLower.includes('science')) {
              return 'Scientific Breakthrough';
            }
            
            // Strategy/Method keywords
            if (takeawayLower.includes('strategy') || takeawayLower.includes('method') || takeawayLower.includes('framework')) {
              return 'Strategic Framework';
            }
            
            // Innovation/Change keywords
            if (takeawayLower.includes('new') || takeawayLower.includes('innovative') || takeawayLower.includes('change')) {
              return 'Game-Changing Insight';
            }
            
            // Extract action-based title
            const actionWords = ['how to', 'why you', 'what makes', 'the secret', 'the key'];
            for (const action of actionWords) {
              if (takeawayLower.startsWith(action)) {
                const words = takeaway.split(' ').slice(0, 4);
                return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
              }
            }
            
            // Mode-specific defaults
            if (mode === 'build') {
              return 'Implementation Strategy';
            } else if (mode === 'deep') {
              return 'Core Principle';
            }
            
            // Default: Extract the most important concept
            const importantWords = takeaway.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}\b/g);
            if (importantWords && importantWords.length > 0) {
              return importantWords[0];
            }
            
            return 'Key Discovery';
          };
          
          const mainTakeaway = result.data.mainTakeaway || result.data.keyTakeaway || '';
          // Use AI-generated title if available, otherwise generate from takeaway
          const videoInsightTitle = result.data.videoInsightTitle || generateVideoTitle(mainTakeaway, videoTitle, activeMode);
          
          summaryData = {
            mainTakeaway: mainTakeaway,
            videoInsightTitle: videoInsightTitle,  // New field for dynamic title
            summary: result.data.summary || '',
            keyInsights: result.data.keyInsights || result.data.keyPoints || [],
            actionItems: result.data.actionItems || [],
            timestampedSections: transformedTimestamps,
            techStack: result.data.techStack || [],
            quiz: quizData,
            transcript: result.data.transcript || rawTranscript || '',
            partialSummary: result.data.partialSummary || false,
            coverageInfo: result.data.coverageInfo || ''
          };
          
          // Store raw transcript if provided
          if (result.data.transcript) {
            rawTranscript = result.data.transcript;
          }
          
          isProcessing = false;
          isSummarized = true;
          isCollapsed = false;
          isCardVisible = true;  // Ensure card remains visible
          
          if (rvisedButton) {
            rvisedButton.classList.remove('processing');
            rvisedButton.classList.add('summarized');
            rvisedButton.querySelector('span').textContent = 'View Summary';
          }
          
          console.log('✨ Summary generated, updating UI with data');
          
          // Track successful summary generation for usage limits
          try {
            const apiBase = await resolveApiBaseUrl();
            await fetch(`${apiBase}/api/usage`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-user-email': userEmail || 'guest'
              },
              body: JSON.stringify({
                action: 'summarize'
              })
            });
            console.log('✅ Usage tracked successfully');
          } catch (error) {
            console.log('Failed to track usage:', error);
          }
          
          // Force the card to be visible and create the UI
          await createExtensionUI();
          
          // Double-check the container is visible after creation
          if (rvisedContainer) {
            rvisedContainer.style.display = 'block';
            rvisedContainer.style.visibility = 'visible';
            console.log('✅ Ensured card visibility after summary generation');
          }
          
          // Show coverage info if transcript was capped
          if (summaryData.partialSummary && summaryData.coverageInfo) {
            console.log(`📊 ${summaryData.coverageInfo}`);
          }
        } else {
          throw new Error(result.error || 'Failed to generate summary');
        }
        
      } catch (error) {
        console.error('❌ Error summarizing video:', error);
        console.error('Error details:', error.message || error);
        console.error('Error stack:', error.stack);
        
        isProcessing = false;
        isSummarized = false;
        
        if (rvisedButton) {
          rvisedButton.classList.remove('processing', 'summarized');
          const span = rvisedButton.querySelector('span');
          if (span) span.textContent = 'Summarize';
        }
        
        // Show detailed error
        const errorMessage = error.name === 'AbortError' 
          ? 'Request timed out. Please try again.'
          : `Failed to summarize: ${error.message}`;
        
        alert(errorMessage);
        createExtensionUI();
      }
    }

    // Handle copy functionality
    function handleCopy() {
      if (!summaryData && !rawTranscript) {
        alert('No content to copy. Please summarize the video first.');
        return;
      }
      
      let textToCopy = '';
      
      if (activeTab === 'transcript' && rawTranscript) {
        // Copy raw transcript
        textToCopy = `=== TRANSCRIPT ===\n\n${rawTranscript}`;
      } else if (summaryData) {
        // Copy summary based on current settings
        const sections = [];
        
        // Add video info
        const { videoTitle, channelName } = getVideoInfo();
        sections.push(`📹 ${videoTitle}`);
        if (channelName) sections.push(`👤 ${channelName}`);
        sections.push(''); // Empty line
        
        // Main takeaway
        if (summaryData.mainTakeaway) {
          sections.push('🎯 KEY TAKEAWAY');
          sections.push(summaryData.mainTakeaway);
          sections.push('');
        }
        
        // Summary
        if (summaryData.summary) {
          sections.push('📝 SUMMARY');
          sections.push(summaryData.summary);
          sections.push('');
        }
        
        // Timestamped sections
        if (includeTimestamps && summaryData.timestampedSections?.length) {
          sections.push('⏰ TIMESTAMPS');
          summaryData.timestampedSections.forEach(section => {
            const time = section.time || section.timestamp || '00:00';
            const content = section.title || section.description || section.content || '';
            sections.push(`[${time}] ${content}`);
          });
          sections.push('');
        }
        
        // Key insights
        if (summaryData.keyInsights?.length) {
          sections.push('💡 KEY INSIGHTS');
          summaryData.keyInsights.forEach(insight => {
            sections.push(`• ${insight}`);
          });
          sections.push('');
        }
        
        // Action items
        if (summaryData.actionItems?.length) {
          sections.push('✅ ACTION ITEMS');
          summaryData.actionItems.forEach(item => {
            sections.push(`• ${item}`);
          });
          sections.push('');
        }
        
        // Quiz
        if (generateQuiz && summaryData.quiz?.length) {
          sections.push('🧩 QUIZ');
          summaryData.quiz.forEach((q, i) => {
            sections.push(`Q${i+1}: ${q.question}`);
            sections.push(`A: ${q.answer || 'N/A'}`);
            sections.push('');
          });
        }
        
        // Full transcript if requested
        if (includeTranscript && summaryData.transcript) {
          sections.push('📄 FULL TRANSCRIPT');
          sections.push(summaryData.transcript);
        }
        
        textToCopy = sections.join('\n');
      }
      
      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          // Visual feedback
          const copyBtn = rvisedContainer.querySelector('#rvised-copy-btn');
          if (copyBtn) {
            const originalHTML = copyBtn.innerHTML;
            copyBtn.innerHTML = '✓';
            copyBtn.style.background = '#10b981';
            copyBtn.style.color = 'white';
            copyBtn.style.borderRadius = '6px';
            setTimeout(() => {
              copyBtn.innerHTML = originalHTML;
              copyBtn.style.background = '';
              copyBtn.style.color = '';
            }, 2000);
          }
          console.log('✅ Content copied to clipboard');
        }).catch(err => {
          console.error('Failed to copy:', err);
          alert('Failed to copy to clipboard');
        });
      }
    }

    // Handle download functionality
    function handleDownload() {
      if (!summaryData && !rawTranscript) {
        alert('No content to download. Please summarize the video first.');
        return;
      }
      
      const { videoTitle, channelName } = getVideoInfo();
      const timestamp = new Date().toISOString().split('T')[0];
      const safeTitle = videoTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      
      let content = '';
      let filename = '';
      
      if (activeTab === 'transcript' && rawTranscript) {
        // Download raw transcript
        filename = `${safeTitle}_transcript_${timestamp}.txt`;
        content = `${videoTitle}\n${channelName}\n${'='.repeat(50)}\n\nTRANSCRIPT\n\n${rawTranscript}`;
      } else if (summaryData) {
        // Download summary as markdown
        filename = `${safeTitle}_summary_${timestamp}.md`;
        
        const lines = [
          `# ${videoTitle}`,
          channelName ? `*By ${channelName}*` : '',
          `*Generated on ${new Date().toLocaleDateString()}*`,
          '',
          '---',
          ''
        ];
        
        if (summaryData.mainTakeaway) {
          lines.push('## 🎯 Key Takeaway', '', summaryData.mainTakeaway, '');
        }
        
        if (summaryData.summary) {
          lines.push('## 📝 Summary', '', summaryData.summary, '');
        }
        
        if (includeTimestamps && summaryData.timestampedSections?.length) {
          lines.push('## ⏰ Timestamps', '');
          summaryData.timestampedSections.forEach(section => {
            const time = section.time || section.timestamp || '00:00';
            const content = section.title || section.description || section.content || '';
            lines.push(`- **[${time}]** ${content}`);
          });
          lines.push('');
        }
        
        if (summaryData.keyInsights?.length) {
          lines.push('## 💡 Key Insights', '');
          summaryData.keyInsights.forEach(insight => {
            lines.push(`- ${insight}`);
          });
          lines.push('');
        }
        
        if (summaryData.actionItems?.length) {
          lines.push('## ✅ Action Items', '');
          summaryData.actionItems.forEach(item => {
            lines.push(`- [ ] ${item}`);
          });
          lines.push('');
        }
        
        if (summaryData.techStack?.length) {
          lines.push('## 🛠️ Technologies Mentioned', '');
          lines.push(summaryData.techStack.map(tech => `\`${tech}\``).join(' • '));
          lines.push('');
        }
        
        if (generateQuiz && summaryData.quiz?.length) {
          lines.push('## 🧩 Quiz Questions', '');
          summaryData.quiz.forEach((q, i) => {
            lines.push(`### Question ${i+1}`, '', q.question, '', `**Answer:** ${q.answer || 'N/A'}`, '');
          });
        }
        
        if (includeTranscript && summaryData.transcript) {
          lines.push('## 📄 Full Transcript', '', '```', summaryData.transcript, '```', '');
        }
        
        lines.push('---', '', `*Generated by [Rvised](https://rvised.app) - AI-Powered Video Summarizer*`);
        
        content = lines.join('\n');
      }
      
      if (content && filename) {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('✅ Downloaded:', filename);
        
        // Visual feedback
        const dlBtn = rvisedContainer.querySelector('#rvised-download-btn');
        if (dlBtn) {
          const originalHTML = dlBtn.innerHTML;
          dlBtn.innerHTML = '✓';
          dlBtn.style.background = '#10b981';
          dlBtn.style.color = 'white';
          dlBtn.style.borderRadius = '6px';
          setTimeout(() => {
            dlBtn.innerHTML = originalHTML;
            dlBtn.style.background = '';
            dlBtn.style.color = '';
          }, 2000);
        }
      }
    }

    // Handle save summary to project
    async function handleSaveSummary() {
      if (!summaryData) {
        alert('No summary to save. Please summarize the video first.');
        return;
      }
      
      const projectSelect = rvisedContainer.querySelector('#rvised-project-select');
      const selectedProject = projectSelect?.value || 'default';
      
      if (!selectedProject || selectedProject === 'Choose project...') {
        alert('Please select a project or create a new one.');
        return;
      }
      
      const saveBtn = rvisedContainer.querySelector('#rvised-save-summary');
      if (saveBtn) {
        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;
      }
      
      try {
        const apiBase = await resolveApiBaseUrl();
        const { videoTitle, channelName } = getVideoInfo();
        const videoId = getVideoId();
        
        const response = await fetch(`${apiBase}/api/projects`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': userEmail || 'guest',
            'x-user-tier': userTier
          },
          body: JSON.stringify({
            action: 'save',
            projectId: selectedProject,
            projectName: availableProjects.find(p => p.id === selectedProject)?.name || 'My Library',
            videoId,
            videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
            videoTitle,
            channelName,
            summaryData: summaryData,
            learningMode: activeMode,
            summaryDepth: readingDepth,
            videoLength: 0, // You might want to get the actual length
            savedAt: new Date().toISOString()
          })
        });
        
        if (response.ok) {
          console.log('✅ Summary saved to project');
          
          if (saveBtn) {
            saveBtn.textContent = '✓ Saved!';
            saveBtn.style.background = '#10b981';
            // Show success notification
            const projectName = availableProjects.find(p => p.id === selectedProject)?.name || 'project';
            showNotification(`✅ Summary saved to "${projectName}"`);
            setTimeout(() => {
              saveBtn.textContent = 'Save Summary';
              saveBtn.style.background = '';
              saveBtn.disabled = false;
            }, 2000);
          }
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Failed to save' }));
          
          if (response.status === 409) {
            // Duplicate video
            showNotification('⚠️ This video is already saved to this project', 'warning');
          } else {
            throw new Error(errorData.error || 'Failed to save summary');
          }
          
          if (saveBtn) {
            saveBtn.textContent = response.status === 409 ? 'Already Saved' : 'Save Failed';
            saveBtn.style.background = response.status === 409 ? '#f59e0b' : '#ef4444';
            setTimeout(() => {
              saveBtn.textContent = 'Save Summary';
              saveBtn.style.background = '';
              saveBtn.disabled = false;
            }, 2000);
          }
        }
      } catch (error) {
        console.error('❌ Failed to save summary:', error);
        
        if (saveBtn) {
          saveBtn.textContent = 'Save Failed';
          saveBtn.style.background = '#ef4444';
          showNotification('Failed to save summary', 'error');
          setTimeout(() => {
            saveBtn.textContent = 'Save Summary';
            saveBtn.style.background = '';
            saveBtn.disabled = false;
          }, 2000);
        }
      }
    }

    // Initialize extension
    async function init() {
      console.log('🚀 Initializing Rvised extension');
      
      await loadUserData();
      await loadProjects(); // Load available projects
      
      if (window.location.pathname.includes('/watch')) {
        console.log('📺 On YouTube video page');
        
        setTimeout(() => {
          createSummarizeButton();
          isCardVisible = true;
          isCollapsed = false;
          createExtensionUI();
          console.log('✅ Extension initialized successfully');
        }, 1500);
      }
      
      // Re-initialize on navigation (YouTube is a SPA)
      let lastUrl = location.href;
      new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
          lastUrl = url;
          if (url.includes('/watch')) {
            console.log('📍 Navigation detected, re-initializing');
            setTimeout(async () => {
              // Reset state for new video
              isSummarized = false;
              isProcessing = false;
              isCardVisible = true;
              summaryData = null;
              rawTranscript = null;
              showCreateProject = false;
              showQuiz = false;
              activeTab = 'summary';
              
              // Reload projects for new page
              await loadProjects();
              
              createSummarizeButton();
              createExtensionUI();
            }, 1500);
          }
        }
      }).observe(document, { subtree: true, childList: true });
    }

    // Start initialization
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }  // End of initializeExtensionCore

  // Start waiting for UI function
  waitForUI();
  
  // Listen for authentication updates from background script
  if (chrome?.runtime?.onMessage) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('📨 Message received in content script:', message);
      
      if (message.action === 'authenticationComplete' && message.data) {
        console.log('🔐 Authentication complete, updating UI...');
        
        // Update local variables
        userEmail = message.data.userEmail;
        userTier = message.data.userTier || 'free';
        
        // Save to storage
        chrome.storage.local.set(message.data, () => {
          console.log('✅ Auth data saved, refreshing UI...');
          
          // Refresh the extension UI if it exists
          if (typeof createExtensionUI === 'function') {
            createExtensionUI();
          }
          
          // Also refresh the button if needed
          if (typeof createSummarizeButton === 'function') {
            createSummarizeButton();
          }
        });
        
        sendResponse({success: true});
      }
      
      return true; // Keep channel open
    });
  }
})();