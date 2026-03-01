/**
 * Gem Link — Match Engine
 * Owner: Game Engineer
 *
 * Pure logic system for match detection on the board grid.
 * No Phaser dependencies — operates on GemData arrays.
 *
 * Responsibilities:
 * - Detect horizontal and vertical matches (3+)
 * - Detect L-shape and T-shape patterns for bomb creation
 * - Determine special gem creation from match patterns
 * - Check for board deadlock (no valid moves)
 */

import { Logger } from '../../utils/Logger';
import {
  GemData,
  GridPosition,
  Match,
  SpecialGemType,
  MIN_MATCH_LENGTH,
  GRID_ROWS,
  GRID_COLS,
} from '../../types/game.types';

const logger = new Logger('MatchEngine');

/** Result of analyzing matches on the board */
export interface MatchAnalysis {
  /** All distinct matches found */
  matches: Match[];
  /** All positions that are part of any match (deduplicated) */
  allMatchedPositions: GridPosition[];
  /** Special gems to create (position + type) */
  specialGems: { position: GridPosition; type: SpecialGemType }[];
}

/**
 * Scan the entire board for matches.
 * Returns all matches found with their positions and lengths.
 */
export function findAllMatches(grid: (GemData | null)[][]): MatchAnalysis {
  logger.debug('findAllMatches', 'Scanning board for matches');

  const horizontalMatches = findHorizontalMatches(grid);
  const verticalMatches = findVerticalMatches(grid);
  const allMatches = [...horizontalMatches, ...verticalMatches];

  // Deduplicate matched positions
  const positionSet = new Set<string>();
  const allMatchedPositions: GridPosition[] = [];
  for (const match of allMatches) {
    for (const pos of match.gems) {
      const key = `${pos.row},${pos.col}`;
      if (!positionSet.has(key)) {
        positionSet.add(key);
        allMatchedPositions.push(pos);
      }
    }
  }

  // Determine special gems from match patterns
  const specialGems = determineSpecialGems(allMatches, grid);

  logger.info('findAllMatches', `Found ${allMatches.length} matches, ${allMatchedPositions.length} gems matched`, {
    horizontal: horizontalMatches.length,
    vertical: verticalMatches.length,
    specials: specialGems.length,
  });

  return { matches: allMatches, allMatchedPositions, specialGems };
}

/**
 * Find all horizontal matches (3+ consecutive same-color gems in a row).
 */
function findHorizontalMatches(grid: (GemData | null)[][]): Match[] {
  const matches: Match[] = [];

  for (let row = 0; row < GRID_ROWS; row++) {
    let col = 0;
    while (col < GRID_COLS) {
      const gem = grid[row][col];
      if (!gem) {
        col++;
        continue;
      }

      // Count consecutive same-color gems
      const color = gem.color;
      const startCol = col;
      const positions: GridPosition[] = [{ row, col }];
      col++;

      while (col < GRID_COLS) {
        const next = grid[row][col];
        if (!next || next.color !== color) break;
        positions.push({ row, col });
        col++;
      }

      if (positions.length >= MIN_MATCH_LENGTH) {
        matches.push({
          gems: positions,
          direction: 'horizontal',
          color,
          length: positions.length,
        });
        logger.debug('findHorizontalMatches', `H-match: ${color} x${positions.length} at row=${row}, cols=${startCol}-${col - 1}`);
      }
    }
  }

  return matches;
}

/**
 * Find all vertical matches (3+ consecutive same-color gems in a column).
 */
function findVerticalMatches(grid: (GemData | null)[][]): Match[] {
  const matches: Match[] = [];

  for (let col = 0; col < GRID_COLS; col++) {
    let row = 0;
    while (row < GRID_ROWS) {
      const gem = grid[row][col];
      if (!gem) {
        row++;
        continue;
      }

      const color = gem.color;
      const startRow = row;
      const positions: GridPosition[] = [{ row, col }];
      row++;

      while (row < GRID_ROWS) {
        const next = grid[row][col];
        if (!next || next.color !== color) break;
        positions.push({ row, col });
        row++;
      }

      if (positions.length >= MIN_MATCH_LENGTH) {
        matches.push({
          gems: positions,
          direction: 'vertical',
          color,
          length: positions.length,
        });
        logger.debug('findVerticalMatches', `V-match: ${color} x${positions.length} at col=${col}, rows=${startRow}-${row - 1}`);
      }
    }
  }

  return matches;
}

