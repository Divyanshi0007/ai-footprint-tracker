'use strict';

// ChatGPT adapter — chatgpt.com + chat.openai.com
// data-message-author-role has been stable since 2023.
window.PLATFORM_ADAPTER = {
  platform: 'chatgpt',

  selectors: {
    user:      '[data-message-author-role="user"]',
    assistant: '[data-message-author-role="assistant"]'
  },

  getMessageText(element) {
    const inner =
      element.querySelector('.markdown')            ||
      element.querySelector('[class*="markdown"]')  ||
      element.querySelector('.whitespace-pre-wrap') ||
      element.querySelector('[class*="prose"]')     ||
      element;
    return (inner.innerText || inner.textContent || '').trim();
  }
};
