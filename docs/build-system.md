# Build System and Bundling Guide

## 🏗️ Modern Build Architecture

The Cookie Decliner extension uses a modern, production-ready build system designed for browser extension compatibility and developer productivity.

## 📦 Build Tools

### **esbuild 0.25.8** - Primary Bundler
- **IIFE Format** - Self-executing function eliminates module system issues
- **ES2020 Target** - Modern JavaScript with broad browser support
- **Single File Output** - All dependencies bundled into `dist/content-script.js`
- **Fast Builds** - Sub-second build times with watch mode
- **Browser Platform** - Optimized for browser extension environments

### **TypeScript 5.8.3** - Type System
- **Enhanced Strict Mode** - Maximum type safety with latest features
- **verbatimModuleSyntax** - Ensures proper module handling
- **Browser-Specific Types** - Full Chrome/Firefox extension API support
- **Source Maps** - Complete debugging support

### **ESLint 9.32.0** - Code Quality
- **Flat Configuration** - Modern ESLint v9 format
- **TypeScript Integration** - Full typescript-eslint integration
- **Zero Warnings Policy** - Enforced through pre-build checks
- **Browser Extension Rules** - Security-focused rules for extensions

## 🔧 Build Commands

### Development Commands
```bash
# Build for production (includes linting)
npm run build

# Development with auto-rebuild
npm run watch

# Clean build artifacts
npm run clean

# Type checking only
npm run build:types
```

### Code Quality Commands
```bash
# Run ESLint (show errors/warnings)
npm run lint

# Auto-fix lint issues
npm run lint:fix

# Strict linting (zero warnings)
npm run lint:check
```

### Testing Commands
```bash
# Unit tests
npm run test

# Tests with coverage
npm run test:coverage

# All tests (unit + e2e)
npm run test:all

# Watch mode for development
npm run test:watch
```

## 🎯 Build Process

### 1. Pre-Build Validation
```bash
# Automatically runs before build
npm run prebuild
  ├── npm run lint:check    # Zero warnings required
  └── TypeScript validation # Type checking
```

### 2. Bundle Creation
```bash
# Main build process
npm run build:bundle
  ├── Source: src/content-script.ts
  ├── Dependencies: All TypeScript modules
  ├── Output: dist/content-script.js
  ├── Format: IIFE (immediately invoked function expression)
  ├── Target: ES2020
  └── Platform: Browser
```

### 3. Build Output
```
dist/
└── content-script.js       # 700+ line bundled IIFE
    ├── All TypeScript modules inlined
    ├── No external dependencies
    ├── Self-executing function
    └── Browser extension compatible
```

## 🚀 Production Deployment

### Browser Extension Loading
1. **Build the extension**: `npm run build`
2. **Chrome**: Load unpacked from project folder
3. **Firefox**: Load temporary addon using `manifest.json`
4. **Verification**: Check browser console for "Cookie Decliner" logs

### Build Verification
```bash
# Verify build output exists
ls dist/content-script.js

# Check bundle size (should be ~25-30KB)
wc -c dist/content-script.js

# Validate no module dependencies
grep -c "import\|export\|require" dist/content-script.js  # Should be 0
```

## 🔍 Module System Compatibility

### Why IIFE Format?
Browser extensions have strict limitations on module systems:
- ❌ **ES Modules** - `import`/`export` not supported in content scripts
- ❌ **CommonJS** - `require()`/`module.exports` not available
- ✅ **IIFE** - Self-executing function works in all browser contexts

### Bundle Structure
```javascript
(() => {
  // All TypeScript modules inlined here
  // No external dependencies
  // Direct browser API usage
  
  // Extension initialization at the end
  if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => new CookieDecline());
  } else {
      new CookieDecline();
  }
})();
```

## 📈 Performance Characteristics

### Build Performance
- **Clean Build**: ~200ms
- **Incremental Build**: ~50ms  
- **Watch Mode**: ~20ms hot reload
- **Bundle Size**: ~25KB minified

### Runtime Performance
- **Load Time**: <10ms in browser
- **Memory Usage**: <1MB heap
- **CPU Impact**: Minimal background processing
- **No Network Requests**: All processing local

## 🐛 Troubleshooting

### Common Build Issues

**"Module not found" Errors**
```bash
# Check source file exists
ls src/content-script.ts

# Verify TypeScript compilation
npx tsc --noEmit
```

**ESLint Failures**
```bash
# Show all lint issues
npm run lint

# Auto-fix fixable issues
npm run lint:fix

# Check for remaining issues
npm run lint:check
```

**Build Output Missing**
```bash
# Clean and rebuild
npm run clean
npm run build

# Check esbuild directly
npx esbuild src/content-script.ts --bundle --outfile=test.js
```

### Debugging Build Process
```bash
# Verbose esbuild output
esbuild src/content-script.ts --bundle --outfile=dist/content-script.js --format=iife --target=es2020 --platform=browser --log-level=verbose

# TypeScript compiler info
npx tsc --showConfig

# ESLint configuration
npx eslint --print-config src/content-script.ts
```

## 🎛️ Configuration Files

### **esbuild** (in package.json)
```json
"build:bundle": "esbuild src/content-script.ts --bundle --outfile=dist/content-script.js --format=iife --target=es2020 --platform=browser"
```

### **TypeScript** (tsconfig.json)
- Enhanced strict mode with all safety features
- Browser-specific lib configuration
- Module resolution optimized for bundling

### **ESLint** (eslint.config.js)
- Flat configuration format (ESLint v9)
- TypeScript-specific rules
- Browser extension security rules

## 🔄 Continuous Development

### Watch Mode Setup
```bash
# Terminal 1: Build watching
npm run watch

# Terminal 2: Test watching  
npm run test:watch

# Browser: Load unpacked extension, refresh on changes
```

### Pre-Commit Workflow
```bash
# Run full validation
npm run lint:check && npm run test:all && npm run build

# Should complete with zero errors/warnings
```

This build system provides a production-ready foundation for browser extension development with modern tooling, strict quality controls, and excellent developer experience.