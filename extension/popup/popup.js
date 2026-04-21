'use strict';

// ─── Formatters ───────────────────────────────────────────────────────────────
function fmtWater(litres) {
  if (!litres || litres === 0) return '—';
  if (litres < 1) return (litres * 1000).toFixed(2) + ' mL';
  return litres.toFixed(3) + ' L';
}

function fmtTokens(n) {
  if (!n) return '0';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
  return String(Math.round(n));
}

// ─── Render stats for one platform ───────────────────────────────────────────
function renderStats(record) {
  if (!record || record.messageCount === 0) {
    return `<p class="empty">No activity recorded yet.<br>
      Open ChatGPT, Claude, or Gemini and send a message.</p>`;
  }
  const total = record.inputTokens + record.outputTokens;
  return [
    { icon: '&#128200;', label: 'Messages', value: record.messageCount.toLocaleString(), sub: null },
    { icon: '&#128295;', label: 'Tokens',   value: fmtTokens(total),
      sub: `in: ${fmtTokens(record.inputTokens)} &nbsp;|&nbsp; out: ${fmtTokens(record.outputTokens)}` },
    { icon: '&#128176;', label: 'Est. Cost', value: '$' + record.cost.toFixed(4),
      sub: 'USD — heuristic only' },
    { icon: '&#9889;',   label: 'Energy',   value: record.energy.toFixed(5) + ' kWh', sub: null },
    { icon: '&#127807;', label: 'Carbon',   value: record.carbon.toFixed(6) + ' kg CO&#x2082;', sub: null },
    { icon: '&#128167;', label: 'Water',    value: fmtWater(record.water || 0), sub: 'data centre cooling estimate' }
  ].map(r => `
    <div class="stat-row">
      <div class="stat-label"><span class="stat-icon">${r.icon}</span>${r.label}</div>
      <div class="stat-right">
        <div class="stat-value">${r.value}</div>
        ${r.sub ? `<div class="stat-sub">${r.sub}</div>` : ''}
      </div>
    </div>`).join('');
}

// ─── State ────────────────────────────────────────────────────────────────────
let currentTab  = 'total';
let usageData   = null;
let streamState = { chatgpt: false, claude: false, gemini: false };

const statsEl        = document.getElementById('stats');
const streamIndicator = document.getElementById('stream-indicator');
const streamPlatform  = document.getElementById('stream-platform');
const NAMES = { chatgpt: 'ChatGPT', claude: 'Claude', gemini: 'Gemini' };

// ─── Streaming indicator ──────────────────────────────────────────────────────
function updateStreamIndicator() {
  const active = Object.entries(streamState).filter(([, v]) => v).map(([k]) => NAMES[k]);
  if (active.length === 0) {
    streamIndicator.hidden = true;
  } else {
    streamIndicator.hidden = false;
    streamPlatform.textContent = 'on ' + active.join(', ');
  }
}

// ─── Stats panel ─────────────────────────────────────────────────────────────
function updatePanel() {
  if (!usageData) { statsEl.innerHTML = '<p class="loading">Loading…</p>'; return; }
  statsEl.innerHTML = renderStats(usageData[currentTab]);
}

function flashPanel() {
  statsEl.classList.remove('flash');
  void statsEl.offsetWidth;
  statsEl.classList.add('flash');
  statsEl.addEventListener('animationend', () => statsEl.classList.remove('flash'), { once: true });
}

// ─── Reactive storage listener (updates popup live while it's open) ───────────
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  if (changes.streaming) {
    streamState = changes.streaming.newValue || streamState;
    updateStreamIndicator();
  }
  if (changes.usage) {
    usageData = changes.usage.newValue;
    updatePanel();
    flashPanel();
  }
});

// ─── Tab switching ────────────────────────────────────────────────────────────
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    currentTab = btn.dataset.tab;
    updatePanel();
  });
});

// ─── Reset ────────────────────────────────────────────────────────────────────
document.getElementById('reset-btn').addEventListener('click', () => {
  if (!confirm('Reset all tracked metrics? This cannot be undone.')) return;
  chrome.runtime.sendMessage({ type: 'RESET_STATS' }, () => {
    // Re-read storage after reset
    chrome.storage.local.get(['usage', 'streaming'], res => {
      usageData   = res.usage     || null;
      streamState = res.streaming || { chatgpt: false, claude: false, gemini: false };
      updateStreamIndicator();
      updatePanel();
    });
  });
});

// ─── Initial load — read directly from storage (no service worker needed) ────
chrome.storage.local.get(['usage', 'streaming'], res => {
  usageData   = res.usage     || null;
  streamState = res.streaming || { chatgpt: false, claude: false, gemini: false };
  updateStreamIndicator();
  updatePanel();
});
