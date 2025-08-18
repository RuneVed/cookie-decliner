import { test, expect } from '@playwright/test';
import * as path from 'path';
import { chromium } from '@playwright/test';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const EXTENSION_PATH = path.join(__dirname, '../../'); // Point to root directory

test.describe('Cookie Decliner Extension', () => {
  test('should have valid extension structure', async () => {
    // Skip this test if manifest doesn't exist or built content script doesn't exist
    const fs = await import('fs');
    const manifestPath = path.join(EXTENSION_PATH, 'manifest.json');
    const contentScriptPath = path.join(EXTENSION_PATH, 'dist/content-script.js');
    
    // Verify required files exist
    expect(fs.existsSync(manifestPath)).toBe(true);
    expect(fs.existsSync(contentScriptPath)).toBe(true);
    
    // Verify manifest is valid JSON
    const manifestContent = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    expect(manifestContent.name).toBe('Cookie Decliner');
    expect(manifestContent.content_scripts).toBeDefined();
    expect(manifestContent.content_scripts[0].js).toContain('dist/content-script.js');
  });

  // Additional E2E tests for extension functionality would go here
  // Currently relying on comprehensive unit tests for core logic verification
});