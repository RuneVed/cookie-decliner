import { FRAMEWORK_SELECTORS, getAllDeclineSelectors } from '../../src/selectors';
import { DOMUtils } from '../../src/dom-utils';

describe('Didomi CMP two-step flow', () => {
  describe('selectors', () => {
    it('includes step-1 expand button selector for #didomi-notice-learn-more-button', () => {
      const selector = FRAMEWORK_SELECTORS.find(s => s.selector === '#didomi-notice-learn-more-button');
      expect(selector).toBeDefined();
      expect(selector?.isExpandButton).toBe(true);
    });

    it('includes step-1 expand button selector for button.didomi-learn-more-button', () => {
      const selector = FRAMEWORK_SELECTORS.find(s => s.selector === 'button.didomi-learn-more-button');
      expect(selector).toBeDefined();
      expect(selector?.isExpandButton).toBe(true);
    });

    it('includes step-2 decline selector for #btn-toggle-disagree', () => {
      const selector = FRAMEWORK_SELECTORS.find(s => s.selector === '#btn-toggle-disagree');
      expect(selector).toBeDefined();
      expect(selector?.isExpandButton).toBeFalsy();
    });

    it('step-2 decline selector is listed after step-1 expand selectors in the combined list', () => {
      const all = getAllDeclineSelectors();
      const expandIdx = all.findIndex(s => s.selector === '#didomi-notice-learn-more-button');
      const declineIdx = all.findIndex(s => s.selector === '#btn-toggle-disagree');
      expect(expandIdx).toBeGreaterThanOrEqual(0);
      expect(declineIdx).toBeGreaterThanOrEqual(0);
      expect(declineIdx).toBeGreaterThan(expandIdx);
    });
  });

  describe('step-1 expand button interaction', () => {
    let learnMoreBtn: HTMLButtonElement;

    beforeEach(() => {
      document.body.innerHTML = `
        <div id="didomi-host">
          <div class="didomi-popup-container">
            <p>Cookies og lignende teknologier</p>
            <div id="buttons">
              <button id="didomi-notice-learn-more-button" class="didomi-learn-more-button" style="width: 120px; height: 40px;">
                <span>Les mer →</span>
              </button>
              <button id="didomi-notice-agree-button" style="width: 120px; height: 40px;">
                <span>Godta og lukk</span>
              </button>
            </div>
          </div>
        </div>
      `;
      learnMoreBtn = document.getElementById('didomi-notice-learn-more-button') as HTMLButtonElement;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('expand button is found by DOMUtils.findElementsBySelector', () => {
      const results = DOMUtils.findElementsBySelector('#didomi-notice-learn-more-button');
      expect(results).toHaveLength(1);
      expect(results[0]).toBe(learnMoreBtn);
    });

    it('expand button is visible', () => {
      expect(DOMUtils.isElementVisible(learnMoreBtn)).toBe(true);
    });

    it('expand button passes cookie-related validation', () => {
      expect(DOMUtils.isCookieRelatedButton(learnMoreBtn)).toBe(true);
    });
  });

  describe('step-2 decline button interaction', () => {
    let declineAllBtn: HTMLButtonElement;

    beforeEach(() => {
      document.body.innerHTML = `
        <div class="didomi-consent-popup-preferences-purposes">
          <div class="didomi-consent-popup-footer">
            <div class="didomi-buttons-all-container">
              <button id="btn-toggle-disagree" aria-label="Avslå alle: Avslå databehandlingen vår og lukk" style="width: 120px; height: 40px;">
                <span>Avslå alle</span>
              </button>
              <button id="btn-toggle-agree" aria-label="Godta alle: Godta databehandlingen vår og lukk" style="width: 120px; height: 40px;">
                <span>Godta alle</span>
              </button>
            </div>
          </div>
        </div>
      `;
      declineAllBtn = document.getElementById('btn-toggle-disagree') as HTMLButtonElement;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('decline-all button is found by DOMUtils.findElementsBySelector', () => {
      const results = DOMUtils.findElementsBySelector('#btn-toggle-disagree');
      expect(results).toHaveLength(1);
      expect(results[0]).toBe(declineAllBtn);
    });

    it('decline-all button is visible', () => {
      expect(DOMUtils.isElementVisible(declineAllBtn)).toBe(true);
    });

    it('decline-all button passes cookie-related validation', () => {
      expect(DOMUtils.isCookieRelatedButton(declineAllBtn)).toBe(true);
    });

    it('decline-all button text is recognised via :contains selector', () => {
      const results = DOMUtils.findElementsBySelector('button:contains("Avslå alle")');
      expect(results.some(el => el === declineAllBtn)).toBe(true);
    });
  });

  describe('isExpandButton flag contract', () => {
    it('no standard decline selectors have isExpandButton set to true', () => {
      const falsePositives = FRAMEWORK_SELECTORS.filter(
        s => s.isExpandButton === true && !s.description.includes('step 1')
      );
      expect(falsePositives).toHaveLength(0);
    });

    it('all selectors without isExpandButton treat the flag as falsy', () => {
      const all = getAllDeclineSelectors();
      const withoutFlag = all.filter(s => !s.isExpandButton);
      for (const s of withoutFlag) {
        expect(Boolean(s.isExpandButton)).toBe(false);
      }
    });
  });
});
