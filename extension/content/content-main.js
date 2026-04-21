'use strict';

(function () {
  const adapter = window.PLATFORM_ADAPTER;
  if (!adapter) { console.warn('[AI Footprint] No adapter.'); return; }

  console.log('[AI Footprint] Loaded on', adapter.platform);

  function emptyStats() {
    return { inputTokens: 0, outputTokens: 0, cost: 0, energy: 0, carbon: 0, water: 0, messageCount: 0 };
  }
  function defaultUsage() {
    return { chatgpt: emptyStats(), claude: emptyStats(), gemini: emptyStats(), total: emptyStats() };
  }

  function setStreaming(active) {
    chrome.storage.local.get('streaming', res => {
      const s = res.streaming || { chatgpt: false, claude: false, gemini: false };
      s[adapter.platform] = active;
      chrome.storage.local.set({ streaming: s });
    });
  }

  function saveMetrics(role, text) {
    const incoming = buildMetrics(adapter.platform, role, text);
    console.log('[AI Footprint]', role, '— tokens:', incoming.inputTokens + incoming.outputTokens);
    chrome.storage.local.get('usage', res => {
      const usage = res.usage || defaultUsage();
      if (!usage[adapter.platform]) usage[adapter.platform] = emptyStats();
      // Ensure older stored records get the new water field
      if (usage[adapter.platform].water == null) usage[adapter.platform].water = 0;
      if (usage.total.water == null) usage.total.water = 0;

      const add = (d, s) => {
        d.inputTokens  += s.inputTokens  || 0;
        d.outputTokens += s.outputTokens || 0;
        d.cost         += s.cost         || 0;
        d.energy       += s.energy       || 0;
        d.carbon       += s.carbon       || 0;
        d.water        += s.water        || 0;
        d.messageCount += s.messageCount || 0;
      };
      add(usage[adapter.platform], incoming);
      add(usage.total, incoming);
      chrome.storage.local.set({ usage });
    });
  }

  const processedElements = new WeakSet();

  function seedExisting() {
    try {
      document.querySelectorAll(adapter.selectors.user).forEach(el => processedElements.add(el));
      document.querySelectorAll(adapter.selectors.assistant).forEach(el => processedElements.add(el));
    } catch (_) {}
  }

  function processUserElement(el) {
    if (processedElements.has(el)) return;
    processedElements.add(el);
    const text = adapter.getMessageText(el);
    if (!text) return;
    saveMetrics('user', text);
  }

  function watchAssistantElement(el) {
    if (processedElements.has(el)) return;
    setStreaming(true);

    const commit = () => {
      if (processedElements.has(el)) return;
      processedElements.add(el);
      sub.disconnect();
      setStreaming(false);
      const text = adapter.getMessageText(el);
      if (text) saveMetrics('assistant', text);
    };

    if (el.hasAttribute('data-is-streaming')) {
      if (el.getAttribute('data-is-streaming') === 'false') {
        var sub = new MutationObserver(() => {});
        setTimeout(commit, 300);
        return;
      }
      var sub = new MutationObserver(() => {
        if (el.getAttribute('data-is-streaming') === 'false') setTimeout(commit, 300);
      });
      sub.observe(el, { attributes: true, attributeFilter: ['data-is-streaming'] });
      return;
    }

    let timer = null;
    var sub = new MutationObserver(() => { clearTimeout(timer); timer = setTimeout(commit, 1500); });
    sub.observe(el, { childList: true, subtree: true, characterData: true });
    setTimeout(commit, 1500);
  }

  function handle(el) {
    if (!el || !el.matches) return;
    try {
      if (el.matches(adapter.selectors.user))      { processUserElement(el);   return; }
      if (el.matches(adapter.selectors.assistant)) { watchAssistantElement(el); }
    } catch (_) {}
  }

  function scanSubtree(root) {
    try {
      root.querySelectorAll(adapter.selectors.user).forEach(handle);
      root.querySelectorAll(adapter.selectors.assistant).forEach(handle);
    } catch (_) {}
  }

  const observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;
        handle(node); scanSubtree(node);
      }
    }
  });

  function start() {
    seedExisting();
    setTimeout(seedExisting, 2000);
    setTimeout(seedExisting, 5000);
    observer.observe(document.body, { childList: true, subtree: true });
    setInterval(() => scanSubtree(document.body), 2000);
    console.log('[AI Footprint] Observer active on', adapter.platform);
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', start)
    : start();
})();