/**
 * Determine what special gems should be created based on match patterns.
 *
 * Rules:
 * - Match of 4: LINE_CLEAR at the position of the moved gem (or middle)
 * - Match of 5+: COLOR_BOMB at middle position
 * - L-shape or T-shape (intersecting H+V matches): BOMB at intersection
 */
function determineSpecialGems(
  matches: Match[],
  _grid: (GemData | null)[][],
): { position: GridPosition; type: SpecialGemType }[] {
  const specials: { position: GridPosition; type: SpecialGemType }[] = [];
  const usedPositions = new Set<string>();

  // Build a lookup of all matched positions grouped by match
  // First check for intersections (L/T shapes → BOMB)
  const positionToMatches = new Map<string, Match[]>();
  for (const match of matches) {
    for (const pos of match.gems) {
      const key = `${pos.row},${pos.col}`;
      if (!positionToMatches.has(key)) {
        positionToMatches.set(key, []);
      }
      positionToMatches.get(key)!.push(match);
    }
  }

  // Find intersections: positions that belong to both a horizontal and vertical match
  for (const [key, matchList] of positionToMatches) {
    const hasH = matchList.some((m) => m.direction === 'horizontal');
    const hasV = matchList.some((m) => m.direction === 'vertical');
    if (hasH && hasV && !usedPositions.has(key)) {
      const [rowStr, colStr] = key.split(',');
      specials.push({
        position: { row: Number(rowStr), col: Number(colStr) },
        type: SpecialGemType.BOMB,
      });
      usedPositions.add(key);
      logger.debug('determineSpecialGems', `BOMB at intersection ${key}`);
    }
  }

  // Then check individual matches for length-based specials
  for (const match of matches) {
    if (match.length >= 5) {
      // 5+ match → COLOR_BOMB at middle
      const midIdx = Math.floor(match.gems.length / 2);
      const midPos = match.gems[midIdx];
      const key = `${midPos.row},${midPos.col}`;
      if (!usedPositions.has(key)) {
        specials.push({ position: midPos, type: SpecialGemType.COLOR_BOMB });
        usedPositions.add(key);
        logger.debug('determineSpecialGems', `COLOR_BOMB from ${match.length}-match at ${key}`);
      }
    } else if (match.length === 4) {
      // 4 match → LINE_CLEAR at middle-ish position
      const midIdx = Math.floor(match.gems.length / 2);
      const midPos = match.gems[midIdx];
      const key = `${midPos.row},${midPos.col}`;
      if (!usedPositions.has(key)) {
        specials.push({ position: midPos, type: SpecialGemType.LINE_CLEAR });
        usedPositions.add(key);
        logger.debug('determineSpecialGems', `LINE_CLEAR from 4-match at ${key}`);
      }
    }
  }

  return specials;
}

/**
 * Check if swapping two adjacent positions would create a match.
 * Used for move validation and deadlock detection.
 */
export function wouldSwapCreateMatch(
  grid: (GemData | null)[][],
  pos1: GridPosition,
  pos2: GridPosition,
): boolean {
  // Simulate the swap
  const tempGrid = grid.map((row) => [...row]);
  const temp = tempGrid[pos1.row][pos1.col];
  tempGrid[pos1.row][pos1.col] = tempGrid[pos2.row][pos2.col];
  tempGrid[pos2.row][pos2.col] = temp;

  // Check if either swapped position now has a match
  return (
    hasMatchAt(tempGrid, pos1.row, pos1.col) ||
    hasMatchAt(tempGrid, pos2.row, pos2.col)
  );
}

