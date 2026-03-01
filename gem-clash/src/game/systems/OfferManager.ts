/**
 * Gem Link — OfferManager
 * Owner: Senior Frontend Engineer
 * Task: D02
 *
 * Singleton managing free gift cooldowns and special offer timers.
 */

import { Logger } from '../../utils/Logger';
import { EventBus } from '../../utils/EventBus';
import { GameEvent, FREE_GIFT_COOLDOWN_MINUTES, PlayerProgress } from '../../types/game.types';

const log = new Logger('OfferManager');

export class OfferManager {
  private static instance: OfferManager;

  private constructor() {
    log.info('constructor', 'OfferManager initialized');
  }

  public static getInstance(): OfferManager {
    if (!OfferManager.instance) {
      OfferManager.instance = new OfferManager();
    }
    return OfferManager.instance;
  }

  public canCollectFreeGift(progress: PlayerProgress): boolean {
    if (!progress.lastFreeGiftAt) {
      log.debug('canCollectFreeGift', 'Never collected, available');
      return true;
    }

    const lastCollectedTime = new Date(progress.lastFreeGiftAt).getTime();
    const now = Date.now();
    const cooldownMs = FREE_GIFT_COOLDOWN_MINUTES * 60 * 1000;
    const canCollect = now - lastCollectedTime >= cooldownMs;

    log.debug('canCollectFreeGift', 'Checked cooldown', {
      canCollect,
      timeSinceLastMs: now - lastCollectedTime,
      cooldownMs,
    });

    return canCollect;
  }

  public getFreeGiftTimeRemaining(progress: PlayerProgress): number {
    if (!progress.lastFreeGiftAt) {
      return 0;
    }

    const lastCollectedTime = new Date(progress.lastFreeGiftAt).getTime();
    const now = Date.now();
    const cooldownMs = FREE_GIFT_COOLDOWN_MINUTES * 60 * 1000;
    const elapsed = now - lastCollectedTime;
    const remaining = Math.max(0, cooldownMs - elapsed);

    log.debug('getFreeGiftTimeRemaining', 'Calculated remaining time', { remainingMs: remaining });

    return remaining;
  }

  public formatTimeRemaining(ms: number): string {
    const totalSeconds = Math.ceil(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  public collectFreeGift(progress: PlayerProgress): { reward: string; coins?: number; boosterType?: string } {
    if (!this.canCollectFreeGift(progress)) {
      log.warn('collectFreeGift', 'Free gift not available yet');
      return { reward: 'none' };
    }

    progress.lastFreeGiftAt = new Date().toISOString();

    const roll = Math.random();
    let reward: { reward: string; coins?: number; boosterType?: string };

    if (roll < 0.5) {
      // 50% chance: 100 coins
      progress.coins += 100;
      reward = { reward: 'coins', coins: 100 };
      log.info('collectFreeGift', 'Awarded 100 coins', { newTotal: progress.coins });
    } else if (roll < 0.8) {
      // 30% chance: 200 coins
      progress.coins += 200;
      reward = { reward: 'coins', coins: 200 };
      log.info('collectFreeGift', 'Awarded 200 coins', { newTotal: progress.coins });
    } else {
      // 20% chance: 1 Hammer or 1 Rainbow booster (50/50)
      const boosterType = Math.random() < 0.5 ? 'hammer' : 'rainbow';
      progress.remapTokens += 1;
      reward = { reward: 'booster', boosterType };
      log.info('collectFreeGift', `Awarded ${boosterType} booster`, { newTotal: progress.remapTokens });
    }

    EventBus.emit(GameEvent.FREE_GIFT_COLLECTED, reward);
    log.info('collectFreeGift', 'Free gift collected', reward);

    return reward;
  }

  public isSpecialOfferActive(progress: PlayerProgress): boolean {
    if (!progress.specialOfferExpiresAt) {
      return false;
    }

    const expiresAt = new Date(progress.specialOfferExpiresAt).getTime();
    const isActive = Date.now() < expiresAt;

    log.debug('isSpecialOfferActive', 'Checked offer status', { isActive });

    return isActive;
  }

  public getSpecialOfferTimeRemaining(progress: PlayerProgress): number {
    if (!progress.specialOfferExpiresAt) {
      return 0;
    }

    const expiresAt = new Date(progress.specialOfferExpiresAt).getTime();
    const remaining = Math.max(0, expiresAt - Date.now());

    log.debug('getSpecialOfferTimeRemaining', 'Calculated offer time', { remainingMs: remaining });

    return remaining;
  }
}
