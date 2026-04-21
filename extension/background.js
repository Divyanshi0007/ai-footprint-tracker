'use strict';

function emptyStats() {
  return { inputTokens: 0, outputTokens: 0, cost: 0, energy: 0, carbon: 0, water: 0, messageCount: 0 };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'RESET_STATS') {
    chrome.storage.local.set({
      usage: {
        chatgpt: emptyStats(), claude: emptyStats(),
        gemini:  emptyStats(), total:  emptyStats()
      },
      streaming: { chatgpt: false, claude: false, gemini: false }
    }, () => sendResponse({ ok: true }));
    return true;
  }
});
