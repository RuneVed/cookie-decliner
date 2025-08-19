# Build System Guide

Modern build system with esbuild for fast development and production builds.

## 🏗️ Build Architecture

### **esbuild 0.25.8** - Primary Bundler
- **IIFE Format** - Self-executing function for browser compatibility
- **ES2020 Target** - Modern JavaScript with broad browser support
- **Single File Output** - All dependencies bundled into `dist/content-script.js`
- **Fast Builds** - Sub-second build times with watch mode

### **TypeScript 5.8.3** - Type System
- **Enhanced Strict Mode** - Maximum type safety
- **Browser-Specific Types** - Full Chrome/Firefox extension API support
- **Source Maps** - Complete debugging support

### **ESLint 9.32.0** - Code Quality
- **TypeScript Integration** - Full typescript-eslint integration
- **Zero Warnings Policy** - Enforced through pre-build checks

## 🔧 Essential Commands

### Development
```bash
# Build for production
npm run build

# Development with auto-rebuild
npm run watch

# Clean build artifacts
npm run clean
```

### Code Quality
```bash
# Run ESLint
npm run lint

# Auto-fix lint issues
npm run lint:fix
```

### Testing
```bash
# Unit tests
npm run test

# Tests with coverage
npm run test:coverage

# All tests (unit + e2e)
npm run test:all
```

## 🎯 Build Process

1. **Pre-Build Validation** - ESLint with zero warnings + TypeScript validation
2. **Bundle Creation** - esbuild bundles `src/content-script.ts` → `dist/content-script.js`
3. **Asset Copying** - Copies `manifest.json`, `popup.html`, icons to `dist/`

## ⚡ Key Features

- **Fast Builds** - Sub-second compilation with esbuild
- **IIFE Format** - Browser-compatible self-executing bundle
- **Type Safety** - Full TypeScript validation before build
- **Hot Reload** - Watch mode for development
- **Zero Warnings** - Strict code quality enforcement

## � Configuration Files

- **`esbuild.config.js`** - Bundle configuration
- **`tsconfig.json`** - TypeScript settings
- **`eslint.config.js`** - Code quality rules

## 🚀 Quick Start

1. **Build the extension**: `npm run build`
2. **Chrome**: Load unpacked from project folder
3. **Firefox**: Load temporary addon using `manifest.json`
4. **Verify**: Check browser console for "Cookie Decliner" logs

## 🐛 Common Issues

**Build failures**: Run `npm run lint:fix` then `npm run build`
**Module errors**: Ensure all imports use relative paths
**Extension not loading**: Check `dist/content-script.js` exists