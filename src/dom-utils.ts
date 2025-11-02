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
   * Handle checkbox-based cookie consent (e.g., MaxGaming)
   * Unchecks all optional checkboxes except those marked as "necessary"
   * Returns true if checkboxes were processed and save button was clicked
   */
  static handleCheckboxConsent(): boolean {
    try {
      // Find all checkboxes in cookie consent forms
      const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));
      
      // Filter for checkboxes within cookie consent context
      const cookieCheckboxes = checkboxes.filter(checkbox => {
        if (!(checkbox instanceof HTMLInputElement)) return false;
        
        // Skip if already disabled (like "Nødvendige" - necessary cookies)
        if (checkbox.disabled) return false;
        
        // Check parent context for cookie-related content
        const parent = checkbox.closest('div[id*="cookie"], div[class*="cookie"], div[id*="consent"], div[class*="consent"]');
        if (!parent) return false;
        
        // Get associated label text
        const label = checkbox.parentElement?.textContent?.toLowerCase() ?? '';
        
        // Skip if it's the "necessary" checkbox (can't uncheck)
        if (label.includes('nødvendige') || label.includes('necessary') || label.includes('essential')) {
          return false;
        }
        
        // Include if it's for analytics, marketing, or preferences
        const isOptionalCategory = label.includes('analyse') || 
                                  label.includes('statistikk') ||
                                  label.includes('markedsføring') ||
                                  label.includes('marketing') ||
                                  label.includes('advertising') ||
                                  label.includes('preferanser') ||
                                  label.includes('preferences');
        
        return isOptionalCategory;
      });
      
      if (cookieCheckboxes.length === 0) {
        return false;
      }
      
      // Uncheck all optional checkboxes
      let uncheckedCount = 0;
      cookieCheckboxes.forEach(checkbox => {
        if (checkbox instanceof HTMLInputElement && checkbox.checked) {
          checkbox.checked = false;
          checkbox.dispatchEvent(new Event('change', { bubbles: true }));
          uncheckedCount++;
        }
      });
      
      if (uncheckedCount > 0) {
        console.log(`Cookie Decliner: Unchecked ${uncheckedCount} optional cookie checkboxes`);
        
        // Find and click the save button (e.g., "Lagre & lukk")
        const saveButtonSelectors = [
          'button:contains("Lagre & lukk")',
          'button:contains("Lagre")',
          'div[id*="cookie_consent_manager_confirm"]',
          'button:contains("Save & close")',
          'button:contains("Save settings")',
          'button:contains("Bekreft valg")',
          'button:contains("Confirm choices")'
        ];
        
        for (const selector of saveButtonSelectors) {
          const buttons = this.findElementsBySelector(selector);
          for (const button of buttons) {
            if (this.isElementVisible(button)) {
              console.log('Cookie Decliner: Clicking save button after unchecking optional cookies');
              this.clickElement(button);
              return true;
            }
          }
        }
      }
      
      return false;
    } catch (error) {
      console.debug('Error handling checkbox consent:', error);
      return false;
    }
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