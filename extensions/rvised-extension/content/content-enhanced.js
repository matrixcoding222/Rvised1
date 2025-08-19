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
        showSettings,
        showCreateProject,
        showQuiz,
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
      
      setupEventListeners();
    }

    // Set up all event listeners
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
        tabTranscript.addEventListener('click', async () => {
          activeTab = 'transcript';
          // Fetch transcript if not already loaded
          if (!rawTranscript && !isProcessing) {
            await fetchTranscript();
          }
          createExtensionUI();
        });
      }
      
      if (tabDashboard) {
        tabDashboard.addEventListener('click', async () => {
          activeTab = 'dashboard';
          const dashboardUrl = await getDashboardUrl();
          window.open(dashboardUrl, '_blank');
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
        quizCheck.addEventListener('change', (e) => {
          generateQuiz = e.target.checked;
          console.log('🧩 Quiz:', generateQuiz);
        });
      }
      
      const transcriptCheck = rvisedContainer.querySelector('#opt-transcript');
      if (transcriptCheck) {
        transcriptCheck.addEventListener('change', (e) => {
          includeTranscript = e.target.checked;
          console.log('📝 Include transcript:', includeTranscript);
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
          showSettings = !showSettings;
          showCreateProject = false;
          createExtensionUI();
        });
      }
      
      // Close settings
      const closeSettingsBtn = rvisedContainer.querySelector('#rvised-close-settings');
      if (closeSettingsBtn) {
        closeSettingsBtn.addEventListener('click', () => {
          showSettings = false;
          createExtensionUI();
        });
      }
      
      // Apply settings
      const applySettingsBtn = rvisedContainer.querySelector('#rvised-apply-settings');
      if (applySettingsBtn) {
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
      
      // User/Account button
      const userBtn = rvisedContainer.querySelector('#rvised-user-btn');
      if (userBtn) {
        userBtn.addEventListener('click', async () => {
          const dashboardUrl = await getDashboardUrl();
          window.open(`${dashboardUrl}/settings`, '_blank');
        });
      }
      
      // Create project button
      const createProjectBtn = rvisedContainer.querySelector('#rvised-create-project');
      if (createProjectBtn) {
        createProjectBtn.addEventListener('click', () => {
          showCreateProject = true;
          showSettings = false;
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
              const response = await fetch(`${apiBase}/api/projects/create`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-user-email': userEmail || 'guest'
                },
                body: JSON.stringify({
                  name: projectName,
                  description: projectDesc,
                  createdAt: new Date().toISOString()
                })
              });
              
              if (response.ok) {
                console.log('✅ Project created successfully');
                showCreateProject = false;
                createExtensionUI();
              }
            } catch (error) {
              console.error('❌ Failed to create project:', error);
            }
          }
        });
      }
      
      // Toggle quiz button
      const toggleQuizBtn = rvisedContainer.querySelector('#rvised-toggle-quiz');
      if (toggleQuizBtn) {
        toggleQuizBtn.addEventListener('click', () => {
          showQuiz = !showQuiz;
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

    // Handle summarize
    async function handleSummarize() {
      console.log('🎯 Summarize button clicked');
      
      const videoId = getVideoId();
      if (!videoId) {
        console.error('❌ No video ID found');
        alert('Could not find video ID. Please make sure you are on a YouTube video page.');
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
              includeTimestamps: true, // Always get timestamps for better sections
              includeActionItems: true, // Always get action items
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
          // Extract timestamps from various possible locations
          const timestamps = result.data.timestampedSections || 
                             result.data.timestamps || 
                             result.data._debug?.timestamps || 
                             [];
          
          summaryData = {
            mainTakeaway: result.data.mainTakeaway || result.data.keyTakeaway || '',
            summary: result.data.summary || '',
            keyInsights: result.data.keyInsights || result.data.keyPoints || [],
            actionItems: result.data.actionItems || [],
            timestampedSections: timestamps,
            techStack: result.data.techStack || [],
            quiz: result.data.quiz || result.data.quizQuestions || [],
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
          
          if (rvisedButton) {
            rvisedButton.classList.remove('processing');
            rvisedButton.classList.add('summarized');
            rvisedButton.querySelector('span').textContent = 'View Summary';
          }
          
          createExtensionUI();
          
          // Show coverage info if transcript was capped
          if (summaryData.partialSummary && summaryData.coverageInfo) {
            console.log(`📊 ${summaryData.coverageInfo}`);
          }
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
        
        alert(`Failed to summarize video: ${error.message}`);
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
        const downloadBtn = rvisedContainer.querySelector('#rvised-download-btn');
        if (downloadBtn) {
          const originalHTML = downloadBtn.innerHTML;
          downloadBtn.innerHTML = '✓';
          downloadBtn.style.background = '#10b981';
          downloadBtn.style.color = 'white';
          downloadBtn.style.borderRadius = '6px';
          setTimeout(() => {
            downloadBtn.innerHTML = originalHTML;
            downloadBtn.style.background = '';
            downloadBtn.style.color = '';
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
            projectId: selectedProject,
            videoId,
            videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
            videoTitle,
            channelName,
            summary: summaryData,
            settings: {
              mode: activeMode,
              depth: readingDepth,
              includeTimestamps,
              generateQuiz,
              includeTranscript
            },
            savedAt: new Date().toISOString()
          })
        });
        
        if (response.ok) {
          console.log('✅ Summary saved to project');
          
          if (saveBtn) {
            saveBtn.textContent = '✓ Saved!';
            saveBtn.style.background = '#10b981';
            setTimeout(() => {
              saveBtn.textContent = 'Save Summary';
              saveBtn.style.background = '';
              saveBtn.disabled = false;
            }, 2000);
          }
        } else {
          throw new Error('Failed to save summary');
        }
      } catch (error) {
        console.error('❌ Failed to save summary:', error);
        
        if (saveBtn) {
          saveBtn.textContent = 'Save Failed';
          saveBtn.style.background = '#ef4444';
          setTimeout(() => {
            saveBtn.textContent = 'Save Summary';
            saveBtn.style.background = '';
            saveBtn.disabled = false;
          }, 2000);
        }
        
        alert('Failed to save summary. Please try again.');
      }
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
            setTimeout(() => {
              // Reset state for new video
              isSummarized = false;
              isProcessing = false;
              isCardVisible = true;
              summaryData = null;
              rawTranscript = null;
              showSettings = false;
              showCreateProject = false;
              showQuiz = false;
              activeTab = 'summary';
              
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