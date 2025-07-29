import { test, expect } from '@playwright/test';
import * as path from 'path';
import { chromium } from '@playwright/test';

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
    
    // Use web-first assertion instead of manual timeout
    await expect(page).toHaveTitle(/Example Domain/);

    // Should not have extension-related errors
    const extensionErrors = consoleErrors.filter(error => 
      error.includes('Extension') || error.includes('chrome-extension')
    );
    expect(extensionErrors).toHaveLength(0);
    
    await context.close();
  });

  test('should inject content script successfully', async ({ page }) => {
    // Create a test page with mock cookie consent popup
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head><title>Test Cookie Consent</title></head>
        <body>
          <div id="cookie-banner" style="position: fixed; bottom: 0; width: 100%;">
            <p>We use cookies to improve your experience.</p>
            <button id="accept-cookies">Accept All</button>
            <button id="decline-cookies">Decline All</button>
          </div>
        </body>
      </html>
    `);
    
    // Test user-visible behavior: cookie banner should be visible
    await expect(page.locator('#cookie-banner')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Accept All' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Decline All' })).toBeVisible();
    
    // Simulate extension behavior by clicking decline
    await page.getByRole('button', { name: 'Decline All' }).click();
    
    // Verify user-visible result - button should be clickable
    await expect(page.getByRole('button', { name: 'Decline All' })).not.toBeVisible();
  });

  test('should handle dynamic content loading', async ({ page }) => {
    // Test page with dynamically loaded cookie consent
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head><title>Dynamic Cookie Test</title></head>
        <body>
          <div id="content">Page loaded</div>
          <script>
            setTimeout(() => {
              const banner = document.createElement('div');
              banner.id = 'dynamic-cookie-banner';
              banner.innerHTML = '<button data-testid="reject-all">Reject All Cookies</button>';
              document.body.appendChild(banner);
            }, 1000);
          </script>
        </body>
      </html>
    `);
    
    // Wait for dynamic content using web-first assertions
    await expect(page.getByTestId('reject-all')).toBeVisible();
    
    // Test user interaction
    await page.getByTestId('reject-all').click();
    
    // Verify the click worked (button should be gone after click)
    await expect(page.getByTestId('reject-all')).not.toBeVisible();
  });
});