chrome.action.onClicked.addListener(({ windowId }) => {
  void chrome.tabs.create({ windowId, url: chrome.runtime.getURL('index.html') })
})
