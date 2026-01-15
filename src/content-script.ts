import { getAllDeclineSelectors, type CookieSelector } from './selectors';
import { DOMUtils } from './dom-utils';
import { APIHandler } from './api-handler';
import { type PostMessageData } from './types';

class CookieDecliner {
  private readonly declineSelectors: CookieSelector[];
  private observer: MutationObserver | null = null;
  private readonly processed = new Set<Element>();
  private consentProcessed = false;

  constructor() {
    this.declineSelectors = getAllDeclineSelectors();
    this.init();
  }

  private init(): void {
    // Check for global cookie consent APIs
    APIHandler.checkForGlobalAPIs();
    
    // Scan for decline buttons
    this.findAndClickDeclineButton();
    
    // Set up mutation observer for dynamic content
    this.setupMutationObserver();
    
    // Set up shadow DOM observer for Usercentrics
    this.setupShadowDOMObserver();
    
    // Set up post message listener
    this.setupPostMessageListener();
  }

  private findAndClickDeclineButton(): boolean {
    if (this.consentProcessed || APIHandler.isConsentProcessed()) {
      return true;
    }
    
    // First, try checkbox-based consent (e.g., MaxGaming)
    // This handles cases where you need to uncheck optional cookies before saving
    if (DOMUtils.handleCheckboxConsent()) {
      console.log('Cookie Decliner: Successfully handled checkbox-based consent');
      this.markConsentProcessed();
      return true;
    }
    
    // Then try standard decline button clicking
    // Check if Usercentrics button exists in DOM (Apollo uses this)
    let ucButton = document.querySelector('[data-testid="uc-deny-all-button"]');
    
    // Check shadow DOM in #usercentrics-root specifically (Apollo pattern)
    if (!ucButton) {
      const ucRoot = document.querySelector('#usercentrics-root');
      if (ucRoot?.shadowRoot) {
        ucButton = ucRoot.shadowRoot.querySelector('[data-testid="uc-deny-all-button"]');
      }
    }
    
    if (ucButton && DOMUtils.isElementVisible(ucButton) && DOMUtils.isCookieRelatedButton(ucButton)) {
      console.log('Cookie Decliner: Clicking Usercentrics deny button');
      DOMUtils.clickElement(ucButton);
      this.processed.add(ucButton);
      this.markConsentProcessed();
      return true;
    }
    
    for (const { selector } of this.declineSelectors) {
      try {
        const elements = DOMUtils.findElementsBySelector(selector);
        for (const element of elements) {
          if (this.processElement(element)) {
            console.log('Cookie Decliner: Successfully declined cookies');
            return true;
          }
        }
      } catch (error) {
        console.debug(`Error with selector ${selector}:`, error);
      }
    }
    
    return false;
  }

  private processElement(element: Element): boolean {
    if (!DOMUtils.isElementVisible(element)) {
      return false;
    }
    
    if (this.processed.has(element)) {
      return false;
    }
    
    if (!DOMUtils.isCookieRelatedButton(element)) {
      return false;
    }
    
    DOMUtils.clickElement(element);
    this.processed.add(element);
    this.markConsentProcessed();
    
    return true;
  }

  private markConsentProcessed(): void {
    this.consentProcessed = true;
    APIHandler.setConsentProcessed(true);
    
    // Stop the mutation observer to prevent further processing
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  /**
   * Set up mutation observer for shadow DOM content in #usercentrics-root
   */
  private setupShadowDOMObserver(): void {
    // Poll to find and observe the shadow DOM
    const maxAttempts = 20;
    let attempts = 0;
    
    const checkForShadowDOM = (): void => {
      if (this.consentProcessed || APIHandler.isConsentProcessed()) {
        return;
      }
      
      attempts++;
      const ucRoot = document.querySelector('#usercentrics-root');
      
      if (ucRoot?.shadowRoot) {
        const shadowObserver = new MutationObserver((_mutations) => {
          if (this.consentProcessed || APIHandler.isConsentProcessed()) {
            shadowObserver.disconnect();
            return;
          }
          
          const shadowRoot = ucRoot.shadowRoot;
          if (!shadowRoot) return;
          
          const denyButton = shadowRoot.querySelector('[data-testid="uc-deny-all-button"]');
          if (denyButton && DOMUtils.isElementVisible(denyButton) && DOMUtils.isCookieRelatedButton(denyButton)) {
            console.log('Cookie Decliner: Clicking Usercentrics deny button');
            DOMUtils.clickElement(denyButton);
            this.processed.add(denyButton);
            this.markConsentProcessed();
            shadowObserver.disconnect();
          }
        });
        
        shadowObserver.observe(ucRoot.shadowRoot, {
          childList: true,
          subtree: true
        });
        
        return; // Found and set up observer
      }
      
      // Keep trying to find shadow DOM
      if (attempts < maxAttempts) {
        setTimeout(checkForShadowDOM, 200);
      }
    };
    
    // Start checking for shadow DOM
    setTimeout(checkForShadowDOM, 100);
  }

  private setupMutationObserver(): void {
    this.observer = new MutationObserver((mutations) => {
      if (this.consentProcessed || APIHandler.isConsentProcessed()) {
        return;
      }
      
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          const addedElements = Array.from(mutation.addedNodes)
            .filter(node => node.nodeType === Node.ELEMENT_NODE) as Element[];
          
          // Check for Usercentrics button directly in added elements
          for (const el of addedElements) {
            const testId = el.getAttribute('data-testid');
            if (testId === 'uc-deny-all-button' || 
                (el instanceof HTMLElement && el.querySelector('[data-testid="uc-deny-all-button"]'))) {
              setTimeout(() => {
                if (!this.consentProcessed && !APIHandler.isConsentProcessed()) {
                  this.findAndClickDeclineButton();
                }
              }, 100);
              return;
            }
          }
          
          // Check for cookie-related content
          if (DOMUtils.hasCookieContent(addedElements)) {
            const randomDelay = 400 + Math.floor(Math.random() * 200);
            setTimeout(() => {
              if (!this.consentProcessed && !APIHandler.isConsentProcessed()) {
                this.findAndClickDeclineButton();
              }
            }, randomDelay);
          }
        }
      }
    });
    
    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  private setupPostMessageListener(): void {
    window.addEventListener('message', (event) => {
      // Strict origin validation - only allow specific trusted domains
      if (!this.isTrustedOrigin(event.origin)) {
        return;
      }

      // Ignore our own messages to prevent loops
      if (this.isOwnMessage(event.data)) return;
      
      // Listen for SourcePoint messages
      if (this.isSourcePointMessage(event)) {
        this.handleSourcePointMessage(event.data);
      }
    }, false);
  }

