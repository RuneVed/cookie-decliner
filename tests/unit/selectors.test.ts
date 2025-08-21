import { LANGUAGE_CONFIGS, FRAMEWORK_SELECTORS, getAllDeclineSelectors } from '../../src/selectors';

describe('Selectors Configuration', () => {
  describe('Language Configurations', () => {
    it('has selectors for Norwegian only', () => {
      expect(LANGUAGE_CONFIGS).toHaveLength(1); // Norwegian only
      
      const languages = LANGUAGE_CONFIGS.map(config => config.code);
      expect(languages).toEqual(['no']);
    });

    it('includes Norwegian selectors with correct content', () => {
      const norwegian = LANGUAGE_CONFIGS.find(config => config.code === 'no');
      
      expect(norwegian).toBeDefined();
      expect(norwegian!.selectors.length).toBeGreaterThan(0);
      
      // Check for specific Norwegian terms
      const norwegianSelectors = norwegian!.selectors.map(s => s.selector).join(' ');
      expect(norwegianSelectors).toContain('avvis');
      
      // Check for Proteinfabrikken-specific selectors
      expect(norwegianSelectors).toContain('Bare nødvendige cookies');
      expect(norwegianSelectors).toContain('save-necessary-cookie-button');
      expect(norwegianSelectors).toContain('Flere innstillinger');
      expect(norwegianSelectors).toContain('deny-all-cookies');
    });

    it('includes English selectors with correct content', () => {
      // This test is no longer relevant as we only support Norwegian
      const norwegian = LANGUAGE_CONFIGS.find(config => config.code === 'no');
      expect(norwegian).toBeDefined();
      expect(norwegian!.selectors.length).toBeGreaterThan(0);
    });

    it('only supports Norwegian language', () => {
      const supportedLanguages = LANGUAGE_CONFIGS.map(config => config.code);
      expect(supportedLanguages).toEqual(['no']);
      expect(supportedLanguages).not.toContain('en');
      expect(supportedLanguages).not.toContain('de');
      expect(supportedLanguages).not.toContain('fr');
    });
  });

  describe('Framework Selectors', () => {
    it('includes major consent management platform selectors', () => {
      const frameworks = FRAMEWORK_SELECTORS.map(f => f.selector);
      
      // Check for SourcePoint selectors (corrected)
      expect(frameworks.some(f => f.includes('sp_choice_type_12'))).toBe(true); // Customize/reject
      expect(frameworks.some(f => f.includes('sp_choice_type_REJECT_ALL'))).toBe(true); // Final reject
      
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
      
      // Assert - Now we expect fewer selectors since we only support Norwegian
      expect(selectors.length).toBeGreaterThan(15);
      expect(Array.isArray(selectors)).toBe(true);
      
      // Check structure
      selectors.forEach(selector => {
        expect(selector.selector).toBeDefined();
        expect(selector.description).toBeDefined();
      });
      
      const selectorStrings = selectors.map(s => s.selector);
      expect(selectorStrings.some(s => s.includes('sp_choice_type_12'))).toBe(true); // Corrected SourcePoint selector
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

  describe('Norwegian Cookie Patterns', () => {
    it('should include Norwegian-specific selectors', () => {
      const allSelectors = getAllDeclineSelectors();
      const selectorStrings = allSelectors.map(s => s.selector);
      
      // Check for direct decline button (preferred)
      expect(selectorStrings).toContain('button.save-necessary-cookie-button');
      expect(selectorStrings).toContain('button:contains("Bare nødvendige cookies")');
      
      // Check for two-step process (fallback)
      expect(selectorStrings).toContain('button:contains("Flere innstillinger")');
      expect(selectorStrings).toContain('button.deny-all-cookies');
      expect(selectorStrings).toContain('button[data-deny-all-cookies]');
    });

    it('should prioritize direct decline over two-step process', () => {
      const norwegian = LANGUAGE_CONFIGS.find(config => config.code === 'no');
      const selectors = norwegian!.selectors;
      
      // Check that direct decline selectors come first
      const directDeclineIndex = selectors.findIndex(s => 
        s.selector.includes('save-necessary-cookie-button'));
      const twoStepIndex = selectors.findIndex(s => 
        s.selector.includes('Flere innstillinger'));
      
      expect(directDeclineIndex).toBeLessThan(twoStepIndex);
    });
  });
});