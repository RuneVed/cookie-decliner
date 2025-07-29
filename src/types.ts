// Type definitions for browser cookie consent APIs

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

/**
 * TCF (Transparency and Consent Framework) API data structure
 * @see https://github.com/InteractiveAdvertisingBureau/GDPR-Transparency-and-Consent-Framework
 */
export interface TCFData {
  readonly cmpStatus: string;
  readonly eventStatus: string;
  readonly gdprApplies?: boolean;
  readonly tcString: string;
  readonly cmpId?: number;
  readonly cmpVersion?: number;
  readonly tcfPolicyVersion?: number;
  readonly isServiceSpecific?: boolean;
  readonly useNonStandardTexts?: boolean;
  readonly publisherCC?: string;
  readonly purposeOneTreatment?: boolean;
}

/**
 * SourcePoint CMP configuration interface
 */
export interface SourcePointConfig {
  readonly accountId?: number;
  readonly baseEndpoint?: string;
  readonly mmsDomain?: string;
  readonly events?: {
    readonly onMessageChoiceSelect?: (choice: { choice: number }) => void;
    readonly onMessageReceiveData?: (data: unknown) => void;
    readonly onPrivacyManagerAction?: (action: unknown) => void;
  };
}

/**
 * SourcePoint global API interface
 */
export interface SourcePointAPI {
  readonly [key: string]: unknown;
  readonly config?: SourcePointConfig;
  readonly executeMessaging?: () => void;
  readonly declineAll?: () => void;
  readonly choiceReject?: () => void;
}

/**
 * Extended Window interface with cookie consent management APIs
 */
export interface WindowWithAPIs extends Window {
  readonly __tcfapi?: (command: string, version: number, callback: (data: TCFData, success: boolean) => void, ...args: unknown[]) => void;
  readonly __cmp?: (command: string, parameter?: unknown, callback?: (result: unknown, success: boolean) => void) => void;
  readonly _sp_?: SourcePointAPI;
  readonly Cookiebot?: {
    readonly consent?: Record<string, boolean>;
    readonly consented?: boolean;
    readonly declined?: boolean;
  };
  readonly OneTrust?: {
    readonly OptanonWrapper?: () => void;
    readonly RejectAll?: () => void;
    readonly IsAlertBoxClosed?: () => boolean;
  };
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