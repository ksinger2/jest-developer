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
import { GlButton, GlHUD, GlModal, GlPanel } from '../../ui/UIComponents';
import { fadeIn, fadeTransition } from '../../ui/Transitions';
import { AnalyticsManager } from '../../analytics/AnalyticsManager';
import { setupHighDPICamera } from '../../utils/HighDPI';
import { DebugOverlay } from './DebugOverlay';
import {
  SCENE_MAIN_MENU,
  SCENE_LEVEL_SELECT,
  SCENE_SHOP,
  FONT_FAMILY,
  FONT_SIZE_XS,
  FONT_SIZE_SMALL,
  FONT_SIZE_HUD,
  UI_COLOR_PRIMARY,
  UI_COLOR_TEXT_TERTIARY,
  UI_COLOR_DANGER,
  GRADIENT_BUTTON_SUCCESS,
  GRADIENT_BUTTON_PRIMARY,
  GAME_WIDTH,
  GAME_HEIGHT,
  GEM_TEXTURE_MAP,
  ASSET_KEY_LOGO,
  ASSET_KEY_SOUND_ON,
  ASSET_KEY_SOUND_OFF,
  ASSET_KEY_BG_MENU,
  ASSET_KEY_BTN_PLAY_GREEN,
  ASSET_KEY_SETTINGS,
  ASSET_KEY_BTN_SHOP,
} from '../../utils/Constants';
import { MAX_LIVES, LIFE_REGEN_MINUTES, PlayerProgress } from '../../types/game.types';
import { getPlayerProgress, setPlayerProgress } from '../../utils/RegistryHelper';
import { PlayerDataManager } from '../../sdk/PlayerDataManager';

const log = new Logger('MainMenuScene');

/** Gem board preview dimensions */
const PREVIEW_COLS = 8;
const PREVIEW_ROWS = 6;
const PREVIEW_GEM_SIZE = 30;      // Larger gem size
const PREVIEW_GEM_SPACING = 32;   // Spacing between gem centers

/**
 * Per-gem visual scale adjustments.
 * Different gems have different visual content sizes within their 128x128 bounding boxes.
 * These multipliers compensate to make them appear uniform in size.
 * Values > 1 make the gem appear larger, < 1 make it smaller.
 */
const GEM_VISUAL_SCALE: Record<string, number> = {
  gem_heart: 1.0,      // Heart fills its box well - reference size
  gem_diamond: 1.15,   // Diamond has more whitespace - scale up
  gem_square: 0.95,    // Square fills more - scale down slightly
  gem_hexagon: 1.0,    // New hexagon gem (replaces triangle)
  gem_circle: 1.0,     // Circle is balanced
  gem_oval: 1.0,       // New oval gem (replaces star)
};

/** Main panel constants */
const PANEL_CENTER_X = 195;
const PANEL_CENTER_Y = 290;
const PANEL_WIDTH = 340;
const PANEL_HEIGHT = 380;

/** Panel-relative layout constants (relative to panel center) */
const LOGO_OFFSET_Y = -185;       // Moved up 25px
const LOGO_MAX_WIDTH = 520;       // 2x larger logo
const LOGO_MAX_HEIGHT = 220;
const LEVEL_BADGE_OFFSET_Y = -90; // Moved up another 15px
const LEVEL_BADGE_WIDTH = 80;
const LEVEL_BADGE_HEIGHT = 24;
const LEVEL_BADGE_RADIUS = 14;
const LEVEL_BADGE_FONT_SIZE = 13;
const LEVEL_BADGE_ALPHA = 0.9;
const BOARD_PREVIEW_OFFSET_Y = 50;
const PLAY_BTN_OFFSET_Y = 190;    // Moved down 15px
const PLAY_BTN_WIDTH = 110;       // Smaller play button
const PLAY_BTN_HEIGHT = 44;
const PLAY_PULSE_SCALE = 1.03;
const PLAY_PULSE_DURATION = 1200;
const BANNER_Y = 535;           // Below play button
const SHOP_BTN_SCALE = 0.18;    // Shop button scale (1024px image → ~184px wide)
const SHOP_BTN_Y = BANNER_Y + 15; // Moved down slightly

/** Color keys for gem preview grid randomization */
const GEM_COLOR_KEYS = Object.keys(GEM_TEXTURE_MAP);

