// Utility functions for DOM manipulation and element analysis
import { EXCLUDE_KEYWORDS, COOKIE_KEYWORDS, getAllCookieKeywords } from './keywords';

const MAX_PARENT_TRAVERSAL_LEVELS = 5; // levels to walk up the DOM checking for cookie context

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
    const testId = element.getAttribute('data-testid')?.toLowerCase() ?? '';
    
    // Combine all text sources for analysis
    const allText = `${text} ${className} ${id} ${ariaLabel} ${testId}`.toLowerCase();
    
    // Check for exclusion keywords first
    if (EXCLUDE_KEYWORDS.some(keyword => allText.includes(keyword))) {
      return false;
    }
    
    // Explicit check for Usercentrics deny button (Apollo, etc.)
    if (testId === 'uc-deny-all-button' || testId === 'uc-accept-all-button') {
      return testId === 'uc-deny-all-button'; // Only return true for deny button
    }
    
    // Check for cookie-related keywords
    const cookieKeywords = getAllCookieKeywords();
    if (cookieKeywords.some(keyword => allText.includes(keyword))) {
      return true;
    }
    
    // Check parent context for cookie-related content
    if (element instanceof HTMLElement) {
      return this.hasParentCookieContext(element);
    }
    
    return false;
  }

  /**
   * Check if element has cookie-related parent context
   */
  private static hasParentCookieContext(element: HTMLElement): boolean {
    let parent = element.parentElement;
    let levels = 0;
    
    while (parent && levels < MAX_PARENT_TRAVERSAL_LEVELS) {
      const parentText = parent.textContent?.toLowerCase() ?? '';
      const parentClass = parent.className?.toLowerCase() ?? '';
      const parentId = parent.id?.toLowerCase() ?? '';
      const parentTestId = parent.getAttribute('data-testid')?.toLowerCase() ?? '';
      
      const parentContent = `${parentText} ${parentClass} ${parentId} ${parentTestId}`;
      
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
      const text = element.textContent?.toLowerCase() ?? '';
      const className = element.className?.toLowerCase() ?? '';
      const id = element.id?.toLowerCase() ?? '';
      const testId = element.getAttribute('data-testid')?.toLowerCase() ?? '';
      
      const content = `${text} ${className} ${id} ${testId}`;
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
   * Handle Didomi CMP preferences flow (norskkalender.no pattern).
   *
   * Two-phase approach:
   * Phase 1 – Initial popup visible, preferences panel not yet open:
   *   Clicks "#didomi-notice-learn-more-button" ("Les mer") to open the panel,
   *   then returns false so the MutationObserver can re-trigger once the panel appears.
   *
   * Phase 2 – Preferences panel open (#btn-toggle-disagree visible):
   *   Clicks "Avslå alle" (#btn-toggle-disagree), then clicks "Lagre"
   *   (#btn-toggle-save) once it is no longer disabled.
   *   Returns true only when both clicks succeed.
   */
  static handleDidomiPreferences(): boolean {
    try {
      const disagreeBtn = document.querySelector<HTMLButtonElement>('#btn-toggle-disagree');
      const saveBtn = document.querySelector<HTMLButtonElement>('#btn-toggle-save');

      // Phase 2: preferences panel is open
      if (disagreeBtn && saveBtn) {
        if (!this.isElementVisible(disagreeBtn)) {
          return false;
        }

        // Guard: don't click "Avslå alle" again if we already clicked it this pass
        if (!disagreeBtn.dataset.cookieDeclinerClicked) {
          console.log('Cookie Decliner: Clicking Didomi "Avslå alle" button');
          disagreeBtn.dataset.cookieDeclinerClicked = '1';
          this.clickElement(disagreeBtn);
        }

        // "Lagre" starts out disabled and becomes enabled after clicking "Avslå alle"
        if (saveBtn.disabled) {
          console.log('Cookie Decliner: Waiting for Didomi "Lagre" button to become enabled');
          return false; // MutationObserver will re-trigger once the button is enabled
        }

        console.log('Cookie Decliner: Clicking Didomi "Lagre" button');
        this.clickElement(saveBtn);
        return true;
      }

      // Phase 1: preferences panel not open yet — click "Les mer" to open it
      const learnMoreBtn = document.querySelector<HTMLButtonElement>('#didomi-notice-learn-more-button');
      if (learnMoreBtn && this.isElementVisible(learnMoreBtn) && !learnMoreBtn.dataset.cookieDeclinerClicked) {
        console.log('Cookie Decliner: Opening Didomi preferences panel ("Les mer")');
        learnMoreBtn.dataset.cookieDeclinerClicked = '1';
        this.clickElement(learnMoreBtn);
        // Return false — do NOT mark consent as processed yet.
        // The MutationObserver will call us again once the panel appears.
        return false;
      }

      return false;
    } catch (error) {
      console.debug('Error handling Didomi preferences:', error);
      return false;
    }
  }
}