  private isTrustedOrigin(origin: string): boolean {
    // Allow same origin
    if (origin === window.location.origin) {
      return true;
    }
    
    // Strict whitelist of trusted consent management domains
    const trustedDomains = [
      'sourcepoint.mgr.consensu.org',
      'ccpa-notice.sp-prod.net',
      'notice.sp-prod.net',
      'cmp.quantcast.com',
      'cmp.osano.com',
      'consent.cookiebot.com',
      'consent.trustarc.com',
      'cdn.cookielaw.org'
    ];
    
    try {
      const url = new URL(origin);
      return trustedDomains.some(domain => url.hostname === domain || url.hostname.endsWith(`.${domain}`));
    } catch {
      return false;
    }
  }

  private isOwnMessage(data: unknown): boolean {
    // Check if this is our own message to prevent infinite loops
    if (typeof data === 'object' && data !== null) {
      const message = data as Record<string, unknown>;
      return message['source'] === 'cookie-decliner' || 
             message['type'] === 'sp.choice';
    }
    return false;
  }

  private isSourcePointMessage(event: MessageEvent): boolean {
    // Use the same strict validation as isTrustedOrigin
    if (!this.isTrustedOrigin(event.origin)) {
      return false;
    }
    
    // Validate message structure
    const hasNameProperty = typeof event.data === 'object' && 
            event.data !== null && 
            typeof (event.data as Record<string, unknown>)['name'] === 'string' &&
            ((event.data as Record<string, unknown>)['name'] as string).startsWith('sp.');
    
    return Boolean(hasNameProperty);
  }

  private handleSourcePointMessage(data: unknown): void {
    if (!this.isValidPostMessageData(data)) return;
    
    // data is now type-narrowed to PostMessageData by the type guard
    const message = data;
    
    if (typeof message['name'] === 'string') {
      const messageName = this.sanitizeString(message['name']);
      switch (messageName) {
        case 'sp.readyForPreload':
          break;
          
        case 'sp.showMessage':
          setTimeout(() => {
            if (!this.consentProcessed && !APIHandler.isConsentProcessed()) {
              APIHandler.declineAllConsent();
            }
          }, 400 + Math.floor(Math.random() * 200)); // 400-600ms randomized
          break;
          
        case 'sp.hideMessage':
          this.markConsentProcessed();
          break;
      }
    }
    
    if (message['choice'] !== undefined) {
      // Choice message received - validate it's a number within expected range
      const choice = message['choice'];
      if (typeof choice === 'number' && choice >= 0 && choice <= 20) {
        // Valid choice received - could be used for further processing if needed
      }
    }
  }

  private isValidPostMessageData(data: unknown): data is PostMessageData {
    if (typeof data !== 'object' || data === null) return false;
    
    // Basic structure validation
    const obj = data as Record<string, unknown>;
    
    // Comprehensive prototype pollution prevention
    const dangerousKeys = [
      '__proto__', 
      'constructor', 
      'prototype',
      '__defineGetter__',
      '__defineSetter__',
      '__lookupGetter__',
      '__lookupSetter__',
      'hasOwnProperty',
      'isPrototypeOf',
      'propertyIsEnumerable',
      'toLocaleString',
      'toString',
      'valueOf'
    ];
    
    for (const key of dangerousKeys) {
      if (key in obj) return false;
    }
    
    // Ensure object is not frozen/sealed to prevent tampering
    if (Object.isFrozen(obj) || Object.isSealed(obj)) return false;
    
    // Check for circular references that could cause issues
    try {
      JSON.stringify(obj);
    } catch {
      return false; // Circular reference or other JSON issues
    }
    
    // Validate specific properties if they exist
    if ('name' in obj && typeof obj['name'] !== 'string') return false;
    if ('type' in obj && typeof obj['type'] !== 'string') return false;
    if ('choice' in obj && typeof obj['choice'] !== 'number' && typeof obj['choice'] !== 'string') return false;
    
    return true;
  }

  private sanitizeString(input: string): string {
    // Remove potentially dangerous characters and limit length
    return input.replace(/[<>"/\\&]/g, '').substring(0, 100);
  }

}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new CookieDecliner();
  });
} else {
  new CookieDecliner();
}