import { LANGUAGE_CONFIGS, FRAMEWORK_SELECTORS, getAllDeclineSelectors } from '../../src/selectors';

describe('Selectors Configuration', () => {
  describe('Language Configurations', () => {
    it('has selectors for all supported languages', () => {
      expect(LANGUAGE_CONFIGS).toHaveLength(4); // Norwegian, English, German, French
      
      const languages = LANGUAGE_CONFIGS.map(config => config.code);
      expect(languages).toEqual(['no', 'en', 'de', 'fr']);
    });

    it('includes Norwegian selectors with correct content', () => {
      const norwegian = LANGUAGE_CONFIGS.find(config => config.code === 'no');
      
      expect(norwegian).toBeDefined();
      expect(norwegian!.selectors.length).toBeGreaterThan(0);
      
      // Check for specific Norwegian terms
      const norwegianSelectors = norwegian!.selectors.map(s => s.selector).join(' ');
      expect(norwegianSelectors).toContain('avvis');
    });

    it('includes English selectors with correct content', () => {
      const english = LANGUAGE_CONFIGS.find(config => config.code === 'en');
      
      expect(english).toBeDefined();
      expect(english!.selectors.length).toBeGreaterThan(0);
      
      // Check for specific English terms (case-insensitive)
      const englishSelectors = english!.selectors.map(s => s.selector).join(' ').toLowerCase();
      expect(englishSelectors).toContain('decline');
      expect(englishSelectors).toContain('reject');
    });

    it('includes German and French selectors', () => {
      const german = LANGUAGE_CONFIGS.find(config => config.code === 'de');
      const french = LANGUAGE_CONFIGS.find(config => config.code === 'fr');
      
      expect(german).toBeDefined();
      expect(french).toBeDefined();
      
      expect(german!.selectors.length).toBeGreaterThan(0);
      expect(french!.selectors.length).toBeGreaterThan(0);
    });
  });

  describe('Framework Selectors', () => {
    it('includes major consent management platform selectors', () => {
      const frameworks = FRAMEWORK_SELECTORS.map(f => f.selector);
      
      // Check for SourcePoint selectors
      expect(frameworks.some(f => f.includes('sp_choice_type_11'))).toBe(true);
      
      // Check for OneTrust selectors  
      expect(frameworks.some(f => f.includes('ot-pc-refuse-all-handler'))).toBe(true);
    });

    it('should have proper descriptions for frameworks', () => {
      // Arrange & Act
      const frameworks = FRAMEWORK_SELECTORS;
      
      // Assert
      frameworks.forEach(selector => {
        expect(selector.description).toBeDefined();
        expect(selector.description.length).toBeGreaterThan(5);
      });
    });
  });

  describe('Selector Generation', () => {
    it('should generate combined selectors correctly', () => {
      // Arrange & Act
      const selectors = getAllDeclineSelectors();
      
      // Assert
      expect(selectors.length).toBeGreaterThan(30);
      expect(Array.isArray(selectors)).toBe(true);
      
      // Check structure
      selectors.forEach(selector => {
        expect(selector.selector).toBeDefined();
        expect(selector.description).toBeDefined();
      });
      
      const selectorStrings = selectors.map(s => s.selector);
      expect(selectorStrings.some(s => s.includes('sp_choice_type_11'))).toBe(true);
    });

    it('should not have duplicate selectors', () => {
      // Arrange & Act
      const selectors = getAllDeclineSelectors();
      const selectorStrings = selectors.map(s => s.selector);
      const uniqueSelectors = [...new Set(selectorStrings)];
      
      // Assert
      expect(selectorStrings.length).toBe(uniqueSelectors.length);
    });
  });
});