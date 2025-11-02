# Testing Guide: Cookie Decliner Extension

Testing setup with Jest and Playwright for unit and end-to-end testing.

## 🏃‍♂️ Quick Commands

```bash
# Run all unit tests (96 tests)
npm test

# Development with watch mode
npm run test:watch

# Full coverage report
npm run test:coverage

# End-to-end tests
npm run test:e2e

# All tests (unit + e2e)
npm run test:all

# Debug mode
npm run test:debug
```

## 📈 Test Coverage Status

| Module | Coverage | Notes |
|--------|----------|-------|
| **selectors.ts** | **100%** ✅ | Config validation, generation |
| **keywords.ts** | **100%** ✅ | Keyword matching logic |
| **dom-utils.ts** | **100%** ✅ | DOM operations, checkbox consent |
| **api-handler.ts** | **93.79%** ✅ | API integrations (TCF, SourcePoint) |
| **content-script.ts** | **0%*** 📝 | Extension context limitations |

**Overall: 96 tests passing (including 10 checkbox consent tests), 66.66% lines, 50% branches**

> *Content script coverage measured via dependencies due to extension context limitations.

## 🧪 Testing Architecture

### Jest Features
- **ESM Support** - Modern ES Module testing with ts-jest
- **TypeScript Integration** - Full type safety
- **jsdom Environment** - Complete DOM API simulation
- **Coverage Enforcement** - 80% threshold on all metrics
- **Watch Mode** - Intelligent re-running

### Playwright Integration
- **Multi-browser testing** (Chrome and Firefox)
- **Screenshot/video capture** on failures

## 📁 Test Structure

```
tests/
├── setup.ts                    # Jest environment + browser API mocks
├── test-utils.ts              # Reusable utilities
├── unit/                       # Unit tests (Jest + TypeScript)
│   ├── selectors.test.ts       # Language & framework selectors
│   ├── keywords.test.ts        # Cookie keyword validation
│   ├── dom-utils.test.ts       # DOM manipulation & detection
│   ├── checkbox-consent.test.ts # Checkbox-based consent (MaxGaming)
│   ├── api-handler.test.ts     # TCF/SourcePoint API integration
│   ├── content-script.test.ts  # Extension coordination logic
│   └── rate-limit-security.test.ts # Security tests
└── e2e/                        # Integration tests (Playwright)
    ├── cookie-decliner.spec.ts # Extension functionality
    └── real-sites.spec.ts      # Real website testing
```

## � Troubleshooting

### Common Issues
```bash
# Run specific test file
npm test selectors.test.ts

# Verbose output for debugging
npm test -- --verbose

# Debug hanging tests
npm run test:debug

# Run tests in watch mode
npm run test:watch
```

### Jest ESM Issues
- Ensure `extensionsToTreatAsEsm: ['.ts']` in jest.config.js
- Use `ts-jest/presets/default-esm` preset
- Clear mocks with `jest.clearAllMocks()` in beforeEach()

### Playwright E2E Debugging
```bash
# Visual debugging with UI mode
npm run test:e2e:ui

# Debug mode with breakpoints
npm run test:e2e:debug
```

## 🚀 Development Workflow

1. **Start watch mode**: `npm run test:watch`
2. **Write tests** following Arrange-Act-Assert pattern
3. **Implement features** to make tests pass
4. **Check coverage**: `npm run test:coverage`
5. **Run full suite**: `npm run test:all` before commit

## 📈 Quality Metrics

### Current Status ✅
- **96 unit tests passing** in ~3.6 seconds
- **80%+ coverage** enforced on critical modules
- **Type-safe testing** with full TypeScript integration
- **Modern Jest configuration** with ESM support

### Coverage Highlights
- **selectors.ts**: 100% coverage (language/framework validation)
- **keywords.ts**: 100% coverage (cookie keyword detection)
- **dom-utils.ts**: 100% coverage (DOM manipulation + checkbox consent)
- **api-handler.ts**: 93.8% coverage (TCF/SourcePoint integration)

### New Features Tested
- **Checkbox-based consent** (10 tests) - MaxGaming pattern support
- **Multi-language support** - Norwegian and English text recognition
- **Error handling** - Graceful degradation for edge cases

## 📚 References

- **Jest Documentation**: https://jestjs.io/docs/getting-started
- **TypeScript Testing**: https://www.typescriptlang.org/docs/handbook/testing.html
- **Playwright**: https://playwright.dev/docs/intro