# Extension Icons

This folder contains the icon files for the Cookie Decliner browser extension:

- **icon16.svg** (16x16 pixels) - Small icon for browser toolbar and extension list
- **icon32.svg** (32x32 pixels) - Medium icon for extension management pages
- **icon48.svg** (48x48 pixels) - Large icon for extension details and settings
- **icon128.svg** (128x128 pixels) - High resolution icon for Chrome Web Store and app launchers

## Design Concept
The icons feature a stylized cookie with a "NO" symbol and "COOKIES" text, representing the extension's core purpose of automatically declining cookie consent popups. The green color scheme (#4CAF50) conveys a positive, privacy-focused action.

## Technical Implementation

### Manifest Integration
These icons are referenced in `manifest.json`:
```json
{
  "icons": {
    "16": "icons/icon16.svg",
    "32": "icons/icon32.svg", 
    "48": "icons/icon48.svg",
    "128": "icons/icon128.svg"
  }
}
```

### Browser Compatibility
- **Firefox**: Full SVG support for all icon sizes
- **Chrome**: SVG support in most contexts, PNG fallback may be needed for older versions
- **Edge**: SVG support similar to Chrome

### Format Details
Icons are provided in **SVG format** for several advantages:
- **Scalability** - Crisp rendering at any size
- **Small file size** - Efficient vector graphics
- **Easy editing** - Modify colors, text, or design elements
- **Future-proof** - Works with high-DPI displays

### Converting to PNG (if needed)
If PNG versions are required for specific browsers or distribution:

1. **Online converters**: Use SVG-to-PNG conversion tools
2. **Vector graphics software**: Adobe Illustrator, Inkscape, or Figma
3. **Command line**: ImageMagick or similar tools
4. **Recommended settings**: Maintain exact pixel dimensions, use transparent background

### Icon Usage Context
- **16px**: Browser toolbar, extension menu
- **32px**: Extension management page, context menus
- **48px**: Extension details pages, larger UI elements
- **128px**: Chrome Web Store listings, high-resolution displays

## Updating Icons
To modify the icons:
1. Edit the SVG files directly (they're XML-based)
2. Maintain the same dimensions and viewBox settings
3. Test across different browsers and contexts
4. Consider both light and dark browser themes

## Quality Checklist
- [ ] Icons display correctly at all sizes
- [ ] Colors are consistent across all versions
- [ ] SVG code is clean and optimized
- [ ] Icons work in both light and dark browser themes
- [ ] Text/symbols remain legible at smallest size (16px)