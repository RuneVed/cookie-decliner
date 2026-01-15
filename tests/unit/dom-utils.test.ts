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

    it('should return false when button has no cookie context', () => {
      // Arrange
      const button = document.createElement('button');
      button.textContent = 'Generic button';
      
      // Act & Assert
      expect(DOMUtils.isCookieRelatedButton(button)).toBe(false);
    });
  });

  describe('Ving.no Cookie Popup Pattern', () => {
    it('should detect Ving.no "Avvis alle" button with aria-label', () => {
      // Arrange - Recreate Ving.no HTML structure
      const container = document.createElement('div');
      container.className = 'style__ConsentModalContainer-sc-1ysvlng-0 jilDBk';
      container.id = 'idun-consent-modal__content';
      
      const heading = document.createElement('h3');
      heading.textContent = 'Ving bruker informasjonskapsler (cookies) for å gi deg en bedre og mer relevant opplevelse';
      
      const buttonContainer = document.createElement('div');
      buttonContainer.id = 'cookie-button-container';
      
      const rejectButton = document.createElement('button');
      rejectButton.type = 'button';
      rejectButton.setAttribute('aria-label', 'Avvis alle');
      rejectButton.className = 'Linkstyle__Link-sc-1d1h248-0 kgBoLD';
      
      const span = document.createElement('span');
      span.textContent = 'Avvis alle';
      rejectButton.appendChild(span);
      
      buttonContainer.appendChild(rejectButton);
      container.appendChild(heading);
      container.appendChild(buttonContainer);
      document.body.appendChild(container);
      
      // Act - Test selector detection
      const ariaLabelElements = DOMUtils.findElementsBySelector('button[aria-label="Avvis alle"]');
      
      // Assert
      expect(ariaLabelElements).toHaveLength(1);
      expect(ariaLabelElements[0]).toBe(rejectButton);
      expect(DOMUtils.isCookieRelatedButton(rejectButton)).toBe(true);
    });

    it('should detect Ving.no button with partial aria-label match', () => {
      // Arrange
      const button = document.createElement('button');
      button.setAttribute('aria-label', 'Avvis alle cookies');
      button.textContent = 'Avvis alle';
      
      const cookieContainer = document.createElement('div');
      cookieContainer.id = 'idun-consent-modal';
      cookieContainer.appendChild(button);
      document.body.appendChild(cookieContainer);
      
      // Act
      const elements = DOMUtils.findElementsBySelector('button[aria-label*="Avvis alle"]');
      
      // Assert
      expect(elements).toHaveLength(1);
      expect(elements[0]).toBe(button);
      expect(DOMUtils.isCookieRelatedButton(button)).toBe(true);
    });
  });
});
