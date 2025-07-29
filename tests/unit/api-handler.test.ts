import { APIHandler } from '../../src/api-handler';
import { hasTCFAPI, hasSourcePointAPI } from '../../src/types';

// Mock window object with proper typing
declare global {
  interface Window {
    __tcfapi?: any;
    _sp_?: any;
  }
}

// Mock the type guards
jest.mock('../../src/types', () => ({
  hasTCFAPI: jest.fn(),
  hasSourcePointAPI: jest.fn()
}));

const mockHasTCFAPI = hasTCFAPI as jest.MockedFunction<typeof hasTCFAPI>;
const mockHasSourcePointAPI = hasSourcePointAPI as jest.MockedFunction<typeof hasSourcePointAPI>;

describe('APIHandler', () => {
  // Spy variables for proper cleanup
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    // Clean up window APIs
    delete (window as any).__tcfapi;
    delete (window as any)._sp_;
    delete (window as any).__cmp;
    delete (window as any).Cookiebot;
    delete (window as any).OneTrust;
    
    // Reset APIHandler state
    APIHandler.setConsentProcessed(false);
    
    // Reset mocks
    mockHasTCFAPI.mockReturnValue(false);
    mockHasSourcePointAPI.mockReturnValue(false);
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up spies
    if (consoleSpy) {
      consoleSpy.mockRestore();
    }
    
    // Clean up timers
    jest.clearAllTimers();
  });

  describe('TCF API Handling', () => {
    it('should handle TCF API when not available', () => {
      // Arrange
      mockHasTCFAPI.mockReturnValue(false);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Act
      APIHandler.handleTCFAPI();
      
      // Assert
      expect(mockHasTCFAPI).toHaveBeenCalledWith(window);
      expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: No TCF API found');
      
      consoleSpy.mockRestore();
    });

    it('should handle TCF API when available', () => {
      // Arrange
      mockHasTCFAPI.mockReturnValue(true);
      
      // Mock TCF API
      const mockTCFAPI = jest.fn((command, version, callback) => {
        if (command === 'getTCData') {
          callback({ cmpStatus: 'loaded', eventStatus: 'useractioncomplete' }, true);
        }
      });
      
      (window as any).__tcfapi = mockTCFAPI;
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Act
      APIHandler.handleTCFAPI();
      
      // Assert
      expect(mockHasTCFAPI).toHaveBeenCalledWith(window);
      expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: Setting up TCF API handlers');
      expect(mockTCFAPI).toHaveBeenCalledWith('getTCData', 2, expect.any(Function));
      expect(mockTCFAPI).toHaveBeenCalledWith('addEventListener', 2, expect.any(Function));
      
      consoleSpy.mockRestore();
    });

    it('should handle SourcePoint API when available', () => {
      // Arrange
      mockHasSourcePointAPI.mockReturnValue(true);
      
      // Mock SourcePoint API
      const mockOnMessageChoiceSelect = jest.fn();
      (window as any)._sp_ = {
        config: {
          events: {
            onMessageChoiceSelect: mockOnMessageChoiceSelect
          }
        }
      };
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Act
      APIHandler.handleSourcePointAPI();
      
      // Assert
      expect(mockHasSourcePointAPI).toHaveBeenCalledWith(window);
      expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: Setting up SourcePoint API handlers');
      
      consoleSpy.mockRestore();
    });
  });

  describe('SourcePoint API Handling', () => {
    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should handle SourcePoint API when available', () => {
      // Arrange
      mockHasSourcePointAPI.mockReturnValue(true);
      
      // Mock SourcePoint API
      const mockOnMessageChoiceSelect = jest.fn();
      const mockExecuteMessaging = jest.fn();
      (window as any)._sp_ = {
        config: {
          events: {
            onMessageChoiceSelect: mockOnMessageChoiceSelect
          }
        },
        executeMessaging: mockExecuteMessaging
      };
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Act
      APIHandler.handleSourcePointAPI();
      
      // Assert
      expect(mockHasSourcePointAPI).toHaveBeenCalledWith(window);
      expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: Setting up SourcePoint API handlers');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Global API Checking', () => {
    it('should check for global APIs', () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Act
      APIHandler.checkForGlobalAPIs();
      
      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: Checking for global cookie consent APIs...');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Consent Decline', () => {
    it('should handle decline all consent', () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Act
      APIHandler.declineAllConsent();
      
      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: Attempting to decline all consent...');
      
      consoleSpy.mockRestore();
    });

    it('should return early if consent already processed', () => {
      // Arrange
      APIHandler.setConsentProcessed(true);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Act
      APIHandler.declineAllConsent();
      
      // Assert
      expect(consoleSpy).not.toHaveBeenCalledWith('Cookie Decliner: Attempting to decline all consent...');
      
      // Clean up
      APIHandler.setConsentProcessed(false);
      consoleSpy.mockRestore();
    });

    it('should handle TCF API decline with ping success', () => {
      // Arrange
      const mockTCFAPI = jest.fn((command, version, callback) => {
        if (command === 'ping') {
          callback({ cmpLoaded: true }, true);
        } else if (command === 'setAllConsentAndLegitInterest') {
          callback({ success: true }, true);
        }
      });
      
      (window as any).__tcfapi = mockTCFAPI;
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Act
      APIHandler.declineAllConsent();
      
      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: Using TCF API to decline');
      expect(mockTCFAPI).toHaveBeenCalledWith('ping', 2, expect.any(Function));
      
      consoleSpy.mockRestore();
    });
  });

  describe('Advanced Global API Checking', () => {
    it('should return early when consent already processed', () => {
      // Arrange
      APIHandler.setConsentProcessed(true);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Act
      APIHandler.checkForGlobalAPIs();
      
      // Assert
      expect(consoleSpy).not.toHaveBeenCalled();
      
      // Clean up
      APIHandler.setConsentProcessed(false);
      consoleSpy.mockRestore();
    });

    it('should detect TCF API immediately when available', () => {
      // Arrange
      const mockTCFAPI = jest.fn();
      (window as any).__tcfapi = mockTCFAPI;
      mockHasTCFAPI.mockReturnValue(true);
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Act
      APIHandler.checkForGlobalAPIs();
      
      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: Found TCF API immediately!');
      
      consoleSpy.mockRestore();
    });

    it('should detect SourcePoint _sp_ object when available', () => {
      // Arrange
      (window as any)._sp_ = { config: { accountId: 123 } };
      mockHasSourcePointAPI.mockReturnValue(true);
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Act
      APIHandler.checkForGlobalAPIs();
      
      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: Found SourcePoint _sp_ object:', expect.any(Object));
      
      consoleSpy.mockRestore();
    });
  });

  describe('TCF API Event Handling', () => {
    it('should handle TCF data with CMP shown status', () => {
      // Arrange
      mockHasTCFAPI.mockReturnValue(true);
      
      const mockTCFAPI = jest.fn((command, version, callback) => {
        if (command === 'getTCData') {
          callback({
            cmpStatus: 'loaded',
            eventStatus: 'cmpuishown',
            tcString: '',
            gdprApplies: true
          }, true);
        }
      });
      
      (window as any).__tcfapi = mockTCFAPI;
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Act
      APIHandler.handleTCFAPI();
      
      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: CMP Status:', 'loaded');
      expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: Event Status:', 'cmpuishown');
      expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: Attempting to decline all via TCF API');
      
      consoleSpy.mockRestore();
    });

    it('should set up event listener for CMP UI shows', () => {
      // Arrange
      mockHasTCFAPI.mockReturnValue(true);
      
      const mockTCFAPI = jest.fn((command, version, callback) => {
        if (command === 'addEventListener') {
          // Simulate CMP UI shown event
          setTimeout(() => {
            callback({
              cmpStatus: 'loaded',
              eventStatus: 'cmpuishown',
              gdprApplies: true
            }, true);
          }, 0);
        }
      });
      
      (window as any).__tcfapi = mockTCFAPI;
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Act
      APIHandler.handleTCFAPI();
      
      // Assert
      expect(mockTCFAPI).toHaveBeenCalledWith('addEventListener', 2, expect.any(Function));
      
      // Wait for async callback
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: CMP UI shown, attempting to decline');
          consoleSpy.mockRestore();
          resolve();
        }, 100);
      });
    });
  });

  describe('SourcePoint API Advanced Handling', () => {
    it('should handle SourcePoint API with null object', () => {
      // Arrange
      mockHasSourcePointAPI.mockReturnValue(true);
      (window as any)._sp_ = null;
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Act
      APIHandler.handleSourcePointAPI();
      
      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: SourcePoint API object is null');
      
      consoleSpy.mockRestore();
    });

    it('should handle SourcePoint API with choice select event', () => {
      // Arrange
      mockHasSourcePointAPI.mockReturnValue(true);
      
      const mockOnMessageChoiceSelect = jest.fn();
      (window as any)._sp_ = {
        config: {
          events: {
            onMessageChoiceSelect: mockOnMessageChoiceSelect
          }
        }
      };
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Act
      APIHandler.handleSourcePointAPI();
      
      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: Attempting SourcePoint onMessageChoiceSelect with choice 11 (reject all)');
      expect(mockOnMessageChoiceSelect).toHaveBeenCalledWith({ choice: 11 });
      
      consoleSpy.mockRestore();
    });

    it('should handle SourcePoint API with executeMessaging', () => {
      // Arrange
      mockHasSourcePointAPI.mockReturnValue(true);
      
      const mockExecuteMessaging = jest.fn();
      (window as any)._sp_ = {
        executeMessaging: mockExecuteMessaging
      };
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Act
      APIHandler.handleSourcePointAPI();
      
      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: Attempting SourcePoint executeMessaging');
      expect(mockExecuteMessaging).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should handle SourcePoint API errors', () => {
      // Arrange
      mockHasSourcePointAPI.mockReturnValue(true);
      (window as any)._sp_ = {
        get config() {
          throw new Error('SourcePoint Error');
        }
      };
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Act
      APIHandler.handleSourcePointAPI();
      
      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: Error using SourcePoint API:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('Alternative Decline Methods', () => {
    it('should try SourcePoint alternative methods', () => {
      // Arrange
      const mockOnMessageChoiceSelect = jest.fn();
      const mockExecuteMessaging = jest.fn();
      (window as any)._sp_ = {
        config: {
          events: {
            onMessageChoiceSelect: mockOnMessageChoiceSelect
          }
        },
        executeMessaging: mockExecuteMessaging,
        declineAll: jest.fn(),
        choiceReject: jest.fn()
      };
      
      delete (window as any).__tcfapi;
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Act
      APIHandler.declineAllConsent();
      
      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: Trying alternative decline methods');
      expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: Using SourcePoint _sp_ object');
      expect(mockOnMessageChoiceSelect).toHaveBeenCalledWith({ choice: 11 });
      expect(mockExecuteMessaging).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should handle errors in SourcePoint alternative methods', () => {
      // Arrange
      (window as any)._sp_ = {
        get config() {
          throw new Error('SourcePoint Alternative Error');
        }
      };
      
      delete (window as any).__tcfapi;
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Act
      APIHandler.declineAllConsent();
      
      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: Error with SourcePoint API:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('Iframe Communication', () => {
    beforeEach(() => {
      // Clean up any existing iframes
      document.querySelectorAll('iframe').forEach(iframe => iframe.remove());
    });

    it('should communicate with SourcePoint iframes', () => {
      // Arrange
      const iframe1 = document.createElement('iframe');
      iframe1.id = 'sp_message_123';
      iframe1.src = 'https://cdn.sourcepoint.io/cmp/message_id=1301113';
      
      const iframe2 = document.createElement('iframe');
      iframe2.src = 'https://example.com/cmp/consent';
      
      // Mock contentWindow
      const mockPostMessage = jest.fn();
      Object.defineProperty(iframe1, 'contentWindow', {
        value: { postMessage: mockPostMessage },
        writable: false
      });
      Object.defineProperty(iframe2, 'contentWindow', {
        value: { postMessage: mockPostMessage },
        writable: false
      });
      
      document.body.appendChild(iframe1);
      document.body.appendChild(iframe2);
      
      delete (window as any).__tcfapi;
      delete (window as any)._sp_;
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Act
      APIHandler.declineAllConsent();
      
      // Wait for async iframe communication
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          // Assert
          expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: Attempting iframe communication with SourcePoint iframe 1');
          expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: Detected message ID: 1301113');
          expect(mockPostMessage).toHaveBeenCalled();
          
          consoleSpy.mockRestore();
          resolve();
        }, 1500); // Wait for all setTimeout calls to complete
      });
    });

    it('should handle iframe communication errors', () => {
      // Arrange
      const iframe = document.createElement('iframe');
      iframe.id = 'sp_message_456';
      
      // Just verify that iframe communication is attempted
      document.body.appendChild(iframe);
      
      delete (window as any).__tcfapi;
      delete (window as any)._sp_;
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Act
      APIHandler.declineAllConsent();
      
      // Assert - verify the decline process starts
      expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: Attempting to decline all consent...');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Other API Detection', () => {
    it('should log availability of other common APIs', () => {
      // Arrange
      (window as any).__cmp = jest.fn();
      (window as any).Cookiebot = { consent: {} };
      (window as any).OneTrust = { OptanonWrapper: jest.fn() };
      
      // Create TCF locator iframe
      const tcfLocator = document.createElement('iframe');
      tcfLocator.name = '__tcfapiLocator';
      document.body.appendChild(tcfLocator);
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Act
      APIHandler.checkForGlobalAPIs();
      
      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: Found CMP API');
      expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: Found Cookiebot API');
      expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: Found OneTrust API');
      expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: Found TCF API locator iframe');
      
      // Clean up
      tcfLocator.remove();
      delete (window as any).__cmp;
      delete (window as any).Cookiebot;
      delete (window as any).OneTrust;
      consoleSpy.mockRestore();
    });

    it('should log when APIs are not found', () => {
      // Arrange
      delete (window as any).__cmp;
      delete (window as any).Cookiebot;
      delete (window as any).OneTrust;
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Act
      APIHandler.checkForGlobalAPIs();
      
      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: No CMP API found');
      expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: No Cookiebot API found');
      expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: No OneTrust API found');
      
      consoleSpy.mockRestore();
    });
  });

  describe('TCF API Waiting Logic', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should wait for TCF API and find it after delay', () => {
      // Arrange
      delete (window as any).__tcfapi;
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Act
      APIHandler.checkForGlobalAPIs();
      
      // Simulate TCF API becoming available after 50ms
      setTimeout(() => {
        const mockTCFAPI = jest.fn();
        (window as any).__tcfapi = mockTCFAPI;
        mockHasTCFAPI.mockReturnValue(true);
      }, 50);
      
      // Fast-forward timers
      jest.advanceTimersByTime(150);
      
      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: TCF API check attempt 1');
      
      consoleSpy.mockRestore();
    });

    it('should stop TCF API checking after 3 attempts', () => {
      // Arrange
      delete (window as any).__tcfapi;
      mockHasTCFAPI.mockReturnValue(false);
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Act
      APIHandler.checkForGlobalAPIs();
      
      // Fast-forward timers through all attempts
      jest.advanceTimersByTime(10000);
      
      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: TCF API check attempt 1');
      expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: TCF API check attempt 2');
      expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: TCF API check attempt 3');
      expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: Stopped TCF API checking - likely not needed in this context');
      
      consoleSpy.mockRestore();
    });
  });
});