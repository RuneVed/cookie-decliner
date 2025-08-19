# TypeScript Best Practices Applied

This document outlines the TypeScript best practices implemented in the Cookie Decliner project, following the official TypeScript documentation (typescriptlang.org) and TypeScript Handbook recommendations for version 5.8+.

## 1. Enhanced tsconfig.json Configuration (Official TypeScript tsconfig.json Reference)

### Type Checking Improvements (Based on typescriptlang.org/tsconfig)
- **Enhanced strict mode**: Added `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess` for stricter type checking per TypeScript handbook
- **Better error detection**: Added `noFallthroughCasesInSwitch`, `noImplicitOverride`, `noImplicitReturns` following TypeScript compiler options
- **Code cleanliness**: Added `noUnusedLocals`, `noUnusedParameters` to catch unused code (TypeScript best practices)
- **Safer property access**: Added `noPropertyAccessFromIndexSignature` to enforce bracket notation for index signatures (TypeScript v4.1+ feature)

### Module Resolution (TypeScript Modules Reference)
- **Modern bundler support**: Changed `moduleResolution` from `"node"` to `"bundler"` for better bundler compatibility with esbuild (TypeScript 4.7+ feature)
- **JSON imports**: Added `resolveJsonModule` for importing JSON files safely (TypeScript module resolution)
- **Verbatim modules**: Added `verbatimModuleSyntax` for explicit import/export handling (TypeScript 5.0+ feature)

### Output Configuration (TypeScript Compiler Options)
- **Better debugging**: Added `declaration`, `declarationMap`, `sourceMap` for enhanced development experience
- **Build safety**: Added `noEmitOnError` to prevent compilation with errors (TypeScript emit options)
- **Clean builds**: Added `removeComments: false` to preserve documentation in output

### Interop Constraints (TypeScript Interop Options)
- **Module safety**: Added `isolatedModules` for better transpiler compatibility (TypeScript compilation)
- **Import consistency**: Added `forceConsistentCasingInFileNames` for cross-platform consistency (TypeScript compiler flags)

## 2. Modern Import/Export Patterns (TypeScript Module System)

### Type-Only Imports (TypeScript 3.8+ Feature)
```typescript
// ✅ Good - Type-only imports (verbatimModuleSyntax: true)
import { type WindowWithAPIs, type TCFData } from './types';

// ❌ Avoid - Mixed imports that could cause bundling issues
import { WindowWithAPIs, TCFData, hasTCFAPI } from './types';
```

### Explicit Module Extensions (TypeScript Modules Documentation)
```typescript
// ✅ Good - Clear module references for bundlers (moduleResolution: "bundler")
import { DOMUtils } from './dom-utils';

// ❌ Avoid - .js extensions in TypeScript files (causes bundler confusion)
import { DOMUtils } from './dom-utils.js';
```

## 3. Enhanced Type Safety (TypeScript Handbook Patterns)

### Interface Definitions (TypeScript Object Types)
```typescript
// ✅ Good - Comprehensive interface with readonly properties
export interface TCFData {
  readonly cmpStatus: string;
  readonly eventStatus: string;
  readonly gdprApplies?: boolean;
  readonly tcString: string;
}

// ✅ Good - Index signature with proper typing
export interface PostMessageData {
  readonly [key: string]: unknown;
  readonly type?: string;
}
```

### Type Guards
```typescript
// ✅ Good - Proper type guard implementation
export function hasTCFAPI(win: Window): win is WindowWithAPIs & { __tcfapi: NonNullable<WindowWithAPIs['__tcfapi']> } {
  return '__tcfapi' in win && typeof (win as WindowWithAPIs).__tcfapi === 'function';
}
```

## 4. Error Handling Best Practices

### Comprehensive Try-Catch
```typescript
// ✅ Good - Proper error handling with specific error types
static handleTCFAPI(): void {
  try {
    // API implementation
  } catch (error) {
    console.log('Cookie Decliner: Error using TCF API:', error);
  }
}
```

### Safe Property Access
```typescript
// ✅ Good - Optional chaining with null checks
if (sp.config?.events?.onMessageChoiceSelect) {
  sp.config.events.onMessageChoiceSelect({ choice: 11 });
}
```

## 5. ESLint Integration

### Enhanced TypeScript Rules
- **`@typescript-eslint/consistent-type-imports`**: Ensures type-only imports
- **`@typescript-eslint/no-floating-promises`**: Prevents unhandled promises
- **`@typescript-eslint/prefer-nullish-coalescing`**: Modern null handling
- **`@typescript-eslint/prefer-optional-chain`**: Safe property access

### Code Quality Rules
```typescript
// ✅ Good - Follows ESLint rules
const elements = DOMUtils.findElementsBySelector(selector);

// ❌ Avoid - Would trigger ESLint warnings
var elements = DOMUtils.findElementsBySelector(selector);
```

## 6. Current Project Status (July 2025)

The implementation now provides:
- ✅ **TypeScript 5.8.3** with enhanced strict configuration
- ✅ **ESLint 9.32.0** with flat config and zero-warning policy
- ✅ **esbuild 0.25.8** bundling with IIFE format for browser compatibility
- ✅ **Zero TypeScript errors** with strict mode enabled
- ✅ **Zero ESLint warnings** with comprehensive TypeScript rules
- ✅ **Full type safety** throughout the codebase
- ✅ **Better developer experience** with proper IntelliSense and error detection
- ✅ **Maintainable code** following TypeScript best practices
- ✅ **Future-proof configuration** using modern TypeScript features
- ✅ **Production-ready bundling** with proper browser extension compatibility

## References

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TypeScript ESLint Rules](https://typescript-eslint.io/rules/)
- [TypeScript Compiler Options](https://www.typescriptlang.org/tsconfig)
- [Modern TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)