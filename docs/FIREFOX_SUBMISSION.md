# Firefox AMO submission — step by step

Companion to [`store-listing.md`](./store-listing.md). Run through this
file in order on submission day.

## 0. Prerequisites (one-time)

1. Mozilla developer account at
   [addons.mozilla.org](https://addons.mozilla.org/en-US/developers/).
   Free, no fee. Accept the
   [Firefox Add-on Distribution Agreement](https://extensionworkshop.com/documentation/publish/firefox-add-on-distribution-agreement/).
2. GitHub Pages enabled for this repo:
   - Repo **Settings → Pages → Build and deployment**.
   - Source: **Deploy from a branch**, branch `main`, folder `/ (root)`.
   - After ~1 minute the privacy policy is live at
     `https://runeved.github.io/cookie-decliner/privacy-policy.html`.
   - Confirm with `curl -fsSL https://runeved.github.io/cookie-decliner/privacy-policy.html | head`.

## 1. Build and package

```bash
npm install                # picks up the archiver dev dep on first run
npm run build              # lint + esbuild → dist/content-script.js
npm run package            # → release/cookie-decliner-firefox-1.0.0.zip
npm run package:source     # → release/cookie-decliner-source-1.0.0.zip
```

Sanity-check the extension ZIP:

```bash
unzip -l release/cookie-decliner-firefox-1.0.0.zip
```

Should list exactly:

- `manifest.json`
- `popup.html`
- `dist/content-script.js`
- `icons/icon16.svg`, `icon32.svg`, `icon48.svg`, `icon128.svg`

Optional but recommended — run Mozilla's `web-ext` linter:

```bash
npx web-ext lint --source-dir release/unpacked
# (unpack the firefox zip into release/unpacked first)
```

Zero errors required. Warnings about Chrome-only fields like
`minimum_chrome_version` are expected and harmless on Firefox.

## 2. Smoke test in Firefox

1. Unzip `release/cookie-decliner-firefox-1.0.0.zip` into
   `release/unpacked/`.
2. Open `about:debugging` → **This Firefox** → **Load Temporary Add-on**.
3. Pick `release/unpacked/manifest.json`.
4. Visit https://norskkalender.no — the Didomi banner should auto-decline
   within ~1 s.
5. Open the popup from the toolbar; status should read **Active**.
6. Open DevTools → Console: look for the
   `Cookie Decliner: Successfully clicked decline button` log line.

## 3. Capture screenshots

1280×800 PNG. At minimum capture one before/after of a Didomi or Cookiebot
banner being dismissed. See `docs/store-listing.md` § Screenshots for the
suggested set.

## 4. Submit on AMO

1. https://addons.mozilla.org/en-US/developers/addon/submit/distribution
2. Choose **On this site** (listed channel).
3. Upload `release/cookie-decliner-firefox-1.0.0.zip`.
4. Wait for auto-validation. If the linter flags anything, fix locally,
   rebuild, and re-upload.
5. When asked **"Do you use any custom build steps?"** → answer **Yes**
   and upload `release/cookie-decliner-source-1.0.0.zip`.
6. Fill listing fields by pasting from `docs/store-listing.md`:
   - Name, Summary, Description.
   - Categories and tags.
   - Support email and support site.
   - License (MIT).
   - Privacy policy URL.
   - Notes for reviewers (the long block under "Notes for reviewers").
7. Upload screenshots from `store-assets/screenshots/`.
8. Set release notes from `CHANGELOG.md` § 1.0.0.
9. Submit for review.

## 5. After submission

- Watch the developer email and the AMO listing for reviewer feedback.
- If a reviewer requests changes, edit the source, bump the version in
  `manifest.json` and `package.json`, append a CHANGELOG entry, rebuild
  both ZIPs, and upload as a new version.
- Once approved, fill in the AMO listing URL in `README.md` under the
  **Production Installation** section.
