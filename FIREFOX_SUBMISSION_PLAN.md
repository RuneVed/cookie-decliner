# Firefox AMO publish-readiness plan

## Context

Cookie Decliner is a working Manifest V3 extension on branch `publish-firefox`. Goal: make it submission-ready for **addons.mozilla.org (AMO) — listed channel** so Mozilla reviewers approve it on first pass. Three Firefox docs reviewed (submitting-an-add-on, add-on-policies, distribution-agreement); this plan addresses every applicable requirement.

The code is already AMO-friendly: no remote code, no `eval`, no network requests, no storage APIs, no obfuscation, esbuild bundle is unminified and reviewable, source is on GitHub. What's missing is metadata, a privacy policy, packaging, and listing copy.

### Important correction up-front
**MV3 is fully accepted on AMO** (since Firefox 109, Jan 2023). No downgrade to MV2 is needed. The existing `manifest_version: 3` stays.

---

## Pre-flight notes (decisions baked into this plan)

- **Channel:** Listed on AMO (not self-distribution). Mozilla auto-assigns the extension ID, so `browser_specific_settings.gecko.id` is optional.
- **Icons:** Keep SVG. AMO accepts SVG; no PNG conversion needed for Firefox-only submission. (Chrome will need PNGs, but that's a separate plan.)
- **Privacy policy hosting:** GitHub Pages (consistent with the existing `STORE_SUBMISSION.md` Chrome plan, and gives a stable public URL).
- **Source code submission:** AMO requires source upload when build steps are present. The esbuild bundle qualifies even though it's unminified, so we will provide source instructions and a source archive.

---

## File-by-file changes

### 1. `manifest.json` — Firefox-required additions and clean-up
- Add `browser_specific_settings.gecko` with `strict_min_version: "109.0"` (first Firefox version with MV3 content-script support; this extension has no service worker, so 109 is safe).
- Remove `"activeTab"` from `permissions`. It's redundant given `host_permissions: ["http://*/*", "https://*/*"]` and triggers an AMO linter warning.
- Remove `minimum_chrome_version: "88"` from the Firefox bundle, OR leave it (Firefox ignores Chrome-only fields). Cleaner: keep one manifest, leave it — it's harmless on Firefox.
- Optionally add `"author": "RuneVed"` (top-level field is valid in MV3).

After change, `permissions` becomes `[]` (empty array) and a `browser_specific_settings` block is added.

### 2. `package.json` — fix license mismatch and fill metadata
- `"license": "ISC"` → `"license": "MIT"` (LICENSE file is MIT — the mismatch will be noticed by reviewers and is a Distribution Agreement honesty issue).
- Fill `description`, `author`, `repository`, `homepage`, `keywords` (cookie, consent, privacy, gdpr, didomi, tcf).
- Add new scripts (see §5 and §7 below).

### 3. New: `PRIVACY.md` (and rendered `privacy-policy.html`)
Content (short, AMO accepts plain English):
- Extension name: Cookie Decliner
- Developer contact: runevu@proton.me
- Data collected: **none**
- Data transmitted to third parties: **none**
- Permissions: requests `host_permissions` for all HTTP/HTTPS sites solely to read and click cookie-consent dialog elements on the active page; nothing leaves the browser
- Network requests: none
- Storage: none (no `chrome.storage`, `localStorage`, cookies)
- Effective date: <YYYY-MM-DD>
- Changes policy: any future change to data handling will trigger a new extension version with disclosure

Also create `privacy-policy.html` at repo root (rendered version) for GitHub Pages serving. Mozilla accepts a URL pointing at any public HTML — Markdown rendered by GitHub also works, but `.html` is more reliable.

### 4. New: `docs/store-listing.md`
Pre-write every field AMO will ask for, so submission is copy-paste:
- **Add-on name:** `Cookie Decliner` (do **not** use "Firefox" in the name — Mozilla trademark policy only allows the form `"X for Firefox"`, and using it suggests Mozilla endorsement).
- **Summary** (≤132 chars): one sentence describing what it does.
- **Description** (~500 words): what it does, supported frameworks (SourcePoint, TCF v2.0, Cookiebot, OneTrust, Usercentrics + Apollo, Complianz, Didomi single + two-step, MaxGaming checkbox), supported languages (Norwegian, English, German, French), explicit "no data collection / no network requests / open source" statement, link to GitHub.
- **Categories:** Privacy & Security (primary), Productivity (secondary).
- **Tags:** cookies, consent, privacy, gdpr, didomi, tcf, onetrust, cookiebot.
- **Support email:** runevu@proton.me. **Support site:** GitHub repo URL.
- **License:** MIT.
- **Privacy policy URL:** GitHub Pages URL.
- **Notes for reviewers:** brief explanation of why `host_permissions: ["http://*/*", "https://*/*"]` is required (cookie banners can appear on any domain), confirmation that no data leaves the browser, build instructions (`npm install && npm run build`), and pointer to the `src/` directory in the source archive.
- **Per-permission justification** (for reviewer notes): one paragraph each for `host_permissions http://*/*` and `host_permissions https://*/*`.

### 5. New: `scripts/package.js` + `npm run package`
Build a submission `.zip` deterministically:
1. Run `npm run build` (lint + esbuild).
2. Verify `dist/content-script.js` exists.
3. Zip exactly these files into `release/cookie-decliner-firefox-1.0.0.zip`:
   - `manifest.json`
   - `popup.html`
   - `dist/content-script.js`
   - `icons/icon16.svg`, `icon32.svg`, `icon48.svg`, `icon128.svg`
4. Print final zip path and size.

Use the `archiver` package (single dev dep, cross-platform, no shell-script differences between Windows/POSIX). Add `release/` to `.gitignore`.

### 6. New: `scripts/package-source.js` + `npm run package:source`
AMO source-code submission: zip everything needed to reproduce the build:
- `src/`, `tests/`, `icons/`, `popup.html`
- `manifest.json`, `package.json`, `package-lock.json`, `tsconfig.json`, `eslint.config.js`, `jest.config.js`, `playwright.config.ts`
- `scripts/`
- `README.md`, `LICENSE`, `PRIVACY.md`, `CHANGELOG.md`
- Exclude: `node_modules/`, `dist/`, `coverage/`, `.git/`, `release/`, `*.log`.

Output: `release/cookie-decliner-source-1.0.0.zip`.

### 7. New: `CHANGELOG.md`
Single entry for v1.0.0 listing initial supported frameworks and sites. Required for AMO release notes.

### 8. README.md — small additions
- Add a **Permissions** section explaining each `host_permissions` entry and why it is necessary (reviewers often check the README before approving broad host access).
- Add an **Installation from AMO** section with a placeholder link (filled in after first publish).
- Privacy section already says "no data collection / no network requests" — keep as-is, it satisfies AMO.

### 9. STORE_SUBMISSION.md — rename and re-scope
Currently drafted for Chrome only. Rename to `docs/CHROME_SUBMISSION.md` (keeps the Chrome plan intact for later) and create a sibling `docs/FIREFOX_SUBMISSION.md` summarising the steps below. Both can share `docs/store-listing.md`.

### 10. GitHub Pages enablement (manual, once)
Repo → Settings → Pages → "Deploy from a branch" → `main` / `(root)`. After ~1 minute, `privacy-policy.html` is live at `https://<github-username>.github.io/cookie-decliner/privacy-policy.html`. Plug that URL into `docs/store-listing.md`.

---

## Files to create / modify (summary table)

| File | Action |
|------|--------|
| `manifest.json` | Modify: add `browser_specific_settings.gecko`, remove `activeTab` |
| `package.json` | Modify: fix license, fill metadata, add `package` + `package:source` scripts, add `archiver` dev dep |
| `PRIVACY.md` | Create |
| `privacy-policy.html` | Create (for GitHub Pages) |
| `CHANGELOG.md` | Create |
| `docs/store-listing.md` | Create — all AMO listing fields pre-written |
| `docs/FIREFOX_SUBMISSION.md` | Create — step-by-step submission instructions |
| `docs/CHROME_SUBMISSION.md` | Rename from existing `STORE_SUBMISSION.md` |
| `scripts/package.js` | Create — builds submission ZIP |
| `scripts/package-source.js` | Create — builds source ZIP for AMO source review |
| `README.md` | Modify: add Permissions section + AMO install placeholder |
| `.gitignore` | Add `release/` |
| `STORE_SUBMISSION.md` | Delete (superseded by the two `docs/*_SUBMISSION.md` files) |

---

## Manual steps the user does (cannot be automated)

1. **Mozilla developer account** — sign up at addons.mozilla.org, accept the [Firefox Add-on Distribution Agreement](https://extensionworkshop.com/documentation/publish/firefox-add-on-distribution-agreement/). Free, no fee.
2. **Enable GitHub Pages** for this repo (one click in Settings → Pages).
3. **Capture screenshots** — at least one, ideally three. 1280×800 PNG. Show the extension declining a real banner on one of the supported sites (e.g. norskkalender.no, cdon.com, a Cookiebot site). Save to `store-assets/screenshots/` (gitignored or committed — your call).
4. **Submit on AMO**:
   - "Submit a New Add-on" → "On this site" (listed).
   - Upload `release/cookie-decliner-firefox-1.0.0.zip`.
   - Wait for auto-validation; address warnings.
   - Choose "Yes" when asked whether the add-on uses any custom build steps → upload `release/cookie-decliner-source-1.0.0.zip`.
   - Fill listing fields by pasting from `docs/store-listing.md`.
   - Upload screenshots.
   - Submit for review.

---

## Verification

Before submission:
1. `npm run build` — lints clean, produces `dist/content-script.js`.
2. `npm run package` — produces `release/cookie-decliner-firefox-1.0.0.zip`. Confirm contents with `unzip -l`.
3. `npm run package:source` — produces source ZIP. Spot-check it contains `src/`, `package-lock.json`, no `node_modules`.
4. `npx web-ext lint --source-dir <unpacked-zip-dir>` — official Mozilla linter; must report zero errors. (Add `web-ext` as dev dep, or run via `npx`.)
5. Load the submission ZIP in Firefox: `about:debugging` → This Firefox → Load Temporary Add-on → pick `manifest.json` from the unpacked zip. Verify the popup opens, then visit `https://norskkalender.no` and confirm the Didomi banner is auto-declined.
6. `npm run test:all` — unit + E2E still green.
7. After GitHub Pages is live: `curl -fsSL https://<username>.github.io/cookie-decliner/privacy-policy.html` returns 200.
8. Cross-check `docs/store-listing.md` against AMO's submission form one section at a time before pasting.

---

## Critical files for orientation

- `manifest.json` — the single most important file for AMO (validation runs against it).
- `src/content-script.ts`, `src/api-handler.ts`, `src/dom-utils.ts` — what the reviewer will read.
- `dist/content-script.js` — the bundled artifact in the submission ZIP. Already unminified and reviewable.
- `docs/store-listing.md` (new) — single source of truth for everything pasted into AMO's form.
- `PRIVACY.md` / `privacy-policy.html` (new) — AMO requires a privacy policy URL for any extension with broad host permissions, even when no data is collected.
