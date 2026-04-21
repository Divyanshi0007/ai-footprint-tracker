# 🌿 AI Footprint Tracker

> A free browser extension that tracks your real-time AI environmental and cost footprint across **ChatGPT**, **Claude**, and **Gemini** — all data stays local in your browser.

![Version](https://img.shields.io/badge/version-1.2.0-6ee7b7?style=flat-square)
![Platforms](https://img.shields.io/badge/works%20on-ChatGPT%20%7C%20Claude%20%7C%20Gemini-34d399?style=flat-square)
![Privacy](https://img.shields.io/badge/privacy-100%25%20local-065f46?style=flat-square)

---

## What it tracks

| Metric | Description |
|--------|-------------|
| 📊 **Tokens** | Input + output tokens estimated per message |
| 💰 **Cost** | Estimated USD cost based on public model pricing |
| ⚡ **Energy** | kWh consumed (per IEA 2024 AI energy benchmarks) |
| 🌿 **Carbon** | kg CO₂ emitted (EPA eGRID average grid intensity) |
| 💧 **Water** | mL/L used for data centre cooling (Microsoft/Google sustainability reports) |

All values are **heuristic estimates** — not exact API billing data.

---

## Features

- 🪟 **Always-on floating widget** — sits on the page, no need to open anything
- 🔀 **Draggable** — move it anywhere on screen, position is remembered
- 📊 **Per-platform + total stats** — toggle between "This chat" and "All platforms"
- 🔄 **Live updates** — stats update the moment AI finishes responding
- ⏳ **Animated loader** — spinning circle while the AI is generating
- ❌ **Close/reopen** — × to collapse to a small pill, click pill to reopen
- 🔒 **100% private** — nothing ever leaves your browser

---

## Installation

### Chrome or Edge

> ⚠️ This extension is not yet on the Chrome Web Store, so you load it manually. It takes under 2 minutes.

**Step 1 — Download**

Click the button below to download the ZIP file:

👉 **[Download AI-Footprint-Tracker-v1.2.zip](https://github.com/Divyanshi0007/ai-footprint-tracker/releases/latest/download/AI-Footprint-Tracker-v1.2.zip)**

**Step 2 — Unzip**

Find the downloaded file (usually in your `Downloads` folder) and double-click it to unzip. You'll get a folder called `extension`.

**Step 3 — Open Extensions page**

- **Chrome:** type `chrome://extensions` in the address bar and press Enter
- **Edge:** type `edge://extensions` in the address bar and press Enter

**Step 4 — Enable Developer Mode**

In the top-right corner of the Extensions page, toggle **Developer mode** ON.

![Developer mode toggle is in the top-right corner](https://i.imgur.com/placeholder.png)

**Step 5 — Load the extension**

Click **"Load unpacked"** (top-left), then select the `extension` folder you unzipped in Step 2.

**Step 6 — Done!**

Visit [chatgpt.com](https://chatgpt.com), [claude.ai](https://claude.ai), or [gemini.google.com](https://gemini.google.com) — the 🌿 widget will appear in the bottom-right corner automatically.

---

### Firefox

**Step 1 — Download the ZIP** using the link above and unzip it.

**Step 2 —** Open Firefox and go to `about:debugging#/runtime/this-firefox` in the address bar.

**Step 3 —** Click **"Load Temporary Add-on"**.

**Step 4 —** Navigate into the unzipped `extension` folder and select the `manifest.json` file.

**Step 5 —** Done! Visit ChatGPT, Claude, or Gemini.

> **Note:** Temporary add-ons are removed when Firefox restarts. For a permanent install the extension needs to be signed via [addons.mozilla.org](https://addons.mozilla.org).

---

### Safari (Mac only)

**Step 1 —** Install **Xcode** from the Mac App Store (free).

**Step 2 —** Open Terminal and run:
```bash
xcrun safari-web-extension-converter /path/to/extension
```

**Step 3 —** Open the generated Xcode project, press **Build & Run**.

**Step 4 —** In Safari → **Settings → Extensions** → enable **AI Footprint Tracker**.

---

## How to use

Once installed, just use ChatGPT, Claude, or Gemini as normal.

| Action | Result |
|--------|--------|
| Open any supported AI site | 🌿 widget appears bottom-right |
| Send a message | Widget shows animated spinner while AI responds |
| AI finishes responding | Stats update instantly |
| Drag the header | Move widget anywhere on screen |
| Click **—** | Minimise the stats body, keep header |
| Click **×** | Collapse to a small 🌿 pill |
| Click the pill | Reopen the full widget |
| Toggle "This chat / All platforms" | Switch between current platform and combined total |
| Click extension icon in toolbar | Open full popup dashboard |
| Click **Reset Stats** | Clear all stored data |

---

## Estimation methodology

| Variable | Formula | Source |
|----------|---------|--------|
| Tokens | `characters ÷ 4` | OpenAI tokenizer average for English |
| Energy (ChatGPT) | `0.006 kWh per 1K tokens` | IEA Electricity 2024, Goldman Sachs AI Power Demand 2023 |
| Energy (Claude) | `0.004 kWh per 1K tokens` | Anthropic efficiency benchmarks |
| Energy (Gemini) | `0.003 kWh per 1K tokens` | Google DeepMind figures |
| Carbon | `energy × 0.4 kg CO₂/kWh` | EPA eGRID US grid average 2023 |
| Water | `energy × 1.8 L/kWh` | Microsoft & Google Sustainability Reports 2023; Li et al. "Making AI Less Thirsty" 2023 |

---

## Privacy

- ✅ No account required
- ✅ No data sent to any server
- ✅ Raw message text is **never stored** — only numeric metrics
- ✅ All data lives in `chrome.storage.local` on your device only
- ✅ Uninstalling the extension deletes all data

---

## Supported browsers

| Browser | Status |
|---------|--------|
| Chrome | ✅ Supported |
| Edge | ✅ Supported |
| Firefox | ✅ Supported (temporary install) |
| Safari | ⚙️ Supported via Xcode conversion |
| Brave / Arc | ✅ Works (Chromium-based) |

---

## Supported platforms

| Platform | URL |
|----------|-----|
| ChatGPT | chatgpt.com |
| Claude | claude.ai |
| Gemini | gemini.google.com |

---

## Contributing

Selectors for ChatGPT, Claude, and Gemini may drift when those platforms update their UI. If the widget stops tracking on a platform:

1. Open DevTools on the AI site → Console
2. Run the selector diagnostic from the [troubleshooting guide](extension/INSTALL.md)
3. Open a PR updating `extension/content/adapters/{platform}.js`

---

## License

MIT — free to use, modify, and distribute.

---

<p align="center">Built with 💚 — because AI has a real-world footprint worth knowing about.</p>
