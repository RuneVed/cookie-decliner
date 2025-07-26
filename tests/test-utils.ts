/**
 * Test utilities following Jest best practices
 */

// DOM Test Helpers
export const createMockElement = (
  tagName: string, 
  attributes: Record<string, string> = {},
  textContent?: string
): HTMLElement => {
  const element = document.createElement(tagName);
  
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  
  if (textContent) {
    element.textContent = textContent;
  }
  
  return element;
};

export const createMockButton = (
  text: string, 
  attributes: Record<string, string> = {}
): HTMLButtonElement => {
  return createMockElement('button', attributes, text) as HTMLButtonElement;
};

// Mock API Helpers
export const createMockTcfApi = (responses: Record<string, any> = {}) => {
  return jest.fn((command: string, version: number, callback: Function) => {
    const response = responses[command] || {
      cmpStatus: 'loaded',
      eventStatus: 'cmpuishown',
      tcString: '',
      gdprApplies: true
    };
    callback(response, true);
  });
};

export const createMockSourcePointApi = () => {
  return {
    config: {},
    gdpr: {
      loadPrivacyManagerModal: jest.fn()
    }
  };
};

// Console Mock Helpers
export const mockConsole = () => {
  const originalConsole = global.console;
  const consoleMock = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
  };
  
  global.console = { ...originalConsole, ...consoleMock };
  
  return {
    mock: consoleMock,
    restore: () => {
      global.console = originalConsole;
    }
  };
};

// Async Test Helpers
export const waitFor = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const waitForElement = async (
  selector: string, 
  timeout = 1000
): Promise<Element | null> => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const element = document.querySelector(selector);
    if (element) return element;
    await waitFor(10);
  }
  
  return null;
};

// Mock Window API Helpers
export const mockWindowApi = (apiName: string, implementation: any) => {
  const original = (window as any)[apiName];
  (window as any)[apiName] = implementation;
  
  return {
    restore: () => {
      if (original) {
        (window as any)[apiName] = original;
      } else {
        delete (window as any)[apiName];
      }
    }
  };
};

// Test Data Factories
export const createLanguageConfig = (code: string, name: string, selectors: any[] = []) => ({
  code,
  name,
  selectors: selectors.length ? selectors : [
    { selector: `button:contains("Decline all ${code}")`, description: `Test ${code} decline` }
  ]
});

export const createFrameworkSelector = (name: string, selector: string) => ({
  name,
  selector,
  description: `Test ${name} selector`
});

// Assertion Helpers
export const expectElementToBeVisible = (element: HTMLElement) => {
  expect(element).toBeInTheDocument();
  expect(element).toBeVisible();
};

export const expectElementToBeClickable = (element: HTMLElement) => {
  expectElementToBeVisible(element);
  expect(element).not.toBeDisabled();
};

// Mock Event Helpers
export const createMockEvent = (type: string, properties: Record<string, any> = {}) => {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.assign(event, properties);
  return event;
};

export const createMockMutationRecord = (
  type: MutationRecordType = 'childList',
  target: Node = document.body,
  addedNodes: Node[] = []
): MutationRecord => {
  const createEmptyNodeList = (): NodeList => {
    const div = document.createElement('div');
    return div.childNodes;
  };

  const createNodeList = (nodes: Node[]): NodeList => {
    const fragment = document.createDocumentFragment();
    nodes.forEach(node => fragment.appendChild(node.cloneNode(true)));
    return fragment.childNodes;
  };

  return {
    type,
    target,
    addedNodes: addedNodes.length ? createNodeList(addedNodes) : createEmptyNodeList(),
    removedNodes: createEmptyNodeList(),
    previousSibling: null,
    nextSibling: null,
    attributeName: null,
    attributeNamespace: null,
    oldValue: null
  };
};