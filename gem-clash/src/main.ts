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
import { JestSDKWrapper } from './sdk/JestSDKWrapper';
import { AnalyticsManager } from './analytics/AnalyticsManager';

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

// Capture load start time for analytics
const loadStartTime = performance.now();

const game = new Phaser.Game(config);

// Expose game instance for testing (Playwright QA)
(window as any).__GAME__ = game;

logger.info('boot', 'Phaser.Game instance created successfully');

// ============================================================
// ANALYTICS: app_loaded event
// Fire after game instance is created, before first scene starts.
// Must wait for SDK init to get player registration status.
// ============================================================

(async () => {
  const loadEndTime = performance.now();
  const loadTimeMs = Math.round(loadEndTime - loadStartTime);

  try {
    // Initialize SDK wrapper to detect mock/live mode
    const sdk = JestSDKWrapper.getInstance();
    await sdk.init();

    // Get player registration status
    const player = await sdk.getPlayer();
    const isGuest = !player.registered;

    // Determine SDK version
    let sdkVersion = 'unknown';
    if (sdk.isMockMode()) {
      sdkVersion = 'mock';
    } else if (typeof window !== 'undefined' && window.Jest) {
      // Try to get version from SDK if available
      sdkVersion = '1.0.0'; // Default to 1.0.0 if version not exposed
    }

    // Fire app_loaded analytics event
    const analytics = AnalyticsManager.getInstance();
    await analytics.trackAppLoaded({
      load_time_ms: loadTimeMs,
      sdk_version: sdkVersion,
      is_guest: isGuest,
      phaser_version: Phaser.VERSION,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      user_agent: navigator.userAgent.substring(0, 100),
    });

    logger.info('boot', 'app_loaded analytics event fired', {
      load_time_ms: loadTimeMs,
      is_guest: isGuest,
      phaser_version: Phaser.VERSION,
    });
  } catch (err) {
    logger.error('boot', 'Failed to fire app_loaded analytics event', err);
    // Do not throw -- analytics failures should not break the game
  }
})();

logger.info('boot', '========================================');
logger.info('boot', '  Boot sequence initiated');
logger.info('boot', '========================================');

export default game;
