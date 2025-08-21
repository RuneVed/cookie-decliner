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
      { selector: 'button:contains("Avvis alle")', description: 'Norwegian: Reject all' },
      { selector: 'button:contains("Tilpass eller avvis")', description: 'Norwegian: Customize or reject' },
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
  // SourcePoint specific selectors
  { selector: 'button[title*="Avvis"]', description: 'SourcePoint: Avvis button (title)' },
  { selector: 'button[aria-label*="Avvis"]', description: 'SourcePoint: Avvis button (aria-label)' },
  { selector: 'button[title*="Reject"]', description: 'SourcePoint: Reject button (title)' },
  { selector: 'button[aria-label*="Reject"]', description: 'SourcePoint: Reject button (aria-label)' },
  { selector: '.sp_choice_type_11', description: 'SourcePoint: Reject all button' },
  { selector: '.sp_choice_type_12', description: 'SourcePoint: Accept all button' },
  { selector: 'button.sp_choice_type_11', description: 'SourcePoint: Reject button element' },
  
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