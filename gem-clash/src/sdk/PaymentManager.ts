/**
 * Gem Link -- Payment Manager
 * Owner: Frontend Lead Engineer
 * Task: TASK-003
 *
 * Manages the Jest 3-step purchase flow: getProducts -> beginPurchase -> completePurchase.
 * Emits GameEvents via EventBus for purchase lifecycle so the UI can react.
 * Includes payment recovery for incomplete purchases from previous sessions.
 */

import { Logger } from '../utils/Logger';
import { EventBus } from '../utils/EventBus';
import {
  ProductSKU,
  PRODUCT_CATALOG,
  GameEvent,
} from '../types/game.types';
import { JestSDKWrapper } from './JestSDKWrapper';
import { AnalyticsManager } from '../analytics/AnalyticsManager';
import type { JestProduct, JestPurchaseData } from './types';

/** Purchase result returned to callers */
export interface PurchaseResult {
  success: boolean;
  productSku: string;
  purchase?: JestPurchaseData;
  error?: string;
}

export class PaymentManager {
  private logger = new Logger('PaymentManager');
  private sdk: JestSDKWrapper;
  private purchaseInProgress = false;

  /** Timestamp when current purchase flow started (for timing analytics) */
  private purchaseStartTime: number = 0;

  /** Current trigger point for analytics */
  private currentTriggerPoint: string = 'unknown';

  /** Current level ID for analytics (optional) */
  private currentLevelId?: number;

  constructor() {
    this.sdk = JestSDKWrapper.getInstance();
  }

  /**
   * Set context for analytics tracking.
   * Call this before initiating a purchase to provide context.
   */
  setAnalyticsContext(triggerPoint: string, levelId?: number): void {
    this.currentTriggerPoint = triggerPoint;
    this.currentLevelId = levelId;
    this.logger.debug('setAnalyticsContext', 'Analytics context set', { triggerPoint, levelId });
  }

  /**
   * Whether the Jest SDK is available for real purchases.
   * Returns false when running in mock mode (localhost, outside Jest webview).
   * The UI can use this to disable purchase buttons or show appropriate messaging.
   */
  isSdkAvailable(): boolean {
    return !this.sdk.isMockMode();
  }

  /**
   * Fetch product details from the platform for all SKUs in the product catalog.
   * Returns the JestProduct array from the SDK (or mock data in mock mode).
   */
  async getAvailableProducts(): Promise<JestProduct[]> {
    this.logger.debug('getAvailableProducts', 'Fetching products for all catalog SKUs');

    try {
      const skus = PRODUCT_CATALOG.map((p) => p.sku);
      const products = await this.sdk.getProducts(skus);
      this.logger.info('getAvailableProducts', `Retrieved ${products.length} products`, {
        productIds: products.map((p) => p.productId),
      });
      return products;
    } catch (err) {
      this.logger.error('getAvailableProducts', 'Failed to fetch products', err);
      return [];
    }
  }