export class MainMenuScene extends Phaser.Scene {
  private playButton!: GlButton;
  private progress!: PlayerProgress;
  private regenTimer?: Phaser.Time.TimerEvent;
  private regenText?: Phaser.GameObjects.Text;
  private playPulseTween?: Phaser.Tweens.Tween;
  private bannerPulseTween?: Phaser.Tweens.Tween;
  private bannerContainer?: Phaser.GameObjects.Container;
  private mainPanel?: GlPanel;
  private debugOverlay?: DebugOverlay;
  private logoSprite?: Phaser.GameObjects.Image;
  private playSprite?: Phaser.GameObjects.Image;
  private gemBoardContainer?: Phaser.GameObjects.Container;
  private levelBadgeContainer?: Phaser.GameObjects.Container;


  /** Guard flag to prevent session_started from firing multiple times */
  private static sessionStartedFired = false;

  constructor() {
    super({ key: SCENE_MAIN_MENU });
  }

  init(): void {
    log.info('init', 'MainMenuScene initialized');
  }

  create(): void {
    log.info('create', 'Building main menu UI');

    // Set up high-DPI camera for crisp rendering
    setupHighDPICamera(this);

    fadeIn(this);

    this.progress = getPlayerProgress(this.registry);
    this.applyLifeRegen();

    // Add background image if available (at depth 0)
    this.buildBackground();
    this.buildHUD();
    this.buildSettingsButton();

    // Build main content panel with all centered elements
    this.buildMainPanel();

    // Elements outside the panel
    this.buildOfferBanner();
    this.buildVersionLabel();

    this.startRegenTimer();

    // Fire session_started analytics (once per session)
    this.fireSessionStartedAnalytics();

    // Enable debug overlay - Press 'D' to toggle, click to select, arrows to move
    this.setupDebugOverlay();

    log.info('create', 'Main menu ready', { level: this.progress.currentLevel, lives: this.progress.lives });
  }

  private setupDebugOverlay(): void {
    this.debugOverlay = new DebugOverlay(this);

    // Register elements that can be moved
    if (this.logoSprite) {
      this.debugOverlay.registerElement('Logo', this.logoSprite);
    }
    if (this.gemBoardContainer) {
      this.debugOverlay.registerElement('Gem Board', this.gemBoardContainer);
    }
    if (this.levelBadgeContainer) {
      this.debugOverlay.registerElement('Level Badge', this.levelBadgeContainer);
    }
    if (this.playSprite) {
      this.debugOverlay.registerElement('Play Button', this.playSprite);
    }
    if (this.bannerContainer) {
      this.debugOverlay.registerElement('Free Gift Banner', this.bannerContainer);
    }

    log.info('setupDebugOverlay', 'Debug overlay ready - Press D to toggle');
  }

  /**
   * Fire session_started analytics event.
   * Uses a static flag to ensure it only fires once per session.
   */
  private fireSessionStartedAnalytics(): void {
    if (MainMenuScene.sessionStartedFired) {
      log.debug('fireSessionStartedAnalytics', 'session_started already fired this session, skipping');
      return;
    }

    MainMenuScene.sessionStartedFired = true;

    const isReturning = this.progress.currentLevel > 1 || this.progress.totalStars > 0;

    // Calculate days since last session if we have lastLifeLostAt (approximate session tracking)
    let daysSinceLastSession: number | undefined;
    if (this.progress.lastLifeLostAt) {
      const lastSessionTime = new Date(this.progress.lastLifeLostAt).getTime();
      const now = Date.now();
      const daysDiff = Math.floor((now - lastSessionTime) / (1000 * 60 * 60 * 24));
      if (daysDiff > 0) {
        daysSinceLastSession = daysDiff;
      }
    }

    const analytics = AnalyticsManager.getInstance();
    analytics.trackSessionStarted({
      is_returning: isReturning,
      current_level: this.progress.currentLevel,
      total_stars: this.progress.totalStars,
      lives_remaining: this.progress.lives,
      days_since_last_session: daysSinceLastSession,
      has_incomplete_level: false, // Phase 1: no incomplete level tracking
    }).catch((err) => {
      log.error('fireSessionStartedAnalytics', 'Failed to fire session_started', err);
    });

    log.info('fireSessionStartedAnalytics', 'session_started analytics event fired', {
      is_returning: isReturning,
      current_level: this.progress.currentLevel,
      total_stars: this.progress.totalStars,
      lives_remaining: this.progress.lives,
    });
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
      // Gradient fallback - per design system: #1A0533 to #0D1B2A for main menu
      const gradient = this.add.graphics();
      gradient.fillGradientStyle(0x1A0533, 0x1A0533, 0x0D1B2A, 0x0D1B2A, 1);
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
    if (!this.textures.exists(ASSET_KEY_SETTINGS)) {
      log.warn('buildSettingsButton', 'Settings texture not found, skipping');
      return;
    }

    // Per design system: IconButton (medium, 48px), top-right corner, 12px inset from edges
    // Position below HUD (which is ~50px tall) with proper spacing
    const gearSize = 48;      // Medium IconButton per design system
    const iconSize = 22;      // Icon size for medium IconButton
    const inset = 12;         // 12px inset from edges per design
    const gearX = GAME_WIDTH - inset - gearSize / 2;
    const gearY = 30 + gearSize / 2;  // Moved up 10px

    // Add a subtle circular background for visibility against busy backgrounds
    const gearBg = this.add.graphics();
    // Transparent background, no border
    gearBg.fillStyle(0xFFFFFF, 0.05);
    gearBg.fillCircle(gearX, gearY, gearSize / 2);
    gearBg.setDepth(899);

    const gear = this.add.image(gearX, gearY, ASSET_KEY_SETTINGS);
    const gearScale = iconSize / Math.max(gear.width, gear.height);
    gear.setScale(gearScale);
    gear.setDepth(900);

    // Make the entire touch area 48x48 for accessibility (44px minimum)
    const hitArea = this.add.zone(gearX, gearY, gearSize, gearSize);
    hitArea.setInteractive({ useHandCursor: true });
    hitArea.on('pointerdown', () => {
      log.info('buildSettingsButton', 'Settings gear tapped');
      this.showSettingsModal();
    });
    hitArea.setDepth(901);

    log.debug('buildSettingsButton', 'Settings gear placed', { x: gearX, y: gearY, size: gearSize });
  }

