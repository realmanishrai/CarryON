console.log('[CarryON AI] Background service worker running');

// Set side panel to automatically open when user clicks the extension toolbar icon
chrome.runtime.onInstalled.addListener(() => {
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
      .catch((e) => console.warn('Could not set sidePanel behavior:', e));
  }
});

// Relay messages if needed between tabs and extension sidepanel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Let listeners handle specific actions
  return false;
});
