# Chrome Web Store Submission Plan

## Context

Cookie Decliner is a complete, working Manifest V3 extension. The code is production-ready (zero lint warnings, 126 passing tests, strict TypeScript). What's missing is everything *around* the code: PNG icons (Chrome Web Store rejects SVGs), a hosted privacy policy (required for any extension with broad host permissions), store listing copy, and a distributable ZIP. This plan prepares all of that for submission.

---

## Steps

### 1. Add `sharp` dev dependency and icon conversion script

Install `sharp` as a dev dependency, then create `scripts/convert-icons.js` that reads all four SVGs from `icons/` and writes PNG equivalents to the same folder.

```
npm install --save-dev sharp
```

Script: `scripts/convert-icons.js`
- Input: `icons/icon16.svg`, `icon32.svg`, `icon48.svg`, `icon128.svg`
- Output: `icons/icon16.png`, `icon32.png`, `icon48.png`, `icon128.png`
- Add `"icons": "node scripts/convert-icons.js"` to `package.json` scripts

### 2. Update `manifest.json`

**File:** `manifest.json`

Changes:
- Change all four `icons` entries from `.svg` → `.png`
- Remove `"activeTab"` from `permissions` — it is redundant when `host_permissions` already covers all HTTP/HTTPS URLs

### 3. Create privacy policy page

**File:** `privacy-policy.html` (project root — will be served via GitHub Pages)

Content must cover:
- Extension name and developer contact (runevu@proton.me)
- What data is collected: **none**
- No data is sold, shared, or transmitted to third parties
- The extension only reads and modifies DOM on the active page to dismiss cookie banners
- Effective date

URL after GitHub Pages is enabled: `https://[username].github.io/cookie-decliner/privacy-policy.html`

### 4. Enable GitHub Pages (manual step)

In the GitHub repository settings → Pages → Source: `Deploy from branch` → Branch: `main` → Folder: `/ (root)`.

This makes `privacy-policy.html` reachable at the public URL needed for store submission.

### 5. Create store listing document

**File:** `docs/store-listing.md`

Pre-write the copy needed during Chrome Web Store submission:

- **Short description** (≤132 chars): `Automatically declines cookie consent popups on every website. No clicks needed — Cookie Decliner handles it silently.`
- **Detailed description** (~500 words): covers what the extension does, supported frameworks (OneTrust, Cookiebot, Didomi, TCF, SourcePoint, Usercentrics, Complianz, MaxGaming), why broad host permissions are needed, and the privacy/no-data-collection guarantee
- **Category:** `Productivity`
- **Language:** English
- **Permissions justification** (for reviewer): explanation of why `host_permissions: ["https://*/*"]` is needed — cookie banners appear on any site, so the content script must run everywhere

### 6. Add `package` script to create submission ZIP

**File:** `package.json` — add a `"package"` script

The script (inline Bash or a small Node script) should:
1. Run `npm run build` first
2. Run `node scripts/convert-icons.js`
3. Zip only the distributable files into `cookie-decliner.zip`:
   - `manifest.json`
   - `popup.html`
   - `dist/content-script.js`
   - `icons/icon16.png`
   - `icons/icon32.png`
   - `icons/icon48.png`
   - `icons/icon128.png`

Use the `archiver` npm package (add as dev dependency) or a cross-platform Node.js zip script.

---

## Files to Create/Modify

| File | Change |
|------|--------|
| `manifest.json` | PNG icon refs, remove `activeTab` |
| `package.json` | Add `sharp`, `archiver` dev deps; add `icons` and `package` scripts |
| `scripts/convert-icons.js` | New — SVG→PNG conversion script |
| `privacy-policy.html` | New — hosted privacy policy page |
| `docs/store-listing.md` | New — pre-written store copy |

---

## Manual Steps After Code Changes

These cannot be automated and must be done by the developer:

1. **Register developer account** — [https://chrome.google.com/webstore/devconsole](https://chrome.google.com/webstore/devconsole) — one-time $5 fee, requires 2-step verification on your Google account
2. **Enable GitHub Pages** — Repository Settings → Pages → main branch / root
3. **Take screenshots** — 1280×800 PNG showing the extension declining a real cookie banner (e.g. a Norwegian site from the test suite)
4. **Submit** — Upload `cookie-decliner.zip` to the developer dashboard, fill in listing fields from `docs/store-listing.md`, enter privacy policy URL, submit for review (typically 1–3 business days)

---

## Verification

```bash
# 1. Convert icons
node scripts/convert-icons.js
# Verify: icons/icon16.png, icon32.png, icon48.png, icon128.png all exist

# 2. Build and package
npm run package
# Verify: cookie-decliner.zip created, contains correct 7 files only

# 3. Load unpacked in Chrome to confirm PNG icons render correctly
# chrome://extensions → Load unpacked → select project root

# 4. Confirm privacy policy is reachable after GitHub Pages is enabled
curl https://[username].github.io/cookie-decliner/privacy-policy.html
```
