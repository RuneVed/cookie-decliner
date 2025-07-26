import { DOMUtils } from '../../src/dom-utils';

describe('DOM Utils', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('Element Finding', () => {
    test('should find elements by selector', () => {
      document.body.innerHTML = `
        <button>Accept All</button>
        <button>Reject All</button>
        <button style="display: none;">Hidden Button</button>
      `;
      
      const elements = DOMUtils.findElementsBySelector('button');
      expect(elements).toHaveLength(3); // Finds all elements regardless of visibility
      
      // Verify the elements are the ones we expect
      expect(elements[0].textContent).toBe('Accept All');
      expect(elements[1].textContent).toBe('Reject All');
      expect(elements[2].textContent).toBe('Hidden Button');
    });

    test('should handle :contains() pseudo-selectors', () => {
      document.body.innerHTML = `
        <button>Accept All</button>
        <button>Reject All</button>
        <button>Save Settings</button>
      `;
      
      const elements = DOMUtils.findElementsWithText('button:contains("Reject")');
      expect(elements).toHaveLength(1);
      expect(elements[0].textContent).toBe('Reject All');
    });
  });

  describe('Visibility Checking', () => {
    test('should detect hidden elements', () => {
      const hiddenElement = document.createElement('button');
      hiddenElement.style.display = 'none';
      document.body.appendChild(hiddenElement);
      
      expect(DOMUtils.isElementVisible(hiddenElement)).toBe(false);
    });

    test('should detect visible elements', () => {
      const visibleElement = document.createElement('button');
      visibleElement.textContent = 'Visible';
      visibleElement.style.width = '100px';
      visibleElement.style.height = '30px';
      document.body.appendChild(visibleElement);
      
      // Mock getBoundingClientRect
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
      
      expect(DOMUtils.isElementVisible(visibleElement)).toBe(true);
    });
  });

  describe('Cookie Button Validation', () => {
    test('should identify cookie-related buttons', () => {
      const cookieButton = document.createElement('button');
      cookieButton.textContent = 'Reject all cookies';
      
      const loginButton = document.createElement('button');
      loginButton.textContent = 'Login';
      
      expect(DOMUtils.isCookieRelatedButton(cookieButton)).toBe(true);
      expect(DOMUtils.isCookieRelatedButton(loginButton)).toBe(false);
    });

    test('should validate based on class names', () => {
      const buttonWithClass = document.createElement('button');
      buttonWithClass.className = 'cookie-decline-btn';
      buttonWithClass.textContent = 'Click me';
      
      expect(DOMUtils.isCookieRelatedButton(buttonWithClass)).toBe(true);
    });

    test('should exclude non-cookie buttons', () => {
      const newsletterButton = document.createElement('button');
      newsletterButton.textContent = 'Subscribe to newsletter';
      
      const signinButton = document.createElement('button');
      signinButton.textContent = 'Sign in to account';
      
      expect(DOMUtils.isCookieRelatedButton(newsletterButton)).toBe(false);
      expect(DOMUtils.isCookieRelatedButton(signinButton)).toBe(false);
    });
  });

  describe('Element Clicking', () => {
    test('should click elements safely', () => {
      const clickSpy = jest.fn();
      const button = document.createElement('button');
      button.onclick = clickSpy;
      document.body.appendChild(button);
      
      DOMUtils.clickElement(button);
      expect(clickSpy).toHaveBeenCalled();
    });

    test('should handle click errors gracefully', () => {
      const button = document.createElement('button');
      button.click = () => { throw new Error('Click failed'); };
      
      expect(() => DOMUtils.clickElement(button)).not.toThrow();
    });
  });

  describe('Cookie Content Detection', () => {
    test('should detect cookie-related content', () => {
      const elements = [
        Object.assign(document.createElement('div'), { textContent: 'This site uses cookies' }),
        Object.assign(document.createElement('div'), { textContent: 'Regular content' })
      ];
      
      expect(DOMUtils.hasCookieContent(elements)).toBe(true);
    });

    test('should return false for non-cookie content', () => {
      const elements = [
        Object.assign(document.createElement('div'), { textContent: 'Regular content' }),
        Object.assign(document.createElement('div'), { textContent: 'More regular content' })
      ];
      
      expect(DOMUtils.hasCookieContent(elements)).toBe(false);
    });
  });
});