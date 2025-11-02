import { DOMUtils } from '../../src/dom-utils';

describe('Checkbox-based Cookie Consent Handler', () => {
  beforeEach(() => {
    // Clean DOM before each test
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  describe('handleCheckboxConsent', () => {
    it('should uncheck optional checkboxes and click save button', () => {
      // Arrange - MaxGaming-style cookie consent
      const container = document.createElement('div');
      container.id = 'cookie_consent_manager';
      
      // Necessary checkbox (disabled - should not be touched)
      const necessaryDiv = document.createElement('div');
      const necessaryCheckbox = document.createElement('input');
      necessaryCheckbox.type = 'checkbox';
      necessaryCheckbox.checked = true;
      necessaryCheckbox.disabled = true;
      const necessaryLabel = document.createElement('span');
      necessaryLabel.textContent = 'Nødvendige';
      necessaryDiv.appendChild(necessaryCheckbox);
      necessaryDiv.appendChild(necessaryLabel);
      
      // Analytics checkbox (should be unchecked)
      const analyticsDiv = document.createElement('div');
      const analyticsCheckbox = document.createElement('input');
      analyticsCheckbox.type = 'checkbox';
      analyticsCheckbox.checked = true;
      const analyticsLabel = document.createElement('span');
      analyticsLabel.textContent = 'Analyse og statistikk';
      analyticsDiv.appendChild(analyticsCheckbox);
      analyticsDiv.appendChild(analyticsLabel);
      
      // Marketing checkbox (should be unchecked)
      const marketingDiv = document.createElement('div');
      const marketingCheckbox = document.createElement('input');
      marketingCheckbox.type = 'checkbox';
      marketingCheckbox.checked = true;
      const marketingLabel = document.createElement('span');
      marketingLabel.textContent = 'Markedsføring';
      marketingDiv.appendChild(marketingCheckbox);
      marketingDiv.appendChild(marketingLabel);
      
      // Save button
      const saveButton = document.createElement('button');
      saveButton.textContent = 'Lagre & lukk';
      saveButton.style.display = 'block';
      saveButton.style.width = '100px';
      saveButton.style.height = '40px';
      saveButton.style.width = '100px';
      saveButton.style.height = '40px';
      saveButton.style.width = '100px';
      saveButton.style.height = '40px';
      
      container.appendChild(necessaryDiv);
      container.appendChild(analyticsDiv);
      container.appendChild(marketingDiv);
      container.appendChild(saveButton);
      document.body.appendChild(container);
      
      const clickSpy = jest.spyOn(saveButton, 'click');
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Act
      const result = DOMUtils.handleCheckboxConsent();
      
      // Assert
      expect(result).toBe(true);
      expect(necessaryCheckbox.checked).toBe(true); // Should remain checked
      expect(analyticsCheckbox.checked).toBe(false); // Should be unchecked
      expect(marketingCheckbox.checked).toBe(false); // Should be unchecked
      expect(clickSpy).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Unchecked 2 optional cookie checkboxes'));
      
      consoleSpy.mockRestore();
    });

    it('should return false when no cookie consent checkboxes found', () => {
      // Arrange
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      document.body.appendChild(checkbox);
      
      // Act
      const result = DOMUtils.handleCheckboxConsent();
      
      // Assert
      expect(result).toBe(false);
    });

    it('should skip already unchecked checkboxes', () => {
      // Arrange
      const container = document.createElement('div');
      container.id = 'cookie_consent_manager';
      
      const checkboxDiv = document.createElement('div');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = false; // Already unchecked
      const label = document.createElement('span');
      label.textContent = 'Markedsføring';
      checkboxDiv.appendChild(checkbox);
      checkboxDiv.appendChild(label);
      
      const saveButton = document.createElement('button');
      saveButton.textContent = 'Lagre & lukk';
      saveButton.style.display = 'block';
      saveButton.style.width = '100px';
      saveButton.style.height = '40px';
      saveButton.style.width = '100px';
      saveButton.style.height = '40px';
      
      container.appendChild(checkboxDiv);
      container.appendChild(saveButton);
      document.body.appendChild(container);
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Act
      const result = DOMUtils.handleCheckboxConsent();
      
      // Assert
      expect(result).toBe(false); // No checkboxes were unchecked
      expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('Unchecked'));
      
      consoleSpy.mockRestore();
    });

    it('should handle English cookie consent text', () => {
      // Arrange
      const container = document.createElement('div');
      container.className = 'cookie-consent';
      
      const checkboxDiv = document.createElement('div');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = true;
      const label = document.createElement('span');
      label.textContent = 'Marketing and advertising';
      checkboxDiv.appendChild(checkbox);
      checkboxDiv.appendChild(label);
      
      const saveButton = document.createElement('button');
      saveButton.textContent = 'Save settings';
      saveButton.style.display = 'block';
      saveButton.style.width = '100px';
      saveButton.style.height = '40px';
      saveButton.style.width = '100px';
      saveButton.style.height = '40px';
      
      container.appendChild(checkboxDiv);
      container.appendChild(saveButton);
      document.body.appendChild(container);
      
      // Act
      const result = DOMUtils.handleCheckboxConsent();
      
      // Assert
      expect(result).toBe(true);
      expect(checkbox.checked).toBe(false);
    });

    it('should dispatch change event when unchecking checkboxes', () => {
      // Arrange
      const container = document.createElement('div');
      container.id = 'cookie_consent_manager';
      
      const checkboxDiv = document.createElement('div');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = true;
      const label = document.createElement('span');
      label.textContent = 'Analyse';
      checkboxDiv.appendChild(checkbox);
      checkboxDiv.appendChild(label);
      
      const saveButton = document.createElement('button');
      saveButton.textContent = 'Lagre & lukk';
      saveButton.style.display = 'block';
      saveButton.style.width = '100px';
      saveButton.style.height = '40px';
      saveButton.style.width = '100px';
      saveButton.style.height = '40px';
      
      container.appendChild(checkboxDiv);
      container.appendChild(saveButton);
      document.body.appendChild(container);
      
      const changeHandler = jest.fn();
      checkbox.addEventListener('change', changeHandler);
      
      // Act
      DOMUtils.handleCheckboxConsent();
      
      // Assert
      expect(changeHandler).toHaveBeenCalled();
    });

    it('should find save button with different text variations', () => {
      // Arrange
      const container = document.createElement('div');
      container.id = 'cookie_consent_manager';
      
      const checkboxDiv = document.createElement('div');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = true;
      const label = document.createElement('span');
      label.textContent = 'Markedsføring';
      checkboxDiv.appendChild(checkbox);
      checkboxDiv.appendChild(label);
      
      const saveButton = document.createElement('button');
      saveButton.textContent = 'Bekreft valg'; // Different save text
      saveButton.style.display = 'block';
      saveButton.style.width = '100px';
      saveButton.style.height = '40px';
      saveButton.style.width = '100px';
      saveButton.style.height = '40px';
      
      container.appendChild(checkboxDiv);
      container.appendChild(saveButton);
      document.body.appendChild(container);
      
      const clickSpy = jest.spyOn(saveButton, 'click');
      
      // Act
      const result = DOMUtils.handleCheckboxConsent();
      
      // Assert
      expect(result).toBe(true);
      expect(clickSpy).toHaveBeenCalled();
    });

    it('should handle div-based save button with id', () => {
      // Arrange
      const container = document.createElement('div');
      container.id = 'cookie_consent_manager';
      
      const checkboxDiv = document.createElement('div');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = true;
      const label = document.createElement('span');
      label.textContent = 'Analyse';
      checkboxDiv.appendChild(checkbox);
      checkboxDiv.appendChild(label);
      
      const saveDiv = document.createElement('div');
      saveDiv.id = 'cookie_consent_manager_confirm';
      saveDiv.textContent = 'Lagre & lukk';
      saveDiv.style.display = 'block';
      saveDiv.style.width = '100px';
      saveDiv.style.height = '40px';
      
      container.appendChild(checkboxDiv);
      container.appendChild(saveDiv);
      document.body.appendChild(container);
      
      const clickSpy = jest.spyOn(saveDiv, 'click');
      
      // Act
      const result = DOMUtils.handleCheckboxConsent();
      
      // Assert
      expect(result).toBe(true);
      expect(clickSpy).toHaveBeenCalled();
    });

    it('should handle error gracefully', () => {
      // Arrange
      const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
      
      // Mock querySelectorAll to throw error
      const originalQuerySelectorAll = document.querySelectorAll;
      document.querySelectorAll = jest.fn(() => {
        throw new Error('Test error');
      });
      
      // Act
      const result = DOMUtils.handleCheckboxConsent();
      
      // Assert
      expect(result).toBe(false);
      expect(consoleDebugSpy).toHaveBeenCalledWith('Error handling checkbox consent:', expect.any(Error));
      
      // Restore
      document.querySelectorAll = originalQuerySelectorAll;
      consoleDebugSpy.mockRestore();
    });

    it('should skip checkboxes without cookie context', () => {
      // Arrange
      const checkboxDiv = document.createElement('div');
      checkboxDiv.className = 'random-form';
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = true;
      const label = document.createElement('span');
      label.textContent = 'Subscribe to newsletter';
      checkboxDiv.appendChild(checkbox);
      checkboxDiv.appendChild(label);
      
      document.body.appendChild(checkboxDiv);
      
      // Act
      const result = DOMUtils.handleCheckboxConsent();
      
      // Assert
      expect(result).toBe(false);
      expect(checkbox.checked).toBe(true); // Should remain checked
    });

    it('should handle multiple cookie consent categories', () => {
      // Arrange
      const container = document.createElement('div');
      container.className = 'cookie-consent-dialog';
      
      // Preferences checkbox
      const prefDiv = document.createElement('div');
      const prefCheckbox = document.createElement('input');
      prefCheckbox.type = 'checkbox';
      prefCheckbox.checked = true;
      const prefLabel = document.createElement('span');
      prefLabel.textContent = 'Preferanser';
      prefDiv.appendChild(prefCheckbox);
      prefDiv.appendChild(prefLabel);
      
      // Statistics checkbox
      const statsDiv = document.createElement('div');
      const statsCheckbox = document.createElement('input');
      statsCheckbox.type = 'checkbox';
      statsCheckbox.checked = true;
      const statsLabel = document.createElement('span');
      statsLabel.textContent = 'Statistikk';
      statsDiv.appendChild(statsCheckbox);
      statsDiv.appendChild(statsLabel);
      
      const saveButton = document.createElement('button');
      saveButton.textContent = 'Save & close';
      saveButton.style.display = 'block';
      saveButton.style.width = '100px';
      saveButton.style.height = '40px';
      saveButton.style.width = '100px';
      saveButton.style.height = '40px';
      
      container.appendChild(prefDiv);
      container.appendChild(statsDiv);
      container.appendChild(saveButton);
      document.body.appendChild(container);
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Act
      const result = DOMUtils.handleCheckboxConsent();
      
      // Assert
      expect(result).toBe(true);
      expect(prefCheckbox.checked).toBe(false);
      expect(statsCheckbox.checked).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Unchecked 2 optional cookie checkboxes'));
      
      consoleSpy.mockRestore();
    });
  });
});

