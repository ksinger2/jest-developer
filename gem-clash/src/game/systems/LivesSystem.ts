/**
 * Gem Link — Lives System
 * Owner: Game Engineer
 *
 * Manages player lives with 5 max lives, 30-minute regeneration per life,
 * deduction on level failure, and refill via IAP (gc_lives_refill).
 *
 * Key features:
 * - Singleton pattern for global access
 * - Offline regeneration calculation
 * - Time formatting for UI display
 * - Event emission for UI updates
 */

import { Logger } from '../../utils/Logger';
import { EventBus } from '../../utils/EventBus';
import {
  PlayerProgress,
  GameEvent,
  MAX_LIVES,
  LIFE_REGEN_MINUTES,
} from '../../types/game.types';

const logger = new Logger('LivesSystem');

/** Milliseconds per life regeneration (30 minutes) */
const LIFE_REGEN_MS = LIFE_REGEN_MINUTES * 60 * 1000;

/**
 * Status snapshot of the lives system at a given moment.
 * Used by UI components to render lives display and timers.
 */
export interface LivesStatus {
  /** Current number of lives (0 to MAX_LIVES) */
  currentLives: number;
  /** Maximum lives allowed */
  maxLives: number;
  /** Whether player can start a level (has at least 1 life) */
  canPlay: boolean;
  /** Whether lives are full (no regeneration needed) */
  isFull: boolean;
  /** Time until next life regenerates (ms), 0 if full */
  msUntilNextLife: number;
  /** Formatted time until next life (MM:SS), empty if full */
  timeUntilNextLife: string;
  /** Time until all lives are full (ms), 0 if already full */
  msUntilFull: number;
  /** ISO timestamp of last life loss (for persistence) */
  lastLifeLostAt: string | null;
}

/**
 * Singleton system for managing player lives.
 *
 * Usage:
 *   const lives = LivesSystem.getInstance();
 *   const status = lives.getStatus(playerProgress);
 *   if (status.canPlay) { startLevel(); }
 */
export class LivesSystem {
  private static instance: LivesSystem | null = null;

  private constructor() {
    logger.info('constructor', 'LivesSystem initialized');
  }

  /**
   * Get the singleton instance of LivesSystem.
   */
  static getInstance(): LivesSystem {
    if (!LivesSystem.instance) {
      LivesSystem.instance = new LivesSystem();
    }
    return LivesSystem.instance;
  }

  /**
   * Get the current status of the lives system.
   * This is a pure calculation based on the provided progress snapshot.
   *
   * @param progress - Current player progress (from registry or SDK)
   * @returns LivesStatus with all computed values
   */
  getStatus(progress: PlayerProgress): LivesStatus {
    logger.debug('getStatus', 'Computing lives status', {
      lives: progress.lives,
      lastLifeLostAt: progress.lastLifeLostAt,
    });

    const currentLives = Math.min(Math.max(0, progress.lives), MAX_LIVES);
    const isFull = currentLives >= MAX_LIVES;

    // Calculate time until next life
    let msUntilNextLife = 0;
    let msUntilFull = 0;

    if (!isFull && progress.lastLifeLostAt) {
      const lastLostTime = new Date(progress.lastLifeLostAt).getTime();
      const now = Date.now();
      const elapsed = now - lastLostTime;

      // Time remaining for current regeneration cycle
      const cycleProgress = elapsed % LIFE_REGEN_MS;
      msUntilNextLife = LIFE_REGEN_MS - cycleProgress;

      // Total time until all lives regenerate
      const livesToRegen = MAX_LIVES - currentLives;
      msUntilFull = msUntilNextLife + (livesToRegen - 1) * LIFE_REGEN_MS;
    }

    const status: LivesStatus = {
      currentLives,
      maxLives: MAX_LIVES,
      canPlay: currentLives > 0,
      isFull,
      msUntilNextLife: isFull ? 0 : Math.max(0, msUntilNextLife),
      timeUntilNextLife: isFull ? '' : this.formatTime(msUntilNextLife),
      msUntilFull: isFull ? 0 : Math.max(0, msUntilFull),
      lastLifeLostAt: progress.lastLifeLostAt,
    };

    logger.debug('getStatus', 'Lives status computed', status);
    return status;
  }

  /**
   * Check if the player has at least 1 life and can start a level.
   *
   * @param progress - Current player progress
   * @returns true if player can play
   */
  canPlay(progress: PlayerProgress): boolean {
    const result = progress.lives > 0;
    logger.debug('canPlay', `Player can play: ${result}`, { lives: progress.lives });
    return result;
  }

