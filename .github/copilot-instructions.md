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

### Jest Configuration Standards (Based on Jest v30.0+ Official Documentation)
```typescript
// jest.config.js - Modern ESM + TypeScript setup following jestjs.io best practices
export default {
  preset: 'ts-jest/presets/default-esm',      // Modern ES modules + TypeScript
  extensionsToTreatAsEsm: ['.ts'],            // Treat .ts files as ES modules  
  testEnvironment: 'jsdom',                   // Browser-like DOM environment
  transform: {
    '^.+\.ts$': ['ts-jest', { useESM: true }] // Enhanced TypeScript transformation
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  
  // Test reliability (official Jest recommendations)
  clearMocks: true,                           // Auto-clear mocks between tests
  restoreMocks: true,                         // Auto-restore spies
  resetMocks: false,                          // Keep mock implementations
  errorOnDeprecated: true,                    // Catch deprecated API usage
  
  // Coverage enforcement (Jest v30 configuration)
  coverageThreshold: { 
    global: { branches: 80, functions: 80, lines: 80, statements: 80 } 
  },
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/**/*.test.ts']
};
```

### Test Structure Patterns (Jest v30.0+ Best Practices)
```typescript
// Use describe() and it() for BDD-style testing (official Jest recommendation)
describe('ComponentName', () => {
  beforeEach(() => {
    // Arrange - setup mocks and DOM state
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  it('does specific behavior when condition is met', () => {
    // Arrange
    const element = document.createElement('button');
    
    // Act  
    const result = DOMUtils.processElement(element);
    
    // Assert
    expect(result).toBe(expectedValue);
  });

  // Group related tests with nested describe blocks
  describe('when element is visible', () => {
    beforeEach(() => {
      // Setup specific test conditions
    });

    it('processes visible elements correctly', () => {
      // Test implementation
    });
  });
});
```

### TypeScript Testing Patterns
```typescript
// Type-safe mocking with proper type guards
const mockTcfApi = jest.fn() as jest.MockedFunction<typeof window.__tcfapi>;
(window as WindowWithAPIs).__tcfapi = mockTcfApi;

// Type-only imports for test interfaces
import { type WindowWithAPIs, type TCFData } from '../src/types';
```

### Mock Management (`tests/setup.ts`)
```typescript
// Comprehensive browser API mocking
global.chrome = { extension: { getURL: jest.fn() } };
Element.prototype.getBoundingClientRect = jest.fn(() => ({
  width: 100, height: 50, top: 0, left: 0, bottom: 50, right: 100
}));
window.getComputedStyle = jest.fn(() => ({ display: 'block', visibility: 'visible' }));
```

## 🔧 TypeScript Best Practices (Official TypeScript v5.8+ Standards)

### Strict Configuration Standards (Official TypeScript tsconfig.json Reference)
```typescript
// tsconfig.json - Enhanced strict mode (typescriptlang.org/tsconfig)
{
  "compilerOptions": {
    "strict": true,                             // Enable all strict type checking
    "exactOptionalPropertyTypes": true,         // Exact optional property types  
    "noUncheckedIndexedAccess": true,          // Check indexed access safety
    "noImplicitReturns": true,                 // Ensure all code paths return
    "noImplicitOverride": true,                // Require explicit override keyword
    "noUnusedLocals": true,                    // Report unused local variables
    "noUnusedParameters": true,                // Report unused parameters
    "verbatimModuleSyntax": true,              // Preserve exact import/export syntax
    "moduleResolution": "bundler",             // Modern bundler resolution
    "forceConsistentCasingInFileNames": true,  // Cross-platform compatibility
    "isolatedModules": true                    // Single-file transpilation safety
  }
}
```

### Type Safety Patterns (TypeScript Handbook Best Practices)
```typescript
// Type guards for runtime validation (typescriptlang.org patterns)
function hasTCFAPI(win: Window): win is WindowWithAPIs {
  return typeof (win as WindowWithAPIs).__tcfapi === 'function';
}

// Optional chaining with nullish coalescing for safe access
const text = element.textContent?.toLowerCase() ?? '';

// Readonly interfaces for immutable data structures
export interface TCFData {
  readonly cmpStatus: string;
  readonly eventStatus: string;
  readonly gdprApplies?: boolean;
}

// Literal types for precise value constraints
type Alignment = "left" | "right" | "center";
type ButtonState = "visible" | "hidden" | "loading";
```

### Import/Export Standards (TypeScript Module System)
```typescript
// Type-only imports to prevent runtime bundling (verbatimModuleSyntax)
import { type WindowWithAPIs, type TCFData } from './types';

// Explicit module references for bundler compatibility
import { DOMUtils } from './dom-utils';

// Named exports for tree-shaking optimization
export { CookieDecliner } from './cookie-decliner';
export type { CookieSelector, ConsentData } from './types';
```

## 🚨 Common Pitfalls

1. **Jest ESM compatibility** - Use `extensionsToTreatAsEsm: ['.ts']` and `ts-jest/presets/default-esm`
2. **TypeScript strict mode** - Enable all strict flags in tsconfig.json, use optional chaining everywhere
3. **IIFE bundling** - All imports must resolve to single bundled file, no dynamic imports
4. **Test isolation** - Use `clearMocks: true` and proper `beforeEach()` cleanup
5. **Type-safe mocking** - Use `jest.MockedFunction<T>` for proper TypeScript integration
6. **Coverage thresholds** - Maintain 80%+ coverage on branches, functions, lines, statements
7. **Nullish coalescing** - Prefer `??` over `||` for proper null/undefined handling
8. **Module syntax** - Use `verbatimModuleSyntax: true` for explicit import/export control

## 📁 Key Files for Understanding
- `src/content-script.ts` - Main logic flow and initialization
- `src/api-handler.ts` - API integration patterns and error handling
- `tests/setup.ts` - Browser API mocking and test environment
- `package.json` scripts - Build commands and workflow integration
- `jest.config.js` - Test configuration with coverage thresholds
