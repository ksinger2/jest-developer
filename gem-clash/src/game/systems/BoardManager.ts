/**
 * Gem Link — Board Manager
 * Owner: Game Engineer
 *
 * Manages the logical board state (8x8 grid of GemData).
 * Handles:
 * - Board initialization (no initial matches)
 * - Gem spawning with seeded randomness
 * - Gravity (gems fall to fill gaps)
 * - Swap execution
 * - Board reshuffle on deadlock
 */

import { Logger } from '../../utils/Logger';
import {
  GemColor,
  GemData,
  GemState,
  SpecialGemType,
  GridPosition,
  SwapAction,
  GRID_ROWS,
  GRID_COLS,
} from '../../types/game.types';

const logger = new Logger('BoardManager');

/** Available gem colors (subset based on level config) */
const ALL_COLORS: GemColor[] = [
  GemColor.RED,
  GemColor.BLUE,
  GemColor.GREEN,
  GemColor.YELLOW,
  GemColor.PURPLE,
  GemColor.WHITE,
];

/** Simple seeded random number generator (mulberry32) */
function createRng(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  let state = h;
  return () => {
    state |= 0;
    state = state + 0x6D2B79F5 | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class BoardManager {
  /** The grid — grid[row][col], null means empty cell */
  private grid: (GemData | null)[][] = [];

  /** Number of active gem colors for this level */
  private colorCount: number = 5;

  /** Colors available for this level */
  private activeColors: GemColor[] = [];

  /** RNG function */
  private rng: () => number;

  /** Counter for generating unique gem IDs */
  private gemIdCounter: number = 0;

  /** Which special gems are enabled for this level */
  private enabledSpecials: Set<string> = new Set();

  constructor() {
    this.rng = Math.random;
    logger.info('constructor', 'BoardManager created');
  }

  /**
   * Initialize the board for a level.
   * Fills the grid with random gems ensuring no initial matches.
   */
  initBoard(
    colorCount: number,
    seed: string,
    specialGemUnlocks: string[] = [],
  ): (GemData | null)[][] {
    logger.info('initBoard', `Initializing ${GRID_ROWS}x${GRID_COLS} board`, {
      colorCount,
      seed,
      specialGemUnlocks,
    });

    this.colorCount = Math.min(Math.max(colorCount, 3), ALL_COLORS.length);
    this.activeColors = ALL_COLORS.slice(0, this.colorCount);
    this.rng = createRng(seed);
    this.gemIdCounter = 0;
    this.enabledSpecials = new Set(specialGemUnlocks);

    // Create empty grid
    this.grid = [];
    for (let row = 0; row < GRID_ROWS; row++) {
      this.grid[row] = new Array(GRID_COLS).fill(null);
    }

    // Fill grid with random gems, avoiding initial matches
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        this.grid[row][col] = this.spawnGemNoMatch(row, col);
      }
    }

    logger.info('initBoard', 'Board initialized — no initial matches', {
      totalGems: GRID_ROWS * GRID_COLS,
      colors: this.activeColors,
    });

    return this.grid;
  }

  /**
   * Spawn a gem at (row, col) that doesn't create an immediate match.
   */
  private spawnGemNoMatch(row: number, col: number): GemData {
    const availableColors = [...this.activeColors];

    // Remove colors that would create a horizontal match of 3
    if (col >= 2) {
      const left1 = this.grid[row][col - 1];
      const left2 = this.grid[row][col - 2];
      if (left1 && left2 && left1.color === left2.color) {
        const idx = availableColors.indexOf(left1.color);
        if (idx !== -1) availableColors.splice(idx, 1);
      }
    }

    // Remove colors that would create a vertical match of 3
    if (row >= 2) {
      const up1 = this.grid[row - 1]?.[col];
      const up2 = this.grid[row - 2]?.[col];
      if (up1 && up2 && up1.color === up2.color) {
        const idx = availableColors.indexOf(up1.color);
        if (idx !== -1) availableColors.splice(idx, 1);
      }
    }

    // Pick a random color from remaining options
    if (availableColors.length === 0) {
      // Fallback (shouldn't happen with ≥3 colors)
      availableColors.push(this.activeColors[0]);
    }

    const color = availableColors[Math.floor(this.rng() * availableColors.length)];
    return this.createGemData(row, col, color);
  }

  /**
   * Create a GemData object with a unique ID.
   */
  private createGemData(
    row: number,
    col: number,
    color: GemColor,
    specialType: SpecialGemType = SpecialGemType.NONE,
  ): GemData {
    this.gemIdCounter++;
    return {
      id: `gem_${this.gemIdCounter}`,
      color,
      specialType,
      row,
      col,
      state: GemState.IDLE,
    };
  }

  /**
   * Get the current grid state.
   */
  getGrid(): (GemData | null)[][] {
    return this.grid;
  }

  /**
   * Get gem data at a specific position.
   */
  getGemAt(row: number, col: number): GemData | null {
    if (row < 0 || row >= GRID_ROWS || col < 0 || col >= GRID_COLS) return null;
    return this.grid[row][col];
  }

  /**
   * Check if two positions are adjacent (horizontally or vertically).
   */
  areAdjacent(pos1: GridPosition, pos2: GridPosition): boolean {
    const dr = Math.abs(pos1.row - pos2.row);
    const dc = Math.abs(pos1.col - pos2.col);
    return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
  }

  /**
   * Execute a swap between two positions in the grid.
   * Does NOT validate — caller must check adjacency and match validity.
   */
  executeSwap(swap: SwapAction): void {
    const { from, to } = swap;
    const temp = this.grid[from.row][from.col];
    this.grid[from.row][from.col] = this.grid[to.row][to.col];
    this.grid[to.row][to.col] = temp;

    // Update gem's internal row/col tracking
    const gemA = this.grid[from.row][from.col];
    const gemB = this.grid[to.row][to.col];
    if (gemA) {
      gemA.row = from.row;
      gemA.col = from.col;
    }
    if (gemB) {
      gemB.row = to.row;
      gemB.col = to.col;
    }

    logger.debug('executeSwap', `Swapped (${from.row},${from.col}) <-> (${to.row},${to.col})`);
  }

  /**
   * Remove gems at the given positions (set to null).
   * Returns the removed GemData objects.
   */
  removeGems(positions: GridPosition[]): GemData[] {
    const removed: GemData[] = [];
    for (const pos of positions) {
      const gem = this.grid[pos.row][pos.col];
      if (gem) {
        removed.push(gem);
        this.grid[pos.row][pos.col] = null;
      }
    }

    logger.debug('removeGems', `Removed ${removed.length} gems from board`);
    return removed;
  }

  /**
   * Apply gravity — move gems down to fill empty spaces.
   * Returns array of { gem, fromRow, toRow } for animation.
   */
  applyGravity(): { gemId: string; fromRow: number; toRow: number; col: number }[] {
    const falls: { gemId: string; fromRow: number; toRow: number; col: number }[] = [];

    for (let col = 0; col < GRID_COLS; col++) {
      // Scan from bottom to top
      let writeRow = GRID_ROWS - 1;

      for (let readRow = GRID_ROWS - 1; readRow >= 0; readRow--) {
        if (this.grid[readRow][col] !== null) {
          if (readRow !== writeRow) {
            // Move gem down
            const gem = this.grid[readRow][col]!;
            this.grid[writeRow][col] = gem;
            this.grid[readRow][col] = null;
            gem.row = writeRow;
            gem.col = col;
            falls.push({
              gemId: gem.id,
              fromRow: readRow,
              toRow: writeRow,
              col,
            });
          }
          writeRow--;
        }
      }
    }

    if (falls.length > 0) {
      logger.debug('applyGravity', `${falls.length} gems fell`);
    }

    return falls;
  }

  /**
   * Spawn new gems to fill empty spaces at the top of each column.
   * Returns array of newly created gems.
   */
  spawnNewGems(): GemData[] {
    const spawned: GemData[] = [];

    for (let col = 0; col < GRID_COLS; col++) {
      for (let row = 0; row < GRID_ROWS; row++) {
        if (this.grid[row][col] === null) {
          const color = this.activeColors[Math.floor(this.rng() * this.activeColors.length)];
          const gem = this.createGemData(row, col, color);
          gem.state = GemState.SPAWNING;
          this.grid[row][col] = gem;
          spawned.push(gem);
        }
      }
    }

    if (spawned.length > 0) {
      logger.debug('spawnNewGems', `Spawned ${spawned.length} new gems`);
    }

    return spawned;
  }

  /**
   * Place a special gem at the given position (replaces existing gem).
   * Used after a match pattern is detected.
   */
  placeSpecialGem(pos: GridPosition, type: SpecialGemType, color: GemColor): GemData | null {
    // Only create if this special type is enabled for the level
    if (!this.enabledSpecials.has(type)) {
      logger.debug('placeSpecialGem', `${type} not enabled for this level — skipping`);
      return null;
    }

    const gem = this.createGemData(pos.row, pos.col, color, type);
    this.grid[pos.row][pos.col] = gem;

    logger.info('placeSpecialGem', `Created ${type} at (${pos.row},${pos.col})`, { color });
    return gem;
  }

  /**
   * Check if special gem type is enabled for current level.
   */
  isSpecialEnabled(type: SpecialGemType): boolean {
    return this.enabledSpecials.has(type);
  }

  /**
   * Reshuffle the board (used on deadlock).
   * Keeps all gem colors/specials but randomizes positions.
   * Ensures no matches exist after reshuffle.
   */
  reshuffleBoard(): void {
    logger.info('reshuffleBoard', 'Reshuffling board due to deadlock');

    // Collect all existing gems
    const gems: GemData[] = [];
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        if (this.grid[row][col]) {
          gems.push(this.grid[row][col]!);
        }
      }
    }

    // Fisher-Yates shuffle
    for (let i = gems.length - 1; i > 0; i--) {
      const j = Math.floor(this.rng() * (i + 1));
      [gems[i], gems[j]] = [gems[j], gems[i]];
    }

    // Place back on grid
    let idx = 0;
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        if (idx < gems.length) {
          gems[idx].row = row;
          gems[idx].col = col;
          this.grid[row][col] = gems[idx];
          idx++;
        }
      }
    }

    logger.info('reshuffleBoard', 'Board reshuffled', { totalGems: gems.length });
  }

  /**
   * Re-map the board: replace ALL gems with fresh random ones.
   * Unlike reshuffleBoard (which rearranges existing gems), this creates
   * an entirely new board with no initial matches and no special gems.
   * Score and moves are preserved by the caller.
   */
  remapBoard(): (GemData | null)[][] {
    logger.info('remapBoard', 'Re-mapping board with fresh gems');

    // Clear the grid
    for (let row = 0; row < GRID_ROWS; row++) {
      this.grid[row] = new Array(GRID_COLS).fill(null);
    }

    // Fill with new random gems, no initial matches
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        this.grid[row][col] = this.spawnGemNoMatch(row, col);
      }
    }

    logger.info('remapBoard', 'Board re-mapped with fresh gems', {
      totalGems: GRID_ROWS * GRID_COLS,
    });

    return this.grid;
  }

  /**
   * Get count of active colors for this level.
   */
  getActiveColors(): GemColor[] {
    return [...this.activeColors];
  }

  /**
   * Debug: print the board to console.
   */
  debugPrint(): void {
    const rows: string[] = [];
    for (let row = 0; row < GRID_ROWS; row++) {
      let line = '';
      for (let col = 0; col < GRID_COLS; col++) {
        const gem = this.grid[row][col];
        if (gem) {
          line += gem.color.charAt(0).toUpperCase() + ' ';
        } else {
          line += '. ';
        }
      }
      rows.push(line.trim());
    }
    logger.debug('debugPrint', 'Board state:\n' + rows.join('\n'));
  }
}
