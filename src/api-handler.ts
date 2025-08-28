// API handlers for different cookie consent management platforms
import { type WindowWithAPIs, type TCFData, hasTCFAPI, hasSourcePointAPI } from './types';

// Secure reset mechanism using Symbol - not discoverable via property enumeration
const SECURE_RESET_SYMBOL = Symbol('secure-reset-for-testing-only');

export class APIHandler {
  private static consentProcessed = false;
  private static lastDeclineAttempt = 0;
  private static readonly RATE_LIMIT_MS = 2000; // Minimum 2 seconds between decline attempts
  private static declineAttemptCount = 0;
  private static readonly MAX_DECLINE_ATTEMPTS = 5; // Maximum attempts per page load

  /**
   * Secure reset method accessible only via Symbol key
   * This prevents easy discovery of the reset mechanism
   */
  static [SECURE_RESET_SYMBOL](): void {
    this.lastDeclineAttempt = 0;
    this.declineAttemptCount = 0;
  }

  /**
   * Check for global cookie consent APIs - MAIN ENTRY POINT
   */
  static checkForGlobalAPIs(): void {
    if (this.consentProcessed) {
      return;
    }

    console.log('Cookie Decliner: Checking for global cookie consent APIs...');
    
    const windowWithAPI = window as WindowWithAPIs;
    
    // Check immediately for TCF API
    if (typeof windowWithAPI.__tcfapi === 'function') {
      console.log('Cookie Decliner: Found TCF API immediately!');
      this.handleTCFAPI();
    } else {
      // Wait for TCF API with exponential backoff
      this.waitForTCFAPI();
    }
    
    // Check for SourcePoint specific globals
    if (windowWithAPI._sp_) {
      console.log('Cookie Decliner: Found SourcePoint _sp_ object:', windowWithAPI._sp_);
      this.handleSourcePointAPI();
    }
    
    // Log other API availability
    this.logOtherAPIs();
  }

  /**
   * Check for and handle TCF API v2.0
   */
  static handleTCFAPI(): void {
    if (!hasTCFAPI(window)) {
      console.log('Cookie Decliner: No TCF API found');
      return;
    }

    console.log('Cookie Decliner: Setting up TCF API handlers');

    const windowWithAPI = window as WindowWithAPIs;
    
    try {
      // Get current consent data
      windowWithAPI.__tcfapi?.('getTCData', 2, (tcData: TCFData, success: boolean) => {
        console.log('Cookie Decliner: TCF Data received:', { success, tcData });
        
        if (success && tcData) {
          console.log('Cookie Decliner: CMP Status:', tcData.cmpStatus);
          console.log('Cookie Decliner: Event Status:', tcData.eventStatus);
          
          // If CMP is showing or loaded, attempt to decline
          if (tcData.eventStatus === 'cmpuishown' || tcData.cmpStatus === 'loaded') {
            console.log('Cookie Decliner: Attempting to decline all via TCF API');
            this.declineAllConsent();
          }
        }
      });
      
      // Set up event listener for when CMP UI shows
      windowWithAPI.__tcfapi?.('addEventListener', 2, (tcData: TCFData, success: boolean) => {
        if (success && tcData && tcData.eventStatus === 'cmpuishown') {
          console.log('Cookie Decliner: CMP UI shown, attempting to decline');
          this.declineAllConsent();
        }
      });
      
    } catch (error) {
      console.log('Cookie Decliner: Error using TCF API:', error);
    }
  }

  /**
   * Handle SourcePoint CMP API
   */
  static handleSourcePointAPI(): void {
    if (!hasSourcePointAPI(window)) {
      console.log('Cookie Decliner: No SourcePoint API found');
      return;
    }

    console.log('Cookie Decliner: Setting up SourcePoint API handlers');
    
    const windowWithAPI = window as WindowWithAPIs;
    const sp = windowWithAPI._sp_;
    
    if (!sp) {
      console.log('Cookie Decliner: SourcePoint API object is null');
      return;
    }
    
    try {
      // Method 1: Use onMessageChoiceSelect event if available
      if (sp.config?.events?.onMessageChoiceSelect) {
        console.log('Cookie Decliner: Attempting SourcePoint onMessageChoiceSelect with choice 11 (reject all)');
        sp.config.events.onMessageChoiceSelect({ choice: 11 });
      }
      
      // Method 2: Use executeMessaging if available
      if (typeof sp.executeMessaging === 'function') {
        console.log('Cookie Decliner: Attempting SourcePoint executeMessaging');
        sp.executeMessaging();
      }
      
      // Method 3: Try other SourcePoint methods if available
      if (typeof sp.declineAll === 'function') {
        console.log('Cookie Decliner: Attempting SourcePoint declineAll');
        sp.declineAll();
      }
      
      if (typeof sp.choiceReject === 'function') {
        console.log('Cookie Decliner: Attempting SourcePoint choiceReject');
        sp.choiceReject();
      }
      
    } catch (error) {
      console.log('Cookie Decliner: Error using SourcePoint API:', error);
    }
  }

