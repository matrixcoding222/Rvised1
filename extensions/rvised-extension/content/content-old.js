// Content script for YouTube pages
(function() {
  'use strict';
  
  console.log('🎥 Rvised content script initializing...');

  // Wait for the UI function to be available
  let checkCount = 0;
  const maxChecks = 20;
  
  function waitForUI() {
    if (typeof window.getNewOverlayUI === 'function') {
      console.log('✅ New overlay UI loaded successfully');
      initializeExtension();
    } else if (checkCount < maxChecks) {
      checkCount++;
      setTimeout(waitForUI, 100);
    } else {
      console.error('❌ Failed to load new overlay UI after', maxChecks, 'attempts');
    }
  }
  
  // Start initialization
  waitForUI();
  
  function initializeExtension() {
    const getNewOverlayUI = window.getNewOverlayUI;

// OLD EMBEDDED FUNCTION REMOVED - NOW USING EXTERNAL v0-exact-ui.js
/*
function getExactV0UI(state = {}) {
  // Default state values
  const {
    isMinimized = false,
    isCollapsed = false,
    isSummarized = false,
    isLoading = false,
    activeMode = 'student',
    readingDepth = 'standard',
    activeTab = 'summary',
    includeTimestamps = true,
    showActionItems = true,
    generateQuiz = false,
    includeTranscript = false,
    videoTitle = '',
    channelName = ''
  } = state;

  // Icon paths - for browser extension context
  const getIconUrl = (iconName) => {
    return chrome.runtime.getURL(`icons/${iconName}`);
  };

  // Load icon as img element
  const createIcon = (iconName, width = 20, height = 20, className = '') => {
    return `<img src="${getIconUrl(iconName)}" width="${width}" height="${height}" class="${className}" alt="" />`;
  };
  
  // Account icon SVG (inline since we don't have file)
  const accountIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="10" r="3"/>
    <path d="M7 20.5C7 18 9.5 16 12 16s5 2 5 4.5"/>
  </svg>`;
  
  return `
    <style>
      #rvised-overlay-container {
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 2147483647;
        font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      
      #rvised-main-card {
        width: ${isCollapsed ? '320px' : '400px'};
        height: ${isCollapsed ? 'auto' : (isSummarized ? '600px' : 'auto')};
        max-height: ${isCollapsed ? '180px' : '80vh'};
        border-radius: 12px;
        border: 1px solid #e5e7eb;
        box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
        background: white;
        display: flex !important;
        visibility: visible !important;
        opacity: 1 !important;
        flex-direction: column;
        overflow: hidden;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      #rvised-main-card.collapsed {
        height: auto !important;
        max-height: 180px !important;
      }
      
      #rvised-main-card.expanded {
        height: 600px !important;
        max-height: 600px !important;
      }
      
      
      // Header
      .rvised-v0-header {
        border-bottom: 1px solid #f3f4f6;
        background: white;
        flex-shrink: 0;
        padding: 12px 16px;
        transition: all 0.2s;
      }
      
      .rvised-v0-header-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      
      .rvised-v0-logo-section {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .rvised-v0-logo-text {
        font-size: 16px;
        font-weight: 600;
        color: #111827;
      }
      
      .rvised-v0-header-actions {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      
      .rvised-v0-icon-btn {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        background: transparent;
        border: none;
        cursor: pointer;
        color: #6b7280;
        transition: all 0.15s;
      }
      
      .rvised-v0-icon-btn:hover {
        background: #f3f4f6;
      }
      
      // Generate button
      .rvised-v0-generate-btn {
        margin: ${isCollapsed ? '0 12px 12px' : '0 16px 16px'};
        width: calc(100% - ${isCollapsed ? '24px' : '32px'});
        background: #2563eb;
        color: white;
        border: none;
        border-radius: 8px;
        padding: ${isCollapsed ? '10px 16px' : '12px 20px'};
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.2s;
      }
      
      .rvised-v0-generate-btn:hover {
        background: #1d4ed8;
        transform: translateY(-1px);
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
      }
      
      .rvised-v0-mode-btn:hover {
        border-color: #d1d5db !important;
        background: #f9fafb !important;
      }
      
      .rvised-v0-mode-btn.active {
        border-color: #3b82f6 !important;
        background: #eff6ff !important;
        color: #2563eb !important;
      }
      
      .rvised-v0-options-dropdown.show {
        display: block !important;
      }
    </style>
    
    <div id="rvised-overlay-container">
      <div id="rvised-main-card" class="${isCollapsed ? 'collapsed' : ''}">
        <!-- Header -->
        <div class="rvised-v0-header">
          <div class="rvised-v0-header-content">
            <div class="rvised-v0-logo-section">
              ${createIcon('eyeglasses-icon.svg', 24, 24)}
              <span class="rvised-v0-logo-text">Rvised</span>
            </div>
            <div class="rvised-v0-header-actions">
              <button class="rvised-v0-icon-btn" id="rvised-collapse-btn" title="${isCollapsed ? 'Expand' : 'Collapse'}">
                ${createIcon('collapse-3.svg', 16, 16)}
              </button>
            </div>
          </div>
        </div>
        
        <div class="rvised-v0-content">
          <!-- Mode buttons - always visible for customization -->
          <div class="rvised-v0-mode-buttons" style="${isLoading ? 'display: none;' : ''}; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 16px;">
            <button class="rvised-v0-mode-btn ${activeMode === 'student' ? 'active' : ''}" data-mode="student" title="Student" style="flex: 0 0 48px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 8px; border: 1px solid #e5e7eb; background: white; cursor: pointer; transition: all 0.2s; color: #6b7280;">
              ${createIcon('student-13.svg', 20, 20)}
            </button>
            <button class="rvised-v0-mode-btn ${activeMode === 'build' ? 'active' : ''}" data-mode="build" title="Build" style="flex: 0 0 48px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 8px; border: 1px solid #e5e7eb; background: white; cursor: pointer; transition: all 0.2s; color: #6b7280;">
              ${createIcon('build-3.svg', 20, 20)}
            </button>
            <button class="rvised-v0-mode-btn ${activeMode === 'deep' ? 'active' : ''}" data-mode="deep" title="Deep" style="flex: 0 0 48px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 8px; border: 1px solid #e5e7eb; background: white; cursor: pointer; transition: all 0.2s; color: #6b7280;">
              ${createIcon('brain-6.svg', 20, 20)}
            </button>
            <button class="rvised-v0-mode-btn" id="rvised-options-btn" title="Options" style="flex: 0 0 48px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 8px; border: 1px solid #e5e7eb; background: white; cursor: pointer; transition: all 0.2s; color: #6b7280;">
              ${createIcon('setting-line-icon.svg', 20, 20)}
            </button>
          </div>
          
          <!-- Selects - always visible for customization -->
          <div class="rvised-v0-selects" style="${isLoading ? 'display: none;' : ''}; display: flex; gap: 8px; padding: 8px 16px 16px;">
            <div style="flex: 1;">
              <label style="display: block; font-size: 11px; color: #6b7280; margin-bottom: 4px; font-weight: 500;">Learning Mode</label>
              <select class="rvised-v0-select" id="rvised-mode-select" style="width: 100%; height: 36px; padding: 0 12px; border: 1px solid #e5e7eb; border-radius: 6px; background: white; font-size: 14px; font-weight: 500; color: #374151; cursor: pointer;">
                <option value="student" ${activeMode === 'student' ? 'selected' : ''}>📚 Student</option>
                <option value="build" ${activeMode === 'build' ? 'selected' : ''}>🔨 Build</option>
                <option value="deep" ${activeMode === 'deep' ? 'selected' : ''}>🧠 Deep</option>
              </select>
            </div>
            
            <div style="flex: 1;">
              <label style="display: block; font-size: 11px; color: #6b7280; margin-bottom: 4px; font-weight: 500;">Summary Depth</label>
              <select class="rvised-v0-select" id="rvised-depth-select" style="width: 100%; height: 36px; padding: 0 12px; border: 1px solid #e5e7eb; border-radius: 6px; background: white; font-size: 14px; font-weight: 500; color: #374151; cursor: pointer;">
                <option value="quick" ${readingDepth === 'quick' ? 'selected' : ''}>⚡ Quick</option>
                <option value="standard" ${readingDepth === 'standard' ? 'selected' : ''}>📖 Standard</option>
                <option value="detailed" ${readingDepth === 'detailed' ? 'selected' : ''}>📊 Detailed</option>
              </select>
            </div>
            
            <div style="position: relative; flex: 1;">
              <label style="display: block; font-size: 11px; color: #6b7280; margin-bottom: 4px; font-weight: 500;">Additional Options</label>
              <select class="rvised-v0-select" id="rvised-options-select" style="width: 100%; height: 36px; padding: 0 12px; border: 1px solid #e5e7eb; border-radius: 6px; background: white; font-size: 14px; font-weight: 500; color: #374151; cursor: pointer;">
                <option>⚙️ Options</option>
              </select>
              <div class="rvised-v0-options-dropdown" id="rvised-options-dropdown" style="display: none; position: absolute; top: 100%; right: 0; margin-top: 4px; background: white; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); padding: 12px; min-width: 200px; z-index: 10;">
                <div class="rvised-v0-option-item" style="display: flex; align-items: center; gap: 8px; padding: 4px 0;">
                  <input type="checkbox" class="rvised-v0-option-checkbox" id="opt-timestamps" ${includeTimestamps ? 'checked' : ''} style="width: 16px; height: 16px;">
                  <label class="rvised-v0-option-label" for="opt-timestamps" style="font-size: 12px; font-weight: 500; color: #374151; cursor: pointer;">Timestamps</label>
                </div>
                <div class="rvised-v0-option-item" style="display: flex; align-items: center; gap: 8px; padding: 4px 0;">
                  <input type="checkbox" class="rvised-v0-option-checkbox" id="opt-action-items" ${showActionItems ? 'checked' : ''} style="width: 16px; height: 16px;">
                  <label class="rvised-v0-option-label" for="opt-action-items" style="font-size: 12px; font-weight: 500; color: #374151; cursor: pointer;">Action items</label>
                </div>
                <div class="rvised-v0-option-item" style="display: flex; align-items: center; gap: 8px; padding: 4px 0;">
                  <input type="checkbox" class="rvised-v0-option-checkbox" id="opt-quiz" ${generateQuiz ? 'checked' : ''} style="width: 16px; height: 16px;">
                  <label class="rvised-v0-option-label" for="opt-quiz" style="font-size: 12px; font-weight: 500; color: #374151; cursor: pointer;">Quiz</label>
                </div>
                <div class="rvised-v0-option-item" style="display: flex; align-items: center; gap: 8px; padding: 4px 0;">
                  <input type="checkbox" class="rvised-v0-option-checkbox" id="opt-transcript" ${includeTranscript ? 'checked' : ''} style="width: 16px; height: 16px;">
                  <label class="rvised-v0-option-label" for="opt-transcript" style="font-size: 12px; font-weight: 500; color: #374151; cursor: pointer;">Transcript</label>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Generate button - always visible except during loading -->
          ${!isLoading ? `
            <button class="rvised-v0-generate-btn" id="rvised-summarize-btn" style="margin: 0 16px 16px; width: calc(100% - 32px); background: #2563eb; color: white; border: none; border-radius: 8px; padding: 12px 20px; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
              ${createIcon('eyeglasses-icon.svg', 18, 18, 'rvised-btn-icon')}
              <span>${isSummarized ? 'Re-generate Summary' : 'Summarize video'}</span>
            </button>
          ` : ''}
          
          ${isLoading ? `
            <div style="padding: 32px; text-align: center;">
              <div style="width: 32px; height: 32px; border: 2px solid #e5e7eb; border-top-color: #2563eb; border-radius: 50%; animation: spin 0.6s linear infinite; margin: 0 auto 16px;"></div>
              <p style="font-size: 14px; color: #6b7280;">Analyzing video...</p>
            </div>
            <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
          ` : ''}
          
          ${isSummarized ? `
            <div style="padding: 20px;">
              <h4 style="margin: 0 0 12px 0; color: #111827;">Summary Ready</h4>
              <p style="color: #6b7280; font-size: 14px;">Your video summary has been generated successfully.</p>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}
*/
// END OF OLD EMBEDDED FUNCTION

let rvisedContainer = null;
let rvisedButton = null; // The prominent summarize button
let isProcessing = false;
let isSummarized = false;
let isCollapsed = false; // Start expanded to show all options
let isCardVisible = true; // Auto-show card on page load
let activeMode = 'student';
let readingDepth = 'standard';
let includeTimestamps = true;
let showActionItems = true;
let generateQuiz = false;
let includeTranscript = false;
let activeTab = 'summary';
let summaryData = null;
let userEmail = null; // Will be populated from storage/auth
let userTier = 'free'; // 'free' or 'pro'

// Get dashboard URL
async function getDashboardUrl() {
  const apiBase = await resolveApiBaseUrl();
  return `${apiBase}/dashboard`;
}

// Load user data from storage
async function loadUserData() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['userEmail', 'userTier', 'authToken'], (result) => {
      userEmail = result.userEmail || null;
      userTier = result.userTier || 'free';
      console.log('👤 User loaded:', userEmail || 'Guest', `(${userTier})`);
      resolve();
    });
  });
}

