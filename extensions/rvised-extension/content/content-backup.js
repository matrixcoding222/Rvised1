// Content script for YouTube pages - Fixed version
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
  let showActionItems = true;
  let generateQuiz = false;
  let includeTranscript = false;
  let activeTab = 'summary';
  let summaryData = null;
  let userEmail = null;
  let userTier = 'free';

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
    
    // Get dashboard URL
    async function getDashboardUrl() {
      const apiBase = await resolveApiBaseUrl();
      return `${apiBase}/dashboard`;
    }

    // Load user data from storage
    async function loadUserData() {
      return new Promise((resolve) => {
        if (typeof chrome !== 'undefined' && chrome.storage) {
          chrome.storage.local.get(['userEmail', 'userTier', 'authToken'], (result) => {
            userEmail = result.userEmail || null;
            userTier = result.userTier || 'free';
            console.log('👤 User loaded:', userEmail || 'Guest', `(${userTier})`);
            resolve();
          });
        } else {
          console.log('👤 Running without Chrome storage API');
          resolve();
        }
      });
    }

    // Resolve API base URL
    async function resolveApiBaseUrl() {
      const bases = [
        'http://localhost:3000',
        'http://localhost:3003',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://127.0.0.1:3000',
        'https://rvised.vercel.app'
      ];
      
      for (const base of bases) {
        try {
          const r = await fetch(`${base}/api/health`, { method: 'GET' });
          if (r.ok) {
            console.log(`✅ API found at ${base}`);
            return base;
          }
        } catch (e) {
          // Silent fail, try next
        }
      }
      
      console.log('⚠️ No API found, defaulting to localhost:3000');
      return 'http://localhost:3000';
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
                         document.querySelector('[itemprop="name"]')?.content || '';
      
      const channelName = document.querySelector('#channel-name a')?.textContent?.trim() || 
                          document.querySelector('#owner #text')?.textContent?.trim() || 
                          document.querySelector('[itemprop="author"] [itemprop="name"]')?.content || '';
      
      return { videoTitle, channelName };
    }

    // Parse time to seconds
    function parseTimeToSeconds(time) {
      const trimmed = (time || '').trim();
      if (!trimmed) return 0;
      const parts = trimmed.split(':').map((p) => p.trim());
      const toNumber = (s) => { const m = s.match(/\d+/); return m ? parseInt(m[0], 10) : 0 };
      if (parts.length === 3) { const [h,m,s]=parts; return toNumber(h)*3600+toNumber(m)*60+toNumber(s) }
      if (parts.length === 2) { const [m,s]=parts; return toNumber(m)*60+toNumber(s) }
      return 0;
    }

    // Create the prominent summarize button
    function createSummarizeButton() {
      if (rvisedButton) {
        rvisedButton.remove();
      }
      
      rvisedButton = document.createElement('button');
      rvisedButton.id = 'rvised-main-button';
      rvisedButton.className = 'rvised-summarize-button';
      
      const iconUrl = typeof chrome !== 'undefined' && chrome.runtime ? 
                      chrome.runtime.getURL('icons/eyeglasses-icon.svg') : '';
      
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
      
      if (!window.getNewOverlayUI) {
        console.error('❌ UI function not available');
        return;
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
        generateQuiz,
        includeTranscript,
        showSettings: false,
        showCreateProject: false,
        showQuiz: generateQuiz,
        videoTitle,
        channelName,
        summaryData
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
        console.log('✅ Rvised card added to body (fallback)');
      }
      
      setupEventListeners();
    }

    // Set up event listeners
    function setupEventListeners() {
      // Tab buttons
      const tabSummary = rvisedContainer.querySelector('#rvised-tab-summary');
      const tabTranscript = rvisedContainer.querySelector('#rvised-tab-transcript');
      const tabDashboard = rvisedContainer.querySelector('#rvised-tab-dashboard');
      
      if (tabSummary) {
        tabSummary.addEventListener('click', () => {
          activeTab = 'summary';
          createExtensionUI();
        });
      }
      
      if (tabTranscript) {
        tabTranscript.addEventListener('click', () => {
          activeTab = 'transcript';
          createExtensionUI();
        });
      }
      
      if (tabDashboard) {
        tabDashboard.addEventListener('click', () => {
          activeTab = 'dashboard';
          createExtensionUI();
        });
      }
      
      // Mode select
      const modeSelect = rvisedContainer.querySelector('#rvised-mode-select');
      if (modeSelect) {
        modeSelect.addEventListener('change', (e) => {
          activeMode = e.target.value;
        });
      }
      
      // Depth select
      const depthSelect = rvisedContainer.querySelector('#rvised-depth-select');
      if (depthSelect) {
        depthSelect.addEventListener('change', (e) => {
          readingDepth = e.target.value;
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
      }
      
      // Option checkboxes
      const timestampsCheck = rvisedContainer.querySelector('#opt-timestamps');
      if (timestampsCheck) {
        timestampsCheck.addEventListener('change', (e) => {
          includeTimestamps = e.target.checked;
        });
      }
      
      const quizCheck = rvisedContainer.querySelector('#opt-quiz');
      if (quizCheck) {
        quizCheck.addEventListener('change', (e) => {
          generateQuiz = e.target.checked;
        });
      }
      
      const transcriptCheck = rvisedContainer.querySelector('#opt-transcript');
      if (transcriptCheck) {
        transcriptCheck.addEventListener('change', (e) => {
          includeTranscript = e.target.checked;
        });
      }
      
      // Summarize button
      const summarizeBtn = rvisedContainer.querySelector('#rvised-summarize-btn');
      if (summarizeBtn) {
        summarizeBtn.addEventListener('click', handleSummarize);
      }
      
      // Settings button
      const settingsBtn = rvisedContainer.querySelector('#rvised-settings-btn');
      if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
          console.log('Settings clicked');
          // TODO: Implement settings panel
        });
      }
      
      // Copy button
      const copyBtn = rvisedContainer.querySelector('#rvised-copy-btn');
      if (copyBtn) {
        copyBtn.addEventListener('click', handleCopy);
      }
      
      // Download button
      const downloadBtn = rvisedContainer.querySelector('#rvised-download-btn');
      if (downloadBtn) {
        downloadBtn.addEventListener('click', handleDownload);
      }
      
      // Save summary button
      const saveSummaryBtn = rvisedContainer.querySelector('#rvised-save-summary');
      if (saveSummaryBtn) {
        saveSummaryBtn.addEventListener('click', handleSaveSummary);
      }
    }

    // Handle summarize
    async function handleSummarize() {
      console.log('🎯 Summarize button clicked');
      
      const videoId = getVideoId();
      if (!videoId) {
        console.error('❌ No video ID found');
        return;
      }
      
      if (rvisedButton) {
        rvisedButton.classList.add('processing');
        rvisedButton.querySelector('span').textContent = 'Summarizing...';
      }
      
      isProcessing = true;
      isSummarized = false;
      isCollapsed = false;
      createExtensionUI();
      
      try {
        const apiBase = await resolveApiBaseUrl();
        console.log(`📡 Using API base: ${apiBase}`);
        
        const response = await fetch(`${apiBase}/api/summarize`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-tier': userTier
          },
          body: JSON.stringify({ 
            videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
            settings: {
              learningMode: activeMode,
              summaryDepth: readingDepth,
              includeTimestamps: true,
              includeActionItems: showActionItems,
              includeQuiz: generateQuiz,
              includeTranscript,
              includeEmojis: false
            }
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ API Response:', result);
        
        if (result.success && result.data) {
          const timestamps = result.data.timestampedSections || 
                             result.data.timestamps || 
                             [];
          
          summaryData = {
            mainTakeaway: result.data.mainTakeaway,
            summary: result.data.summary,
            keyInsights: result.data.keyInsights || result.data.keyPoints || [],
            actionItems: result.data.actionItems || [],
            timestampedSections: timestamps,
            techStack: result.data.techStack || [],
            quiz: result.data.quiz || [],
            transcript: result.data.transcript || '',
            partialSummary: result.data.partialSummary || false,
            coverageInfo: result.data.coverageInfo || ''
          };
          
          isProcessing = false;
          isSummarized = true;
          isCollapsed = false;
          
          if (rvisedButton) {
            rvisedButton.classList.remove('processing');
            rvisedButton.classList.add('summarized');
            rvisedButton.querySelector('span').textContent = 'View Summary';
          }
          
          createExtensionUI();
        } else {
          throw new Error(result.error || 'Failed to generate summary');
        }
        
      } catch (error) {
        console.error('❌ Error summarizing video:', error);
        isProcessing = false;
        
        if (rvisedButton) {
          rvisedButton.classList.remove('processing', 'summarized');
          rvisedButton.querySelector('span').textContent = 'Summarize';
        }
        
        createExtensionUI();
      }
    }

    // Handle copy
    function handleCopy() {
      if (!summaryData) return;
      
      const sections = [];
      if (summaryData.mainTakeaway) sections.push(`🎯 ${summaryData.mainTakeaway}`);
      if (summaryData.summary) sections.push(`\n${summaryData.summary}`);
      if (summaryData.keyInsights?.length) {
        sections.push(`\n\nKey Insights:\n${summaryData.keyInsights.map(i => `• ${i}`).join('\n')}`);
      }
      
      const textToCopy = sections.join('\n');
      
      navigator.clipboard.writeText(textToCopy).then(() => {
        console.log('✅ Summary copied to clipboard');
      });
    }

    // Handle download
    function handleDownload() {
      if (!summaryData) return;
      
      const { videoTitle } = getVideoInfo();
      const filename = `${videoTitle.replace(/[^a-z0-9]/gi, '_')}_summary.md`.toLowerCase();
      
      const lines = [
        `# ${videoTitle}`,
        '',
        '## Main Takeaway',
        summaryData.mainTakeaway || '',
        '',
        '## Summary',
        summaryData.summary || '',
        ''
      ];
      
      if (summaryData.keyInsights?.length) {
        lines.push('## Key Insights', ...summaryData.keyInsights.map(i => `- ${i}`), '');
      }
      
      const content = lines.join('\n');
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('✅ Downloaded:', filename);
    }

    // Handle save summary
    async function handleSaveSummary() {
      if (!summaryData) return;
      console.log('💾 Saving summary...');
      // TODO: Implement save to dashboard
    }

    // Initialize extension
    async function init() {
      console.log('🚀 Initializing Rvised extension');
      
      await loadUserData();
      
      if (window.location.pathname.includes('/watch')) {
        console.log('📺 On YouTube video page');
        
        setTimeout(() => {
          createSummarizeButton();
          isCardVisible = true;
          isCollapsed = false;
          createExtensionUI();
          console.log('✅ Extension initialized');
        }, 1500);
      }
      
      // Re-initialize on navigation
      let lastUrl = location.href;
      new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
          lastUrl = url;
          if (url.includes('/watch')) {
            console.log('📍 Navigation detected, re-initializing');
            setTimeout(() => {
              isSummarized = false;
              isProcessing = false;
              isCardVisible = true;
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
  }

  // Start waiting for UI function
  waitForUI();
})();