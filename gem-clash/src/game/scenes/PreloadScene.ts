/**
 * Gem Link — PreloadScene
 * Owner: Frontend Engineer
 * Task: C06
 *
 * Branded loading screen with animated title, gradient progress bar,
 * and cycling tip text.
 */

import Phaser from 'phaser';
import { Logger } from '../../utils/Logger';
import {
  SCENE_PRELOAD,
  SCENE_MAIN_MENU,
  GAME_WIDTH,
  FONT_FAMILY,
  FONT_SIZE_SMALL,
  FONT_SIZE_MEDIUM,
  FONT_SIZE_XL,
  UI_COLOR_TEXT_DIM,
  BACKGROUND_COLOR,
  EASE_QUAD,
  GEM_TEXTURE_MAP,
  ASSET_KEY_LOGO,
  ASSET_KEY_BOMB,
  ASSET_KEY_RAINBOW,
  ASSET_KEY_COIN,
  ASSET_KEY_STAR,
  ASSET_KEY_HAMMER,
  ASSET_KEY_CHEST_CLOSED,
  ASSET_KEY_CHEST_OPEN,
  ASSET_KEY_HEART,
  ASSET_KEY_GEM,
  ASSET_KEY_RAINBOW_CIRCLE,
  ASSET_KEY_BG_GAMEPLAY,
  ASSET_KEY_BG_MENU,
  ASSET_KEY_BG_SHOP,
  ASSET_KEY_BG_LEVEL_SELECT,
  ASSET_KEY_FRAME_BOARD,
  ASSET_KEY_BTN_PLAY_GREEN,
  ASSET_KEY_ARROW_RIGHT,
  ASSET_KEY_ARROW_LEFT,
  ASSET_KEY_SETTINGS,
  ASSET_KEY_HEADER_LEVEL,
  ASSET_KEY_HEADER_SHOP,
  ASSET_KEY_PROGRESS_EMPTY,
  ASSET_KEY_PROGRESS_FULL,
  ASSET_KEY_BANNER_GREEN,
  ASSET_KEY_LEVEL_COMPLETE,
  DIGIT_TEXTURE_KEYS,
} from '../../utils/Constants';

const log = new Logger('PreloadScene');

const LOADING_TIPS = [
  'Match 3 or more gems to score!',
  'Create special gems with bigger matches',
  'Chain combos for bonus points!',
  'Use boosters when you\'re stuck',
];

const BAR_WIDTH = 260;
const BAR_HEIGHT = 22;
const BAR_RADIUS = 11;
const BAR_X = (GAME_WIDTH - BAR_WIDTH) / 2;
const BAR_Y = 300 - BAR_HEIGHT / 2;

export class PreloadScene extends Phaser.Scene {
  private barFill!: Phaser.GameObjects.Graphics;
  private pctText!: Phaser.GameObjects.Text;
  private tipText!: Phaser.GameObjects.Text;
  private tipIndex = 0;
  private tipTimer?: Phaser.Time.TimerEvent;
  private lastMilestone = -1;

  constructor() {
    super({ key: SCENE_PRELOAD });
  }

  init(): void {
    log.info('init', 'PreloadScene initialized');
  }

