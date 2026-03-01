/**
 * Gem Link — OfferManager Test Suite
 * Owner: QA Engineer
 *
 * Tests for free gift cooldowns, special offer timers, and reward distribution.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OfferManager } from '../game/systems/OfferManager';
import { PlayerProgress, DEFAULT_PLAYER_PROGRESS, FREE_GIFT_COOLDOWN_MINUTES } from '../types/game.types';

describe('OfferManager', () => {
  let offerManager: OfferManager;
  let mockProgress: PlayerProgress;

  beforeEach(() => {
    offerManager = OfferManager.getInstance();
    mockProgress = { ...DEFAULT_PLAYER_PROGRESS };
  });

  describe('canCollectFreeGift', () => {
    it('returns true when no previous claim exists', () => {
      mockProgress.lastFreeGiftAt = null;
      const result = offerManager.canCollectFreeGift(mockProgress);
      expect(result).toBe(true);
    });

    it('returns false within cooldown period', () => {
      // Set lastFreeGiftAt to 10 minutes ago (within 240-minute cooldown)
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      mockProgress.lastFreeGiftAt = tenMinutesAgo.toISOString();

      const result = offerManager.canCollectFreeGift(mockProgress);
      expect(result).toBe(false);
    });

    it('returns true after cooldown period has elapsed', () => {
      // Set lastFreeGiftAt to 245 minutes ago (beyond 240-minute cooldown)
      const twentyFiveMinutesAgo = new Date(Date.now() - 245 * 60 * 1000);
      mockProgress.lastFreeGiftAt = twentyFiveMinutesAgo.toISOString();

      const result = offerManager.canCollectFreeGift(mockProgress);
      expect(result).toBe(true);
    });

    it('returns false exactly at cooldown boundary (just under)', () => {
      // Set to exactly cooldown - 1 second
      const justBeforeCooldown = new Date(Date.now() - (FREE_GIFT_COOLDOWN_MINUTES * 60 * 1000 - 1000));
      mockProgress.lastFreeGiftAt = justBeforeCooldown.toISOString();

      const result = offerManager.canCollectFreeGift(mockProgress);
      expect(result).toBe(false);
    });

    it('returns true exactly at cooldown boundary', () => {
      // Set to exactly cooldown duration
      const exactlyCooldown = new Date(Date.now() - FREE_GIFT_COOLDOWN_MINUTES * 60 * 1000);
      mockProgress.lastFreeGiftAt = exactlyCooldown.toISOString();

      const result = offerManager.canCollectFreeGift(mockProgress);
      expect(result).toBe(true);
    });
  });

  describe('getFreeGiftTimeRemaining', () => {
    it('returns 0 when no previous claim exists', () => {
      mockProgress.lastFreeGiftAt = null;
      const result = offerManager.getFreeGiftTimeRemaining(mockProgress);
      expect(result).toBe(0);
    });

    it('returns correct countdown when inside cooldown period', () => {
      // Set lastFreeGiftAt to 10 minutes ago
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      mockProgress.lastFreeGiftAt = tenMinutesAgo.toISOString();

      const remaining = offerManager.getFreeGiftTimeRemaining(mockProgress);

      // Should be approximately 230 minutes remaining (with some tolerance for test execution time)
      const expectedMs = 230 * 60 * 1000;
      expect(remaining).toBeGreaterThan(expectedMs - 5000); // Within 5 seconds
      expect(remaining).toBeLessThanOrEqual(expectedMs);
    });

    it('returns 0 when cooldown has elapsed', () => {
      const twentyFiveMinutesAgo = new Date(Date.now() - 245 * 60 * 1000);
      mockProgress.lastFreeGiftAt = twentyFiveMinutesAgo.toISOString();

      const result = offerManager.getFreeGiftTimeRemaining(mockProgress);
      expect(result).toBe(0);
    });
  });

  describe('formatTimeRemaining', () => {
    it('formats zero correctly as 00:00', () => {
      const result = offerManager.formatTimeRemaining(0);
      expect(result).toBe('00:00');
    });

    it('formats minutes and seconds correctly (mm:ss)', () => {
      const fiveMinutesThirtySeconds = 5 * 60 * 1000 + 30 * 1000;
      const result = offerManager.formatTimeRemaining(fiveMinutesThirtySeconds);
      expect(result).toBe('05:30');
    });

    it('formats single-digit minutes with leading zero', () => {
      const threeMinutesTwoSeconds = 3 * 60 * 1000 + 2 * 1000;
      const result = offerManager.formatTimeRemaining(threeMinutesTwoSeconds);
      expect(result).toBe('03:02');
    });

    it('formats two-digit minutes correctly', () => {
      const fifteenMinutesFortyFiveSeconds = 15 * 60 * 1000 + 45 * 1000;
      const result = offerManager.formatTimeRemaining(fifteenMinutesFortyFiveSeconds);
      expect(result).toBe('15:45');
    });

    it('rounds up partial seconds', () => {
      const oneMinuteHalfSecond = 60 * 1000 + 500;
      const result = offerManager.formatTimeRemaining(oneMinuteHalfSecond);
      expect(result).toBe('01:01'); // ceil(60.5) = 61 seconds = 1:01
    });

    it('formats exactly 60 seconds as 01:00', () => {
      const sixtySeconds = 60 * 1000;
      const result = offerManager.formatTimeRemaining(sixtySeconds);
      expect(result).toBe('01:00');
    });
  });

  describe('collectFreeGift', () => {
    it('updates lastFreeGiftAt timestamp', () => {
      mockProgress.lastFreeGiftAt = null;
      mockProgress.coins = 0;

      const beforeCollect = Date.now();
      offerManager.collectFreeGift(mockProgress);
      const afterCollect = Date.now();

      expect(mockProgress.lastFreeGiftAt).not.toBeNull();
      const timestamp = new Date(mockProgress.lastFreeGiftAt!).getTime();
      expect(timestamp).toBeGreaterThanOrEqual(beforeCollect);
      expect(timestamp).toBeLessThanOrEqual(afterCollect);
    });

    it('awards coins with 50% probability (100 coins)', () => {
      mockProgress.lastFreeGiftAt = null;
      const initialCoins = mockProgress.coins;

      // Mock Math.random to return 0.3 (roll=0.3 falls within first 50% for 100 coins)
      vi.spyOn(Math, 'random').mockReturnValue(0.3);

      const reward = offerManager.collectFreeGift(mockProgress);

      expect(reward.reward).toBe('coins');
      expect(reward.coins).toBe(100);
      expect(mockProgress.coins).toBe(initialCoins + 100);

      vi.restoreAllMocks();
    });

    it('awards 200 coins for roll between 0.5 and 0.8', () => {
      mockProgress.lastFreeGiftAt = null;
      const initialCoins = mockProgress.coins;

      vi.spyOn(Math, 'random').mockReturnValue(0.7);

      const reward = offerManager.collectFreeGift(mockProgress);

      expect(reward.reward).toBe('coins');
      expect(reward.coins).toBe(200);
      expect(mockProgress.coins).toBe(initialCoins + 200);

      vi.restoreAllMocks();
    });

    it('awards hammer or rainbow booster for roll >= 0.8', () => {
      mockProgress.lastFreeGiftAt = null;
      const initialRemapTokens = mockProgress.remapTokens;

      vi.spyOn(Math, 'random').mockReturnValue(0.9);

      const reward = offerManager.collectFreeGift(mockProgress);

      expect(reward.reward).toBe('booster');
      expect(['hammer', 'rainbow']).toContain(reward.boosterType);
      expect(mockProgress.remapTokens).toBe(initialRemapTokens + 1);

      vi.restoreAllMocks();
    });

    it('returns none when gift not available yet', () => {
      // Set recent claim
      mockProgress.lastFreeGiftAt = new Date(Date.now() - 5 * 60 * 1000).toISOString();

      const reward = offerManager.collectFreeGift(mockProgress);

      expect(reward.reward).toBe('none');
    });

    it('does not modify player data when gift unavailable', () => {
      mockProgress.lastFreeGiftAt = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const claimedAt = mockProgress.lastFreeGiftAt;
      const coins = mockProgress.coins;
      const remaps = mockProgress.remapTokens;

      offerManager.collectFreeGift(mockProgress);

      expect(mockProgress.lastFreeGiftAt).toBe(claimedAt);
      expect(mockProgress.coins).toBe(coins);
      expect(mockProgress.remapTokens).toBe(remaps);
    });
  });

  describe('isSpecialOfferActive', () => {
    it('returns false when no offer expiry set', () => {
      mockProgress.specialOfferExpiresAt = null;
      const result = offerManager.isSpecialOfferActive(mockProgress);
      expect(result).toBe(false);
    });

    it('returns true when offer expires in the future', () => {
      const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
      mockProgress.specialOfferExpiresAt = oneHourFromNow.toISOString();

      const result = offerManager.isSpecialOfferActive(mockProgress);
      expect(result).toBe(true);
    });

    it('returns false when offer has expired', () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      mockProgress.specialOfferExpiresAt = oneHourAgo.toISOString();

      const result = offerManager.isSpecialOfferActive(mockProgress);
      expect(result).toBe(false);
    });
  });

  describe('getSpecialOfferTimeRemaining', () => {
    it('returns 0 when no offer expiry set', () => {
      mockProgress.specialOfferExpiresAt = null;
      const result = offerManager.getSpecialOfferTimeRemaining(mockProgress);
      expect(result).toBe(0);
    });

    it('returns correct time remaining for active offer', () => {
      const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
      mockProgress.specialOfferExpiresAt = oneHourFromNow.toISOString();

      const remaining = offerManager.getSpecialOfferTimeRemaining(mockProgress);

      const expectedMs = 60 * 60 * 1000;
      expect(remaining).toBeGreaterThan(expectedMs - 5000);
      expect(remaining).toBeLessThanOrEqual(expectedMs);
    });

    it('returns 0 for expired offer', () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      mockProgress.specialOfferExpiresAt = oneHourAgo.toISOString();

      const result = offerManager.getSpecialOfferTimeRemaining(mockProgress);
      expect(result).toBe(0);
    });
  });
});