// Resolve API base (local → https local → prod)
async function resolveApiBaseUrl() {
  const bases = [
    'http://localhost:3000',
    'http://localhost:3003',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3003',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
    'https://rvised.vercel.app'
  ];
  
  console.log('🔍 Checking API endpoints...');
  
  for (const base of bases) {
    try {
      console.log(`Trying ${base}/api/health...`);
      const r = await fetch(`${base}/api/health`, { method: 'GET' });
      if (r.ok) {
        console.log(`✅ API found at ${base}`);
        return base;
      }
      console.log(`❌ ${base} returned status ${r.status}`);
    } catch (e) {
      console.log(`❌ ${base} failed:`, e.message);
    }
  }
  
  console.log('⚠️ No API found, defaulting to localhost:3000');
  return 'http://localhost:3000';
}

// Extract video ID from current YouTube URL
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

// Parse time to seconds for timestamp navigation
function parseTimeToSeconds(time) {
  const trimmed = (time || '').trim();
  if (!trimmed) return 0;
  const parts = trimmed.split(':').map((p) => p.trim());
  const toNumber = (s) => { const m = s.match(/\d+/); return m ? parseInt(m[0], 10) : 0 };
  if (parts.length === 3) { const [h,m,s]=parts; return toNumber(h)*3600+toNumber(m)*60+toNumber(s) }
  if (parts.length === 2) { const [m,s]=parts; return toNumber(m)*60+toNumber(s) }
  const hm = trimmed.match(/(\d+)h/i), mm = trimmed.match(/(\d+)m/i), sm = trimmed.match(/(\d+)s/i);
  if (hm||mm||sm) return (hm?parseInt(hm[1],10)*3600:0)+(mm?parseInt(mm[1],10)*60:0)+(sm?parseInt(sm[1],10):0);
  const only = trimmed.match(/^(\d+)$/); return only?parseInt(only[1],10):0;
}

