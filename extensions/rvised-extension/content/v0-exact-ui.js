// Enhanced v0 UI implementation with beautiful styling
function getExactV0UI(state = {}) {
  const {
    isCollapsed = false,
    isSummarized = false,
    isLoading = false,
    summaryData = null,
    videoTitle = '',
    channelName = ''
  } = state;

  // Helper to create icon URLs
  const getIconUrl = (iconName) => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
      return chrome.runtime.getURL(`icons/${iconName}`);
    }
    return `extensions/rvised-extension/icons/${iconName}`;
  };

  // Create icon element
  const createIcon = (iconName, width = 20, height = 20, className = '') => {
    return `<img src="${getIconUrl(iconName)}" width="${width}" height="${height}" class="${className}" alt="" />`;
  };

  // Generate enhanced summary HTML
  const generateEnhancedSummary = () => {
    if (!summaryData) return '<div class="loading-state">Loading summary...</div>';
    
    let html = `<div class="summary-content">`;
    
    // Main Takeaway - Hero Style
    if (summaryData.mainTakeaway) {
      html += `
        <div class="main-takeaway">
          <h3>🎯 Main Takeaway</h3>
          <p>${summaryData.mainTakeaway}</p>
        </div>
      `;
    }
    
    // Summary Text
    if (summaryData.summary) {
      html += `
        <div class="summary-text">
          <h3>📝 Summary</h3>
          <div>${summaryData.summary}</div>
        </div>
      `;
    }
    
    // Tech Stack - Modern Pills
    if (summaryData.techStack && summaryData.techStack.length > 0) {
      html += `
        <div class="tech-stack">
          <h3>🛠️ Tech Stack</h3>
          <div class="tech-tags">
            ${summaryData.techStack.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
          </div>
        </div>
      `;
    }
    
    // Key Insights - Card Style
    if (summaryData.keyInsights && summaryData.keyInsights.length > 0) {
      html += `
        <div class="key-insights">
          <h3>💡 Key Insights</h3>
          <ul>
            ${summaryData.keyInsights.map(insight => `<li>${insight}</li>`).join('')}
          </ul>
        </div>
      `;
    }
    
    // Action Items - Success Style
    if (summaryData.actionItems && summaryData.actionItems.length > 0) {
      html += `
        <div class="action-items">
          <h3>⚡ Action Items</h3>
          <ul>
            ${summaryData.actionItems.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      `;
    }
    
    // Timestamped Sections - Timeline Style
    const timestamps = summaryData.timestampedSections || summaryData.timestamps || [];
    if (timestamps.length > 0) {
      html += `
        <div class="timestamped-sections">
          <h3>📍 Timestamped Sections</h3>
          <ul>
            ${timestamps.map(section => {
              const time = section.time || section.timestamp || '00:00';
              const desc = section.description || section.title || section.content || '';
              return `<li><strong>[${time}]</strong> ${desc}</li>`;
            }).join('')}
          </ul>
        </div>
      `;
    }
    
    html += '</div>';
    return html;
  };

  // Main UI structure
  return `
    <div id="rvised-extension-overlay" style="
      position: fixed;
      top: 80px;
      right: 20px;
      width: ${isCollapsed ? '320px' : '440px'};
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', Roboto, sans-serif;
      transition: all 0.3s ease;
    ">
      <div id="rvised-main-card" style="
        background: white;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        max-height: ${isCollapsed ? '200px' : '80vh'};
        display: flex;
        flex-direction: column;
        transition: all 0.3s ease;
      ">
        <!-- Header with gradient -->
        <div class="rvised-header" style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 16px 20px;
          color: white;
          flex-shrink: 0;
        ">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 10px;">
              ${createIcon('eyeglasses-icon.svg', 24, 24)}
              <span style="font-size: 18px; font-weight: 700; letter-spacing: -0.02em;">RVISED</span>
              ${isCollapsed && isSummarized ? '<span style="background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-left: 8px;">✓ Summarized</span>' : ''}
            </div>
            <div style="display: flex; gap: 8px;">
              <button id="rvised-collapse-btn" style="
                background: rgba(255,255,255,0.2);
                border: none;
                width: 32px;
                height: 32px;
                border-radius: 8px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
              " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                ${createIcon('collapse-3.svg', 16, 16)}
              </button>
              <button id="rvised-dashboard-btn" style="
                background: rgba(255,255,255,0.2);
                border: none;
                width: 32px;
                height: 32px;
                border-radius: 8px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
              " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                </svg>
              </button>
            </div>
          </div>
          ${!isCollapsed && videoTitle ? `
            <div style="margin-top: 8px; opacity: 0.9; font-size: 14px;">
              <div style="font-weight: 600;">${videoTitle}</div>
              ${channelName ? `<div style="font-size: 12px; margin-top: 2px;">by ${channelName}</div>` : ''}
            </div>
          ` : ''}
        </div>
        
        <!-- Content area -->
        <div class="rvised-content" style="
          flex: 1;
          overflow-y: auto;
          padding: ${isCollapsed ? '16px' : '20px'};
          ${isCollapsed ? 'display: flex; flex-direction: column; align-items: center; justify-content: center;' : ''}
        ">
          ${isLoading ? `
            <div class="loading-animation" style="padding: 40px; text-align: center;">
              <div style="display: flex; justify-content: center; gap: 8px; margin-bottom: 16px;">
                <div class="loading-dot" style="width: 12px; height: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; animation: bounce 1.4s ease-in-out infinite; animation-delay: -0.32s;"></div>
                <div class="loading-dot" style="width: 12px; height: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; animation: bounce 1.4s ease-in-out infinite; animation-delay: -0.16s;"></div>
                <div class="loading-dot" style="width: 12px; height: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; animation: bounce 1.4s ease-in-out infinite;"></div>
              </div>
              <p style="color: #64748b; font-weight: 500;">Analyzing video content...</p>
            </div>
          ` : (isSummarized && !isCollapsed ? generateEnhancedSummary() : '')}
          
          ${!isLoading && (!isSummarized || isCollapsed) ? `
            <button id="rvised-summarize-btn" style="
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              border: none;
              padding: ${isCollapsed ? '10px 20px' : '14px 28px'};
              border-radius: 10px;
              font-size: ${isCollapsed ? '14px' : '16px'};
              font-weight: 600;
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 8px;
              transition: all 0.2s;
              box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
              ${isCollapsed ? 'width: 100%;' : 'width: 100%;'}
              justify-content: center;
            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(102, 126, 234, 0.5)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(102, 126, 234, 0.4)';">
              ${createIcon('eyeglasses-icon.svg', 20, 20)}
              <span>${isSummarized ? (isCollapsed ? 'View Summary' : 'Re-generate') : 'Summarize Video'}</span>
            </button>
          ` : ''}
        </div>
        
        ${isSummarized && !isCollapsed ? `
          <!-- Footer with actions -->
          <div style="
            border-top: 1px solid #e5e7eb;
            padding: 16px 20px;
            background: #fafafa;
            display: flex;
            gap: 8px;
            justify-content: flex-end;
          ">
            <button id="rvised-save-btn" style="
              background: white;
              border: 1px solid #e5e7eb;
              padding: 8px 16px;
              border-radius: 8px;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
              color: #374151;
              transition: all 0.2s;
            " onmouseover="this.style.background='#f9fafb';" onmouseout="this.style.background='white';">
              Save to Library
            </button>
            <button id="rvised-share-btn" style="
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border: none;
              padding: 8px 16px;
              border-radius: 8px;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
              color: white;
              transition: all 0.2s;
            " onmouseover="this.style.opacity='0.9';" onmouseout="this.style.opacity='1';">
              Share Summary
            </button>
          </div>
        ` : ''}
      </div>
    </div>
    
    <style>
      @keyframes bounce {
        0%, 80%, 100% {
          transform: scale(0.8);
          opacity: 0.5;
        }
        40% {
          transform: scale(1.2);
          opacity: 1;
        }
      }
      
      .rvised-content::-webkit-scrollbar {
        width: 6px;
      }
      
      .rvised-content::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 3px;
      }
      
      .rvised-content::-webkit-scrollbar-thumb {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 3px;
      }
    </style>
  `;
}

// Export for use
if (typeof window !== 'undefined') {
  window.getExactV0UI = getExactV0UI;
}