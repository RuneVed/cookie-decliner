# Cookie Decliner Extension - AI Coding Agent Instructions

## 🎯 Project Overview
Browser extension that automatically declines cookie consent popups using multi-strategy detection: API integration (TCF v2.0, SourcePoint), DOM analysis, and text recognition across 4 languages.

## 📋 Development Guidelines

### Core Principles
- **Keep it simple**: Prefer the smallest change or solution that clearly solves the problem. Avoid premature abstraction, unnecessary patterns, or speculative features. Do not overengineer code or documentation.
- **Use authoritative sources**: When updating or adding documentation (including best practices, recommendations, security guidance, performance tips, or architectural rationale), use or request official, primary sources (e.g., vendor docs, standards bodies, authoritative project docs) to verify accuracy before asserting guidance.
- **Maintain accurate metrics**: When updating the testing-guide, make sure to update the actual coverage numbers if available. If not available, ask if a coverage report should be created.

## 🏗️ Architecture Patterns

### Core Components (src/)
- **content-script.ts** - Main orchestrator with MutationObserver for dynamic content
- **api-handler.ts** - Cookie consent API integration (TCF, SourcePoint CMP)
- **dom-utils.ts** - DOM manipulation with visibility/context validation
- **selectors.ts** - Multi-language button selectors organized by framework
- **keywords.ts** - Text validation (COOKIE_KEYWORDS vs EXCLUDE_KEYWORDS)
- **types.ts** - TypeScript interfaces for window APIs and consent data

### Key Design Patterns
```typescript
// Singleton pattern for API handlers
class APIHandler {
  private static consentProcessed = false;
  static checkForGlobalAPIs(): void { /* ... */ }
}

// Strategy pattern for detection methods
class CookieDecliner {
  private readonly declineSelectors: CookieSelector[];
  private processElement(element: Element): boolean { /* ... */ }
}
```

### Critical Integration Points
- **Cross-frame communication** - PostMessage API for iframe-based consent systems
- **API polling** - Exponential backoff for late-loading consent frameworks
- **DOM observation** - MutationObserver with performance throttling
- **Context validation** - Multi-layer filtering to avoid non-cookie buttons

## 🛠️ Development Workflow

### Build System (esbuild-based)
```bash
npm run build        # Production build (includes pre-build linting)
npm run watch        # Development auto-rebuild
npm run prebuild     # ESLint with --max-warnings 0 (strict)
```

**Critical**: Extension uses IIFE bundling format for browser compatibility. All code must be bundled into `dist/content-script.js`.

### Testing Strategy (Jest + Playwright)
```bash
npm test                # Unit tests only
npm run test:coverage   # Coverage report (80%+ target)
npm run test:all        # Unit + E2E tests
npm run test:e2e        # Playwright browser automation
```

**Testing Philosophy**: 
- Unit tests for logic validation (dom-utils, api-handler, selectors)
- E2E tests simplified to structure validation (not full site testing)
- Mock browser APIs in `tests/setup.ts` with getBoundingClientRect

## 🔧 Code Conventions

### TypeScript Patterns
```typescript
// Window API type guards
function hasTCFAPI(win: Window): win is WindowWithAPIs {
  return typeof (win as WindowWithAPIs).__tcfapi === 'function';
}

// Null safety with optional chaining
const text = element.textContent?.toLowerCase() || '';

// DOM element validation pattern
static isElementVisible(element: Element): boolean {
  if (!(element instanceof HTMLElement)) return false;
  const style = window.getComputedStyle(element);
  return style.display !== 'none' && /* ... */;
}
```

### Selector Organization
Selectors grouped by framework and language in `selectors.ts`:
- **Framework-specific**: SourcePoint, Cookiebot, OneTrust, Usercentrics
- **Language-specific**: Norwegian, English, German, French
- **Text-based**: Custom `:contains()` pseudo-selector implementation

### Logging Convention
```typescript
// User-facing debug info
console.log('Cookie Decliner: Found TCF API immediately!');
// Development debugging  
console.debug('Error with selector ${selector}:', error);
```

## 🧪 Testing Best Practices (Jest + TypeScript)

### Key Testing Standards
- **ESM Support** - Use `ts-jest/presets/default-esm` preset
- **Type Safety** - Mock with `jest.MockedFunction<T>`
- **Test Isolation** - Use `clearMocks: true` and proper `beforeEach()` cleanup
- **Coverage Enforcement** - 80%+ on branches, functions, lines, statements
- **BDD Structure** - Use `describe()` and `it()` for clear test organization

### Test Structure Patterns
```typescript
// Use describe() and it() for BDD-style testing
describe('ComponentName', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  it('does specific behavior when condition is met', () => {
    // Arrange, Act, Assert pattern
    const element = document.createElement('button');
    const result = DOMUtils.processElement(element);
    expect(result).toBe(expectedValue);
  });
});

// Type-safe mocking
const mockTcfApi = jest.fn() as jest.MockedFunction<typeof window.__tcfapi>;
```

## 🔧 TypeScript Best Practices

### Key Configuration Standards
- **Strict Mode** - Enable all strict type checking options
- **Module Resolution** - Use `"bundler"` for modern bundler compatibility
- **Type Safety** - Use optional chaining (`?.`) and nullish coalescing (`??`)
- **Import/Export** - Use type-only imports when possible
### Type Safety Patterns
```typescript
// Type guards for runtime validation
function hasTCFAPI(win: Window): win is WindowWithAPIs {
  return typeof (win as WindowWithAPIs).__tcfapi === 'function';
}

// Optional chaining with nullish coalescing
const text = element.textContent?.toLowerCase() ?? '';

// Literal types for precise constraints
type ButtonState = "visible" | "hidden" | "loading";
```

## 🚨 Common Pitfalls

1. **Jest ESM compatibility** - Use `extensionsToTreatAsEsm: ['.ts']` and `ts-jest/presets/default-esm`
2. **TypeScript strict mode** - Enable all strict flags, use optional chaining everywhere
3. **IIFE bundling** - All imports must resolve to single bundled file
4. **Test isolation** - Use `clearMocks: true` and proper `beforeEach()` cleanup
5. **Type-safe mocking** - Use `jest.MockedFunction<T>` for TypeScript integration
6. **Coverage thresholds** - Maintain 80%+ coverage on all metrics

## 📁 Key Files for Understanding
- `src/content-script.ts` - Main logic flow and initialization
- `src/api-handler.ts` - API integration patterns and error handling
- `tests/setup.ts` - Browser API mocking and test environment
- `jest.config.js` - Test configuration with coverage thresholds