// Create the prominent summarize button near video controls
function createSummarizeButton() {
  // Remove existing button if any
  if (rvisedButton) {
    rvisedButton.remove();
  }
  
  // Create button element
  rvisedButton = document.createElement('button');
  rvisedButton.id = 'rvised-main-button';
  rvisedButton.className = 'rvised-summarize-button';
  
  // Create button content with icon and text
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
      
      .rvised-summarize-button:active {
        transform: scale(0.98);
      }
      
      .rvised-summarize-button img {
        width: 18px;
        height: 18px;
      }
      
      .rvised-summarize-button.processing {
        background: #6b7280;
        pointer-events: none;
      }
      
      .rvised-summarize-button.summarized {
        background: #10b981;
      }
    </style>
    <img src="${typeof chrome !== 'undefined' && chrome.runtime ? chrome.runtime.getURL('icons/eyeglasses-icon.svg') : ''}" alt="">
    <span>${isSummarized ? 'View Summary' : 'Summarize'}</span>
  `;
  
  // Find the actions section below the video
  const actionsSection = document.querySelector('#actions') || 
                        document.querySelector('#menu-container') ||
                        document.querySelector('ytd-menu-renderer');
  
  if (actionsSection) {
    // Find the buttons container (like, dislike, share, etc.)
    const buttonsContainer = actionsSection.querySelector('#top-level-buttons-computed') ||
                            actionsSection.querySelector('#top-level-buttons') ||
                            actionsSection.querySelector('#flexible-item-buttons') ||
                            actionsSection;
    
    if (buttonsContainer) {
      // Insert after the last button
      buttonsContainer.appendChild(rvisedButton);
      console.log('✅ Rvised summarize button added to video controls');
    } else {
      // Fallback: insert at the beginning of actions
      actionsSection.insertBefore(rvisedButton, actionsSection.firstChild);
      console.log('✅ Rvised summarize button added (fallback position)');
    }
    
    // Add click handler
    rvisedButton.addEventListener('click', handleMainButtonClick);
  } else {
    console.log('⚠️ Could not find video actions section');
  }
}

// Handle main summarize button click
function handleMainButtonClick() {
  if (isProcessing) return;
  
  if (!isSummarized) {
    // First ensure card is visible and expanded
    isCardVisible = true;
    isCollapsed = false;
    createExtensionUI();
    // Then start summarization
    setTimeout(() => handleSummarize(), 100);
  } else {
    // Toggle card collapse state
    isCollapsed = !isCollapsed;
    isCardVisible = true;
    createExtensionUI();
  }
}

// Create the extension UI using new overlay design
async function createExtensionUI() {
  console.log('🎨 Creating extension UI...');
  
  // Check if new UI function exists
  if (!getNewOverlayUI && typeof window.getNewOverlayUI === 'function') {
    getNewOverlayUI = window.getNewOverlayUI;
  }
  
  if (!getNewOverlayUI) {
    console.error('❌ getNewOverlayUI function not found!');
    return;
  }
  
  // Remove any existing container
  if (rvisedContainer) {
    rvisedContainer.remove();
  }
  
  // Ensure card is visible
  isCardVisible = true;
  
  // Get video info
  const { videoTitle, channelName } = getVideoInfo();
  
  // Create container div
  rvisedContainer = document.createElement('div');
  rvisedContainer.id = 'rvised-extension-container';
  
  // Get the new overlay UI HTML with all state
  const uiHTML = getNewOverlayUI({
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
    summaryData: summaryData // Pass the actual summary data
  });
  
  // Set the HTML
  rvisedContainer.innerHTML = uiHTML;
  
  // Function to insert card in the right place
  const insertCard = () => {
    // Try multiple selectors for the secondary column
    const secondaryColumn = document.querySelector('#secondary') || 
                           document.querySelector('#secondary-inner') ||
                           document.querySelector('#related') ||
                           document.querySelector('ytd-watch-flexy #secondary');
    
    console.log('🔍 Looking for secondary column:', {
      found: !!secondaryColumn,
      selector: secondaryColumn?.id || secondaryColumn?.className || 'unknown'
    });
    
    if (secondaryColumn) {
      // Find the overlay container within our container
      const overlayContainer = rvisedContainer.querySelector('#rvised-overlay-container');
      if (overlayContainer) {
        // Override the fixed positioning for inline placement
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
      
      // Find the main card and adjust its styles
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
      
      // Style our container for inline placement
      rvisedContainer.style.cssText = `
        width: 100% !important;
        max-width: 400px !important;
        margin-bottom: 16px !important;
        display: block !important;
        visibility: visible !important;
        position: relative !important;
        z-index: 999 !important;
      `;
      
      // Insert at the top of the secondary column
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
  
  // Try to insert the card
  if (!insertCard()) {
    // If secondary column not found yet, append to body with fixed positioning
    document.body.appendChild(rvisedContainer);
    
    // Keep the overlay as fixed for fallback
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
    
    // Ensure main card is visible and interactive
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
    
    console.log('✅ Rvised card created as overlay (fallback)');
    
    // Keep trying to move it to the right place
    const checkInterval = setInterval(() => {
      if (insertCard()) {
        clearInterval(checkInterval);
      }
    }, 1000);
    
    // Stop trying after 10 seconds
    setTimeout(() => clearInterval(checkInterval), 10000);
  }
  
  // Set up event listeners
  setupEventListeners();
}

// Set up event listeners for the UI
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
      // Update button states
      modeButtons.forEach(b => {
        if (b.dataset.mode === activeMode) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });
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
  
  const toggleOptionsDropdown = () => {
    if (optionsDropdown) {
      optionsDropdown.classList.toggle('show');
    }
  };
  
  if (optionsSelect) {
    optionsSelect.addEventListener('click', (e) => {
      e.preventDefault();
      toggleOptionsDropdown();
    });
  }
  
  // Option checkboxes
  const timestampsCheck = rvisedContainer.querySelector('#opt-timestamps');
  if (timestampsCheck) {
    timestampsCheck.addEventListener('change', (e) => {
      includeTimestamps = e.target.checked;
    });
  }
  
  const actionItemsCheck = rvisedContainer.querySelector('#opt-action-items');
  if (actionItemsCheck) {
    actionItemsCheck.addEventListener('change', (e) => {
      showActionItems = e.target.checked;
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
  
  // Header action buttons
  const copyBtn = rvisedContainer.querySelector('#rvised-copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', handleCopy);
  }
  
  const downloadBtn = rvisedContainer.querySelector('#rvised-download-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', handleDownload);
  }
  
  const userBtn = rvisedContainer.querySelector('#rvised-user-btn');
  if (userBtn) {
    userBtn.addEventListener('click', handleUserClick);
  }
  
  // Settings button
  const settingsBtn = rvisedContainer.querySelector('#rvised-settings-btn');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      // Show settings screen
      const currentState = {
        isCollapsed, isSummarized, isLoading: isProcessing,
        activeMode, readingDepth, activeTab,
        includeTimestamps, generateQuiz, includeTranscript,
        showSettings: true, // Toggle settings
        showCreateProject: false,
        showQuiz: generateQuiz,
        videoTitle: getVideoInfo().videoTitle,
        channelName: getVideoInfo().channelName,
        summaryData
      };
      rvisedContainer.innerHTML = getNewOverlayUI(currentState);
      setupEventListeners();
    });
  }
  
  // Close settings button
  const closeSettingsBtn = rvisedContainer.querySelector('#rvised-close-settings');
  if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener('click', () => {
      createExtensionUI();
    });
  }
  
  // Apply settings button
  const applySettingsBtn = rvisedContainer.querySelector('#rvised-apply-settings');
  if (applySettingsBtn) {
    applySettingsBtn.addEventListener('click', () => {
      // Update settings from form inputs
      const modeInputs = rvisedContainer.querySelectorAll('input[name="mode"]');
      const depthInputs = rvisedContainer.querySelectorAll('input[name="depth"]');
      
      modeInputs.forEach(input => {
        if (input.checked) activeMode = input.value;
      });
      
      depthInputs.forEach(input => {
        if (input.checked) readingDepth = input.value;
      });
      
      includeTimestamps = rvisedContainer.querySelector('#opt-timestamps')?.checked || false;
      generateQuiz = rvisedContainer.querySelector('#opt-quiz')?.checked || false;
      includeTranscript = rvisedContainer.querySelector('#opt-transcript')?.checked || false;
      
      createExtensionUI();
    });
  }
  
  // Account/Dashboard button
  const accountBtn = rvisedContainer.querySelector('#rvised-account-btn');
  if (accountBtn) {
    accountBtn.addEventListener('click', () => {
      // Open dashboard in new tab
      const dashboardUrl = getDashboardUrl();
      window.open(dashboardUrl, '_blank');
    });
  }
  
  // Expand summary button (when collapsed and summarized)
  const expandSummaryBtn = rvisedContainer.querySelector('#rvised-expand-summary-btn');
  if (expandSummaryBtn) {
    expandSummaryBtn.addEventListener('click', () => {
      isCollapsed = false;
      createExtensionUI();
    });
  }
  
  // Create project button
  const createProjectBtn = rvisedContainer.querySelector('#rvised-create-project');
  if (createProjectBtn) {
    createProjectBtn.addEventListener('click', () => {
      // Show create project screen
      const currentState = {
        isCollapsed, isSummarized, isLoading: isProcessing,
        activeMode, readingDepth, activeTab,
        includeTimestamps, generateQuiz, includeTranscript,
        showSettings: false,
        showCreateProject: true, // Toggle project creation
        showQuiz: generateQuiz,
        videoTitle: getVideoInfo().videoTitle,
        channelName: getVideoInfo().channelName,
        summaryData
      };
      rvisedContainer.innerHTML = getNewOverlayUI(currentState);
      setupEventListeners();
    });
  }
  
  // Close project screen button
  const closeProjectBtn = rvisedContainer.querySelector('#rvised-close-project');
  if (closeProjectBtn) {
    closeProjectBtn.addEventListener('click', () => {
      createExtensionUI();
    });
  }
  
  // Cancel project button
  const cancelProjectBtn = rvisedContainer.querySelector('#rvised-cancel-project');
  if (cancelProjectBtn) {
    cancelProjectBtn.addEventListener('click', () => {
      createExtensionUI();
    });
  }
  
  // Create project submit button
  const createProjectSubmitBtn = rvisedContainer.querySelector('#rvised-create-project-btn');
  if (createProjectSubmitBtn) {
    createProjectSubmitBtn.addEventListener('click', () => {
      const projectName = rvisedContainer.querySelector('#rvised-project-name')?.value || '';
      const projectDesc = rvisedContainer.querySelector('#rvised-project-desc')?.value || '';
      
      if (projectName.trim()) {
        console.log('[Rvised] Creating project:', projectName, projectDesc);
        // TODO: Send to API to create project
        createExtensionUI();
      }
    });
  }
  
  // Toggle quiz button
  const toggleQuizBtn = rvisedContainer.querySelector('#rvised-toggle-quiz');
  if (toggleQuizBtn) {
    toggleQuizBtn.addEventListener('click', () => {
      generateQuiz = !generateQuiz;
      createExtensionUI();
    });
  }
  
  // Save summary button
  const saveSummaryBtn = rvisedContainer.querySelector('#rvised-save-summary');
  if (saveSummaryBtn) {
    saveSummaryBtn.addEventListener('click', handleSaveSummary);
  }
  
  const dashboardBtn = rvisedContainer.querySelector('#rvised-dashboard-btn');
  if (dashboardBtn) {
    dashboardBtn.addEventListener('click', () => {
      // Open dashboard in new tab  
      const dashboardUrl = getDashboardUrl();
      window.open(dashboardUrl, '_blank');
    });
  }
  
  // Timestamp clicks
  const timestamps = rvisedContainer.querySelectorAll('.rvised-v0-timestamp');
  timestamps.forEach(timestamp => {
    timestamp.addEventListener('click', () => {
      const timeText = timestamp.textContent.trim();
      const seconds = parseTimeToSeconds(timeText);
      const video = document.querySelector('video');
      if (video) {
        video.currentTime = seconds;
        video.play();
      }
    });
  });
}

// Handle summarize button click
async function handleSummarize() {
  console.log('🎯 Summarize button clicked');
  
  const videoId = getVideoId();
  if (!videoId) {
    console.error('❌ No video ID found');
    return;
  }
  
  // Update button to processing state
  if (rvisedButton) {
    rvisedButton.classList.add('processing');
    rvisedButton.querySelector('span').textContent = 'Summarizing...';
  }
  
  // Update UI to show loading state
  isProcessing = true;
  isSummarized = false;
  isCollapsed = false; // Expand when loading
  createExtensionUI();
  
  try {
    const apiBase = await resolveApiBaseUrl();
    console.log(`📡 Using API base: ${apiBase}`);
    
    const response = await fetch(`${apiBase}/api/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-tier': userTier // Pass user tier for transcript capping
      },
      body: JSON.stringify({ 
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
        settings: {
          learningMode: activeMode,
          summaryDepth: readingDepth,
          includeTimestamps: true, // Always request timestamps for better UI sections
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
    
    // Extract summary data from API response
    if (result.success && result.data) {
      // Check for timestamps in different places
      const timestamps = result.data.timestampedSections || 
                         result.data.timestamps || 
                         result.data._debug?.timestamps || 
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
        coverageInfo: result.data.coverageInfo || '',
        _debug: result.data._debug || {}
      };
      
      isProcessing = false;
      isSummarized = true;
      isCollapsed = false; // Auto-expand to show summary
      
      // Update button to summarized state
      if (rvisedButton) {
        rvisedButton.classList.remove('processing');
        rvisedButton.classList.add('summarized');
        rvisedButton.querySelector('span').textContent = 'View Summary';
      }
      
      // Update UI with summary (summaryData is now passed directly to getExactV0UI)
      createExtensionUI();
      
      // Show coverage info if transcript was capped
      if (summaryData.partialSummary) {
        console.log(`📊 ${summaryData.coverageInfo}`);
      }
    } else {
      throw new Error(result.error || 'Failed to generate summary');
    }
    
  } catch (error) {
    console.error('❌ Error summarizing video:', error);
    isProcessing = false;
    
    // Reset button state
    if (rvisedButton) {
      rvisedButton.classList.remove('processing', 'summarized');
      rvisedButton.querySelector('span').textContent = 'Summarize';
    }
    
    createExtensionUI();
    
    // Show error message
    const contentArea = rvisedContainer.querySelector('.rvised-v0-content');
    if (contentArea) {
      contentArea.innerHTML = `
        <div style="padding: 20px; text-align: center; color: #dc2626;">
          <p style="margin-bottom: 8px;">Failed to summarize video</p>
          <p style="font-size: 12px; color: #6b7280;">${error.message}</p>
        </div>
      `;
    }
  }
}