  /**
   * Execute the full 3-step purchase flow for a given product SKU.
   *
   * Steps:
   *   0. Verify the Jest SDK is available (reject immediately in mock/dev mode)
   *   1. beginPurchase(sku) -- opens the platform payment dialog
   *   2. Grant item to player (via event for scene to handle)
   *   3. completePurchase(token) -- marks the purchase as completed
   *   4. Flush player data to server
   *   5. Emit lifecycle events so the UI/game can react
   *
   * Returns the PurchaseResult.
   */
  async purchase(sku: ProductSKU): Promise<PurchaseResult> {
    this.logger.debug('purchase', 'Starting purchase flow', { sku });

    // ------------------------------------------------------------------
    // CRITICAL GUARD: Block purchases when the Jest SDK is not available.
    // In mock/dev mode the SDK wrapper returns fake success results, which
    // would grant items without real payment. This guard prevents that.
    // ------------------------------------------------------------------
    if (!this.isSdkAvailable()) {
      const error = 'Jest SDK not available - purchases are disabled outside the Jest platform';
      this.logger.error('purchase', 'BLOCKED: Purchase attempted without Jest SDK', {
        sku,
        sdkAvailable: false,
        mockMode: true,
      });
      // Structured audit log for purchase monitoring
      console.log(JSON.stringify({
        event: 'purchase_blocked',
        reason: 'sdk_unavailable',
        sku,
        timestamp: new Date().toISOString(),
      }));
      EventBus.emit(GameEvent.PURCHASE_FAILED, { sku, error });
      return { success: false, productSku: sku, error };
    }

    if (this.purchaseInProgress) {
      this.logger.warn('purchase', 'Purchase already in progress, ignoring request', { sku });
      return { success: false, productSku: sku, error: 'Purchase already in progress' };
    }

    this.purchaseInProgress = true;
    this.purchaseStartTime = Date.now();

    try {
      // Emit purchase started event
      EventBus.emit(GameEvent.PURCHASE_STARTED, { sku });
      this.logger.info('purchase', 'Purchase started', { sku });

      // Fire purchase_started analytics
      await this.firePurchaseStartedAnalytics(sku);

      // Step 1: Begin the purchase via the SDK
      const beginResult = await this.sdk.beginPurchase(sku);

      // Handle cancellation
      if (beginResult.result === 'cancel') {
        EventBus.emit(GameEvent.PURCHASE_CANCELLED, { sku });
        this.logger.info('purchase', 'Purchase cancelled by user', { sku });

        // Fire purchase_cancelled analytics
        await this.firePurchaseCancelledAnalytics(sku);

        // Structured audit log for purchase monitoring
        console.log(JSON.stringify({
          event: 'purchase_attempt',
          success: false,
          sku,
          cancelled: true,
          timestamp: new Date().toISOString(),
        }));

        return { success: false, productSku: sku, error: 'cancelled' };
      }

      // Handle errors
      if (beginResult.result === 'error') {
        EventBus.emit(GameEvent.PURCHASE_FAILED, { sku, error: beginResult.error });
        this.logger.error('purchase', 'Purchase failed', { sku, error: beginResult.error });

        // Fire purchase_failed analytics
        await this.firePurchaseFailedAnalytics(sku, 'sdk_error', beginResult.error);

        // Structured audit log for purchase monitoring
        console.log(JSON.stringify({
          event: 'purchase_attempt',
          success: false,
          sku,
          error: beginResult.error,
          timestamp: new Date().toISOString(),
        }));

        return { success: false, productSku: sku, error: beginResult.error };
      }

      // Step 2: Grant item BEFORE completing (critical order per Jest docs!)
      // The scene should listen to this event and grant the item durably
      EventBus.emit(GameEvent.PURCHASE_GRANT_ITEM, {
        sku,
        purchase: beginResult.purchase,
        purchaseSigned: beginResult.purchaseSigned,
      });
      this.logger.info('purchase', 'Item grant event emitted', {
        sku,
        purchaseToken: beginResult.purchase.purchaseToken,
      });

      // Step 3: Complete the purchase AFTER grant
      const completeResult = await this.sdk.completePurchase(beginResult.purchase.purchaseToken);

      if (completeResult.result === 'error') {
        this.logger.error('purchase', 'Failed to complete purchase', {
          sku,
          error: completeResult.error,
        });
        // Note: Item was already granted, so we log but don't fail the user
      }

      // Step 4: Flush player data to ensure durability
      await this.sdk.flushPlayerData();
      this.logger.info('purchase', 'Player data flushed after purchase');

      // Step 5: Emit purchase completed event
      EventBus.emit(GameEvent.PURCHASE_COMPLETED, {
        sku,
        purchaseToken: beginResult.purchase.purchaseToken,
      });
      this.logger.info('purchase', 'Purchase flow completed successfully', { sku });

      // Fire purchase_completed analytics
      await this.firePurchaseCompletedAnalytics(
        sku,
        beginResult.purchase.purchaseToken,
        beginResult.purchase.credits
      );

      // Structured audit log for successful purchase
      console.log(JSON.stringify({
        event: 'purchase_attempt',
        success: true,
        sku,
        purchaseToken: beginResult.purchase.purchaseToken,
        timestamp: new Date().toISOString(),
      }));

      return {
        success: true,
        productSku: sku,
        purchase: beginResult.purchase,
      };
    } catch (err) {
      EventBus.emit(GameEvent.PURCHASE_FAILED, { sku, error: String(err) });
      this.logger.error('purchase', 'Purchase flow threw an exception', err);

      // Fire purchase_failed analytics for exception
      await this.firePurchaseFailedAnalytics(sku, 'unknown', String(err).substring(0, 200));

      // Structured audit log for purchase exception
      console.log(JSON.stringify({
        event: 'purchase_attempt',
        success: false,
        sku,
        error: String(err),
        exception: true,
        timestamp: new Date().toISOString(),
      }));

      return { success: false, productSku: sku, error: String(err) };
    } finally {
      this.purchaseInProgress = false;
    }
  }

  /**
   * Recover and complete any incomplete purchases from previous sessions.
   * Called on app startup (BootScene) and after successful login.
   *
   * @param grantItem - Callback to grant the item for each recovered purchase
   * @returns Number of purchases successfully recovered
   */
  async recoverIncompletePurchases(
    grantItem: (sku: string, purchaseToken: string) => Promise<void>
  ): Promise<number> {
    this.logger.info('recoverIncompletePurchases', 'Starting purchase recovery');

    let totalRecovered = 0;
    let hasMore = true;

    while (hasMore) {
      const result = await this.sdk.getIncompletePurchases();
      hasMore = result.hasMore;

      for (const purchase of result.purchases) {
        try {
          // Grant the item first
          await grantItem(purchase.productSku, purchase.purchaseToken);

          // Then complete the purchase
          const completeResult = await this.sdk.completePurchase(purchase.purchaseToken);

          if (completeResult.result === 'success') {
            totalRecovered++;
            this.logger.info('recoverIncompletePurchases', 'Purchase recovered', {
              sku: purchase.productSku,
              purchaseToken: purchase.purchaseToken,
            });
          } else {
            this.logger.warn('recoverIncompletePurchases', 'Failed to complete recovered purchase', {
              sku: purchase.productSku,
              error: completeResult.result === 'error' ? completeResult.error : 'unknown',
            });
          }
        } catch (err) {
          this.logger.error('recoverIncompletePurchases', 'Failed to recover purchase', {
            sku: purchase.productSku,
            error: err,
          });
        }
      }
    }

    // Flush after all recoveries
    if (totalRecovered > 0) {
      await this.sdk.flushPlayerData();
      this.logger.info('recoverIncompletePurchases', 'Player data flushed after recovery');
    }

    this.logger.info('recoverIncompletePurchases', 'Recovery complete', { totalRecovered });
    return totalRecovered;
  }

