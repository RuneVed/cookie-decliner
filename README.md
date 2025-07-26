# Cookie Decliner Browser Extension

A powerful browser extension that automatically declines cookie consent popups on websites, saving you time and protecting your privacy by default.

## 🚀 Features

- **Automatic Cookie Popup Detection** - Instantly identifies and handles cookie consent banners
- **Multi-Language Support** - Works with Norwegian, English, German, and French websites
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

### Chrome
1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the project folder
5. The extension will appear in your toolbar

### Firefox
1. Download or clone this repository
2. Open Firefox and navigate to `about:debugging`
3. Click "This Firefox" in the left sidebar
4. Click "Load Temporary Add-on"
5. Select the `manifest.json` file from the project folder
6. The extension will be active until Firefox restarts

## 🛠️ Development Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- TypeScript knowledge for modifications

### Build Process
```bash
# Install dependencies
npm install

# Build the extension
npm run build

# Watch for changes during development
npm run watch

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run end-to-end tests
npm run test:e2e
```

### Project Structure
```
cookie-decliner/
├── src/
│   ├── content-script.ts   # Main extension logic
│   ├── api-handler.ts      # API integration (TCF, SourcePoint)
│   ├── dom-utils.ts        # DOM manipulation utilities
│   ├── selectors.ts        # Language and framework selectors
│   ├── keywords.ts         # Validation keywords
│   └── types.ts           # TypeScript type definitions
├── tests/
│   ├── unit/              # Unit tests (Jest)
│   └── e2e/               # End-to-end tests (Playwright)
├── docs/                  # Documentation
├── icons/                 # Extension icons
├── manifest.json          # Extension configuration
└── package.json          # Dependencies and scripts
```

## 🧪 Testing

The project includes comprehensive testing:

- **Unit Tests**: 45 tests with Jest
- **Coverage**: 100% for selectors and keywords, 75% for DOM utils, 50% for API handler
- **Integration Tests**: Playwright setup for e2e testing
- **Fast Execution**: ~2 second test suite

```bash
# Run all tests
npm run test:all

# Run with coverage report
npm run test:coverage

# Run in watch mode during development
npm run test:watch
```

## 🎯 How It Works

The extension uses multiple detection strategies to identify and decline cookie consent:

1. **API Integration** - Leverages standardized APIs (TCF v2.0, SourcePoint)
2. **DOM Analysis** - Scans for framework-specific selectors and patterns
3. **Text Recognition** - Identifies decline buttons in multiple languages
4. **Context Validation** - Ensures only cookie-related buttons are clicked
5. **Cross-Frame Communication** - Handles iframe-based consent systems

### Supported Consent Frameworks
- **SourcePoint** - Full iframe communication and API support
- **TCF API v2.0** - Standard Transparency & Consent Framework
- **Cookiebot** - Direct API and selector support
- **OneTrust** - Framework-specific button detection
- **Usercentrics** - Comprehensive selector coverage
- **Custom Implementations** - Generic pattern matching

## 🌐 Language Support

- **Norwegian** (no) - Comprehensive support
- **English** (en) - Full coverage
- **German** (de) - Complete implementation
- **French** (fr) - Full support

Each language includes specific selectors for "decline all" buttons and validation keywords.

## 🌐 Browser Compatibility

| Browser | Version | Manifest | Status |
|---------|---------|----------|---------|
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
- **Language expansion** - Support for more languages
- **Performance optimization** - Reduce resource usage
- **Testing coverage** - Automated testing for various sites

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make changes and test thoroughly
4. Run the test suite: `npm run test:all`
5. Submit a pull request with detailed description

## 📄 License

This project is licensed under the MIT License.

## 🔒 Privacy

This extension:
- **Does not collect any data** - All processing happens locally
- **Does not transmit information** - No network requests or analytics
- **Protects your privacy** - Declines tracking cookies by default
- **Open source** - Full transparency in code and functionality

## 📞 Support

- **Issues**: Report bugs and feature requests via GitHub Issues
- **Documentation**: See `docs/` directory for detailed documentation
- **Development**: Check TypeScript source code in `src/` directory

---

**Note**: This extension is designed to respect website cookie policies and legal requirements. It declines non-essential cookies where permitted, but cannot override legal compliance requirements or essential website functionality.