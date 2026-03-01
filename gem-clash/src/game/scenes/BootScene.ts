/**
 * Gem Link — BootScene
 * Owner: Game Engineer
 * Task: TASK-005
 *
 * Initial scene responsible for:
 * 1. SDK initialization (detects window.Jest for live vs mock mode)
 * 2. Loading saved PlayerProgress from Jest (or defaults for new players)
 * 3. Storing progress into Phaser registry for scene access
 * 4. Transitioning to PreloadScene
 */

import Phaser from 'phaser';
import { Logger } from '../../utils/Logger';
import { SCENE_BOOT, SCENE_PRELOAD } from '../../utils/Constants';
import { DEFAULT_PLAYER_PROGRESS } from '../../types/game.types';
import { setPlayerProgress } from '../../utils/RegistryHelper';
import { JestSDKWrapper } from '../../sdk/JestSDKWrapper';
import { PlayerDataManager } from '../../sdk/PlayerDataManager';

export class BootScene extends Phaser.Scene {
  private logger = new Logger('BootScene');

  constructor() {
    super({ key: SCENE_BOOT });
    this.logger.info('constructor', 'BootScene instance created');
  }

  init(): void {
    this.logger.info('init', 'BootScene entered — no data expected');
    this.logger.debug('init', 'Game dimensions', {
      width: this.scale.width,
      height: this.scale.height,
    });
  }

  async create(): Promise<void> {
    this.logger.info('create', 'BootScene create phase started');

    try {
      // Step 1: Initialize the Jest SDK wrapper
      this.logger.info('create', 'Initializing Jest SDK wrapper');
      const sdkWrapper = JestSDKWrapper.getInstance();
      await sdkWrapper.init();

      const isMock = sdkWrapper.isMockMode();
      this.logger.info('create', `SDK mode: ${isMock ? 'MOCK' : 'LIVE'}`);

      // Step 2: Load saved player progress from Jest (or defaults)
      this.logger.info('create', 'Loading player progress from Jest');
      const pdm = new PlayerDataManager();
      const progress = await pdm.loadProgress();

      this.logger.info('create', 'Player progress loaded', {
        currentLevel: progress.currentLevel,
        lives: progress.lives,
        totalStars: progress.totalStars,
        sdkMode: isMock ? 'MOCK' : 'LIVE',
      });

      // Step 3: Store into Phaser registry for scene access
      setPlayerProgress(this.registry, progress);
      this.logger.info('create', 'Player progress stored in registry');

      // Step 4: Signal game ready to Jest platform
      if (!isMock) {
        await sdkWrapper.gameReady();
      }

      // Step 5: Transition to PreloadScene
      this.logger.info('create', `Transitioning to ${SCENE_PRELOAD}`);
      this.scene.start(SCENE_PRELOAD);

      this.logger.info('create', 'BootScene create phase complete');
    } catch (err: unknown) {
      this.logger.error('create', 'Fatal error during boot — falling back to defaults', err);

      // Fallback: load defaults and continue anyway
      setPlayerProgress(this.registry, { ...DEFAULT_PLAYER_PROGRESS });
      this.scene.start(SCENE_PRELOAD);
    }
  }
}
