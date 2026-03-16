/**
 * Gem Link — PaymentManager Test Suite
 * Owner: QA Engineer
 *
 * Tests for the Jest 3-step purchase flow: getProducts → purchaseProduct → consumePurchase.
 * Covers happy path, cancellations, errors, mock mode blocking, and event emissions.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { PaymentManager } from '../sdk/PaymentManager';
import { JestSDKWrapper } from '../sdk/JestSDKWrapper';
import { EventBus } from '../utils/EventBus';
import { ProductSKU, GameEvent } from '../types/game.types';
import type { JestPurchaseResult } from '../sdk/types';

describe('PaymentManager', () => {
  let paymentManager: PaymentManager;
  let mockSDK: JestSDKWrapper;

  beforeEach(() => {
    // Reset SDK singleton
    (JestSDKWrapper as any).instance = null;

    // Clear window.Jest
    delete (window as any).Jest;

    paymentManager = new PaymentManager();
    mockSDK = JestSDKWrapper.getInstance();

    // Clear EventBus listeners
    EventBus.removeAllListeners();

    // Spy on console.log for audit log verification
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isSdkAvailable', () => {
    it('returns false when SDK is in mock mode (localhost)', async () => {
      await mockSDK.init();

      expect(paymentManager.isSdkAvailable()).toBe(false);
    });

    it('returns true when SDK is in live mode (Jest platform)', async () => {
      (window as any).Jest = createMockJestSDK();
      await mockSDK.init();

      expect(paymentManager.isSdkAvailable()).toBe(true);
    });
  });

  describe('getAvailableProducts', () => {
    it('fetches products for all catalog SKUs', async () => {
      (window as any).Jest = createMockJestSDK();
      await mockSDK.init();

      const products = await paymentManager.getAvailableProducts();

      expect(products).toBeDefined();
      expect(Array.isArray(products)).toBe(true);
    });

    it('returns empty array on SDK error', async () => {
      (window as any).Jest = createMockJestSDK();
      await mockSDK.init();

      // Mock SDK to throw error
      vi.spyOn(mockSDK, 'getProducts').mockRejectedValue(new Error('Network error'));

      const products = await paymentManager.getAvailableProducts();

      expect(products).toEqual([]);
    });

    it('works in mock mode (returns mock products)', async () => {
      await mockSDK.init();

      const products = await paymentManager.getAvailableProducts();

      expect(products.length).toBeGreaterThan(0);
      expect(products[0]).toHaveProperty('productId');
      expect(products[0]).toHaveProperty('title');
      expect(products[0]).toHaveProperty('price');
    });
  });

  describe('purchase - SDK availability guard', () => {
    it('BLOCKS purchase when SDK not available (mock mode)', async () => {
      await mockSDK.init(); // Mock mode

      const result = await paymentManager.purchase(ProductSKU.EXTRA_MOVES);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Jest SDK not available');
    });

    it('emits PURCHASE_FAILED event when SDK not available', async () => {
      await mockSDK.init();

      const listener = vi.fn();
      EventBus.on(GameEvent.PURCHASE_FAILED, listener);

      await paymentManager.purchase(ProductSKU.EXTRA_MOVES);

      expect(listener).toHaveBeenCalledWith({
        sku: ProductSKU.EXTRA_MOVES,
        error: expect.stringContaining('Jest SDK not available'),
      });
    });

    it('logs audit event when purchase blocked in mock mode', async () => {
      await mockSDK.init();

      await paymentManager.purchase(ProductSKU.LIVES_REFILL);

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('purchase_blocked'),
      );
    });

    it('prevents multiple simultaneous purchases', async () => {
      (window as any).Jest = createMockJestSDK();
      await mockSDK.init();

      // Mock purchaseProduct to delay
      vi.spyOn(mockSDK, 'purchaseProduct').mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  success: true,
                  productId: ProductSKU.EXTRA_MOVES,
                  purchaseToken: 'token-123',
                }),
              100,
            ),
          ),
      );

      const promise1 = paymentManager.purchase(ProductSKU.EXTRA_MOVES);
      const promise2 = paymentManager.purchase(ProductSKU.LIVES_REFILL);

      const [result1, result2] = await Promise.all([promise1, promise2]);

      // One should succeed, one should be blocked
      const blocked = [result1, result2].find((r) => r.error?.includes('already in progress'));
      expect(blocked).toBeDefined();
    });
  });

  describe('purchase - happy path', () => {
    it('completes full 3-step flow successfully', async () => {
      (window as any).Jest = createMockJestSDK();
      await mockSDK.init();

      const purchaseSpy = vi.spyOn(mockSDK, 'purchaseProduct');
      const consumeSpy = vi.spyOn(mockSDK, 'consumePurchase');

      const result = await paymentManager.purchase(ProductSKU.STARTER_PACK);

      expect(result.success).toBe(true);
      expect(purchaseSpy).toHaveBeenCalledWith(ProductSKU.STARTER_PACK);
      expect(consumeSpy).toHaveBeenCalledWith(result.purchaseToken);
    });

    it('emits PURCHASE_STARTED event', async () => {
      (window as any).Jest = createMockJestSDK();
      await mockSDK.init();

      const listener = vi.fn();
      EventBus.on(GameEvent.PURCHASE_STARTED, listener);

      await paymentManager.purchase(ProductSKU.EXTRA_MOVES);

      expect(listener).toHaveBeenCalledWith({ sku: ProductSKU.EXTRA_MOVES });
    });

    it('emits PURCHASE_COMPLETED event on success', async () => {
      (window as any).Jest = createMockJestSDK();
      await mockSDK.init();

      const listener = vi.fn();
      EventBus.on(GameEvent.PURCHASE_COMPLETED, listener);

      const result = await paymentManager.purchase(ProductSKU.LIVES_REFILL);

      expect(listener).toHaveBeenCalledWith({
        sku: ProductSKU.LIVES_REFILL,
        purchaseToken: result.purchaseToken,
      });
    });

    it('logs audit event for successful purchase', async () => {
      (window as any).Jest = createMockJestSDK();
      await mockSDK.init();

      await paymentManager.purchase(ProductSKU.STARTER_PACK);

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('"success":true'),
      );
    });

    it('consumes purchase token after successful purchase', async () => {
      (window as any).Jest = createMockJestSDK();
      await mockSDK.init();

      const consumeSpy = vi.spyOn(mockSDK, 'consumePurchase');

      await paymentManager.purchase(ProductSKU.EXTRA_MOVES);

      expect(consumeSpy).toHaveBeenCalled();
    });

    it('returns purchase token in result', async () => {
      (window as any).Jest = createMockJestSDK();
      await mockSDK.init();

      const result = await paymentManager.purchase(ProductSKU.LIVES_REFILL);

      expect(result.purchaseToken).toBeDefined();
      expect(typeof result.purchaseToken).toBe('string');
    });
  });

  describe('purchase - user cancellation', () => {
    it('detects cancellation when error contains "cancel"', async () => {
      (window as any).Jest = createMockJestSDK();
      await mockSDK.init();

      vi.spyOn(mockSDK, 'purchaseProduct').mockResolvedValue({
        success: false,
        productId: ProductSKU.EXTRA_MOVES,
        error: 'User cancelled the purchase',
      });

      const listener = vi.fn();
      EventBus.on(GameEvent.PURCHASE_CANCELLED, listener);

      const result = await paymentManager.purchase(ProductSKU.EXTRA_MOVES);

      expect(result.success).toBe(false);
      expect(listener).toHaveBeenCalledWith({ sku: ProductSKU.EXTRA_MOVES });
    });

    it('emits PURCHASE_CANCELLED event (not PURCHASE_FAILED)', async () => {
      (window as any).Jest = createMockJestSDK();
      await mockSDK.init();

      vi.spyOn(mockSDK, 'purchaseProduct').mockResolvedValue({
        success: false,
        productId: ProductSKU.STARTER_PACK,
        error: 'Payment dialog cancelled by user',
      });

      const cancelledListener = vi.fn();
      const failedListener = vi.fn();

      EventBus.on(GameEvent.PURCHASE_CANCELLED, cancelledListener);
      EventBus.on(GameEvent.PURCHASE_FAILED, failedListener);

      await paymentManager.purchase(ProductSKU.STARTER_PACK);

      expect(cancelledListener).toHaveBeenCalled();
      expect(failedListener).not.toHaveBeenCalled();
    });

    it('logs audit event for cancellation', async () => {
      (window as any).Jest = createMockJestSDK();
      await mockSDK.init();

      vi.spyOn(mockSDK, 'purchaseProduct').mockResolvedValue({
        success: false,
        productId: ProductSKU.EXTRA_MOVES,
        error: 'User cancelled',
      });

      await paymentManager.purchase(ProductSKU.EXTRA_MOVES);

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('"cancelled":true'),
      );
    });

    it('does not consume purchase on cancellation', async () => {
      (window as any).Jest = createMockJestSDK();
      await mockSDK.init();

      vi.spyOn(mockSDK, 'purchaseProduct').mockResolvedValue({
        success: false,
        productId: ProductSKU.LIVES_REFILL,
        error: 'Cancelled',
      });

      const consumeSpy = vi.spyOn(mockSDK, 'consumePurchase');

      await paymentManager.purchase(ProductSKU.LIVES_REFILL);

      expect(consumeSpy).not.toHaveBeenCalled();
    });
  });

  describe('purchase - failure scenarios', () => {
    it('emits PURCHASE_FAILED on non-cancellation errors', async () => {
      (window as any).Jest = createMockJestSDK();
      await mockSDK.init();

      vi.spyOn(mockSDK, 'purchaseProduct').mockResolvedValue({
        success: false,
        productId: ProductSKU.EXTRA_MOVES,
        error: 'Payment method declined',
      });

      const listener = vi.fn();
      EventBus.on(GameEvent.PURCHASE_FAILED, listener);

      await paymentManager.purchase(ProductSKU.EXTRA_MOVES);

      expect(listener).toHaveBeenCalledWith({
        sku: ProductSKU.EXTRA_MOVES,
        error: 'Payment method declined',
      });
    });

    it('handles network errors during purchase', async () => {
      (window as any).Jest = createMockJestSDK();
      await mockSDK.init();

      vi.spyOn(mockSDK, 'purchaseProduct').mockResolvedValue({
        success: false,
        productId: ProductSKU.STARTER_PACK,
        error: 'Network timeout',
      });

      const result = await paymentManager.purchase(ProductSKU.STARTER_PACK);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network timeout');
    });

    it('handles exceptions during purchase flow', async () => {
      (window as any).Jest = createMockJestSDK();
      await mockSDK.init();

      vi.spyOn(mockSDK, 'purchaseProduct').mockRejectedValue(
        new Error('Unexpected error'),
      );

      const listener = vi.fn();
      EventBus.on(GameEvent.PURCHASE_FAILED, listener);

      const result = await paymentManager.purchase(ProductSKU.LIVES_REFILL);

      expect(result.success).toBe(false);
      expect(listener).toHaveBeenCalled();
    });

    it('logs audit event for failures', async () => {
      (window as any).Jest = createMockJestSDK();
      await mockSDK.init();

      vi.spyOn(mockSDK, 'purchaseProduct').mockResolvedValue({
        success: false,
        productId: ProductSKU.EXTRA_MOVES,
        error: 'Insufficient funds',
      });

      await paymentManager.purchase(ProductSKU.EXTRA_MOVES);

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('"success":false'),
      );
    });

    it('does not consume purchase on failure', async () => {
      (window as any).Jest = createMockJestSDK();
      await mockSDK.init();

      vi.spyOn(mockSDK, 'purchaseProduct').mockResolvedValue({
        success: false,
        productId: ProductSKU.STARTER_PACK,
        error: 'Payment failed',
      });

      const consumeSpy = vi.spyOn(mockSDK, 'consumePurchase');

      await paymentManager.purchase(ProductSKU.STARTER_PACK);

      expect(consumeSpy).not.toHaveBeenCalled();
    });
  });

  describe('purchase - consumption errors', () => {
    it('completes purchase even if consumption fails', async () => {
      (window as any).Jest = createMockJestSDK();
      await mockSDK.init();

      vi.spyOn(mockSDK, 'consumePurchase').mockRejectedValue(
        new Error('Consumption failed'),
      );

      // Should still emit PURCHASE_COMPLETED
      const listener = vi.fn();
      EventBus.on(GameEvent.PURCHASE_COMPLETED, listener);

      const result = await paymentManager.purchase(ProductSKU.EXTRA_MOVES);

      expect(result.success).toBe(true);
      expect(listener).toHaveBeenCalled();
    });
  });

  describe('isPurchaseInProgress', () => {
    it('returns false initially', () => {
      expect(paymentManager.isPurchaseInProgress()).toBe(false);
    });

    it('returns true during purchase', async () => {
      (window as any).Jest = createMockJestSDK();
      await mockSDK.init();

      // Mock purchaseProduct to delay
      vi.spyOn(mockSDK, 'purchaseProduct').mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  success: true,
                  productId: ProductSKU.EXTRA_MOVES,
                  purchaseToken: 'token-123',
                }),
              50,
            ),
          ),
      );

      const promise = paymentManager.purchase(ProductSKU.EXTRA_MOVES);

      // Check immediately
      expect(paymentManager.isPurchaseInProgress()).toBe(true);

      await promise;

      // Check after completion
      expect(paymentManager.isPurchaseInProgress()).toBe(false);
    });

    it('returns false after purchase completes', async () => {
      (window as any).Jest = createMockJestSDK();
      await mockSDK.init();

      await paymentManager.purchase(ProductSKU.LIVES_REFILL);

      expect(paymentManager.isPurchaseInProgress()).toBe(false);
    });

    it('returns false after purchase fails', async () => {
      (window as any).Jest = createMockJestSDK();
      await mockSDK.init();

      vi.spyOn(mockSDK, 'purchaseProduct').mockResolvedValue({
        success: false,
        productId: ProductSKU.STARTER_PACK,
        error: 'Failed',
      });

      await paymentManager.purchase(ProductSKU.STARTER_PACK);

      expect(paymentManager.isPurchaseInProgress()).toBe(false);
    });

    it('returns false after exception', async () => {
      (window as any).Jest = createMockJestSDK();
      await mockSDK.init();

      vi.spyOn(mockSDK, 'purchaseProduct').mockRejectedValue(new Error('Error'));

      await paymentManager.purchase(ProductSKU.EXTRA_MOVES);

      expect(paymentManager.isPurchaseInProgress()).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('handles purchase without purchaseToken', async () => {
      (window as any).Jest = createMockJestSDK();
      await mockSDK.init();

      vi.spyOn(mockSDK, 'purchaseProduct').mockResolvedValue({
        success: true,
        productId: ProductSKU.EXTRA_MOVES,
        // No purchaseToken
      } as JestPurchaseResult);

      const consumeSpy = vi.spyOn(mockSDK, 'consumePurchase');

      const result = await paymentManager.purchase(ProductSKU.EXTRA_MOVES);

      expect(result.success).toBe(true);
      expect(consumeSpy).not.toHaveBeenCalled(); // Can't consume without token
    });

    it('handles all product SKUs', async () => {
      (window as any).Jest = createMockJestSDK();
      await mockSDK.init();

      const skus = [
        ProductSKU.EXTRA_MOVES,
        ProductSKU.LIVES_REFILL,
        ProductSKU.STARTER_PACK,
        ProductSKU.REMAP,
      ];

      for (const sku of skus) {
        const result = await paymentManager.purchase(sku);
        expect(result.productId).toBe(sku);
      }
    });

    it('emits correct event sequence for happy path', async () => {
      (window as any).Jest = createMockJestSDK();
      await mockSDK.init();

      const events: string[] = [];

      EventBus.on(GameEvent.PURCHASE_STARTED, () => events.push('STARTED'));
      EventBus.on(GameEvent.PURCHASE_COMPLETED, () => events.push('COMPLETED'));
      EventBus.on(GameEvent.PURCHASE_FAILED, () => events.push('FAILED'));
      EventBus.on(GameEvent.PURCHASE_CANCELLED, () => events.push('CANCELLED'));

      await paymentManager.purchase(ProductSKU.EXTRA_MOVES);

      expect(events).toEqual(['STARTED', 'COMPLETED']);
    });

    it('emits correct event sequence for cancellation', async () => {
      (window as any).Jest = createMockJestSDK();
      await mockSDK.init();

      vi.spyOn(mockSDK, 'purchaseProduct').mockResolvedValue({
        success: false,
        productId: ProductSKU.EXTRA_MOVES,
        error: 'User cancelled',
      });

      const events: string[] = [];

      EventBus.on(GameEvent.PURCHASE_STARTED, () => events.push('STARTED'));
      EventBus.on(GameEvent.PURCHASE_COMPLETED, () => events.push('COMPLETED'));
      EventBus.on(GameEvent.PURCHASE_FAILED, () => events.push('FAILED'));
      EventBus.on(GameEvent.PURCHASE_CANCELLED, () => events.push('CANCELLED'));

      await paymentManager.purchase(ProductSKU.EXTRA_MOVES);

      expect(events).toEqual(['STARTED', 'CANCELLED']);
    });
  });
});

// Helper: Create a mock Jest SDK
function createMockJestSDK() {
  return {
    getPlayer: vi.fn().mockResolvedValue({
      playerId: 'test-player-123',
      registered: true,
    }),
    getPlayerData: vi.fn().mockResolvedValue({}),
    setPlayerData: vi.fn().mockResolvedValue(undefined),
    getProducts: vi.fn().mockResolvedValue([
      {
        productId: ProductSKU.EXTRA_MOVES,
        title: 'Extra Moves',
        price: { amount: 100, currency: 'USD' },
      },
      {
        productId: ProductSKU.LIVES_REFILL,
        title: 'Lives Refill',
        price: { amount: 200, currency: 'USD' },
      },
      {
        productId: ProductSKU.STARTER_PACK,
        title: 'Starter Pack',
        price: { amount: 300, currency: 'USD' },
      },
    ]),
    purchaseProduct: vi.fn().mockResolvedValue({
      success: true,
      productId: ProductSKU.EXTRA_MOVES,
      purchaseToken: 'mock-token-123',
    }),
    consumePurchase: vi.fn().mockResolvedValue(undefined),
    scheduleNotification: vi.fn().mockResolvedValue(undefined),
    logEvent: vi.fn().mockResolvedValue(undefined),
    showRegistrationPrompt: vi.fn().mockResolvedValue({ registered: true }),
    getReferralLink: vi.fn().mockResolvedValue('https://jest.com/referral'),
    setLoadingProgress: vi.fn().mockResolvedValue(undefined),
    gameReady: vi.fn().mockResolvedValue(undefined),
  };
}
