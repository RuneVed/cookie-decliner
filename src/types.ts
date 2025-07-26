// Type definitions for browser cookie consent APIs

/**
 * TCF (Transparency and Consent Framework) API data structure
 * @see https://github.com/InteractiveAdvertisingBureau/GDPR-Transparency-and-Consent-Framework
 */
export interface TCFData {
  readonly cmpStatus: string;
  readonly eventStatus: string;
  readonly gdprApplies: boolean;
  readonly tcString?: string;
}

/**
 * SourcePoint CMP configuration interface
 */
export interface SourcePointConfig {
  readonly events?: {
    readonly onMessageChoiceSelect?: (choice: { readonly choice: number }) => void;
  };
}

/**
 * SourcePoint global API interface
 */
export interface SourcePointAPI {
  config?: SourcePointConfig;
  executeMessaging?: () => void;
  readonly [key: string]: unknown;
}

/**
 * Extended Window interface with cookie consent management APIs
 */
export interface WindowWithAPIs extends Window {
  readonly __tcfapi?: (
    command: string, 
    version: number, 
    callback: (data: TCFData | null, success: boolean) => void, 
    ...args: readonly unknown[]
  ) => void;
  readonly _sp_?: SourcePointAPI;
  readonly __cmp?: unknown;
  readonly Cookiebot?: unknown;
  readonly OneTrust?: unknown;
}

/**
 * Type guard to check if window has TCF API
 */
export function hasTCFAPI(win: Window): win is WindowWithAPIs & { __tcfapi: NonNullable<WindowWithAPIs['__tcfapi']> } {
  return '__tcfapi' in win && typeof (win as WindowWithAPIs).__tcfapi === 'function';
}

/**
 * Type guard to check if window has SourcePoint API  
 */
export function hasSourcePointAPI(win: Window): win is WindowWithAPIs & { _sp_: NonNullable<WindowWithAPIs['_sp_']> } {
  return '_sp_' in win && typeof (win as WindowWithAPIs)._sp_ === 'object' && (win as WindowWithAPIs)._sp_ !== null;
}

/**
 * Safe type for postMessage data with indexed access
 */
export interface PostMessageData {
  readonly [key: string]: unknown;
  readonly type?: string;
  readonly name?: string;
  readonly msgType?: string;
  readonly choice?: unknown;
}