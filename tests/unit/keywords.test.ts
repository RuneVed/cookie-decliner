import { EXCLUDE_KEYWORDS, COOKIE_KEYWORDS, getAllCookieKeywords } from '../../src/keywords';

describe('Keywords Configuration', () => {
  describe('Exclude Keywords', () => {
    test('should contain common non-cookie button texts', () => {
      expect(EXCLUDE_KEYWORDS).toContain('login');
      expect(EXCLUDE_KEYWORDS).toContain('newsletter');
      expect(EXCLUDE_KEYWORDS).toContain('signin');
      expect(EXCLUDE_KEYWORDS).toContain('register');
    });

    test('should be all lowercase for consistent matching', () => {
      EXCLUDE_KEYWORDS.forEach(keyword => {
        expect(keyword).toBe(keyword.toLowerCase());
      });
    });

    test('should include common exclusions', () => {
      expect(EXCLUDE_KEYWORDS).toContain('signin');
      expect(EXCLUDE_KEYWORDS).toContain('register');
      expect(EXCLUDE_KEYWORDS).toContain('newsletter');
    });
  });

  describe('Cookie Keywords', () => {
    test('should contain cookie-related terms', () => {
      expect(COOKIE_KEYWORDS).toContain('cookie');
      expect(COOKIE_KEYWORDS).toContain('consent');
      expect(COOKIE_KEYWORDS).toContain('privacy');
    });

    test('should include multi-language cookie terms', () => {
      expect(COOKIE_KEYWORDS).toContain('avvis'); // Norwegian
      expect(COOKIE_KEYWORDS).toContain('samtykke'); // Norwegian consent
      expect(COOKIE_KEYWORDS).toContain('decline'); // English decline
    });

    test('should be all lowercase for consistent matching', () => {
      COOKIE_KEYWORDS.forEach(keyword => {
        expect(keyword).toBe(keyword.toLowerCase());
      });
    });
  });

  describe('Combined Keywords', () => {
    test('should return all cookie-related keywords', () => {
      const allKeywords = getAllCookieKeywords();
      expect(allKeywords.length).toBeGreaterThan(COOKIE_KEYWORDS.length);
      
      // Should include base cookie keywords
      COOKIE_KEYWORDS.forEach(keyword => {
        expect(allKeywords).toContain(keyword);
      });
    });
  });
});