  preload(): void {
    log.info('preload', 'Building branded loading screen');
    this.cameras.main.setBackgroundColor(BACKGROUND_COLOR);

    // Title with slow pulse
    const title = this.add.text(GAME_WIDTH / 2, 220, 'Gem Link', {
      fontFamily: FONT_FAMILY,
      fontSize: `${FONT_SIZE_XL}px`,
      color: '#FFD700',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      scaleX: 1.03,
      scaleY: 1.03,
      duration: 1200,
      ease: EASE_QUAD,
      yoyo: true,
      loop: -1,
    });

    // Progress bar background
    const barBg = this.add.graphics();
    barBg.fillStyle(0x1a1a2e, 1);
    barBg.fillRoundedRect(BAR_X, BAR_Y, BAR_WIDTH, BAR_HEIGHT, BAR_RADIUS);

    // Progress bar fill (drawn in drawBar)
    this.barFill = this.add.graphics();

    // Percentage text
    this.pctText = this.add.text(GAME_WIDTH / 2, 340, '0%', {
      fontFamily: FONT_FAMILY,
      fontSize: `${FONT_SIZE_MEDIUM}px`,
      color: '#FFFFFF',
    }).setOrigin(0.5);

    // Loading tips (cycles every 2s)
    const dimColor = `#${UI_COLOR_TEXT_DIM.toString(16).padStart(6, '0')}`;
    this.tipText = this.add.text(GAME_WIDTH / 2, 500, LOADING_TIPS[0], {
      fontFamily: FONT_FAMILY,
      fontSize: `${FONT_SIZE_SMALL}px`,
      color: dimColor,
      align: 'center',
      wordWrap: { width: 340 },
    }).setOrigin(0.5);

    this.tipTimer = this.time.addEvent({
      delay: 2000,
      loop: true,
      callback: () => {
        this.tipIndex = (this.tipIndex + 1) % LOADING_TIPS.length;
        this.tipText.setText(LOADING_TIPS[this.tipIndex]);
      },
    });

    // Progress events
    this.load.on('progress', (value: number) => {
      this.drawBar(value);
      this.pctText.setText(`${Math.round(value * 100)}%`);
      const milestone = Math.floor(value * 4);
      if (milestone > this.lastMilestone) {
        this.lastMilestone = milestone;
        log.info('preload', `Loading ${milestone * 25}%`);
      }
    });

    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      log.error('preload', 'Asset failed (non-blocking)', { key: file.key, url: file.url });
    });

    this.load.on('complete', () => {
      log.info('preload', 'All assets loaded');
    });

    // Queue assets — Gem sprites
    for (const [_color, key] of Object.entries(GEM_TEXTURE_MAP)) {
      this.load.image(key, `assets/gems/${key}.png`);
    }

    // Queue assets — UI sprites
    this.load.image(ASSET_KEY_LOGO, `assets/ui/${ASSET_KEY_LOGO}.png`);
    this.load.image(ASSET_KEY_BOMB, `assets/ui/${ASSET_KEY_BOMB}.png`);
    this.load.image(ASSET_KEY_RAINBOW, `assets/ui/${ASSET_KEY_RAINBOW}.png`);
    this.load.image(ASSET_KEY_COIN, `assets/ui/${ASSET_KEY_COIN}.png`);
    this.load.image(ASSET_KEY_STAR, `assets/ui/${ASSET_KEY_STAR}.png`);
    this.load.image(ASSET_KEY_HAMMER, `assets/ui/${ASSET_KEY_HAMMER}.png`);
    this.load.image(ASSET_KEY_CHEST_CLOSED, `assets/ui/${ASSET_KEY_CHEST_CLOSED}.png`);
    this.load.image(ASSET_KEY_CHEST_OPEN, `assets/ui/${ASSET_KEY_CHEST_OPEN}.png`);
    this.load.image(ASSET_KEY_HEART, `assets/ui/${ASSET_KEY_HEART}.png`);
    this.load.image(ASSET_KEY_GEM, `assets/ui/${ASSET_KEY_GEM}.png`);
    this.load.image(ASSET_KEY_RAINBOW_CIRCLE, `assets/ui/${ASSET_KEY_RAINBOW_CIRCLE}.png`);

    // Queue assets — Background images (optional - graceful failure)
    this.load.image(ASSET_KEY_BG_GAMEPLAY, 'assets/backgrounds/bg_gameplay.png');
    this.load.image(ASSET_KEY_BG_MENU, 'assets/backgrounds/bg_menu.png');
    this.load.image(ASSET_KEY_BG_SHOP, 'assets/backgrounds/bg_shop.png');
    this.load.image(ASSET_KEY_BG_LEVEL_SELECT, 'assets/backgrounds/bg_level_select.png');

    // Queue assets — Frame images (optional - graceful failure)
    this.load.image(ASSET_KEY_FRAME_BOARD, 'assets/frames/frame_board.png');

    // Queue assets — UI sprite assets (promoted from extras)
    this.load.image(ASSET_KEY_BTN_PLAY_GREEN, 'assets/ui/btn_play_green.png');
    this.load.image(ASSET_KEY_ARROW_RIGHT, 'assets/ui/icon_arrow_right.png');
    this.load.image(ASSET_KEY_ARROW_LEFT, 'assets/ui/icon_arrow_left.png');
    this.load.image(ASSET_KEY_SETTINGS, 'assets/ui/icon_settings.png');
    this.load.image(ASSET_KEY_HEADER_LEVEL, 'assets/ui/header_level.png');
    this.load.image(ASSET_KEY_HEADER_SHOP, 'assets/ui/header_shop.png');
    this.load.image(ASSET_KEY_PROGRESS_EMPTY, 'assets/ui/progress_bar_empty.png');
    this.load.image(ASSET_KEY_PROGRESS_FULL, 'assets/ui/progress_bar_full.png');
    this.load.image(ASSET_KEY_BANNER_GREEN, 'assets/ui/banner_green.png');
    this.load.image(ASSET_KEY_LEVEL_COMPLETE, 'assets/ui/level_complete.png');

    // Queue assets — Digit sprites (0-9)
    for (const key of DIGIT_TEXTURE_KEYS) {
      this.load.image(key, `assets/typography/${key}.png`);
    }

    // Queue assets — Level data
    this.load.json('levels', 'assets/levels/levels.json');
    log.info('preload', 'Asset queue ready — 6 gems, 21 UI, 10 digits, 4 backgrounds, 1 frame, 1 JSON');
  }

  create(): void {
    log.info('create', 'Preload complete, transitioning to main menu');
    if (this.tipTimer) this.tipTimer.destroy();
    this.scene.start(SCENE_MAIN_MENU);
  }

  private drawBar(progress: number): void {
    this.barFill.clear();
    if (progress <= 0) return;
    const fillW = Math.max(BAR_HEIGHT, BAR_WIDTH * progress);
    this.barFill.fillGradientStyle(0xFFD700, 0xFFA500, 0xFFD700, 0xFFA500, 1, 1, 1, 1);
    this.barFill.fillRoundedRect(BAR_X, BAR_Y, fillW, BAR_HEIGHT, BAR_RADIUS);
  }
}
