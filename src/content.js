// Content script for Support Buddy Content Filter
console.log('Support Buddy Content Filter content script loaded');

// Inject CSS styles for Support Buddy badge
function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .support-buddy-badge {
      position: absolute;
      top: -8px;
      right: 12px;
      background: #f0401d;
      color: #fff;
      font-size: 12px;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 12px;
      letter-spacing: 0.5px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      z-index: 1000;
    }

    .support-buddy-badge .support-buddy-tooltip.always-show {
      border: 1px solid #bbb;
    }

    /* Support Buddy Tooltip Styles */
    .support-buddy-tooltip {
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      background: #1f2937;
      border: 1px solid #374151;
      border-radius: 8px;
      padding: 12px;
      width: 280px;
      z-index: 1000;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
      margin-bottom: 8px;
      opacity: 0;
      visibility: hidden;
      transition: all 0.2s ease;
    }

    .support-buddy-tooltip.show, .support-buddy-tooltip.always-show {
      opacity: 1;
      visibility: visible;
    }

    .support-buddy-tooltip::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 6px solid transparent;
      border-top-color: #374151;
    }

    .support-buddy-tooltip-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .support-buddy-tooltip-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      fill: #f0401d;
    }

    .support-buddy-tooltip-title {
      font-weight: 600;
      font-size: 13px;
      color: #f0401d;
      margin: 0;
    }

    .support-buddy-tooltip-content {
      font-size: 12px;
      line-height: 16px;
      color: #e5e7eb;
      margin: 0;
    }

    .support-buddy-tooltip-source {
      font-size: 10px;
      color: #9ca3af;
      margin-top: 6px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .support-buddy-badge svg {
      vertical-align: top;
    }
  `;
  document.head.appendChild(style);
}

// Toggle tooltip persistent state
function toggleTooltip(badge) {
  const tooltip = badge.querySelector('.support-buddy-tooltip');
  const isPersistent = badge.dataset.persistent === 'true';
  
  if (isPersistent) {
    badge.dataset.persistent = 'false';
    tooltip.classList.remove('always-show');
  } else {
    badge.dataset.persistent = 'true';
    tooltip.classList.add('always-show');
  }
}

// Initialize content filtering
async function initializeFilter() {
  try {
    // Inject CSS styles first
    injectStyles();
    
    // Get settings from background script
    const settings = await chrome.storage.sync.get(['enabled', 'filterLevel']);
    
    if (settings.enabled) {
      console.log('Content filter enabled with level:', settings.filterLevel);
      startContentFiltering(settings.filterLevel);
    }
  } catch (error) {
    console.error('Error initializing filter:', error);
  }
}

// Start content filtering based on level
function startContentFiltering(level) {
  console.log('Starting content filtering with level:', level);
  
  
  // Set up observer for dynamically loaded tweets
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const articles = node.querySelectorAll('article');
            const textContents = node.querySelectorAll('div[data-testid="tweetText"] span');

            articles.forEach(article => {
              injectBadge(article);
            });

            textContents.forEach(textContent => {
              console.log(textContent);
            });
          }
        });
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Process all existing tweet text elements
// function processTweetTexts() {
//   const tweetTexts = document.querySelectorAll('div[data-testid="tweetText"]');
//   console.log(`Found ${tweetTexts.length} tweet text elements`);
  
//   tweetTexts.forEach(tweetText => {
//     injectDivAfterElement(tweetText);
//   });
// }

// Inject Support Buddy badge after the given element
function injectBadge(article) {
  // Check if we've already injected a div for this element
  if (article.dataset.supportBuddyProcessed) {
    return;
  }
  
  // Mark as processed
  article.dataset.supportBuddyProcessed = 'true';
  
  // Find the tweet container to position the badge
  
  // Create the Support Buddy badge
  const supportBuddyBadge = document.createElement('div');
  supportBuddyBadge.className = 'support-buddy-badge';
  supportBuddyBadge.innerHTML = `
    <svg width="14" height="18" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" fill="none">
      <path fill="#fff" fill-rule="evenodd" d="M10 3a7 7 0 100 14 7 7 0 000-14zm-9 7a9 9 0 1118 0 9 9 0 01-18 0zm10.01 4a1 1 0 01-1 1H10a1 1 0 110-2h.01a1 1 0 011 1zM11 6a1 1 0 10-2 0v5a1 1 0 102 0V6z"/>
    </svg>
    <!-- <span>SUPPORT BUDDY</span> -->
    <div class="support-buddy-tooltip">
      <div class="support-buddy-tooltip-header">
        <svg width="18" height="18" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none">
          <path fill="#fff" fill-rule="evenodd" d="M10 3a7 7 0 100 14 7 7 0 000-14zm-9 7a9 9 0 1118 0 9 9 0 01-18 0zm10.01 4a1 1 0 01-1 1H10a1 1 0 110-2h.01a1 1 0 011 1zM11 6a1 1 0 10-2 0v5a1 1 0 102 0V6z"/>
        </svg>
        <h4 class="support-buddy-tooltip-title">Information:</h4>
      </div>
      <p class="support-buddy-tooltip-content">
        This tweet contains language that may promote discrimination or violence against religious minorities. The content has been flagged by Support Buddy for potential harm.
      </p>
      <div class="support-buddy-tooltip-source">Source: Support Buddy AI</div>
    </div>
  `;
  
  // Add click handler for tooltip toggle
  supportBuddyBadge.addEventListener('click', function() {
    toggleTooltip(supportBuddyBadge);
  });
  
  // Add hover handlers for tooltip
  supportBuddyBadge.addEventListener('mouseenter', function() {
    const tooltip = supportBuddyBadge.querySelector('.support-buddy-tooltip');
    if (!supportBuddyBadge.dataset.persistent) {
      tooltip.classList.add('show');
    }
  });
  
  supportBuddyBadge.addEventListener('mouseleave', function() {
    const tooltip = supportBuddyBadge.querySelector('.support-buddy-tooltip');
    if (!supportBuddyBadge.dataset.persistent) {
      tooltip.classList.remove('show');
    }
  });
  
  // Insert the badge before the article node
  article.parentNode.insertBefore(supportBuddyBadge, article);
  
  console.log('Injected Support Buddy badge after tweet text element');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeFilter);
} else {
  initializeFilter();
}