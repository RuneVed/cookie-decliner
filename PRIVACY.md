# Privacy Policy — Cookie Decliner

**Effective date:** 2026-04-30

## Who we are
Cookie Decliner is an open-source browser extension developed by **RuneVed**.
Contact: **runevu@proton.me**
Source code: https://github.com/RuneVed/cookie-decliner

## What data we collect
**None.** Cookie Decliner does not collect, store, transmit, or sell any
personal data. The extension performs all of its work locally inside the
browser tab on which it runs.

## What data we transmit to third parties
**None.** The extension makes no network requests of its own. It does not
contact any analytics provider, telemetry endpoint, or remote server.

## Storage
The extension does not use `chrome.storage`, `localStorage`, `sessionStorage`,
`IndexedDB`, or cookies. Nothing is persisted between page loads other than
the extension code itself.

## Permissions
The extension requests `host_permissions` for `http://*/*` and `https://*/*`.
This broad scope is necessary because cookie consent banners can appear on
any website. The host permissions are used **only** to:

1. Read the DOM of the current page in order to detect consent dialogs.
2. Click decline / reject buttons inside those dialogs.
3. Call standardized consent APIs such as the IAB TCF v2.0 `__tcfapi`,
   SourcePoint `_sp_`, and Didomi `setUserDisagreeToAll()` when present.

No information from any page is ever sent outside the browser.

## Permissions the extension does NOT request
- `tabs` — not requested.
- `cookies` — not requested.
- `storage` — not requested.
- `webRequest` / `webRequestBlocking` — not requested.
- `scripting` (programmatic injection) — not requested.

## Children's privacy
Because no data is collected, the extension does not knowingly collect
information from children under 13 (or any other age).

## Changes to this policy
Any future change that affects data handling will be released as a new
version of the extension and disclosed in this document and in the
release notes.

## Reporting concerns
If you believe Cookie Decliner is doing something inconsistent with this
policy, please open an issue at
https://github.com/RuneVed/cookie-decliner/issues or email runevu@proton.me.