  /**
   * Check if we should allow a decline attempt based on rate limiting
   */
  private static shouldAllowDeclineAttempt(): boolean {
    const now = Date.now();
    
    // Check if we've exceeded maximum attempts
    if (this.declineAttemptCount >= this.MAX_DECLINE_ATTEMPTS) {
      console.log('Cookie Decliner: Maximum decline attempts reached, rate limiting active');
      return false;
    }
    
    // Check if enough time has passed since last attempt
    if (now - this.lastDeclineAttempt < this.RATE_LIMIT_MS) {
      console.log('Cookie Decliner: Rate limiting active, declining too frequently');
      return false;
    }
    
    return true;
  }

  /**
   * Record a decline attempt for rate limiting
   */
  private static recordDeclineAttempt(): void {
    this.lastDeclineAttempt = Date.now();
    this.declineAttemptCount++;
  }

  /**
   * Attempt to decline all consent via available APIs
   */
  static declineAllConsent(): void {
    if (this.consentProcessed) {
      return;
    }

    // Apply rate limiting
    if (!this.shouldAllowDeclineAttempt()) {
      return;
    }

    // Record this attempt
    this.recordDeclineAttempt();

    console.log('Cookie Decliner: Attempting to decline all consent...');
    
    const windowWithAPI = window as WindowWithAPIs;
    
    // First try TCF API if available
    if (typeof windowWithAPI.__tcfapi === 'function') {
      console.log('Cookie Decliner: Using TCF API to decline');
      
      // Use ping to check if CMP is ready
      windowWithAPI.__tcfapi('ping', 2, (pingData: { cmpLoaded?: boolean; cmpStatus?: string }, success: boolean) => {
        if (success && pingData?.cmpLoaded) {
          console.log('Cookie Decliner: CMP is loaded, attempting to decline all');
          
          // Try to decline all purposes and vendors
          windowWithAPI.__tcfapi?.('setAllConsentAndLegitInterest', 2, (result: TCFData, success: boolean) => {
            if (success && result) {
              console.log('Cookie Decliner: Successfully declined all consent via TCF API');
              this.setConsentProcessed(true);
            } else {
              console.log('Cookie Decliner: TCF decline failed, trying alternatives');
              this.tryAlternativeDeclineMethods();
            }
          }, false, false, [], [], false, false);
        } else {
          console.log('Cookie Decliner: CMP not ready, trying alternatives');
          this.tryAlternativeDeclineMethods();
        }
      });
    } else {
      this.tryAlternativeDeclineMethods();
    }
  }

  /**
   * Wait for TCF API with exponential backoff
   */
  private static waitForTCFAPI(): void {
    let tcfCheckCount = 0;
    let tcfCheckTimeout: NodeJS.Timeout;
    
    const tcfChecker = () => {
      tcfCheckCount++;
      console.log(`Cookie Decliner: TCF API check attempt ${tcfCheckCount}`);
      
      const windowWithAPI = window as WindowWithAPIs;
      if (typeof windowWithAPI.__tcfapi === 'function') {
        console.log('Cookie Decliner: Found TCF API after waiting!');
        this.handleTCFAPI();
        if (tcfCheckTimeout) clearTimeout(tcfCheckTimeout);
      } else {
        console.log('Cookie Decliner: No TCF API found yet');
        // Stop checking after 3 attempts or if we're in an iframe
        if (tcfCheckCount < 3 && window === window.top) {
          tcfCheckTimeout = setTimeout(tcfChecker, 1000 * tcfCheckCount); // Exponential backoff
        } else {
          console.log('Cookie Decliner: Stopped TCF API checking - likely not needed in this context');
        }
      }
    };
    
    // Start checking with a short delay
    tcfCheckTimeout = setTimeout(tcfChecker, 100);
  }

  /**
   * Log availability of other common APIs
   */
  private static logOtherAPIs(): void {
    const windowWithAPI = window as WindowWithAPIs;
    const apis = [
      { name: 'CMP API', check: () => typeof windowWithAPI.__cmp !== 'undefined' },
      { name: 'Cookiebot API', check: () => typeof windowWithAPI.Cookiebot !== 'undefined' },
      { name: 'OneTrust API', check: () => typeof windowWithAPI.OneTrust !== 'undefined' }
    ];

    apis.forEach(api => {
      if (api.check()) {
        console.log(`Cookie Decliner: Found ${api.name}`);
      } else {
        console.log(`Cookie Decliner: No ${api.name} found`);
      }
    });

    // Check for TCF API locator iframe
    const tcfLocator = document.querySelector('iframe[name="__tcfapiLocator"]');
    if (tcfLocator) {
      console.log('Cookie Decliner: Found TCF API locator iframe');
    }
  }

