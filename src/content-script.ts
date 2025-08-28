import { getAllDeclineSelectors, type CookieSelector } from './selectors';
import { DOMUtils } from './dom-utils';
import { APIHandler } from './api-handler';
import { type PostMessageData } from './types';

class CookieDecliner {
  private readonly declineSelectors: CookieSelector[];
  private observer: MutationObserver | null = null;
  private readonly processed = new Set<Element>();
  private consentProcessed = false;
  private readonly processedIframes = new WeakSet<HTMLIFrameElement>(); // Track without DOM modification

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
    
    // Set up post message listener
    this.setupPostMessageListener();
  }

  private findAndClickDeclineButton(): boolean {
    if (this.consentProcessed || APIHandler.isConsentProcessed()) {
      return true;
    }
    
    for (const { selector } of this.declineSelectors) {
      try {
        const elements = DOMUtils.findElementsBySelector(selector);
        
        for (const element of elements) {
          if (this.processElement(element)) {
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

  private setupMutationObserver(): void {
    this.observer = new MutationObserver((mutations) => {
      if (this.consentProcessed || APIHandler.isConsentProcessed()) {
        return;
      }
      
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          const addedElements = Array.from(mutation.addedNodes)
            .filter(node => node.nodeType === Node.ELEMENT_NODE) as Element[];
          
          if (DOMUtils.hasCookieContent(addedElements)) {
            const randomDelay = 400 + Math.floor(Math.random() * 200); // 400-600ms
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
    
    // Schedule iframe checks for delayed consent popups
    this.scheduleIframeChecks();
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

  private scheduleIframeChecks(): void {
    // Check for SourcePoint iframes that might load later with randomized timing
    const baseDelays = [1000, 3000, 5000];
    
    baseDelays.forEach(baseDelay => {
      const randomizedDelay = baseDelay + Math.floor(Math.random() * 500); // Add 0-500ms jitter
      setTimeout(() => {
        if (this.consentProcessed || APIHandler.isConsentProcessed()) return;
        
        const iframes = DOMUtils.findSourcePointIframes();
        iframes.forEach(iframe => {
          if (!this.processedIframes.has(iframe)) {
            this.processedIframes.add(iframe);
            iframe.addEventListener('load', () => {
              const loadDelay = 800 + Math.floor(Math.random() * 400); // 800-1200ms
              setTimeout(() => {
                if (!this.consentProcessed && !APIHandler.isConsentProcessed()) {
                  APIHandler.declineAllConsent();
                }
              }, loadDelay);
            });
          }
        });
      }, randomizedDelay);
    });
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