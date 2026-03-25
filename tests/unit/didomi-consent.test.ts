import { DOMUtils } from '../../src/dom-utils';

// Helper: create a visible button and append to body
function createVisibleButton(id: string, text: string, disabled = false): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.id = id;
  btn.textContent = text;
  btn.style.display = 'block';
  btn.style.width = '100px';
  btn.style.height = '40px';
  if (disabled) btn.disabled = true;
  document.body.appendChild(btn);
  return btn;
}

// Helper: create the initial Didomi popup (only "Les mer" button visible)
function createInitialPopup(): HTMLButtonElement {
  return createVisibleButton('didomi-notice-learn-more-button', 'Les mer →');
}

// Helper: create the Didomi preferences panel with both action buttons
function createPreferencesPanel(saveDisabled = true): { disagreeBtn: HTMLButtonElement; saveBtn: HTMLButtonElement } {
  const disagreeBtn = createVisibleButton('btn-toggle-disagree', 'Avslå alle');
  const saveBtn = createVisibleButton('btn-toggle-save', 'Lagre', saveDisabled);
  return { disagreeBtn, saveBtn };
}

describe('Didomi Preferences Consent Handler', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  describe('handleDidomiPreferences – no Didomi elements present', () => {
    it('should return false when no Didomi elements are in the DOM', () => {
      expect(DOMUtils.handleDidomiPreferences()).toBe(false);
    });
  });

  describe('handleDidomiPreferences – Phase 1 (initial popup)', () => {
    it('should click "Les mer" and return false when preferences panel is not yet open', () => {
      const learnMoreBtn = createInitialPopup();
      const learnMoreClick = jest.spyOn(learnMoreBtn, 'click');
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = DOMUtils.handleDidomiPreferences();

      expect(learnMoreClick).toHaveBeenCalledTimes(1);
      expect(result).toBe(false); // consent must NOT be marked yet
      expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: Opening Didomi preferences panel ("Les mer")');

      consoleSpy.mockRestore();
    });

    it('should not click "Les mer" a second time if already clicked (guard attribute)', () => {
      const learnMoreBtn = createInitialPopup();
      learnMoreBtn.dataset.cookieDeclinerClicked = '1';
      const learnMoreClick = jest.spyOn(learnMoreBtn, 'click');

      const result = DOMUtils.handleDidomiPreferences();

      expect(learnMoreClick).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should return false and not click "Les mer" when it is not visible', () => {
      const learnMoreBtn = createInitialPopup();
      learnMoreBtn.style.display = 'none';
      const learnMoreClick = jest.spyOn(learnMoreBtn, 'click');

      const result = DOMUtils.handleDidomiPreferences();

      expect(learnMoreClick).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('handleDidomiPreferences – Phase 2 (preferences panel open)', () => {
    it('should return false when preferences panel is present but disagree is not visible', () => {
      const { disagreeBtn } = createPreferencesPanel();
      disagreeBtn.style.display = 'none';

      expect(DOMUtils.handleDidomiPreferences()).toBe(false);
    });

    it('should click disagree and return false when save is still disabled', () => {
      const { disagreeBtn, saveBtn } = createPreferencesPanel(true);
      const disagreeClick = jest.spyOn(disagreeBtn, 'click');
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = DOMUtils.handleDidomiPreferences();

      expect(disagreeClick).toHaveBeenCalledTimes(1);
      expect(saveBtn.disabled).toBe(true);
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: Waiting for Didomi "Lagre" button to become enabled');

      consoleSpy.mockRestore();
    });

    it('should not click disagree a second time if guard attribute is set', () => {
      const { disagreeBtn } = createPreferencesPanel(true);
      disagreeBtn.dataset.cookieDeclinerClicked = '1';
      const disagreeClick = jest.spyOn(disagreeBtn, 'click');

      DOMUtils.handleDidomiPreferences();

      expect(disagreeClick).not.toHaveBeenCalled();
    });

    it('should click disagree and save and return true when save is enabled', () => {
      const { disagreeBtn, saveBtn } = createPreferencesPanel(false);
      const disagreeClick = jest.spyOn(disagreeBtn, 'click');
      const saveClick = jest.spyOn(saveBtn, 'click');
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = DOMUtils.handleDidomiPreferences();

      expect(disagreeClick).toHaveBeenCalledTimes(1);
      expect(saveClick).toHaveBeenCalledTimes(1);
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: Clicking Didomi "Avslå alle" button');
      expect(consoleSpy).toHaveBeenCalledWith('Cookie Decliner: Clicking Didomi "Lagre" button');

      consoleSpy.mockRestore();
    });

    it('should ignore "Les mer" button if preferences panel is already open', () => {
      // Both initial popup and preferences panel present
      const learnMoreBtn = createInitialPopup();
      const { disagreeBtn, saveBtn } = createPreferencesPanel(false);
      const learnMoreClick = jest.spyOn(learnMoreBtn, 'click');
      const disagreeClick = jest.spyOn(disagreeBtn, 'click');
      const saveClick = jest.spyOn(saveBtn, 'click');

      const result = DOMUtils.handleDidomiPreferences();

      expect(learnMoreClick).not.toHaveBeenCalled();
      expect(disagreeClick).toHaveBeenCalledTimes(1);
      expect(saveClick).toHaveBeenCalledTimes(1);
      expect(result).toBe(true);
    });
  });

  describe('handleDidomiPreferences – error handling', () => {
    it('should log and return false on unexpected DOM errors', () => {
      const originalQS = document.querySelector.bind(document);
      jest.spyOn(document, 'querySelector').mockImplementation((selector: string) => {
        if (selector === '#btn-toggle-disagree') throw new Error('DOM error');
        return originalQS(selector);
      });
      const consoleSpy = jest.spyOn(console, 'debug').mockImplementation();

      const result = DOMUtils.handleDidomiPreferences();

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Error handling Didomi preferences:', expect.any(Error));

      consoleSpy.mockRestore();
      jest.restoreAllMocks();
    });
  });
});
