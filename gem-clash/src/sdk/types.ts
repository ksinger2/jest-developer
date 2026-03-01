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

/** Jest payment purchase result */
export interface JestPurchaseResult {
  success: boolean;
  purchaseToken?: string;
  productId: string;
  error?: string;
}

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

  // Player Data
  getPlayerData(keys: string[]): Promise<JestPlayerData>;
  setPlayerData(data: JestPlayerData): Promise<void>;

  // Payments
  getProducts(productIds: string[]): Promise<JestProduct[]>;
  purchaseProduct(productId: string): Promise<JestPurchaseResult>;
  consumePurchase(purchaseToken: string): Promise<void>;

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
}

/** Extend Window to include Jest SDK */
declare global {
  interface Window {
    Jest?: JestSDK;
  }
}
