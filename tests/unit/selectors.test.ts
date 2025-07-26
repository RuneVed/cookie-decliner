import { LANGUAGE_CONFIGS, getAllDeclineSelectors, FRAMEWORK_SELECTORS } from '../../src/selectors';

describe('Selectors Configuration', () => {
  describe('Language Configurations', () => {
    test('should have selectors for all supported languages', () => {
      expect(LANGUAGE_CONFIGS).toHaveLength(4); // Norwegian, English, German, French
      
      const languages = LANGUAGE_CONFIGS.map(config => config.code);
      expect(languages).toEqual(['no', 'en', 'de', 'fr']);
    });

    test('should have Norwegian selectors with correct content', () => {
      const norwegian = LANGUAGE_CONFIGS.find(config => config.code === 'no');
      expect(norwegian).toBeDefined();
      expect(norwegian!.name).toBe('Norwegian');
      expect(norwegian!.selectors.length).toBeGreaterThan(5);
      
      const selectorTexts = norwegian!.selectors.map(s => s.selector);
      expect(selectorTexts.some(s => s.includes('Avvis alle'))).toBe(true);
      expect(selectorTexts.some(s => s.includes('Tilpass eller avvis'))).toBe(true);
    });

    test('should have English selectors with correct content', () => {
      const english = LANGUAGE_CONFIGS.find(config => config.code === 'en');
      expect(english).toBeDefined();
      expect(english!.selectors.some(s => s.selector.includes('Reject all'))).toBe(true);
      expect(english!.selectors.some(s => s.selector.includes('Decline all'))).toBe(true);
    });

    test('should have German and French selectors', () => {
      const german = LANGUAGE_CONFIGS.find(config => config.code === 'de');
      const french = LANGUAGE_CONFIGS.find(config => config.code === 'fr');
      
      expect(german).toBeDefined();
      expect(french).toBeDefined();
      expect(german!.selectors.some(s => s.selector.includes('Alle ablehnen'))).toBe(true);
      expect(french!.selectors.some(s => s.selector.includes('Tout refuser'))).toBe(true);
    });
  });

  describe('Framework Selectors', () => {
    test('should include major consent management platforms', () => {
      const frameworks = FRAMEWORK_SELECTORS.map(f => f.selector);
      
      // Should include SourcePoint
      expect(frameworks.some(f => f.includes('sp_choice_type_11'))).toBe(true);
      
      // Should include Cookiebot
      expect(frameworks.some(f => f.includes('CybotCookiebotDialogBodyButtonDecline'))).toBe(true);
      
      // Should include OneTrust
      expect(frameworks.some(f => f.includes('ot-pc-refuse-all-handler'))).toBe(true);
    });

    test('should have proper descriptions for frameworks', () => {
      FRAMEWORK_SELECTORS.forEach(selector => {
        expect(selector.description).toBeDefined();
        expect(selector.description.length).toBeGreaterThan(5);
      });
    });
  });

  describe('Selector Generation', () => {
    test('should generate combined selectors correctly', () => {
      const selectors = getAllDeclineSelectors();
      
      expect(selectors.length).toBeGreaterThan(30);
      expect(Array.isArray(selectors)).toBe(true);
      
      // Should include language-specific selectors
      const selectorStrings = selectors.map(s => s.selector);
      expect(selectorStrings.some(s => s.includes('Avvis alle'))).toBe(true);
      expect(selectorStrings.some(s => s.includes('Reject all'))).toBe(true);
      
      // Should include framework selectors
      expect(selectorStrings.some(s => s.includes('sp_choice_type_11'))).toBe(true);
    });

    test('should not have duplicate selectors', () => {
      const selectors = getAllDeclineSelectors();
      const selectorStrings = selectors.map(s => s.selector);
      const uniqueSelectors = [...new Set(selectorStrings)];
      
      expect(selectorStrings.length).toBe(uniqueSelectors.length);
    });
  });
});