/**
 * Gem Link -- MainMenuScene
 * Owner: Frontend Engineer
 * Task: 2.6
 *
 * Main menu with HUD, logo sprite, gem board preview (sprites),
 * level badge, Play button, and free gift banner.
 */

import Phaser from 'phaser';
import { Logger } from '../../utils/Logger';
import { GlButton, GlHUD, GlModal } from '../../ui/UIComponents';
import { OfferManager } from '../systems/OfferManager';
import { fadeIn, fadeTransition } from '../../ui/Transitions';
import {
  SCENE_MAIN_MENU,
  SCENE_LEVEL_SELECT,
  SCENE_SHOP,
  FONT_FAMILY,
  FONT_SIZE_XS,
  FONT_SIZE_SMALL,
  FONT_SIZE_MEDIUM,
  UI_COLOR_PRIMARY,
  UI_COLOR_SECONDARY,
  UI_COLOR_ACCENT,
  UI_COLOR_TEXT_DIM,
  UI_COLOR_DANGER,
  GRADIENT_BUTTON_SUCCESS,
  GRADIENT_BUTTON_PRIMARY,
  GAME_WIDTH,
  GAME_HEIGHT,
  GEM_TEXTURE_MAP,
  ASSET_KEY_LOGO,
  ASSET_KEY_STAR,
  ASSET_KEY_CHEST_CLOSED,
  ASSET_KEY_BG_MENU,
  ASSET_KEY_BTN_PLAY_GREEN,
  ASSET_KEY_SETTINGS,
} from '../../utils/Constants';
import { MAX_LIVES, LIFE_REGEN_MINUTES, PlayerProgress } from '../../types/game.types';
import { getPlayerProgress, setPlayerProgress } from '../../utils/RegistryHelper';
import { PlayerDataManager } from '../../sdk/PlayerDataManager';

const log = new Logger('MainMenuScene');

/** Gem board preview dimensions */
const PREVIEW_COLS = 8;
const PREVIEW_ROWS = 6;
const PREVIEW_GEM_SIZE = 26;

/** Layout constants */
const LOGO_CENTER_Y = 140;
const LOGO_MAX_WIDTH = 280;
const LOGO_MAX_HEIGHT = 140;
const SUBTITLE_Y = 219;
const LEVEL_BADGE_Y = 255;
const LEVEL_BADGE_WIDTH = 140;
const LEVEL_BADGE_HEIGHT = 28;
const LEVEL_BADGE_RADIUS = 16;
const LEVEL_BADGE_FONT_SIZE = 20;
const LEVEL_BADGE_ALPHA = 0.85;
const BOARD_PREVIEW_START_Y = 295;
const PLAY_BTN_Y = 480;
const PLAY_BTN_WIDTH = 240;
const PLAY_BTN_HEIGHT = 52;
const PLAY_PULSE_SCALE = 1.03;
const PLAY_PULSE_DURATION = 1200;
const BANNER_Y = 558;
const BANNER_WIDTH = 280;
const BANNER_HEIGHT = 44;
const BANNER_RADIUS = 12;
const BANNER_BG_ALPHA = 0.95;
const BANNER_BORDER_ALPHA = 0.5;
const BANNER_CHEST_SIZE = 30;
const BANNER_CHEST_OFFSET_X = -120;
const BANNER_CLAIM_OFFSET_X = 80;
const BANNER_PULSE_SCALE = 1.02;
const BANNER_PULSE_DURATION = 800;
const CLAIM_FONT_SIZE = 14;
const TIMER_FONT_SIZE = 12;
const VERSION_Y = 593;
const BOARD_FLOAT_DISTANCE = 4;
const BOARD_FLOAT_DURATION = 2400;

/** Color keys for gem preview grid randomization */
const GEM_COLOR_KEYS = Object.keys(GEM_TEXTURE_MAP);

export class MainMenuScene extends Phaser.Scene {
  private playButton!: GlButton;
  private progress!: PlayerProgress;
  private regenTimer?: Phaser.Time.TimerEvent;
  private regenText?: Phaser.GameObjects.Text;
  private offerManager!: OfferManager;
  private offerTimerText?: Phaser.GameObjects.Text;
  private playPulseTween?: Phaser.Tweens.Tween;
  private bannerPulseTween?: Phaser.Tweens.Tween;
  private boardFloatTween?: Phaser.Tweens.Tween;
  private offerTimerEvent?: Phaser.Time.TimerEvent;
  private bannerContainer?: Phaser.GameObjects.Container;