  /**
   * Try alternative decline methods when primary APIs fail
   */
  private static tryAlternativeDeclineMethods(): void {
    console.log('Cookie Decliner: Trying alternative decline methods');
    
    const windowWithAPI = window as WindowWithAPIs;
    
    // Try SourcePoint API if available
    if (windowWithAPI._sp_) {
      console.log('Cookie Decliner: Using SourcePoint _sp_ object');
      try {
        const sp = windowWithAPI._sp_;
        
        // Method 1: onMessageChoiceSelect with choice 11 (reject all)
        if (sp.config?.events?.onMessageChoiceSelect) {
          sp.config.events.onMessageChoiceSelect({ choice: 11 });
        }
        
        // Method 2: executeMessaging
        if (typeof sp.executeMessaging === 'function') {
          sp.executeMessaging();
        }
        
        // Method 3: Direct decline methods
        if (typeof sp.declineAll === 'function') {
          sp.declineAll();
        }
        
        if (typeof sp.choiceReject === 'function') {
          sp.choiceReject();
        }
        
        this.setConsentProcessed(true);
        return;
      } catch (error) {
        console.log('Cookie Decliner: Error with SourcePoint API:', error);
      }
    }
    
    // Try iframe communication for embedded CMPs
    this.tryIframeCommunication();
  }

  /**
   * Communicate with SourcePoint iframes
   */
  private static tryIframeCommunication(): void {
    const iframes = document.querySelectorAll('iframe');
    let iframeCount = 0;
    
    iframes.forEach((iframe, index) => {
      const iframeElement = iframe;
      
      // Check if this is a SourcePoint iframe
      if (iframeElement.id?.includes('sp_message') || 
          iframeElement.src?.includes('sourcepoint') ||
          iframeElement.src?.includes('cmp')) {
        
        iframeCount++;
        console.log(`Cookie Decliner: Attempting iframe communication with SourcePoint iframe ${iframeCount}`);
        
        // Extract message ID from iframe src or id
        const messageIdMatch = iframeElement.src?.match(/message_id=(\d+)/) ?? 
                             iframeElement.id?.match(/\d+/);
        const messageId = messageIdMatch?.[1] ?? messageIdMatch?.[0];
        
        if (messageId) {
          console.log(`Cookie Decliner: Detected message ID: ${messageId}`);
        }
        
        // Try to communicate with the iframe
        const randomDelay = 400 + Math.floor(Math.random() * 200); // 400-600ms
        setTimeout(() => {
          try {
            if (iframeElement.contentWindow) {
              // Send decline message to iframe
              const declineMessage = {
                type: 'sp.choice',
                choice: 11, // Reject all
                messageId
              };
              
              // Get secure target origin instead of using wildcard
              const targetOrigin = this.getIframeTargetOrigin(iframeElement);
              
              iframeElement.contentWindow.postMessage(declineMessage, targetOrigin);
              
              // Also try alternative message formats
              iframeElement.contentWindow.postMessage({
                name: 'sp.messageChoiceSelect',
                body: { choice: 11, messageId }
              }, targetOrigin);
            }
          } catch (error) {
            console.log(`Cookie Decliner: Error communicating with iframe ${index + 1}:`, error);
          }
        }, randomDelay);
      }
    });
  }

  /**
   * Get secure target origin for iframe communication
   */
  private static getIframeTargetOrigin(iframe: HTMLIFrameElement): string {
    // Extract origin from iframe src
    if (iframe.src) {
      try {
        const iframeUrl = new URL(iframe.src);
        const origin = iframeUrl.origin;
        
        // Validate against trusted domains
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
        
        const hostname = iframeUrl.hostname;
        const isTrusted = trustedDomains.some(domain => 
          hostname === domain || hostname.endsWith(`.${domain}`)
        );
        
        if (isTrusted) {
          return origin;
        }
      } catch {
        // Invalid URL - fall through to default
      }
    }
    
    // Default to most common SourcePoint origin if validation fails
    return 'https://sourcepoint.mgr.consensu.org';
  }

  static setConsentProcessed(processed: boolean): void {
    this.consentProcessed = processed;
  }

  static isConsentProcessed(): boolean {
    return this.consentProcessed;
  }
}

// Export for testing purposes only - Symbol makes it non-enumerable
export { SECURE_RESET_SYMBOL };