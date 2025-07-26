// Utility functions for DOM manipulation and element analysis
import { EXCLUDE_KEYWORDS, COOKIE_KEYWORDS, getAllCookieKeywords } from './keywords.js';

export class DOMUtils {
  /**
   * Find elements by selector, handling :contains() pseudo-selector manually
   */
  static findElementsBySelector(selector: string): Element[] {
    if (selector.includes(':contains(')) {
      return this.findElementsWithText(selector);
    }
    return Array.from(document.querySelectorAll(selector));
  }

  /**
   * Find elements with specific text content
   */
  static findElementsWithText(selector: string): Element[] {
    const match = selector.match(/(.+):contains\("([^"]+)"\)/);
    if (!match) return [];
    
    const [, baseSelector, text] = match;
    if (!text) return [];
    
    const elements = document.querySelectorAll(baseSelector ?? 'button');
    
    return Array.from(elements).filter(el => 
      el.textContent?.toLowerCase().includes(text.toLowerCase())
    );
  }

  /**
   * Check if element is visible to user
   */
  static isElementVisible(element: Element): boolean {
    const htmlElement = element as HTMLElement;
    const rect = htmlElement.getBoundingClientRect();
    const style = window.getComputedStyle(htmlElement);
    
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0'
    );
  }

  /**
   * Validate if button is cookie-related and safe to click
   */
  static isCookieRelatedButton(element: Element): boolean {
    const htmlElement = element as HTMLElement;
    const text = htmlElement.textContent?.toLowerCase() ?? '';
    const className = htmlElement.className.toLowerCase();
    const id = htmlElement.id.toLowerCase();
    const dataTestId = htmlElement.getAttribute('data-testid')?.toLowerCase() ?? '';
    
    // Skip buttons that are clearly not cookie-related
    for (const keyword of EXCLUDE_KEYWORDS) {
      if (text.includes(keyword) || className.includes(keyword) || 
          id.includes(keyword) || dataTestId.includes(keyword)) {
        console.log(`Cookie Decliner: Skipping non-cookie button with keyword "${keyword}"`, element);
        return false;
      }
    }
    
    // Check if it's likely a cookie-related button
    const hasCookieKeyword = COOKIE_KEYWORDS.some(keyword => 
      text.includes(keyword) || className.includes(keyword) || 
      id.includes(keyword) || dataTestId.includes(keyword)
    );
    
    // Check if parent elements suggest it's a cookie banner
    const cookieContext = this.hasParentCookieContext(htmlElement);
    
    const isLikelyCookieButton = hasCookieKeyword || cookieContext;
    
    if (!isLikelyCookieButton) {
      console.log('Cookie Decliner: Skipping button - no cookie context detected', element);
    }
    
    return isLikelyCookieButton;
  }

  /**
   * Check if element has cookie-related parent context
   */
  private static hasParentCookieContext(element: HTMLElement): boolean {
    let parent = element.parentElement;
    let levels = 0;
    
    while (parent && levels < 5) {
      const parentClass = parent.className.toLowerCase();
      const parentId = parent.id.toLowerCase();
      
      if (COOKIE_KEYWORDS.some(keyword => 
          parentClass.includes(keyword) || parentId.includes(keyword))) {
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
      (element as HTMLElement).click();
      console.log('Cookie Decliner: ✅ Successfully clicked decline button - consent processing complete!');
    } catch (error) {
      console.error('Cookie Decliner: Error clicking element:', error);
    }
  }

  /**
   * Check if DOM contains cookie-related content (for mutation observer)
   */
  static hasCookieContent(elements: Element[]): boolean {
    const allKeywords = getAllCookieKeywords();
    
    return elements.some(el => {
      const text = el.textContent?.toLowerCase() ?? '';
      const className = (el as HTMLElement).className?.toLowerCase() ?? '';
      const id = (el as HTMLElement).id?.toLowerCase() ?? '';
      
      return allKeywords.some(keyword =>
        text.includes(keyword) || className.includes(keyword) || id.includes(keyword)
      );
    });
  }

  /**
   * Find SourcePoint-related iframes
   */
  static findSourcePointIframes(): HTMLIFrameElement[] {
    const selectors = [
      'iframe[id*="sp_message"]',
      'iframe[src*="sourcepoint"]', 
      'iframe[src*="cmp"]',
      'iframe[name*="sp"]'
    ];
    
    const iframes: HTMLIFrameElement[] = [];
    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      iframes.push(...Array.from(elements) as HTMLIFrameElement[]);
    });
    
    return iframes;
  }
}