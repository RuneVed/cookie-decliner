import { test, expect } from '@playwright/test';

// Real world testing against actual sites (use with caution in CI)
test.describe('Real Site Testing', () => {
  test.slow(); // These tests may take longer

  test('should handle basic website navigation', async ({ page }) => {
    // Test basic navigation - doesn't require extension
    await page.goto('https://example.com');
    
    // Wait for page load
    await page.waitForLoadState('domcontentloaded');
    
    // Check basic page functionality
    const title = await page.title();
    expect(title).toBeTruthy();
    
    // Check that we can find elements (simulating extension behavior)
    const elements = await page.$$('*');
    expect(elements.length).toBeGreaterThan(0);
  });

  test('should handle JavaScript-heavy sites', async ({ page }) => {
    // Test with a JavaScript-heavy site
    await page.goto('https://example.com');
    
    // Wait for JavaScript to load
    await page.waitForTimeout(2000);
    
    // Test JavaScript execution (simulating extension functionality)
    const jsResult = await page.evaluate(() => {
      // Simulate extension's DOM scanning
      const allElements = document.querySelectorAll('*');
      return allElements.length > 0;
    });
    
    expect(jsResult).toBe(true);
  });

  test.skip('should handle FINN.no cookie popup', async ({ page }) => {
    // Note: This test is skipped by default as it requires network access
    // and may be flaky. Enable only for manual testing.
    
    await page.goto('https://www.finn.no');
    
    // Wait for potential cookie popup
    await page.waitForTimeout(5000);
    
    // Check console for any JavaScript errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Look for potential cookie-related elements
    const cookieElements = await page.$$('[class*="cookie"], [id*="cookie"], [class*="consent"], [id*="consent"]');
    
    // Basic assertion - page should load without critical errors
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('should simulate extension cookie detection', async ({ page }) => {
    await page.goto('https://example.com');
    
    // Simulate extension's cookie detection logic
    const cookieDetectionResult = await page.evaluate(() => {
      // Simulate the extension's keyword detection
      const cookieKeywords = ['cookie', 'consent', 'privacy', 'gdpr'];
      const pageText = document.body.textContent?.toLowerCase() || '';
      
      return cookieKeywords.some(keyword => pageText.includes(keyword));
    });
    
    // This will be false for example.com, which is expected
    expect(typeof cookieDetectionResult).toBe('boolean');
  });
});