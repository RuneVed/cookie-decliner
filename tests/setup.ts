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

// Mock MutationObserver with proper implementation
global.MutationObserver = class MutationObserver {
  constructor(private callback: MutationCallback) {}
  disconnect() {}
  observe(element: Node, initObject?: MutationObserverInit): void {}
  takeRecords(): MutationRecord[] { return []; }
};

// Enhanced DOM mocking
Object.defineProperty(window, 'getComputedStyle', {
  value: jest.fn((element: Element) => {
    const htmlElement = element as HTMLElement;
    return {
      display: htmlElement.style?.display || 'block',
      visibility: htmlElement.style?.visibility || 'visible',
      opacity: htmlElement.style?.opacity || '1'
    };
  })
});

// Mock getBoundingClientRect for all elements
HTMLElement.prototype.getBoundingClientRect = jest.fn(function(this: HTMLElement) {
  const width = parseFloat(this.style.width) || 0;  // Default to 0 instead of 100
  const height = parseFloat(this.style.height) || 0;  // Default to 0 instead of 50
  return {
    width,
    height,
    top: 0,
    left: 0,
    bottom: height,
    right: width,
    x: 0,
    y: 0,
    toJSON: () => ({})
  };
});

// Mock intersection observer for visibility testing
(global as any).IntersectionObserver = class IntersectionObserver {
  constructor(private callback: IntersectionObserverCallback) {}
  disconnect() {}
  observe() {}
  unobserve() {}
  get root() { return null; }
  get rootMargin() { return '0px'; }
  get thresholds() { return []; }
  takeRecords() { return []; }
};

// Clean console for tests (Jest best practice)
beforeEach(() => {
  jest.clearAllMocks();
});

// Global error handling for tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Mock performance API
Object.defineProperty(window, 'performance', {
  writable: true,
  value: {
    now: jest.fn(() => Date.now())
  }
});