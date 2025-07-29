export default {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'jsdom',
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/*.test.ts',
    '**/tests/unit/**/*.test.ts',
    '**/tests/unit/**/*.spec.ts'
  ],
  // Explicitly exclude E2E tests from Jest
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/tests/e2e/',
    '<rootDir>/playwright-report/',
    '<rootDir>/test-results/'
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  transform: {
    '^.+\.ts$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        module: 'esnext'
      }
    }]
  },
  moduleNameMapping: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  testTimeout: 10000
};