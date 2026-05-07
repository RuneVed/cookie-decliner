# Store listing — Cookie Decliner

Single source of truth for all fields pasted into addons.mozilla.org (AMO)
and, where reused, the Chrome Web Store. Update this file when copy
changes; do not paste copy directly from memory into the form.

---

## Identity

| Field | Value |
|---|---|
| Add-on name | `Cookie Decliner` |
| Author | RuneVed |
| Support email | runevu@proton.me |
| Support site | https://github.com/RuneVed/cookie-decliner |
| Homepage | https://github.com/RuneVed/cookie-decliner |
| License | MIT |
| Privacy policy URL | https://runeved.github.io/cookie-decliner/privacy-policy.html |
| Version | 1.0.0 |

> **Trademark note:** Do not use "Firefox" in the add-on name. Mozilla's
> trademark policy only allows the form `"X for Firefox"`, and even that
> can suggest endorsement. The plain name `Cookie Decliner` is safe.

---

## Summary (≤132 characters)

```
Automatically declines cookie consent banners on every site you visit. No clicks, no tracking, no data ever leaves your browser.
```

(127 characters.)

---

## Description (~500 words)

```
Cookie Decliner is a lightweight, open-source browser extension that
automatically clicks "Reject all" / "Decline" / "Avslå alle" on cookie
consent dialogs so you don't have to.

It works silently in the background. There is nothing to configure and
no account to create. Open a website that shows a consent banner, and
the extension dismisses it within a moment of the dialog appearing.

Supported consent management frameworks
---------------------------------------
- SourcePoint CMP (iframe and _sp_ API)
- IAB TCF v2.0 (__tcfapi)
- Cookiebot
- OneTrust
- Usercentrics, including the Apollo shadow-DOM variant
- Complianz
- Didomi (single-step setUserDisagreeToAll, and two-step preferences
  panels such as the one used on norskkalender.no)
- Checkbox-based consent (the MaxGaming pattern: uncheck optional
  categories, then click save)

Supported languages
-------------------
Norwegian, English, German, and French. The decline-button text matcher
recognises the common phrasing in each language ("Avslå alle", "Reject
all", "Alle ablehnen", "Tout refuser", and variations).

Privacy
-------
- No data is collected.
- No data is transmitted to any third party.
- No analytics, no telemetry, no tracking pixels.
- No use of chrome.storage, localStorage, sessionStorage, or cookies.
- No network requests of any kind.

The extension only reads the DOM of the page you are visiting in order
to find consent dialogs, and clicks the decline button on your behalf.
That is the entire scope of what it does.

Why broad host permissions?
---------------------------
Cookie consent banners can appear on any website, so the content script
must be allowed to run on every HTTP/HTTPS page. The extension does
nothing on pages that do not contain a consent dialog.

Open source
-----------
Full source is available at https://github.com/RuneVed/cookie-decliner
(MIT licensed). The bundled content script in the submission is produced
by esbuild without minification, so reviewers can read it directly.

Limitations
-----------
- The extension declines non-essential cookies; it cannot override
  legally required consent.
- Some bespoke consent implementations may not be detected — please
  open a GitHub issue with the URL so support can be added.
- JavaScript must be enabled for the extension to work.
```

---

## Categorisation

| Field | Value |
|---|---|
| Primary category (AMO) | Privacy & Security |
| Secondary category (AMO) | Other |
| Chrome Web Store category | Productivity |
| Tags | cookies, consent, privacy, gdpr, didomi, tcf, onetrust, cookiebot |

---

## Notes for reviewers

```
Thank you for reviewing Cookie Decliner.

Build instructions
------------------
The submitted XPI was produced by:

    npm install
    npm run build      # esbuild bundle, no minification
    npm run package    # zips manifest + popup + dist + icons

The source-code submission ZIP contains the full TypeScript source
(src/), tests, and configuration. Reproduce the bundled
dist/content-script.js with `npm install && npm run build`.

What the extension does
-----------------------
- Reads the DOM of the active tab to detect cookie consent dialogs.
- Clicks the decline / reject button in the dialog.
- Where present, calls the standardized consent APIs:
  IAB TCF v2.0 (__tcfapi), SourcePoint (_sp_), Didomi
  (setUserDisagreeToAll).

What the extension does NOT do
------------------------------
- No network requests of any kind.
- No use of chrome.storage / localStorage / sessionStorage / cookies.
- No remote code execution, no eval, no dynamic script injection.
- No analytics, telemetry, or tracking.

Permission justification
------------------------
host_permissions: "http://*/*", "https://*/*"

  Cookie consent banners can appear on any website. The extension must
  be allowed to run on every HTTP/HTTPS page in order to detect and
  dismiss them. No data from any page is ever sent off-device.

  No other permissions are requested.

Test sites
----------
- https://norskkalender.no  (Didomi two-step preferences flow)
- https://www.cdon.com       (Didomi)
- https://www.maxgaming.no   (checkbox-based consent)

Source layout pointers
----------------------
- src/content-script.ts  -- entry point, MutationObserver, init flow
- src/api-handler.ts     -- TCF, SourcePoint, Didomi API integrations
- src/dom-utils.ts       -- DOM detection and click logic
- src/selectors.ts       -- per-framework, per-language selector lists
- src/keywords.ts        -- decline-button text dictionaries
```

---

## Per-permission justification (AMO form fields)

**`host_permissions: http://*/*` and `https://*/*`**

```
Cookie consent dialogs can appear on any HTTP or HTTPS website. The
extension must be allowed to run on every such page in order to find
and click the decline button. The content script does nothing on pages
that do not contain a consent dialog. No information from any page is
ever sent off-device — there are no network requests of any kind.
```

---

## Screenshots (manual upload)

Capture at 1280×800 PNG. Suggested shots:

1. A site with a Didomi two-step banner (e.g. `norskkalender.no`)
   immediately before and after the extension dismisses it.
2. The popup showing the "Active" status badge.
3. DevTools console with the `Cookie Decliner: Successfully clicked
   decline button` line visible, on a real site.

Place under `store-assets/screenshots/` (gitignored — not in the
submission ZIP).
