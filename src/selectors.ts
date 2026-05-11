// Language-specific cookie decline button selectors
export interface CookieSelector {
  selector: string;
  description: string;
  /** When true, clicking this button opens a deeper preferences panel — do not mark consent as processed */
  isExpandButton?: boolean;
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
      { selector: 'button:contains("Bare nødvendige")', description: 'Norwegian: Only necessary' },
      
      // Two-step process (fallback when direct decline not available)
      { selector: 'button:contains("Flere innstillinger")', description: 'Norwegian: More settings (step 1)' },
      { selector: 'button.deny-all-cookies', description: 'Norwegian: Reject all (CSS class, step 2)' },
      { selector: 'button[data-deny-all-cookies]', description: 'Norwegian: Reject all (data attribute, step 2)' },
      
      // Step 1: First-level rejection (get to settings page)
      { selector: 'button:contains("Tilpass eller avvis")', description: 'Norwegian: Customize or reject (step 1)' },
      
      // Step 2: Final rejection (settings page) - aria-label is more reliable than text content
      { selector: 'button[aria-label="Avvis alle"]', description: 'Norwegian: Reject all (aria-label, step 2)' },
      { selector: 'button:contains("Avvis alle")', description: 'Norwegian: Reject all (text, step 2)' },
      
      // Accept necessary only (privacy-friendly "accept" option)
      { selector: 'button:contains("Godta nødvendig")', description: 'Norwegian: Accept necessary only' },
      { selector: 'button:contains("Godta nødvendige")', description: 'Norwegian: Accept only necessary (variant)' },
      
      // Alternative Norwegian rejection patterns
      { selector: 'button[aria-label*="Avvis alle"]', description: 'Norwegian: Reject all (aria-label partial)' },
      { selector: 'button:contains("Avvis alle cookies")', description: 'Norwegian: Reject all cookies' },
      { selector: 'button:contains("Avslå alle cookies")', description: 'Norwegian: Decline all cookies' },
      { selector: 'button:contains("Avslå alle")', description: 'Norwegian: Decline all' },
      { selector: 'button:contains("Avslå")', description: 'Norwegian: Decline/refuse (simple)' },
      { selector: 'button:contains("Nødvendige kun")', description: 'Norwegian: Essential only' },
      { selector: 'button:contains("Kun nødvendige")', description: 'Norwegian: Only essential' },
      { selector: 'button:contains("Ikke tillat")', description: 'Norwegian: Don\'t allow' },
      { selector: 'button:contains("Administrer innstillinger")', description: 'Norwegian: Manage settings' },
      
      // Checkbox-based consent (MaxGaming pattern)
      { selector: 'button:contains("Lagre & lukk")', description: 'Norwegian: Save & close (after unchecking options)' },
      { selector: 'div[id*="cookie_consent_manager_confirm"]', description: 'Norwegian: Cookie manager confirm button' },
      { selector: 'button:contains("Lagre innstillinger")', description: 'Norwegian: Save settings' }
    ]
  },
  {
    code: 'en',
    name: 'English',
    selectors: [
      // Direct decline (preferred — single click)
      { selector: 'button:contains("Only necessary cookies")', description: 'English: Only necessary cookies' },
      { selector: 'button:contains("Only necessary")', description: 'English: Only necessary' },
      { selector: 'button:contains("Only essential")', description: 'English: Only essential' },
      { selector: 'button:contains("Necessary only")', description: 'English: Necessary only' },
      { selector: 'button:contains("Essential only")', description: 'English: Essential only' },
      { selector: 'button:contains("Use necessary cookies only")', description: 'English: Use necessary cookies only' },

      // Two-step entry (open preferences) — clicking these reveals a modal with the real reject button (e.g. NYT/Fides).
      // Must use isExpandButton: true so the MutationObserver stays alive to catch the modal's final reject.
      { selector: 'button:contains("More options")', description: 'English: More options (step 1)', isExpandButton: true },
      { selector: 'button:contains("More settings")', description: 'English: More settings (step 1)', isExpandButton: true },
      { selector: 'button:contains("Manage settings")', description: 'English: Manage settings (step 1)', isExpandButton: true },
      { selector: 'button:contains("Manage preferences")', description: 'English: Manage preferences (step 1)', isExpandButton: true },
      { selector: 'button:contains("Cookie settings")', description: 'English: Cookie settings (step 1)', isExpandButton: true },
      { selector: 'button:contains("Cookie preferences")', description: 'English: Cookie preferences (step 1)', isExpandButton: true },
      { selector: 'button:contains("Customize")', description: 'English: Customize (step 1)', isExpandButton: true },
      { selector: 'button:contains("Customise")', description: 'English: Customise en-GB (step 1)', isExpandButton: true },

      // Final reject — aria-label first (most reliable)
      { selector: 'button[aria-label="Reject all"]', description: 'English: Reject all (aria-label)' },
      { selector: 'button[aria-label="Decline all"]', description: 'English: Decline all (aria-label)' },
      { selector: 'button[aria-label="Refuse all"]', description: 'English: Refuse all (aria-label)' },
      { selector: 'button[aria-label*="Reject all"]', description: 'English: Reject all (aria-label partial)' },
      { selector: 'button[aria-label*="Decline all"]', description: 'English: Decline all (aria-label partial)' },
      { selector: 'a[aria-label="Reject All" i]', description: 'English: Reject all (link, case-insensitive, SourcePoint pattern)' },
      { selector: 'button[aria-label="Withdraw Consent" i]', description: 'English: Withdraw consent (SourcePoint privacy manager)' },

      // Final reject — text
      { selector: 'button:contains("Reject all cookies")', description: 'English: Reject all cookies' },
      { selector: 'button:contains("Decline all cookies")', description: 'English: Decline all cookies' },
      { selector: 'button:contains("Reject all")', description: 'English: Reject all' },
      { selector: 'button:contains("Decline all")', description: 'English: Decline all' },
      { selector: 'button:contains("Refuse all")', description: 'English: Refuse all' },
      { selector: 'button:contains("Deny all")', description: 'English: Deny all' },
      { selector: 'button:contains("Do not accept")', description: 'English: Do not accept (Quantcast pattern)' },
      { selector: 'button:contains("Do not allow")', description: 'English: Do not allow' },
      { selector: 'button:contains("Withdraw Consent")', description: 'English: Withdraw consent (SourcePoint text)' },
      { selector: 'a:contains("Reject All")', description: 'English: Reject all (link text, SourcePoint pattern)' },

      // Save/confirm (after checkbox flow)
      { selector: 'button:contains("Save and close")', description: 'English: Save and close' },
      { selector: 'button:contains("Save & close")', description: 'English: Save & close' },
      { selector: 'button:contains("Save preferences")', description: 'English: Save preferences' },
      { selector: 'button:contains("Save settings")', description: 'English: Save settings' },
      { selector: 'button:contains("Confirm my choices")', description: 'English: Confirm my choices' },
      { selector: 'button:contains("Confirm choices")', description: 'English: Confirm choices' }
    ]
  }
];

