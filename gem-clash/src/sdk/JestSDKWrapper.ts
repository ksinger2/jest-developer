/**
 * Gem Link -- Jest SDK Wrapper
 * Owner: Frontend Lead Engineer
 * Task: TASK-003
 *
 * Singleton wrapper around the Jest SDK.
 * Auto-detects mock mode when window.Jest is unavailable (e.g., localhost dev).
 * Every SDK method is wrapped with logging, error handling, and mock fallbacks.
 */

import { Logger } from '../utils/Logger';
import type {
  JestSDK,
  JestPlayer,
  JestPlayerData,
  JestProduct,
  JestPurchaseResult,
  JestNotificationOptions,
  JestAnalyticsEvent,
} from './types';

export class JestSDKWrapper {
  private static instance: JestSDKWrapper | null = null;

  private logger = new Logger('JestSDKWrapper');
  private sdk: JestSDK | null = null;
  private mockMode = true;
  private _initialized = false;

  private constructor() {
    // Private constructor enforces singleton
  }

  /** Whether the wrapper has been initialized */
  isInitialized(): boolean {
    return this._initialized;
  }

  /** Get the singleton instance */
  static getInstance(): JestSDKWrapper {
    if (!JestSDKWrapper.instance) {
      JestSDKWrapper.instance = new JestSDKWrapper();
    }
    return JestSDKWrapper.instance;
  }

  /**
   * Initialize the wrapper by detecting the Jest SDK on window.
   * Must be called once before using any other methods.
   */
  async init(): Promise<void> {
    this.logger.debug('init', 'Initializing Jest SDK wrapper');

    try {
      if (window.Jest) {
        this.sdk = window.Jest;
        this.mockMode = false;
        this.logger.info('init', 'Jest SDK detected -- running in LIVE mode');
      } else {
        this.sdk = null;
        this.mockMode = true;
        this.logger.info('init', 'Jest SDK not found -- running in MOCK mode');
      }
      this._initialized = true;
    } catch (err) {
      this.logger.error('init', 'Failed to initialize SDK wrapper', err);
      this.mockMode = true;
      this._initialized = true;
    }
  }

  /** Whether the wrapper is operating in mock mode (no real SDK) */
  isMockMode(): boolean {
    return this.mockMode;
  }

  /** Retrieve current player information */
  async getPlayer(): Promise<JestPlayer> {
    this.logger.debug('getPlayer', 'Fetching player info');

    const mockResult: JestPlayer = {
      playerId: 'mock-player-001',
      registered: false,
    };

    try {
      if (this.mockMode || !this.sdk) {
        this.logger.info('getPlayer', '[MOCK] Returning mock player', { mockResult });
        return mockResult;
      }

      const result = await this.sdk.getPlayer();
      this.logger.info('getPlayer', 'Player info retrieved', { result });
      return result;
    } catch (err) {
      this.logger.error('getPlayer', 'Failed to get player info', err);
      return mockResult;
    }
  }

  /** Retrieve player data by keys */
  async getPlayerData(keys: string[]): Promise<JestPlayerData> {
    this.logger.debug('getPlayerData', 'Fetching player data', { keys });

    const mockResult: JestPlayerData = {};

    try {
      if (this.mockMode || !this.sdk) {
        this.logger.info('getPlayerData', '[MOCK] Returning empty data', { mockResult });
        return mockResult;
      }

      const result = await this.sdk.getPlayerData(keys);
      this.logger.info('getPlayerData', 'Player data retrieved', { result });
      return result;
    } catch (err) {
      this.logger.error('getPlayerData', 'Failed to get player data', err);
      return mockResult;
    }
  }

  /** Persist player data (shallow merge, last-write-wins) */
  async setPlayerData(data: JestPlayerData): Promise<void> {
    this.logger.debug('setPlayerData', 'Saving player data', { data });

    try {
      if (this.mockMode || !this.sdk) {
        this.logger.info('setPlayerData', '[MOCK] Data save simulated', { data });
        return;
      }

      await this.sdk.setPlayerData(data);
      this.logger.info('setPlayerData', 'Player data saved successfully');
    } catch (err) {
      this.logger.error('setPlayerData', 'Failed to save player data', err);
    }
  }

  /** Fetch product details for the given product IDs */
  async getProducts(productIds: string[]): Promise<JestProduct[]> {
    this.logger.debug('getProducts', 'Fetching products', { productIds });

    const mockResult: JestProduct[] = productIds.map((id) => ({
      productId: id,
      title: `Mock Product (${id})`,
      price: { amount: 100, currency: 'USD' },
    }));

    try {
      if (this.mockMode || !this.sdk) {
        this.logger.info('getProducts', '[MOCK] Returning mock products', { mockResult });
        return mockResult;
      }

      const result = await this.sdk.getProducts(productIds);
      this.logger.info('getProducts', 'Products retrieved', { result });
      return result;
    } catch (err) {
      this.logger.error('getProducts', 'Failed to get products', err);
      return mockResult;
    }
  }

