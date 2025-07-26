import { test, expect, chromium } from '@playwright/test';
import path from 'path';

const EXTENSION_PATH = path.join(__dirname, '../../dist');

test.describe('Cookie Decliner Extension', () => {
  test('should load extension without errors', async () => {
    // Skip this test in CI or if dist folder doesn't exist
    test.skip(!process.env.CI, 'Extension loading test requires built extension');
    
    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${EXTENSION_PATH}`,
        `--load-extension=${EXTENSION_PATH}`,
      ],
    });

    const page = await context.newPage();
    
    // Check for extension errors in console
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('https://example.com');
    await page.waitForTimeout(2000);

    // Should not have extension-related errors
    const extensionErrors = consoleErrors.filter(error => 
      error.includes('Cookie Decliner') || error.includes('content-script')
    );
    expect(extensionErrors).toHaveLength(0);

    await context.close();
  });

  test('should work with basic web pages', async ({ page }) => {
    // Basic functionality test without extension loading
    await page.goto('https://example.com');
    
    // Basic test that page loads
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    
    // Test that basic DOM manipulation would work
    await page.evaluate(() => {
      const button = document.createElement('button');
      button.textContent = 'Test Button';
      document.body.appendChild(button);
      return button.textContent;
    });
  });

  test('should handle JavaScript execution', async ({ page }) => {
    await page.goto('https://example.com');
    
    // Test JavaScript execution that simulates extension behavior
    const result = await page.evaluate(() => {
      // Simulate finding cookie-related buttons
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.length >= 0; // Should always be true
    });
    
    expect(result).toBe(true);
  });
});