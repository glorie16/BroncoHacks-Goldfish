chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ timerStart: null });
  });