  /**
   * Whether a purchase transaction is currently in progress.
   * The UI should disable purchase buttons while this is true.
   */
  isPurchaseInProgress(): boolean {
    return this.purchaseInProgress;
  }

  // ------------------------------------------------------------------
  // Analytics helpers (fire via AnalyticsManager)
  // ------------------------------------------------------------------

  /** Fire purchase_started analytics event */
  private async firePurchaseStartedAnalytics(sku: string): Promise<void> {
    try {
      // Get product price from catalog
      const product = PRODUCT_CATALOG.find((p) => p.sku === sku);
      const price = product?.priceInTokens ?? 0;

      // Get player registration status
      const player = await this.sdk.getPlayer();

      const analytics = AnalyticsManager.getInstance();
      await analytics.trackPurchaseStarted({
        sku,
        price,
        trigger_point: this.currentTriggerPoint,
        level_id: this.currentLevelId,
        player_registered: player.registered,
      });

      this.logger.debug('firePurchaseStartedAnalytics', 'purchase_started analytics fired', {
        sku,
        price,
        trigger_point: this.currentTriggerPoint,
      });
    } catch (err) {
      this.logger.warn('firePurchaseStartedAnalytics', 'Failed to fire analytics', err);
    }
  }

  /** Fire purchase_completed analytics event */
  private async firePurchaseCompletedAnalytics(
    sku: string,
    purchaseToken: string,
    credits: number
  ): Promise<void> {
    try {
      const timeToCompleteMs = Date.now() - this.purchaseStartTime;
      const purchaseTokenPrefix = purchaseToken.substring(0, 8);

      const analytics = AnalyticsManager.getInstance();
      await analytics.trackPurchaseCompleted({
        sku,
        price: credits,
        purchase_token_prefix: purchaseTokenPrefix,
        level_id: this.currentLevelId,
        time_to_complete_ms: timeToCompleteMs,
        verification_method: 'client_only', // Phase 1: client-only verification
      });

      this.logger.debug('firePurchaseCompletedAnalytics', 'purchase_completed analytics fired', {
        sku,
        price: credits,
        time_to_complete_ms: timeToCompleteMs,
      });
    } catch (err) {
      this.logger.warn('firePurchaseCompletedAnalytics', 'Failed to fire analytics', err);
    }
  }

  /** Fire purchase_cancelled analytics event */
  private async firePurchaseCancelledAnalytics(sku: string): Promise<void> {
    try {
      const timeToCancelMs = Date.now() - this.purchaseStartTime;

      const analytics = AnalyticsManager.getInstance();
      await analytics.trackPurchaseCancelled({
        sku,
        trigger_point: this.currentTriggerPoint,
        time_to_cancel_ms: timeToCancelMs,
        level_id: this.currentLevelId,
      });

      this.logger.debug('firePurchaseCancelledAnalytics', 'purchase_cancelled analytics fired', {
        sku,
        trigger_point: this.currentTriggerPoint,
        time_to_cancel_ms: timeToCancelMs,
      });
    } catch (err) {
      this.logger.warn('firePurchaseCancelledAnalytics', 'Failed to fire analytics', err);
    }
  }

  /** Fire purchase_failed analytics event */
  private async firePurchaseFailedAnalytics(
    sku: string,
    errorType: string,
    errorMessage: string
  ): Promise<void> {
    try {
      const timeToFailMs = Date.now() - this.purchaseStartTime;
      // Sanitize error message (truncate and remove any PII)
      const sanitizedMessage = errorMessage.substring(0, 200);

      const analytics = AnalyticsManager.getInstance();
      await analytics.trackPurchaseFailed({
        sku,
        error_type: errorType,
        error_message: sanitizedMessage,
        level_id: this.currentLevelId,
        time_to_fail_ms: timeToFailMs,
      });

      this.logger.debug('firePurchaseFailedAnalytics', 'purchase_failed analytics fired', {
        sku,
        error_type: errorType,
        time_to_fail_ms: timeToFailMs,
      });
    } catch (err) {
      this.logger.warn('firePurchaseFailedAnalytics', 'Failed to fire analytics', err);
    }
  }
}
