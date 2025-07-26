import { getAllDeclineSelectors, type CookieSelector } from './selectors.js';
import { DOMUtils } from './dom-utils.js';
import { APIHandler } from './api-handler.js';
import { type PostMessageData } from './types.js';

class CookieDecliner {
  private readonly declineSelectors: CookieSelector[];
  private observer: MutationObserver | null = null;
  private processed = new Set<Element>();
  private consentProcessed = false;

  constructor() {
    this.declineSelectors = getAllDeclineSelectors();
    this.init();
  }

  private init(): void {
    console.log('Cookie Decliner: Initialized');
    console.log('Cookie Decliner: Current URL:', window.location.href);
    console.log('Cookie Decliner: Is iframe:', window !== window.top);
    
    // Check for global cookie consent APIs
    APIHandler.checkForGlobalAPIs();
    
    // Immediate diagnostic scan
    this.diagnosticScan();
    
    // Multiple scan attempts with different timings
    this.scheduleScans();
    
    // Set up observers for dynamic content
    this.setupMutationObserver();
    this.setupPostMessageListener();
  }

  private scheduleScans(): void {
    const scanTimes = [2000, 5000, 10000];
    
    scanTimes.forEach(delay => {
      setTimeout(() => {
        if (this.consentProcessed || APIHandler.isConsentProcessed()) return;
        
        console.log(`Cookie Decliner: Scan attempt after ${delay}ms...`);
        APIHandler.checkForGlobalAPIs();
        this.diagnosticScan();
        this.findAndClickDeclineButton();
      }, delay);
    });
  }

  private diagnosticScan(): void {
    if (this.consentProcessed || APIHandler.isConsentProcessed()) return;

    console.log('Cookie Decliner: === DIAGNOSTIC SCAN ===');
    
    // Check for buttons and iframes
    const allButtons = document.querySelectorAll('button');
    const iframes = document.querySelectorAll('iframe');
    const cookieElements = document.querySelectorAll('[class*="cookie"], [id*="cookie"], [class*="consent"], [id*="consent"], [class*="gdpr"], [id*="gdpr"]');
    
    console.log(`Cookie Decliner: Found ${allButtons.length} buttons, ${iframes.length} iframes, ${cookieElements.length} cookie-related elements`);
    
    // Log SourcePoint iframes specifically
    const sourcePointIframes = DOMUtils.findSourcePointIframes();
    if (sourcePointIframes.length > 0) {
      console.log(`Cookie Decliner: Found ${sourcePointIframes.length} SourcePoint iframes`);
      sourcePointIframes.forEach((iframe, i) => {
        console.log(`Cookie Decliner: SourcePoint iframe ${i + 1}:`, iframe.src);
      });
    }
    
    console.log('Cookie Decliner: === END DIAGNOSTIC ===');
  }

  private findAndClickDeclineButton(): boolean {
    if (this.consentProcessed || APIHandler.isConsentProcessed()) {
      return true;
    }

    console.log('Cookie Decliner: Scanning for decline buttons...');
    
    for (const { selector, description } of this.declineSelectors) {
      try {
        const elements = DOMUtils.findElementsBySelector(selector);
        console.log(`Cookie Decliner: Found ${elements.length} elements for selector: ${selector}`);
        
        for (const element of elements) {
          if (this.processElement(element, description)) {
            return true;
          }
        }
      } catch (error) {
        console.debug(`Cookie Decliner: Error with selector ${selector}:`, error);
      }
    }
    
    console.log('Cookie Decliner: No suitable decline buttons found');
    return false;
  }

