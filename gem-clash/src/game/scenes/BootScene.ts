/**
 * Gem Link — BootScene
 * Owner: Game Engineer
 * Task: TASK-005
 *
 * Initial scene responsible for:
 * 1. SDK initialization (detects window.Jest for live vs mock mode)
 * 2. Loading saved PlayerProgress from Jest (or defaults for new players)
 * 3. Recovering incomplete purchases from previous sessions
 * 4. Registering lifecycle handlers for data flush on pause/exit
 * 5. Processing entry payload for attribution/deep links
 * 6. Storing progress into Phaser registry for scene access
 * 7. Transitioning to PreloadScene
 */

import Phaser from 'phaser';
import { Logger } from '../../utils/Logger';
import { SCENE_BOOT, SCENE_PRELOAD } from '../../utils/Constants';
import { DEFAULT_PLAYER_PROGRESS, PlayerProgress } from '../../types/game.types';
import { setPlayerProgress } from '../../utils/RegistryHelper';
import { JestSDKWrapper } from '../../sdk/JestSDKWrapper';
import { PlayerDataManager } from '../../sdk/PlayerDataManager';
import { PaymentManager } from '../../sdk/PaymentManager';

export class BootScene extends Phaser.Scene {
  private logger = new Logger('BootScene');

  constructor() {
    super({ key: SCENE_BOOT });
    this.logger.info('constructor', 'BootScene instance created');
  }

  init(): void {
    this.logger.info('init', 'BootScene entered — no data expected');
    this.logger.debug('init', 'Game dimensions', {
      width: this.scale.width,
      height: this.scale.height,
    });
  }

  async create(): Promise<void> {
    this.logger.info('create', 'BootScene create phase started');

    try {
      // Step 1: Initialize the Jest SDK wrapper
      this.logger.info('create', 'Initializing Jest SDK wrapper');
      const sdkWrapper = JestSDKWrapper.getInstance();
      await sdkWrapper.init();

      const isMock = sdkWrapper.isMockMode();
      this.logger.info('create', `SDK mode: ${isMock ? 'MOCK' : 'LIVE'}`);

      // Step 2: Register lifecycle handlers for data flush on pause/exit
      this.registerLifecycleHandlers(sdkWrapper);

      // Step 3: Load saved player progress from Jest (or defaults)
      this.logger.info('create', 'Loading player progress from Jest');
      const pdm = new PlayerDataManager();
      let progress = await pdm.loadProgress();

      this.logger.info('create', 'Player progress loaded', {
        currentLevel: progress.currentLevel,
        lives: progress.lives,
        totalStars: progress.totalStars,
        sdkMode: isMock ? 'MOCK' : 'LIVE',
      });

      // Step 4: Recover incomplete purchases from previous sessions
      if (!isMock) {
        progress = await this.recoverPurchases(progress, pdm);
      }

      // Step 5: Process entry payload for attribution/deep links
      this.processEntryPayload(sdkWrapper);

      // Step 6: Store into Phaser registry for scene access
      setPlayerProgress(this.registry, progress);
      this.logger.info('create', 'Player progress stored in registry');

      // Step 7: Signal game ready to Jest platform
      if (!isMock) {
        await sdkWrapper.gameReady();
      }

      // Step 8: Transition to PreloadScene
      this.logger.info('create', `Transitioning to ${SCENE_PRELOAD}`);
      this.scene.start(SCENE_PRELOAD);

      this.logger.info('create', 'BootScene create phase complete');
    } catch (err: unknown) {
      this.logger.error('create', 'Fatal error during boot — falling back to defaults', err);

      // Fallback: load defaults and continue anyway
      setPlayerProgress(this.registry, { ...DEFAULT_PLAYER_PROGRESS });
      this.scene.start(SCENE_PRELOAD);
    }
  }

