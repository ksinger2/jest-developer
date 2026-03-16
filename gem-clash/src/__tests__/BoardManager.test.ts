/**
 * Gem Link — BoardManager Test Suite
 * Owner: QA Engineer
 *
 * Tests for board initialization, swap validation, gravity, gem spawning, and reshuffle logic.
 * Covers seeded RNG, special gem placement, and edge cases.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BoardManager } from '../game/systems/BoardManager';
import {
  GemColor,
  SpecialGemType,
  GridPosition,
  SwapAction,
  GRID_ROWS,
  GRID_COLS,
} from '../types/game.types';

describe('BoardManager', () => {
  let boardManager: BoardManager;

  beforeEach(() => {
    boardManager = new BoardManager();
  });

  describe('initBoard', () => {
    it('creates an 8x8 grid', () => {
      const grid = boardManager.initBoard(5, 'test_seed_001');

      expect(grid).toHaveLength(GRID_ROWS);
      expect(grid[0]).toHaveLength(GRID_COLS);
    });

    it('fills all cells with gems (no null cells)', () => {
      const grid = boardManager.initBoard(5, 'test_seed_002');

      for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
          expect(grid[row][col]).not.toBeNull();
        }
      }
    });

    it('ensures no initial matches exist', () => {
      const grid = boardManager.initBoard(5, 'test_seed_003');

      // Check horizontal
      for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS - 2; col++) {
          const gem1 = grid[row][col];
          const gem2 = grid[row][col + 1];
          const gem3 = grid[row][col + 2];
          const hasMatch =
            gem1 && gem2 && gem3 && gem1.color === gem2.color && gem2.color === gem3.color;
          expect(hasMatch).toBe(false);
        }
      }

      // Check vertical
      for (let col = 0; col < GRID_COLS; col++) {
        for (let row = 0; row < GRID_ROWS - 2; row++) {
          const gem1 = grid[row][col];
          const gem2 = grid[row + 1][col];
          const gem3 = grid[row + 2][col];
          const hasMatch =
            gem1 && gem2 && gem3 && gem1.color === gem2.color && gem2.color === gem3.color;
          expect(hasMatch).toBe(false);
        }
      }
    });

    it('respects colorCount parameter (5 colors)', () => {
      const grid = boardManager.initBoard(5, 'test_seed_004');
      const colors = new Set<GemColor>();

      for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
          const gem = grid[row][col];
          if (gem) colors.add(gem.color);
        }
      }

      expect(colors.size).toBeLessThanOrEqual(5);
    });

    it('respects colorCount parameter (6 colors)', () => {
      const grid = boardManager.initBoard(6, 'test_seed_005');
      const colors = new Set<GemColor>();

      for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
          const gem = grid[row][col];
          if (gem) colors.add(gem.color);
        }
      }

      expect(colors.size).toBeLessThanOrEqual(6);
    });

    it('produces deterministic board from same seed', () => {
      const seed = 'deterministic_seed';
      const grid1 = boardManager.initBoard(5, seed);

      const boardManager2 = new BoardManager();
      const grid2 = boardManager2.initBoard(5, seed);

      // Both grids should be identical
      for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
          expect(grid1[row][col]?.color).toBe(grid2[row][col]?.color);
        }
      }
    });

    it('produces different boards from different seeds', () => {
      const grid1 = boardManager.initBoard(5, 'seed_A');
      const grid2 = boardManager.initBoard(5, 'seed_B');

      let different = false;
      for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
          if (grid1[row][col]?.color !== grid2[row][col]?.color) {
            different = true;
            break;
          }
        }
        if (different) break;
      }

      expect(different).toBe(true);
    });

    it('assigns unique gem IDs', () => {
      const grid = boardManager.initBoard(5, 'test_seed_006');
      const ids = new Set<string>();

      for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
          const gem = grid[row][col];
          if (gem) {
            expect(ids.has(gem.id)).toBe(false);
            ids.add(gem.id);
          }
        }
      }

      expect(ids.size).toBe(GRID_ROWS * GRID_COLS);
    });

    it('initializes gems with correct row/col positions', () => {
      const grid = boardManager.initBoard(5, 'test_seed_007');

      for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
          const gem = grid[row][col];
          expect(gem?.row).toBe(row);
          expect(gem?.col).toBe(col);
        }
      }
    });

    it('stores special gem unlocks', () => {
      const unlocks = ['line_clear', 'bomb'];
      boardManager.initBoard(5, 'test_seed_008', unlocks);

      expect(boardManager.isSpecialEnabled(SpecialGemType.LINE_CLEAR)).toBe(true);
      expect(boardManager.isSpecialEnabled(SpecialGemType.BOMB)).toBe(true);
      expect(boardManager.isSpecialEnabled(SpecialGemType.COLOR_BOMB)).toBe(false);
    });
  });

  describe('getGrid and getGemAt', () => {
    it('returns the current grid', () => {
      const grid = boardManager.initBoard(5, 'test_seed_009');
      const retrieved = boardManager.getGrid();

      expect(retrieved).toBe(grid);
    });

    it('getGemAt returns correct gem', () => {
      boardManager.initBoard(5, 'test_seed_010');
      const gem = boardManager.getGemAt(3, 4);

      expect(gem).not.toBeNull();
      expect(gem?.row).toBe(3);
      expect(gem?.col).toBe(4);
    });

    it('getGemAt returns null for out-of-bounds', () => {
      boardManager.initBoard(5, 'test_seed_011');

      expect(boardManager.getGemAt(-1, 0)).toBeNull();
      expect(boardManager.getGemAt(0, -1)).toBeNull();
      expect(boardManager.getGemAt(GRID_ROWS, 0)).toBeNull();
      expect(boardManager.getGemAt(0, GRID_COLS)).toBeNull();
    });
  });

  describe('areAdjacent', () => {
    it('returns true for horizontally adjacent cells', () => {
      expect(boardManager.areAdjacent({ row: 0, col: 0 }, { row: 0, col: 1 })).toBe(true);
      expect(boardManager.areAdjacent({ row: 3, col: 4 }, { row: 3, col: 5 })).toBe(true);
    });

    it('returns true for vertically adjacent cells', () => {
      expect(boardManager.areAdjacent({ row: 0, col: 0 }, { row: 1, col: 0 })).toBe(true);
      expect(boardManager.areAdjacent({ row: 5, col: 2 }, { row: 6, col: 2 })).toBe(true);
    });

    it('returns false for diagonal cells', () => {
      expect(boardManager.areAdjacent({ row: 0, col: 0 }, { row: 1, col: 1 })).toBe(false);
      expect(boardManager.areAdjacent({ row: 3, col: 3 }, { row: 4, col: 4 })).toBe(false);
    });

    it('returns false for same cell', () => {
      expect(boardManager.areAdjacent({ row: 2, col: 2 }, { row: 2, col: 2 })).toBe(false);
    });

    it('returns false for distant cells', () => {
      expect(boardManager.areAdjacent({ row: 0, col: 0 }, { row: 0, col: 3 })).toBe(false);
      expect(boardManager.areAdjacent({ row: 0, col: 0 }, { row: 5, col: 0 })).toBe(false);
    });
  });

  describe('executeSwap', () => {
    it('swaps two gem positions', () => {
      boardManager.initBoard(5, 'test_seed_012');
      const gem1 = boardManager.getGemAt(0, 0);
      const gem2 = boardManager.getGemAt(0, 1);

      const swap: SwapAction = {
        from: { row: 0, col: 0 },
        to: { row: 0, col: 1 },
      };

      boardManager.executeSwap(swap);

      const newGem1 = boardManager.getGemAt(0, 0);
      const newGem2 = boardManager.getGemAt(0, 1);

      expect(newGem1?.id).toBe(gem2?.id);
      expect(newGem2?.id).toBe(gem1?.id);
    });

    it('updates gem row/col tracking after swap', () => {
      boardManager.initBoard(5, 'test_seed_013');

      const swap: SwapAction = {
        from: { row: 2, col: 3 },
        to: { row: 2, col: 4 },
      };

      boardManager.executeSwap(swap);

      const gem1 = boardManager.getGemAt(2, 3);
      const gem2 = boardManager.getGemAt(2, 4);

      expect(gem1?.row).toBe(2);
      expect(gem1?.col).toBe(3);
      expect(gem2?.row).toBe(2);
      expect(gem2?.col).toBe(4);
    });
  });

  describe('removeGems', () => {
    it('removes gems at specified positions', () => {
      boardManager.initBoard(5, 'test_seed_014');

      const positions: GridPosition[] = [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
      ];

      const removed = boardManager.removeGems(positions);

      expect(removed).toHaveLength(3);
      expect(boardManager.getGemAt(0, 0)).toBeNull();
      expect(boardManager.getGemAt(0, 1)).toBeNull();
      expect(boardManager.getGemAt(0, 2)).toBeNull();
    });

    it('returns removed gem data', () => {
      boardManager.initBoard(5, 'test_seed_015');
      const originalGem = boardManager.getGemAt(1, 1);

      const removed = boardManager.removeGems([{ row: 1, col: 1 }]);

      expect(removed).toHaveLength(1);
      expect(removed[0].id).toBe(originalGem?.id);
    });

    it('handles removing already-null positions gracefully', () => {
      boardManager.initBoard(5, 'test_seed_016');
      boardManager.removeGems([{ row: 0, col: 0 }]); // First removal

      const removed = boardManager.removeGems([{ row: 0, col: 0 }]); // Second removal
      expect(removed).toHaveLength(0);
    });
  });

  describe('applyGravity', () => {
    it('moves gems down to fill gaps', () => {
      boardManager.initBoard(5, 'test_seed_017');

      // Remove bottom row
      const positions: GridPosition[] = [];
      for (let col = 0; col < GRID_COLS; col++) {
        positions.push({ row: 7, col });
      }
      boardManager.removeGems(positions);

      const falls = boardManager.applyGravity();

      // Bottom row should now be null
      for (let col = 0; col < GRID_COLS; col++) {
        expect(boardManager.getGemAt(7, col)).toBeNull();
      }

      // Should have fall data
      expect(falls.length).toBeGreaterThan(0);
    });

    it('returns fall data with correct fromRow and toRow', () => {
      boardManager.initBoard(5, 'test_seed_018');

      // Remove gem at (7, 0)
      boardManager.removeGems([{ row: 7, col: 0 }]);

      const falls = boardManager.applyGravity();

      // Gem from (6, 0) should fall to (7, 0)
      const fall = falls.find((f) => f.col === 0);
      expect(fall).toBeDefined();
      expect(fall!.fromRow).toBe(6);
      expect(fall!.toRow).toBe(7);
    });

    it('handles multiple gaps in a column', () => {
      boardManager.initBoard(5, 'test_seed_019');

      // Remove gems at (7, 0), (5, 0), (3, 0)
      boardManager.removeGems([
        { row: 7, col: 0 },
        { row: 5, col: 0 },
        { row: 3, col: 0 },
      ]);

      const falls = boardManager.applyGravity();

      // Should compact column 0
      expect(falls.length).toBeGreaterThan(0);
      // Top 3 cells should be null
      expect(boardManager.getGemAt(0, 0)).toBeNull();
      expect(boardManager.getGemAt(1, 0)).toBeNull();
      expect(boardManager.getGemAt(2, 0)).toBeNull();
    });

    it('does nothing when no gaps exist', () => {
      boardManager.initBoard(5, 'test_seed_020');

      const falls = boardManager.applyGravity();
      expect(falls).toHaveLength(0);
    });

    it('handles entire column being empty', () => {
      boardManager.initBoard(5, 'test_seed_021');

      // Remove entire column 3
      const positions: GridPosition[] = [];
      for (let row = 0; row < GRID_ROWS; row++) {
        positions.push({ row, col: 3 });
      }
      boardManager.removeGems(positions);

      const falls = boardManager.applyGravity();

      // No gems to fall
      expect(falls).toHaveLength(0);

      // Column should still be empty
      for (let row = 0; row < GRID_ROWS; row++) {
        expect(boardManager.getGemAt(row, 3)).toBeNull();
      }
    });
  });

  describe('spawnNewGems', () => {
    it('fills empty cells with new gems', () => {
      boardManager.initBoard(5, 'test_seed_022');

      // Remove top row
      const positions: GridPosition[] = [];
      for (let col = 0; col < GRID_COLS; col++) {
        positions.push({ row: 0, col });
      }
      boardManager.removeGems(positions);

      const spawned = boardManager.spawnNewGems();

      expect(spawned).toHaveLength(GRID_COLS);

      // Top row should now be filled
      for (let col = 0; col < GRID_COLS; col++) {
        expect(boardManager.getGemAt(0, col)).not.toBeNull();
      }
    });

    it('assigns SPAWNING state to new gems', () => {
      boardManager.initBoard(5, 'test_seed_023');

      boardManager.removeGems([{ row: 0, col: 0 }]);
      const spawned = boardManager.spawnNewGems();

      expect(spawned[0].state).toBe('spawning');
    });

    it('does nothing when board is full', () => {
      boardManager.initBoard(5, 'test_seed_024');

      const spawned = boardManager.spawnNewGems();
      expect(spawned).toHaveLength(0);
    });

    it('spawns gems with unique IDs', () => {
      boardManager.initBoard(5, 'test_seed_025');

      // Remove multiple gems
      boardManager.removeGems([
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
      ]);

      const spawned = boardManager.spawnNewGems();

      const ids = new Set(spawned.map((g) => g.id));
      expect(ids.size).toBe(spawned.length);
    });
  });

  describe('placeSpecialGem', () => {
    it('creates special gem at position when enabled', () => {
      boardManager.initBoard(5, 'test_seed_026', ['line_clear']);

      const gem = boardManager.placeSpecialGem(
        { row: 2, col: 3 },
        SpecialGemType.LINE_CLEAR,
        GemColor.RED,
      );

      expect(gem).not.toBeNull();
      expect(gem?.specialType).toBe(SpecialGemType.LINE_CLEAR);
      expect(gem?.color).toBe(GemColor.RED);
      expect(gem?.row).toBe(2);
      expect(gem?.col).toBe(3);
    });

    it('returns null when special type not enabled', () => {
      boardManager.initBoard(5, 'test_seed_027', []); // No specials enabled

      const gem = boardManager.placeSpecialGem(
        { row: 2, col: 3 },
        SpecialGemType.BOMB,
        GemColor.BLUE,
      );

      expect(gem).toBeNull();
    });

    it('replaces existing gem at position', () => {
      boardManager.initBoard(5, 'test_seed_028', ['color_bomb']);

      const originalGem = boardManager.getGemAt(1, 1);
      const newGem = boardManager.placeSpecialGem(
        { row: 1, col: 1 },
        SpecialGemType.COLOR_BOMB,
        GemColor.GREEN,
      );

      expect(newGem?.id).not.toBe(originalGem?.id);
      expect(boardManager.getGemAt(1, 1)?.specialType).toBe(SpecialGemType.COLOR_BOMB);
    });
  });

  describe('isSpecialEnabled', () => {
    it('returns true for enabled specials', () => {
      boardManager.initBoard(5, 'test_seed_029', ['line_clear', 'bomb']);

      expect(boardManager.isSpecialEnabled(SpecialGemType.LINE_CLEAR)).toBe(true);
      expect(boardManager.isSpecialEnabled(SpecialGemType.BOMB)).toBe(true);
    });

    it('returns false for disabled specials', () => {
      boardManager.initBoard(5, 'test_seed_030', ['line_clear']);

      expect(boardManager.isSpecialEnabled(SpecialGemType.COLOR_BOMB)).toBe(false);
      expect(boardManager.isSpecialEnabled(SpecialGemType.BOMB)).toBe(false);
    });
  });

  describe('reshuffleBoard', () => {
    it('keeps all gem colors and counts', () => {
      boardManager.initBoard(5, 'test_seed_031');

      const originalColors = new Map<GemColor, number>();
      const grid = boardManager.getGrid();
      for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
          const gem = grid[row][col];
          if (gem) {
            originalColors.set(gem.color, (originalColors.get(gem.color) || 0) + 1);
          }
        }
      }

      boardManager.reshuffleBoard();

      const newColors = new Map<GemColor, number>();
      const newGrid = boardManager.getGrid();
      for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
          const gem = newGrid[row][col];
          if (gem) {
            newColors.set(gem.color, (newColors.get(gem.color) || 0) + 1);
          }
        }
      }

      expect(newColors).toEqual(originalColors);
    });

    it('changes gem positions', () => {
      boardManager.initBoard(5, 'test_seed_032');

      const originalPositions = new Map<string, GemColor>();
      const grid = boardManager.getGrid();
      for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
          const gem = grid[row][col];
          if (gem) {
            originalPositions.set(`${row},${col}`, gem.color);
          }
        }
      }

      boardManager.reshuffleBoard();

      let positionsChanged = 0;
      const newGrid = boardManager.getGrid();
      for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
          const gem = newGrid[row][col];
          if (gem && gem.color !== originalPositions.get(`${row},${col}`)) {
            positionsChanged++;
          }
        }
      }

      // At least some positions should change
      expect(positionsChanged).toBeGreaterThan(0);
    });
  });

  describe('remapBoard', () => {
    it('replaces all gems with new ones', () => {
      boardManager.initBoard(5, 'test_seed_033');

      const originalIds = new Set<string>();
      const grid = boardManager.getGrid();
      for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
          const gem = grid[row][col];
          if (gem) originalIds.add(gem.id);
        }
      }

      const newGrid = boardManager.remapBoard();

      const newIds = new Set<string>();
      for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
          const gem = newGrid[row][col];
          if (gem) newIds.add(gem.id);
        }
      }

      // All gem IDs should be different
      const overlap = [...originalIds].filter((id) => newIds.has(id));
      expect(overlap).toHaveLength(0);
    });

    it('ensures no initial matches after remap', () => {
      boardManager.initBoard(5, 'test_seed_034');
      const grid = boardManager.remapBoard();

      // Check horizontal
      for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS - 2; col++) {
          const gem1 = grid[row][col];
          const gem2 = grid[row][col + 1];
          const gem3 = grid[row][col + 2];
          const hasMatch =
            gem1 && gem2 && gem3 && gem1.color === gem2.color && gem2.color === gem3.color;
          expect(hasMatch).toBe(false);
        }
      }
    });
  });

  describe('getActiveColors', () => {
    it('returns correct color count', () => {
      boardManager.initBoard(4, 'test_seed_035');
      const colors = boardManager.getActiveColors();

      expect(colors).toHaveLength(4);
    });

    it('returns copy of color array', () => {
      boardManager.initBoard(5, 'test_seed_036');
      const colors1 = boardManager.getActiveColors();
      const colors2 = boardManager.getActiveColors();

      expect(colors1).not.toBe(colors2); // Different array instances
      expect(colors1).toEqual(colors2); // Same contents
    });
  });

  describe('edge cases', () => {
    it('handles minimum color count (3)', () => {
      const grid = boardManager.initBoard(3, 'test_seed_037');

      const colors = new Set<GemColor>();
      for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
          const gem = grid[row][col];
          if (gem) colors.add(gem.color);
        }
      }

      expect(colors.size).toBeLessThanOrEqual(3);
    });

    it('handles maximum color count (6)', () => {
      const grid = boardManager.initBoard(6, 'test_seed_038');

      const colors = new Set<GemColor>();
      for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
          const gem = grid[row][col];
          if (gem) colors.add(gem.color);
        }
      }

      expect(colors.size).toBeLessThanOrEqual(6);
    });

    it('clamps color count below minimum to 3', () => {
      const grid = boardManager.initBoard(1, 'test_seed_039');

      const colors = new Set<GemColor>();
      for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
          const gem = grid[row][col];
          if (gem) colors.add(gem.color);
        }
      }

      expect(colors.size).toBeGreaterThanOrEqual(3);
    });
  });
});
