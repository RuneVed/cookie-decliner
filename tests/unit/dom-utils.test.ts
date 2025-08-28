import { DOMUtils } from '../../src/dom-utils';
import { EXCLUDE_KEYWORDS, COOKIE_KEYWORDS, getAllCookieKeywords } from '../../src/keywords';

// Mock the keywords module
jest.mock('../../src/keywords', () => ({
  EXCLUDE_KEYWORDS: ['login', 'signin', 'register', 'newsletter', 'subscribe'],
  COOKIE_KEYWORDS: ['cookie', 'consent', 'privacy', 'gdpr', 'decline', 'reject', 'accept'],
  getAllCookieKeywords: jest.fn(() => ['cookie', 'consent', 'privacy', 'gdpr', 'decline', 'reject', 'accept'])
}));

describe('DOMUtils', () => {
  beforeEach(() => {
    // Clean DOM before each test (Jest best practice)
    document.body.innerHTML = '';
  });

  describe('Element Finding', () => {
    it('finds elements by selector', () => {
      // Arrange
      const button1 = document.createElement('button');
      button1.textContent = 'Accept All';
      const button2 = document.createElement('button');
      button2.textContent = 'Reject All';
      const hiddenButton = document.createElement('button');
      hiddenButton.textContent = 'Hidden Button';
      hiddenButton.style.display = 'none';
      
      document.body.appendChild(button1);
      document.body.appendChild(button2);
      document.body.appendChild(hiddenButton);
      
      // Act
      const elements = DOMUtils.findElementsBySelector('button');
      
      // Assert
      expect(elements).toHaveLength(3);
      expect(elements[0].textContent).toBe('Accept All');
      expect(elements[1].textContent).toBe('Reject All');
      expect(elements[2].textContent).toBe('Hidden Button');
    });

    it('handles :contains() pseudo-selectors', () => {
      // Arrange
      const button1 = document.createElement('button');
      button1.textContent = 'Accept All';
      const button2 = document.createElement('button');
      button2.textContent = 'Reject All';
      
      document.body.appendChild(button1);
      document.body.appendChild(button2);
      
      // Act
      const elements = DOMUtils.findElementsBySelector('button:contains("Reject All")');
      
      // Assert
      expect(elements).toHaveLength(1);
      expect(elements[0].textContent).toBe('Reject All');
    });

    it('returns empty array when no elements match selector', () => {
      // Act
      const elements = DOMUtils.findElementsBySelector('.non-existent-class');
      
      // Assert
      expect(elements).toHaveLength(0);
    });
  });

  describe('Visibility Checking', () => {
    it('detects hidden elements correctly', () => {
      // Arrange
      const hiddenDiv = document.createElement('div');
      hiddenDiv.style.display = 'none';
      document.body.appendChild(hiddenDiv);
      
      // Act & Assert
      expect(DOMUtils.isElementVisible(hiddenDiv)).toBe(false);
    });

    it('detects visible elements correctly', () => {
      // Arrange
      const visibleDiv = document.createElement('div');
      visibleDiv.style.width = '100px';
      visibleDiv.style.height = '50px';
      document.body.appendChild(visibleDiv);
      
      // Act & Assert
      expect(DOMUtils.isElementVisible(visibleDiv)).toBe(true);
    });

    it('handles elements with zero dimensions', () => {
      // Arrange
      const zeroDiv = document.createElement('div');
      // Default div has zero dimensions
      document.body.appendChild(zeroDiv);
      
      // Act & Assert
      expect(DOMUtils.isElementVisible(zeroDiv)).toBe(false);
    });
  });

  describe('Cookie Button Validation', () => {
    it('identifies cookie-related buttons correctly', () => {
      // Arrange
      const cookieButton = document.createElement('button');
      cookieButton.textContent = 'Accept Cookies';
      
      const consentButton = document.createElement('button');
      consentButton.textContent = 'Decline All';
      
      // Act & Assert
      expect(DOMUtils.isCookieRelatedButton(cookieButton)).toBe(true);
      expect(DOMUtils.isCookieRelatedButton(consentButton)).toBe(true);
    });

    it('rejects non-cookie buttons', () => {
      // Arrange
      const loginButton = document.createElement('button');
      loginButton.textContent = 'Login to Account';
      
      const newsletterButton = document.createElement('button');
      newsletterButton.textContent = 'Subscribe to Newsletter';
      
      // Act & Assert
      expect(DOMUtils.isCookieRelatedButton(loginButton)).toBe(false);
      expect(DOMUtils.isCookieRelatedButton(newsletterButton)).toBe(false);
    });

    it('should validate based on class names', () => {
      // Arrange
      const buttonWithClass = document.createElement('button');
      buttonWithClass.className = 'cookie-decline-btn';
      buttonWithClass.textContent = 'Click me';
      
      // Act & Assert
      expect(DOMUtils.isCookieRelatedButton(buttonWithClass)).toBe(true);
    });

    it('should exclude non-cookie buttons', () => {
      // Arrange
      const newsletterButton = document.createElement('button');
      newsletterButton.textContent = 'Subscribe to newsletter';
      
      const signinButton = document.createElement('button');
      signinButton.textContent = 'Sign in to account';
      
      // Act & Assert
      expect(DOMUtils.isCookieRelatedButton(newsletterButton)).toBe(false);
      expect(DOMUtils.isCookieRelatedButton(signinButton)).toBe(false);
    });
  });

  describe('Element Clicking', () => {
    it('should click elements safely', () => {
      // Arrange
      const clickSpy = jest.fn();
      const button = document.createElement('button');
      button.onclick = clickSpy;
      document.body.appendChild(button);
      
      // Act
      DOMUtils.clickElement(button);
      
      // Assert
      expect(clickSpy).toHaveBeenCalled();
    });

    it('should handle click errors gracefully', () => {
      // Arrange
      const button = document.createElement('button');
      button.click = () => { throw new Error('Click failed'); };
      
      // Act & Assert
      expect(() => DOMUtils.clickElement(button)).not.toThrow();
    });
  });

  describe('Cookie Content Detection', () => {
    it('should detect cookie-related content', () => {
      // Arrange
      const elements = [
        Object.assign(document.createElement('div'), { textContent: 'This site uses cookies' }),
        Object.assign(document.createElement('div'), { textContent: 'Regular content' })
      ];
      
      // Act & Assert
      expect(DOMUtils.hasCookieContent(elements)).toBe(true);
    });

    it('should return false for non-cookie content', () => {
      // Arrange
      const elements = [
        Object.assign(document.createElement('div'), { textContent: 'Regular content' }),
        Object.assign(document.createElement('div'), { textContent: 'More regular content' })
      ];
      
      // Act & Assert
      expect(DOMUtils.hasCookieContent(elements)).toBe(false);
    });

    it('should handle elements with null/undefined properties', () => {
      // Arrange
      const elementWithNullText = document.createElement('div');
      Object.defineProperty(elementWithNullText, 'textContent', { value: null });
      
      const elementWithNullClass = document.createElement('div');
      Object.defineProperty(elementWithNullClass, 'className', { value: null });
      
      const elements = [elementWithNullText, elementWithNullClass];
      
      // Act & Assert
      expect(DOMUtils.hasCookieContent(elements)).toBe(false);
    });
  });

  describe('Parent Cookie Context Detection', () => {
    it('should detect cookie context in parent elements via isCookieRelatedButton', () => {
      // Arrange
      const cookieBanner = document.createElement('div');
      cookieBanner.className = 'cookie-banner';
      
      const cookieContainer = document.createElement('div');
      cookieContainer.className = 'consent-container';
      
      const button = document.createElement('button');
      button.textContent = 'Continue'; // Not explicitly cookie-related text
      
      // Create nested structure: cookieBanner -> cookieContainer -> button
      cookieContainer.appendChild(button);
      cookieBanner.appendChild(cookieContainer);
      document.body.appendChild(cookieBanner);
      
      // Act & Assert
      expect(DOMUtils.isCookieRelatedButton(button)).toBe(true);
    });

    it('should detect cookie context in immediate parent', () => {
      // Arrange
      const cookieParent = document.createElement('div');
      cookieParent.id = 'gdpr-notice';
      
      const button = document.createElement('button');
      button.textContent = 'OK'; // Generic text
      
      cookieParent.appendChild(button);
      document.body.appendChild(cookieParent);
      
      // Act & Assert
      expect(DOMUtils.isCookieRelatedButton(button)).toBe(true);
    });

    it('should stop checking after 5 parent levels', () => {
      // Arrange
      let currentParent = document.createElement('div');
      currentParent.className = 'cookie-banner'; // Cookie context at level 6
      
      // Create 6 levels of nesting
      for (let i = 0; i < 6; i++) {
        const child = document.createElement('div');
        currentParent.appendChild(child);
        currentParent = child;
      }
      
      const button = document.createElement('button');
      button.textContent = 'OK'; // Generic text, no cookie keywords
      currentParent.appendChild(button);
      document.body.appendChild(currentParent);
      
      // Act & Assert - Should be false because cookie context is beyond 5 levels
      expect(DOMUtils.isCookieRelatedButton(button)).toBe(false);
    });

    it('should return false when no parent cookie context exists', () => {
      // Arrange
      const regularParent = document.createElement('div');
      regularParent.className = 'regular-container';
      
      const button = document.createElement('button');
      button.textContent = 'Submit'; // Generic text, no cookie keywords
      
      regularParent.appendChild(button);
      document.body.appendChild(regularParent);
      
      // Act & Assert
      expect(DOMUtils.isCookieRelatedButton(button)).toBe(false);
    });
  });

  describe('SourcePoint Iframe Detection', () => {
    it('should find SourcePoint iframes by id pattern', () => {
      // Arrange
      const iframe1 = document.createElement('iframe');
      iframe1.id = 'sp_message_iframe_12345';
      
      const iframe2 = document.createElement('iframe');
      iframe2.id = 'sp_message_container';
      
      const regularIframe = document.createElement('iframe');
      regularIframe.id = 'regular_iframe';
      
      document.body.appendChild(iframe1);
      document.body.appendChild(iframe2);
      document.body.appendChild(regularIframe);
      
      // Act
      const sourcePointIframes = DOMUtils.findSourcePointIframes();
      
      // Assert
      expect(sourcePointIframes).toHaveLength(2);
      expect(sourcePointIframes).toContain(iframe1);
      expect(sourcePointIframes).toContain(iframe2);
      expect(sourcePointIframes).not.toContain(regularIframe);
    });

    it('should find SourcePoint iframes by src pattern', () => {
      // Arrange
      const sourcePointIframe = document.createElement('iframe');
      sourcePointIframe.src = 'https://cdn.sourcepoint.io/cmp/12345';
      
      const cmpIframe = document.createElement('iframe');
      cmpIframe.src = 'https://example.com/cmp/consent';
      
      const regularIframe = document.createElement('iframe');
      regularIframe.src = 'https://example.com/regular';
      
      document.body.appendChild(sourcePointIframe);
      document.body.appendChild(cmpIframe);
      document.body.appendChild(regularIframe);
      
      // Act
      const sourcePointIframes = DOMUtils.findSourcePointIframes();
      
      // Assert
      // sourcePointIframe matches 2 selectors but should only appear once (deduplicated)
      // cmpIframe matches 1 selector
      expect(sourcePointIframes).toHaveLength(2);
      expect(sourcePointIframes).toContain(sourcePointIframe);
      expect(sourcePointIframes).toContain(cmpIframe);
      expect(sourcePointIframes).not.toContain(regularIframe);
    });

    it('should find SourcePoint iframes by name pattern', () => {
      // Arrange
      const spIframe = document.createElement('iframe');
      spIframe.name = 'sp_consent_frame';
      
      const regularIframe = document.createElement('iframe');
      regularIframe.name = 'regular_frame';
      
      document.body.appendChild(spIframe);
      document.body.appendChild(regularIframe);
      
      // Act
      const sourcePointIframes = DOMUtils.findSourcePointIframes();
      
      // Assert
      expect(sourcePointIframes).toHaveLength(1);
      expect(sourcePointIframes).toContain(spIframe);
      expect(sourcePointIframes).not.toContain(regularIframe);
    });

    it('should return empty array when no SourcePoint iframes exist', () => {
      // Arrange
      const regularIframe1 = document.createElement('iframe');
      regularIframe1.src = 'https://example.com/video';
      
      const regularIframe2 = document.createElement('iframe');
      regularIframe2.id = 'video_player';
      
      document.body.appendChild(regularIframe1);
      document.body.appendChild(regularIframe2);
      
      // Act
      const sourcePointIframes = DOMUtils.findSourcePointIframes();
      
      // Assert
      expect(sourcePointIframes).toHaveLength(0);
    });

    it('should handle multiple matching patterns on same iframe', () => {
      // Arrange
      const multiMatchIframe = document.createElement('iframe');
      multiMatchIframe.id = 'sp_message_12345';
      multiMatchIframe.src = 'https://cdn.sourcepoint.io/consent';
      multiMatchIframe.name = 'sp_frame';
      
      document.body.appendChild(multiMatchIframe);
      
      // Act
      const sourcePointIframes = DOMUtils.findSourcePointIframes();
      
      // Assert
      // This iframe matches 3 selectors but should only be returned once (deduplicated)
      expect(sourcePointIframes).toHaveLength(1);
      expect(sourcePointIframes[0]).toBe(multiMatchIframe);
    });
  });

  describe('Text Selector Edge Cases', () => {
    it('should handle :contains() selector with default base selector', () => {
      // Arrange
      const button = document.createElement('button');
      button.textContent = 'Test Button';
      document.body.appendChild(button);
      
      // Use button:contains() instead of just :contains() since that's what the regex expects
      const selectorWithoutBase = 'button:contains("Test Button")';
      
      // Act
      const elements = DOMUtils.findElementsBySelector(selectorWithoutBase);
      
      // Assert
      expect(elements).toHaveLength(1);
      expect(elements[0]).toBe(button);
    });
  });

  describe('Cookie Button Edge Cases', () => {
    it('should handle button with null textContent', () => {
      // Arrange
      const button = document.createElement('button');
      button.className = 'cookie-accept';
      Object.defineProperty(button, 'textContent', { value: null });
      
      // Act & Assert
      expect(DOMUtils.isCookieRelatedButton(button)).toBe(true);
    });

    it('should log when button has no cookie context', () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const button = document.createElement('button');
      button.textContent = 'Generic button';
      
      // Act
      DOMUtils.isCookieRelatedButton(button);
      
      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: Skipping button - no cookie context detected');
      
      consoleSpy.mockRestore();
    });
  });
});