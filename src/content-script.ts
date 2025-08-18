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
        // eslint-disable-next-line no-console -- Debug logging for browser extension troubleshooting
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
            setTimeout(() => {
              if (!this.consentProcessed && !APIHandler.isConsentProcessed()) {
                this.findAndClickDeclineButton();
              }
            }, 500);
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
      // Only process messages from same origin or known consent management origins
      if (event.origin !== window.location.origin && 
          !event.origin.includes('sourcepoint') &&
          !event.origin.includes('cmp')) {
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
    const origin = event.origin || '';
    const hasOriginKeywords = origin.includes('sourcepoint') || origin.includes('cmp');
    const hasNameProperty = typeof event.data === 'object' && 
            event.data !== null && 
            typeof (event.data as Record<string, unknown>)['name'] === 'string' &&
            ((event.data as Record<string, unknown>)['name'] as string).startsWith('sp.');
    
    return hasOriginKeywords || Boolean(hasNameProperty);
  }

  private handleSourcePointMessage(data: unknown): void {
    if (typeof data !== 'object' || data === null) return;
    
    const message = data as PostMessageData;
    
    if (typeof message['name'] === 'string') {
      switch (message['name']) {
        case 'sp.readyForPreload':
          break;
          
        case 'sp.showMessage':
          setTimeout(() => {
            if (!this.consentProcessed && !APIHandler.isConsentProcessed()) {
              APIHandler.declineAllConsent();
            }
          }, 500);
          break;
          
        case 'sp.hideMessage':
          this.markConsentProcessed();
          break;
      }
    }
    
    if (message['choice'] !== undefined) {
      // Choice message received - could be used for further processing if needed
    }
  }

  private scheduleIframeChecks(): void {
    // Check for SourcePoint iframes that might load later
    const checkTimes = [1000, 3000, 5000];
    
    checkTimes.forEach(delay => {
      setTimeout(() => {
        if (this.consentProcessed || APIHandler.isConsentProcessed()) return;
        
        const iframes = DOMUtils.findSourcePointIframes();
        iframes.forEach(iframe => {
          if (!iframe.dataset['listenerAdded']) {
            iframe.dataset['listenerAdded'] = 'true';
            iframe.addEventListener('load', () => {
              setTimeout(() => {
                if (!this.consentProcessed && !APIHandler.isConsentProcessed()) {
                  APIHandler.declineAllConsent();
                }
              }, 1000);
            });
          }
        });
      }, delay);
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