# Cookie Decliner Browser Extension

A powerful browser extension that automatically declines cookie consent popups on websites, saving you time and protecting your privacy by default.

**✅ Manifest V3 Ready** - Chrome Web Store compliant | **61.92% Test Coverage** | **Zero TypeScript/ESLint Errors**

## 🚀 Features

- **Automatic Cookie Popup Detection** - Instantly identifies and handles cookie consent banners
- **Norwegian Language Support** - Optimized for Norwegian websites and cookie consent text
- **Universal Framework Compatibility** - Supports major consent management platforms:
  - SourcePoint CMP
  - Cookiebot
  - OneTrust
  - Usercentrics
  - TCF v2.0 API
  - Custom implementations
- **Cross-Browser Support** - Compatible with both Chrome and Firefox
- **Intelligent Button Recognition** - Avoids clicking non-cookie buttons (login, newsletter, etc.)
- **Dynamic Content Monitoring** - Handles popups that load after page initialization
- **Cross-Frame Communication** - Works with iframe-based cookie systems
- **Performance Optimized** - Minimal resource usage with smart processing controls

## 📦 Installation

### Development Installation

**Prerequisites:** Node.js and npm installed

1. **Clone and build:**
   ```bash
   git clone <repository-url>
   cd cookie-decliner
   npm install
   npm run build
   ```

2. **Chrome Installation:**
   - Open `chrome://extensions/`
   - Enable "Developer mode" (top right toggle)
   - Click "Load unpacked"
   - Select the project root folder
   - Extension appears in toolbar

3. **Firefox Installation:**
   - Open `about:debugging`
   - Click "This Firefox"
   - Click "Load Temporary Add-on"
   - Select any file in the project folder
   - Extension active until Firefox restart

### Production Installation
*Coming soon to Chrome Web Store and Firefox Add-ons*

## 🛠️ Development Setup

### Prerequisites
- Node.js (v18 or higher)
- npm (comes with Node.js)
- TypeScript knowledge for modifications

### Technologies
- **Manifest V3** - Modern browser extension standard, Chrome Web Store ready
- **TypeScript 5.8.3** - Enhanced strict configuration with latest best practices
- **esbuild 0.25.8** - Fast bundling with IIFE format for browser compatibility
- **ESLint 9.32.0** - Latest flat config with comprehensive TypeScript rules
- **Jest + Playwright** - Unit testing (61.92% coverage) + E2E browser automation
- **80 passing tests** across 6 test suites with zero warnings
- **Playwright** - End-to-end testing for real browser environments

For detailed build system information, see [Build System Guide](docs/build-system.md).

### Build Process
```bash
# Install dependencies
npm install

# Build the extension (with linting and bundling)
npm run build

# Watch for changes during development
npm run watch

# Run linting
npm run lint
npm run lint:fix

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run end-to-end tests
npm run test:e2e

# Run all tests (unit + e2e)
npm run test:all
```

## 🧪 Testing

The project includes comprehensive testing with Jest and Playwright. For detailed testing information, see:
- **[Testing Guide](docs/testing-guide.md)** - Complete testing setup and workflows
- **[Jest Best Practices](docs/JEST_BEST_PRACTICES.md)** - Implementation details and patterns

**Quick Test Commands:**
```bash
npm test              # Run unit tests
npm run test:coverage # Generate coverage report  
npm run test:all      # Run all tests (unit + e2e)
npm run lint:check    # Run linting with zero warnings
```

**Current Status:** 74 unit tests, 97% coverage for DOM utilities (dom-utils), 94% coverage for API handler (api-handler)

### Project Structure
```
cookie-decliner/
├── dist/
│   └── content-script.js   # Bundled extension script (IIFE format)
├── src/
│   ├── content-script.ts   # Main extension logic
│   ├── api-handler.ts      # API integration (TCF, SourcePoint)
│   ├── dom-utils.ts        # DOM manipulation utilities
│   ├── selectors.ts        # Language and framework selectors
│   ├── keywords.ts         # Validation keywords
│   └── types.ts           # TypeScript type definitions
├── tests/
│   ├── unit/              # Unit tests (Jest)
│   ├── e2e/               # End-to-end tests (Playwright)
│   ├── setup.ts           # Jest configuration and mocks
│   └── test-utils.ts      # Reusable test utilities
├── docs/                  # Documentation
│   ├── README.md          # Documentation index
│   ├── setup-instructions.md # Development setup guide
│   ├── build-system.md    # Build system and bundling guide
│   ├── testing-guide.md   # Comprehensive testing guide
│   ├── typescript-best-practices.md # TypeScript coding standards
│   ├── refactoring-summary.md # Change history
│   └── JEST_BEST_PRACTICES.md # Jest implementation details
├── icons/                 # Extension icons (SVG format)
├── manifest.json          # Extension configuration (Manifest V2)
├── popup.html            # Extension popup interface
├── package.json          # Dependencies and scripts
├── jest.config.js        # Jest configuration
├── playwright.config.ts  # Playwright configuration
├── tsconfig.json         # TypeScript configuration (enhanced strict mode)
└── eslint.config.js      # ESLint configuration (flat config with TypeScript)
```