// Framework-specific selectors
export const FRAMEWORK_SELECTORS: CookieSelector[] = [
  // Generic consent_needed_only class (e.g., norskenettbutikker.no)
  { selector: 'button.consent_needed_only', description: 'Consent: Necessary only button (CSS class)' },

  // Didomi CMP (used by cdon.com)
  // Step 1: Open preferences panel — do NOT mark consent as processed
  { selector: '#didomi-notice-learn-more-button', description: 'Didomi: Open preferences panel (step 1)', isExpandButton: true },
  { selector: 'button.didomi-learn-more-button', description: 'Didomi: Learn more button (step 1)', isExpandButton: true },

  // Step 2: Decline all in preferences panel
  { selector: '#btn-toggle-disagree', description: 'Didomi: Decline all (step 2)' },

  // Cookie Information specific selectors (hjemla.no uses this)
  { selector: 'button.coi-consent-banner__decline-button', description: 'Cookie Information: Decline button' },
  { selector: '.coi-consent-banner__decline-button', description: 'Cookie Information: Decline element' },
  { selector: '#coiConsentBanner button:contains("Avvis alle")', description: 'Cookie Information: Avvis alle in banner' },
  { selector: '#coiConsentBanner [onclick*="decline"], #coiConsentBanner [onclick*="reject"]', description: 'Cookie Information: Decline/reject onclick' },

  // Fides CMP (Ethyca) - used by NYT and other sites
  { selector: '#fides-reject-all-button', description: 'Fides: Reject all (by ID)' },
  { selector: 'button.fides-reject-all-button', description: 'Fides: Reject all (button class)' },
  { selector: '.fides-reject-all-button', description: 'Fides: Reject all (element class)' },

  // Complianz cookie consent manager (cmplz)
  { selector: 'button.cmplz-deny', description: 'Complianz: Deny button' },
  { selector: 'button.cmplz-btn.cmplz-deny', description: 'Complianz: Deny button (full class)' },
  { selector: '.cmplz-deny', description: 'Complianz: Deny element' },
  { selector: '#cmplz-deny', description: 'Complianz: Deny by ID' },

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

  // Didomi CMP selectors
  // Step 2 (used by handleDidomiPreferences in dom-utils):
  //   #btn-toggle-disagree → "Avslå alle"
  //   #btn-toggle-save    → "Lagre" (enabled after clicking disagree)
  // NOTE: #didomi-notice-learn-more-button is intentionally NOT here —
  //       it opens the preferences panel but does not decline cookies.
  //       handleDidomiPreferences() handles the full two-step flow.
  
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