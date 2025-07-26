import { EXCLUDE_KEYWORDS, COOKIE_KEYWORDS, getAllCookieKeywords } from '../../src/keywords';

describe('Keywords Configuration', () => {
  describe('Exclude Keywords', () => {
    it('contains common non-cookie button texts', () => {
      expect(EXCLUDE_KEYWORDS).toContain('login');
      expect(EXCLUDE_KEYWORDS).toContain('newsletter');
      expect(EXCLUDE_KEYWORDS).toContain('signin');
      expect(EXCLUDE_KEYWORDS).toContain('register');
    });

    it('uses lowercase for consistent matching', () => {
      EXCLUDE_KEYWORDS.forEach(keyword => {
        expect(keyword).toBe(keyword.toLowerCase());
      });
    });

    it('includes essential exclusion terms', () => {
      const essentialExclusions = ['signin', 'register', 'newsletter'];
      essentialExclusions.forEach(term => {
        expect(EXCLUDE_KEYWORDS).toContain(term);
      });
    });
  });

  describe('Cookie Keywords', () => {
    it('contains cookie-related terms', () => {
      expect(COOKIE_KEYWORDS).toContain('cookie');
      expect(COOKIE_KEYWORDS).toContain('consent');
      expect(COOKIE_KEYWORDS).toContain('privacy');
    });

    it('includes multi-language cookie terms', () => {
      expect(COOKIE_KEYWORDS).toContain('avvis'); // Norwegian
      expect(COOKIE_KEYWORDS).toContain('samtykke'); // Norwegian consent
      expect(COOKIE_KEYWORDS).toContain('decline'); // English decline
    });

    it('uses lowercase for consistent matching', () => {
      COOKIE_KEYWORDS.forEach(keyword => {
        expect(keyword).toBe(keyword.toLowerCase());
      });
    });
  });

  describe('Combined Keywords', () => {
    it('returns comprehensive cookie-related keywords', () => {
      // Act
      const allKeywords = getAllCookieKeywords();
      
      // Assert
      expect(allKeywords.length).toBeGreaterThan(COOKIE_KEYWORDS.length);
      
      // Should include base cookie keywords
      COOKIE_KEYWORDS.forEach(keyword => {
        expect(allKeywords).toContain(keyword);
      });
    });
  });
});