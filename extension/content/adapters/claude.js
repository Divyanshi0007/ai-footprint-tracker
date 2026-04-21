'use strict';

// Claude adapter — claude.ai
// Selectors confirmed via live DOM inspection (April 2026)
window.PLATFORM_ADAPTER = {
  platform: 'claude',

  selectors: {
    user:      '[data-testid="user-message"]',
    assistant: '[data-is-streaming]'          // present on every Claude response turn
  },

  getMessageText(element) {
    // Response text lives in a font-claude-response div inside the turn container
    const inner =
      element.querySelector('[class*="font-claude-response"]') ||
      element.querySelector('[class*="font-claude"]')          ||
      element.querySelector('[class*="prose"]')                ||
      element;
    return (inner.innerText || inner.textContent || '').trim();
  }
};
