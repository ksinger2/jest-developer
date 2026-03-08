/**
 * Gem Link — Main Entry Point
 * Owner: Frontend Lead Engineer / Game Engineer
 * Task: TASK-002, TASK-005
 *
 * Initializes the Phaser 3 game with mobile-first configuration.
 * Registers all 7 game scenes via barrel import.
 */

import Phaser from 'phaser';
import { Logger, LogLevel } from './utils/Logger';
import {
  BootScene,
  PreloadScene,
  MainMenuScene,
  GameplayScene,
  LevelCompleteScene,
  LevelSelectScene,
  ShopScene,
} from './game/scenes';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  BACKGROUND_COLOR,
  SCENE_BOOT,
} from './utils/Constants';

// ============================================================
// BOOT LOGGING
// ============================================================

const logger = new Logger('Main');

Logger.setLevel(LogLevel.DEBUG);

logger.info('boot', '========================================');
logger.info('boot', '  Gem Link — Starting Up');
logger.info('boot', '========================================');
logger.info('boot', `Log level: DEBUG`);
logger.info('boot', `Viewport target: ${GAME_WIDTH}x${GAME_HEIGHT}`);
logger.info('boot', `Initial scene: ${SCENE_BOOT}`);

// ============================================================
// PHASER GAME CONFIGURATION
// ============================================================

/** Render at native DPI so the canvas isn't blurry when CSS-scaled */
const canvasZoom = Math.min(Math.ceil(window.devicePixelRatio || 1), 3);

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  zoom: canvasZoom,
  parent: 'game-container',
  backgroundColor: BACKGROUND_COLOR,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, PreloadScene, MainMenuScene, GameplayScene, LevelCompleteScene, LevelSelectScene, ShopScene],
  render: {
    pixelArt: false,
    antialias: true,
    /** Snap all game objects to integer pixel positions — eliminates sub-pixel text blur */
    roundPixels: true,
  },
  input: {
    activePointers: 1,
  },
};

logger.info('boot', 'Phaser config assembled', {
  type: 'AUTO',
  scaleMode: 'FIT',
  scenes: [
    'BootScene', 'PreloadScene', 'MainMenuScene', 'GameplayScene',
    'LevelCompleteScene', 'LevelSelectScene', 'ShopScene',
  ],
});

// ============================================================
// CREATE GAME INSTANCE
// ============================================================

logger.info('boot', 'Creating Phaser.Game instance...');

const game = new Phaser.Game(config);

// Expose game instance for testing (Playwright QA)
(window as any).__GAME__ = game;

logger.info('boot', 'Phaser.Game instance created successfully');
logger.info('boot', '========================================');
logger.info('boot', '  Boot sequence initiated');
logger.info('boot', '========================================');

export default game;
