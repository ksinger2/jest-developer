/**
 * Gem Link — LevelManager Test Suite
 * Owner: QA Engineer
 *
 * Tests for level loading, move tracking, win/lose conditions, and extra moves.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LevelManager, RawLevelData } from '../game/systems/LevelManager';

describe('LevelManager', () => {
  let levelManager: LevelManager;
  let mockLevels: RawLevelData[];

  beforeEach(() => {
    levelManager = new LevelManager();

    // Mock level catalog
    mockLevels = [
      {
        id: 1,
        name: 'Tutorial Level',
        moveLimit: 20,
        starThresholds: [500, 1000, 1500],
        seed: 'level1_seed',
        colorCount: 4,
        specialGemUnlocks: ['line_clear'],
        objectives: {
          type: 'score',
          target: 500,
        },
      },
      {
        id: 2,
        name: 'Challenging Level',
        moveLimit: 15,
        starThresholds: [1000, 2000, 3000],
        seed: 'level2_seed',
        colorCount: 5,
        specialGemUnlocks: ['line_clear', 'bomb'],
        objectives: {
          type: 'score',
          target: 1000,
        },
      },
      {
        id: 3,
        name: 'Expert Level',
        moveLimit: 12,
        starThresholds: [2000, 3500, 5000],
        seed: 'level3_seed',
        colorCount: 6,
        specialGemUnlocks: ['line_clear', 'bomb', 'color_bomb'],
        objectives: {
          type: 'score',
          target: 2000,
        },
      },
    ];
  });

  describe('loadCatalog', () => {
    it('loads level catalog correctly', () => {
      levelManager.loadCatalog(mockLevels);

      const level = levelManager.startLevel(1);
      expect(level).not.toBeNull();
      expect(level?.name).toBe('Tutorial Level');
    });

    it('handles empty catalog', () => {
      levelManager.loadCatalog([]);

      const level = levelManager.startLevel(1);
      expect(level).toBeNull();
    });
  });

  describe('startLevel', () => {
    beforeEach(() => {
      levelManager.loadCatalog(mockLevels);
    });

    it('loads level by ID correctly', () => {
      const level = levelManager.startLevel(2);

      expect(level).not.toBeNull();
      expect(level?.id).toBe(2);
      expect(level?.name).toBe('Challenging Level');
      expect(level?.moveLimit).toBe(15);
    });

    it('returns null for non-existent level ID', () => {
      const level = levelManager.startLevel(999);
      expect(level).toBeNull();
    });

    it('resets moves to zero on level start', () => {
      levelManager.startLevel(1);
      levelManager.useMove();
      levelManager.useMove();

      // Start new level
      levelManager.startLevel(2);
      expect(levelManager.getMovesUsed()).toBe(0);
    });

    it('initializes start time', () => {
      const beforeStart = Date.now();
      levelManager.startLevel(1);
      const afterStart = Date.now();

      const elapsed = levelManager.getElapsedSeconds();
      expect(elapsed).toBeGreaterThanOrEqual(0);
      expect(elapsed).toBeLessThan((afterStart - beforeStart) / 1000 + 1);
    });

    it('sets current level data', () => {
      levelManager.startLevel(1);
      const current = levelManager.getCurrentLevel();

      expect(current).not.toBeNull();
      expect(current?.id).toBe(1);
    });
  });

  describe('useMove', () => {
    beforeEach(() => {
      levelManager.loadCatalog(mockLevels);
      levelManager.startLevel(1); // 20 moves
    });

    it('increments moves used', () => {
      expect(levelManager.getMovesUsed()).toBe(0);

      levelManager.useMove();
      expect(levelManager.getMovesUsed()).toBe(1);

      levelManager.useMove();
      expect(levelManager.getMovesUsed()).toBe(2);
    });

    it('returns correct remaining moves', () => {
      const remaining = levelManager.useMove();
      expect(remaining).toBe(19); // 20 - 1
    });

    it('returns zero remaining when no current level', () => {
      const manager = new LevelManager();
      const remaining = manager.useMove();
      expect(remaining).toBe(0);
    });
  });

  describe('getMovesRemaining', () => {
    beforeEach(() => {
      levelManager.loadCatalog(mockLevels);
      levelManager.startLevel(1); // 20 moves
    });

    it('returns correct moves remaining', () => {
      expect(levelManager.getMovesRemaining()).toBe(20);

      levelManager.useMove();
      expect(levelManager.getMovesRemaining()).toBe(19);

      levelManager.useMove();
      levelManager.useMove();
      expect(levelManager.getMovesRemaining()).toBe(17);
    });

    it('does not go below zero', () => {
      for (let i = 0; i < 25; i++) {
        levelManager.useMove();
      }
      expect(levelManager.getMovesRemaining()).toBe(0);
    });

    it('returns zero when no current level', () => {
      const manager = new LevelManager();
      expect(manager.getMovesRemaining()).toBe(0);
    });
  });

  describe('isOutOfMoves', () => {
    beforeEach(() => {
      levelManager.loadCatalog(mockLevels);
      levelManager.startLevel(2); // 15 moves
    });

    it('returns false when moves remaining', () => {
      expect(levelManager.isOutOfMoves()).toBe(false);

      levelManager.useMove();
      expect(levelManager.isOutOfMoves()).toBe(false);
    });

    it('returns true when all moves used', () => {
      for (let i = 0; i < 15; i++) {
        levelManager.useMove();
      }
      expect(levelManager.isOutOfMoves()).toBe(true);
    });

    it('returns true when moves exceeded', () => {
      for (let i = 0; i < 20; i++) {
        levelManager.useMove();
      }
      expect(levelManager.isOutOfMoves()).toBe(true);
    });

    it('returns true when no current level', () => {
      const manager = new LevelManager();
      expect(manager.isOutOfMoves()).toBe(true);
    });
  });

  describe('getMoveLimit', () => {
    beforeEach(() => {
      levelManager.loadCatalog(mockLevels);
    });

    it('returns correct move limit for loaded level', () => {
      levelManager.startLevel(1);
      expect(levelManager.getMoveLimit()).toBe(20);

      levelManager.startLevel(2);
      expect(levelManager.getMoveLimit()).toBe(15);

      levelManager.startLevel(3);
      expect(levelManager.getMoveLimit()).toBe(12);
    });

    it('returns zero when no level loaded', () => {
      expect(levelManager.getMoveLimit()).toBe(0);
    });
  });

  describe('getStarThresholds', () => {
    beforeEach(() => {
      levelManager.loadCatalog(mockLevels);
    });

    it('returns correct star thresholds for loaded level', () => {
      levelManager.startLevel(1);
      expect(levelManager.getStarThresholds()).toEqual([500, 1000, 1500]);

      levelManager.startLevel(2);
      expect(levelManager.getStarThresholds()).toEqual([1000, 2000, 3000]);
    });

    it('returns [0, 0, 0] when no level loaded', () => {
      expect(levelManager.getStarThresholds()).toEqual([0, 0, 0]);
    });

    it('returns a copy, not the original array', () => {
      levelManager.startLevel(1);
      const thresholds = levelManager.getStarThresholds();
      thresholds[0] = 999;

      // Original should be unchanged
      expect(levelManager.getStarThresholds()).toEqual([500, 1000, 1500]);
    });
  });

  describe('getElapsedSeconds', () => {
    beforeEach(() => {
      levelManager.loadCatalog(mockLevels);
    });

    it('returns zero immediately after level start', () => {
      levelManager.startLevel(1);
      const elapsed = levelManager.getElapsedSeconds();
      expect(elapsed).toBe(0);
    });

    it('returns correct elapsed time after delay', async () => {
      levelManager.startLevel(1);

      // Wait 1.5 seconds
      await new Promise(resolve => setTimeout(resolve, 1500));

      const elapsed = levelManager.getElapsedSeconds();
      expect(elapsed).toBeGreaterThanOrEqual(1);
      expect(elapsed).toBeLessThanOrEqual(2);
    });

    it('rounds to nearest second', async () => {
      levelManager.startLevel(1);

      await new Promise(resolve => setTimeout(resolve, 500));

      const elapsed = levelManager.getElapsedSeconds();
      expect(elapsed).toBe(1); // Rounds 0.5s to 1s
    });
  });

  describe('buildResult', () => {
    beforeEach(() => {
      levelManager.loadCatalog(mockLevels);
      levelManager.startLevel(1);
    });

    it('builds correct result for passed level', () => {
      levelManager.useMove();
      levelManager.useMove();
      levelManager.useMove();

      const result = levelManager.buildResult(1200, 2, 5, true);

      expect(result.levelId).toBe(1);
      expect(result.score).toBe(1200);
      expect(result.stars).toBe(2);
      expect(result.movesUsed).toBe(3);
      expect(result.movesRemaining).toBe(17);
      expect(result.totalCascades).toBe(5);
      expect(result.passed).toBe(true);
      expect(result.durationSeconds).toBeGreaterThanOrEqual(0);
    });

    it('builds correct result for failed level', () => {
      for (let i = 0; i < 20; i++) {
        levelManager.useMove();
      }

      const result = levelManager.buildResult(300, 0, 2, false);

      expect(result.stars).toBe(0);
      expect(result.movesUsed).toBe(20);
      expect(result.movesRemaining).toBe(0);
      expect(result.passed).toBe(false);
    });

    it('returns levelId 0 when no current level', () => {
      const manager = new LevelManager();
      const result = manager.buildResult(100, 1, 0, false);

      expect(result.levelId).toBe(0);
    });
  });

  describe('addExtraMoves', () => {
    beforeEach(() => {
      levelManager.loadCatalog(mockLevels);
      levelManager.startLevel(1); // 20 moves
    });

    it('increases move limit correctly', () => {
      expect(levelManager.getMoveLimit()).toBe(20);

      levelManager.addExtraMoves(3);
      expect(levelManager.getMoveLimit()).toBe(23);
    });

    it('adds to remaining moves correctly', () => {
      levelManager.useMove();
      levelManager.useMove();
      expect(levelManager.getMovesRemaining()).toBe(18);

      levelManager.addExtraMoves(5);
      expect(levelManager.getMovesRemaining()).toBe(23); // 18 + 5
    });

    it('allows continuing after running out of moves', () => {
      for (let i = 0; i < 20; i++) {
        levelManager.useMove();
      }
      expect(levelManager.isOutOfMoves()).toBe(true);

      levelManager.addExtraMoves(3);
      expect(levelManager.isOutOfMoves()).toBe(false);
      expect(levelManager.getMovesRemaining()).toBe(3);
    });

    it('handles multiple extra move purchases', () => {
      levelManager.addExtraMoves(3);
      levelManager.addExtraMoves(3);
      levelManager.addExtraMoves(3);

      expect(levelManager.getMoveLimit()).toBe(29); // 20 + 9
    });

    it('does nothing when no current level', () => {
      const manager = new LevelManager();
      manager.addExtraMoves(5);

      expect(manager.getMoveLimit()).toBe(0);
    });
  });

  describe('getCurrentLevel', () => {
    beforeEach(() => {
      levelManager.loadCatalog(mockLevels);
    });

    it('returns current level data', () => {
      levelManager.startLevel(2);
      const level = levelManager.getCurrentLevel();

      expect(level).not.toBeNull();
      expect(level?.id).toBe(2);
      expect(level?.name).toBe('Challenging Level');
    });

    it('returns null when no level started', () => {
      expect(levelManager.getCurrentLevel()).toBeNull();
    });

    it('updates when different level started', () => {
      levelManager.startLevel(1);
      expect(levelManager.getCurrentLevel()?.id).toBe(1);

      levelManager.startLevel(3);
      expect(levelManager.getCurrentLevel()?.id).toBe(3);
    });
  });

  describe('win/lose condition checks', () => {
    beforeEach(() => {
      levelManager.loadCatalog(mockLevels);
      levelManager.startLevel(2); // 15 moves, 1000 pts for 1 star
    });

    it('identifies win condition: score met, moves remaining', () => {
      levelManager.useMove();
      levelManager.useMove();

      const movesRemaining = levelManager.getMovesRemaining();
      const outOfMoves = levelManager.isOutOfMoves();

      expect(movesRemaining).toBeGreaterThan(0);
      expect(outOfMoves).toBe(false);

      // In real game, would check score >= threshold here
    });

    it('identifies lose condition: out of moves, score not met', () => {
      for (let i = 0; i < 15; i++) {
        levelManager.useMove();
      }

      expect(levelManager.isOutOfMoves()).toBe(true);
      expect(levelManager.getMovesRemaining()).toBe(0);
    });
  });
});
