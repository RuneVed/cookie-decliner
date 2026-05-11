# Changelog

All notable changes to Cookie Decliner are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] — 2026-05-11

### Added
- English-language cookie banner support: selectors for "Reject all",
  "Decline all", "Only necessary", "Manage preferences", "Customize",
  "Confirm my choices", etc., plus English content-keyword recognition.
- Fides CMP (Ethyca) support — used by NYT and other Condé Nast sites.
  Shadow-DOM observer mirrors the Usercentrics/Apollo pattern; explicit
  `#fides-reject-all-button` short-circuit in `isCookieRelatedButton`
  avoids hidden dependency on the `'fides'` keyword.
- AMO MV3 manifest fields (`gecko.id`, empty `data_collection_permissions`)
  promoted to `main`.

### Changed
- English step-1 selectors (`Customize`, `Manage preferences`, etc.) marked
  `isExpandButton: true` so the MutationObserver survives the modal-open
  click and catches the real reject button on multi-step CMPs like Fides
  on NYT.
- `getAllCookieKeywords()` dedupes via `Set`.
- Documentation refreshed (test count 126 → 129, coverage figures, browser
  compatibility table now Manifest V3 for both Chrome and Firefox).

### Removed
- Bare `button:contains("Reject")` and `button:contains("Decline")`
  selectors — false-positive risk on non-cookie UIs ("Reject changes",
  "Decline meeting"). Multi-word variants remain.
- Overly generic English content-keywords: `save`, `allow`, `manage`,
  `confirm` — too broad outside cookie context.

### Fixed
- Fides CMP click validation when the reject button is inside a shadow
  root (`parentElement` returns `null`, parent-context fallback fails).

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

[1.1.0]: https://github.com/RuneVed/cookie-decliner/releases/tag/v1.1.0
[1.0.0]: https://github.com/RuneVed/cookie-decliner/releases/tag/v1.0.0
