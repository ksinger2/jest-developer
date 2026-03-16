/**
 * Gem Link — JestSDKWrapper Test Suite
 * Owner: QA Engineer
 *
 * Tests for SDK wrapper initialization, mock mode detection, and all SDK method wrappers.
 * Covers error handling, mock fallbacks, and SDK availability checks.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JestSDKWrapper } from '../sdk/JestSDKWrapper';
import type { JestSDK } from '../sdk/types';

describe('JestSDKWrapper', () => {
  let wrapper: JestSDKWrapper;

  beforeEach(() => {
    // Reset singleton instance before each test
    (JestSDKWrapper as any).instance = null;
    wrapper = JestSDKWrapper.getInstance();

    // Clear window.Jest
    delete (window as any).Jest;
  });

  describe('getInstance (singleton pattern)', () => {
    it('returns the same instance on multiple calls', () => {
      const instance1 = JestSDKWrapper.getInstance();
      const instance2 = JestSDKWrapper.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('creates exactly one instance', () => {
      const instances = [];
      for (let i = 0; i < 5; i++) {
        instances.push(JestSDKWrapper.getInstance());
      }

      const unique = new Set(instances);
      expect(unique.size).toBe(1);
    });
  });

  describe('init - mock mode detection', () => {
    it('detects mock mode when window.Jest is undefined', async () => {
      delete (window as any).Jest;

      await wrapper.init();

      expect(wrapper.isMockMode()).toBe(true);
      expect(wrapper.isInitialized()).toBe(true);
    });

    it('detects live mode when window.Jest exists', async () => {
      (window as any).Jest = createMockJestSDK();

      await wrapper.init();

      expect(wrapper.isMockMode()).toBe(false);
      expect(wrapper.isInitialized()).toBe(true);
    });

    it('sets initialized flag after init', async () => {
      expect(wrapper.isInitialized()).toBe(false);

      await wrapper.init();

      expect(wrapper.isInitialized()).toBe(true);
    });

    it('handles init errors gracefully', async () => {
      // Force an error by making window.Jest a non-object
      (window as any).Jest = null;
      Object.defineProperty(window, 'Jest', {
        get() {
          throw new Error('Access denied');
        },
      });

      await wrapper.init();

      // Should fall back to mock mode
      expect(wrapper.isMockMode()).toBe(true);
      expect(wrapper.isInitialized()).toBe(true);
    });
  });

  describe('getPlayer', () => {
    it('returns mock player in mock mode', async () => {
      await wrapper.init();

      const player = await wrapper.getPlayer();

      expect(player).toEqual({
        playerId: 'mock-player-001',
        registered: false,
      });
    });

    it('calls SDK getPlayer in live mode', async () => {
      const mockSDK = createMockJestSDK();
      (window as any).Jest = mockSDK;
      await wrapper.init();

      const result = await wrapper.getPlayer();

      expect(mockSDK.getPlayer).toHaveBeenCalled();
      expect(result.playerId).toBe('real-player-123');
    });

    it('returns mock player on SDK error', async () => {
      const mockSDK = createMockJestSDK();
      mockSDK.getPlayer = vi.fn().mockRejectedValue(new Error('Network error'));
      (window as any).Jest = mockSDK;
      await wrapper.init();

      const player = await wrapper.getPlayer();

      expect(player).toEqual({
        playerId: 'mock-player-001',
        registered: false,
      });
    });
  });

  describe('getPlayerData', () => {
    it('returns empty object in mock mode', async () => {
      await wrapper.init();

      const data = await wrapper.getPlayerData(['level', 'stars']);

      expect(data).toEqual({});
    });

    it('calls SDK getPlayerData with correct keys in live mode', async () => {
      const mockSDK = createMockJestSDK();
      (window as any).Jest = mockSDK;
      await wrapper.init();

      const keys = ['currentLevel', 'totalStars'];
      await wrapper.getPlayerData(keys);

      expect(mockSDK.getPlayerData).toHaveBeenCalledWith(keys);
    });

    it('returns mock data on SDK error', async () => {
      const mockSDK = createMockJestSDK();
      mockSDK.getPlayerData = vi.fn().mockRejectedValue(new Error('Timeout'));
      (window as any).Jest = mockSDK;
      await wrapper.init();

      const data = await wrapper.getPlayerData(['level']);

      expect(data).toEqual({});
    });

    it('handles empty keys array', async () => {
      await wrapper.init();

      const data = await wrapper.getPlayerData([]);

      expect(data).toEqual({});
    });
  });

  describe('setPlayerData', () => {
    it('simulates save in mock mode', async () => {
      await wrapper.init();

      const data = { currentLevel: 5, totalStars: 12 };
      await expect(wrapper.setPlayerData(data)).resolves.toBeUndefined();
    });

    it('calls SDK setPlayerData in live mode', async () => {
      const mockSDK = createMockJestSDK();
      (window as any).Jest = mockSDK;
      await wrapper.init();

      const data = { currentLevel: 5 };
      await wrapper.setPlayerData(data);

      expect(mockSDK.setPlayerData).toHaveBeenCalledWith(data);
    });

    it('handles SDK save errors gracefully', async () => {
      const mockSDK = createMockJestSDK();
      mockSDK.setPlayerData = vi.fn().mockRejectedValue(new Error('Save failed'));
      (window as any).Jest = mockSDK;
      await wrapper.init();

      const data = { currentLevel: 10 };
      await expect(wrapper.setPlayerData(data)).resolves.toBeUndefined();
    });

    it('handles empty data object', async () => {
      await wrapper.init();

      await expect(wrapper.setPlayerData({})).resolves.toBeUndefined();
    });
  });

  describe('getProducts', () => {
    it('returns mock products in mock mode', async () => {
      await wrapper.init();

      const products = await wrapper.getProducts(['gc_moves_3', 'gc_lives_refill']);

      expect(products).toHaveLength(2);
      expect(products[0]).toEqual({
        productId: 'gc_moves_3',
        title: 'Mock Product (gc_moves_3)',
        price: { amount: 100, currency: 'USD' },
      });
    });

    it('calls SDK getProducts in live mode', async () => {
      const mockSDK = createMockJestSDK();
      (window as any).Jest = mockSDK;
      await wrapper.init();

      const productIds = ['gc_starter_pack'];
      await wrapper.getProducts(productIds);

      expect(mockSDK.getProducts).toHaveBeenCalledWith(productIds);
    });

    it('returns mock products on SDK error', async () => {
      const mockSDK = createMockJestSDK();
      mockSDK.getProducts = vi.fn().mockRejectedValue(new Error('API error'));
      (window as any).Jest = mockSDK;
      await wrapper.init();

      const products = await wrapper.getProducts(['gc_moves_3']);

      expect(products).toHaveLength(1);
      expect(products[0].productId).toBe('gc_moves_3');
    });

    it('handles empty product IDs array', async () => {
      await wrapper.init();

      const products = await wrapper.getProducts([]);

      expect(products).toEqual([]);
    });
  });

  describe('purchaseProduct', () => {
    it('returns mock success result in mock mode', async () => {
      await wrapper.init();

      const result = await wrapper.purchaseProduct('gc_moves_3');

      expect(result.success).toBe(true);
      expect(result.productId).toBe('gc_moves_3');
      expect(result.purchaseToken).toContain('mock-token-');
    });

    it('calls SDK purchaseProduct in live mode', async () => {
      const mockSDK = createMockJestSDK();
      (window as any).Jest = mockSDK;
      await wrapper.init();

      const productId = 'gc_lives_refill';
      await wrapper.purchaseProduct(productId);

      expect(mockSDK.purchaseProduct).toHaveBeenCalledWith(productId);
    });

    it('returns failure result on SDK error', async () => {
      const mockSDK = createMockJestSDK();
      mockSDK.purchaseProduct = vi.fn().mockRejectedValue(new Error('User cancelled'));
      (window as any).Jest = mockSDK;
      await wrapper.init();

      const result = await wrapper.purchaseProduct('gc_starter_pack');

      expect(result.success).toBe(false);
      expect(result.error).toContain('User cancelled');
    });

    it('includes productId in failure result', async () => {
      const mockSDK = createMockJestSDK();
      mockSDK.purchaseProduct = vi.fn().mockRejectedValue(new Error('Payment failed'));
      (window as any).Jest = mockSDK;
      await wrapper.init();

      const result = await wrapper.purchaseProduct('gc_moves_3');

      expect(result.productId).toBe('gc_moves_3');
    });
  });

  describe('consumePurchase', () => {
    it('simulates consumption in mock mode', async () => {
      await wrapper.init();

      await expect(wrapper.consumePurchase('mock-token-123')).resolves.toBeUndefined();
    });

    it('calls SDK consumePurchase in live mode', async () => {
      const mockSDK = createMockJestSDK();
      (window as any).Jest = mockSDK;
      await wrapper.init();

      const token = 'real-token-456';
      await wrapper.consumePurchase(token);

      expect(mockSDK.consumePurchase).toHaveBeenCalledWith(token);
    });

    it('handles SDK consumption errors gracefully', async () => {
      const mockSDK = createMockJestSDK();
      mockSDK.consumePurchase = vi.fn().mockRejectedValue(new Error('Already consumed'));
      (window as any).Jest = mockSDK;
      await wrapper.init();

      await expect(wrapper.consumePurchase('token-123')).resolves.toBeUndefined();
    });
  });

  describe('scheduleNotification', () => {
    it('simulates scheduling in mock mode', async () => {
      await wrapper.init();

      const options = {
        title: 'Lives Refilled',
        body: 'Your lives are full!',
        scheduledTime: Date.now() + 3600000,
      };

      await expect(wrapper.scheduleNotification(options)).resolves.toBeUndefined();
    });

    it('calls SDK scheduleNotification in live mode', async () => {
      const mockSDK = createMockJestSDK();
      (window as any).Jest = mockSDK;
      await wrapper.init();

      const options = {
        title: 'Test Notification',
        body: 'Test body',
        scheduledTime: Date.now() + 1000,
      };

      await wrapper.scheduleNotification(options);

      expect(mockSDK.scheduleNotification).toHaveBeenCalledWith(options);
    });

    it('handles SDK scheduling errors gracefully', async () => {
      const mockSDK = createMockJestSDK();
      mockSDK.scheduleNotification = vi
        .fn()
        .mockRejectedValue(new Error('Permission denied'));
      (window as any).Jest = mockSDK;
      await wrapper.init();

      const options = {
        title: 'Test',
        body: 'Test',
        scheduledTime: Date.now(),
      };

      await expect(wrapper.scheduleNotification(options)).resolves.toBeUndefined();
    });
  });

  describe('logEvent', () => {
    it('simulates event logging in mock mode', async () => {
      await wrapper.init();

      const event = {
        name: 'level_completed',
        properties: { levelId: 1, stars: 3 },
      };

      await expect(wrapper.logEvent(event)).resolves.toBeUndefined();
    });

    it('calls SDK logEvent in live mode', async () => {
      const mockSDK = createMockJestSDK();
      (window as any).Jest = mockSDK;
      await wrapper.init();

      const event = {
        name: 'purchase_completed',
        properties: { sku: 'gc_moves_3' },
      };

      await wrapper.logEvent(event);

      expect(mockSDK.logEvent).toHaveBeenCalledWith(event);
    });

    it('handles SDK logging errors gracefully', async () => {
      const mockSDK = createMockJestSDK();
      mockSDK.logEvent = vi.fn().mockRejectedValue(new Error('Network timeout'));
      (window as any).Jest = mockSDK;
      await wrapper.init();

      const event = { name: 'test_event', properties: {} };

      await expect(wrapper.logEvent(event)).resolves.toBeUndefined();
    });
  });

  describe('showRegistrationPrompt', () => {
    it('returns mock result in mock mode', async () => {
      await wrapper.init();

      const result = await wrapper.showRegistrationPrompt();

      expect(result).toEqual({ registered: false });
    });

    it('calls SDK showRegistrationPrompt in live mode', async () => {
      const mockSDK = createMockJestSDK();
      (window as any).Jest = mockSDK;
      await wrapper.init();

      await wrapper.showRegistrationPrompt();

      expect(mockSDK.showRegistrationPrompt).toHaveBeenCalled();
    });

    it('returns mock result on SDK error', async () => {
      const mockSDK = createMockJestSDK();
      mockSDK.showRegistrationPrompt = vi
        .fn()
        .mockRejectedValue(new Error('User dismissed'));
      (window as any).Jest = mockSDK;
      await wrapper.init();

      const result = await wrapper.showRegistrationPrompt();

      expect(result).toEqual({ registered: false });
    });
  });

  describe('getReferralLink', () => {
    it('returns mock referral link in mock mode', async () => {
      await wrapper.init();

      const link = await wrapper.getReferralLink();

      expect(link).toBe('https://jest.com/mock-referral');
    });

    it('calls SDK getReferralLink in live mode', async () => {
      const mockSDK = createMockJestSDK();
      (window as any).Jest = mockSDK;
      await wrapper.init();

      await wrapper.getReferralLink();

      expect(mockSDK.getReferralLink).toHaveBeenCalled();
    });

    it('returns mock link on SDK error', async () => {
      const mockSDK = createMockJestSDK();
      mockSDK.getReferralLink = vi.fn().mockRejectedValue(new Error('Not available'));
      (window as any).Jest = mockSDK;
      await wrapper.init();

      const link = await wrapper.getReferralLink();

      expect(link).toBe('https://jest.com/mock-referral');
    });
  });

  describe('setLoadingProgress', () => {
    it('simulates progress update in mock mode', async () => {
      await wrapper.init();

      await expect(wrapper.setLoadingProgress(50)).resolves.toBeUndefined();
      await expect(wrapper.setLoadingProgress(100)).resolves.toBeUndefined();
    });

    it('calls SDK setLoadingProgress in live mode', async () => {
      const mockSDK = createMockJestSDK();
      (window as any).Jest = mockSDK;
      await wrapper.init();

      await wrapper.setLoadingProgress(75);

      expect(mockSDK.setLoadingProgress).toHaveBeenCalledWith(75);
    });

    it('handles SDK errors gracefully', async () => {
      const mockSDK = createMockJestSDK();
      mockSDK.setLoadingProgress = vi.fn().mockRejectedValue(new Error('Invalid value'));
      (window as any).Jest = mockSDK;
      await wrapper.init();

      await expect(wrapper.setLoadingProgress(120)).resolves.toBeUndefined();
    });

    it('accepts progress values 0-100', async () => {
      await wrapper.init();

      await expect(wrapper.setLoadingProgress(0)).resolves.toBeUndefined();
      await expect(wrapper.setLoadingProgress(100)).resolves.toBeUndefined();
    });
  });

  describe('gameReady', () => {
    it('simulates game ready signal in mock mode', async () => {
      await wrapper.init();

      await expect(wrapper.gameReady()).resolves.toBeUndefined();
    });

    it('calls SDK gameReady in live mode', async () => {
      const mockSDK = createMockJestSDK();
      (window as any).Jest = mockSDK;
      await wrapper.init();

      await wrapper.gameReady();

      expect(mockSDK.gameReady).toHaveBeenCalled();
    });

    it('handles SDK errors gracefully', async () => {
      const mockSDK = createMockJestSDK();
      mockSDK.gameReady = vi.fn().mockRejectedValue(new Error('Already signaled'));
      (window as any).Jest = mockSDK;
      await wrapper.init();

      await expect(wrapper.gameReady()).resolves.toBeUndefined();
    });
  });

  describe('error handling and edge cases', () => {
    it('handles multiple init calls', async () => {
      await wrapper.init();
      await wrapper.init();
      await wrapper.init();

      expect(wrapper.isInitialized()).toBe(true);
    });

    it('methods work before init (should not crash)', async () => {
      // Wrapper not initialized
      const player = await wrapper.getPlayer();

      // Should return mock data even without init
      expect(player).toBeDefined();
    });

    it('handles null SDK gracefully', async () => {
      (window as any).Jest = null;
      await wrapper.init();

      expect(wrapper.isMockMode()).toBe(true);

      const player = await wrapper.getPlayer();
      expect(player).toBeDefined();
    });
  });
});

// Helper: Create a mock Jest SDK
function createMockJestSDK(): JestSDK {
  return {
    getPlayer: vi.fn().mockResolvedValue({
      playerId: 'real-player-123',
      registered: true,
    }),
    getPlayerData: vi.fn().mockResolvedValue({
      currentLevel: 5,
      totalStars: 12,
    }),
    setPlayerData: vi.fn().mockResolvedValue(undefined),
    getProducts: vi.fn().mockResolvedValue([
      {
        productId: 'gc_starter_pack',
        title: 'Starter Pack',
        price: { amount: 300, currency: 'USD' },
      },
    ]),
    purchaseProduct: vi.fn().mockResolvedValue({
      success: true,
      productId: 'gc_starter_pack',
      purchaseToken: 'real-token-456',
    }),
    consumePurchase: vi.fn().mockResolvedValue(undefined),
    scheduleNotification: vi.fn().mockResolvedValue(undefined),
    logEvent: vi.fn().mockResolvedValue(undefined),
    showRegistrationPrompt: vi.fn().mockResolvedValue({ registered: true }),
    getReferralLink: vi.fn().mockResolvedValue('https://jest.com/referral/player-123'),
    setLoadingProgress: vi.fn().mockResolvedValue(undefined),
    gameReady: vi.fn().mockResolvedValue(undefined),
  };
}
