# Publish Cookie Decliner to Chrome Web Store

> Note: user memory says repo plans go in project root. System reminder restricts plan-mode edits to this file only. After approval, copy this to `cookie-decliner/CHROME_PUBLISH_PLAN.md` (or merge into `docs/CHROME_SUBMISSION.md`).

## Context

Extension is feature-complete at v1.1.0. Firefox publish flow exists (`scripts/package.js`, 2 prior Firefox releases per git log). Chrome Web Store needs PNG icons (rejects SVG), a hosted privacy policy, store listing copy, and a Chrome-specific ZIP. Most assets already drafted in repo but not wired up: `privacy-policy.html` and `docs/store-listing.md` exist; `docs/CHROME_SUBMISSION.md` outlines steps but none of the build wiring has been executed. This plan finishes the unfinished steps and ships v1.1.0 to Chrome via manual upload (matching the Firefox cadence).

## Current state vs `docs/CHROME_SUBMISSION.md`

| Step | Status |
|------|--------|
| `sharp` dep + `scripts/convert-icons.js` | ❌ not done |
| `manifest.json` icons → PNG, remove `activeTab` | ❌ icons still `.svg`; `activeTab` already absent (perms array empty) |
| `privacy-policy.html` | ✅ exists, 118 lines |
| GitHub Pages enabled | ❓ manual — verify reachable URL |
| `docs/store-listing.md` | ✅ exists, 198 lines — review only |
| Chrome `package` script | ❌ current `scripts/package.js` outputs `cookie-decliner-firefox-${version}.zip` with `.svg` icons |
| Dev account + submission | ❌ manual |

## Files to modify/create

| File | Change |
|------|--------|
| `package.json` | Add `sharp` devDep; add `"icons": "node scripts/convert-icons.js"` and `"package:chrome": "node scripts/package-chrome.js"` scripts |
| `scripts/convert-icons.js` | New — SVG→PNG for 16/32/48/128 using `sharp` |
| `scripts/package-chrome.js` | New — clone of `package.js` but uses `.png` icons, outputs `release/cookie-decliner-chrome-${version}.zip`. Pre-step: run `npm run icons` if any PNG missing |
| `manifest.json` | Change `icons` block from `.svg` to `.png` (lines 42–47). Keep SVGs in repo for Firefox compatibility — manifest now references PNG; Firefox accepts PNG too, so `scripts/package.js` (Firefox) can also be flipped to PNG for consistency |
| `icons/icon{16,32,48,128}.png` | Generated artifacts. Add to `.gitignore` OR commit — see Decision below |

### Decision: commit PNG icons or generate at build?

Recommend **commit PNGs** to repo. Reasoning: icons rarely change, avoids needing `sharp` to be installable in every clone, keeps `npm run package:chrome` zero-prereq. The generation script stays in repo for when SVGs are updated.

## Steps (ordered)

1. **Add icon conversion**
   - `npm install --save-dev sharp`
   - Write `scripts/convert-icons.js` — reads four SVGs in `icons/`, writes PNGs at native sizes (16, 32, 48, 128).
   - Run `npm run icons` once, commit the 4 PNG files.

2. **Switch manifest to PNG**
   - Edit `manifest.json` lines 42–47: `.svg` → `.png`.
   - Verify load via `chrome://extensions` → Load unpacked → action icon renders correctly.

3. **Chrome ZIP script**
   - Write `scripts/package-chrome.js` — same shape as `scripts/package.js` (uses `archiver`, validates files exist, writes to `release/`). Include: `manifest.json`, `popup.html`, `dist/content-script.js`, `icons/icon{16,32,48,128}.png`.
   - Add `"package:chrome"` to `package.json` scripts.
   - Decide on Firefox script: either flip it to PNG too, or keep both icon formats in repo. Recommend flipping (simpler — single manifest, both stores accept PNG).

4. **Verify store assets**
   - Re-read `docs/store-listing.md` — confirm short description ≤132 chars, detailed description matches feature set in `README.md` (9+ frameworks, languages: Norwegian/English/German/French).
   - Confirm `privacy-policy.html` "Effective date" still accurate and developer email is `runevu@proton.me`.

5. **GitHub Pages (manual)**
   - Repo Settings → Pages → Source: `main` branch, `/ (root)`.
   - Verify `https://runeved.github.io/cookie-decliner/privacy-policy.html` returns 200. Capture URL for submission form.

6. **Screenshots (manual)**
   - 1280×800 PNG. Take 2–3: before/after on a Norwegian site (e.g. `norskkalender.no` — already used in E2E suite). Existing screenshots in repo root are 215523 timestamped but unknown dimensions — likely need re-capture at exact 1280×800.

7. **Chrome Web Store developer account (manual, one-time, $5)**
   - Register at `https://chrome.google.com/webstore/devconsole`.
   - Enable 2FA on Google account first (required).

8. **Build, package, submit**
   - `npm run build && npm run package:chrome` → produces `release/cookie-decliner-chrome-1.1.0.zip`.
   - Upload ZIP to dev console. Paste store listing copy from `docs/store-listing.md`. Paste privacy policy URL. Justify `host_permissions` in reviewer notes (text already prepared in `store-listing.md` per Step 5 of `docs/CHROME_SUBMISSION.md`).
   - Submit. Review typically 1–3 business days.

## Critical files for orientation

- `manifest.json:42-47` — icon refs to flip
- `scripts/package.js` — template for Chrome variant
- `docs/CHROME_SUBMISSION.md` — original detailed plan (reference)
- `docs/store-listing.md` — submission copy
- `privacy-policy.html` — hosted policy source

## Verification

```powershell
# 1. Generate PNGs
npm install --save-dev sharp
npm run icons
# Expect: icons/icon16.png, icon32.png, icon48.png, icon128.png exist

# 2. Build + Chrome ZIP
npm run build
npm run package:chrome
# Expect: release/cookie-decliner-chrome-1.1.0.zip
# Verify contents (7 files only, no source/, no tests/, no node_modules/):
#   manifest.json, popup.html, dist/content-script.js, icons/icon{16,32,48,128}.png

# 3. Load unpacked in Chrome
# chrome://extensions → Developer mode → Load unpacked → project root
# Visit a Norwegian news site, confirm cookie banner declined automatically.

# 4. Verify privacy policy public URL after GitHub Pages enabled
curl https://runeved.github.io/cookie-decliner/privacy-policy.html
# Expect: 200 OK, HTML body
```

## Out of scope

- GitHub Actions CI publish — manual upload for v1.1.0 per user decision. Can be added later via `chrome-webstore-upload-cli` after first successful manual submit.
- Bumping version. Stay on `1.1.0` for first Chrome submission.
