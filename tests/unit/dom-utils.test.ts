import { DOMUtils } from '../../src/dom-utils';

describe('DOMUtils', () => {
  beforeEach(() => {
    // Clean DOM before each test (Jest best practice)
    document.body.innerHTML = '';
  });

  describe('Element Finding', () => {
    it('finds elements by selector', () => {
      // Arrange
      document.body.innerHTML = `
        <button>Accept All</button>
        <button>Reject All</button>
        <button style="display: none;">Hidden Button</button>
      `;
      
      // Act
      const elements = DOMUtils.findElementsBySelector('button');
      
      // Assert
      expect(elements).toHaveLength(3);
      expect(elements[0]).toHaveTextContent('Accept All');
      expect(elements[1]).toHaveTextContent('Reject All');
      expect(elements[2]).toHaveTextContent('Hidden Button');
    });

    it('handles :contains() pseudo-selectors', () => {
      // Arrange
      document.body.innerHTML = `
        <button>Accept All</button>
        <button>Reject All</button>
        <button>Save Settings</button>
      `;
      
      // Act
      const elements = DOMUtils.findElementsWithText('button:contains("Reject")');
      
      // Assert
      expect(elements).toHaveLength(1);
      expect(elements[0]).toHaveTextContent('Reject All');
    });

    it('returns empty array when no elements match selector', () => {
      // Arrange
      document.body.innerHTML = '<div>No buttons here</div>';
      
      // Act
      const elements = DOMUtils.findElementsBySelector('button');
      
      // Assert
      expect(elements).toEqual([]);
    });
  });

  describe('Visibility Checking', () => {
    it('detects hidden elements correctly', () => {
      // Arrange
      const hiddenElement = document.createElement('button');
      hiddenElement.style.display = 'none';
      document.body.appendChild(hiddenElement);
      
      // Act & Assert
      expect(DOMUtils.isElementVisible(hiddenElement)).toBe(false);
    });

    it('detects visible elements correctly', () => {
      // Arrange
      const visibleElement = document.createElement('button');
      visibleElement.textContent = 'Visible';
      visibleElement.style.width = '100px';
      visibleElement.style.height = '30px';
      document.body.appendChild(visibleElement);
      
      // Mock getBoundingClientRect for consistent testing
      visibleElement.getBoundingClientRect = jest.fn(() => ({
        width: 100,
        height: 30,
        top: 0,
        left: 0,
        bottom: 30,
        right: 100,
        x: 0,
        y: 0,
        toJSON: jest.fn()
      }));
      
      // Act & Assert
      expect(DOMUtils.isElementVisible(visibleElement)).toBe(true);
    });

    it('handles elements with zero dimensions', () => {
      // Arrange
      const zeroSizeElement = document.createElement('button');
      document.body.appendChild(zeroSizeElement);
      
      zeroSizeElement.getBoundingClientRect = jest.fn(() => ({
        width: 0,
        height: 0,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        x: 0,
        y: 0,
        toJSON: jest.fn()
      }));
      
      // Act & Assert
      expect(DOMUtils.isElementVisible(zeroSizeElement)).toBe(false);
    });
  });

  describe('Cookie Button Validation', () => {
    it('identifies cookie-related buttons correctly', () => {
      // Arrange
      const cookieButton = document.createElement('button');
      cookieButton.textContent = 'Reject all cookies';
      
      // Act & Assert
      expect(DOMUtils.isCookieRelatedButton(cookieButton)).toBe(true);
    });

    it('rejects non-cookie buttons', () => {
      // Arrange
      const loginButton = document.createElement('button');
      loginButton.textContent = 'Login';
      
      // Act & Assert
      expect(DOMUtils.isCookieRelatedButton(loginButton)).toBe(false);
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
  });
});