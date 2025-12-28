chrome.runtime.onInstalled.addListener(() => {
  console.log('OtyChat Display Overlay installed');
  chrome.storage.sync.get(['serverUrl'], (result) => {
    if (!result.serverUrl) {
      chrome.storage.sync.set({ serverUrl: 'http://localhost:3000' });
    }
  });
});
