// Popup script for Support Buddy Content Filter
console.log('Support Buddy Content Filter popup loaded');

// DOM elements
const enableToggle = document.getElementById('enableToggle');
const toggleLabel = document.getElementById('toggleLabel');
const filterLevelSelect = document.getElementById('filterLevel');
const statusMessage = document.getElementById('statusMessage');

// Load current status
async function loadStatus() {
  try {
    chrome.storage.sync.get(['enabled', 'filterLevel'], (result) => {
      updateUI(result.enabled, result.filterLevel);
      console.log('Settings loaded:', result);
    });
  } catch (error) {
    console.error('Error loading status:', error);
    updateUI(false, 'medium');
  }
}

// Update UI based on current settings
function updateUI(enabled, filterLevel) {
  if (enableToggle) {
    enableToggle.checked = enabled;
    toggleLabel.textContent = enabled ? 'Enabled' : 'Disabled';
  }
  
  if (filterLevelSelect) {
    filterLevelSelect.value = filterLevel || 'medium';
  }
}

// Save settings
async function saveSettings() {
  try {
    const settings = {
      enabled: enableToggle.checked,
      filterLevel: filterLevelSelect.value
    };
    


    
    chrome.storage.sync.set(settings, () => {
      toggleLabel.textContent = enableToggle.checked ? 'Enabled' : 'Disabled';
      statusMessage.textContent = 'Settings saved!';
      statusMessage.className = 'status success';
      statusMessage.style.display = 'block';
    });
    
    // Hide status message after 2 seconds
    setTimeout(() => {
      statusMessage.style.display = 'none';
    }, 1000);
    
    console.log('Settings saved:', settings);
  } catch (error) {
    console.error('Error saving settings:', error);
    statusMessage.textContent = 'Error saving settings';
    statusMessage.className = 'status error';
    statusMessage.style.display = 'block';
  }
}

// Event listeners
if (enableToggle) {
  enableToggle.addEventListener('change', saveSettings);
}

if (filterLevelSelect) {
  filterLevelSelect.addEventListener('change', saveSettings);
}

// Load status when popup opens
document.addEventListener('DOMContentLoaded', loadStatus);


