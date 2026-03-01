/**
 * Gem Link — Level Manager
 * Owner: Game Engineer
 *
 * Loads level data from the JSON catalog, tracks moves,
 * and determines win/lose conditions.
 */

import { Logger } from '../../utils/Logger';
import { LevelResult, StarRating } from '../../types/game.types';

const logger = new Logger('LevelManager');

/** Raw level data shape from levels.json */
export interface RawLevelData {
  id: number;
  name: string;
  moveLimit: number;
  starThresholds: [number, number, number];
  seed: string;
  colorCount: number;
  specialGemUnlocks: string[];
  objectives: {
    type: string;
    target: number;
  };
}

export class LevelManager {
  /** All level data from JSON */
  private levels: RawLevelData[] = [];

  /** Current level being played */
  private currentLevel: RawLevelData | null = null;

  /** Moves used this attempt */
  private movesUsed: number = 0;

  /** Timestamp when level started */
  private startTime: number = 0;

  constructor() {
    logger.info('constructor', 'LevelManager created');
  }

  /**
   * Load the level catalog from the preloaded JSON cache.
   */
  loadCatalog(jsonData: RawLevelData[]): void {
    this.levels = jsonData;
    logger.info('loadCatalog', `Loaded ${this.levels.length} levels`);
  }

  /**
   * Start a specific level.
   */
  startLevel(levelId: number): RawLevelData | null {
    const level = this.levels.find((l) => l.id === levelId);
    if (!level) {
      logger.error('startLevel', `Level ${levelId} not found in catalog`);
      return null;
    }

    this.currentLevel = level;
    this.movesUsed = 0;
    this.startTime = Date.now();

    logger.info('startLevel', `Starting level ${levelId}: "${level.name}"`, {
      moveLimit: level.moveLimit,
      colorCount: level.colorCount,
      starThresholds: level.starThresholds,
      specialGemUnlocks: level.specialGemUnlocks,
    });

    return level;
  }

  /**
   * Record a move. Returns remaining moves.
   */
  useMove(): number {
    if (!this.currentLevel) return 0;

    this.movesUsed++;
    const remaining = this.currentLevel.moveLimit - this.movesUsed;

    logger.debug('useMove', `Move ${this.movesUsed}/${this.currentLevel.moveLimit}`, {
      remaining,
    });

    return remaining;
  }

  /**
   * Get remaining moves.
   */
  getMovesRemaining(): number {
    if (!this.currentLevel) return 0;
    return Math.max(0, this.currentLevel.moveLimit - this.movesUsed);
  }

  /**
   * Get total moves used.
   */
  getMovesUsed(): number {
    return this.movesUsed;
  }

  /**
   * Get the current level's move limit.
   */
  getMoveLimit(): number {
    return this.currentLevel?.moveLimit ?? 0;
  }

  /**
   * Check if out of moves.
   */
  isOutOfMoves(): boolean {
    if (!this.currentLevel) return true;
    return this.movesUsed >= this.currentLevel.moveLimit;
  }

  /**
   * Get current level data.
   */
  getCurrentLevel(): RawLevelData | null {
    return this.currentLevel;
  }

  /**
   * Get the level's star thresholds.
   */
  getStarThresholds(): [number, number, number] {
    return this.currentLevel ? [...this.currentLevel.starThresholds] as [number, number, number] : [0, 0, 0];
  }

  /**
   * Get elapsed time in seconds.
   */
  getElapsedSeconds(): number {
    return Math.round((Date.now() - this.startTime) / 1000);
  }

  /**
   * Build a LevelResult object from current state.
   */
  buildResult(score: number, stars: StarRating, totalCascades: number, passed: boolean): LevelResult {
    const result: LevelResult = {
      levelId: this.currentLevel?.id ?? 0,
      score,
      stars,
      movesUsed: this.movesUsed,
      movesRemaining: this.getMovesRemaining(),
      durationSeconds: this.getElapsedSeconds(),
      totalCascades,
      passed,
    };

    logger.info('buildResult', `Level ${result.levelId} result: ${passed ? 'PASSED' : 'FAILED'}`, result);
    return result;
  }

  /**
   * Add extra moves (from in-app purchase).
   */
  addExtraMoves(count: number): void {
    if (!this.currentLevel) return;
    this.currentLevel = {
      ...this.currentLevel,
      moveLimit: this.currentLevel.moveLimit + count,
    };
    logger.info('addExtraMoves', `Added ${count} extra moves`, {
      newLimit: this.currentLevel.moveLimit,
      remaining: this.getMovesRemaining(),
    });
  }
}
