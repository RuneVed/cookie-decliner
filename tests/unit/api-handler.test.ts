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
    // Clean window properties
    delete (window as any).__tcfapi;
    delete (window as any)._sp_;
    
    // Reset mocks
    mockHasTCFAPI.mockReset();
    mockHasSourcePointAPI.mockReset();
  });

  afterEach(() => {
    // Clean up spies
    if (consoleSpy) {
      consoleSpy.mockRestore();
    }
  });

  describe('TCF API Handling', () => {
    it('returns early when TCF API is not available', () => {
      // Arrange
      mockHasTCFAPI.mockReturnValue(false);
      consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Act
      APIHandler.handleTCFAPI();
      
      // Assert
      expect(mockHasTCFAPI).toHaveBeenCalledWith(window);
      expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: TCF API not available');
    });

    it('handles TCF API when available', () => {
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
      consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Act
      APIHandler.handleTCFAPI();
      
      // Assert
      expect(mockHasTCFAPI).toHaveBeenCalledWith(window);
      expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: Setting up TCF API handlers');
      expect(mockTCFAPI).toHaveBeenCalled();
    });

    it('handles TCF API errors gracefully', () => {
      // Arrange
      mockHasTCFAPI.mockReturnValue(true);
      
      (window as any).__tcfapi = jest.fn(() => {
        throw new Error('TCF API Error');
      });
      
      consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Act & Assert
      expect(() => APIHandler.handleTCFAPI()).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: Error using TCF API:', expect.any(Error));
    });
  });

  describe('SourcePoint API Handling', () => {
    it('returns early when SourcePoint API is not available', () => {
      // Arrange
      mockHasSourcePointAPI.mockReturnValue(false);
      consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Act
      APIHandler.handleSourcePointAPI();
      
      // Assert
      expect(mockHasSourcePointAPI).toHaveBeenCalledWith(window);
      expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: SourcePoint API not available');
      
      consoleSpy.mockRestore();
    });

    it('should handle SourcePoint API when available', () => {
      // Arrange
      mockHasSourcePointAPI.mockReturnValue(true);
      
      // Mock SourcePoint API
      const mockExecuteOnReady = jest.fn(callback => callback());
      (window as any)._sp_ = {
        config: { accountId: 123 },
        executeOnReady: mockExecuteOnReady
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
  });

  describe('Consent State Management', () => {
    it('should track consent processing state', () => {
      // Arrange & Act
      expect(APIHandler.isConsentProcessed()).toBe(false);
      
      APIHandler.setConsentProcessed(true);
      expect(APIHandler.isConsentProcessed()).toBe(true);
      
      APIHandler.setConsentProcessed(false);
      
      // Assert
      expect(APIHandler.isConsentProcessed()).toBe(false);
    });
  });
});