  // -- Main Panel (contains logo, subtitle, level badge, gem board, play button) --

  private buildMainPanel(): void {
    log.debug('buildMainPanel', 'Creating main content panel');

    // Create the panel container - transparent, no visible background
    this.mainPanel = new GlPanel(this, PANEL_CENTER_X, PANEL_CENTER_Y, {
      width: PANEL_WIDTH,
      height: PANEL_HEIGHT,
      backgroundColor: 0x000000,
      backgroundAlpha: 0,             // Fully transparent - no visible panel
      borderRadius: 0,
      borderWidth: 0,
      shadow: false,
    });

    // Build all panel content with relative positioning
    this.buildLogoInPanel();
    this.buildSubtitleInPanel();
    this.buildLevelBadgeInPanel();
    this.buildGemBoardInPanel();
    this.buildPlayButtonInPanel();

    log.info('buildMainPanel', 'Main panel created with all content');
  }

  // -- Logo sprite (relative to panel center) ---------------------------------

  private buildLogoInPanel(): void {
    log.debug('buildLogoInPanel', 'Rendering logo sprite in panel');

    this.logoSprite = this.add.image(0, LOGO_OFFSET_Y, ASSET_KEY_LOGO);

    // Scale proportionally to fit within max bounds
    const scaleW = LOGO_MAX_WIDTH / this.logoSprite.width;
    const scaleH = LOGO_MAX_HEIGHT / this.logoSprite.height;
    const scale = Math.min(scaleW, scaleH);
    this.logoSprite.setScale(scale);

    this.mainPanel!.addContent(this.logoSprite);

    log.info('buildLogoInPanel', 'Logo placed in panel', { scale, origW: this.logoSprite.width, origH: this.logoSprite.height });
  }

  // -- Subtitle (relative to panel center) ------------------------------------

  private buildSubtitleInPanel(): void {
    log.debug('buildSubtitleInPanel', 'Rendering subtitle text in panel');

    // Match-3 Puzzle subtitle removed per design feedback
  }

  // -- Level badge + stars (relative to panel center) -------------------------

  private buildLevelBadgeInPanel(): void {
    log.debug('buildLevelBadgeInPanel', 'Rendering level badge in panel');

    // Create a container for the badge elements (centered)
    this.levelBadgeContainer = this.add.container(0, LEVEL_BADGE_OFFSET_Y);
    const badgeContainer = this.levelBadgeContainer;

    // Purple pill background
    const badgeGfx = this.add.graphics();
    badgeGfx.fillStyle(UI_COLOR_PRIMARY, LEVEL_BADGE_ALPHA);
    badgeGfx.fillRoundedRect(
      Math.round(-LEVEL_BADGE_WIDTH / 2),
      Math.round(-LEVEL_BADGE_HEIGHT / 2),
      LEVEL_BADGE_WIDTH,
      LEVEL_BADGE_HEIGHT,
      LEVEL_BADGE_RADIUS,
    );
    badgeContainer.add(badgeGfx);

    // Level text centered
    const levelText = this.add.text(0, 0, `Level ${this.progress.currentLevel}`, {
      fontFamily: FONT_FAMILY,
      fontSize: `${LEVEL_BADGE_FONT_SIZE}px`,
      color: '#ffffff',
      fontStyle: 'bold',
      shadow: {
        offsetX: 1,
        offsetY: 1,
        blur: 2,
        color: '#000000',
        fill: true,
      },
    }).setOrigin(0.5).setResolution(4);
    badgeContainer.add(levelText);

    this.mainPanel!.addContent(badgeContainer);

    log.info('buildLevelBadgeInPanel', 'Level badge rendered in panel', {
      level: this.progress.currentLevel,
    });
  }