  /**
   * Register lifecycle handlers to flush player data on app pause/exit.
   * Critical for ensuring data persistence when user switches apps or closes.
   */
  private registerLifecycleHandlers(sdkWrapper: JestSDKWrapper): void {
    // Handle visibility change (app paused/backgrounded)
    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState === 'hidden') {
        this.logger.info('lifecycleHandler', 'App paused - flushing player data');
        await sdkWrapper.flushPlayerData();
      }
    });

    // Handle app exit/close
    window.addEventListener('beforeunload', () => {
      this.logger.info('lifecycleHandler', 'App exiting - flushing player data');
      // Note: Using synchronous-style call since beforeunload doesn't wait for async
      sdkWrapper.flushPlayerData();
    });

    this.logger.info('registerLifecycleHandlers', 'Lifecycle flush handlers registered');
  }

  /**
   * Recover incomplete purchases from previous sessions.
   * Grants items and completes purchases that were interrupted.
   */
  private async recoverPurchases(
    progress: PlayerProgress,
    pdm: PlayerDataManager
  ): Promise<PlayerProgress> {
    this.logger.info('recoverPurchases', 'Checking for incomplete purchases');

    const paymentManager = new PaymentManager();
    const recovered = await paymentManager.recoverIncompletePurchases(
      async (sku: string, _purchaseToken: string) => {
        // Grant the item based on SKU
        progress = this.grantItemBySku(progress, sku);
        await pdm.saveProgress(progress);
        this.logger.info('recoverPurchases', 'Recovered item granted', { sku });
      }
    );

    if (recovered > 0) {
      this.logger.info('recoverPurchases', `Recovered ${recovered} incomplete purchases`);
    }

    return progress;
  }

  /**
   * Grant an item to the player based on product SKU.
   * Used for purchase recovery.
   */
  private grantItemBySku(progress: PlayerProgress, sku: string): PlayerProgress {
    // Import product SKUs for matching
    switch (sku) {
      case 'gc_lives_refill':
        progress.lives = 5;
        break;
      case 'gc_remap':
        progress.remapTokens += 1;
        break;
      case 'gc_moves_3':
        progress.remapTokens += 1;
        break;
      case 'gc_starter_pack':
        progress.lives = 5;
        progress.remapTokens += 3;
        break;
      case 'gc_pack_beginner':
        progress.coins += 250;
        break;
      case 'gc_pack_jumbo':
        progress.coins += 1000;
        progress.gems += 10;
        break;
      case 'gc_pack_super':
        progress.coins += 3000;
        progress.gems += 30;
        progress.remapTokens += 3;
        break;
      case 'gc_pack_mega':
        progress.coins += 8000;
        progress.gems += 100;
        progress.remapTokens += 10;
        break;
      case 'gc_hammer':
      case 'gc_bomb_booster':
      case 'gc_rainbow':
        progress.remapTokens += 1;
        break;
      default:
        this.logger.warn('grantItemBySku', 'Unknown SKU during recovery', { sku });
    }
    return progress;
  }

  /**
   * Process entry payload for attribution, challenges, and deep links.
   * Stores relevant data in registry for scenes to handle.
   */
  private processEntryPayload(sdkWrapper: JestSDKWrapper): void {
    const entryPayload = sdkWrapper.getEntryPayload();

    if (Object.keys(entryPayload).length === 0) {
      this.logger.debug('processEntryPayload', 'No entry payload present');
      return;
    }

    // Handle challenge invites
    if (entryPayload.challengeId) {
      this.logger.info('processEntryPayload', 'Game launched from challenge', {
        challengeId: entryPayload.challengeId,
        senderId: entryPayload.senderId,
      });
      // Store in registry for GameplayScene to handle
      this.registry.set('pendingChallenge', entryPayload);
    }

    // Handle notification attribution
    if (entryPayload.notificationId) {
      this.logger.info('processEntryPayload', 'Game launched from notification', {
        notificationId: entryPayload.notificationId,
      });
      // Could track for analytics
      this.registry.set('notificationAttribution', entryPayload.notificationId);
    }

    // Handle referral links
    if (entryPayload.referrerId) {
      this.logger.info('processEntryPayload', 'Game launched from referral', {
        referrerId: entryPayload.referrerId,
      });
      this.registry.set('referrerAttribution', entryPayload.referrerId);
    }

    this.logger.info('processEntryPayload', 'Entry payload processed', {
      keys: Object.keys(entryPayload),
    });
  }
}