  private processElement(element: Element, description: string): boolean {
    console.log('Cookie Decliner: Evaluating element:', element, 'Text:', element.textContent?.trim());
    
    if (!DOMUtils.isElementVisible(element)) {
      console.log('Cookie Decliner: Element not visible, skipping');
      return false;
    }
    
    if (this.processed.has(element)) {
      console.log('Cookie Decliner: Element already processed, skipping');
      return false;
    }
    
    if (!DOMUtils.isCookieRelatedButton(element)) {
      console.log('Cookie Decliner: Element not cookie-related, skipping');
      return false;
    }
    
    console.log(`Cookie Decliner: Found decline button - ${description}`, element);
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
      console.log('Cookie Decliner: Stopped mutation observer after successful consent processing');
    }
  }

  private setupMutationObserver(): void {
    this.observer = new MutationObserver((mutations) => {
      if (this.consentProcessed || APIHandler.isConsentProcessed()) return;

      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          const addedElements = Array.from(mutation.addedNodes)
            .filter(node => node.nodeType === Node.ELEMENT_NODE) as Element[];
          
          if (DOMUtils.hasCookieContent(addedElements)) {
            console.log('Cookie Decliner: Detected cookie-related content added to DOM');
            setTimeout(() => {
              if (!this.consentProcessed && !APIHandler.isConsentProcessed()) {
                this.diagnosticScan();
                this.findAndClickDeclineButton();
              }
            }, 500);
          }
          
          // Also do regular check
          setTimeout(() => {
            if (!this.consentProcessed && !APIHandler.isConsentProcessed()) {
              this.findAndClickDeclineButton();
            }
          }, 1000);
          break;
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
      if (this.consentProcessed || APIHandler.isConsentProcessed()) return;

      // Ignore our own messages to prevent loops
      if (this.isOwnMessage(event.data)) return;

      console.log('Cookie Decliner: Received postMessage:', event.origin, event.data);
      
      // Listen for SourcePoint messages
      if (this.isSourcePointMessage(event)) {
        console.log('Cookie Decliner: SourcePoint message received:', event.data);
        this.handleSourcePointMessage(event.data);
      }
    }, false);
    
    // Check for iframes periodically
    this.scheduleIframeChecks();
  }

  private isOwnMessage(data: unknown): boolean {
    if (!data || typeof data !== 'object' || data === null) {
      return false;
    }
    
    const obj = data as PostMessageData;
    return (obj['type'] === 'sp.decline' || obj['type'] === 'choice') ||
           (obj['name'] === 'sp.choice') ||
           (obj['msgType'] === 'sp.decline');
  }

  private isSourcePointMessage(event: MessageEvent): boolean {
    return event.origin.includes('sourcepoint') || 
           event.origin.includes('cmp') || 
           event.origin.includes('sp-prod') || 
           event.origin.includes('.no') || 
           event.origin.includes('consent') || 
           event.data?.name?.startsWith('sp.');
  }

  private handleSourcePointMessage(data: unknown): void {
    if (!data || typeof data !== 'object' || data === null) {
      return;
    }
    
    const message = data as PostMessageData;
    
    if (typeof message['name'] === 'string') {
      switch (message['name']) {
        case 'sp.readyForPreload':
          console.log('Cookie Decliner: SourcePoint ready for preload, waiting for showMessage');
          break;
          
        case 'sp.showMessage':
          console.log('Cookie Decliner: SourcePoint popup shown, attempting decline in 500ms');
          setTimeout(() => {
            if (!this.consentProcessed && !APIHandler.isConsentProcessed()) {
              APIHandler.declineAllConsent();
              this.findAndClickDeclineButton();
            }
          }, 500);
          break;
          
        case 'sp.hideMessage':
          console.log('Cookie Decliner: SourcePoint message hidden - consent may have been processed');
          this.markConsentProcessed();
          break;
          
        default:
          console.log('Cookie Decliner: Unknown SourcePoint message type:', message['name']);
      }
    }
    
    if (message['choice'] !== undefined) {
      console.log('Cookie Decliner: Choice message received:', message['choice']);
    }
  }

  private scheduleIframeChecks(): void {
    let iframeCheckCount = 0;
    const maxChecks = 3;
    
    const checkForIframes = () => {
      if (this.consentProcessed || APIHandler.isConsentProcessed() || iframeCheckCount >= maxChecks) {
        return;
      }
      
      iframeCheckCount++;
      const sourcePointIframes = DOMUtils.findSourcePointIframes();
      
      sourcePointIframes.forEach(iframe => {
        if (!iframe.dataset['listenerAdded']) {
          iframe.dataset['listenerAdded'] = 'true';
          iframe.addEventListener('load', () => {
            console.log('Cookie Decliner: SourcePoint iframe loaded, attempting decline');
            setTimeout(() => {
              if (!this.consentProcessed && !APIHandler.isConsentProcessed()) {
                APIHandler.declineAllConsent();
              }
            }, 1000);
          });
        }
      });
    };
    
    // Check at intervals
    checkForIframes();
    setTimeout(checkForIframes, 1000);
    setTimeout(checkForIframes, 3000);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new CookieDecliner());
} else {
  new CookieDecliner();
}