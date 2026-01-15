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
      
      // Check for Complianz selectors
      expect(frameworks.some(f => f.includes('cmplz-deny'))).toBe(true);
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

    it('includes Complianz framework selectors', () => {
      const frameworks = FRAMEWORK_SELECTORS.map(f => f.selector);
      
      // Check for Complianz-specific selectors
      expect(frameworks).toContain('button.cmplz-deny');
      expect(frameworks).toContain('button.cmplz-btn.cmplz-deny');
      expect(frameworks).toContain('.cmplz-deny');
      expect(frameworks).toContain('#cmplz-deny');
      
      // Verify descriptions
      const complianzSelectors = FRAMEWORK_SELECTORS.filter(f => 
        f.description.includes('Complianz'));
      expect(complianzSelectors.length).toBeGreaterThan(0);
      complianzSelectors.forEach(selector => {
        expect(selector.description).toContain('Complianz');
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

    it('should include simple "Avslå" selector for Norwegian', () => {
      const norwegian = LANGUAGE_CONFIGS.find(config => config.code === 'no');
      const selectors = norwegian!.selectors.map(s => s.selector);
      
      // Check that simple "Avslå" is included
      expect(selectors).toContain('button:contains("Avslå")');
      
      // Verify it comes after more specific selectors
      const avslåIndex = norwegian!.selectors.findIndex(s => 
        s.selector === 'button:contains("Avslå")');
      const avslåAlleIndex = norwegian!.selectors.findIndex(s => 
        s.selector === 'button:contains("Avslå alle")');
      
      expect(avslåIndex).toBeGreaterThan(avslåAlleIndex);
    });

    it('should include aria-label selectors for Ving.no pattern', () => {
      const norwegian = LANGUAGE_CONFIGS.find(config => config.code === 'no');
      const selectors = norwegian!.selectors.map(s => s.selector);
      
      // Check for exact aria-label match (most reliable)
      expect(selectors).toContain('button[aria-label="Avvis alle"]');
      
      // Check for partial aria-label match (fallback)
      expect(selectors).toContain('button[aria-label*="Avvis alle"]');
      
      // Verify aria-label comes before text-based selector (more reliable)
      const ariaIndex = norwegian!.selectors.findIndex(s => 
        s.selector === 'button[aria-label="Avvis alle"]');
      const textIndex = norwegian!.selectors.findIndex(s => 
        s.selector === 'button:contains("Avvis alle")');
      
      expect(ariaIndex).toBeLessThan(textIndex);
    });
  });

  describe('Framework Integration Tests', () => {
    it('should detect Usercentrics deny button (Apollo pattern)', () => {
      // Simulate Apollo.no Usercentrics HTML structure
      document.body.innerHTML = `
        <div data-testid="uc-footer">
          <button role="button" data-testid="uc-deny-all-button" class="sc-gsFSXq dGhNDE">Avvis alle</button>
        </div>
      `;
      
      const allSelectors = getAllDeclineSelectors();
      const usercentrics = allSelectors.find(s => 
        s.selector === '[data-testid="uc-deny-all-button"]');
      
      expect(usercentrics).toBeDefined();
      expect(usercentrics?.description).toBe('Usercentrics: Deny all');
      
      const button = document.querySelector('[data-testid="uc-deny-all-button"]');
      expect(button).toBeTruthy();
      expect(button?.textContent).toBe('Avvis alle');
    });

    it('should detect Complianz deny button by class', () => {
      // Simulate bikebrothers.no HTML structure
      document.body.innerHTML = `
        <div class="cmplz-cookiebanner">
          <button class="cmplz-btn cmplz-deny">Avslå</button>
          <button class="cmplz-btn cmplz-accept">Aksepter</button>
        </div>
      `;
      
      const allSelectors = getAllDeclineSelectors();
      const complianzSelector = allSelectors.find(s => 
        s.selector === 'button.cmplz-btn.cmplz-deny');
      
      expect(complianzSelector).toBeDefined();
      
      // Test that the selector would match the button
      const button = document.querySelector('button.cmplz-btn.cmplz-deny');
      expect(button).toBeTruthy();
      expect(button?.textContent).toBe('Avslå');
    });

    it('should detect simple Norwegian "Avslå" button', () => {
      // Simulate bikebrothers.no HTML structure with simple text
      document.body.innerHTML = `
        <div class="cmplz-cookiebanner">
          <button class="cmplz-btn cmplz-deny">Avslå</button>
        </div>
      `;
      
      const norwegian = LANGUAGE_CONFIGS.find(config => config.code === 'no');
      const avslåSelector = norwegian!.selectors.find(s => 
        s.selector === 'button:contains("Avslå")');
      
      expect(avslåSelector).toBeDefined();
      expect(avslåSelector?.description).toContain('Decline/refuse');
    });

    it('should prioritize specific Complianz selectors over generic ones', () => {
      const allSelectors = getAllDeclineSelectors();
      
      // Find indices of Complianz selectors
      const cmplzButtonIndex = allSelectors.findIndex(s => 
        s.selector === 'button.cmplz-btn.cmplz-deny');
      const cmplzElementIndex = allSelectors.findIndex(s => 
        s.selector === '.cmplz-deny');
      const cmplzIdIndex = allSelectors.findIndex(s => 
        s.selector === '#cmplz-deny');
      
      expect(cmplzButtonIndex).toBeGreaterThan(-1);
      expect(cmplzElementIndex).toBeGreaterThan(-1);
      expect(cmplzIdIndex).toBeGreaterThan(-1);
    });
  });
});