  // -- Gem board preview (relative to panel center) ---------------------------

  private buildGemBoardInPanel(): void {
    log.debug('buildGemBoardInPanel', 'Drawing sprite-based gem grid in panel');

    const gridWidth = PREVIEW_COLS * PREVIEW_GEM_SPACING;
    const gridHeight = PREVIEW_ROWS * PREVIEW_GEM_SPACING;

    // Container for the gem board, positioned relative to panel center
    this.gemBoardContainer = this.add.container(0, BOARD_PREVIEW_OFFSET_Y);
    const boardContainer = this.gemBoardContainer;

    // Gems positioned relative to board container center
    const startX = Math.round(-gridWidth / 2 + PREVIEW_GEM_SPACING / 2);
    const startY = Math.round(-gridHeight / 2 + PREVIEW_GEM_SPACING / 2);

    for (let row = 0; row < PREVIEW_ROWS; row++) {
      for (let col = 0; col < PREVIEW_COLS; col++) {
        const x = startX + col * PREVIEW_GEM_SPACING;
        const y = startY + row * PREVIEW_GEM_SPACING;
        const colorKey = GEM_COLOR_KEYS[Math.floor(Math.random() * GEM_COLOR_KEYS.length)];
        const textureKey = GEM_TEXTURE_MAP[colorKey];

        const gem = this.add.image(x, y, textureKey);
        // Apply base scale plus per-gem visual adjustment
        const baseScale = (PREVIEW_GEM_SIZE - 2) / Math.max(gem.width, gem.height);
        const visualAdjust = GEM_VISUAL_SCALE[textureKey] ?? 1.0;
        gem.setScale(baseScale * visualAdjust);
        gem.setAlpha(0.85);
        boardContainer.add(gem);
      }
    }


    this.mainPanel!.addContent(boardContainer);

    log.info('buildGemBoardInPanel', 'Gem board preview rendered in panel', {
      cols: PREVIEW_COLS,
      rows: PREVIEW_ROWS,
      gemSize: PREVIEW_GEM_SIZE,
    });
  }

  // -- Play button (relative to panel center) ---------------------------------

