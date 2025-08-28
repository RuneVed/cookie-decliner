// Utility functions for DOM manipulation and element analysis
import { EXCLUDE_KEYWORDS, COOKIE_KEYWORDS, getAllCookieKeywords } from './keywords';

export class DOMUtils {
  /**
   * Find elements by selector, handling :contains() pseudo-selector manually
   */
  static findElementsBySelector(selector: string): Element[] {
    // Handle :contains() pseudo-selector
    const containsMatch = selector.match(/^(.*):(contains\(.+\))(.*)$/);
    
    if (containsMatch) {
      return this.findElementsWithText(selector);
    }
    
    try {
      return Array.from(document.querySelectorAll(selector));
    } catch (error) {
      console.debug(`Invalid selector: ${selector}`, error);
      return [];
    }
  }

  /**
   * Find elements with specific text content
   */
  static findElementsWithText(selector: string): Element[] {
    const match = selector.match(/^(.*?):contains\(["'](.+?)["']\)(.*)$/);
    if (!match) return [];
    
    const [, baseSelector = '*', textContent] = match;
    const elements = Array.from(document.querySelectorAll(baseSelector));
    
    return elements.filter(element => {
      const text = element.textContent?.toLowerCase() ?? '';
      return text.includes((textContent ?? '').toLowerCase());
    });
  }

  /**
   * Check if element is visible to user
   */
  static isElementVisible(element: Element): boolean {
    if (!(element instanceof HTMLElement)) return false;
    
    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0' &&
           rect.width > 0 && 
           rect.height > 0;
  }

  /**
   * Validate if button is cookie-related and safe to click
   */
  static isCookieRelatedButton(element: Element): boolean {
    const text = element.textContent?.toLowerCase() ?? '';
    const className = element.className?.toLowerCase() ?? '';
    const id = element.id?.toLowerCase() ?? '';
    const ariaLabel = element.getAttribute('aria-label')?.toLowerCase() ?? '';
    
    // Combine all text sources for analysis
    const allText = `${text} ${className} ${id} ${ariaLabel}`.toLowerCase();
    
    // Check for exclusion keywords first
    const hasExcludeKeyword = EXCLUDE_KEYWORDS.some(keyword => allText.includes(keyword));
    if (hasExcludeKeyword) {
      return false;
    }
    
    // Check for cookie-related keywords
    const cookieKeywords = getAllCookieKeywords();
    const hasCookieKeyword = cookieKeywords.some(keyword => allText.includes(keyword));
    
    if (hasCookieKeyword) {
      return true;
    }
    
    // Check parent context for cookie-related content
    if (element instanceof HTMLElement) {
      const hasParentContext = this.hasParentCookieContext(element);
      if (hasParentContext) {
        return true;
      }
    }
    
    console.log('Cookie Decliner: Skipping button - no cookie context detected');
    return false;
  }

  /**
   * Check if element has cookie-related parent context
   */
  private static hasParentCookieContext(element: HTMLElement): boolean {
    let parent = element.parentElement;
    let levels = 0;
    
    while (parent && levels < 5) {
      const parentText = parent.textContent?.toLowerCase() || '';
      const parentClass = parent.className?.toLowerCase() || '';
      const parentId = parent.id?.toLowerCase() || '';
      
      const parentContent = `${parentText} ${parentClass} ${parentId}`;
      
      // Check if parent has cookie-related keywords
      const hasCookieContext = COOKIE_KEYWORDS.some(keyword => 
        parentContent.includes(keyword)
      );
      
      if (hasCookieContext) {
        return true;
      }
      
      parent = parent.parentElement;
      levels++;
    }
    
    return false;
  }

  /**
   * Click element safely
   */
  static clickElement(element: Element): void {
    try {
      if (element instanceof HTMLElement) {
        element.click();
      } else {
        // Fallback for non-HTML elements
        const event = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        element.dispatchEvent(event);
      }
    } catch (error) {
      console.debug('Error clicking element:', error);
    }
  }

  /**
   * Check if DOM contains cookie-related content (for mutation observer)
   */
  static hasCookieContent(elements: Element[]): boolean {
    return elements.some(element => {
      const text = element.textContent?.toLowerCase() || '';
      const className = element.className?.toLowerCase() || '';
      const id = element.id?.toLowerCase() || '';
      
      const content = `${text} ${className} ${id}`;
      return COOKIE_KEYWORDS.some(keyword => content.includes(keyword));
    });
  }

  /**
   * Find SourcePoint-related iframes
   */
  static findSourcePointIframes(): HTMLIFrameElement[] {
    const selectors = [
      'iframe[id*="sp_message"]',
      'iframe[id*="sp_"]',
      'iframe[src*="sourcepoint"]',
      'iframe[src*="cmp"]',
      'iframe[name*="sp"]'
    ];
    
    const iframeSet = new Set<HTMLIFrameElement>();
    
    selectors.forEach(selector => {
      const foundElements = Array.from(document.querySelectorAll(selector));
      foundElements.forEach(element => {
        if (element instanceof HTMLIFrameElement) {
          iframeSet.add(element);
        }
      });
    });
    
    return Array.from(iframeSet);
  }
}