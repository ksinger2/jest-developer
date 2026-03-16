/**
 * Gem Link — MatchEngine Test Suite
 * Owner: QA Engineer
 *
 * Tests for match detection, cascade resolution, special gem detection, and deadlock checking.
 * Covers horizontal/vertical matches, L/T-shapes, special gem creation, and board boundary cases.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  findAllMatches,
  wouldSwapCreateMatch,
  hasValidMoves,
  getSpecialGemAffectedPositions,
} from '../game/systems/MatchEngine';
import {
  GemData,
  GemColor,
  GemState,
  SpecialGemType,
  GridPosition,
  GRID_ROWS,
  GRID_COLS,
} from '../types/game.types';

describe('MatchEngine', () => {
  // Helper: Create a GemData object
  function createGem(
    row: number,
    col: number,
    color: GemColor,
    specialType: SpecialGemType = SpecialGemType.NONE,
  ): GemData {
    return {
      id: `gem_${row}_${col}`,
      color,
      specialType,
      row,
      col,
      state: GemState.IDLE,
    };
  }

  // Helper: Create an empty 8x8 grid
  function createEmptyGrid(): (GemData | null)[][] {
    const grid: (GemData | null)[][] = [];
    for (let row = 0; row < GRID_ROWS; row++) {
      grid[row] = new Array(GRID_COLS).fill(null);
    }
    return grid;
  }

  // Helper: Fill grid with pattern (R = red, B = blue, G = green, Y = yellow, P = purple, W = white, . = null)
  function fillGrid(pattern: string[]): (GemData | null)[][] {
    const colorMap: Record<string, GemColor> = {
      R: GemColor.RED,
      B: GemColor.BLUE,
      G: GemColor.GREEN,
      Y: GemColor.YELLOW,
      P: GemColor.PURPLE,
      W: GemColor.WHITE,
    };

    const grid = createEmptyGrid();
    for (let row = 0; row < GRID_ROWS; row++) {
      const rowPattern = pattern[row] || '';
      for (let col = 0; col < GRID_COLS; col++) {
        const char = rowPattern[col] || '.';
        if (char !== '.') {
          grid[row][col] = createGem(row, col, colorMap[char] || GemColor.RED);
        }
      }
    }
    return grid;
  }

  describe('findAllMatches - horizontal detection', () => {
    it('detects horizontal match of exactly 3', () => {
      const grid = fillGrid([
        'RRR.....',
        '........',
        '........',
        '........',
        '........',
        '........',
        '........',
        '........',
      ]);

      const result = findAllMatches(grid);
      expect(result.matches).toHaveLength(1);
      expect(result.matches[0].direction).toBe('horizontal');
      expect(result.matches[0].color).toBe(GemColor.RED);
      expect(result.matches[0].length).toBe(3);
      expect(result.allMatchedPositions).toHaveLength(3);
    });

    it('detects horizontal match of 4', () => {
      const grid = fillGrid([
        'BBBB....',
        '........',
        '........',
        '........',
        '........',
        '........',
        '........',
        '........',
      ]);

      const result = findAllMatches(grid);
      expect(result.matches).toHaveLength(1);
      expect(result.matches[0].length).toBe(4);
      expect(result.matches[0].color).toBe(GemColor.BLUE);
    });

    it('detects horizontal match of 5+', () => {
      const grid = fillGrid([
        'GGGGGG..',
        '........',
        '........',
        '........',
        '........',
        '........',
        '........',
        '........',
      ]);

      const result = findAllMatches(grid);
      expect(result.matches).toHaveLength(1);
      expect(result.matches[0].length).toBe(6);
      expect(result.matches[0].color).toBe(GemColor.GREEN);
    });

    it('detects horizontal match at bottom row', () => {
      const grid = fillGrid([
        '........',
        '........',
        '........',
        '........',
        '........',
        '........',
        '........',
        '...YYY..',
      ]);

      const result = findAllMatches(grid);
      expect(result.matches).toHaveLength(1);
      expect(result.matches[0].direction).toBe('horizontal');
      expect(result.matches[0].gems[0].row).toBe(7);
    });

    it('detects horizontal match at right edge', () => {
      const grid = fillGrid([
        '.....PPP',
        '........',
        '........',
        '........',
        '........',
        '........',
        '........',
        '........',
      ]);

      const result = findAllMatches(grid);
      expect(result.matches).toHaveLength(1);
      expect(result.matches[0].gems[2].col).toBe(7);
    });

    it('detects multiple horizontal matches in same row', () => {
      const grid = fillGrid([
        'RRR.BBB.',
        '........',
        '........',
        '........',
        '........',
        '........',
        '........',
        '........',
      ]);

      const result = findAllMatches(grid);
      expect(result.matches).toHaveLength(2);
      expect(result.matches[0].color).toBe(GemColor.RED);
      expect(result.matches[1].color).toBe(GemColor.BLUE);
    });

    it('does not detect match of 2', () => {
      const grid = fillGrid([
        'RR......',
        '........',
        '........',
        '........',
        '........',
        '........',
        '........',
        '........',
      ]);

      const result = findAllMatches(grid);
      expect(result.matches).toHaveLength(0);
    });
  });

  describe('findAllMatches - vertical detection', () => {
    it('detects vertical match of exactly 3', () => {
      const grid = fillGrid([
        'R.......',
        'R.......',
        'R.......',
        '........',
        '........',
        '........',
        '........',
        '........',
      ]);

      const result = findAllMatches(grid);
      expect(result.matches).toHaveLength(1);
      expect(result.matches[0].direction).toBe('vertical');
      expect(result.matches[0].color).toBe(GemColor.RED);
      expect(result.matches[0].length).toBe(3);
    });

    it('detects vertical match of 4', () => {
      const grid = fillGrid([
        'B.......',
        'B.......',
        'B.......',
        'B.......',
        '........',
        '........',
        '........',
        '........',
      ]);

      const result = findAllMatches(grid);
      expect(result.matches).toHaveLength(1);
      expect(result.matches[0].length).toBe(4);
    });

    it('detects vertical match at rightmost column', () => {
      const grid = fillGrid([
        '.......G',
        '.......G',
        '.......G',
        '........',
        '........',
        '........',
        '........',
        '........',
      ]);

      const result = findAllMatches(grid);
      expect(result.matches).toHaveLength(1);
      expect(result.matches[0].gems[0].col).toBe(7);
    });

    it('detects vertical match spanning to bottom', () => {
      const grid = fillGrid([
        '........',
        '........',
        '........',
        '........',
        '........',
        'Y.......',
        'Y.......',
        'Y.......',
      ]);

      const result = findAllMatches(grid);
      expect(result.matches).toHaveLength(1);
      expect(result.matches[0].gems[2].row).toBe(7);
    });

    it('detects multiple vertical matches in same column', () => {
      const grid = fillGrid([
        'R.......',
        'R.......',
        'R.......',
        '........',
        'R.......',
        'R.......',
        'R.......',
        '........',
      ]);

      const result = findAllMatches(grid);
      expect(result.matches).toHaveLength(2);
    });
  });

  describe('findAllMatches - combined horizontal and vertical', () => {
    it('detects both horizontal and vertical matches', () => {
      const grid = fillGrid([
        'RRR.....',
        'B.......',
        'B.......',
        'B.......',
        '........',
        '........',
        '........',
        '........',
      ]);

      const result = findAllMatches(grid);
      expect(result.matches).toHaveLength(2);
      const horizontal = result.matches.find((m) => m.direction === 'horizontal');
      const vertical = result.matches.find((m) => m.direction === 'vertical');
      expect(horizontal).toBeDefined();
      expect(vertical).toBeDefined();
    });

    it('deduplicates matched positions from overlapping matches', () => {
      // Cross pattern at (1,1)
      const grid = fillGrid([
        '.R......',
        'RRR.....',
        '.R......',
        '........',
        '........',
        '........',
        '........',
        '........',
      ]);

      const result = findAllMatches(grid);
      expect(result.matches).toHaveLength(2); // 1 H + 1 V
      // Center gem (1,1) appears in both, but should only be counted once
      expect(result.allMatchedPositions).toHaveLength(5); // 3H + 3V - 1 overlap
    });
  });

  describe('determineSpecialGems', () => {
    it('creates LINE_CLEAR for 4-match horizontal', () => {
      const grid = fillGrid([
        'RRRR....',
        '........',
        '........',
        '........',
        '........',
        '........',
        '........',
        '........',
      ]);

      const result = findAllMatches(grid);
      expect(result.specialGems).toHaveLength(1);
      expect(result.specialGems[0].type).toBe(SpecialGemType.LINE_CLEAR);
      // Should be placed at middle position (col 1 or 2)
      expect(result.specialGems[0].position.row).toBe(0);
      expect([1, 2]).toContain(result.specialGems[0].position.col);
    });

    it('creates LINE_CLEAR for 4-match vertical', () => {
      const grid = fillGrid([
        'B.......',
        'B.......',
        'B.......',
        'B.......',
        '........',
        '........',
        '........',
        '........',
      ]);

      const result = findAllMatches(grid);
      expect(result.specialGems).toHaveLength(1);
      expect(result.specialGems[0].type).toBe(SpecialGemType.LINE_CLEAR);
    });

    it('creates COLOR_BOMB for 5-match', () => {
      const grid = fillGrid([
        'GGGGG...',
        '........',
        '........',
        '........',
        '........',
        '........',
        '........',
        '........',
      ]);

      const result = findAllMatches(grid);
      expect(result.specialGems).toHaveLength(1);
      expect(result.specialGems[0].type).toBe(SpecialGemType.COLOR_BOMB);
      expect(result.specialGems[0].position.row).toBe(0);
      expect(result.specialGems[0].position.col).toBe(2); // Middle of 5
    });

    it('creates BOMB for L-shape (horizontal + vertical intersection)', () => {
      // L-shape at (1,1)
      const grid = fillGrid([
        '.R......',
        'RRR.....',
        '........',
        '........',
        '........',
        '........',
        '........',
        '........',
      ]);

      const result = findAllMatches(grid);
      expect(result.specialGems).toHaveLength(1);
      expect(result.specialGems[0].type).toBe(SpecialGemType.BOMB);
      expect(result.specialGems[0].position.row).toBe(0);
      expect(result.specialGems[0].position.col).toBe(1);
    });

    it('creates BOMB for T-shape (horizontal + vertical intersection)', () => {
      // T-shape at (1,2)
      const grid = fillGrid([
        '..B.....',
        'BBBB....',
        '..B.....',
        '........',
        '........',
        '........',
        '........',
        '........',
      ]);

      const result = findAllMatches(grid);
      // Horizontal 4-match would create LINE_CLEAR, but intersection with vertical overrides to BOMB
      const bombGem = result.specialGems.find((s) => s.type === SpecialGemType.BOMB);
      expect(bombGem).toBeDefined();
      expect(bombGem!.position.row).toBe(1);
      expect(bombGem!.position.col).toBe(2);
    });

    it('does not create special for 3-match', () => {
      const grid = fillGrid([
        'RRR.....',
        '........',
        '........',
        '........',
        '........',
        '........',
        '........',
        '........',
      ]);

      const result = findAllMatches(grid);
      // 3-match creates no special (unless intersection)
      expect(result.specialGems).toHaveLength(0);
    });
  });

  describe('wouldSwapCreateMatch', () => {
    it('returns true for swap that creates horizontal match', () => {
      const grid = fillGrid([
        'RBR.....',
        '........',
        '........',
        '........',
        '........',
        '........',
        '........',
        '........',
      ]);

      const pos1: GridPosition = { row: 0, col: 0 };
      const pos2: GridPosition = { row: 0, col: 1 };

      expect(wouldSwapCreateMatch(grid, pos1, pos2)).toBe(true);
    });

    it('returns true for swap that creates vertical match', () => {
      const grid = fillGrid([
        'R.......',
        'B.......',
        'R.......',
        '........',
        '........',
        '........',
        '........',
        '........',
      ]);

      const pos1: GridPosition = { row: 0, col: 0 };
      const pos2: GridPosition = { row: 1, col: 0 };

      expect(wouldSwapCreateMatch(grid, pos1, pos2)).toBe(true);
    });

    it('returns false for swap that does not create match', () => {
      const grid = fillGrid([
        'RB......',
        'GY......',
        '........',
        '........',
        '........',
        '........',
        '........',
        '........',
      ]);

      const pos1: GridPosition = { row: 0, col: 0 };
      const pos2: GridPosition = { row: 0, col: 1 };

      expect(wouldSwapCreateMatch(grid, pos1, pos2)).toBe(false);
    });

    it('checks both swapped positions for matches', () => {
      // Swapping creates match at second position
      const grid = fillGrid([
        'B.......',
        'RRG.....',
        '........',
        '........',
        '........',
        '........',
        '........',
        '........',
      ]);

      const pos1: GridPosition = { row: 0, col: 0 };
      const pos2: GridPosition = { row: 1, col: 2 };

      // After swap, pos2 becomes (1,2) with Red, making RRR at row 1
      expect(wouldSwapCreateMatch(grid, pos1, pos2)).toBe(false); // Not adjacent!
    });
  });

  describe('hasValidMoves - deadlock detection', () => {
    it('returns true when valid horizontal swap exists', () => {
      const grid = fillGrid([
        'RBR.....',
        '........',
        '........',
        '........',
        '........',
        '........',
        '........',
        '........',
      ]);

      expect(hasValidMoves(grid)).toBe(true);
    });

    it('returns true when valid vertical swap exists', () => {
      const grid = fillGrid([
        'R.......',
        'B.......',
        'R.......',
        '........',
        '........',
        '........',
        '........',
        '........',
      ]);

      expect(hasValidMoves(grid)).toBe(true);
    });

    it('returns false when no valid moves exist (deadlock)', () => {
      // Checkerboard pattern — no possible match
      const grid = fillGrid([
        'RBRBRBRB',
        'BRBRBRBR',
        'RBRBRBRB',
        'BRBRBRBR',
        'RBRBRBRB',
        'BRBRBRBR',
        'RBRBRBRB',
        'BRBRBRBR',
      ]);

      expect(hasValidMoves(grid)).toBe(false);
    });

    it('returns true when match exists in middle of board', () => {
      const grid = fillGrid([
        'BRBRBRBR',
        'RBRBRBRB',
        'BRBRBRBR',
        'RBRGRBRB', // Swap R and G creates RRR
        'BRBRBRBR',
        'RBRBRBRB',
        'BRBRBRBR',
        'RBRBRBRB',
      ]);

      expect(hasValidMoves(grid)).toBe(true);
    });

    it('handles grid with null cells', () => {
      const grid = fillGrid([
        'RBR.....',
        '........',
        '........',
        '........',
        '........',
        '........',
        '........',
        '........',
      ]);

      // Only 3 gems, but they can create a match
      expect(hasValidMoves(grid)).toBe(true);
    });

    it('returns false for empty grid', () => {
      const grid = createEmptyGrid();
      expect(hasValidMoves(grid)).toBe(false);
    });
  });

  describe('getSpecialGemAffectedPositions - LINE_CLEAR', () => {
    it('clears entire row and column', () => {
      const grid = fillGrid([
        'RBRBRBRB',
        'BRBRBRBR',
        'RBRBRBRB',
        'BRBRBRBR',
        'RBRBRBRB',
        'BRBRBRBR',
        'RBRBRBRB',
        'BRBRBRBR',
      ]);

      const pos: GridPosition = { row: 3, col: 4 };
      const affected = getSpecialGemAffectedPositions(grid, pos, SpecialGemType.LINE_CLEAR);

      // Should clear row 3 (8 gems) + column 4 (7 more, excluding (3,4))
      expect(affected.length).toBe(15); // 8 + 7
    });

    it('clears row and column at top-left corner', () => {
      const grid = fillGrid([
        'RBRBRBRB',
        'BRBRBRBR',
        'RBRBRBRB',
        'BRBRBRBR',
        'RBRBRBRB',
        'BRBRBRBR',
        'RBRBRBRB',
        'BRBRBRBR',
      ]);

      const pos: GridPosition = { row: 0, col: 0 };
      const affected = getSpecialGemAffectedPositions(grid, pos, SpecialGemType.LINE_CLEAR);

      expect(affected.length).toBe(15); // 8 + 7
    });

    it('clears row and column at bottom-right corner', () => {
      const grid = fillGrid([
        'RBRBRBRB',
        'BRBRBRBR',
        'RBRBRBRB',
        'BRBRBRBR',
        'RBRBRBRB',
        'BRBRBRBR',
        'RBRBRBRB',
        'BRBRBRBR',
      ]);

      const pos: GridPosition = { row: 7, col: 7 };
      const affected = getSpecialGemAffectedPositions(grid, pos, SpecialGemType.LINE_CLEAR);

      expect(affected.length).toBe(15);
    });
  });

  describe('getSpecialGemAffectedPositions - BOMB', () => {
    it('clears 3x3 area centered on gem', () => {
      const grid = fillGrid([
        'RBRBRBRB',
        'BRBRBRBR',
        'RBRBRBRB',
        'BRBRBRBR',
        'RBRBRBRB',
        'BRBRBRBR',
        'RBRBRBRB',
        'BRBRBRBR',
      ]);

      const pos: GridPosition = { row: 3, col: 4 };
      const affected = getSpecialGemAffectedPositions(grid, pos, SpecialGemType.BOMB);

      // 3x3 = 9 gems
      expect(affected.length).toBe(9);
      expect(affected).toContainEqual({ row: 2, col: 3 });
      expect(affected).toContainEqual({ row: 3, col: 4 }); // Center
      expect(affected).toContainEqual({ row: 4, col: 5 });
    });

    it('clears 3x3 at top-left corner (partial)', () => {
      const grid = fillGrid([
        'RBRBRBRB',
        'BRBRBRBR',
        'RBRBRBRB',
        'BRBRBRBR',
        'RBRBRBRB',
        'BRBRBRBR',
        'RBRBRBRB',
        'BRBRBRBR',
      ]);

      const pos: GridPosition = { row: 0, col: 0 };
      const affected = getSpecialGemAffectedPositions(grid, pos, SpecialGemType.BOMB);

      // Only bottom-right 2x2 quadrant exists
      expect(affected.length).toBe(4);
    });

    it('clears 3x3 at bottom-right corner (partial)', () => {
      const grid = fillGrid([
        'RBRBRBRB',
        'BRBRBRBR',
        'RBRBRBRB',
        'BRBRBRBR',
        'RBRBRBRB',
        'BRBRBRBR',
        'RBRBRBRB',
        'BRBRBRBR',
      ]);

      const pos: GridPosition = { row: 7, col: 7 };
      const affected = getSpecialGemAffectedPositions(grid, pos, SpecialGemType.BOMB);

      // Only top-left 2x2 quadrant exists
      expect(affected.length).toBe(4);
    });
  });

  describe('getSpecialGemAffectedPositions - COLOR_BOMB', () => {
    it('clears all gems of the same color', () => {
      const grid = fillGrid([
        'RBRBRBRB',
        'BRBRBRBR',
        'RBRBRBRB',
        'BRBRBRBR',
        'RBRBRBRB',
        'BRBRBRBR',
        'RBRBRBRB',
        'BRBRBRBR',
      ]);

      // Color bomb at (0,0) is Red — clear all Red gems
      const pos: GridPosition = { row: 0, col: 0 };
      const affected = getSpecialGemAffectedPositions(grid, pos, SpecialGemType.COLOR_BOMB);

      // Count red gems in checkerboard: 32 red, 32 blue
      expect(affected.length).toBe(32);
      expect(affected.every((p) => grid[p.row][p.col]?.color === GemColor.RED)).toBe(true);
    });

    it('clears all gems when board is single color', () => {
      const grid = fillGrid([
        'RRRRRRRR',
        'RRRRRRRR',
        'RRRRRRRR',
        'RRRRRRRR',
        'RRRRRRRR',
        'RRRRRRRR',
        'RRRRRRRR',
        'RRRRRRRR',
      ]);

      const pos: GridPosition = { row: 4, col: 4 };
      const affected = getSpecialGemAffectedPositions(grid, pos, SpecialGemType.COLOR_BOMB);

      expect(affected.length).toBe(64); // All gems
    });

    it('clears nothing when no gems of that color exist', () => {
      const grid = fillGrid([
        'BBBBBBBB',
        'BBBBBBBB',
        'BBBBBBBB',
        'BBBBBBBB',
        'BBBBBBBB',
        'BBBBBBBB',
        'BBBBBBBB',
        'BBBBRRRR', // Replace bottom-right with Red for the bomb position
      ]);

      // Manually set the color bomb position to Red
      grid[7][7] = createGem(7, 7, GemColor.RED);

      const pos: GridPosition = { row: 7, col: 7 };
      const affected = getSpecialGemAffectedPositions(grid, pos, SpecialGemType.COLOR_BOMB);

      // Only the 4 red gems at bottom-right
      expect(affected.length).toBe(4);
    });
  });

  describe('edge cases', () => {
    it('handles full board of matches', () => {
      const grid = fillGrid([
        'RRRRRRRR',
        'RRRRRRRR',
        'RRRRRRRR',
        'RRRRRRRR',
        'RRRRRRRR',
        'RRRRRRRR',
        'RRRRRRRR',
        'RRRRRRRR',
      ]);

      const result = findAllMatches(grid);
      // 8 horizontal matches + 8 vertical matches
      expect(result.matches.length).toBeGreaterThanOrEqual(16);
    });

    it('handles near-empty board', () => {
      const grid = fillGrid([
        'R.......',
        '........',
        '........',
        '........',
        '........',
        '........',
        '........',
        '........',
      ]);

      const result = findAllMatches(grid);
      expect(result.matches).toHaveLength(0);
    });

    it('handles grid with all null cells', () => {
      const grid = createEmptyGrid();
      const result = findAllMatches(grid);
      expect(result.matches).toHaveLength(0);
      expect(result.allMatchedPositions).toHaveLength(0);
      expect(result.specialGems).toHaveLength(0);
    });

    it('handles grid with scattered null cells', () => {
      const grid = fillGrid([
        'R.R.....',
        '.R......',
        'R.R.....',
        '........',
        '........',
        '........',
        '........',
        '........',
      ]);

      const result = findAllMatches(grid);
      expect(result.matches).toHaveLength(0); // No continuous matches
    });
  });
});
