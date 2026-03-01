/**
 * Gem Link — ScoreSystem Test Suite
 * Owner: QA Engineer
 *
 * Tests for score calculation, cascade multipliers, star thresholds, and bonus points.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ScoreSystem } from '../game/systems/ScoreSystem';
import { Match, SpecialGemType, GemColor } from '../types/game.types';
import {
  BASE_MATCH_POINTS,
  CASCADE_MULTIPLIER,
  FOUR_MATCH_BONUS,
  FIVE_MATCH_BONUS,
  SHAPE_MATCH_BONUS,
} from '../utils/Constants';

describe('ScoreSystem', () => {
  let scoreSystem: ScoreSystem;

  beforeEach(() => {
    scoreSystem = new ScoreSystem();
  });

  describe('init', () => {
    it('initializes with star thresholds correctly', () => {
      const thresholds: [number, number, number] = [1000, 2000, 3000];
      scoreSystem.init(thresholds);

      expect(scoreSystem.getStarThresholds()).toEqual(thresholds);
      expect(scoreSystem.getScore()).toBe(0);
      expect(scoreSystem.getCascadeDepth()).toBe(0);
      expect(scoreSystem.getTotalCascades()).toBe(0);
    });

    it('resets score to zero on init', () => {
      scoreSystem.init([1000, 2000, 3000]);
      // Simulate scoring
      scoreSystem.startCascadeChain();
      scoreSystem.scoreMatches([createMatch(3)]);

      // Re-init
      scoreSystem.init([500, 1000, 1500]);
      expect(scoreSystem.getScore()).toBe(0);
    });
  });

  describe('startCascadeChain', () => {
    it('resets cascade depth to zero', () => {
      scoreSystem.init([1000, 2000, 3000]);
      scoreSystem.startCascadeChain();
      scoreSystem.scoreMatches([createMatch(3)]); // depth becomes 1

      scoreSystem.startCascadeChain();
      expect(scoreSystem.getCascadeDepth()).toBe(0);
    });
  });

  describe('scoreMatches - base scoring', () => {
    beforeEach(() => {
      scoreSystem.init([1000, 2000, 3000]);
      scoreSystem.startCascadeChain();
    });

    it('scores 3-match correctly (base points only)', () => {
      const matches = [createMatch(3)];
      const breakdown = scoreSystem.scoreMatches(matches);

      const expectedBase = 3 * BASE_MATCH_POINTS; // 3 gems × 50 = 150
      const expectedMultiplier = 1; // First cascade (depth 1)
      const expectedTotal = expectedBase * expectedMultiplier;

      expect(breakdown.basePoints).toBe(expectedBase);
      expect(breakdown.multiplier).toBe(expectedMultiplier);
      expect(breakdown.totalPoints).toBe(expectedTotal);
      expect(scoreSystem.getScore()).toBe(expectedTotal);
    });

    it('scores 4-match with bonus correctly', () => {
      const matches = [createMatch(4)];
      const breakdown = scoreSystem.scoreMatches(matches);

      const expectedBase = (4 * BASE_MATCH_POINTS) + FOUR_MATCH_BONUS; // 200 + 100 = 300
      const expectedTotal = expectedBase * 1; // depth 1

      expect(breakdown.basePoints).toBe(expectedBase);
      expect(scoreSystem.getScore()).toBe(expectedTotal);
    });

    it('scores 5-match with bonus correctly', () => {
      const matches = [createMatch(5)];
      const breakdown = scoreSystem.scoreMatches(matches);

      const expectedBase = (5 * BASE_MATCH_POINTS) + FIVE_MATCH_BONUS; // 250 + 250 = 500
      const expectedTotal = expectedBase * 1;

      expect(breakdown.basePoints).toBe(expectedBase);
      expect(scoreSystem.getScore()).toBe(expectedTotal);
    });

    it('scores multiple matches in one cascade step', () => {
      const matches = [createMatch(3), createMatch(3)];
      const breakdown = scoreSystem.scoreMatches(matches);

      const expectedBase = 6 * BASE_MATCH_POINTS; // 2 matches × 3 gems = 300
      expect(breakdown.basePoints).toBe(expectedBase);
    });
  });

  describe('scoreMatches - cascade multipliers', () => {
    beforeEach(() => {
      scoreSystem.init([1000, 2000, 3000]);
      scoreSystem.startCascadeChain();
    });

    it('applies 1x multiplier for first cascade (depth 1)', () => {
      const breakdown = scoreSystem.scoreMatches([createMatch(3)]);
      expect(breakdown.multiplier).toBe(1);
      expect(scoreSystem.getCascadeDepth()).toBe(1);
    });

    it('applies 1.5x multiplier for second cascade (depth 2)', () => {
      scoreSystem.scoreMatches([createMatch(3)]); // depth 1
      const breakdown = scoreSystem.scoreMatches([createMatch(3)]); // depth 2

      const expectedMultiplier = 1 + (2 - 1) * CASCADE_MULTIPLIER; // 1.5
      expect(breakdown.multiplier).toBe(expectedMultiplier);
      expect(scoreSystem.getCascadeDepth()).toBe(2);
    });

    it('applies 2x multiplier for third cascade (depth 3)', () => {
      scoreSystem.scoreMatches([createMatch(3)]); // depth 1
      scoreSystem.scoreMatches([createMatch(3)]); // depth 2
      const breakdown = scoreSystem.scoreMatches([createMatch(3)]); // depth 3

      const expectedMultiplier = 1 + (3 - 1) * CASCADE_MULTIPLIER; // 2.0
      expect(breakdown.multiplier).toBe(expectedMultiplier);
      expect(scoreSystem.getCascadeDepth()).toBe(3);
    });

    it('applies 2.5x multiplier for fourth cascade (depth 4)', () => {
      scoreSystem.scoreMatches([createMatch(3)]); // depth 1
      scoreSystem.scoreMatches([createMatch(3)]); // depth 2
      scoreSystem.scoreMatches([createMatch(3)]); // depth 3
      const breakdown = scoreSystem.scoreMatches([createMatch(3)]); // depth 4

      const expectedMultiplier = 1 + (4 - 1) * CASCADE_MULTIPLIER; // 2.5
      expect(breakdown.multiplier).toBe(expectedMultiplier);
    });

    it('increments totalCascades counter correctly', () => {
      scoreSystem.scoreMatches([createMatch(3)]); // depth 1, no increment
      expect(scoreSystem.getTotalCascades()).toBe(0);

      scoreSystem.scoreMatches([createMatch(3)]); // depth 2, +1
      expect(scoreSystem.getTotalCascades()).toBe(1);

      scoreSystem.scoreMatches([createMatch(3)]); // depth 3, +1
      expect(scoreSystem.getTotalCascades()).toBe(2);
    });

    it('tracks bestCombo correctly', () => {
      scoreSystem.scoreMatches([createMatch(3)]); // depth 1
      scoreSystem.scoreMatches([createMatch(3)]); // depth 2
      scoreSystem.scoreMatches([createMatch(3)]); // depth 3

      expect(scoreSystem.getBestCombo()).toBe(3);

      // Start new chain
      scoreSystem.startCascadeChain();
      scoreSystem.scoreMatches([createMatch(3)]); // depth 1
      scoreSystem.scoreMatches([createMatch(3)]); // depth 2

      // Best combo should still be 3
      expect(scoreSystem.getBestCombo()).toBe(3);
    });

    it('updates bestCombo when new chain is longer', () => {
      scoreSystem.scoreMatches([createMatch(3)]); // depth 1
      scoreSystem.scoreMatches([createMatch(3)]); // depth 2

      expect(scoreSystem.getBestCombo()).toBe(2);

      scoreSystem.startCascadeChain();
      scoreSystem.scoreMatches([createMatch(3)]); // depth 1
      scoreSystem.scoreMatches([createMatch(3)]); // depth 2
      scoreSystem.scoreMatches([createMatch(3)]); // depth 3
      scoreSystem.scoreMatches([createMatch(3)]); // depth 4

      expect(scoreSystem.getBestCombo()).toBe(4);
    });
  });

  describe('scoreMatches - special gem bonuses', () => {
    beforeEach(() => {
      scoreSystem.init([1000, 2000, 3000]);
      scoreSystem.startCascadeChain();
    });

    it('adds SHAPE_MATCH_BONUS for bomb creation', () => {
      const matches = [createMatch(3)];
      const specialGems = [SpecialGemType.BOMB];
      const breakdown = scoreSystem.scoreMatches(matches, specialGems);

      const expectedBase = (3 * BASE_MATCH_POINTS) + SHAPE_MATCH_BONUS; // 150 + 150 = 300
      expect(breakdown.basePoints).toBe(expectedBase);
    });

    it('adds multiple bonuses for multiple bomb creations', () => {
      const matches = [createMatch(3)];
      const specialGems = [SpecialGemType.BOMB, SpecialGemType.BOMB];
      const breakdown = scoreSystem.scoreMatches(matches, specialGems);

      const expectedBase = (3 * BASE_MATCH_POINTS) + (2 * SHAPE_MATCH_BONUS); // 150 + 300 = 450
      expect(breakdown.basePoints).toBe(expectedBase);
    });

    it('does not add bonus for line clear or color bomb', () => {
      const matches = [createMatch(4)];
      const specialGems = [SpecialGemType.LINE_CLEAR];
      const breakdown = scoreSystem.scoreMatches(matches, specialGems);

      // Only 4-match bonus, no shape bonus
      const expectedBase = (4 * BASE_MATCH_POINTS) + FOUR_MATCH_BONUS;
      expect(breakdown.basePoints).toBe(expectedBase);
    });
  });

  describe('scoreMatches - custom totalGemsCleared', () => {
    beforeEach(() => {
      scoreSystem.init([1000, 2000, 3000]);
      scoreSystem.startCascadeChain();
    });

    it('uses totalGemsCleared when provided instead of counting matches', () => {
      const matches = [createMatch(3)]; // 3 gems
      const totalGemsCleared = 10; // Override with 10
      const breakdown = scoreSystem.scoreMatches(matches, [], totalGemsCleared);

      const expectedBase = 10 * BASE_MATCH_POINTS; // 500, not 150
      expect(breakdown.basePoints).toBe(expectedBase);
      expect(breakdown.gemsCleared).toBe(10);
    });

    it('uses match gem count when totalGemsCleared is 0', () => {
      const matches = [createMatch(3), createMatch(4)]; // 7 gems total
      const breakdown = scoreSystem.scoreMatches(matches, [], 0);

      const expectedGems = 7;
      expect(breakdown.gemsCleared).toBe(expectedGems);
    });
  });

  describe('addRemainingMovesBonus', () => {
    beforeEach(() => {
      scoreSystem.init([1000, 2000, 3000]);
    });

    it('adds correct bonus for remaining moves', () => {
      const remainingMoves = 5;
      const bonus = scoreSystem.addRemainingMovesBonus(remainingMoves);

      const expectedBonus = 5 * 100; // REMAINING_MOVES_BONUS = 100
      expect(bonus).toBe(expectedBonus);
      expect(scoreSystem.getScore()).toBe(expectedBonus);
    });

    it('adds zero bonus when no moves remaining', () => {
      const bonus = scoreSystem.addRemainingMovesBonus(0);
      expect(bonus).toBe(0);
      expect(scoreSystem.getScore()).toBe(0);
    });

    it('adds bonus on top of existing score', () => {
      scoreSystem.startCascadeChain();
      scoreSystem.scoreMatches([createMatch(3)]); // +150
      const existingScore = scoreSystem.getScore();

      const bonus = scoreSystem.addRemainingMovesBonus(3);
      expect(scoreSystem.getScore()).toBe(existingScore + 300);
    });
  });

  describe('calculateStars', () => {
    beforeEach(() => {
      scoreSystem.init([1000, 2000, 3000]);
    });

    it('returns 0 stars when score below 1-star threshold', () => {
      // Score = 0
      expect(scoreSystem.calculateStars()).toBe(0);
    });

    it('returns 1 star when score meets 1-star threshold', () => {
      scoreSystem.startCascadeChain();
      // Need 1000 points = 20 gems × 50 = 1000
      scoreSystem.scoreMatches([createMatch(20)], [], 20);
      expect(scoreSystem.calculateStars()).toBe(1);
    });

    it('returns 2 stars when score meets 2-star threshold', () => {
      scoreSystem.startCascadeChain();
      // Need 2000 points
      scoreSystem.scoreMatches([createMatch(40)], [], 40);
      expect(scoreSystem.calculateStars()).toBe(2);
    });

    it('returns 3 stars when score meets 3-star threshold', () => {
      scoreSystem.startCascadeChain();
      // Need 3000 points
      scoreSystem.scoreMatches([createMatch(60)], [], 60);
      expect(scoreSystem.calculateStars()).toBe(3);
    });

    it('returns 3 stars when score exceeds 3-star threshold', () => {
      scoreSystem.startCascadeChain();
      scoreSystem.scoreMatches([createMatch(100)], [], 100); // 5000 points
      expect(scoreSystem.calculateStars()).toBe(3);
    });
  });

  describe('hasPassed', () => {
    beforeEach(() => {
      scoreSystem.init([1000, 2000, 3000]);
    });

    it('returns false when score below minimum threshold', () => {
      expect(scoreSystem.hasPassed()).toBe(false);
    });

    it('returns true when score meets minimum threshold', () => {
      scoreSystem.startCascadeChain();
      scoreSystem.scoreMatches([createMatch(20)], [], 20); // 1000 points
      expect(scoreSystem.hasPassed()).toBe(true);
    });

    it('returns true when score exceeds minimum threshold', () => {
      scoreSystem.startCascadeChain();
      scoreSystem.scoreMatches([createMatch(30)], [], 30); // 1500 points
      expect(scoreSystem.hasPassed()).toBe(true);
    });
  });

  describe('score accumulation across multiple chains', () => {
    it('accumulates score across multiple cascade chains', () => {
      scoreSystem.init([1000, 2000, 3000]);

      // Chain 1
      scoreSystem.startCascadeChain();
      scoreSystem.scoreMatches([createMatch(3)]); // 150
      const scoreAfterChain1 = scoreSystem.getScore();

      // Chain 2
      scoreSystem.startCascadeChain();
      scoreSystem.scoreMatches([createMatch(3)]); // +150
      const scoreAfterChain2 = scoreSystem.getScore();

      expect(scoreAfterChain2).toBe(scoreAfterChain1 + 150);
    });

    it('rounds fractional scores correctly', () => {
      scoreSystem.init([1000, 2000, 3000]);
      scoreSystem.startCascadeChain();
      scoreSystem.scoreMatches([createMatch(3)]); // depth 1: 150
      const breakdown = scoreSystem.scoreMatches([createMatch(3)]); // depth 2: 150 × 1.5 = 225

      // Total should be 150 + 225 = 375
      expect(breakdown.totalPoints).toBe(225);
      expect(scoreSystem.getScore()).toBe(375);
    });
  });
});

// Helper function to create mock matches
function createMatch(length: number, color: GemColor = GemColor.RED): Match {
  const gems = Array.from({ length }, (_, i) => ({ row: 0, col: i }));
  return {
    gems,
    direction: 'horizontal',
    color,
    length,
  };
}
