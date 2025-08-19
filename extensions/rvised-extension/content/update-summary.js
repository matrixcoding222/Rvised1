// Enhanced function to update summary content that matches v0 UI exactly
function updateSummaryContent(summaryData) {
  if (!summaryData || !rvisedContainer) return;
  
  // Update key insight/takeaway
  const keyInsightElement = rvisedContainer.querySelector('.rvised-v0-key-insight');
  if (keyInsightElement && summaryData.mainTakeaway) {
    keyInsightElement.innerHTML = `
      <h4>Key Insight</h4>
      <p>${summaryData.mainTakeaway}</p>
    `;
  }
  
  // Update summary content sections
  const summaryContentElement = rvisedContainer.querySelector('#rvised-summary-content');
  if (summaryContentElement) {
    let summaryHTML = '';
    
    // Check API response structure
    const timestamps = summaryData.timestampedSections || 
                      summaryData.timestamps || 
                      summaryData._debug?.timestamps || 
                      [];
    
    if (timestamps.length > 0) {
      // Use timestamped sections if available
      timestamps.forEach((section) => {
        const timestamp = section.time || section.timestamp || '00:00';
        const title = section.title || section.description || '';
        const content = section.content || section.text || title;
        
        // Parse title and content if they're combined
        let displayTitle = title;
        let displayContent = content;
        
        if (!section.content && section.description) {
          // Split description into title and content
          const parts = section.description.split(':');
          if (parts.length > 1) {
            displayTitle = parts[0].trim();
            displayContent = parts.slice(1).join(':').trim();
          } else {
            displayTitle = section.description.substring(0, 50) + '...';
            displayContent = section.description;
          }
        }
        
        summaryHTML += `
          <div class="rvised-v0-summary-item">
            ${includeTimestamps ? `
              <div class="rvised-v0-timestamp">
                <img src="${chrome.runtime.getURL('icons/time-stamp.svg')}" width="12" height="12" alt="" />
                ${timestamp}
              </div>
            ` : ''}
            <div class="rvised-v0-summary-content">
              <h5 class="rvised-v0-summary-title">${displayTitle}</h5>
              <p class="rvised-v0-summary-text">${displayContent}</p>
            </div>
            <img src="${chrome.runtime.getURL('icons/play-151.svg')}" width="16" height="16" class="rvised-v0-play-icon" alt="" />
          </div>
        `;
      });
    } else if (summaryData.keyInsights?.length > 0) {
      // Use key insights as sections
      summaryData.keyInsights.forEach((insight, index) => {
        summaryHTML += `
          <div class="rvised-v0-summary-item">
            <div class="rvised-v0-summary-content" style="flex: 1;">
              <h5 class="rvised-v0-summary-title">Key Point ${index + 1}</h5>
              <p class="rvised-v0-summary-text">${insight}</p>
            </div>
            <img src="${chrome.runtime.getURL('icons/play-151.svg')}" width="16" height="16" class="rvised-v0-play-icon" alt="" />
          </div>
        `;
      });
    } else if (summaryData.summary) {
      // Create sections from summary text
      const sentences = summaryData.summary.match(/[^.!?]+[.!?]+/g) || [summaryData.summary];
      const sectionSize = Math.ceil(sentences.length / 3);
      const sections = [];
      
      for (let i = 0; i < sentences.length; i += sectionSize) {
        sections.push(sentences.slice(i, i + sectionSize).join(' ').trim());
      }
      
      const sectionTitles = ['Overview', 'Key Points', 'Conclusion'];
      sections.forEach((section, index) => {
        if (section) {
          summaryHTML += `
            <div class="rvised-v0-summary-item">
              <div class="rvised-v0-summary-content" style="flex: 1;">
                <h5 class="rvised-v0-summary-title">${sectionTitles[index] || 'Section ' + (index + 1)}</h5>
                <p class="rvised-v0-summary-text">${section}</p>
              </div>
              <img src="${chrome.runtime.getURL('icons/play-151.svg')}" width="16" height="16" class="rvised-v0-play-icon" alt="" />
            </div>
          `;
        }
      });
    }
    
    summaryContentElement.innerHTML = summaryHTML;
  }
  
  // Update action items if present
  const actionItemsContainer = rvisedContainer.querySelector('.rvised-v0-action-items');
  if (actionItemsContainer && summaryData.actionItems?.length > 0 && showActionItems) {
    let actionHTML = '<h4>Action Items</h4>';
    summaryData.actionItems.forEach(item => {
      actionHTML += `
        <div class="rvised-v0-action-item">
          <div class="rvised-v0-action-bullet"></div>
          <p class="rvised-v0-action-text">${item}</p>
        </div>
      `;
    });
    actionItemsContainer.innerHTML = actionHTML;
  }
  
  // Add click handlers for timestamps
  setTimeout(() => {
    const timestampElements = rvisedContainer.querySelectorAll('.rvised-v0-timestamp');
    timestampElements.forEach(elem => {
      elem.style.cursor = 'pointer';
      elem.addEventListener('click', () => {
        const timeText = elem.textContent.trim();
        const seconds = parseTimeToSeconds(timeText);
        const video = document.querySelector('video');
        if (video) {
          video.currentTime = seconds;
          video.play();
        }
      });
    });
    
    // Add click handlers for play icons
    const playIcons = rvisedContainer.querySelectorAll('.rvised-v0-play-icon');
    playIcons.forEach((icon, index) => {
      icon.style.cursor = 'pointer';
      icon.addEventListener('click', () => {
        const item = icon.closest('.rvised-v0-summary-item');
        const timestamp = item?.querySelector('.rvised-v0-timestamp');
        if (timestamp) {
          const timeText = timestamp.textContent.trim();
          const seconds = parseTimeToSeconds(timeText);
          const video = document.querySelector('video');
          if (video) {
            video.currentTime = seconds;
            video.play();
          }
        }
      });
    });
  }, 100);
}

// Export for use
if (typeof window !== 'undefined') {
  window.updateSummaryContent = updateSummaryContent;
}