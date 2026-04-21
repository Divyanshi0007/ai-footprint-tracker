# AI Footprint Tracker — Installation Guide

Track estimated tokens, cost, energy & CO₂ across ChatGPT, Claude, and Gemini.
All data stays 100% local in your browser.

---

## Option A — Chrome / Edge (Manual install)

1. **Download** the ZIP from the releases page and unzip it.
2. Open **chrome://extensions** (Chrome) or **edge://extensions** (Edge).
3. Toggle **Developer mode** ON (top-right corner).
4. Click **Load unpacked** → select the unzipped `extension/` folder.
5. Done! Visit ChatGPT, Claude, or Gemini — the widget appears automatically.

## Option B — Firefox (Manual install)

1. Open **about:debugging#/runtime/this-firefox**
2. Click **Load Temporary Add-on**
3. Select the `manifest.json` file inside the `extension/` folder.
> Note: Temporary add-ons are removed when Firefox restarts.
> For a permanent install, the extension needs to be signed by Mozilla (free).

## Option C — Safari (Mac only)

1. Install Xcode from the Mac App Store (free).
2. Run in Terminal:
   ```
   xcrun safari-web-extension-converter /path/to/extension
   ```
3. Open the generated Xcode project → Build & Run.
4. In Safari → Settings → Extensions → enable AI Footprint Tracker.

---

## How to use

- The green 🌿 widget appears in the bottom-right corner of ChatGPT, Claude, and Gemini.
- It shows live token, cost, energy, and CO₂ estimates for your session.
- **Drag** it anywhere on screen.
- Click **—** to minimise it.
- Click the extension icon in the toolbar for a full breakdown by platform.

---

## Privacy

- Zero data leaves your browser — everything is stored locally.
- No account, no login, no analytics.
- All values are **heuristic estimates**, not exact API billing data.

---

## Uninstall

Chrome/Edge: chrome://extensions → Remove  
Firefox: about:addons → Remove  
Safari: Safari Settings → Extensions → uncheck/remove
