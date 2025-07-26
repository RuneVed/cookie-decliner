## Setting Up Vanilla TypeScript Browser Extension

Let's create a secure, minimal browser extension with TypeScript.

### 1. Initialize Project and Install Minimal Dependencies

```bash
# Initialize npm project
npm init -y

# Install only essential development dependencies
npm install -D typescript @types/chrome web-ext
```

### 2. Create Project Structure

Create these files in VS Code:

#### **tsconfig.json** - TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM"],
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

#### **manifest.json** - Extension Configuration
```json
{
  "manifest_version": 3,
  "name": "Cookie Decliner",
  "version": "1.0.0",
  "description": "Automatically decline cookie consent popups",
  "permissions": ["activeTab"],
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["dist/content-script.js"],
      "run_at": "document_idle"
    }
  ],
  "action": {
    "default_popup": "popup.html",
    "default_title": "Cookie Decliner"
  },
  "icons": {
    "16": "icons/icon16.png",
    "32": "icons/icon32.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

### 3. Create Source Directory and Main Script

First create the `src` directory, then:

#### **src/content-script.ts** - Main Extension Logic
```typescript
interface CookieSelector {
  selector: string;
  description: string;
}

class CookieDecliner {
  private readonly DECLINE_SELECTORS: CookieSelector[] = [
    // Norwegian selectors
    { selector: 'button:contains("Avvis alle")', description: 'Norwegian: Reject all' },
    { selector: 'button:contains("Avslå alle")', description: 'Norwegian: Decline all' },
    
    // English selectors
    { selector: 'button:contains("Decline all")', description: 'English: Decline all' },
    { selector: 'button:contains("Reject all")', description: 'English: Reject all' },
    { selector: 'button:contains("Deny all")', description: 'English: Deny all' },
    
    // Common attribute-based selectors
    { selector: '[data-testid*="decline"]', description: 'Data attribute: decline' },
    { selector: '[data-testid*="reject"]', description: 'Data attribute: reject' },
    { selector: 'button[id*="decline"]', description: 'ID contains: decline' },
    { selector: 'button[class*="decline"]', description: 'Class contains: decline' },
    { selector: 'button[class*="reject"]', description: 'Class contains: reject' },
    
    // Specific cookie popup frameworks
    { selector: '#CybotCookiebotDialogBodyButtonDecline', description: 'Cookiebot: Decline' },
    { selector: '.ot-pc-refuse-all-handler', description: 'OneTrust: Refuse all' },
    { selector: '.sp_choice_type_11', description: 'SourcePoint: Reject' }
  ];

  private observer: MutationObserver | null = null;
  private processed = new Set<Element>();

  constructor() {
    this.init();
  }

  private init(): void {
    console.log('Cookie Decliner: Initialized');
    
    // Try immediately
    this.findAndClickDeclineButton();
    
    // Set up observer for dynamic content
    this.setupMutationObserver();
  }

  private findAndClickDeclineButton(): boolean {
    for (const { selector, description } of this.DECLINE_SELECTORS) {
      try {
        const elements = this.findElementsBySelector(selector);
        
        for (const element of elements) {
          if (this.isElementVisible(element) && !this.processed.has(element)) {
            console.log(`Cookie Decliner: Found decline button - ${description}`, element);
            this.clickElement(element);
            this.processed.add(element);
            return true;
          }
        }
      } catch (error) {
        console.debug(`Cookie Decliner: Error with selector ${selector}:`, error);
      }
    }
    
    return false;
  }

  private findElementsBySelector(selector: string): Element[] {
    // Handle :contains() pseudo-selector manually since it's not standard CSS
    if (selector.includes(':contains(')) {
      return this.findElementsWithText(selector);
    }
    
    return Array.from(document.querySelectorAll(selector));
  }

  private findElementsWithText(selector: string): Element[] {
    const match = selector.match(/(.+):contains\("([^"]+)"\)/);
    if (!match) return [];
    
    const [, baseSelector, text] = match;
    const elements = document.querySelectorAll(baseSelector || 'button');
    
    return Array.from(elements).filter(el => 
      el.textContent?.toLowerCase().includes(text.toLowerCase())
    );
  }

  private isElementVisible(element: Element): boolean {
    const htmlElement = element as HTMLElement;
    const rect = htmlElement.getBoundingClientRect();
    const style = window.getComputedStyle(htmlElement);
    
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0'
    );
  }

  private clickElement(element: Element): void {
    try {
      (element as HTMLElement).click();
      console.log('Cookie Decliner: Successfully clicked decline button');
    } catch (error) {
      console.error('Cookie Decliner: Error clicking element:', error);
    }
  }

  private setupMutationObserver(): void {
    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Debounce the check to avoid excessive processing
          setTimeout(() => this.findAndClickDeclineButton(), 500);
          break;
        }
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  public destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new CookieDecliner());
} else {
  new CookieDecliner();
}
```

### 4. Create Build Script

Add this to your **package.json** scripts section:

```json
{
  "scripts": {
    "build": "tsc",
    "watch": "tsc --watch",
    "clean": "rmdir /s dist 2>nul || echo Clean completed"
  }
}
```

### 5. Create Simple Popup (Optional)

#### **popup.html**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      width: 200px;
      padding: 10px;
      font-family: Arial, sans-serif;
    }
    .status {
      color: #4CAF50;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <h3>Cookie Decliner</h3>
  <p class="status">✓ Active</p>
  <p>Automatically declining cookie popups on all websites.</p>
</body>
</html>
```

### 6. Build and Test

```bash
# Build the TypeScript
npm run build

# For development with auto-rebuild
npm run watch
```

### Do not do this step, I will do this manually
### 7. Load in Browser

1. Open Chrome/Edge
2. Go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select your `cookie-decliner` folder