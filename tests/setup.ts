import '@testing-library/jest-dom';

// Mock browser APIs
Object.defineProperty(window, 'chrome', {
  writable: true,
  value: {
    runtime: {
      sendMessage: jest.fn(),
      onMessage: {
        addListener: jest.fn()
      }
    }
  }
});

// Mock browser extension APIs for Firefox
Object.defineProperty(window, 'browser', {
  writable: true,
  value: {
    runtime: {
      sendMessage: jest.fn(),
      onMessage: {
        addListener: jest.fn()
      }
    }
  }
});

// Mock MutationObserver
global.MutationObserver = class MutationObserver {
  constructor(callback: MutationCallback) {}
  disconnect() {}
  observe(element: Node, initObject?: MutationObserverInit): void {}
  takeRecords(): MutationRecord[] { return []; }
};

// Mock console methods to reduce test noise
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock setTimeout/clearTimeout
global.setTimeout = jest.fn((callback: Function, delay?: number) => {
  return callback();
}) as any;

global.clearTimeout = jest.fn();