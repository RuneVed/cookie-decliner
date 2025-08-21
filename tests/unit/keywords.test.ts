import { EXCLUDE_KEYWORDS, COOKIE_KEYWORDS, getAllCookieKeywords } from '../../src/keywords';

describe('Keywords Configuration', () => {
  describe('Exclude Keywords', () => {
    it('contains common non-cookie button texts', () => {
      expect(EXCLUDE_KEYWORDS).toContain('login');
      expect(EXCLUDE_KEYWORDS).toContain('newsletter');
      expect(EXCLUDE_KEYWORDS).toContain('signin');
      expect(EXCLUDE_KEYWORDS).toContain('register');
    });
  });

  describe('Cookie Keywords', () => {
    it('contains cookie-related terms', () => {
      expect(COOKIE_KEYWORDS).toContain('cookie');
      expect(COOKIE_KEYWORDS).toContain('consent');
      expect(COOKIE_KEYWORDS).toContain('privacy');
    });

    it('includes Norwegian cookie terms', () => {
      expect(COOKIE_KEYWORDS).toContain('avvis'); // Norwegian
      expect(COOKIE_KEYWORDS).toContain('samtykke'); // Norwegian consent
      expect(COOKIE_KEYWORDS).toContain('personvern'); // Norwegian privacy
    });
  });

  describe('Combined Keywords', () => {
    it('returns comprehensive cookie-related keywords', () => {
      // Act
      const allKeywords = getAllCookieKeywords();
      
      // Assert
      expect(Array.isArray(allKeywords)).toBe(true);
      expect(allKeywords.length).toBeGreaterThan(0);
      
      // Should include base cookie keywords
      expect(allKeywords).toContain('cookie');
      expect(allKeywords).toContain('consent');
      expect(allKeywords).toContain('privacy');
      
      // Should include Norwegian terms
      expect(allKeywords).toContain('avvis');
      expect(allKeywords).toContain('samtykke');
      expect(allKeywords).toContain('personvern');
    });
  });
});