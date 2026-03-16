/**
 * Gem Link -- Player Data Manager
 * Owner: Frontend Lead Engineer
 * Task: TASK-003
 *
 * Higher-level abstraction over JestSDKWrapper for typed player data CRUD.
 * Handles serialization, deserialization, schema validation, and the 1MB
 * Jest playerData storage limit.
 */

import { Logger } from '../utils/Logger';
import {
  PlayerProgress,
  DEFAULT_PLAYER_PROGRESS,
} from '../types/game.types';
import { JestSDKWrapper } from './JestSDKWrapper';

/** Key used to store player progress in Jest playerData */
const PROGRESS_KEY = 'playerProgress';

/** Jest playerData storage limit in bytes */
const MAX_DATA_BYTES = 1_048_576; // 1 MB

/** Warning threshold -- log a warning when data exceeds 80% of the limit */
const WARN_THRESHOLD_BYTES = Math.floor(MAX_DATA_BYTES * 0.8);

export class PlayerDataManager {
  private logger = new Logger('PlayerDataManager');
  private sdk: JestSDKWrapper;

  constructor() {
    this.sdk = JestSDKWrapper.getInstance();
  }

  /**
   * Load the player's progress from Jest playerData.
   * Returns DEFAULT_PLAYER_PROGRESS if no data exists or if the data fails
   * schema validation.
   */
  async loadProgress(): Promise<PlayerProgress> {
    this.logger.debug('loadProgress', 'Loading player progress from SDK');

    try {
      if (this.sdk.isMockMode()) {
        this.logger.info('loadProgress', '[MOCK] Returning default player progress');
        return { ...DEFAULT_PLAYER_PROGRESS };
      }

      const data = await this.sdk.getPlayerData([PROGRESS_KEY]);
      const raw = data[PROGRESS_KEY];

      if (!raw) {
        this.logger.info('loadProgress', 'No existing progress found, returning defaults');
        return { ...DEFAULT_PLAYER_PROGRESS };
      }

      const progress = this.parseProgress(raw);

      if (!this.validateProgress(progress)) {
        this.logger.warn('loadProgress', 'Progress data failed validation, returning defaults', { raw });
        return { ...DEFAULT_PLAYER_PROGRESS };
      }

      this.logger.info('loadProgress', 'Player progress loaded successfully', {
        currentLevel: progress.currentLevel,
        totalStars: progress.totalStars,
      });
      return progress;
    } catch (err) {
      this.logger.error('loadProgress', 'Failed to load player progress', err);
      return { ...DEFAULT_PLAYER_PROGRESS };
    }
  }

  /**
   * Save the player's progress to Jest playerData.
   * Validates the data and checks storage size before writing.
   *
   * @param flush - If true, immediately flush data to server (for critical saves)
   */
  async saveProgress(progress: PlayerProgress, flush = false): Promise<void> {
    this.logger.debug('saveProgress', 'Saving player progress', {
      currentLevel: progress.currentLevel,
      totalStars: progress.totalStars,
      flush,
    });

    try {
      if (!this.validateProgress(progress)) {
        this.logger.error('saveProgress', 'Refusing to save invalid progress data');
        return;
      }

      const sizeBytes = this.estimateSizeBytes(progress);
      if (sizeBytes > WARN_THRESHOLD_BYTES) {
        this.logger.warn('saveProgress', `Data size approaching 1MB limit: ${sizeBytes} bytes (${Math.round(sizeBytes / MAX_DATA_BYTES * 100)}%)`, {
          sizeBytes,
          maxBytes: MAX_DATA_BYTES,
        });
      }

      if (sizeBytes > MAX_DATA_BYTES) {
        this.logger.error('saveProgress', `Data exceeds 1MB limit: ${sizeBytes} bytes. Save aborted.`);
        return;
      }

      await this.sdk.setPlayerData({ [PROGRESS_KEY]: progress });
      this.logger.info('saveProgress', 'Player progress saved successfully', {
        sizeBytes,
      });

      // Flush to server if requested (for critical saves like level complete, purchases)
      if (flush) {
        await this.sdk.flushPlayerData();
        this.logger.info('saveProgress', 'Player data flushed to server');
      }
    } catch (err) {
      this.logger.error('saveProgress', 'Failed to save player progress', err);
    }
  }

  /**
   * Flush any pending player data changes to the server immediately.
   * Call this on app pause/exit or after critical saves.
   */
  async flush(): Promise<void> {
    this.logger.debug('flush', 'Flushing player data to server');
    await this.sdk.flushPlayerData();
  }

  /**
   * Estimate the byte size of the current progress data when serialized to JSON.
   */
  getProgressSizeBytes(progress: PlayerProgress): number {
    this.logger.debug('getProgressSizeBytes', 'Estimating progress data size');

    const sizeBytes = this.estimateSizeBytes(progress);
    this.logger.info('getProgressSizeBytes', `Progress data size: ${sizeBytes} bytes`, {
      sizeBytes,
      percentOfLimit: Math.round((sizeBytes / MAX_DATA_BYTES) * 100),
    });
    return sizeBytes;
  }

  /**
   * Reset player progress to defaults (for debug/testing).
   */
  async resetProgress(): Promise<void> {
    this.logger.debug('resetProgress', 'Resetting player progress to defaults');

    try {
      await this.sdk.setPlayerData({ [PROGRESS_KEY]: { ...DEFAULT_PLAYER_PROGRESS } });
      this.logger.info('resetProgress', 'Player progress reset to defaults');
    } catch (err) {
      this.logger.error('resetProgress', 'Failed to reset player progress', err);
    }
  }

  // ------------------------------------------------------------------
  // Private helpers
  // ------------------------------------------------------------------

  /** Parse raw SDK data into a PlayerProgress object */
  private parseProgress(raw: unknown): PlayerProgress {
    // The SDK stores objects as-is, so the raw value should already be the
    // correct shape. We cast after validation.
    return raw as PlayerProgress;
  }

  /** Basic schema validation for PlayerProgress */
  private validateProgress(progress: PlayerProgress): boolean {
    if (!progress || typeof progress !== 'object') return false;
    if (typeof progress.schemaVersion !== 'number') return false;
    if (typeof progress.currentLevel !== 'number') return false;
    if (typeof progress.totalStars !== 'number') return false;
    if (typeof progress.lives !== 'number') return false;
    if (typeof progress.tutorialComplete !== 'boolean') return false;
    if (!progress.settings || typeof progress.settings !== 'object') return false;
    if (typeof progress.settings.soundEnabled !== 'boolean') return false;
    if (typeof progress.settings.musicEnabled !== 'boolean') return false;
    return true;
  }

  /** Estimate byte size of an object via JSON serialization */
  private estimateSizeBytes(data: unknown): number {
    try {
      return new TextEncoder().encode(JSON.stringify(data)).length;
    } catch {
      return 0;
    }
  }
}
