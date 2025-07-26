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

describe('API Handler', () => {
  beforeEach(() => {
    // Reset window properties
    delete (window as any).__tcfapi;
    delete (window as any)._sp_;
    
    // Reset mocks
    mockHasTCFAPI.mockReset();
    mockHasSourcePointAPI.mockReset();
    
    // Reset console.log mock
    jest.clearAllMocks();
  });

  describe('TCF API Handling', () => {
    test('should return early when TCF API is not available', () => {
      mockHasTCFAPI.mockReturnValue(false);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      APIHandler.handleTCFAPI();
      
      expect(mockHasTCFAPI).toHaveBeenCalledWith(window);
      expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: TCF API not available');
      
      consoleSpy.mockRestore();
    });

    test('should handle TCF API when available', () => {
      mockHasTCFAPI.mockReturnValue(true);
      
      // Mock the TCF API
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
      
      APIHandler.handleTCFAPI();
      
      expect(mockHasTCFAPI).toHaveBeenCalledWith(window);
      expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: Setting up TCF API handlers');
      expect(mockTCFAPI).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    test('should handle TCF API errors gracefully', () => {
      mockHasTCFAPI.mockReturnValue(true);
      
      // Mock TCF API that throws an error
      (window as any).__tcfapi = jest.fn(() => {
        throw new Error('TCF API Error');
      });
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      expect(() => APIHandler.handleTCFAPI()).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: Error using TCF API:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('SourcePoint API Handling', () => {
    test('should return early when SourcePoint API is not available', () => {
      mockHasSourcePointAPI.mockReturnValue(false);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      APIHandler.handleSourcePointAPI();
      
      expect(mockHasSourcePointAPI).toHaveBeenCalledWith(window);
      expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: SourcePoint API not available');
      
      consoleSpy.mockRestore();
    });

    test('should handle SourcePoint API when available', () => {
      mockHasSourcePointAPI.mockReturnValue(true);
      
      // Mock SourcePoint API
      const mockExecuteOnReady = jest.fn(callback => callback());
      (window as any)._sp_ = {
        config: { accountId: 123 },
        executeOnReady: mockExecuteOnReady
      };
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      APIHandler.handleSourcePointAPI();
      
      expect(mockHasSourcePointAPI).toHaveBeenCalledWith(window);
      expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: Setting up SourcePoint API handlers');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Global API Checking', () => {
    test('should check for global APIs', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      APIHandler.checkForGlobalAPIs();
      
      expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: Checking for global cookie consent APIs...');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Consent Decline', () => {
    test('should handle decline all consent', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      APIHandler.declineAllConsent();
      
      expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: Attempting to decline all consent...');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Consent State Management', () => {
    test('should track consent processing state', () => {
      expect(APIHandler.isConsentProcessed()).toBe(false);
      
      APIHandler.setConsentProcessed(true);
      expect(APIHandler.isConsentProcessed()).toBe(true);
      
      APIHandler.setConsentProcessed(false);
      expect(APIHandler.isConsentProcessed()).toBe(false);
    });
  });
});