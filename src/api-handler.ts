// API handlers for different cookie consent management platforms
import { type WindowWithAPIs, type TCFData, hasTCFAPI, hasSourcePointAPI } from './types.js';

export class APIHandler {
  private static consentProcessed = false;

  /**
   * Check for and handle TCF API v2.0
   */
  static handleTCFAPI(): void {
    console.log('Cookie Decliner: Setting up TCF API handlers');
    
    if (!hasTCFAPI(window)) {
      console.log('Cookie Decliner: TCF API not available');
      return;
    }

    try {
      // Get current TCF data - window is now properly typed as WindowWithAPIs
      window.__tcfapi('getTCData', 2, (tcData: TCFData | null, success: boolean) => {
        console.log('Cookie Decliner: TCF Data:', tcData, 'Success:', success);
        if (success && tcData) {
          console.log('Cookie Decliner: CMP Status:', tcData.cmpStatus);
          console.log('Cookie Decliner: Event Status:', tcData.eventStatus);
          console.log('Cookie Decliner: GDPR Applies:', tcData.gdprApplies);
          
          // If CMP is loaded but no consent given yet, try to decline
          if (tcData.cmpStatus === 'loaded' && (!tcData.tcString || tcData.eventStatus === 'cmpuishown')) {
            console.log('Cookie Decliner: Attempting to decline all via TCF API');
            this.declineAllConsent();
          }
        }
      });
      
      // Set up event listener for future CMP UI shows
      window.__tcfapi('addEventListener', 2, (tcData: TCFData | null, success: boolean) => {
        console.log('Cookie Decliner: TCF Event:', tcData, 'Success:', success);
        if (success && tcData && tcData.eventStatus === 'cmpuishown') {
          console.log('Cookie Decliner: CMP UI shown, attempting to decline');
          setTimeout(() => this.declineAllConsent(), 500);
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
    console.log('Cookie Decliner: Setting up SourcePoint API handlers');
    
    if (!hasSourcePointAPI(window)) {
      console.log('Cookie Decliner: SourcePoint API not available');
      return;
    }

    try {
      const sp = window._sp_; // window is now properly typed as WindowWithAPIs
      if (!sp) {
        console.log('Cookie Decliner: SourcePoint API object is null');
        return;
      }
      
      console.log('Cookie Decliner: SourcePoint object structure:', Object.keys(sp));
      
      // Try to find and call decline functions
      if (sp.config?.events?.onMessageChoiceSelect) {
        console.log('Cookie Decliner: Attempting SourcePoint onMessageChoiceSelect with choice 11 (reject all)');
        sp.config.events.onMessageChoiceSelect({ choice: 11 });
      }
      
      // Try executeMessaging if available
      if (sp.executeMessaging) {
        console.log('Cookie Decliner: Attempting SourcePoint executeMessaging');
        sp.executeMessaging();
      }
      
    } catch (error) {
      console.log('Cookie Decliner: Error using SourcePoint API:', error);
    }
  }

  /**
   * Attempt to decline all consent via available APIs
   */
  static declineAllConsent(): void {
    if (this.consentProcessed) {
      return;
    }

    console.log('Cookie Decliner: Attempting to decline all consent...');
    
    // Method 1: Try TCF API if available
    const windowWithAPI = window as WindowWithAPIs;
    if (typeof windowWithAPI.__tcfapi === 'function') {
      console.log('Cookie Decliner: Using TCF API to decline');
      try {
        // Try the ping command first to ensure API is ready
        windowWithAPI.__tcfapi('ping', 2, (pingData: unknown, success: boolean) => {
          console.log('Cookie Decliner: TCF ping result:', pingData, 'Success:', success);
          
          if (success && pingData) {
            console.log('Cookie Decliner: TCF API is ready, attempting to decline all consent');
            
            // Try to set all purposes and vendors to false
            windowWithAPI.__tcfapi?.('setAllConsentAndLegitInterest', 2, (result: unknown, success: boolean) => {
              console.log('Cookie Decliner: setAllConsentAndLegitInterest result:', result);
              if (success) {
                console.log('Cookie Decliner: Successfully declined all consent via TCF API!');
                this.consentProcessed = true;
              } else {
                console.log('Cookie Decliner: TCF API decline failed, trying alternative methods');
                this.tryAlternativeDeclineMethods();
              }
            }, false, false);
          } else {
            console.log('Cookie Decliner: TCF API ping failed, trying alternative methods');
            this.tryAlternativeDeclineMethods();
          }
        });
        
      } catch (error) {
        console.log('Cookie Decliner: Error with TCF API:', error);
        this.tryAlternativeDeclineMethods();
      }
    } else {
      console.log('Cookie Decliner: No TCF API available, trying alternative methods');
      this.tryAlternativeDeclineMethods();
    }
  }

  /**
   * Try alternative decline methods when primary APIs fail
   */
  private static tryAlternativeDeclineMethods(): void {
    console.log('Cookie Decliner: Trying alternative decline methods');
    
    // Method 2: Try SourcePoint specific API
    const windowWithAPI = window as WindowWithAPIs;
    if (windowWithAPI._sp_) {
      console.log('Cookie Decliner: Using SourcePoint _sp_ object');
      try {
        const sp = windowWithAPI._sp_;
        
        // Try different SourcePoint methods
        if (sp.config?.events?.onMessageChoiceSelect) {
          console.log('Cookie Decliner: Calling SourcePoint onMessageChoiceSelect with choice 11');
          sp.config.events.onMessageChoiceSelect({ choice: 11 });
        }
        
        if (typeof sp.executeMessaging === 'function') {
          console.log('Cookie Decliner: Calling SourcePoint executeMessaging');
          sp.executeMessaging();
        }
        
        // Try to find and call any choice-related functions
        Object.keys(sp).forEach(key => {
          if (key.toLowerCase().includes('choice') || key.toLowerCase().includes('decline')) {
            console.log('Cookie Decliner: Found SourcePoint method:', key, typeof sp[key]);
            const method = sp[key];
            if (typeof method === 'function') {
              try {
                (method as (arg: { choice: number }) => void)({ choice: 11 });
                console.log('Cookie Decliner: Called SourcePoint method:', key);
              } catch (e) {
                console.log('Cookie Decliner: Error calling SourcePoint method:', key, e);
              }
            }
          }
        });
        
      } catch (error) {
        console.log('Cookie Decliner: Error with SourcePoint API:', error);
      }
    }
    
    // Method 3: Try iframe communication
    this.tryIframeCommunication();
  }

  /**
   * Communicate with SourcePoint iframes
   */
  private static tryIframeCommunication(): void {
    const sourcePointIframes = document.querySelectorAll('iframe[id*="sp_message"], iframe[src*="sourcepoint"], iframe[src*="cmp"]');
    
    sourcePointIframes.forEach((iframe, index) => {
      const iframeElement = iframe as HTMLIFrameElement;
      if (iframeElement.contentWindow) {
        console.log(`Cookie Decliner: Attempting iframe communication with SourcePoint iframe ${index + 1}`);
        try {
          // Extract message ID from iframe if possible
          let messageId = '1301113'; // Default fallback
          const srcUrl = iframeElement.src;
          const idMatch = srcUrl.match(/message_id=(\d+)/);
          if (idMatch?.[1]) {
            messageId = idMatch[1];
            console.log(`Cookie Decliner: Detected message ID: ${messageId}`);
          }
          
          // Try different SourcePoint message formats
          const messages = [
            { type: 'sp.decline', action: 'decline' },
            { type: 'choice', action: 11 },
            { name: 'sp.choice', choice: 11 },
            { msgType: 'sp.decline' },
            { action: 'reject', type: 'all' },
            { messageId, choice: 11 },
            { name: 'sp.choiceSelect', choice: 11, messageId }
          ];
          
          messages.forEach((message, msgIndex) => {
            setTimeout(() => {
              console.log(`Cookie Decliner: Sending message ${msgIndex + 1} to iframe ${index + 1}:`, message);
              iframeElement.contentWindow?.postMessage(message, '*');
            }, msgIndex * 200);
          });
          
        } catch (error) {
          console.log(`Cookie Decliner: Error sending iframe messages to iframe ${index + 1}:`, error);
        }
      }
    });
  }

  /**
   * Check for global cookie consent APIs
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

  static setConsentProcessed(processed: boolean): void {
    this.consentProcessed = processed;
  }

  static isConsentProcessed(): boolean {
    return this.consentProcessed;
  }
}