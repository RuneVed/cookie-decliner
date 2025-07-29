import { test, expect } from '@playwright/test';

// Controlled testing with mocked consent management platforms
test.describe('Cookie Consent Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Setup network mocking to avoid testing third-party dependencies
    await page.route('**/consent-manager/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: `
          window.__tcfapi = function(command, version, callback) {
            if (command === 'getTCData') {
              callback({
                cmpStatus: 'loaded',
                eventStatus: 'cmpuishown',
                gdprApplies: true,
                tcString: ''
              }, true);
            }
          };
        `
      });
    });
  });

  test('should handle TCF API integration', async ({ page }) => {
    // Create controlled test environment
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head><title>TCF API Test</title></head>
        <body>
          <div id="cmp-banner" role="dialog" aria-label="Cookie consent">
            <h2>Cookie Preferences</h2>
            <p>We use cookies and similar technologies.</p>
            <button type="button" data-testid="accept-all">Accept All</button>
            <button type="button" data-testid="reject-all">Reject All</button>
            <button type="button" data-testid="manage-preferences">Manage Preferences</button>
          </div>
          <script src="/consent-manager/tcf.js"></script>
        </body>
      </html>
    `);

    // Test user-visible behavior: banner should be present
    await expect(page.getByRole('dialog', { name: 'Cookie consent' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Cookie Preferences' })).toBeVisible();
    
    // Test all consent options are available
    await expect(page.getByTestId('accept-all')).toBeVisible();
    await expect(page.getByTestId('reject-all')).toBeVisible();
    await expect(page.getByTestId('manage-preferences')).toBeVisible();
    
    // Simulate extension behavior - click reject
    await page.getByTestId('reject-all').click();
    
    // Verify user-visible result
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should handle SourcePoint CMP integration', async ({ page }) => {
    // Mock SourcePoint API response
    await page.route('**/sourcepoint/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: `
          window._sp_ = {
            config: {
              events: {
                onMessageChoiceSelect: function(choice) {
                  if (choice.choice === 11) {
                    document.getElementById('sp-banner').style.display = 'none';
                  }
                }
              }
            },
            executeMessaging: function() {
              document.getElementById('sp-banner').style.display = 'block';
            }
          };
        `
      });
    });

    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head><title>SourcePoint Test</title></head>
        <body>
          <div id="sp-banner" role="banner" style="display: none;">
            <h2>Privacy Notice</h2>
            <p>This website uses cookies and similar technologies.</p>
            <button data-testid="sp-accept">I Accept</button>
            <button data-testid="sp-reject">I Reject</button>
          </div>
          <script src="/sourcepoint/sp.js"></script>
          <script>
            // Simulate SourcePoint initialization
            if (window._sp_) {
              window._sp_.executeMessaging();
            }
          </script>
        </body>
      </html>
    `);

    // Wait for SourcePoint banner to appear
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Privacy Notice' })).toBeVisible();
    
    // Test rejection flow
    await page.getByTestId('sp-reject').click();
    
    // Verify banner is hidden after rejection
    await expect(page.getByRole('banner')).not.toBeVisible();
  });

  test('should handle multiple consent frameworks', async ({ page }) => {
    // Test page with both TCF and custom consent
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head><title>Multiple Consent Test</title></head>
        <body>
          <div data-testid="cookie-notice" role="complementary">
            <p>This site uses cookies. By continuing to browse, you agree to our use of cookies.</p>
            <button data-testid="cookie-accept">Accept</button>
            <button data-testid="cookie-decline">Decline</button>
            <a href="/privacy-policy" data-testid="privacy-link">Privacy Policy</a>
          </div>
        </body>
      </html>
    `);

    // Test all elements are accessible and visible
    await expect(page.getByTestId('cookie-notice')).toBeVisible();
    await expect(page.getByTestId('cookie-accept')).toBeVisible();
    await expect(page.getByTestId('cookie-decline')).toBeVisible();
    await expect(page.getByTestId('privacy-link')).toBeVisible();
    
    // Test decline functionality
    await page.getByTestId('cookie-decline').click();
    
    // Verify notice is removed after decline
    await expect(page.getByTestId('cookie-notice')).not.toBeVisible();
  });

  test('should handle consent in iframe contexts', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head><title>Iframe Consent Test</title></head>
        <body>
          <h1>Main Page</h1>
          <iframe 
            src="data:text/html,<div role='dialog' aria-label='Consent'><button data-testid='iframe-decline'>Decline</button></div>"
            data-testid="consent-iframe"
            style="width: 100%; height: 200px;"
          ></iframe>
        </body>
      </html>
    `);

    // Test iframe is loaded
    await expect(page.getByTestId('consent-iframe')).toBeVisible();
    
    // Access iframe content
    const iframe = page.frameLocator('[data-testid="consent-iframe"]');
    await expect(iframe.getByRole('dialog', { name: 'Consent' })).toBeVisible();
    await expect(iframe.getByTestId('iframe-decline')).toBeVisible();
    
    // Test interaction within iframe
    await iframe.getByTestId('iframe-decline').click();
    
    // Verify iframe interaction works
    await expect(iframe.getByTestId('iframe-decline')).not.toBeVisible();
  });
});