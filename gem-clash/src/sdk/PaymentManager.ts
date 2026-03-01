/**
 * Gem Link -- Payment Manager
 * Owner: Frontend Lead Engineer
 * Task: TASK-003
 *
 * Manages the Jest 3-step purchase flow: getProducts -> purchaseProduct -> consumePurchase.
 * Emits GameEvents via EventBus for purchase lifecycle so the UI can react.
 */

import { Logger } from '../utils/Logger';
import { EventBus } from '../utils/EventBus';
import {
  ProductSKU,
  PRODUCT_CATALOG,
  GameEvent,
} from '../types/game.types';
import { JestSDKWrapper } from './JestSDKWrapper';
import type { JestProduct, JestPurchaseResult } from './types';

export class PaymentManager {
  private logger = new Logger('PaymentManager');
  private sdk: JestSDKWrapper;
  private purchaseInProgress = false;

  constructor() {
    this.sdk = JestSDKWrapper.getInstance();
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
   *   1. purchaseProduct(sku) -- opens the platform payment dialog
   *   2. consumePurchase(token) -- marks the purchase as consumed (delivers the goods)
   *   3. Emit lifecycle events so the UI/game can react
   *
   * Returns the JestPurchaseResult.
   */
  async purchase(sku: ProductSKU): Promise<JestPurchaseResult> {
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
      return { success: false, productId: sku, error };
    }

    if (this.purchaseInProgress) {
      this.logger.warn('purchase', 'Purchase already in progress, ignoring request', { sku });
      return { success: false, productId: sku, error: 'Purchase already in progress' };
    }

    this.purchaseInProgress = true;

    try {
      // Emit purchase started event
      EventBus.emit(GameEvent.PURCHASE_STARTED, { sku });
      this.logger.info('purchase', 'Purchase started', { sku });

      // Step 1: Initiate the purchase via the SDK
      const result = await this.sdk.purchaseProduct(sku);

      if (!result.success) {
        // Distinguish between failure and cancellation.
        // The Jest SDK signals cancellation when the error contains "cancel".
        const isCancelled = result.error
          ? result.error.toLowerCase().includes('cancel')
          : false;

        if (isCancelled) {
          EventBus.emit(GameEvent.PURCHASE_CANCELLED, { sku });
          this.logger.info('purchase', 'Purchase cancelled by user', { sku });
        } else {
          EventBus.emit(GameEvent.PURCHASE_FAILED, { sku, error: result.error });
          this.logger.error('purchase', 'Purchase failed', { sku, error: result.error });
        }

        // Structured audit log for purchase monitoring
        console.log(JSON.stringify({
          event: 'purchase_attempt',
          success: false,
          sku,
          cancelled: isCancelled,
          error: result.error,
          timestamp: new Date().toISOString(),
        }));

        return result;
      }

      // Step 2: Consume the purchase so the platform knows the goods were delivered
      if (result.purchaseToken) {
        await this.sdk.consumePurchase(result.purchaseToken);
        this.logger.info('purchase', 'Purchase consumed', {
          sku,
          purchaseToken: result.purchaseToken,
        });
      }

      // Step 3: Emit purchase completed event
      EventBus.emit(GameEvent.PURCHASE_COMPLETED, {
        sku,
        purchaseToken: result.purchaseToken,
      });
      this.logger.info('purchase', 'Purchase flow completed successfully', { sku });

      // Structured audit log for successful purchase
      console.log(JSON.stringify({
        event: 'purchase_attempt',
        success: true,
        sku,
        purchaseToken: result.purchaseToken,
        timestamp: new Date().toISOString(),
      }));

      return result;
    } catch (err) {
      EventBus.emit(GameEvent.PURCHASE_FAILED, { sku, error: String(err) });
      this.logger.error('purchase', 'Purchase flow threw an exception', err);

      // Structured audit log for purchase exception
      console.log(JSON.stringify({
        event: 'purchase_attempt',
        success: false,
        sku,
        error: String(err),
        exception: true,
        timestamp: new Date().toISOString(),
      }));

      return { success: false, productId: sku, error: String(err) };
    } finally {
      this.purchaseInProgress = false;
    }
  }

  /**
   * Whether a purchase transaction is currently in progress.
   * The UI should disable purchase buttons while this is true.
   */
  isPurchaseInProgress(): boolean {
    return this.purchaseInProgress;
  }
}