  /**
   * Deduct one life from the player's progress.
   * Sets lastLifeLostAt timestamp for regeneration tracking.
   * Emits LIFE_LOST event.
   *
   * @param progress - Player progress to modify (mutated in place)
   * @returns Updated progress object
   */
  deductLife(progress: PlayerProgress): PlayerProgress {
    if (progress.lives <= 0) {
      logger.info('deductLife', 'Already at 0 lives - no deduction');
      return progress;
    }

    const previousLives = progress.lives;
    progress.lives = Math.max(0, progress.lives - 1);
    progress.lastLifeLostAt = new Date().toISOString();

    logger.info('deductLife', `Life deducted: ${previousLives} -> ${progress.lives}`, {
      lives: progress.lives,
      lastLifeLostAt: progress.lastLifeLostAt,
    });

    // Emit event for UI updates
    EventBus.emit(GameEvent.LIFE_LOST, {
      livesRemaining: progress.lives,
      timestamp: progress.lastLifeLostAt,
    });

    return progress;
  }

  /**
   * Refill lives to maximum (5/5).
   * Typically called after IAP purchase of gc_lives_refill.
   * Clears lastLifeLostAt since no regeneration is needed.
   * Emits LIVES_REFILLED event.
   *
   * @param progress - Player progress to modify (mutated in place)
   * @returns Updated progress object
   */
  refillLives(progress: PlayerProgress): PlayerProgress {
    const previousLives = progress.lives;
    progress.lives = MAX_LIVES;
    progress.lastLifeLostAt = null;

    logger.info('refillLives', `Lives refilled: ${previousLives} -> ${MAX_LIVES}`, {
      lives: progress.lives,
    });

    // Emit event for UI updates
    EventBus.emit(GameEvent.LIVES_REFILLED, {
      livesCount: MAX_LIVES,
    });

    return progress;
  }

  /**
   * Calculate and apply offline regeneration.
   * Call this when the game starts or resumes to grant lives
   * that regenerated while the player was away.
   *
   * @param progress - Player progress to modify (mutated in place)
   * @returns Updated progress object with regenerated lives applied
   */
  applyRegeneration(progress: PlayerProgress): PlayerProgress {
    // No regeneration needed if already full
    if (progress.lives >= MAX_LIVES) {
      logger.debug('applyRegeneration', 'Lives already full - no regeneration needed');
      progress.lastLifeLostAt = null;
      return progress;
    }

    // No timestamp means no pending regeneration
    if (!progress.lastLifeLostAt) {
      logger.debug('applyRegeneration', 'No lastLifeLostAt timestamp - skipping');
      return progress;
    }

    const lastLostTime = new Date(progress.lastLifeLostAt).getTime();
    const now = Date.now();
    const elapsed = now - lastLostTime;

    // Calculate how many lives have regenerated
    const livesRegenerated = Math.floor(elapsed / LIFE_REGEN_MS);

    if (livesRegenerated <= 0) {
      logger.debug('applyRegeneration', 'No lives regenerated yet', {
        elapsedMs: elapsed,
        regenTimeMs: LIFE_REGEN_MS,
      });
      return progress;
    }

    const previousLives = progress.lives;
    const newLives = Math.min(progress.lives + livesRegenerated, MAX_LIVES);
    const actualRegenerated = newLives - previousLives;

    progress.lives = newLives;

    // If now full, clear the timestamp
    if (progress.lives >= MAX_LIVES) {
      progress.lastLifeLostAt = null;
      logger.info('applyRegeneration', `Lives fully regenerated: ${previousLives} -> ${MAX_LIVES}`, {
        livesRegenerated: actualRegenerated,
      });
    } else {
      // Adjust timestamp to account for partial cycle
      // New timestamp = now - (elapsed % LIFE_REGEN_MS)
      const partialCycleMs = elapsed % LIFE_REGEN_MS;
      const adjustedTimestamp = new Date(now - partialCycleMs).toISOString();
      progress.lastLifeLostAt = adjustedTimestamp;

      logger.info('applyRegeneration', `Lives regenerated: ${previousLives} -> ${newLives}`, {
        livesRegenerated: actualRegenerated,
        adjustedTimestamp,
      });
    }

    // Emit event for each life regenerated
    if (actualRegenerated > 0) {
      EventBus.emit(GameEvent.LIFE_REGENERATED, {
        livesRegenerated: actualRegenerated,
        currentLives: progress.lives,
      });
    }

    return progress;
  }

  /**
   * Format milliseconds as MM:SS string for UI display.
   *
   * @param ms - Milliseconds to format
   * @returns Formatted string (e.g., "29:45")
   */
  formatTime(ms: number): string {
    if (ms <= 0) return '00:00';

    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const mm = String(minutes).padStart(2, '0');
    const ss = String(seconds).padStart(2, '0');

    return `${mm}:${ss}`;
  }

  /**
   * Get the regeneration time in milliseconds per life.
   * Useful for UI timers.
   */
  getRegenTimeMs(): number {
    return LIFE_REGEN_MS;
  }

  /**
   * Get the maximum number of lives.
   */
  getMaxLives(): number {
    return MAX_LIVES;
  }

  /**
   * Reset the singleton instance (for testing purposes).
   */
  static resetInstance(): void {
    LivesSystem.instance = null;
    logger.debug('resetInstance', 'LivesSystem singleton reset');
  }
}