  constructor() {
    super({ key: SCENE_MAIN_MENU });
  }

  init(): void {
    log.info('init', 'MainMenuScene initialized');
  }

  create(): void {
    log.info('create', 'Building main menu UI');
    fadeIn(this);

    this.progress = getPlayerProgress(this.registry);
    this.applyLifeRegen();

    this.offerManager = OfferManager.getInstance();

    // Add background image if available (at depth 0)
    this.buildBackground();
    this.buildHUD();
    this.buildSettingsButton();
    this.buildLogo();
    this.buildSubtitle();
    this.buildLevelBadge();
    this.buildGemBoardPreview();
    this.buildPlayButton();
    this.buildOfferBanner();
    this.buildVersionLabel();

    this.startRegenTimer();

    log.info('create', 'Main menu ready', { level: this.progress.currentLevel, lives: this.progress.lives });
  }

  // -- Background (depth 0) ---------------------------------------------------

  private buildBackground(): void {
    // Use background image if loaded, otherwise use gradient fallback
    if (this.textures.exists(ASSET_KEY_BG_MENU)) {
      const bg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, ASSET_KEY_BG_MENU);
      // Scale to cover the viewport
      const scaleX = GAME_WIDTH / bg.width;
      const scaleY = GAME_HEIGHT / bg.height;
      bg.setScale(Math.max(scaleX, scaleY));
      bg.setDepth(0);
      log.info('buildBackground', 'Background image loaded');
    } else {
      // Gradient fallback - creates a rich purple gradient
      const gradient = this.add.graphics();
      gradient.fillGradientStyle(0x1A0A2E, 0x1A0A2E, 0x2A1A4E, 0x2A1A4E, 1);
      gradient.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      gradient.setDepth(0);
      log.debug('buildBackground', 'Using gradient fallback (bg image not loaded)');
    }
  }

  // -- HUD (y:0-44) -----------------------------------------------------------

  private buildHUD(): void {
    log.debug('buildHUD', 'Creating HUD bar');
    new GlHUD(this).onAllPlusClick(() => {
      log.info('buildHUD', 'HUD + tapped — navigating to shop');
      this.scene.start(SCENE_SHOP);
    });
  }

  // -- Settings gear (top-right corner) ----------------------------------------

  private buildSettingsButton(): void {
    if (!this.textures.exists(ASSET_KEY_SETTINGS)) return;

    const gear = this.add.image(GAME_WIDTH - 36, 32, ASSET_KEY_SETTINGS);
    const gearScale = 28 / Math.max(gear.width, gear.height);
    gear.setScale(gearScale);
    gear.setInteractive({ useHandCursor: true });
    gear.setDepth(900);
    gear.on('pointerdown', () => {
      log.info('buildSettingsButton', 'Settings gear tapped');
      this.showSettingsModal();
    });

    log.debug('buildSettingsButton', 'Settings gear placed');
  }

  // -- Logo sprite (y:76-195, centered at y=140) ------------------------------

  private buildLogo(): void {
    log.debug('buildLogo', 'Rendering logo sprite');
    const centerX = Math.round(GAME_WIDTH / 2);

    const logo = this.add.image(centerX, LOGO_CENTER_Y, ASSET_KEY_LOGO);

    // Scale proportionally to fit within max bounds
    const scaleW = LOGO_MAX_WIDTH / logo.width;
    const scaleH = LOGO_MAX_HEIGHT / logo.height;
    const scale = Math.min(scaleW, scaleH, 1);
    logo.setScale(scale);

    log.info('buildLogo', 'Logo placed', { scale, origW: logo.width, origH: logo.height });
  }

  // -- Subtitle (y:219) -------------------------------------------------------

  private buildSubtitle(): void {
    log.debug('buildSubtitle', 'Rendering subtitle text');
    const centerX = Math.round(GAME_WIDTH / 2);
    const dimColor = `#${UI_COLOR_TEXT_DIM.toString(16).padStart(6, '0')}`;

    this.add.text(centerX, SUBTITLE_Y, 'Match-3 Puzzle', {
      fontFamily: FONT_FAMILY,
      fontSize: `${FONT_SIZE_SMALL}px`,
      color: dimColor,
    }).setOrigin(0.5);
  }

  // -- Level badge + stars (y:255) --------------------------------------------

  private buildLevelBadge(): void {
    log.debug('buildLevelBadge', 'Rendering level badge and star count');
    const centerX = Math.round(GAME_WIDTH / 2);
    const totalStars = this.progress.totalStars ?? 0;

    // Purple pill background
    const badgeGfx = this.add.graphics();
    badgeGfx.fillStyle(UI_COLOR_PRIMARY, LEVEL_BADGE_ALPHA);
    badgeGfx.fillRoundedRect(
      Math.round(centerX - LEVEL_BADGE_WIDTH / 2),
      Math.round(LEVEL_BADGE_Y - LEVEL_BADGE_HEIGHT / 2),
      LEVEL_BADGE_WIDTH,
      LEVEL_BADGE_HEIGHT,
      LEVEL_BADGE_RADIUS,
    );

    // Level text on the left side of the pill
    const levelTextX = Math.round(centerX - 20);
    this.add.text(levelTextX, LEVEL_BADGE_Y, `Level ${this.progress.currentLevel}`, {
      fontFamily: FONT_FAMILY,
      fontSize: `${LEVEL_BADGE_FONT_SIZE}px`,
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Star icon + count on the right side
    const starIconX = Math.round(centerX + 35);
    const starIcon = this.add.image(starIconX, LEVEL_BADGE_Y, ASSET_KEY_STAR);
    const starIconScale = 16 / Math.max(starIcon.width, starIcon.height);
    starIcon.setScale(starIconScale);

    this.add.text(Math.round(starIconX + 14), LEVEL_BADGE_Y, `${totalStars}`, {
      fontFamily: FONT_FAMILY,
      fontSize: `${FONT_SIZE_SMALL}px`,
      color: '#FFD700',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);

    log.info('buildLevelBadge', 'Level badge rendered', {
      level: this.progress.currentLevel,
      stars: totalStars,
    });
  }

  // -- Gem board preview (y:295-430) using sprites ----------------------------

  private buildGemBoardPreview(): void {
    log.debug('buildGemBoardPreview', 'Drawing sprite-based gem grid');

    const gridWidth = PREVIEW_COLS * PREVIEW_GEM_SIZE;
    const gridHeight = PREVIEW_ROWS * PREVIEW_GEM_SIZE;
    const startX = Math.round((GAME_WIDTH - gridWidth) / 2 + PREVIEW_GEM_SIZE / 2);
    const startY = Math.round(BOARD_PREVIEW_START_Y + PREVIEW_GEM_SIZE / 2);

    const container = this.add.container(0, 0);

    for (let row = 0; row < PREVIEW_ROWS; row++) {
      for (let col = 0; col < PREVIEW_COLS; col++) {
        const x = startX + col * PREVIEW_GEM_SIZE;
        const y = startY + row * PREVIEW_GEM_SIZE;
        const colorKey = GEM_COLOR_KEYS[Math.floor(Math.random() * GEM_COLOR_KEYS.length)];
        const textureKey = GEM_TEXTURE_MAP[colorKey];

        const gem = this.add.image(x, y, textureKey);
        const gemScale = (PREVIEW_GEM_SIZE - 2) / Math.max(gem.width, gem.height);
        gem.setScale(gemScale);
        gem.setAlpha(0.85);
        container.add(gem);
      }
    }

    // Border around the grid
    const borderGfx = this.add.graphics();
    const borderPadding = 8;
    borderGfx.lineStyle(1, 0xffffff, 0.15);
    borderGfx.strokeRoundedRect(
      Math.round((GAME_WIDTH - gridWidth) / 2 - borderPadding),
      Math.round(BOARD_PREVIEW_START_Y - borderPadding),
      gridWidth + borderPadding * 2,
      gridHeight + borderPadding * 2,
      8,
    );
    container.add(borderGfx);

    // Floating animation
    this.boardFloatTween = this.tweens.add({
      targets: container,
      y: { from: 0, to: BOARD_FLOAT_DISTANCE },
      duration: BOARD_FLOAT_DURATION,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    log.info('buildGemBoardPreview', 'Gem board preview rendered', {
      cols: PREVIEW_COLS,
      rows: PREVIEW_ROWS,
      gemSize: PREVIEW_GEM_SIZE,
    });
  }

  // -- Play button (y:454-506, centered at ~480) ------------------------------

  private buildPlayButton(): void {
    log.debug('buildPlayButton', 'Creating Play button');

    if (this.textures.exists(ASSET_KEY_BTN_PLAY_GREEN)) {
      // Use the play green sprite — scale to target width for prominence
      const playSprite = this.add.image(Math.round(GAME_WIDTH / 2), PLAY_BTN_Y, ASSET_KEY_BTN_PLAY_GREEN);
      playSprite.setDisplaySize(PLAY_BTN_WIDTH, PLAY_BTN_WIDTH * (playSprite.height / playSprite.width));
      const scale = playSprite.scaleX;
      playSprite.setInteractive({ useHandCursor: true });
      playSprite.on('pointerdown', () => this.onPlayTap());

      // Pulse animation
      this.playPulseTween = this.tweens.add({
        targets: playSprite,
        scaleX: { from: scale, to: scale * PLAY_PULSE_SCALE },
        scaleY: { from: scale, to: scale * PLAY_PULSE_SCALE },
        duration: PLAY_PULSE_DURATION,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    } else {
      // Fallback to GlButton
      this.playButton = new GlButton(this, Math.round(GAME_WIDTH / 2), PLAY_BTN_Y, 'Play', {
        gradient: GRADIENT_BUTTON_SUCCESS,
        width: PLAY_BTN_WIDTH,
        height: PLAY_BTN_HEIGHT,
        fontSize: FONT_SIZE_MEDIUM,
      });
      this.playButton.onClick(() => this.onPlayTap());

      this.playPulseTween = this.tweens.add({
        targets: this.playButton,
        scaleX: { from: 1.0, to: PLAY_PULSE_SCALE },
        scaleY: { from: 1.0, to: PLAY_PULSE_SCALE },
        duration: PLAY_PULSE_DURATION,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  private onPlayTap(): void {
    log.info('onPlayTap', 'Play button tapped', { lives: this.progress.lives });

    if (this.progress.lives <= 0) {
      this.showNoLivesModal();
      return;
    }

    log.info('onPlayTap', 'Navigating to level select');
    fadeTransition(this, SCENE_LEVEL_SELECT);
  }

  // -- No-lives modal ---------------------------------------------------------

  private showNoLivesModal(): void {
    log.info('showNoLivesModal', 'Displaying no-lives dialog');

    const remaining = this.getRegenTimeRemaining();
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    const modal = new GlModal(this, { title: 'Out of Lives!' });

    const bodyText = this.add.text(0, 0, `Next life in ${timeStr}.\nBuy more lives or wait.`, {
      fontFamily: FONT_FAMILY,
      fontSize: `${FONT_SIZE_SMALL}px`,
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 260 },
    }).setOrigin(0.5, 0);
    modal.addContent(bodyText);

    const getLivesBtn = new GlButton(this, 0, 0, 'Get Lives', {
      width: 160, height: 40,
      gradient: GRADIENT_BUTTON_PRIMARY,
      fontSize: FONT_SIZE_SMALL,
    });
    getLivesBtn.onClick(() => {
      log.info('showNoLivesModal', 'User chose to get lives from shop');
      this.scene.start(SCENE_SHOP);
    });
    modal.addContent(getLivesBtn);

    modal.onClose(() => {
      log.info('showNoLivesModal', 'User chose to wait');
    });

    modal.show();
  }

  // -- Settings modal ----------------------------------------------------------

  private showSettingsModal(): void {
    log.info('showSettingsModal', 'Displaying settings dialog');

    const modal = new GlModal(this, { title: 'Settings' });

    const soundEnabled = this.registry.get('soundEnabled') !== false;

    const soundBtn = new GlButton(this, 0, 0, soundEnabled ? 'Sound: ON' : 'Sound: OFF', {
      width: 180, height: 44,
      gradient: soundEnabled ? GRADIENT_BUTTON_SUCCESS : GRADIENT_BUTTON_PRIMARY,
      fontSize: FONT_SIZE_SMALL,
    });
    soundBtn.onClick(() => {
      const newState = this.registry.get('soundEnabled') === false;
      this.registry.set('soundEnabled', newState);
      log.info('showSettingsModal', 'Sound toggled', { enabled: newState });
      modal.hide();
      this.showSettingsModal();
    });
    modal.addContent(soundBtn);

    const versionText = this.add.text(0, 0, 'Gem Link v0.3.0', {
      fontFamily: FONT_FAMILY,
      fontSize: `${FONT_SIZE_XS}px`,
      color: `#${UI_COLOR_TEXT_DIM.toString(16).padStart(6, '0')}`,
    }).setOrigin(0.5, 0);
    modal.addContent(versionText);

    modal.onClose(() => {
      log.info('showSettingsModal', 'Settings closed');
    });

    modal.show();
  }

  // -- Free Gift Banner (y:530-586, centered at y=558) ------------------------

  private buildOfferBanner(): void {
    log.debug('buildOfferBanner', 'Creating free gift banner');

    const centerX = Math.round(GAME_WIDTH / 2);
    const canClaim = this.offerManager.canCollectFreeGift(this.progress);

    this.bannerContainer = this.add.container(centerX, BANNER_Y);

    // Background: solid rounded rect (no fillGradientStyle)
    const bgGfx = this.add.graphics();
    bgGfx.fillStyle(UI_COLOR_SECONDARY, BANNER_BG_ALPHA);
    bgGfx.fillRoundedRect(
      Math.round(-BANNER_WIDTH / 2),
      Math.round(-BANNER_HEIGHT / 2),
      BANNER_WIDTH,
      BANNER_HEIGHT,
      BANNER_RADIUS,
    );
    // Gold border
    bgGfx.lineStyle(1, UI_COLOR_ACCENT, BANNER_BORDER_ALPHA);
    bgGfx.strokeRoundedRect(
      Math.round(-BANNER_WIDTH / 2),
      Math.round(-BANNER_HEIGHT / 2),
      BANNER_WIDTH,
      BANNER_HEIGHT,
      BANNER_RADIUS,
    );
    this.bannerContainer.add(bgGfx);

    // Chest sprite on the left
    const chest = this.add.image(BANNER_CHEST_OFFSET_X, 0, ASSET_KEY_CHEST_CLOSED);
    const chestScale = BANNER_CHEST_SIZE / Math.max(chest.width, chest.height);
    chest.setScale(chestScale);
    this.bannerContainer.add(chest);

    // "Free Gift!" text centered
    const labelText = this.add.text(0, -2, 'Free Gift!', {
      fontFamily: FONT_FAMILY,
      fontSize: `${FONT_SIZE_SMALL}px`,
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.bannerContainer.add(labelText);

    // Timer or CLAIM text on the right
    this.offerTimerText = this.add.text(BANNER_CLAIM_OFFSET_X, -2, '', {
      fontFamily: FONT_FAMILY,
      fontSize: `${canClaim ? CLAIM_FONT_SIZE : TIMER_FONT_SIZE}px`,
      color: canClaim ? '#FFD700' : `#${UI_COLOR_TEXT_DIM.toString(16).padStart(6, '0')}`,
      fontStyle: canClaim ? 'bold' : 'normal',
    }).setOrigin(0.5);
    this.bannerContainer.add(this.offerTimerText);

    // Interactive zone
    this.bannerContainer.setInteractive(
      new Phaser.Geom.Rectangle(
        Math.round(-BANNER_WIDTH / 2),
        Math.round(-BANNER_HEIGHT / 2),
        BANNER_WIDTH,
        BANNER_HEIGHT,
      ),
      Phaser.Geom.Rectangle.Contains,
    );
    this.bannerContainer.on('pointerdown', () => {
      log.info('buildOfferBanner', 'Free gift banner tapped');
      this.scene.start(SCENE_SHOP);
    });

    // Pulse when claimable
    if (canClaim) {
      this.bannerPulseTween = this.tweens.add({
        targets: this.bannerContainer,
        scaleX: { from: 1.0, to: BANNER_PULSE_SCALE },
        scaleY: { from: 1.0, to: BANNER_PULSE_SCALE },
        duration: BANNER_PULSE_DURATION,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    this.updateOfferTimer();

    log.info('buildOfferBanner', 'Free gift banner created', { canClaim });
  }

  private updateOfferTimer(): void {
    const remainingMs = this.offerManager.getFreeGiftTimeRemaining(this.progress);
    if (remainingMs <= 0) {
      if (this.offerTimerText) {
        this.offerTimerText.setText('CLAIM');
        this.offerTimerText.setStyle({
          fontFamily: FONT_FAMILY,
          fontSize: `${CLAIM_FONT_SIZE}px`,
          color: '#FFD700',
          fontStyle: 'bold',
        });
      }
      return;
    }

    if (this.offerTimerText) {
      this.offerTimerText.setText(this.offerManager.formatTimeRemaining(remainingMs));
      this.offerTimerText.setStyle({
        fontFamily: FONT_FAMILY,
        fontSize: `${TIMER_FONT_SIZE}px`,
        color: `#${UI_COLOR_TEXT_DIM.toString(16).padStart(6, '0')}`,
        fontStyle: 'normal',
      });
    }

    this.offerTimerEvent = this.time.delayedCall(1000, () => this.updateOfferTimer());
  }

  // -- Version label (y:586-600) ----------------------------------------------

  private buildVersionLabel(): void {
    const dimColor = `#${UI_COLOR_TEXT_DIM.toString(16).padStart(6, '0')}`;
    this.add.text(Math.round(GAME_WIDTH / 2), VERSION_Y, 'v0.3.0', {
      fontFamily: FONT_FAMILY,
      fontSize: `${FONT_SIZE_XS}px`,
      color: dimColor,
    }).setOrigin(0.5).setAlpha(0.5);
  }

  // -- Lives regeneration logic -----------------------------------------------

  private applyLifeRegen(): void {
    log.debug('applyLifeRegen', 'Checking life regeneration', { currentLives: this.progress.lives });

    if (this.progress.lives >= MAX_LIVES) {
      this.progress.lastLifeLostAt = null;
      return;
    }

    if (!this.progress.lastLifeLostAt) {
      return;
    }

    const now = Date.now();
    const lastLostTime = new Date(this.progress.lastLifeLostAt).getTime();
    const elapsed = now - lastLostTime;
    const regenIntervalMs = LIFE_REGEN_MINUTES * 60 * 1000;
    const livesRecovered = Math.floor(elapsed / regenIntervalMs);

    if (livesRecovered > 0) {
      const oldLives = this.progress.lives;
      this.progress.lives = Math.min(this.progress.lives + livesRecovered, MAX_LIVES);

      // Advance timestamp
      const newTimestamp = lastLostTime + livesRecovered * regenIntervalMs;
      this.progress.lastLifeLostAt = this.progress.lives >= MAX_LIVES
        ? null
        : new Date(newTimestamp).toISOString();

      log.info('applyLifeRegen', 'Lives regenerated', {
        recovered: livesRecovered,
        oldLives,
        newLives: this.progress.lives,
      });

      setPlayerProgress(this.registry, this.progress);
      const pdm = new PlayerDataManager();
      pdm.saveProgress(this.progress);
    }
  }

  private getRegenTimeRemaining(): number {
    if (this.progress.lives >= MAX_LIVES || !this.progress.lastLifeLostAt) {
      return 0;
    }

    const now = Date.now();
    const lastLostTime = new Date(this.progress.lastLifeLostAt).getTime();
    const elapsed = now - lastLostTime;
    const regenIntervalMs = LIFE_REGEN_MINUTES * 60 * 1000;
    const remainingMs = regenIntervalMs - (elapsed % regenIntervalMs);

    return Math.ceil(remainingMs / 1000);
  }

  private startRegenTimer(): void {
    if (this.progress.lives >= MAX_LIVES) {
      return;
    }

    log.debug('startRegenTimer', 'Starting regen display timer');

    this.regenTimer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.applyLifeRegen();
        this.updateRegenDisplay();

        if (this.progress.lives >= MAX_LIVES && this.regenTimer) {
          this.regenTimer.remove(false);
          this.regenTimer = undefined;
          log.info('startRegenTimer', 'Lives fully regenerated, stopping timer');
        }
      },
      loop: true,
    });
  }

  private updateRegenDisplay(): void {
    const remaining = this.getRegenTimeRemaining();
    if (remaining <= 0) {
      if (this.regenText) {
        this.regenText.setVisible(false);
      }
      return;
    }

    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    const timeStr = `Next life: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    const dangerColor = `#${UI_COLOR_DANGER.toString(16).padStart(6, '0')}`;

    if (!this.regenText) {
      this.regenText = this.add.text(Math.round(GAME_WIDTH / 2), 52, timeStr, {
        fontFamily: FONT_FAMILY,
        fontSize: `${FONT_SIZE_XS}px`,
        color: dangerColor,
      }).setOrigin(0.5);
    } else {
      this.regenText.setText(timeStr).setVisible(true);
    }
  }

  // -- Cleanup ----------------------------------------------------------------

  shutdown(): void {
    log.info('shutdown', 'MainMenuScene shutting down');

    if (this.regenTimer) {
      this.regenTimer.remove(false);
      this.regenTimer = undefined;
    }

    if (this.playPulseTween) {
      this.playPulseTween.destroy();
      this.playPulseTween = undefined;
    }

    if (this.bannerPulseTween) {
      this.bannerPulseTween.destroy();
      this.bannerPulseTween = undefined;
    }

    if (this.boardFloatTween) {
      this.boardFloatTween.destroy();
      this.boardFloatTween = undefined;
    }

    if (this.offerTimerEvent) {
      this.offerTimerEvent.remove(false);
      this.offerTimerEvent = undefined;
    }
  }
}