  /** Initiate a product purchase */
  async purchaseProduct(productId: string): Promise<JestPurchaseResult> {
    this.logger.debug('purchaseProduct', 'Initiating purchase', { productId });

    const mockResult: JestPurchaseResult = {
      success: true,
      purchaseToken: `mock-token-${Date.now()}`,
      productId,
    };

    try {
      if (this.mockMode || !this.sdk) {
        this.logger.info('purchaseProduct', '[MOCK] Returning mock purchase result', { mockResult });
        return mockResult;
      }

      const result = await this.sdk.purchaseProduct(productId);
      this.logger.info('purchaseProduct', 'Purchase completed', { result });
      return result;
    } catch (err) {
      this.logger.error('purchaseProduct', 'Purchase failed', err);
      return { success: false, productId, error: String(err) };
    }
  }

  /** Consume a purchase so the product is delivered */
  async consumePurchase(purchaseToken: string): Promise<void> {
    this.logger.debug('consumePurchase', 'Consuming purchase', { purchaseToken });

    try {
      if (this.mockMode || !this.sdk) {
        this.logger.info('consumePurchase', '[MOCK] Purchase consumption simulated', { purchaseToken });
        return;
      }

      await this.sdk.consumePurchase(purchaseToken);
      this.logger.info('consumePurchase', 'Purchase consumed successfully', { purchaseToken });
    } catch (err) {
      this.logger.error('consumePurchase', 'Failed to consume purchase', err);
    }
  }

  /** Schedule a push notification */
  async scheduleNotification(options: JestNotificationOptions): Promise<void> {
    this.logger.debug('scheduleNotification', 'Scheduling notification', { options });

    try {
      if (this.mockMode || !this.sdk) {
        this.logger.info('scheduleNotification', '[MOCK] Notification scheduling simulated', { options });
        return;
      }

      await this.sdk.scheduleNotification(options);
      this.logger.info('scheduleNotification', 'Notification scheduled', { options });
    } catch (err) {
      this.logger.error('scheduleNotification', 'Failed to schedule notification', err);
    }
  }

  /** Log an analytics event */
  async logEvent(event: JestAnalyticsEvent): Promise<void> {
    this.logger.debug('logEvent', 'Logging analytics event', { event });

    try {
      if (this.mockMode || !this.sdk) {
        this.logger.info('logEvent', '[MOCK] Analytics event logged', { event });
        return;
      }

      await this.sdk.logEvent(event);
      this.logger.info('logEvent', 'Analytics event sent', { event });
    } catch (err) {
      this.logger.error('logEvent', 'Failed to log analytics event', err);
    }
  }

  /** Show the platform registration prompt to the player */
  async showRegistrationPrompt(): Promise<{ registered: boolean }> {
    this.logger.debug('showRegistrationPrompt', 'Showing registration prompt');

    const mockResult = { registered: false };

    try {
      if (this.mockMode || !this.sdk) {
        this.logger.info('showRegistrationPrompt', '[MOCK] Returning mock registration result', { mockResult });
        return mockResult;
      }

      const result = await this.sdk.showRegistrationPrompt();
      this.logger.info('showRegistrationPrompt', 'Registration prompt result', { result });
      return result;
    } catch (err) {
      this.logger.error('showRegistrationPrompt', 'Failed to show registration prompt', err);
      return mockResult;
    }
  }

  /** Get a referral link for the current player */
  async getReferralLink(): Promise<string> {
    this.logger.debug('getReferralLink', 'Fetching referral link');

    const mockResult = 'https://jest.com/mock-referral';

    try {
      if (this.mockMode || !this.sdk) {
        this.logger.info('getReferralLink', '[MOCK] Returning mock referral link', { mockResult });
        return mockResult;
      }

      const result = await this.sdk.getReferralLink();
      this.logger.info('getReferralLink', 'Referral link retrieved', { result });
      return result;
    } catch (err) {
      this.logger.error('getReferralLink', 'Failed to get referral link', err);
      return mockResult;
    }
  }

  /** Report loading progress (0-100) to the platform */
  async setLoadingProgress(progress: number): Promise<void> {
    this.logger.debug('setLoadingProgress', 'Setting loading progress', { progress });

    try {
      if (this.mockMode || !this.sdk) {
        this.logger.info('setLoadingProgress', `[MOCK] Loading progress set to ${progress}%`);
        return;
      }

      await this.sdk.setLoadingProgress(progress);
      this.logger.info('setLoadingProgress', `Loading progress set to ${progress}%`);
    } catch (err) {
      this.logger.error('setLoadingProgress', 'Failed to set loading progress', err);
    }
  }

  /** Signal to the platform that the game is fully loaded and ready */
  async gameReady(): Promise<void> {
    this.logger.debug('gameReady', 'Signaling game ready');

    try {
      if (this.mockMode || !this.sdk) {
        this.logger.info('gameReady', '[MOCK] Game ready signal simulated');
        return;
      }

      await this.sdk.gameReady();
      this.logger.info('gameReady', 'Game ready signal sent');
    } catch (err) {
      this.logger.error('gameReady', 'Failed to signal game ready', err);
    }
  }
}