## 🎯 How It Works

The extension uses multiple detection strategies to identify and decline cookie consent:

1. **API Integration** - Leverages standardized APIs (TCF v2.0, SourcePoint)
2. **DOM Analysis** - Scans for framework-specific selectors and patterns
3. **Text Recognition** - Identifies decline buttons in Norwegian language
4. **Context Validation** - Ensures only cookie-related buttons are clicked
5. **Cross-Frame Communication** - Handles iframe-based consent systems

### Supported Consent Frameworks
- **SourcePoint** - Full iframe communication and API support
- **TCF API v2.0** - Standard Transparency & Consent Framework
- **Cookiebot** - Direct API and selector support
- **OneTrust** - Framework-specific button detection
- **Usercentrics** - Comprehensive selector coverage
- **Custom Implementations** - Generic pattern matching

## 🌐 Browser Compatibility

| Browser | Version | Manifest | Status |
|---------|---------|----------|--------|
| Firefox | 88+ | V2 | ✅ Fully Supported |
| Chrome | 88+ | V2 | ✅ Fully Supported |
| Edge | 88+ | V2 | ✅ Should Work* |
| Safari | - | - | ❌ Not Supported |

*Edge compatibility untested but should work with Chrome-compatible extensions.

## 🔧 Configuration

The extension works automatically without configuration. The popup interface shows:
- Extension status (Active/Inactive)
- Current page detection
- Processing confirmation

## 🚫 Limitations

- **Cannot bypass GDPR requirements** - Only declines non-essential cookies where legally permitted
- **Site-specific variations** - Some custom implementations may require updates
- **JavaScript dependency** - Requires JavaScript-enabled browsing
- **Cross-origin restrictions** - Limited by browser security policies

## 🐛 Troubleshooting

### Extension Not Working
1. **Check if extension is enabled** in browser settings
2. **Refresh the page** - Some sites require a fresh load
3. **Check console logs** - Look for "Cookie Decliner" messages
4. **Verify popup shows "Active"** status

### Common Issues
- **Popup still appears** - Site may use unsupported framework
- **Wrong button clicked** - Report the site for pattern updates
- **Extension icon missing** - Browser may need restart after installation

### Debug Information
Enable browser developer tools and check console for detailed logs:
```javascript
// Look for these log prefixes:
"Cookie Decliner: Found TCF API"
"Cookie Decliner: SourcePoint message received"
"Cookie Decliner: Successfully clicked decline button"
```

## 🤝 Contributing

Contributions are welcome! Areas for improvement:
- **New framework support** - Add selectors for additional consent systems
- **Enhanced Norwegian support** - Improve detection for Norwegian cookie consent patterns
- **Performance optimization** - Reduce resource usage
- **Testing coverage** - Automated testing for various sites

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-framework`
3. Make changes and add tests (see [Testing Guide](docs/testing-guide.md))
4. Run the test suite: `npm run test:all`
5. Ensure linting passes: `npm run lint:check` (zero warnings required)
6. Build the extension: `npm run build` (includes pre-build linting)
7. Submit a pull request with detailed description

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔒 Privacy

This extension:
- **Does not collect any data** - All processing happens locally
- **Does not transmit information** - No network requests or analytics
- **Protects your privacy** - Declines tracking cookies by default
- **Open source** - Full transparency in code and functionality

## 📞 Support

- **Issues**: Report bugs and feature requests via GitHub Issues
- **Documentation**: 
  - See `docs/setup-instructions.md` for development setup
  - See `docs/build-system.md` for build system details
  - See `docs/testing-guide.md` for comprehensive testing information
  - See `docs/typescript-best-practices.md` for code standards
  - See `docs/JEST_BEST_PRACTICES.md` for Jest implementation details
  - See `docs/` directory for additional documentation
- **Development**: Check TypeScript source code in `src/` directory
- **Testing**: Run `npm run test:coverage:open` to explore test coverage

---

**Note**: This extension is designed to respect website cookie policies and legal requirements. It declines non-essential cookies where permitted, but cannot override legal compliance requirements or essential website functionality.