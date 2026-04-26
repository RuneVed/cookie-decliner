# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

Manifest V3 browser extension that automatically declines cookie consent popups. Uses a multi-tier detection strategy (API → DOM → text → context) and supports 9+ consent management frameworks across Norwegian, English, German, and French sites.

## Stack

- TypeScript 5.8.3, strict mode, `verbatimModuleSyntax`
- esbuild (IIFE bundle, single output `dist/content-script.js`)
- Jest 29 + ts-jest ESM preset, jsdom environment
- Playwright for E2E (separate from Jest)
- ESLint 9 flat config, `--max-warnings 0` enforced as `prebuild`

## Commands

| Task                | Command                   |
|---------------------|---------------------------|
| Build (lints first) | `npm run build`           |
| Watch               | `npm run watch`           |
| Lint (strict)       | `npm run lint:check`      |
| Unit tests          | `npm test`                |
| Coverage            | `npm run test:coverage`   |
| E2E (Playwright)    | `npm run test:e2e`        |
| All tests           | `npm run test:all`        |

## Architecture (`src/`)

- `content-script.ts` — entry point; `CookieDecliner` class wires up MutationObserver, shadow-DOM observer, postMessage listener, and the initial scan. Self-instantiates on import — untestable in Jest.
- `api-handler.ts` — `APIHandler` static class; integrates TCF v2.0, SourcePoint `_sp_`, and Didomi `setUserDisagreeToAll()`. Owns rate-limiting (2 s between attempts, 5 max per page).
- `dom-utils.ts` — `DOMUtils` static class; visibility checks, cookie-context validation, click dispatch, checkbox-based consent (MaxGaming pattern), Didomi two-step preferences flow.
- `selectors.ts` — multi-language selector lists organised by framework.
- `keywords.ts` — `COOKIE_KEYWORDS` and `EXCLUDE_KEYWORDS` text lists.
- `types.ts` — `WindowWithAPIs`, `TCFData`, `PostMessageData`; type guards `hasTCFAPI`, `hasSourcePointAPI`, `hasDidomiAPI`.
- `constants.ts` — shared cross-file constants (e.g. `HUMAN_LIKE_DELAY_BASE_MS`). File-local constants live at the top of each file.

## Detection strategy (in order)

1. Checkbox-based consent (MaxGaming pattern) — uncheck optional cookies, click save.
2. Didomi two-step preferences (`norskkalender.no`) — open panel, click "Avslå alle", click "Lagre".
3. Shadow-DOM `[data-testid="uc-deny-all-button"]` (Usercentrics/Apollo).
4. Standard selector list — scoped per framework and language.
5. Global APIs (TCF, SourcePoint, Didomi) run in parallel from `init()`.

## Supported frameworks

SourcePoint, TCF v2.0, Cookiebot, OneTrust, Usercentrics (incl. Apollo shadow DOM), Complianz, Didomi (single-step + two-step), checkbox-based (MaxGaming).

## Conventions

- 2-space indent, `camelCase` identifiers, `SCREAMING_SNAKE_CASE` constants.
- Type-only imports: `import { type Foo } from './x'`.
- Optional chaining + nullish coalescing everywhere (`?.` and `??`).
- `console.log` is allowed — browser extension needs it; `no-console` is `off` in ESLint. Prefix logs with `'Cookie Decliner: '`.
- Singleton-style static classes for `APIHandler` and `DOMUtils`.
- File-local constants at the top of each file; constants shared across files go in `src/constants.ts`.
- Existing `private static readonly` constants inside `APIHandler` (`RATE_LIMIT_MS`, `MAX_DECLINE_ATTEMPTS`) stay where they are — intentionally class-scoped.

## Testing

- 126 unit tests in `tests/unit/` (Jest, jsdom); coverage threshold 80% on all metrics — enforced.
- `content-script.ts` is excluded from meaningful unit testing because it self-instantiates on import.
- E2E in `tests/e2e/`: `cookie-decliner.spec.ts` and `real-sites.spec.ts`. Run via `npm run test:e2e`, not `npm test`.
- Browser API mocks in `tests/setup.ts`.
- jsdom visibility mocks need explicit `width`/`height` on `getBoundingClientRect` to return non-zero.

## Security rules (do not regress)

- `setupPostMessageListener` validates `event.origin` against a hardcoded trusted-domain whitelist (`isTrustedOrigin`).
- `tryIframeCommunication` uses a validated `targetOrigin`, never `'*'`.
- `isValidPostMessageData` blocks prototype pollution (rejects `__proto__`, `constructor`, etc.) and validates shape.
- Incoming strings are length-capped and character-stripped via `sanitizeString` before use.
- `APIHandler` reset is keyed by a non-enumerable `Symbol` (`SECURE_RESET_SYMBOL`) to prevent test hooks from being discovered by enumeration.

## Common pitfalls

- Jest needs `extensionsToTreatAsEsm: ['.ts']` and the ts-jest ESM preset — keep both intact.
- IIFE bundling means everything must be reachable from `content-script.ts`; orphaned exports are tree-shaken silently.
- `npm run prebuild` runs lint with `--max-warnings 0` — any warning fails the build.
- When updating test counts or coverage numbers in docs, verify against actual `npm test` / `npm run test:coverage` output; do not copy from memory.

## Key files for orientation

- `src/content-script.ts` — main flow, observer setup
- `src/api-handler.ts` — API integrations, rate limiting
- `src/dom-utils.ts` — DOM logic, checkbox and Didomi flows
- `tests/setup.ts` — browser API mocks
- `jest.config.js` — coverage thresholds, ESM wiring
- `eslint.config.js` — flat config, strict rules
- `.github/copilot-instructions.md` — companion AI guidance (brevity, authoritative sources, accurate metrics)
- `docs/requirements.md` — functional requirements FR001–FR020