/**
 * Check if there's a match involving the gem at (row, col).
 * Faster than scanning entire board — only checks local neighbors.
 */
function hasMatchAt(grid: (GemData | null)[][], row: number, col: number): boolean {
  const gem = grid[row]?.[col];
  if (!gem) return false;
  const color = gem.color;

  // Check horizontal
  let hCount = 1;
  // Left
  for (let c = col - 1; c >= 0; c--) {
    if (grid[row][c]?.color === color) hCount++;
    else break;
  }
  // Right
  for (let c = col + 1; c < GRID_COLS; c++) {
    if (grid[row][c]?.color === color) hCount++;
    else break;
  }
  if (hCount >= MIN_MATCH_LENGTH) return true;

  // Check vertical
  let vCount = 1;
  // Up
  for (let r = row - 1; r >= 0; r--) {
    if (grid[r]?.[col]?.color === color) vCount++;
    else break;
  }
  // Down
  for (let r = row + 1; r < GRID_ROWS; r++) {
    if (grid[r]?.[col]?.color === color) vCount++;
    else break;
  }
  if (vCount >= MIN_MATCH_LENGTH) return true;

  return false;
}

/**
 * Check if any valid move exists on the board (deadlock detection).
 * Tries every adjacent swap and checks if it would create a match.
 */
export function hasValidMoves(grid: (GemData | null)[][]): boolean {
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      if (!grid[row][col]) continue;

      // Check swap right
      if (col + 1 < GRID_COLS && grid[row][col + 1]) {
        if (wouldSwapCreateMatch(grid, { row, col }, { row, col: col + 1 })) {
          return true;
        }
      }
      // Check swap down
      if (row + 1 < GRID_ROWS && grid[row + 1][col]) {
        if (wouldSwapCreateMatch(grid, { row, col }, { row: row + 1, col })) {
          return true;
        }
      }
    }
  }

  logger.warn('hasValidMoves', 'No valid moves found — board is deadlocked');
  return false;
}

/**
 * Get all positions affected by activating a special gem.
 */
export function getSpecialGemAffectedPositions(
  grid: (GemData | null)[][],
  pos: GridPosition,
  specialType: SpecialGemType,
): GridPosition[] {
  const affected: GridPosition[] = [];

  switch (specialType) {
    case SpecialGemType.LINE_CLEAR: {
      // Clear entire row AND column of the gem
      for (let c = 0; c < GRID_COLS; c++) {
        if (grid[pos.row][c]) affected.push({ row: pos.row, col: c });
      }
      for (let r = 0; r < GRID_ROWS; r++) {
        if (r !== pos.row && grid[r][pos.col]) affected.push({ row: r, col: pos.col });
      }
      logger.debug('getSpecialGemAffectedPositions', `LINE_CLEAR at ${pos.row},${pos.col}: ${affected.length} gems`);
      break;
    }

    case SpecialGemType.BOMB: {
      // Clear 3x3 area centered on gem
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const r = pos.row + dr;
          const c = pos.col + dc;
          if (r >= 0 && r < GRID_ROWS && c >= 0 && c < GRID_COLS && grid[r][c]) {
            affected.push({ row: r, col: c });
          }
        }
      }
      logger.debug('getSpecialGemAffectedPositions', `BOMB at ${pos.row},${pos.col}: ${affected.length} gems`);
      break;
    }

    case SpecialGemType.COLOR_BOMB: {
      // Clear all gems of the same color as the swapped-into gem
      const gem = grid[pos.row][pos.col];
      if (gem) {
        const targetColor = gem.color;
        for (let r = 0; r < GRID_ROWS; r++) {
          for (let c = 0; c < GRID_COLS; c++) {
            if (grid[r][c]?.color === targetColor) {
              affected.push({ row: r, col: c });
            }
          }
        }
        logger.debug('getSpecialGemAffectedPositions', `COLOR_BOMB targeting ${targetColor}: ${affected.length} gems`);
      }
      break;
    }

    default:
      break;
  }

  return affected;
}
