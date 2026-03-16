/**
 * Gem Link -- Jest SDK Type Definitions
 * Owner: Frontend Lead Engineer
 * Task: TASK-003
 *
 * Types for the Jest SDK loaded via CDN.
 * The SDK is available as window.Jest after the script loads.
 */

/** Jest player object */
export interface JestPlayer {
  playerId: string;
  registered: boolean;
  displayName?: string;
  avatarUrl?: string;
}

/** Jest player data storage (max 1MB, shallow merge, last-write-wins) */
export type JestPlayerData = Record<string, unknown>;

/** Jest payment product */
export interface JestProduct {
  productId: string;
  title: string;
  price: { amount: number; currency: string };
}

/** Jest PurchaseData returned from beginPurchase and getIncompletePurchases */
export interface JestPurchaseData {
  purchaseToken: string;
  productSku: string;
  credits: number;           // Price in Jest Tokens
  createdAt: number;         // JS timestamp (ms since epoch)
  completedAt: number | null; // null until completePurchase called
}

/** Result from JestSDK.payments.beginPurchase() */
export type JestBeginPurchaseResult =
  | { result: 'success'; purchase: JestPurchaseData; purchaseSigned: string }
  | { result: 'cancel' }
  | { result: 'error'; error: 'login_required' | 'internal_error' | 'invalid_product' };

/** Result from JestSDK.payments.completePurchase() */
export type JestCompletePurchaseResult =
  | { result: 'success' }
  | { result: 'error'; error: 'internal_error' | 'invalid_token' };

/** Result from JestSDK.payments.getIncompletePurchases() */
export interface JestIncompletePurchasesResult {
  purchases: JestPurchaseData[];
  purchasesSigned: string;
  hasMore: boolean;
}

/** Entry payload from notification/referral links */
export type JestEntryPayload = Record<string, unknown>;

/** Jest notification scheduling options */
export interface JestNotificationOptions {
  title: string;
  body: string;
  imageUrl?: string;
  delaySeconds: number;
}

/** Jest analytics event */
export interface JestAnalyticsEvent {
  eventName: string;
  params?: Record<string, string | number | boolean>;
}

/** Jest SDK interface (what window.Jest provides) */
export interface JestSDK {
  // Player
  getPlayer(): Promise<JestPlayer>;

  // Player Data (namespaced per SDK docs)
  data: {
    getAll(): Record<string, unknown>;
    get(key: string): unknown;
    set(data: Record<string, unknown>): void;
    set(key: string, value: unknown): void;
    delete(key: string): void;
    flush(): Promise<void>;
  };

  // Legacy Player Data methods (for backwards compatibility)
  getPlayerData(keys: string[]): Promise<JestPlayerData>;
  setPlayerData(data: JestPlayerData): Promise<void>;

  // Payments (namespaced per SDK docs)
  payments: {
    getProducts(): Promise<JestProduct[]>;
    beginPurchase(params: { productSku: string }): Promise<JestBeginPurchaseResult>;
    completePurchase(params: { purchaseToken: string }): Promise<JestCompletePurchaseResult>;
    getIncompletePurchases(): Promise<JestIncompletePurchasesResult>;
  };

  // Legacy Payments methods (for backwards compatibility during migration)
  getProducts(productIds: string[]): Promise<JestProduct[]>;

  // Notifications
  scheduleNotification(options: JestNotificationOptions): Promise<void>;

  // Analytics
  logEvent(event: JestAnalyticsEvent): Promise<void>;

  // Registration
  showRegistrationPrompt(): Promise<{ registered: boolean }>;

  // Referrals
  getReferralLink(): Promise<string>;

  // Session
  setLoadingProgress(progress: number): Promise<void>;
  gameReady(): Promise<void>;

  // Entry Payload (for attribution)
  getEntryPayload(): JestEntryPayload;
}

/** Extend Window to include Jest SDK */
declare global {
  interface Window {
    Jest?: JestSDK;
  }
}