// Update summary content in the UI (replaced by update-summary.js)
function updateSummaryContentOld(summaryData) {
  const contentArea = rvisedContainer.querySelector('.rvised-v0-content');
  if (!contentArea || !summaryData) return;
  
  let html = '<div class="rvised-v0-content-section">';
  
  // Main takeaway
  if (summaryData.mainTakeaway) {
    html += `
      <div class="rvised-v0-key-insight">
        <h4>🎯 Key Takeaway</h4>
        <p>${summaryData.mainTakeaway}</p>
      </div>
    `;
  }
  
  // Summary sections with timestamps
  if (summaryData.timestampedSections?.length > 0 && includeTimestamps) {
    html += '<div id="rvised-summary-content">';
    summaryData.timestampedSections.forEach((section) => {
      const timestamp = section.timestamp || '00:00';
      const title = section.title || 'Section';
      const content = section.content || '';
    
      html += `
        <div class="rvised-v0-summary-item" data-timestamp="${timestamp}">
          <div class="rvised-v0-timestamp">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            ${timestamp}
          </div>
          <div class="rvised-v0-summary-content">
            <h5 class="rvised-v0-summary-title">${title}</h5>
            <p class="rvised-v0-summary-text">${content}</p>
          </div>
          <svg class="rvised-v0-play-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        </div>
      `;
    });
    html += '</div>';
  } else if (summaryData.summary) {
    // Fallback to simple summary
    html += `
      <div class="rvised-v0-summary-text" style="padding: 20px;">
        ${summaryData.summary}
      </div>
    `;
  }
  
  // Key Insights
  if (summaryData.keyInsights?.length > 0) {
    html += `
      <div style="padding: 20px; border-top: 1px solid #f3f4f6;">
        <h4 style="font-size: 16px; font-weight: 600; margin-bottom: 12px;">💡 Key Insights</h4>
        ${summaryData.keyInsights.map(insight => `
          <p style="margin: 8px 0; padding-left: 20px;">• ${insight}</p>
        `).join('')}
      </div>
    `;
  }
  
  // Action Items
  if (summaryData.actionItems?.length > 0 && showActionItems) {
    html += `
      <div style="padding: 20px; border-top: 1px solid #f3f4f6;">
        <h4 style="font-size: 16px; font-weight: 600; margin-bottom: 12px;">✅ Action Items</h4>
        ${summaryData.actionItems.map(item => `
          <p style="margin: 8px 0; padding-left: 20px;">• ${item}</p>
        `).join('')}
      </div>
    `;
  }
  
  // Quiz
  if (summaryData.quiz?.length > 0 && generateQuiz) {
    html += `
      <div style="padding: 20px; border-top: 1px solid #f3f4f6;">
        <h4 style="font-size: 16px; font-weight: 600; margin-bottom: 12px;">📝 Quiz</h4>
        ${summaryData.quiz.map((q, i) => `
          <div style="margin-bottom: 16px;">
            <p style="font-weight: 500;">Q${i+1}: ${q.question}</p>
            <p style="margin-top: 8px; color: #6b7280; font-size: 14px;">Answer: ${q.answer}</p>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  // Transcript
  if (summaryData.transcript && includeTranscript) {
    html += `
      <div style="padding: 20px; border-top: 1px solid #f3f4f6;">
        <h4 style="font-size: 16px; font-weight: 600; margin-bottom: 12px;">📄 Transcript</h4>
        <div style="max-height: 300px; overflow-y: auto; padding: 12px; background: #f9fafb; border-radius: 6px;">
          <pre style="white-space: pre-wrap; font-family: inherit; font-size: 14px; line-height: 1.6;">${summaryData.transcript}</pre>
        </div>
      </div>
    `;
  }
  
  
  // Find and update the content section
  const contentSection = rvisedContainer.querySelector('.rvised-v0-content-section');
  if (contentSection) {
    contentSection.innerHTML = html;
  } else {
    // If content section doesn't exist, try content area
    const contentArea = rvisedContainer.querySelector('.rvised-v0-content');
    if (contentArea) {
      contentArea.innerHTML = '<div class="rvised-v0-content-section">' + html + '</div>';
    }
  }
  
  // Re-attach timestamp listeners
  const timestampItems = contentArea.querySelectorAll('.rvised-v0-summary-item[data-timestamp]');
  timestampItems.forEach(item => {
    item.addEventListener('click', () => {
      const timeText = item.dataset.timestamp;
      const seconds = parseTimeToSeconds(timeText);
      const video = document.querySelector('video');
      if (video) {
        video.currentTime = seconds;
        video.play();
      }
    });
  });
}

// Handle copy button
function handleCopy() {
  if (!summaryData) return;
  
  // Format complete summary for clipboard
  const sections = [];
  if (summaryData.mainTakeaway) sections.push(`🎯 ${summaryData.mainTakeaway}`);
  if (summaryData.summary) sections.push(`\n${summaryData.summary}`);
  if (summaryData.keyInsights?.length) {
    sections.push(`\n\nKey Insights:\n${summaryData.keyInsights.map(i => `• ${i}`).join('\n')}`);
  }
  if (summaryData.actionItems?.length && showActionItems) {
    sections.push(`\n\nAction Items:\n${summaryData.actionItems.map(i => `• ${i}`).join('\n')}`);
  }
  if (summaryData.quiz?.length && generateQuiz) {
    sections.push(`\n\nQuiz:\n${summaryData.quiz.map((q, i) => `Q${i+1}: ${q.question}\nA: ${q.answer}`).join('\n\n')}`);
  }
  if (summaryData.transcript && includeTranscript) {
    sections.push(`\n\nTranscript:\n${summaryData.transcript}`);
  }
  
  const textToCopy = sections.join('\n');
  
  navigator.clipboard.writeText(textToCopy).then(() => {
    // Visual feedback
    const copyBtn = rvisedContainer.querySelector('#rvised-copy-btn');
    if (copyBtn) {
      copyBtn.style.background = '#10b981';
      setTimeout(() => copyBtn.style.background = '', 1000);
    }
    console.log('✅ Summary copied to clipboard');
  });
}

// Handle download button
function handleDownload() {
  if (!summaryData) return;
  
  const { videoTitle } = getVideoInfo();
  const filename = `${videoTitle.replace(/[^a-z0-9]/gi, '_')}_summary.md`.toLowerCase();
  
  // Create markdown content
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
  
  if (summaryData.actionItems?.length) {
    lines.push('## Action Items', ...summaryData.actionItems.map(i => `- [ ] ${i}`), '');
  }
  
  if (summaryData.timestampedSections?.length) {
    lines.push('## Timestamps', ...summaryData.timestampedSections.map(t => `- ${t.time} - ${t.description}`), '');
  }
  
  lines.push('---', `*Generated by Rvised on ${new Date().toLocaleDateString()}*`);
  
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

// Handle user button click
function handleUserClick() {
  console.log('User button clicked');
  // Could open user profile or settings
}

// Handle save summary
async function handleSaveSummary() {
  if (!summaryData) return;
  
  const saveBtn = rvisedContainer.querySelector('#rvised-save-summary-btn');
  
  try {
    // Show saving state
    if (saveBtn) {
      saveBtn.textContent = 'Saving...';
      saveBtn.disabled = true;
    }
    
    const apiBase = await resolveApiBaseUrl();
    const { videoTitle, channelName } = getVideoInfo();
    
    const response = await fetch(`${apiBase}/api/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-tier': userTier
      },
      body: JSON.stringify({
        videoId: getVideoId(),
        videoTitle,
        channelName,
        summary: summaryData,
        userEmail: userEmail || 'guest',
        timestamp: new Date().toISOString()
      })
    });
    
    if (response.ok) {
      // Success feedback
      if (saveBtn) {
        saveBtn.textContent = '✓ Saved!';
        saveBtn.style.background = '#10b981';
        setTimeout(() => {
          saveBtn.textContent = 'Save Summary';
          saveBtn.style.background = '';
          saveBtn.disabled = false;
        }, 2000);
      }
      console.log('✅ Summary saved to dashboard');
    } else {
      throw new Error('Save failed');
    }
  } catch (error) {
    console.error('Failed to save:', error);
    if (saveBtn) {
      saveBtn.textContent = 'Save Failed';
      saveBtn.style.background = '#ef4444';
      setTimeout(() => {
        saveBtn.textContent = 'Save Summary';
        saveBtn.style.background = '';
        saveBtn.disabled = false;
      }, 2000);
    }
  }
}


// Initialize extension when DOM is ready
async function init() {
  console.log('🚀 Initializing Rvised extension');
  
  // Load user data first
  await loadUserData();
  
  // Check if we're on a YouTube watch page
  if (window.location.pathname.includes('/watch')) {
    console.log('📺 On YouTube video page, initializing extension...');
    
    // Wait for YouTube's dynamic content to load
    setTimeout(() => {
      // Create the prominent button
      createSummarizeButton();
      
      // Auto-show the card (like competitors)
      isCardVisible = true;
      isCollapsed = false; // Start expanded to show all options
      createExtensionUI();
      console.log('✅ Extension initialized');
      
      // Fallback: force show after a delay if not visible
      setTimeout(() => {
        if (!document.getElementById('rvised-extension-container')) {
          console.log('⚠️ Card not visible, forcing display...');
          isCardVisible = true;
          isCollapsed = false; // Show expanded to be more visible
          createExtensionUI();
        }
      }, 2000);
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
          isSummarized = false;
          isProcessing = false;
          isCardVisible = true; // Auto-show on navigation
          
          // Re-create button and card
          createSummarizeButton();
          createExtensionUI();
        }, 1500);
      }
    }
  }).observe(document, { subtree: true, childList: true });
}

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

  } // End of initializeExtension
})(); // End of IIFE wrapper