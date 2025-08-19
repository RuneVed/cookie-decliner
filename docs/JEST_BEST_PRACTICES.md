# Jest Best Practices Implementation

Modern Jest testing setup following official Jest documentation (jestjs.io v30.0+) and TypeScript integration best practices from the TypeScript Handbook.

## ✅ Modern Jest Configuration (Official jestjs.io Standards)

### 1. **Enhanced Jest Setup (`jest.config.js`)**
```javascript
// Based on Jest v30.0+ official configuration reference
export default {
  preset: 'ts-jest/presets/default-esm',      // Modern ESM + TypeScript support
  extensionsToTreatAsEsm: ['.ts'],            // Treat .ts files as ES modules
  testEnvironment: 'jsdom',                   // Browser-like DOM environment
  
  // Test Discovery & Execution (Official Jest patterns)
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/*.test.ts',
    '**/tests/unit/**/*.{test,spec}.ts'
  ],
  
  // Coverage Configuration (Jest v30 best practices from jestjs.io)
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Enhanced Test Reliability (Official Jest recommendations)
  clearMocks: true,                           // Auto-clear mocks between tests
  restoreMocks: true,                         // Auto-restore spies
  resetMocks: false,                          // Keep mock implementations
  errorOnDeprecated: true,                    // Catch deprecated API usage
  
  // Environment Setup
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  
  // TypeScript Integration (ts-jest official configuration)
  transform: {
    '^.+\.ts$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        module: 'esnext',
        target: 'es2020'
      }
    }]
  }
};
```

## ✅ Test Structure Best Practices

### 3. **Test Organization**
- ✅ **Descriptive test names** - Using `it()` instead of `test()` for better readability
- ✅ **Arrange-Act-Assert pattern** - Clear test structure with comments
- ✅ **Grouped test cases** - Logical `describe()` blocks for related functionality
- ✅ **Proper test cleanup** - `beforeEach()` and `afterEach()` hooks

### 4. **Naming Conventions**
```typescript
describe('ComponentName', () => {
  describe('Feature Group', () => {
    it('does something specific when condition is met', () => {
      // Arrange
      // Act  
      // Assert
    });
  });
});
```

### 5. **Mock Management**
- ✅ **Proper mock scoping** - Module-level mocks with proper typing
- ✅ **Mock cleanup** - Automatic cleanup in setup files
- ✅ **Spy management** - Proper spy restoration in `afterEach()`
- ✅ **Mock implementations** - Realistic mock behavior for APIs

## ✅ Test Utility Best Practices

### 6. **Test Utilities (`tests/test-utils.ts`)**
- ✅ **DOM helpers** - `createMockElement()`, `createMockButton()`
- ✅ **API mocking helpers** - `createMockTcfApi()`, `createMockSourcePointApi()`
- ✅ **Async testing utilities** - `waitFor()`, `waitForElement()`
- ✅ **Assertion helpers** - `expectElementToBeVisible()`, `expectElementToBeClickable()`
- ✅ **Event creation utilities** - `createMockEvent()`, `createMockMutationRecord()`

### 7. **Modern Matchers Usage**
```typescript
// ✅ Specific matchers
expect(element).toBeInTheDocument();
expect(element).toHaveTextContent('Expected text');
expect(mockFunction).toHaveBeenCalledWith(expectedArgs);

// ✅ Negation for clarity  
expect(element).not.toBeDisabled();

// ✅ Custom matchers from @testing-library/jest-dom
expect(element).toBeVisible();
```

## ✅ Package.json Scripts

### 8. **Comprehensive Test Scripts**
```json
{
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage", 
  "test:coverage:open": "jest --coverage && npm run open:coverage",
  "test:unit": "jest --testPathPattern=tests/unit",
  "test:unit:watch": "jest --testPathPattern=tests/unit --watch",
  "test:debug": "jest --detectOpenHandles --forceExit",
  "test:ci": "jest --coverage --watchAll=false --passWithNoTests"
}
```

## ✅ Individual Test File Improvements

### 9. **Selectors Test (`tests/unit/selectors.test.ts`)**
- ✅ **Clear test descriptions** - "has selectors", "includes Norwegian selectors"
- ✅ **Proper assertions** - Specific length checks and content validation
- ✅ **Logical grouping** - Language configs vs Framework selectors

### 10. **DOM Utils Test (`tests/unit/dom-utils.test.ts`)**
- ✅ **DOM cleanup** - `beforeEach()` clears document.body
- ✅ **Arrange-Act-Assert** - Clear test structure
- ✅ **Edge case testing** - Hidden elements, zero dimensions
- ✅ **Mock isolation** - Proper getBoundingClientRect mocking

### 11. **API Handler Test (`tests/unit/api-handler.test.ts`)**
- ✅ **Spy management** - Proper console spy cleanup in `afterEach()`
- ✅ **Window API mocking** - Realistic TCF and SourcePoint API simulation
- ✅ **Error handling tests** - Graceful error handling verification
- ✅ **Mock state management** - Proper mock reset between tests

### 12. **Keywords Test (`tests/unit/keywords.test.ts`)**
- ✅ **Array validation** - Proper keyword array testing
- ✅ **Content validation** - Multi-language support verification
- ✅ **Function testing** - `getAllCookieKeywords()` comprehensive testing

## ✅ Advanced Jest Features

### 13. **Coverage Configuration**
- ✅ **Threshold enforcement** - 80% minimum coverage
- ✅ **File exclusions** - Excludes type definitions and specs from coverage
- ✅ **Multiple report formats** - Text, LCOV, HTML, JSON summary

### 14. **TypeScript Integration**
- ✅ **ts-jest preset** - Proper TypeScript compilation
- ✅ **ESM support** - Modern module handling
- ✅ **Type safety** - Proper mock typing with `jest.MockedFunction`

### 15. **Performance Optimizations**
- ✅ **Mock clearing** - Automatic mock state cleanup
- ✅ **Test timeout** - 10-second timeout for async operations
- ✅ **Parallel execution** - Jest's default parallel test running

## 🎯 Key Jest Best Practices Implemented

1. **Use `it()` instead of `test()`** - More descriptive and readable
2. **Arrange-Act-Assert pattern** - Clear test structure
3. **Proper mock management** - Clean setup and teardown
4. **Comprehensive test utilities** - Reusable helper functions
5. **Specific assertions** - Use the most appropriate matcher
6. **Test isolation** - Each test runs independently
7. **Error handling coverage** - Test both success and failure paths
8. **Mock typing** - Proper TypeScript support for mocks
9. **Coverage thresholds** - Enforce minimum code coverage
10. **CI-friendly scripts** - Scripts optimized for continuous integration

## 📊 Coverage and Quality Metrics

The configuration ensures:
- **80% minimum coverage** across all metrics
- **Comprehensive reporting** with multiple formats
- **Future compatibility** with deprecation warnings
- **Performance monitoring** with open handles detection
- **CI/CD integration** with proper exit codes

## 🚀 Running Tests

```bash
# Basic test run
npm test

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage

# Unit tests only
npm run test:unit

# CI mode (no watch, with coverage)
npm run test:ci
```

This implementation follows the official Jest documentation recommendations and incorporates industry best practices for maintainable, reliable, and comprehensive test suites.