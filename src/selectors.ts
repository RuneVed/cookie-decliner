// Language-specific cookie decline button selectors
export interface CookieSelector {
  selector: string;
  description: string;
}

export interface LanguageConfig {
  code: string;
  name: string;
  selectors: CookieSelector[];
}

export const LANGUAGE_CONFIGS: LanguageConfig[] = [
  {
    code: 'no',
    name: 'Norwegian',
    selectors: [
      // Direct decline options (preferred - single click)
      { selector: 'button.save-necessary-cookie-button', description: 'Norwegian: Only necessary cookies (CSS class)' },
      { selector: 'button:contains("Bare nødvendige cookies")', description: 'Norwegian: Only necessary cookies' },
      
      // Two-step process (fallback when direct decline not available)
      { selector: 'button:contains("Flere innstillinger")', description: 'Norwegian: More settings (step 1)' },
      { selector: 'button.deny-all-cookies', description: 'Norwegian: Reject all (CSS class, step 2)' },
      { selector: 'button[data-deny-all-cookies]', description: 'Norwegian: Reject all (data attribute, step 2)' },
      
      // Step 1: First-level rejection (get to settings page)
      { selector: 'button:contains("Tilpass eller avvis")', description: 'Norwegian: Customize or reject (step 1)' },
      
      // Step 2: Final rejection (settings page)
      { selector: 'button:contains("Avvis alle")', description: 'Norwegian: Reject all (step 2)' },
      
      // Alternative Norwegian rejection patterns
      { selector: 'button:contains("Avvis alle cookies")', description: 'Norwegian: Reject all cookies' },
      { selector: 'button:contains("Avslå alle cookies")', description: 'Norwegian: Decline all cookies' },
      { selector: 'button:contains("Avslå alle")', description: 'Norwegian: Decline all' },
      { selector: 'button:contains("Nødvendige kun")', description: 'Norwegian: Essential only' },
      { selector: 'button:contains("Kun nødvendige")', description: 'Norwegian: Only essential' },
      { selector: 'button:contains("Ikke tillat")', description: 'Norwegian: Don\'t allow' },
      { selector: 'button:contains("Administrer innstillinger")', description: 'Norwegian: Manage settings' }
    ]
  }
];

// Framework-specific selectors
export const FRAMEWORK_SELECTORS: CookieSelector[] = [
  // Cookie Information specific selectors (hjemla.no uses this)
  { selector: 'button.coi-consent-banner__decline-button', description: 'Cookie Information: Decline button' },
  { selector: '.coi-consent-banner__decline-button', description: 'Cookie Information: Decline element' },
  { selector: '#coiConsentBanner button:contains("Avvis alle")', description: 'Cookie Information: Avvis alle in banner' },
  { selector: '#coiConsentBanner [onclick*="decline"], #coiConsentBanner [onclick*="reject"]', description: 'Cookie Information: Decline/reject onclick' },

  // SourcePoint specific selectors - CORRECTED PRIORITY ORDER
  // Step 1: First-level selectors (initial popup - get to settings)
  { selector: 'button.sp_choice_type_12', description: 'SourcePoint: Customize/reject (step 1)' },
  { selector: '.sp_choice_type_12', description: 'SourcePoint: Customize/reject element (step 1)' },
  
  // Step 2: Final rejection selectors (settings page - actual reject)
  { selector: 'button.sp_choice_type_REJECT_ALL', description: 'SourcePoint: Reject all (step 2)' },
  { selector: '.sp_choice_type_REJECT_ALL', description: 'SourcePoint: Reject all element (step 2)' },
  
  // Generic SourcePoint attribute selectors
  { selector: 'button[title*="Avvis"]', description: 'SourcePoint: Avvis button (title)' },
  { selector: 'button[aria-label*="Avvis"]', description: 'SourcePoint: Avvis button (aria-label)' },
  { selector: 'button[title*="Reject"]', description: 'SourcePoint: Reject button (title)' },
  { selector: 'button[aria-label*="Reject"]', description: 'SourcePoint: Reject button (aria-label)' },
  
  // REMOVED INCORRECT SELECTORS:
  // { selector: '.sp_choice_type_11', description: 'SourcePoint: Reject all button' }, // ❌ This is ACCEPT ALL
  // { selector: 'button.sp_choice_type_11', description: 'SourcePoint: Reject button element' }, // ❌ This is ACCEPT ALL
  
  // Major framework selectors
  { selector: '#CybotCookiebotDialogBodyButtonDecline', description: 'Cookiebot: Decline' },
  { selector: '.ot-pc-refuse-all-handler', description: 'OneTrust: Refuse all' },
  { selector: '[data-testid="uc-deny-all-button"]', description: 'Usercentrics: Deny all' },
  { selector: '[data-testid="cookie-banner-decline"]', description: 'Generic cookie banner decline' },
  
  // Generic attribute selectors
  { selector: 'button[data-testid*="cookie"][data-testid*="decline"]:not([data-testid*="signin"]):not([data-testid*="login"])', description: 'Cookie decline (excluding login)' },
  { selector: 'button[data-testid*="cookie"][data-testid*="reject"]:not([data-testid*="signin"]):not([data-testid*="login"])', description: 'Cookie reject (excluding login)' },
  { selector: 'button[id*="cookie"][id*="decline"]', description: 'Cookie ID decline' },
  { selector: 'button[class*="cookie"][class*="decline"]', description: 'Cookie class decline' },
  { selector: 'button[class*="cookie"][class*="reject"]', description: 'Cookie class reject' }
];

// Generate combined selectors from all languages and frameworks
export const getAllDeclineSelectors = (): CookieSelector[] => {
  const languageSelectors = LANGUAGE_CONFIGS.flatMap(lang => lang.selectors);
  return [...languageSelectors, ...FRAMEWORK_SELECTORS];
};