  private buildPlayButtonInPanel(): void {
    log.debug('buildPlayButtonInPanel', 'Creating Play button in panel');

    if (this.textures.exists(ASSET_KEY_BTN_PLAY_GREEN)) {
      // Use the play green sprite — scale to target width for prominence
      this.playSprite = this.add.image(0, PLAY_BTN_OFFSET_Y, ASSET_KEY_BTN_PLAY_GREEN);
      this.playSprite.setDisplaySize(PLAY_BTN_WIDTH, PLAY_BTN_HEIGHT);
      const scale = this.playSprite.scaleX;
      this.playSprite.setInteractive({ useHandCursor: true });
      this.playSprite.on('pointerdown', () => this.onPlayTap());

      this.mainPanel!.addContent(this.playSprite);

      // Pulse animation
      this.playPulseTween = this.tweens.add({
        targets: this.playSprite,
        scaleX: { from: scale, to: scale * PLAY_PULSE_SCALE },
        scaleY: { from: scale, to: scale * PLAY_PULSE_SCALE },
        duration: PLAY_PULSE_DURATION,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    } else {
      // Fallback to GlButton - need to create it at panel position
      // Per design system: PrimaryButton Large uses 16px font
      this.playButton = new GlButton(this, PANEL_CENTER_X, PANEL_CENTER_Y + PLAY_BTN_OFFSET_Y, 'Play', {
        gradient: GRADIENT_BUTTON_SUCCESS,
        width: PLAY_BTN_WIDTH,
        height: PLAY_BTN_HEIGHT,
        fontSize: FONT_SIZE_HUD,  // 16px for large button
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
    }).setOrigin(0.5, 0).setResolution(4);
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

    // Add spacer to push content down
    const spacer = this.add.text(0, 0, '', { fontSize: '1px' });
    modal.addContent(spacer, 40);

    const soundEnabled = this.registry.get('soundEnabled') !== false;

    // Sound toggle - fixed icon size for both states
    const soundIconKey = soundEnabled ? ASSET_KEY_SOUND_ON : ASSET_KEY_SOUND_OFF;
    const soundContainer = this.add.container(-40, 0);  // Left-aligned

    const SOUND_ICON_SIZE = 40;  // Fixed size for both icons
    const soundIcon = this.add.image(0, 0, soundIconKey);
    soundIcon.setDisplaySize(SOUND_ICON_SIZE, SOUND_ICON_SIZE);
    soundContainer.add(soundIcon);

    const soundLabel = this.add.text(SOUND_ICON_SIZE / 2 + 12, 0, soundEnabled ? 'Sound ON' : 'Sound OFF', {
      fontFamily: FONT_FAMILY,
      fontSize: '14px',
      color: '#FFFFFF',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5).setResolution(4);
    soundContainer.add(soundLabel);

    soundContainer.setSize(160, 50);
    soundContainer.setInteractive({ useHandCursor: true });
    soundContainer.on('pointerdown', () => {
      const newState = this.registry.get('soundEnabled') === false;
      this.registry.set('soundEnabled', newState);
      log.info('showSettingsModal', 'Sound toggled', { enabled: newState });
      // Swap icon and label - keep same display size
      const newIconKey = newState ? ASSET_KEY_SOUND_ON : ASSET_KEY_SOUND_OFF;
      soundIcon.setTexture(newIconKey);
      soundIcon.setDisplaySize(SOUND_ICON_SIZE, SOUND_ICON_SIZE);
      soundLabel.setText(newState ? 'Sound ON' : 'Sound OFF');
    });
    soundContainer.on('pointerover', () => soundIcon.setAlpha(0.8));
    soundContainer.on('pointerout', () => soundIcon.setAlpha(1));

    modal.addContent(soundContainer, 20);

    // Spacer before version
    const spacer2 = this.add.text(0, 0, '', { fontSize: '1px' });
    modal.addContent(spacer2, 30);

    // Per design system: text-tiny (11px), color-text-tertiary (#888888)
    const versionText = this.add.text(0, 0, 'Gem Link v0.3.0', {
      fontFamily: FONT_FAMILY,
      fontSize: `${FONT_SIZE_XS}px`,
      color: `#${UI_COLOR_TEXT_TERTIARY.toString(16).padStart(6, '0')}`,
    }).setOrigin(0.5, 0).setResolution(4);
    modal.addContent(versionText, 20);

    modal.onClose(() => {
      log.info('showSettingsModal', 'Settings closed');
    });

    modal.show();
  }

  // -- Shop Button (below play button) ----------------------------------------

  private buildOfferBanner(): void {
    log.debug('buildOfferBanner', 'Creating shop button');

    const centerX = Math.round(GAME_WIDTH / 2);
    this.buildShopButton(centerX);
  }

  /** Build the shop button below free gift banner using image asset */
  private buildShopButton(freeGiftCenterX: number): void {
    // Position shop button centered below free gift
    const shopX = freeGiftCenterX;

    if (this.textures.exists(ASSET_KEY_BTN_SHOP)) {
      const shopBtn = this.add.image(shopX, SHOP_BTN_Y, ASSET_KEY_BTN_SHOP);
      // Scale uniformly to maintain aspect ratio - make it prominent
      shopBtn.setScale(SHOP_BTN_SCALE);
      shopBtn.setDepth(10);
      // Use pixel-perfect hit detection so only visible pixels are clickable
      shopBtn.setInteractive({ useHandCursor: true, pixelPerfect: true, alphaTolerance: 128 });
      shopBtn.on('pointerdown', () => {
        log.info('buildShopButton', 'Shop button pressed');
        this.scene.start(SCENE_SHOP);
      });
      shopBtn.on('pointerover', () => shopBtn.setAlpha(0.9));
      shopBtn.on('pointerout', () => shopBtn.setAlpha(1));
    } else {
      // Fallback to GlButton if image not found
      const shopBtn = new GlButton(this, shopX, SHOP_BTN_Y, 'Shop', {
        width: 200,
        height: 50,
        gradient: GRADIENT_BUTTON_PRIMARY,
        fontSize: FONT_SIZE_SMALL,
      });
      shopBtn.onClick(() => {
        log.info('buildShopButton', 'Shop button pressed');
        this.scene.start(SCENE_SHOP);
      });
    }
  }


  // -- Version label (positioned above Jest footer) ---------------------------

  private buildVersionLabel(): void {
    // Version label removed per design feedback
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
      }).setOrigin(0.5).setResolution(4);
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
  }
}
