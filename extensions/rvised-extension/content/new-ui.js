// Modern v0/shadcn-style UI for Rvised Extension
function createModernRvisedUI() {
  return `
    <div id="rvised-wrapper" class="rvised-extension">
      <style>
        .rvised-extension {
          font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
          width: 100%;
          margin-bottom: 1.5rem;
        }
        
        .rvised-card {
          background: white;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
          border: 1px solid rgb(229 231 235);
          overflow: hidden;
        }
        
        /* Header */
        .rvised-header {
          padding: 1rem;
          border-bottom: 1px solid rgb(229 231 235);
          background: rgb(249 250 251);
        }
        
        .rvised-header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .rvised-logo-section {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .rvised-logo {
          width: 2rem;
          height: 2rem;
          background: linear-gradient(to bottom right, rgb(99 102 241), rgb(139 92 246));
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 1rem;
        }
        
        .rvised-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: rgb(17 24 39);
        }
        
        .rvised-subtitle {
          font-size: 0.75rem;
          color: rgb(107 114 128);
        }
        
        .rvised-header-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .rvised-icon-btn {
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.375rem;
          border: 1px solid rgb(229 231 235);
          background: white;
          cursor: pointer;
          transition: all 0.15s;
          color: rgb(107 114 128);
        }
        
        .rvised-icon-btn:hover {
          background: rgb(243 244 246);
          border-color: rgb(209 213 219);
        }
        
        /* Tabs */
        .rvised-tabs {
          border-bottom: 1px solid rgb(229 231 235);
          background: white;
        }
        
        .rvised-tab-list {
          display: flex;
          padding: 0 1rem;
          gap: 0.25rem;
        }
        
        .rvised-tab {
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: rgb(107 114 128);
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          transition: all 0.15s;
          position: relative;
        }
        
        .rvised-tab:hover {
          color: rgb(75 85 99);
        }
        
        .rvised-tab.active {
          color: rgb(99 102 241);
          border-bottom-color: rgb(99 102 241);
        }
        
        /* Content */
        .rvised-content {
          padding: 1rem;
          max-height: 400px;
          overflow-y: auto;
          background: white;
        }
        
        .rvised-content::-webkit-scrollbar {
          width: 6px;
        }
        
        .rvised-content::-webkit-scrollbar-track {
          background: rgb(243 244 246);
          border-radius: 3px;
        }
        
        .rvised-content::-webkit-scrollbar-thumb {
          background: rgb(209 213 219);
          border-radius: 3px;
        }
        
        .rvised-content::-webkit-scrollbar-thumb:hover {
          background: rgb(156 163 175);
        }
        
        /* Generate Button */
        .rvised-generate-section {
          padding: 2rem;
          text-align: center;
        }
        
        .rvised-generate-btn {
          width: 100%;
          padding: 0.625rem 1.25rem;
          background: linear-gradient(to right, rgb(99 102 241), rgb(139 92 246));
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
        }
        
        .rvised-generate-btn:hover {
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
          transform: translateY(-1px);
        }
        
        /* Summary Content */
        .rvised-summary-section {
          margin-bottom: 1.5rem;
        }
        
        .rvised-summary-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: rgb(17 24 39);
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .rvised-summary-content {
          font-size: 0.875rem;
          line-height: 1.5;
          color: rgb(75 85 99);
        }
        
        .rvised-key-point {
          padding: 0.75rem;
          background: rgb(249 250 251);
          border-radius: 0.5rem;
          margin-bottom: 0.5rem;
          border-left: 3px solid rgb(99 102 241);
        }
        
        .rvised-timestamp {
          display: inline-block;
          padding: 0.125rem 0.375rem;
          background: rgb(239 246 255);
          color: rgb(59 130 246);
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          margin-right: 0.5rem;
        }
        
        .rvised-timestamp:hover {
          background: rgb(219 234 254);
        }
        
        /* Quiz */
        .rvised-quiz-question {
          padding: 1rem;
          background: rgb(249 250 251);
          border-radius: 0.5rem;
          margin-bottom: 1rem;
        }
        
        .rvised-quiz-question-text {
          font-size: 0.875rem;
          font-weight: 500;
          color: rgb(17 24 39);
          margin-bottom: 0.75rem;
        }
        
        .rvised-quiz-option {
          padding: 0.5rem 0.75rem;
          background: white;
          border: 1px solid rgb(229 231 235);
          border-radius: 0.375rem;
          margin-bottom: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
          color: rgb(75 85 99);
          transition: all 0.15s;
        }
        
        .rvised-quiz-option:hover {
          border-color: rgb(99 102 241);
          background: rgb(249 250 251);
        }
        
        /* Notes */
        .rvised-notes-textarea {
          width: 100%;
          min-height: 120px;
          padding: 0.75rem;
          border: 1px solid rgb(229 231 235);
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-family: inherit;
          resize: vertical;
          transition: all 0.15s;
        }
        
        .rvised-notes-textarea:focus {
          outline: none;
          border-color: rgb(99 102 241);
          box-shadow: 0 0 0 3px rgb(99 102 241 / 0.1);
        }
        
        /* Footer */
        .rvised-footer {
          padding: 1rem;
          border-top: 1px solid rgb(229 231 235);
          background: rgb(249 250 251);
        }
        
        .rvised-footer-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .rvised-footer-btn {
          flex: 1;
          padding: 0.5rem 0.75rem;
          background: white;
          border: 1px solid rgb(229 231 235);
          border-radius: 0.375rem;
          font-size: 0.8125rem;
          font-weight: 500;
          color: rgb(75 85 99);
          cursor: pointer;
          transition: all 0.15s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.375rem;
        }
        
        .rvised-footer-btn:hover {
          background: rgb(249 250 251);
          border-color: rgb(209 213 219);
        }
        
        .rvised-footer-btn.primary {
          background: rgb(99 102 241);
          color: white;
          border-color: rgb(99 102 241);
        }
        
        .rvised-footer-btn.primary:hover {
          background: rgb(79 70 229);
        }
        
        /* Loading */
        .rvised-loading {
          padding: 3rem;
          text-align: center;
        }
        
        .rvised-spinner {
          width: 2rem;
          height: 2rem;
          border: 2px solid rgb(229 231 235);
          border-top-color: rgb(99 102 241);
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          margin: 0 auto 1rem;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        /* Settings Panel */
        .rvised-settings {
          padding: 1rem;
          background: rgb(249 250 251);
          border-bottom: 1px solid rgb(229 231 235);
        }
        
        .rvised-settings-group {
          margin-bottom: 1rem;
        }
        
        .rvised-settings-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: rgb(107 114 128);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }
        
        .rvised-button-group {
          display: flex;
          gap: 0.25rem;
          padding: 0.25rem;
          background: rgb(243 244 246);
          border-radius: 0.5rem;
        }
        
        .rvised-button-group button {
          flex: 1;
          padding: 0.375rem 0.75rem;
          background: transparent;
          border: none;
          border-radius: 0.375rem;
          font-size: 0.8125rem;
          font-weight: 500;
          color: rgb(75 85 99);
          cursor: pointer;
          transition: all 0.15s;
        }
        
        .rvised-button-group button:hover {
          background: rgba(255, 255, 255, 0.5);
        }
        
        .rvised-button-group button.active {
          background: white;
          color: rgb(17 24 39);
          box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
        }
        
        .rvised-checkbox-group {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }
        
        .rvised-checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8125rem;
          color: rgb(75 85 99);
          cursor: pointer;
        }
        
        .rvised-checkbox {
          width: 1rem;
          height: 1rem;
          accent-color: rgb(99 102 241);
        }
        
        /* Minimized State */
        .rvised-card.minimized .rvised-content,
        .rvised-card.minimized .rvised-tabs,
        .rvised-card.minimized .rvised-settings,
        .rvised-card.minimized .rvised-footer {
          display: none;
        }
      </style>
      
      <div class="rvised-card ${isMinimized ? 'minimized' : ''}" id="rvised-card">
        <!-- Header -->
        <div class="rvised-header">
          <div class="rvised-header-content">
            <div class="rvised-logo-section">
              <div class="rvised-logo">R</div>
              <div>
                <div class="rvised-title">Rvised AI</div>
                <div class="rvised-subtitle" id="video-status">Ready to summarize</div>
              </div>
            </div>
            <div class="rvised-header-actions">
              <button class="rvised-icon-btn" id="settings-btn" title="Settings">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/>
                </svg>
              </button>
              <button class="rvised-icon-btn" id="minimize-btn" title="Minimize">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Settings Panel -->
        <div class="rvised-settings" id="settings-panel" style="${showSettings ? '' : 'display: none;'}">
          <div class="rvised-settings-group">
            <div class="rvised-settings-label">Learning Mode</div>
            <div class="rvised-button-group">
              <button data-mode="student" class="${activeMode === 'student' ? 'active' : ''}">📚 Student</button>
              <button data-mode="professional" class="${activeMode === 'professional' ? 'active' : ''}">💼 Professional</button>
              <button data-mode="research" class="${activeMode === 'research' ? 'active' : ''}">🔬 Research</button>
            </div>
          </div>
          
          <div class="rvised-settings-group">
            <div class="rvised-settings-label">Summary Depth</div>
            <div class="rvised-button-group">
              <button data-depth="quick" class="depth-btn">⚡ Quick</button>
              <button data-depth="standard" class="depth-btn active">📝 Standard</button>
              <button data-depth="detailed" class="depth-btn">📖 Detailed</button>
            </div>
          </div>
          
          <div class="rvised-settings-group">
            <div class="rvised-settings-label">Options</div>
            <div class="rvised-checkbox-group">
              <label class="rvised-checkbox-label">
                <input type="checkbox" class="rvised-checkbox" id="include-timestamps" checked>
                <span>Timestamps</span>
              </label>
              <label class="rvised-checkbox-label">
                <input type="checkbox" class="rvised-checkbox" id="include-keypoints" checked>
                <span>Key Points</span>
              </label>
              <label class="rvised-checkbox-label">
                <input type="checkbox" class="rvised-checkbox" id="include-quiz" checked>
                <span>Quiz</span>
              </label>
              <label class="rvised-checkbox-label">
                <input type="checkbox" class="rvised-checkbox" id="include-actions">
                <span>Action Items</span>
              </label>
            </div>
          </div>
        </div>
        
        <!-- Generate Button Section -->
        <div class="rvised-content" id="generate-section" style="${isSummarized ? 'display: none;' : ''}">
          <div class="rvised-generate-section">
            <button class="rvised-generate-btn" id="summarize-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
              <span id="btn-text">Generate AI Summary</span>
            </button>
          </div>
        </div>
        
        <!-- Tabs -->
        <div class="rvised-tabs" id="tabs-section" style="${!isSummarized ? 'display: none;' : ''}">
          <div class="rvised-tab-list">
            <button class="rvised-tab ${activeTab === 'summary' ? 'active' : ''}" data-tab="summary">Summary</button>
            <button class="rvised-tab ${activeTab === 'keypoints' ? 'active' : ''}" data-tab="keypoints">Key Points</button>
            <button class="rvised-tab ${activeTab === 'quiz' ? 'active' : ''}" data-tab="quiz">Quiz</button>
            <button class="rvised-tab ${activeTab === 'notes' ? 'active' : ''}" data-tab="notes">Notes</button>
          </div>
        </div>
        
        <!-- Content Area -->
        <div class="rvised-content" style="${!isSummarized ? 'display: none;' : ''}">
          <!-- Loading State -->
          <div id="loading-state" class="rvised-loading" style="${isProcessing ? '' : 'display: none;'}">
            <div class="rvised-spinner"></div>
            <div style="font-size: 0.875rem; color: rgb(107 114 128);">Analyzing video content...</div>
          </div>
          
          <!-- Tab Content -->
          <div id="summary-content" style="${activeTab === 'summary' && isSummarized ? '' : 'display: none;'}">
            <div id="summary-sections"></div>
          </div>
          
          <div id="keypoints-content" style="${activeTab === 'keypoints' && isSummarized ? '' : 'display: none;'}">
            <div id="keypoints-sections"></div>
          </div>
          
          <div id="quiz-content" style="${activeTab === 'quiz' && isSummarized ? '' : 'display: none;'}">
            <div id="quiz-questions"></div>
          </div>
          
          <div id="notes-content" style="${activeTab === 'notes' && isSummarized ? '' : 'display: none;'}">
            <textarea class="rvised-notes-textarea" id="personal-notes" placeholder="Add your notes here...">${personalNotes}</textarea>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="rvised-footer" id="footer-actions" style="${!isSummarized ? 'display: none;' : ''}">
          <div class="rvised-footer-actions">
            <button class="rvised-footer-btn" id="copy-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
              Copy
            </button>
            <button class="rvised-footer-btn" id="export-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
              </svg>
              Export
            </button>
            <button class="rvised-footer-btn primary" id="save-library-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z"/>
              </svg>
              Save to Library
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}