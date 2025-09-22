// Background script for Support Buddy Content Filter
console.log('Support Buddy Content Filter background script loaded');

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed:', details);
  
  // Set default settings
  chrome.storage.sync.set({
    enabled: true,
    filterLevel: 'medium'
  });
});

