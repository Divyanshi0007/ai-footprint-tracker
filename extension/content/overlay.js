'use strict';

(function () {
  if (document.getElementById('ai-footprint-host')) return;

  const PLATFORM = (() => {
    const h = location.hostname;
    if (h.includes('chatgpt.com') || h.includes('openai.com')) return 'chatgpt';
    if (h.includes('claude.ai'))     return 'claude';
    if (h.includes('gemini.google')) return 'gemini';
    return null;
  })();
  if (!PLATFORM) return;

  const NAMES = { chatgpt: 'ChatGPT', claude: 'Claude', gemini: 'Gemini' };

  function fmt(n, d) { return (n || 0).toFixed(d); }
  function fmtTokens(n) {
    if (!n) return '—';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
    if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
    return String(Math.round(n));
  }
  // Smart water formatter: mL when < 1L, L when >= 1L
  function fmtWater(litres) {
    if (!litres || litres === 0) return '—';
    if (litres < 1) return (litres * 1000).toFixed(2) + ' mL';
    return litres.toFixed(3) + ' L';
  }

  // ── Host ──────────────────────────────────────────────────────────────────
  const host = document.createElement('div');
  host.id = 'ai-footprint-host';
  host.style.cssText = 'position:fixed!important;z-index:2147483647!important;bottom:16px!important;right:16px!important;';

  const POS_KEY = 'aifp_pos_v2';
  try {
    const p = JSON.parse(localStorage.getItem(POS_KEY));
    if (p && typeof p.left === 'number' && typeof p.top === 'number') {
      host.style.cssText = `position:fixed!important;z-index:2147483647!important;left:${p.left}px!important;top:${p.top}px!important;`;
    }
  } catch (_) {}

  const shadow = host.attachShadow({ mode: 'open' });

  shadow.innerHTML = `
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

.widget{
  width:220px;
  background:rgba(11,17,27,0.96);
  backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);
  border:1px solid #1e293b;border-radius:14px;
  box-shadow:0 14px 44px rgba(0,0,0,0.65),0 0 0 0.5px rgba(255,255,255,0.04);
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
  font-size:12px;color:#e2e8f0;overflow:hidden;user-select:none;
}

/* header */
.hdr{
  display:flex;align-items:center;gap:6px;
  padding:10px 10px 9px 12px;
  background:rgba(15,23,42,0.75);border-bottom:1px solid #1e293b;
  cursor:grab;
}
.hdr:active{cursor:grabbing;}
.logo{font-size:15px;line-height:1;pointer-events:none;}
.title{flex:1;font-size:10px;font-weight:700;letter-spacing:.08em;color:#6ee7b7;text-transform:uppercase;pointer-events:none;}
.btn{
  background:none;border:none;cursor:pointer;color:#475569;line-height:1;
  width:20px;height:20px;display:flex;align-items:center;justify-content:center;
  border-radius:4px;font-size:13px;transition:color .15s,background .15s;padding:0;flex-shrink:0;
}
.btn:hover{color:#e2e8f0;background:#1e293b;}
.btn.xbtn:hover{color:#fca5a5;background:rgba(127,29,29,.3);}

/* streaming row */
.srow{
  display:flex;align-items:center;gap:8px;padding:7px 12px;
  background:#071810;border-bottom:1px solid #064e3b55;
  color:#6ee7b7;font-size:11px;
}
.srow.off{display:none;}
.sp{width:18px;height:18px;flex-shrink:0;}
.cspin{width:18px;height:18px;transform-origin:center;animation:rot 1.6s linear infinite;}
@keyframes rot{to{transform:rotate(360deg);}}
.ct{fill:none;stroke:#064e3b;stroke-width:2.5;}
.cf{fill:none;stroke:#6ee7b7;stroke-width:2.5;stroke-linecap:round;
    stroke-dasharray:44;stroke-dashoffset:44;transform-origin:center;
    animation:arc 1.6s ease-in-out infinite;}
@keyframes arc{0%{stroke-dashoffset:44;opacity:1;}55%{stroke-dashoffset:8;opacity:1;}100%{stroke-dashoffset:44;opacity:.3;}}

/* tab toggle */
.tabs{
  display:flex;background:rgba(15,23,42,.5);
  border-bottom:1px solid #1e293b;
}
.tab{
  flex:1;padding:5px 4px;background:none;border:none;
  border-bottom:2px solid transparent;
  color:#475569;font-size:10px;font-weight:600;letter-spacing:.04em;
  cursor:pointer;transition:color .15s,border-color .15s;font-family:inherit;
}
.tab:hover{color:#94a3b8;}
.tab.on{color:#6ee7b7;border-bottom-color:#6ee7b7;}

/* stats body */
.body{padding:3px 0 2px;}
.body.minimised{display:none;}
.empty{padding:14px 12px;text-align:center;color:#475569;font-size:11px;line-height:1.6;}
.stat{
  display:flex;justify-content:space-between;align-items:center;
  padding:5px 12px;border-bottom:1px solid #0f172a99;
}
.stat:last-child{border-bottom:none;}
.sl{color:#64748b;font-size:11px;display:flex;align-items:center;gap:5px;}
.si{font-size:13px;}
.sv{font-weight:600;font-size:12px;color:#f1f5f9;}

/* footer */
.foot{
  display:flex;justify-content:space-between;align-items:center;
  padding:5px 12px;border-top:1px solid #0f172a;
  font-size:10px;color:#334155;
}
.foot.minimised{display:none;}
.pbadge{color:#34d399;font-weight:600;}

/* pill */
.pill{
  width:40px;height:40px;border-radius:50%;
  background:rgba(11,17,27,.95);
  backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
  border:1px solid #1e293b;
  box-shadow:0 4px 20px rgba(0,0,0,.5),0 0 0 .5px rgba(255,255,255,.04);
  cursor:grab;font-size:19px;
  display:flex;align-items:center;justify-content:center;
  transition:transform .15s,box-shadow .15s;user-select:none;
}
.pill:active{cursor:grabbing;}
.pill:hover{transform:scale(1.1);box-shadow:0 6px 26px rgba(0,0,0,.6);}
.pill.off{display:none;}

@keyframes flashbg{from{background:#064e3b33;}to{background:transparent;}}
.flash{animation:flashbg .55s ease-out;}
</style>

<button class="pill off" id="pill" title="Open AI Footprint Tracker">&#127807;</button>

<div class="widget" id="widget">
  <div class="hdr" id="hdr">
    <span class="logo">&#127807;</span>
    <span class="title">AI Footprint</span>
    <button class="btn"      id="minbtn"   title="Minimise">&#8212;</button>
    <button class="btn xbtn" id="closebtn" title="Close">&#10005;</button>
  </div>

  <div class="srow off" id="srow">
    <div class="sp">
      <svg class="cspin" viewBox="0 0 20 20">
        <circle class="ct" cx="10" cy="10" r="7"/>
        <circle class="cf" cx="10" cy="10" r="7"/>
      </svg>
    </div>
    <span>Generating&hellip;</span>
  </div>

  <div class="tabs">
    <button class="tab on" data-scope="platform" id="tab-platform">This chat</button>
    <button class="tab"    data-scope="total"    id="tab-total">All platforms</button>
  </div>

  <div class="body" id="body">
    <p class="empty" id="emsg">Send a message to start<br>tracking your footprint.</p>
    <div id="srows" style="display:none">
      <div class="stat"><span class="sl"><span class="si">&#128200;</span>Tokens</span>    <span class="sv" id="s-tok">—</span></div>
      <div class="stat"><span class="sl"><span class="si">&#128176;</span>Est. Cost</span>  <span class="sv" id="s-cost">—</span></div>
      <div class="stat"><span class="sl"><span class="si">&#9889;</span>Energy</span>     <span class="sv" id="s-nrg">—</span></div>
      <div class="stat"><span class="sl"><span class="si">&#127807;</span>CO&#x2082;</span>       <span class="sv" id="s-co2">—</span></div>
      <div class="stat"><span class="sl"><span class="si">&#128167;</span>Water</span>      <span class="sv" id="s-h2o">—</span></div>
    </div>
  </div>

  <div class="foot" id="foot">
    <span class="pbadge" id="pbadge"></span>
    <span id="foot-label">This session</span>
  </div>
</div>`;

  // ── Refs ──────────────────────────────────────────────────────────────────
  const pill      = shadow.getElementById('pill');
  const widget    = shadow.getElementById('widget');
  const hdr       = shadow.getElementById('hdr');
  const minBtn    = shadow.getElementById('minbtn');
  const closeBtn  = shadow.getElementById('closebtn');
  const srow      = shadow.getElementById('srow');
  const bodyEl    = shadow.getElementById('body');
  const foot      = shadow.getElementById('foot');
  const emsg      = shadow.getElementById('emsg');
  const srows     = shadow.getElementById('srows');
  const sTok      = shadow.getElementById('s-tok');
  const sCost     = shadow.getElementById('s-cost');
  const sNrg      = shadow.getElementById('s-nrg');
  const sCo2      = shadow.getElementById('s-co2');
  const sH2o      = shadow.getElementById('s-h2o');
  const pbadge    = shadow.getElementById('pbadge');
  const footLabel = shadow.getElementById('foot-label');
  const tabPlatform = shadow.getElementById('tab-platform');
  const tabTotal    = shadow.getElementById('tab-total');

  pbadge.textContent = NAMES[PLATFORM];

  document.body.appendChild(host);

  // ── Tab state ─────────────────────────────────────────────────────────────
  let scope = 'platform'; // 'platform' | 'total'
  let cachedUsage = null;

  tabPlatform.addEventListener('click', () => {
    scope = 'platform';
    tabPlatform.classList.add('on'); tabTotal.classList.remove('on');
    pbadge.textContent  = NAMES[PLATFORM];
    footLabel.textContent = 'This session';
    renderStats(cachedUsage);
  });
  tabTotal.addEventListener('click', () => {
    scope = 'total';
    tabTotal.classList.add('on'); tabPlatform.classList.remove('on');
    pbadge.textContent  = 'All platforms';
    footLabel.textContent = 'Combined total';
    renderStats(cachedUsage);
  });

  // ── Stats rendering ───────────────────────────────────────────────────────
  function renderStats(usage) {
    cachedUsage = usage;
    const key = scope === 'total' ? 'total' : PLATFORM;
    const p = usage && usage[key];
    if (!p || p.messageCount === 0) {
      emsg.style.display = ''; srows.style.display = 'none'; return;
    }
    emsg.style.display = 'none'; srows.style.display = '';
    sTok.textContent  = fmtTokens((p.inputTokens || 0) + (p.outputTokens || 0));
    sCost.textContent = '$' + fmt(p.cost, 4);
    sNrg.textContent  = fmt(p.energy, 5) + ' kWh';
    sCo2.textContent  = fmt(p.carbon, 6) + ' kg';
    sH2o.textContent  = fmtWater(p.water);
    bodyEl.style.animation = 'none'; void bodyEl.offsetWidth;
    bodyEl.style.animation = 'flashbg .55s ease-out';
  }

  function renderStreaming(streaming) {
    const active = !!(streaming && streaming[PLATFORM]);
    if (!minimised) srow.classList.toggle('off', !active);
  }

  // ── Dragging ──────────────────────────────────────────────────────────────
  function makeDraggable(handle) {
    let dragging = false, ox = 0, oy = 0, moved = false;

    handle.addEventListener('mousedown', e => {
      if (e.target === closeBtn || e.target === minBtn || e.target === tabPlatform || e.target === tabTotal) return;
      dragging = true; moved = false;
      const r = host.getBoundingClientRect();
      ox = e.clientX - r.left; oy = e.clientY - r.top;
      host.style.cssText = `position:fixed!important;z-index:2147483647!important;left:${r.left}px!important;top:${r.top}px!important;`;
      e.preventDefault();
    });

    document.addEventListener('mousemove', e => {
      if (!dragging) return;
      moved = true;
      const x = Math.max(4, Math.min(window.innerWidth  - host.offsetWidth  - 4, e.clientX - ox));
      const y = Math.max(4, Math.min(window.innerHeight - host.offsetHeight - 4, e.clientY - oy));
      host.style.left = x + 'px'; host.style.top = y + 'px';
    });

    document.addEventListener('mouseup', () => {
      if (!dragging) return; dragging = false;
      if (moved) {
        try { localStorage.setItem(POS_KEY, JSON.stringify({ left: Math.round(parseFloat(host.style.left)), top: Math.round(parseFloat(host.style.top)) })); } catch (_) {}
      } else if (handle === pill) {
        applyOpenState(true);
        chrome.storage.local.set({ overlayOpen: true });
      }
    });
  }

  makeDraggable(hdr);
  makeDraggable(pill);

  // ── Open / close ──────────────────────────────────────────────────────────
  function applyOpenState(open) {
    widget.style.display = open ? '' : 'none';
    pill.classList.toggle('off', open);
  }

  chrome.storage.local.get('overlayOpen', res => applyOpenState(res.overlayOpen !== false));

  closeBtn.addEventListener('click', e => {
    e.stopPropagation();
    applyOpenState(false);
    chrome.storage.local.set({ overlayOpen: false });
  });

  // ── Minimise ──────────────────────────────────────────────────────────────
  let minimised = false;
  minBtn.addEventListener('click', e => {
    e.stopPropagation(); minimised = !minimised;
    bodyEl.classList.toggle('minimised', minimised);
    foot.classList.toggle('minimised', minimised);
    if (minimised) srow.classList.add('off');
    minBtn.innerHTML = minimised ? '&#9650;' : '&#8212;';
  });

  // ── Live updates ──────────────────────────────────────────────────────────
  chrome.storage.local.get(['usage', 'streaming'], res => {
    renderStats(res.usage);
    renderStreaming(res.streaming);
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if (changes.usage)     renderStats(changes.usage.newValue);
    if (changes.streaming) renderStreaming(changes.streaming.newValue);
  });

})();
