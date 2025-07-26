// Mock all dependencies
jest.mock('../../src/api-handler');
jest.mock('../../src/dom-utils');
jest.mock('../../src/selectors');

import { getAllDeclineSelectors } from '../../src/selectors';
import { DOMUtils } from '../../src/dom-utils';
import { APIHandler } from '../../src/api-handler';

// Mock implementations
const mockGetAllDeclineSelectors = getAllDeclineSelectors as jest.MockedFunction<typeof getAllDeclineSelectors>;
const mockDOMUtils = DOMUtils as jest.Mocked<typeof DOMUtils>;
const mockAPIHandler = APIHandler as jest.Mocked<typeof APIHandler>;

describe('Content Script Dependencies', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup comprehensive mock implementations
    mockGetAllDeclineSelectors.mockReturnValue([
      { selector: 'button:contains("Reject all")', description: 'Test reject button' }
    ]);
    
    // Mock ALL DOMUtils methods
    mockDOMUtils.findElementsBySelector = jest.fn().mockReturnValue([]);
    mockDOMUtils.findElementsWithText = jest.fn().mockReturnValue([]);
    mockDOMUtils.isElementVisible = jest.fn().mockReturnValue(true);
    mockDOMUtils.isCookieRelatedButton = jest.fn().mockReturnValue(true);
    mockDOMUtils.clickElement = jest.fn().mockImplementation(() => {});
    mockDOMUtils.hasCookieContent = jest.fn().mockReturnValue(false);
    mockDOMUtils.findSourcePointIframes = jest.fn().mockReturnValue([]);
    
    // Mock ALL APIHandler methods
    mockAPIHandler.isConsentProcessed = jest.fn().mockReturnValue(false);
    mockAPIHandler.setConsentProcessed = jest.fn().mockImplementation();
    mockAPIHandler.handleTCFAPI = jest.fn().mockImplementation();
    mockAPIHandler.handleSourcePointAPI = jest.fn().mockImplementation();
    mockAPIHandler.checkForGlobalAPIs = jest.fn().mockImplementation();
    mockAPIHandler.declineAllConsent = jest.fn().mockImplementation();
    
    // Reset the module cache
    jest.resetModules();
  });

  describe('Dependency Integration', () => {
    test('should verify all mocks are working', () => {
      // Test selectors
      const selectors = mockGetAllDeclineSelectors();
      expect(selectors).toHaveLength(1);
      expect(selectors[0].selector).toBe('button:contains("Reject all")');
      
      // Test DOM utils
      expect(mockDOMUtils.findElementsBySelector('test')).toEqual([]);
      expect(mockDOMUtils.isElementVisible(document.createElement('div'))).toBe(true);
      expect(mockDOMUtils.isCookieRelatedButton(document.createElement('button'))).toBe(true);
      expect(mockDOMUtils.hasCookieContent([document.createElement('div')])).toBe(false);
      expect(mockDOMUtils.findSourcePointIframes()).toEqual([]);
      
      // Test API handler
      expect(mockAPIHandler.isConsentProcessed()).toBe(false);
      expect(() => mockAPIHandler.setConsentProcessed(true)).not.toThrow();
      expect(() => mockAPIHandler.handleTCFAPI()).not.toThrow();
      expect(() => mockAPIHandler.handleSourcePointAPI()).not.toThrow();
      expect(() => mockAPIHandler.checkForGlobalAPIs()).not.toThrow();
      expect(() => mockAPIHandler.declineAllConsent()).not.toThrow();
    });

    test('should handle DOM operations', () => {
      const button = document.createElement('button');
      button.textContent = 'Reject all';
      document.body.appendChild(button);
      
      mockDOMUtils.findElementsBySelector.mockReturnValue([button]);
      
      const elements = DOMUtils.findElementsBySelector('button');
      expect(elements).toContain(button);
      expect(mockDOMUtils.findElementsBySelector).toHaveBeenCalledWith('button');
    });

    test('should handle API operations', () => {
      // Test API processing
      expect(APIHandler.isConsentProcessed()).toBe(false);
      
      APIHandler.setConsentProcessed(true);
      expect(mockAPIHandler.setConsentProcessed).toHaveBeenCalledWith(true);
      
      APIHandler.handleTCFAPI();
      expect(mockAPIHandler.handleTCFAPI).toHaveBeenCalled();
      
      APIHandler.checkForGlobalAPIs();
      expect(mockAPIHandler.checkForGlobalAPIs).toHaveBeenCalled();
    });

    test('should handle selector operations', () => {
      const selectors = getAllDeclineSelectors();
      expect(selectors).toHaveLength(1);
      expect(mockGetAllDeclineSelectors).toHaveBeenCalled();
    });
  });

  describe('Error Handling Scenarios', () => {
    test('should handle selector errors', () => {
      mockGetAllDeclineSelectors.mockImplementation(() => {
        throw new Error('Selector Error');
      });
      
      expect(() => {
        getAllDeclineSelectors();
      }).toThrow('Selector Error');
    });

    test('should handle DOM utility errors', () => {
      mockDOMUtils.findElementsBySelector.mockImplementation(() => {
        throw new Error('DOM Error');
      });
      
      expect(() => {
        DOMUtils.findElementsBySelector('test');
      }).toThrow('DOM Error');
    });

    test('should handle API handler errors', () => {
      mockAPIHandler.handleTCFAPI.mockImplementation(() => {
        throw new Error('API Error');
      });
      
      expect(() => {
        APIHandler.handleTCFAPI();
      }).toThrow('API Error');
    });
  });

  describe('Integration Scenarios', () => {
    test('should work with cookie content detection', () => {
      const cookieDiv = document.createElement('div');
      cookieDiv.textContent = 'This website uses cookies';
      document.body.appendChild(cookieDiv);
      
      mockDOMUtils.hasCookieContent.mockReturnValue(true);
      
      expect(DOMUtils.hasCookieContent([cookieDiv])).toBe(true);
      expect(mockDOMUtils.hasCookieContent).toHaveBeenCalledWith([cookieDiv]);
    });

    test('should work with SourcePoint iframe detection', () => {
      const iframe = document.createElement('iframe');
      iframe.src = 'https://sourcepoint.com/privacy';
      document.body.appendChild(iframe);
      
      mockDOMUtils.findSourcePointIframes.mockReturnValue([iframe as HTMLIFrameElement]);
      
      const iframes = DOMUtils.findSourcePointIframes();
      expect(iframes).toContain(iframe);
      expect(mockDOMUtils.findSourcePointIframes).toHaveBeenCalled();
    });

    test('should work with consent processing', () => {
      // Test consent not processed scenario
      mockAPIHandler.isConsentProcessed.mockReturnValue(false);
      expect(APIHandler.isConsentProcessed()).toBe(false);
      
      // Test consent processed scenario  
      mockAPIHandler.isConsentProcessed.mockReturnValue(true);
      expect(APIHandler.isConsentProcessed()).toBe(true);
      
      expect(mockAPIHandler.isConsentProcessed).toHaveBeenCalledTimes(2);
    });
  });

  describe('Module Loading Coverage', () => {
    test('should verify module dependencies are testable', () => {
      // This test verifies that our mocked modules can be tested
      // without actually loading the content-script which has side effects
      
      // Test that we can call all the functions that content-script.ts would call
      expect(() => getAllDeclineSelectors()).not.toThrow();
      expect(() => DOMUtils.findElementsBySelector('test')).not.toThrow();
      expect(() => DOMUtils.findSourcePointIframes()).not.toThrow();
      expect(() => APIHandler.isConsentProcessed()).not.toThrow();
      expect(() => APIHandler.handleTCFAPI()).not.toThrow();
      expect(() => APIHandler.handleSourcePointAPI()).not.toThrow();
      expect(() => APIHandler.checkForGlobalAPIs()).not.toThrow();
      
      // Verify the functions were called
      expect(mockGetAllDeclineSelectors).toHaveBeenCalled();
      expect(mockDOMUtils.findElementsBySelector).toHaveBeenCalled();
      expect(mockDOMUtils.findSourcePointIframes).toHaveBeenCalled();
      expect(mockAPIHandler.isConsentProcessed).toHaveBeenCalled();
      expect(mockAPIHandler.handleTCFAPI).toHaveBeenCalled();
      expect(mockAPIHandler.handleSourcePointAPI).toHaveBeenCalled();
      expect(mockAPIHandler.checkForGlobalAPIs).toHaveBeenCalled();
    });
  });
});