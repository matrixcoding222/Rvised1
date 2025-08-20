// New overlay UI implementation based on chrome-extension-overlay.tsx
(function() {
  // Avoid redeclaration if already exists
  if (typeof window.getNewOverlayUI === 'function') {
    console.log('getNewOverlayUI already exists, skipping redeclaration');
    return;
  }

  window.getNewOverlayUI = function(state = {}) {
  // Failsafe function to ensure no objects are displayed
  const ensureString = (value) => {
    if (typeof value === 'string') return value;
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') {
      // Try to extract meaningful content
      if (value.text) return String(value.text);
      if (value.content) return String(value.content);
      if (value.value) return String(value.value);
      if (value.description) return String(value.description);
      // Log error for debugging
      console.error('⚠️ Object passed to UI:', value);
      return 'Content display error';
    }
    return String(value);
  };
  
  const {
    isCollapsed = false,
    isSummarized = false,
    isLoading = false,
    activeMode = 'student',
    readingDepth = 'standard',
    activeTab = 'summary',
    includeTimestamps = true,
    generateQuiz = false,
    includeTranscript = false,
    showSettings = false,
    showCreateProject = false,
    showQuiz = false,
    showOptionsDropdown = false,
    videoTitle = '',
    channelName = '',
    summaryData = null,
    availableProjects = []
  } = state;

  // Helper to create icon URLs
  const getIconUrl = (iconName) => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
      return chrome.runtime.getURL(`icons/${iconName}`);
    }
    return `icons/${iconName}`;
  };

  // User profile state (already destructured above)
  const userEmail = state.userEmail || null;
  const userTier = state.userTier || 'free';
  const showProfileDropdown = state.showProfileDropdown || false;
  const includeEmojis = state.includeEmojis !== undefined ? state.includeEmojis : true;
  
  // Extract important keywords from text - single words only
  const extractKeywords = (text) => {
    if (!text) return [];
    
    // Important single words to highlight (no phrases)
    const importantWords = [
      'key', 'important', 'essential', 'critical', 'main', 'primary', 'core', 'fundamental',
      'learn', 'understand', 'build', 'create', 'develop', 'implement', 'design', 'analyze',
      'strategy', 'approach', 'method', 'technique', 'framework', 'concept', 'principle',
      'effective', 'efficient', 'powerful', 'successful', 'innovative', 'advanced',
      'first', 'second', 'third', 'next', 'then', 'finally', 'step', 'phase',
      'increase', 'decrease', 'boost', 'reduce', 'maximize', 'minimize', 'enhance',
      'advantage', 'benefit', 'opportunity', 'challenge', 'risk', 'reward', 'outcome'
    ];
    
    const keywords = new Set();
    const words = text.toLowerCase().split(/\s+/);
    
    words.forEach(word => {
      // Clean word from punctuation
      const cleanWord = word.replace(/[^a-z0-9]/gi, '');
      if (importantWords.includes(cleanWord) && cleanWord.length > 3) {
        keywords.add(cleanWord);
      }
    });
    
    return Array.from(keywords).slice(0, 8); // Max 8 single words
  };
  
  // Premium highlighting with consistent blue colors
  const highlightKeywords = (text, keywords) => {
    let highlightedText = text;
    if (keywords && keywords.length > 0) {
      // Sort by length (longest first) to avoid partial replacements
      keywords.sort((a, b) => b.length - a.length);
      
      // Consistent blue highlighting for all modes
      const highlightStyle = 'background: rgba(59, 130, 246, 0.06); color: #2563eb; border-bottom: 1px solid rgba(59, 130, 246, 0.15);';
      
      keywords.forEach((keyword) => {
        const regex = new RegExp(`\\b(${keyword})\\b`, "gi");
        highlightedText = highlightedText.replace(
          regex,
          `<span style="${highlightStyle} font-weight: 700; padding: 1px 4px; border-radius: 3px; margin: 0 1px;">$1</span>`
        );
      });
    }
    return highlightedText;
  };
  
  // Professional structured summary sections - Mode-specific formatting
  const getStructuredSummary = (data) => {
    if (!data) return { sections: [], loading: false };
    
    const sections = [];
    const mode = state.activeMode || 'student';
    
    // Mode-specific section titles
    const sectionTitles = {
      student: {
        insights: '📚 What You\'ll Learn',
        actions: '✏️ Practice Steps',
        first: '🌟 The Big Idea'
      },
      build: {
        insights: '🛠️ Implementation Steps',
        actions: '🚀 Action Items',
        first: '🎯 What You\'ll Build'
      },
      deep: {
        insights: '💡 Strategic Insights',
        actions: '📊 Strategic Decisions',
        first: `🧠 ${summaryData?.videoInsightTitle || 'Key Insight'}`
      }
    };
    
    const titles = sectionTitles[mode] || sectionTitles.student;
    
    // Primary Insights Section (exclude mainTakeaway - it's shown separately)
    if (data.keyInsights && data.keyInsights.length > 0) {
      const insights = [];
      
      // Only add keyInsights, not mainTakeaway (avoid duplication)
      if (data.keyInsights) {
        data.keyInsights.slice(0, 5).forEach(insight => {
          // Use failsafe to ensure insight is ALWAYS a string
          const insightText = ensureString(insight);
          // Extract important keywords from the insight
          const keywords = extractKeywords(insightText);
          insights.push({
            type: 'secondary',
            icon: 'bullet',
            color: '#60a5fa',
            content: highlightKeywords(insightText, keywords)
          });
        });
      }
      
      sections.push({
        title: titles.insights,
        items: insights
      });
    }
    
    // Add dedicated Timestamps Navigation section ONLY if timestamps are enabled
    if (includeTimestamps && data.timestampedSections && data.timestampedSections.length > 3) {
      const allTimestamps = data.timestampedSections.map(section => ({
        type: 'timestamp',
        icon: 'time',
        color: '#3b82f6',
        content: section.title || section.description || section.content,
        metadata: section.time || section.timestamp
      }));
      
      sections.push({
        title: '⏰ Video Timeline',
        items: allTimestamps,
        isTimeline: true
      });
    }
    
    // Outcomes & Actions Section - Limit to 3 items
    if (data.actionItems && data.actionItems.length > 0) {
      const actions = data.actionItems.slice(0, 5).map(action => ({
        type: 'action',
        icon: 'check',
        color: '#52c41a',
        content: ensureString(action)
      }));
      
      sections.push({
        title: titles.actions,
        items: actions
      });
    }
    
    return { sections, loading: false };
  };
  
  const summaryStructure = getStructuredSummary(summaryData);

  const quizQuestions = summaryData?.quiz || [
    {
      question: "What is the most effective approach for building learning habits?",
      options: ["Long sporadic sessions", "Consistent daily practice", "Weekend marathons", "Random timing"],
      correct: Math.floor(Math.random() * 4)  // Random between 0-3
    },
    {
      question: "What brain mechanism supports habit formation?",
      options: ["Memory consolidation", "Synaptic strengthening", "Neural pruning", "Cognitive load"],
      correct: Math.floor(Math.random() * 4)  // Random between 0-3
    }
  ];

  // Settings screen HTML
  const settingsScreenHTML = showSettings ? `
    <div style="height: 100%; display: flex; flex-direction: column; background: white;">
      <div style="border-bottom: 1px solid #e5e7eb; padding: 16px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <h3 style="font-size: 18px; font-weight: 600; color: #111827; margin: 0;">Settings</h3>
          <button id="rvised-close-settings" style="width: 32px; height: 32px; background: transparent; border: none; cursor: pointer; font-size: 24px; color: #6b7280;">×</button>
        </div>
      </div>

      <div style="flex: 1; overflow-y: auto; padding: 16px; space-y: 24px;">
        <!-- Learning Modes -->
        <div style="margin-bottom: 24px;">
          <h4 style="font-size: 14px; font-weight: 600; color: #111827; margin-bottom: 12px;">Learning Mode</h4>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${['student', 'build', 'deep'].map(mode => `
              <label style="display: flex; align-items: flex-start; gap: 12px; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; cursor: pointer; ${activeMode === mode ? 'background: #eff6ff; border-color: #3b82f6;' : 'background: white;'}">
                <input type="radio" name="mode" value="${mode}" ${activeMode === mode ? 'checked' : ''} style="margin-top: 2px; width: 16px; height: 16px;">
                <div>
                  <div style="font-size: 14px; font-weight: 500; color: #111827;">
                    ${mode === 'student' ? '🎓 Student Mode' : mode === 'build' ? '🔨 Build Mode' : '🧠 Deep Mode'}
                  </div>
                  <div style="font-size: 12px; color: #6b7280; margin-top: 2px;">
                    ${mode === 'student' ? 'Focus on key concepts and understanding' : 
                      mode === 'build' ? 'Practical implementation and action items' : 
                      'Comprehensive analysis and connections'}
                  </div>
                </div>
              </label>
            `).join('')}
          </div>
        </div>

        <!-- Reading Depth -->
        <div style="margin-bottom: 24px;">
          <h4 style="font-size: 14px; font-weight: 600; color: #111827; margin-bottom: 12px;">Reading Depth</h4>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${['quick', 'standard', 'detailed'].map(depth => `
              <label style="display: flex; align-items: flex-start; gap: 12px; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; cursor: pointer; ${readingDepth === depth ? 'background: #eff6ff; border-color: #3b82f6;' : 'background: white;'}">
                <input type="radio" name="depth" value="${depth}" ${readingDepth === depth ? 'checked' : ''} style="margin-top: 2px; width: 16px; height: 16px;">
                <div>
                  <div style="font-size: 14px; font-weight: 500; color: #111827;">
                    ${depth === 'quick' ? '⚡ Quick (2 min)' : depth === 'standard' ? '📖 Standard (5 min)' : '🔍 Detailed (10 min)'}
                  </div>
                  <div style="font-size: 12px; color: #6b7280; margin-top: 2px;">
                    ${depth === 'quick' ? 'Essential points only' : 
                      depth === 'standard' ? 'Balanced overview' : 
                      'Comprehensive breakdown'}
                  </div>
                </div>
              </label>
            `).join('')}
          </div>
        </div>

        <!-- Content Options -->
        <div>
          <h4 style="font-size: 14px; font-weight: 600; color: #111827; margin-bottom: 12px;">Content Options</h4>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${[
              { id: 'timestamps', label: 'Include Timestamps', checked: includeTimestamps },
              { id: 'emojis', label: 'Include Emojis', checked: includeEmojis }
            ].map(opt => `
              <label style="display: flex; align-items: center; justify-content: space-between; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; cursor: pointer;">
                <span style="font-size: 14px; font-weight: 500; color: #111827;">${opt.label}</span>
                <input type="checkbox" id="opt-${opt.id}" ${opt.checked ? 'checked' : ''} style="width: 16px; height: 16px;">
              </label>
            `).join('')}
          </div>
        </div>
      </div>

      <div style="border-top: 1px solid #e5e7eb; padding: 16px;">
        <button id="rvised-apply-settings" style="width: 100%; background: #2563eb; color: white; padding: 10px 16px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer;">
          Apply Settings
        </button>
      </div>
    </div>
  ` : '';

  // Create project screen HTML
  const createProjectScreenHTML = showCreateProject ? `
    <div style="height: 100%; display: flex; flex-direction: column; background: white;">
      <div style="border-bottom: 1px solid #e5e7eb; padding: 16px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <h3 style="font-size: 18px; font-weight: 600; color: #111827; margin: 0;">Create Project</h3>
          <button id="rvised-close-project" style="width: 32px; height: 32px; background: transparent; border: none; cursor: pointer; font-size: 24px; color: #6b7280;">×</button>
        </div>
      </div>

      <div style="flex: 1; overflow-y: auto; padding: 16px;">
        <div style="margin-bottom: 16px;">
          <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Project Name</label>
          <input type="text" id="rvised-project-name" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;" placeholder="Enter project name...">
        </div>

        <div>
          <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Description</label>
          <textarea id="rvised-project-desc" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; height: 96px; resize: none;" placeholder="Describe your project..."></textarea>
        </div>
      </div>

      <div style="border-top: 1px solid #e5e7eb; padding: 16px;">
        <button id="rvised-create-project-btn" style="width: 100%; background: #2563eb; color: white; padding: 10px 16px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; margin-bottom: 8px;">
          Create Project
        </button>
        <button id="rvised-cancel-project" style="width: 100%; background: white; color: #374151; padding: 10px 16px; border-radius: 8px; border: 1px solid #d1d5db; font-weight: 600; cursor: pointer;">
          Cancel
        </button>
      </div>
    </div>
  ` : '';

  // Main UI HTML
  const mainHTML = `
    <style>
      #rvised-overlay-container * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      
      #rvised-overlay-container {
        position: fixed;
        top: 0;
        right: 0;
        height: 100%;
        z-index: 2147483647;
        display: flex;
        justify-content: flex-end;
        pointer-events: none;
      }
      
      #rvised-main-card {
        width: 400px;
        height: 100%;
        background: white;
        border-left: 1px solid #e5e7eb;
        box-shadow: -10px 0 25px -5px rgba(0,0,0,0.1);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        pointer-events: auto;
      }
      
      .rvised-icon-btn {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        background: transparent;
        border: none;
        cursor: pointer;
        transition: background 0.2s;
      }
      
      .rvised-icon-btn:hover {
        background: #f3f4f6;
      }
      
      .rvised-tab-btn {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 2px;
        padding: 7px 6px;
        height: auto;
        min-height: 42px;
        border-radius: 10px;
        border: 1.5px solid transparent;
        background: white;
        color: #6b7280;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.3px;
        text-transform: uppercase;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
      }
      
      .rvised-tab-btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: transparent;
        transition: background 0.2s;
      }
      
      .rvised-tab-btn.active {
        background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
        border-color: #3b82f6;
        color: #1e40af;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
      }
      
      .rvised-tab-btn.active::before {
        background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
      }
      
      .rvised-tab-btn:hover:not(.active) {
        background: #f9fafb;
        border-color: #e5e7eb;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
      }
      
      .rvised-tab-btn svg {
        transition: transform 0.2s;
      }
      
      .rvised-tab-btn:hover svg {
        transform: scale(1.1);
      }
      
      .rvised-tab-btn.active svg {
        transform: scale(1.15);
      }
      
      .rvised-select {
        flex: 1;
        height: 24px;
        padding: 0 8px;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        background: white;
        font-size: 12px;
        font-weight: 500;
        color: #374151;
        cursor: pointer;
      }
      
      .rvised-option-checkbox {
        width: 14px;
        height: 14px;
        accent-color: #2563eb;
      }
      
      /* Professional Typography & Layout System */
      .rvised-summary-container {
        padding: 16px;
        max-height: calc(100vh - 200px);
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: #cbd5e1 #f1f5f9;
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      
      .rvised-summary-container::-webkit-scrollbar {
        width: 8px;
      }
      
      .rvised-summary-container::-webkit-scrollbar-track {
        background: #f8fafc;
        border-radius: 4px;
      }
      
      .rvised-summary-container::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 4px;
        border: 2px solid #f8fafc;
      }
      
      .rvised-summary-container::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
      }
      
      /* Section Headers */
      .rvised-section-header {
        font-size: 18px;
        font-weight: 700;
        color: #1e293b;
        margin: 0 0 12px 0;
        line-height: 1.2;
        letter-spacing: -0.01em;
      }
      
      /* Content Items */
      .rvised-content-item {
        display: flex;
        align-items: flex-start;
        margin-bottom: 12px;
        padding-left: 8px;
        transition: transform 0.2s ease;
      }
      
      .rvised-content-item:hover {
        transform: translateX(4px);
      }
      
      /* Bullet Points */
      .rvised-bullet {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        margin-right: 12px;
        margin-top: 7px;
        flex-shrink: 0;
      }
      
      .rvised-bullet-primary { background: linear-gradient(135deg, #3b82f6, #2563eb); }
      .rvised-bullet-secondary { background: #60a5fa; }
      .rvised-bullet-success { background: #10b981; }
      .rvised-bullet-neutral { background: #9ca3af; }
      
      /* Text Content */
      .rvised-content-text {
        font-size: 17px;
        line-height: 1.65;
        color: #1f2937;
        margin: 0;
        font-weight: 450;
      }
      
      .rvised-content-text-primary {
        font-weight: 500;
      }
      
      /* Metadata Badges */
      .rvised-metadata {
        font-size: 12px;
        color: #64748b;
        margin-left: 8px;
        background: #f8fafc;
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 500;
      }
      
      /* Loading Skeleton */
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      
      .rvised-skeleton {
        animation: pulse 1.5s ease-in-out infinite;
      }
      
      .rvised-skeleton-bar {
        background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
      }
      
      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      
      /* Focus States for Accessibility */
      .rvised-focusable:focus-visible {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
        border-radius: 4px;
      }
      
      /* Responsive Typography */
      @media (max-width: 768px) {
        .rvised-section-header { font-size: 18px; }
        .rvised-content-text { font-size: 17px; }
      }
      
      .rvised-timestamp-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        background: #eff6ff;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .rvised-timestamp-badge:hover {
        background: #dbeafe;
        transform: scale(1.05);
        box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
        color: #2563eb;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
        font-family: monospace;
      }
      
      .rvised-quiz-option {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px;
        border-radius: 6px;
        cursor: pointer;
        transition: background 0.2s;
      }
      
      .rvised-quiz-option:hover {
        background: #f3f4f6;
      }
    </style>
    
    <div id="rvised-overlay-container">
      <div id="rvised-main-card">
        ${showSettings ? settingsScreenHTML : showCreateProject ? createProjectScreenHTML : `
          <!-- Header -->
          <div style="border-bottom: 1px solid #f3f4f6; background: white; padding: 6px 16px; position: relative;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <img src="${getIconUrl('glasses.svg')}" width="20" height="20" alt="Rvised">
                <span style="font-size: 16px; font-weight: 600; color: #111827;">Rvised</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <!-- Copy button first (furthest left) -->
                <button class="rvised-icon-btn" id="rvised-copy-btn" title="Copy Summary" style="background: transparent; border: none; cursor: pointer; padding: 6px; border-radius: 6px; transition: all 0.2s;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                </button>
                
                <!-- Download button second -->
                <button class="rvised-icon-btn" id="rvised-download-btn" title="Download" style="background: transparent; border: none; cursor: pointer; padding: 6px; border-radius: 6px; transition: all 0.2s;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                </button>
                
                <!-- Settings button third -->
                <button class="rvised-icon-btn" id="rvised-settings-btn" title="Settings" style="background: transparent; border: none; cursor: pointer; padding: 6px; border-radius: 6px; transition: all 0.2s;">
                  <svg width="16" height="16" viewBox="0 0 512 512" fill="#6b7280">
                    <path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336c44.2 0 80-35.8 80-80s-35.8-80-80-80s-80 35.8-80 80s35.8 80 80 80z"/>
                    <path d="M20.5 7.5L16 12l4.5 4.5M3.5 7.5L8 12l-4.5 4.5M16.5 3.5L12 8l-4.5-4.5M7.5 20.5L12 16l4.5 4.5"/>
                  </svg>
                </button>
                
                <!-- Profile button last (furthest right) -->
                <button class="rvised-icon-btn" id="rvised-profile-btn" title="Profile" style="background: transparent; border: none; cursor: pointer; padding: 6px; border-radius: 6px; transition: all 0.2s;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </button>
              </div>
            </div>
            
            ${showProfileDropdown ? `
              <div id="rvised-profile-dropdown" style="position: absolute; top: 40px; right: 16px; background: white; border: 1px solid #e5e7eb; border-radius: 6px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); min-width: 180px; z-index: 10000; font-size: 12px; max-width: calc(100% - 32px);">
                      <div style="padding: 8px 10px; border-bottom: 1px solid #f3f4f6;">
                        <div style="font-size: 10px; color: #9ca3af; margin-bottom: 2px;">Signed in as</div>
                        <div style="font-size: 11px; font-weight: 600; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px;">
                          ${userEmail || 'Guest User'}
                        </div>
                        <div style="margin-top: 3px; display: inline-flex; align-items: center; gap: 3px;">
                          <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${userTier === 'pro' ? '#10b981' : '#6b7280'};"></span>
                          <span style="font-size: 10px; font-weight: 500; color: ${userTier === 'pro' ? '#10b981' : '#6b7280'};">
                            ${userTier === 'pro' ? 'Pro' : 'Free'}
                          </span>
                        </div>
                      </div>
                      <div style="padding: 4px;">
                        <button id="rvised-dashboard-link" style="width: 100%; text-align: left; padding: 6px 8px; border-radius: 4px; background: transparent; border: none; font-size: 11px; color: #374151; cursor: pointer; transition: background 0.15s; display: flex; align-items: center; gap: 6px;" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='transparent'">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="7" height="7"/>
                            <rect x="14" y="3" width="7" height="7"/>
                            <rect x="3" y="14" width="7" height="7"/>
                            <rect x="14" y="14" width="7" height="7"/>
                          </svg>
                          Dashboard
                        </button>
                        ${userTier === 'free' ? `
                          <button id="rvised-upgrade-link" style="width: 100%; text-align: left; padding: 6px 8px; border-radius: 4px; background: linear-gradient(to right, #3b82f6, #2563eb); border: none; font-size: 11px; color: white; font-weight: 600; cursor: pointer; margin: 2px 0; display: flex; align-items: center; gap: 6px;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                            Upgrade
                          </button>
                        ` : ''}
                        <div style="border-top: 1px solid #f3f4f6; margin: 4px 2px;"></div>
                        <button id="rvised-signout-btn" style="width: 100%; text-align: left; padding: 6px 8px; border-radius: 4px; background: transparent; border: none; font-size: 11px; color: #dc2626; cursor: pointer; transition: background 0.15s; display: flex; align-items: center; gap: 6px;" onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background='transparent'">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                            <polyline points="16 17 21 12 16 7"/>
                            <line x1="21" y1="12" x2="9" y2="12"/>
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  ` : ''}
          </div>

          <!-- Top Menu Bar -->
          <div style="background: linear-gradient(to bottom, #fafafa, white); padding: 10px 10px 6px 10px; border-bottom: 1px solid #f3f4f6;">
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <!-- Tab buttons as cards -->
              <div style="display: flex; gap: 6px; justify-content: stretch;">
                <button class="rvised-tab-btn ${activeTab === 'summary' ? 'active' : ''}" id="rvised-tab-summary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                  <span>Summary</span>
                </button>
                <button class="rvised-tab-btn ${activeTab === 'transcript' ? 'active' : ''}" id="rvised-tab-transcript">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <line x1="16" y1="21" x2="8" y2="21"/>
                  </svg>
                  <span>Transcript</span>
                </button>
                ${isSummarized ? `
                  <button class="rvised-tab-btn ${activeTab === 'quiz' ? 'active' : ''}" id="rvised-tab-quiz">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M9 11H3v2h6v-2zm0-4H3v2h6V7zm0 8H3v2h6v-2zm12-8h-6v2h6V7zm0 4h-6v2h6v-2zm0 4h-6v2h6v-2z"/>
                    </svg>
                    <span>Quiz</span>
                  </button>
                ` : ''}
                <button class="rvised-tab-btn" id="rvised-tab-dashboard" title="${userTier === 'pro' || userTier === 'premium' ? 'Open Dashboard' : 'Dashboard (Pro Feature)'}">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="7" height="7"/>
                    <rect x="14" y="3" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/>
                  </svg>
                  <span>Dashboard</span>
                </button>
              </div>

              <!-- Dropdown selects -->
              <div style="display: flex; gap: 4px;">
                <select class="rvised-select" id="rvised-mode-select">
                  <option value="student" ${activeMode === 'student' ? 'selected' : ''}>🎓 Student</option>
                  <option value="build" ${activeMode === 'build' ? 'selected' : ''}>🔨 Build</option>
                  <option value="deep" ${activeMode === 'deep' ? 'selected' : ''}>🧠 Deep</option>
                </select>
                
                <select class="rvised-select" id="rvised-depth-select">
                  <option value="quick" ${readingDepth === 'quick' ? 'selected' : ''}>⚡ Quick</option>
                  <option value="standard" ${readingDepth === 'standard' ? 'selected' : ''}>📖 Standard</option>
                  <option value="detailed" ${readingDepth === 'detailed' ? 'selected' : ''}>🔍 Detailed</option>
                </select>
                
                <!-- Options button -->
                <button class="rvised-select" id="rvised-options-btn" style="
                  position: relative;
                  padding: 6px 12px;
                  background: white;
                  border: 1px solid #e5e7eb;
                  border-radius: 6px;
                  color: #374151;
                  font-size: 13px;
                  font-weight: 500;
                  cursor: pointer;
                  transition: all 0.15s;
                  display: flex;
                  align-items: center;
                  gap: 4px;
                " onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background='white'">
                  ⚙️ Options
                </button>
              </div>
            </div>
            
            ${showOptionsDropdown ? `
              <div id="rvised-options-dropdown" style="position: absolute; top: 135px; right: 16px; background: white; border: 1px solid #e5e7eb; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); min-width: 120px; z-index: 10000;">
                <div style="padding: 1px;">
                  <label style="
                    display: flex; 
                    align-items: center; 
                    gap: 4px; 
                    padding: 5px 6px; 
                    cursor: pointer; 
                    transition: background 0.1s;
                  " onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='transparent'">
                    <input type="checkbox" class="rvised-option-checkbox" id="opt-timestamps" ${includeTimestamps ? 'checked' : ''} style="width: 11px; height: 11px; cursor: pointer;">
                    <span style="font-size: 10px; color: #374151;">⏰ Timestamp</span>
                  </label>
                  <label style="
                    display: flex; 
                    align-items: center; 
                    gap: 4px; 
                    padding: 5px 6px; 
                    cursor: pointer; 
                    transition: background 0.1s;
                  " onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='transparent'">
                    <input type="checkbox" class="rvised-option-checkbox" id="opt-emojis" ${includeEmojis ? 'checked' : ''} style="width: 11px; height: 11px; cursor: pointer;">
                    <span style="font-size: 10px; color: #374151;">😊 Emoji Toggle</span>
                  </label>
                </div>
              </div>
            ` : ''}
          </div>

          <!-- Main Content Area - Single Scroll Container -->
          <div style="flex: 1; overflow-y: auto; background: white; scrollbar-width: thin; scrollbar-color: #cbd5e1 #f1f5f9;">
            ${!isSummarized && !isLoading ? `
              <div style="padding: 16px;">
                ${userEmail && userEmail !== 'guest' ? `
                  <button id="rvised-summarize-btn" style="width: 100%; background: #2563eb; color: white; padding: 12px 20px; border-radius: 8px; border: none; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                    </svg>
                    <span>Summarize video</span>
                  </button>
                ` : `
                  <div style="text-align: center; padding: 20px;">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5" style="margin: 0 auto 16px;">
                      <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                    <h3 style="font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 8px;">Sign In Required</h3>
                    <p style="color: #6b7280; margin-bottom: 20px; font-size: 14px;">Sign in to generate AI-powered summaries</p>
                    <button id="rvised-signin-btn" style="
                      padding: 10px 24px;
                      background: linear-gradient(135deg, #3b82f6, #2563eb);
                      color: white;
                      border: none;
                      border-radius: 8px;
                      font-weight: 600;
                      cursor: pointer;
                      display: inline-flex;
                      align-items: center;
                      gap: 8px;
                      transition: all 0.2s;
                      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
                    ">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/>
                      </svg>
                      Sign In with Google
                    </button>
                  </div>
                `}
              </div>
            ` : ''}

            ${isLoading ? `
              <div style="padding: 32px; text-align: center;">
                <div style="width: 32px; height: 32px; border: 2px solid #e5e7eb; border-top-color: #2563eb; border-radius: 50%; animation: spin 0.6s linear infinite; margin: 0 auto 16px;"></div>
                <p style="font-size: 14px; color: #6b7280;">Analyzing video...</p>
              </div>
              <style>
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeInUp {
                  from {
                    opacity: 0;
                    transform: translateY(20px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
                @keyframes slideInRight {
                  from {
                    opacity: 0;
                    transform: translateX(30px);
                  }
                  to {
                    opacity: 1;
                    transform: translateX(0);
                  }
                }
                .rvised-summary-content {
                  animation: fadeInUp 0.5s ease-out;
                }
                .rvised-summary-section {
                  animation: slideInRight 0.4s ease-out;
                  animation-fill-mode: both;
                }
                .rvised-summary-section:nth-child(1) { animation-delay: 0.1s; }
                .rvised-summary-section:nth-child(2) { animation-delay: 0.2s; }
                .rvised-summary-section:nth-child(3) { animation-delay: 0.3s; }
                .rvised-summary-section:nth-child(4) { animation-delay: 0.4s; }
                .rvised-summary-section:nth-child(5) { animation-delay: 0.5s; }
              </style>
            ` : ''}

            ${isSummarized ? `
              <div style="height: 100%; display: flex; flex-direction: column; position: relative;">
                <!-- Regenerate Button -->
                ${activeTab === 'summary' ? `
                  <div style="padding: 10px 16px; background: #fafafa; border-bottom: 1px solid #e5e7eb;">
                    <button id="rvised-regenerate-btn" style="
                      display: inline-flex;
                      align-items: center;
                      gap: 8px;
                      padding: 8px 14px;
                      background: white;
                      border: 1.5px solid #cbd5e1;
                      border-radius: 8px;
                      color: #475569;
                      font-size: 13px;
                      font-weight: 600;
                      cursor: pointer;
                      transition: all 0.2s;
                      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif;
                    " onmouseover="this.style.background='#f1f5f9'; this.style.borderColor='#94a3b8'; this.style.transform='translateY(-1px)';" onmouseout="this.style.background='white'; this.style.borderColor='#cbd5e1'; this.style.transform='translateY(0)';">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M1 4v6h6M23 20v-6h-6"/>
                        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                      </svg>
                      Regenerate Summary
                    </button>
                  </div>
                ` : ''}
                
                <!-- Content based on active tab -->
                <div style="flex: 1; overflow-y: auto; padding-bottom: 120px;">
                  ${activeTab === 'summary' && summaryData?.mainTakeaway ? `
                    <div role="banner" class="rvised-summary-content" style="
                      background: white;
                      padding: 14px 16px;
                      margin: 12px 16px;
                      border-radius: 10px;
                      border: 1px solid #e2e8f0;
                      position: relative;
                      overflow: hidden;
                      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                    ">
                      <div style="
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        height: 2px;
                        background: linear-gradient(90deg, #3b82f6, #60a5fa);
                      "></div>
                      
                      
                      <!-- Compact header with consistent blue colors -->
                      <div style="
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        margin-bottom: 12px;
                      ">
                        <div style="
                          width: 26px;
                          height: 26px;
                          background: linear-gradient(135deg, #3b82f6, #60a5fa);
                          border-radius: 7px;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          flex-shrink: 0;
                        ">
                          ${activeMode === 'deep' ? 
                            '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>' :
                            activeMode === 'build' ? 
                            '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>' :
                            '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M12 2L2 19l10 3 10-3L12 2z"/></svg>'
                          }
                        </div>
                        <h1 style="
                          font-size: 11px;
                          font-weight: 700;
                          color: #3b82f6;
                          margin: 0;
                          text-transform: uppercase;
                          letter-spacing: 0.08em;
                          line-height: 1;
                        ">${summaryData.videoInsightTitle || 'Key Insight'}</h1>
                      </div>
                      
                      <!-- Premium content with refined typography -->
                      <div style="
                        font-size: 15px;
                        font-weight: 600;
                        color: #0f172a;
                        line-height: 1.5;
                        margin: 0;
                        letter-spacing: -0.02em;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                        text-rendering: optimizeLegibility;
                        -webkit-font-smoothing: antialiased;
                      ">
                        ${highlightKeywords(ensureString(summaryData.mainTakeaway), extractKeywords(ensureString(summaryData.mainTakeaway)))}
                      </div>
                    </div>
                  ` : ''}

                  ${activeTab === 'quiz' ? `
                    <!-- Quiz Tab Content -->
                    <div style="padding: 20px;">
                      ${!summaryData || !summaryData.quiz || summaryData.quiz.length === 0 ? `
                        <div style="text-align: center; padding: 40px 20px;">
                          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5" style="margin: 0 auto 16px;">
                            <path d="M9 11H3v2h6v-2zm0-4H3v2h6V7zm0 8H3v2h6v-2zm12-8h-6v2h6V7zm0 4h-6v2h6v-2zm0 4h-6v2h6v-2z"/>
                          </svg>
                          <h3 style="font-size: 20px; font-weight: 700; color: #111827; margin-bottom: 8px;">Quiz Not Generated</h3>
                          <p style="color: #6b7280; margin-bottom: 20px; font-size: 14px;">Generate a summary first, then create a quiz to test your knowledge!</p>
                          ${isSummarized ? `
                            <button id="rvised-generate-quiz-tab" style="
                              padding: 12px 24px;
                              background: linear-gradient(135deg, #3b82f6, #2563eb);
                              color: white;
                              border: none;
                              border-radius: 8px;
                              font-weight: 600;
                              cursor: pointer;
                              display: inline-flex;
                              align-items: center;
                              gap: 8px;
                              transition: all 0.2s;
                              box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
                            ">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M13 2L3 14l9 0l-1 8l10-12l-9 0l1-8z"/>
                              </svg>
                              Generate Quiz
                            </button>
                          ` : ''}
                        </div>
                      ` : `
                        <div>
                          <h3 style="font-size: 24px; font-weight: 700; color: #111827; margin-bottom: 24px; display: flex; align-items: center; gap: 12px;">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
                              <path d="M9 11H3v2h6v-2zm0-4H3v2h6V7zm0 8H3v2h6v-2zm12-8h-6v2h6V7zm0 4h-6v2h6v-2zm0 4h-6v2h6v-2z"/>
                            </svg>
                            Test Your Knowledge
                          </h3>
                          <div id="quiz-container" style="display: flex; flex-direction: column; gap: 20px;">
                            ${(summaryData.quiz || []).map((q, idx) => {
                              // Log quiz question for debugging
                              console.log(`🎯 Rendering quiz question ${idx + 1}:`, q);
                              console.log(`📋 Raw question data:`, JSON.stringify(q, null, 2));
                              
                              // CRITICAL: Log exactly what we have
                              console.log(`🔴 CRITICAL CHECK for Q${idx + 1}:`);
                              console.log(`  Question: "${q.question}"`);
                              console.log(`  Options:`);
                              q.options?.forEach((opt, i) => {
                                console.log(`    [${i}]: "${opt}"`);
                              });
                              console.log(`  Correct index from data: ${q.correct}`);
                              console.log(`  This means the correct answer should be: "${q.options?.[q.correct]}"`);;
                              
                              // Get the correct index from the quiz data
                              let correctIdx = q.correct;
                              console.log(`🎯 Q${idx + 1} - Using correct index from API: ${correctIdx} (type: ${typeof correctIdx})`);
                              
                              // Fallback checks
                              if (correctIdx === undefined || correctIdx === null) {
                                console.error(`❌ No correct index for Q${idx + 1}`);
                                if (q.answer && q.options) {
                                  // Try to find correct answer by matching the answer field
                                  const answerText = String(q.answer).trim();
                                  correctIdx = q.options.findIndex(opt => 
                                    opt === answerText || opt.toLowerCase() === answerText.toLowerCase()
                                  );
                                  console.log(`🔍 Found correct answer "${answerText}" at index ${correctIdx}`);
                                } else {
                                  console.error(`Cannot determine correct answer for Q${idx + 1}`);
                                  return ''; // Skip this question
                                }
                              }
                              
                              correctIdx = Number(correctIdx);
                              
                              // Validate the correct index
                              if (isNaN(correctIdx) || correctIdx < 0 || correctIdx >= (q.options?.length || 4)) {
                                console.error(`❌ Invalid correct index for Q${idx + 1}: ${correctIdx}`);
                                return ''; // Skip this question
                              }
                              
                              // DO NOT MODIFY - use the original data exactly as provided
                              let renderOptions = q.options || [];
                              let finalCorrectIdx = correctIdx;
                              
                              // Log the actual data we have
                              console.log(`🔍 Question ${idx + 1} Original Data:`, {
                                question: q.question,
                                options: renderOptions,
                                correctIndex: finalCorrectIdx,
                                correctAnswer: renderOptions[finalCorrectIdx]
                              });
                              
                              console.log(`✅ Final correct answer index for question ${idx + 1}: ${finalCorrectIdx} (type: ${typeof finalCorrectIdx})`);
                              console.log(`📝 Render Options:`, renderOptions);
                              console.log(`✓ Correct answer text: "${renderOptions[finalCorrectIdx]}"`);
                              
                              return `
                              <div class="quiz-question-card" data-question-id="${idx}" style="
                                background: white;
                                border: 2px solid #e5e7eb;
                                border-radius: 12px;
                                padding: 20px;
                                transition: all 0.2s;
                              ">
                                <h4 style="font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 16px;">
                                  Question ${idx + 1}: ${q.question}
                                </h4>
                                <div class="quiz-options" style="display: flex; flex-direction: column; gap: 10px;">
                                  ${renderOptions.map((option, optIdx) => {
                                    // Debug: log types and values
                                    console.log(`Before comparison - optIdx: ${optIdx} (type: ${typeof optIdx}), finalCorrectIdx: ${finalCorrectIdx} (type: ${typeof finalCorrectIdx})`);
                                    
                                    // Ensure we're comparing numbers - be explicit
                                    const optionIndex = parseInt(optIdx, 10);
                                    const correctIndex = parseInt(finalCorrectIdx, 10);
                                    const isThisCorrect = (optionIndex === correctIndex);
                                    const dataCorrectValue = isThisCorrect ? 'true' : 'false';
                                    
                                    console.log(`Quiz Q${idx + 1} Option ${optionIndex}: "${option}" - correct=${dataCorrectValue} (optionIndex=${optionIndex}, correctIndex=${correctIndex}, match=${isThisCorrect})`);
                                    
                                    return `
                                    <button class="quiz-option" data-question="${idx}" data-option="${optIdx}" data-correct="${dataCorrectValue}" style="
                                      display: flex;
                                      align-items: center;
                                      gap: 12px;
                                      padding: 12px 16px;
                                      background: #f9fafb;
                                      border: 2px solid #e5e7eb;
                                      border-radius: 8px;
                                      cursor: pointer;
                                      transition: all 0.2s;
                                      text-align: left;
                                      width: 100%;
                                      font-size: 15px;
                                      color: #374151;
                                    ">
                                      <span style="
                                        width: 24px;
                                        height: 24px;
                                        border: 2px solid #cbd5e1;
                                        border-radius: 50%;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        flex-shrink: 0;
                                        background: white;
                                      " class="option-circle">
                                        <span class="option-indicator" style="display: none;"></span>
                                      </span>
                                      <span>${option}</span>
                                    </button>
                                  `}).join('')}
                                </div>
                                <div class="quiz-feedback" style="
                                  display: none;
                                  margin-top: 16px;
                                  padding: 12px;
                                  border-radius: 8px;
                                  font-size: 14px;
                                  font-weight: 500;
                                ">
                                </div>
                              </div>
                            `}).join('')}
                          </div>
                        </div>
                      `}
                    </div>
                  ` : activeTab === 'summary' ? `
                    <article role="main" style="padding: 16px 20px; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;">
                      ${summaryStructure.loading ? `
                        <!-- Skeleton Loading State -->
                        <div style="animation: pulse 1.5s ease-in-out infinite;">
                          ${[1,2,3].map(() => `
                            <div style="margin-bottom: 24px;">
                              <div style="height: 20px; background: #e5e7eb; border-radius: 4px; width: 30%; margin-bottom: 12px;"></div>
                              <div style="height: 14px; background: #f3f4f6; border-radius: 4px; width: 90%; margin-bottom: 8px; margin-left: 8px;"></div>
                              <div style="height: 14px; background: #f3f4f6; border-radius: 4px; width: 85%; margin-bottom: 8px; margin-left: 8px;"></div>
                              <div style="height: 14px; background: #f3f4f6; border-radius: 4px; width: 75%; margin-left: 8px;"></div>
                            </div>
                          `).join('')}
                        </div>
                      ` : `
                        <!-- Structured Content Sections -->
                        ${summaryStructure.sections.map((section, sectionIndex) => `
                          <section class="rvised-summary-section" style="margin-bottom: 14px;" aria-labelledby="section-${sectionIndex}">
                            <!-- Section Header -->
                            <h2 id="section-${sectionIndex}" style="
                              font-size: 18px;
                              font-weight: 700;
                              color: #0f172a;
                              margin: 0 0 10px 0;
                              line-height: 1.3;
                              letter-spacing: -0.02em;
                              text-transform: capitalize;
                              ${section.isTimeline ? 'display: flex; align-items: center; gap: 8px;' : ''}
                            ">
                              ${section.title}
                              ${section.isTimeline ? `
                                <span style="font-size: 12px; color: #6b7280; font-weight: 500; background: #f3f4f6; padding: 2px 8px; border-radius: 12px;">
                                  ${section.items.length} chapters
                                </span>
                              ` : ''}
                            </h2>
                            
                            <!-- Section Items -->
                            ${section.isTimeline ? `
                              <!-- Timeline Grid Layout -->
                              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 8px; margin-top: 12px;">
                                ${section.items.map((item, itemIndex) => `
                                  <div 
                                    class="rvised-timeline-item"
                                    data-timestamp="${item.metadata}"
                                    onclick="(function() {
                                      const time = '${item.metadata}';
                                      const parts = time.split(':').map(p => parseInt(p, 10));
                                      let seconds = 0;
                                      if (parts.length === 3) seconds = parts[0]*3600 + parts[1]*60 + parts[2];
                                      else if (parts.length === 2) seconds = parts[0]*60 + parts[1];
                                      else seconds = parts[0];
                                      const video = document.querySelector('video');
                                      if (video) {
                                        video.currentTime = seconds;
                                        video.play();
                                      }
                                    })()"
                                    style="
                                      padding: 10px;
                                      background: linear-gradient(135deg, #f9fafb, #f3f4f6);
                                      border: 1px solid #e5e7eb;
                                      border-radius: 8px;
                                      cursor: pointer;
                                      transition: all 0.2s;
                                      position: relative;
                                      overflow: hidden;
                                    "
                                    onmouseover="this.style.background='linear-gradient(135deg, #eff6ff, #dbeafe)'; this.style.borderColor='#3b82f6'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(59,130,246,0.1)'"
                                    onmouseout="this.style.background='linear-gradient(135deg, #f9fafb, #f3f4f6)'; this.style.borderColor='#e5e7eb'; this.style.transform='translateY(0)'; this.style.boxShadow='none'"
                                  >
                                    <div style="font-size: 14px; font-weight: 600; color: #3b82f6; margin-bottom: 4px;">
                                      ${item.metadata}
                                    </div>
                                    <div style="font-size: 12px; color: #4b5563; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                                      ${item.content}
                                    </div>
                                  </div>
                                `).join('')}
                              </div>
                            ` : `
                              <ul role="list" style="list-style: none; margin: 0; padding: 0;">
                                ${section.items.map((item, itemIndex) => `
                                <li style="
                                  display: flex;
                                  align-items: flex-start;
                                  margin-bottom: 8px;
                                  padding-left: 8px;
                                  transition: transform 0.2s ease;
                                " 
                                onmouseover="this.style.transform='translateX(4px)';"
                                onmouseout="this.style.transform='translateX(0)';">
                                  
                                  <!-- Icon/Bullet -->
                                  <span style="
                                    display: inline-flex;
                                    align-items: center;
                                    justify-content: center;
                                    width: 20px;
                                    height: 20px;
                                    margin-right: 12px;
                                    flex-shrink: 0;
                                    margin-top: 2px;
                                  ">
                                    ${item.icon === 'check' ? `
                                      <svg width="16" height="16" viewBox="0 0 16 16" fill="${item.color}" aria-hidden="true">
                                        <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/>
                                      </svg>
                                    ` : `
                                      <span style="
                                        width: 6px;
                                        height: 6px;
                                        border-radius: 50%;
                                        background: ${item.color};
                                        display: block;
                                      "></span>
                                    `}
                                  </span>
                                  
                                  <!-- Content -->
                                  <div style="flex: 1;">
                                    <p style="
                                      font-size: 14px;
                                      line-height: 1.45;
                                      color: #0f172a;
                                      margin: 0;
                                      font-weight: ${item.type === 'primary' ? '600' : '500'};
                                      letter-spacing: -0.01em;
                                    ">
                                      ${item.content}
                                      ${item.metadata ? `
                                        <span 
                                          class="rvised-timestamp-badge"
                                          data-timestamp="${item.metadata}"
                                          onclick="(function() {
                                            const time = '${item.metadata}';
                                            const parts = time.split(':').map(p => parseInt(p, 10));
                                            let seconds = 0;
                                            if (parts.length === 3) seconds = parts[0]*3600 + parts[1]*60 + parts[2];
                                            else if (parts.length === 2) seconds = parts[0]*60 + parts[1];
                                            else seconds = parts[0];
                                            const video = document.querySelector('video');
                                            if (video) {
                                              video.currentTime = seconds;
                                              video.play();
                                            }
                                          })()"
                                          style="
                                            font-size: 12px;
                                            color: #3b82f6;
                                            margin-left: 8px;
                                            background: #eff6ff;
                                            padding: 3px 8px;
                                            border-radius: 12px;
                                            font-weight: 600;
                                            cursor: pointer;
                                            border: 1px solid #dbeafe;
                                            transition: all 0.2s;
                                          "
                                          onmouseover="this.style.background='#dbeafe'; this.style.transform='scale(1.05)'"
                                          onmouseout="this.style.background='#eff6ff'; this.style.transform='scale(1)'"
                                        >⏰ ${item.metadata}</span>
                                      ` : ''}
                                    </p>
                                  </div>
                                </li>
                              `).join('')}
                            </ul>
                            `}
                          </section>
                        `).join('')}
                      `}
                    </article>
                    
                    <style>
                      @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.5; }
                      }
                      
                      /* Ensure proper font rendering */
                      * {
                        -webkit-font-smoothing: antialiased;
                        -moz-osx-font-smoothing: grayscale;
                      }
                      
                      /* Focus styles for accessibility */
                      *:focus-visible {
                        outline: 2px solid #3b82f6;
                        outline-offset: 2px;
                        border-radius: 4px;
                      }
                    </style>

                    </div>
                  ` : ''}

                  ${activeTab === 'transcript' ? `
                    <div style="padding: 20px; background: #f9fafb;">
                      <!-- Quick Timeline Navigation -->
                      ${summaryData?.timestampedSections && summaryData.timestampedSections.length > 0 ? `
                        <div style="margin-bottom: 16px; padding: 12px; background: white; border-radius: 8px; border: 1px solid #e5e7eb;">
                          <h5 style="font-size: 12px; font-weight: 600; color: #6b7280; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.05em;">
                            ⏰ Quick Navigation
                          </h5>
                          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                            ${summaryData.timestampedSections.slice(0, 10).map(section => `
                              <button
                                class="rvised-timestamp-chip"
                                data-timestamp="${section.time || section.timestamp}"
                                onclick="(function() {
                                  const time = '${section.time || section.timestamp}';
                                  const parts = time.split(':').map(p => parseInt(p, 10));
                                  let seconds = 0;
                                  if (parts.length === 3) seconds = parts[0]*3600 + parts[1]*60 + parts[2];
                                  else if (parts.length === 2) seconds = parts[0]*60 + parts[1];
                                  else seconds = parts[0];
                                  const video = document.querySelector('video');
                                  if (video) {
                                    video.currentTime = seconds;
                                    video.play();
                                  }
                                })()"
                                style="
                                  padding: 4px 10px;
                                  background: #eff6ff;
                                  border: 1px solid #bfdbfe;
                                  border-radius: 14px;
                                  color: #2563eb;
                                  font-size: 11px;
                                  font-weight: 600;
                                  cursor: pointer;
                                  transition: all 0.2s;
                                "
                                onmouseover="this.style.background='#dbeafe'; this.style.transform='scale(1.05)'"
                                onmouseout="this.style.background='#eff6ff'; this.style.transform='scale(1)'"
                              >
                                ${section.time || section.timestamp}
                              </button>
                            `).join('')}
                          </div>
                        </div>
                      ` : ''}
                      
                      <h4 style="font-weight: 600; font-size: 16px; color: #111827; margin-bottom: 12px;">Full Transcript</h4>
                      <p style="font-size: 14px; color: #4b5563; line-height: 1.5;">
                        ${summaryData?.transcript || 'Transcript content will appear here after summarization.'}
                      </p>
                    </div>
                  ` : ''}

                  ${activeTab === 'dashboard' ? `
                    <div style="padding: 20px; background: #f9fafb;">
                      <h4 style="font-weight: 600; font-size: 16px; color: #111827; margin-bottom: 12px;">Dashboard</h4>
                      <div style="display: flex; flex-direction: column; gap: 12px;">
                        <div style="background: white; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb;">
                          <div style="font-size: 14px; font-weight: 500; color: #111827; margin-bottom: 4px;">Learning Progress</div>
                          <div style="font-size: 12px; color: #6b7280;">Start summarizing videos to track progress</div>
                        </div>
                        <div style="background: white; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb;">
                          <div style="font-size: 14px; font-weight: 500; color: #111827; margin-bottom: 4px;">Active Projects</div>
                          <div style="font-size: 12px; color: #6b7280;">Create your first project to get started</div>
                        </div>
                      </div>
                    </div>
                  ` : ''}
                </div>

                <!-- Footer with save options -->
                <div style="position: absolute; bottom: 0; left: 0; right: 0; border-top: 1px solid #e5e7eb; background: white; padding: 14px 16px; box-shadow: 0 -2px 10px rgba(0,0,0,0.05);">
                  <div style="display: flex; flex-direction: column; gap: 12px;">
                    <div style="display: flex; gap: 8px;">
                      <select id="rvised-project-select" style="flex: 1; height: 36px; padding: 0 12px; border: 1px solid #e5e7eb; border-radius: 8px; background: white; font-size: 14px;">
                        <option value="">Choose project...</option>
                        ${availableProjects && availableProjects.length > 0 ? 
                          availableProjects.map(p => `<option value="${p.id}">${p.emoji || '📁'} ${p.name}</option>`).join('') :
                          '<option value="default">📚 My Library</option>'
                        }
                      </select>
                      <button id="rvised-create-project" style="padding: 0 12px; height: 36px; border: 1px solid #bfdbfe; color: #2563eb; background: #eff6ff; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">
                        + Create
                      </button>
                    </div>
                    <button id="rvised-save-summary" style="width: 100%; background: #2563eb; color: white; padding: 10px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer;">
                      Save Summary
                    </button>
                  </div>
                </div>
              </div>
            ` : ''}
          </div>
        `}
      </div>
    </div>
  `;

  return mainHTML;
  };

  console.log('✅ getNewOverlayUI function registered successfully');
})();