'use strict';

// Gemini adapter — gemini.google.com
// Gemini uses custom web components; tag names have been stable.
window.PLATFORM_ADAPTER = {
  platform: 'gemini',

  selectors: {
    user:      'user-query, [data-testid="user-query"], .user-query-container',
    assistant: 'model-response, [data-testid="model-response"], .model-response-text'
  },

  getMessageText(element) {
    const inner =
      element.querySelector('.query-text')           ||
      element.querySelector('[class*="query-text"]') ||
      element.querySelector('.response-content')     ||
      element.querySelector('[class*="response"]')   ||
      element.querySelector('.markdown')             ||
      element;
    return (inner.innerText || inner.textContent || '').trim();
  }
};
