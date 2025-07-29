# Cookie Decliner Development Setup

Quick setup guide for the Cookie Decliner browser extension with modern TypeScript, esbuild bundling, and comprehensive testing.

## Prerequisites

- **Node.js 18+** - [Download from nodejs.org](https://nodejs.org/)
- **Git** - For cloning the repository
- **VS Code** (recommended) - For the best development experience

## Quick Setup

```bash
# Clone the repository
git clone https://github.com/RuneVed/cookie-decliner.git
cd cookie-decliner

# Install dependencies
npm install

# Build the extension
npm run build

# Verify everything works
npm run test
```

## Development Workflow

```bash
# Start development with auto-rebuild
npm run watch

# Run tests in watch mode (separate terminal)
npm run test:watch

# Check code quality
npm run lint:check

# Run all tests
npm run test:all
```

## Browser Installation

### Chrome
1. Open `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `cookie-decliner` folder
5. Extension appears in toolbar

### Firefox
1. Open `about:debugging` → "This Firefox"
2. Click "Load Temporary Add-on"
3. Select `manifest.json` from the project folder
4. Extension active until Firefox restarts

## Key Technologies

- **TypeScript 5.8.3** - Enhanced strict mode configuration
- **esbuild 0.25.8** - Fast bundling with IIFE format for browser compatibility
- **ESLint 9.32.0** - Zero-warning policy with comprehensive rules
- **Jest 30.0.5** - 74 comprehensive unit tests
- **Playwright** - End-to-end browser testing

## Build Output

The build process creates `dist/content-script.js` - a single bundled file in IIFE format that works in all browser extension environments without module system issues.

## Troubleshooting

**Build fails?**
```bash
npm run clean && npm run build
```

**Lint errors?**
```bash
npm run lint:fix
```

**Tests failing?**
```bash
npm run test -- --verbose
```

**Extension not working?**
- Ensure you've run `npm run build` first
- Check browser console for "Cookie Decliner" logs
- Refresh the webpage after loading extension

For detailed information, see:
- [Build System Guide](./build-system.md) - Comprehensive bundling documentation
- [Testing Guide](./testing-guide.md) - Testing setup and best practices
- [TypeScript Best Practices](./typescript-best-practices.md) - Code standards