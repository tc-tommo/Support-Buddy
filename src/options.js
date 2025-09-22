// Options page script for Support Buddy Content Filter
console.log('Support Buddy Content Filter options page loaded');

// DOM elements
const enableToggle = document.getElementById('enableToggle');
const filterLevelSelect = document.getElementById('filterLevel');
const saveButton = document.getElementById('saveButton');
const statusMessage = document.getElementById('statusMessage');

// Load current settings
async function loadSettings() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getSettings' });
    const { enabled, filterLevel } = response;
    
    enableToggle.checked = enabled;
    filterLevelSelect.value = filterLevel;
    
    console.log('Settings loaded:', { enabled, filterLevel });
  } catch (error) {
    console.error('Error loading settings:', error);
    showStatus('Error loading settings', 'error');
  }
}

// Save settings
async function saveSettings() {
  try {
    const settings = {
      enabled: enableToggle.checked,
      filterLevel: filterLevelSelect.value
    };
    
    const response = await chrome.runtime.sendMessage({
      action: 'updateSettings',
      settings: settings
    });
    
    if (response.success) {
      showStatus('Settings saved successfully!', 'success');
      console.log('Settings saved:', settings);
    } else {
      showStatus('Error saving settings', 'error');
    }
  } catch (error) {
    console.error('Error saving settings:', error);
    showStatus('Error saving settings', 'error');
  }
}

// Show status message
function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = `status ${type}`;
  statusMessage.style.display = 'block';
  
  // Hide after 3 seconds
  setTimeout(() => {
    statusMessage.style.display = 'none';
  }, 3000);
}

// Event listeners
saveButton.addEventListener('click', saveSettings);

// Load settings when page loads
document.addEventListener('DOMContentLoaded', loadSettings);


