# Changelog

All notable changes to Cookie Decliner are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] — 2026-04-30

Initial public release.

### Added
- Multi-tier consent detection: API → DOM → text → context.
- Support for the following consent management frameworks:
  - SourcePoint CMP (iframe + `_sp_` API).
  - IAB TCF v2.0 (`__tcfapi`).
  - Cookiebot.
  - OneTrust.
  - Usercentrics, including Apollo shadow-DOM
    (`[data-testid="uc-deny-all-button"]`).
  - Complianz.
  - Didomi single-step (`setUserDisagreeToAll()`).
  - Didomi two-step preferences flow (e.g. `norskkalender.no`).
  - Checkbox-based consent (MaxGaming pattern): uncheck optional cookies,
    click save.
- Verified working on Norwegian, English, German, and French sites.
- MutationObserver and shadow-DOM observer for dialogs that appear after
  initial page load.
- Rate limiting in `APIHandler` (2 s between attempts, 5 attempts max
  per page).
- Strict origin validation for `postMessage` listeners and prototype
  pollution guards on incoming data.
- Manifest V3, no remote code, no network requests, no storage.

[1.0.0]: https://github.com/RuneVed/cookie-decliner/releases/tag/v1.0.0
