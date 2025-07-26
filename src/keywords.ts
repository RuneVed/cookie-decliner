// Keywords for button context validation
export const EXCLUDE_KEYWORDS = [
  'signin', 'login', 'account', 'user', 'profile', 'membership',
  'loyalty', 'newsletter', 'subscribe', 'register', 'checkout'
];

export const COOKIE_KEYWORDS = [
  'cookie', 'consent', 'privacy', 'gdpr', 'tracking', 'analytics',
  'decline', 'reject', 'deny', 'refuse', 'avvis', 'avslå',
  'personvern', 'samtykke', 'cookieinnstillinger', 'tilpass'
];

// Multi-language keywords for cookie-related content detection
export const COOKIE_CONTENT_KEYWORDS = {
  norwegian: [
    'cookie', 'samtykke', 'personvern', 'avvis', 'godta', 'tilpass',
    'cookieinnstillinger', 'persondata', 'sporingsteknologi'
  ],
  english: [
    'cookie', 'consent', 'privacy', 'accept', 'decline', 'reject',
    'manage', 'preferences', 'tracking', 'analytics'
  ],
  german: [
    'cookie', 'zustimmung', 'datenschutz', 'akzeptieren', 'ablehnen',
    'verwalten', 'einstellungen', 'verfolgung'
  ],
  french: [
    'cookie', 'consentement', 'confidentialité', 'accepter', 'refuser',
    'gérer', 'préférences', 'suivi'
  ]
};

// Get all cookie keywords in a flat array
export const getAllCookieKeywords = (): string[] => {
  return [
    ...COOKIE_KEYWORDS,
    ...Object.values(COOKIE_CONTENT_KEYWORDS).flat()
  ];
};