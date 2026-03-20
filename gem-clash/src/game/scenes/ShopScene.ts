/**
 * Gem Link -- ShopScene
 * Owner: Senior Frontend Engineer
 * Tasks: B01-B04, C02, 2.7 (Visual Redesign)
 *
 * Redesigned shop with currency packs (4 cards), boosters (3 tiles),
 * compact free gift strip, purchase confirmation modal, celebration
 * animations, and stagger-in entry animation.
 */

import Phaser from 'phaser';
import { setupHighDPICamera } from '../../utils/HighDPI';
import { GlButton, GlHUD, GlModal, GlRibbon } from '../../ui/UIComponents';
import { CelebrationSystem } from '../../ui/CelebrationSystem';
import { OfferManager } from '../systems/OfferManager';
import { fadeIn } from '../../ui/Transitions';
import { Logger } from '../../utils/Logger';
import {
  SCENE_SHOP,
  SCENE_MAIN_MENU,
  FONT_FAMILY,
  FONT_SIZE_XS,
  FONT_SIZE_SMALL,
  FONT_SIZE_MEDIUM,
  GRADIENT_BUTTON_GOLD,
  GRADIENT_BUTTON_PRIMARY,
  GAME_WIDTH,
  GAME_HEIGHT,
  ASSET_KEY_COIN,
  ASSET_KEY_CHEST_OPEN,
  ASSET_KEY_CHEST_SUPER,
  ASSET_KEY_GIFT_BOX,
  ASSET_KEY_HAMMER,
  ASSET_KEY_RAINBOW,
  ASSET_KEY_BG_SHOP,
  ASSET_KEY_HEADER_SHOP,
  ASSET_KEY_BTN_BACK,
  DIGIT_TEXTURE_KEYS,
} from '../../utils/Constants';
import {
  PRODUCT_CATALOG,
  ProductSKU,
  ProductInfo,
  MAX_LIVES,
  PlayerProgress,
} from '../../types/game.types';
import { getPlayerProgress, setPlayerProgress } from '../../utils/RegistryHelper';
import { PaymentManager } from '../../sdk/PaymentManager';
import { PlayerDataManager } from '../../sdk/PlayerDataManager';

const log = new Logger('ShopScene');

// ── Layout Y anchors (more space under shop header) ──────────
const Y_RIBBON_CENTER = 52;
const Y_CURRENCY_TITLE = 120;
const Y_CURRENCY_CARDS_TOP = 148;
const Y_BOOSTER_TITLE = 292;
const Y_BOOSTER_TILES_TOP = 318;
const Y_FREE_GIFT_TOP = 448;
const Y_BACK_BTN_CENTER = 530;

// ── Card dimensions ───────────────────────────────────────────
const CARD_W = 82;
const CARD_H = 120;
const CARD_GAP = 12;
const CARD_BG = 0x16213E;
const CARD_BORDER = 0x6C5CE7;
const CARD_BORDER_ALPHA = 0.8;
const CARD_RADIUS = 12;
const CARD_ICON_SIZE = 36;
const CARD_BUY_BTN_W = 52;
const CARD_BUY_BTN_H = 26;

// ── Booster tile dimensions ───────────────────────────────────
const TILE_W = 80;
const TILE_H = 95;
const TILE_GAP = 16;
const TILE_BG = 0x16213E;
const TILE_BG_ALPHA = 0.9;
const TILE_BORDER = 0x6C5CE7;
const TILE_BORDER_ALPHA = 0.7;
const TILE_RADIUS = 12;
const TILE_ICON_SIZE = 36;
const TILE_BUY_BTN_W = 56;
const TILE_BUY_BTN_H = 26;

// ── Free Gift strip (compact like main menu) ─────────────────
const GIFT_W = 140;
const GIFT_H = 40;
const GIFT_BG = 0xB8860B;  // Match main menu dark goldenrod
const GIFT_BG_ALPHA = 0.95;
const GIFT_BORDER = 0xFFD700;
const GIFT_BORDER_ALPHA = 0.8;
const GIFT_RADIUS = 10;

// ── Animation ─────────────────────────────────────────────────
const STAGGER_DURATION = 200;
const STAGGER_DELAY = 60;
const STAGGER_OFFSET_Y = 20;

/** Helper to find a product by SKU enum value */
function findProduct(sku: ProductSKU): ProductInfo | undefined {
  return PRODUCT_CATALOG.find(p => p.sku === sku);
}

/** Section title color */
const GOLD_HEX = '#FFD93D';

export class ShopScene extends Phaser.Scene {
  private buyButtons: Map<string, GlButton> = new Map();
  private purchaseInProgress = false;
  private spinnerTween: Phaser.Tweens.Tween | null = null;
  private spinnerGraphic: Phaser.GameObjects.Arc | null = null;
  private confirmModal: GlModal | null = null;
  private progress!: PlayerProgress;
  private offerManager!: OfferManager;
  private freeGiftTimerText!: Phaser.GameObjects.Text;
  private freeGiftTimerEvent: Phaser.Time.TimerEvent | null = null;
  private claimPulseTween: Phaser.Tweens.Tween | null = null;
  private freeGiftIcon?: Phaser.GameObjects.Image;
  private freeGiftLabel?: Phaser.GameObjects.Text;
  private entryTweens: Phaser.Tweens.Tween[] = [];
  private staggerItems: Phaser.GameObjects.Container[] = [];

  constructor() {
    super({ key: SCENE_SHOP });
    log.info('constructor', 'ShopScene registered');
  }

  create(): void {
    log.info('create', 'Building shop layout');

    // Set up high-DPI camera for crisp rendering
    setupHighDPICamera(this);

    this.progress = getPlayerProgress(this.registry);
    this.offerManager = OfferManager.getInstance();
    this.buyButtons.clear();
    this.purchaseInProgress = false;
    this.staggerItems = [];
    this.entryTweens = [];

    this.cameras.main.setBackgroundColor('#1a0a2e');

    // Background image (if available)
    this.buildBackground();
    this.buildHUD();
    this.buildRibbon();
    this.buildCurrencySection();
    this.buildBoosterSection();
    this.buildFreeGiftStrip();
    this.buildBackButton();

    // Stagger-in entry animation for cards/tiles
    this.animateEntries();

    fadeIn(this, 300);
    log.info('create', 'Shop layout complete');
  }

  // ── Background (depth 0) ─────────────────────────────────────

  private buildBackground(): void {
    if (this.textures.exists(ASSET_KEY_BG_SHOP)) {
      const bg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, ASSET_KEY_BG_SHOP);
      const scaleX = GAME_WIDTH / bg.width;
      const scaleY = GAME_HEIGHT / bg.height;
      bg.setScale(Math.max(scaleX, scaleY));
      bg.setDepth(0);
      log.info('buildBackground', 'Shop background image loaded');
    } else {
      // Gradient fallback
      const gradient = this.add.graphics();
      gradient.fillGradientStyle(0x1A0A2E, 0x1A0A2E, 0x2A1A4E, 0x2A1A4E, 1);
      gradient.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      gradient.setDepth(0);
      log.debug('buildBackground', 'Using gradient fallback');
    }
  }

  // ── HUD (y:0-44) ───────────────────────────────────────────

  private buildHUD(): void {
    new GlHUD(this);
    log.debug('buildHUD', 'HUD rendered');
  }

  // ── Shop Header / Ribbon (y:56-96) ────────────────────────

  private buildRibbon(): void {
    if (this.textures.exists(ASSET_KEY_HEADER_SHOP)) {
      const header = this.add.image(Math.round(GAME_WIDTH / 2), Y_RIBBON_CENTER, ASSET_KEY_HEADER_SHOP);
      const headerScale = 220 / header.width;  // Larger banner
      header.setScale(headerScale);
      header.setDepth(5);
      log.debug('buildRibbon', 'Shop header sprite placed');
    } else {
      new GlRibbon(this, Math.round(GAME_WIDTH / 2), Y_RIBBON_CENTER, 'SHOP');
      log.debug('buildRibbon', 'Shop ribbon placed (fallback)');
    }
  }

  // ── Currency Packs (y:112-264) ──────────────────────────────

  private buildCurrencySection(): void {
    // Calculate left edge of cards for header alignment
    const cardsTotalWidth = CARD_W * 4 + CARD_GAP * 3;
    const cardsLeftX = Math.round((GAME_WIDTH - cardsTotalWidth) / 2);

    const titleText = this.add.text(cardsLeftX, Y_CURRENCY_TITLE, 'Currency Packs', {
      fontFamily: FONT_FAMILY,
      fontSize: '20px',
      color: GOLD_HEX,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
      shadow: { offsetX: 1, offsetY: 2, blur: 3, color: '#000000', fill: true },
    }).setOrigin(0, 0);
    titleText.setResolution(4);

    const packs: { sku: ProductSKU; label: string; iconKey: string }[] = [
      { sku: ProductSKU.PACK_BEGINNER, label: '250', iconKey: ASSET_KEY_COIN },
      { sku: ProductSKU.PACK_JUMBO, label: '1000', iconKey: ASSET_KEY_COIN },
      { sku: ProductSKU.PACK_SUPER, label: '3000', iconKey: ASSET_KEY_CHEST_OPEN },
      { sku: ProductSKU.PACK_MEGA, label: '8000', iconKey: ASSET_KEY_CHEST_SUPER },
    ];

    const totalWidth = CARD_W * 4 + CARD_GAP * 3;
    const startX = Math.round((GAME_WIDTH - totalWidth) / 2 + CARD_W / 2);

    packs.forEach((pack, i) => {
      const product = findProduct(pack.sku);
      if (!product) return;

      const cx = startX + i * (CARD_W + CARD_GAP);
      const cy = Math.round(Y_CURRENCY_CARDS_TOP + CARD_H / 2);
      const card = this.buildCurrencyCard(cx, cy, pack.label, product, pack.iconKey);
      this.staggerItems.push(card);
    });

    log.debug('buildCurrencySection', 'Currency cards rendered', { count: packs.length });
  }

  private buildCurrencyCard(
    cx: number,
    cy: number,
    label: string,
    product: ProductInfo,
    iconKey: string,
  ): Phaser.GameObjects.Container {
    const container = this.add.container(cx, cy);
    const halfW = CARD_W / 2;
    const halfH = CARD_H / 2;

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(CARD_BG, 1);
    bg.fillRoundedRect(-halfW, -halfH, CARD_W, CARD_H, CARD_RADIUS);
    bg.lineStyle(1.5, CARD_BORDER, CARD_BORDER_ALPHA);
    bg.strokeRoundedRect(-halfW, -halfH, CARD_W, CARD_H, CARD_RADIUS);
    container.add(bg);

    // Icon - all icons centered at same Y for alignment (moved up 5px)
    const isSuperChest = iconKey === ASSET_KEY_CHEST_SUPER;
    const isOpenChest = iconKey === ASSET_KEY_CHEST_OPEN;
    const isChest = isSuperChest || isOpenChest;
    // Chests need more space to display properly (they're wide artwork)
    const iconSize = isChest ? 64 : CARD_ICON_SIZE;
    // Both chests at same Y, coins slightly higher
    const iconY = isChest ? -halfH + 39 : -halfH + 35;
    if (this.textures.exists(iconKey)) {
      const icon = this.add.image(0, iconY, iconKey);
      // Get texture dimensions for proper scaling
      const frame = icon.frame;
      const texW = frame.width;
      const texH = frame.height;
      // Chests: stretch vertically (1.3x height), coins: uniform scale
      if (isChest) {
        const scaleX = iconSize / Math.max(texW, texH);
        const scaleY = scaleX * 1.3; // Stretch Y by 30%
        icon.setScale(scaleX, scaleY);
      } else {
        const scale = iconSize / Math.max(texW, texH);
        icon.setScale(scale);
      }
      container.add(icon);
    } else {
      // Fallback: draw a gold circle for coin packs
      const fallbackG = this.add.graphics();
      fallbackG.fillStyle(0xFFD700, 1);
      fallbackG.fillCircle(0, iconY, Math.round(CARD_ICON_SIZE / 2));
      fallbackG.fillStyle(0xFFC000, 1);
      fallbackG.fillCircle(0, iconY, Math.round(CARD_ICON_SIZE / 4));
      container.add(fallbackG);
    }

    // Buy button positioned inside card
    const btnY = halfH - CARD_BUY_BTN_H / 2 - 8; // 8px from bottom edge

    // Coin amount - use digit sprites if available (moved up 5px)
    const titleY = btnY - CARD_BUY_BTN_H / 2 - 17; // 17px above button (was 12)
    const digitSprites = this.buildDigitSprites(label, 0, titleY, 16, -2);
    if (digitSprites.length > 0) {
      digitSprites.forEach(sprite => container.add(sprite));
    } else {
      // Fallback to text if digit assets not loaded
      const cardTitleText = this.add.text(0, titleY, label, {
        fontFamily: FONT_FAMILY,
        fontSize: '14px',
        color: '#FFFFFF',
        fontStyle: 'bold',
        align: 'center',
      }).setOrigin(0.5, 0.5);
      cardTitleText.setResolution(4);
      container.add(cardTitleText);
    }

    // Buy button
    const buyBtn = new GlButton(this, cx, cy + btnY, `${product.priceInTokens} T`, {
      width: CARD_BUY_BTN_W,
      height: CARD_BUY_BTN_H,
      gradient: GRADIENT_BUTTON_GOLD,
      fontSize: FONT_SIZE_XS,
    });
    buyBtn.onClick(() => this.initiateConfirmation(product.sku));
    this.buyButtons.set(product.sku, buyBtn);

    return container;
  }

  // ── Boosters (y:280-384) ────────────────────────────────────

  private buildBoosterSection(): void {
    // Calculate left edge of tiles for header alignment
    const totalTileWidth = TILE_W * 3 + TILE_GAP * 2;
    const tilesLeftX = Math.round((GAME_WIDTH - totalTileWidth) / 2);

    const boosterTitle = this.add.text(tilesLeftX, Y_BOOSTER_TITLE, 'Boosters', {
      fontFamily: FONT_FAMILY,
      fontSize: '20px',
      color: GOLD_HEX,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
      shadow: { offsetX: 1, offsetY: 2, blur: 3, color: '#000000', fill: true },
    }).setOrigin(0, 0);
    boosterTitle.setResolution(4);

    const boosters: { sku: ProductSKU; iconKey: string | null; iconText?: string; iconScale?: number }[] = [
      { sku: ProductSKU.HAMMER, iconKey: ASSET_KEY_HAMMER, iconScale: 2.0 },
      { sku: ProductSKU.RAINBOW, iconKey: ASSET_KEY_RAINBOW },
      { sku: ProductSKU.EXTRA_MOVES, iconKey: null, iconText: '+3' },
    ];

    const totalWidth = TILE_W * 3 + TILE_GAP * 2;
    const startX = Math.round((GAME_WIDTH - totalWidth) / 2 + TILE_W / 2);

    boosters.forEach((booster, i) => {
      const product = findProduct(booster.sku);
      if (!product) return;

      const cx = startX + i * (TILE_W + TILE_GAP);
      const cy = Math.round(Y_BOOSTER_TILES_TOP + TILE_H / 2);
      const tile = this.buildBoosterTile(
        cx, cy, product, booster.iconKey, booster.iconText, booster.iconScale,
      );
      this.staggerItems.push(tile);
    });

    log.debug('buildBoosterSection', 'Booster tiles rendered');
  }

  private buildBoosterTile(
    cx: number,
    cy: number,
    product: ProductInfo,
    iconKey: string | null,
    iconText?: string,
    iconScale?: number,
  ): Phaser.GameObjects.Container {
    const container = this.add.container(cx, cy);
    const halfW = TILE_W / 2;
    const halfH = TILE_H / 2;

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(TILE_BG, TILE_BG_ALPHA);
    bg.fillRoundedRect(-halfW, -halfH, TILE_W, TILE_H, TILE_RADIUS);
    bg.lineStyle(1, TILE_BORDER, TILE_BORDER_ALPHA);
    bg.strokeRoundedRect(-halfW, -halfH, TILE_W, TILE_H, TILE_RADIUS);
    container.add(bg);

    // Icon area - centered vertically between top and buy button
    const scaleMult = iconScale ?? 1.0;
    const displaySize = TILE_ICON_SIZE * scaleMult;
    const btnY = halfH - TILE_BUY_BTN_H / 2 - 6;
    // Center icon in the space above the button
    const iconAreaTop = -halfH + 8;
    const iconAreaBottom = btnY - TILE_BUY_BTN_H / 2 - 4;
    const iconY = (iconAreaTop + iconAreaBottom) / 2;

    if (iconKey && this.textures.exists(iconKey)) {
      const icon = this.add.image(0, iconY, iconKey)
        .setDisplaySize(displaySize, displaySize);
      container.add(icon);
    } else if (iconText) {
      // Use digit typography assets for +3 Moves if available
      const digitSprites = this.buildDigitSprites(iconText, 0, iconY, 24, 2);
      if (digitSprites.length > 0) {
        digitSprites.forEach(sprite => container.add(sprite));
      } else {
        // Fallback to text if digit assets not loaded
        const txtIcon = this.add.text(0, iconY, iconText, {
          fontFamily: FONT_FAMILY,
          fontSize: '20px',
          color: '#FFD700',
          fontStyle: 'bold',
        }).setOrigin(0.5, 0.5);
        container.add(txtIcon);
      }
    } else {
      // Fallback graphic
      const fallbackG = this.add.graphics();
      fallbackG.fillStyle(0xFFD700, 1);
      fallbackG.fillCircle(0, iconY, Math.round(displaySize / 2));
      container.add(fallbackG);
    }

    // Buy button inside tile
    const buyBtn = new GlButton(this, cx, cy + btnY, `${product.priceInTokens} T`, {
      width: TILE_BUY_BTN_W,
      height: TILE_BUY_BTN_H,
      gradient: GRADIENT_BUTTON_GOLD,
      fontSize: FONT_SIZE_XS,
    });
    buyBtn.onClick(() => this.initiateConfirmation(product.sku));
    this.buyButtons.set(product.sku, buyBtn);

    return container;
  }

  // ── Free Gift Strip (y:400-456) ─────────────────────────────

  private freeGiftContainer!: Phaser.GameObjects.Container;
  private freeGiftBg?: Phaser.GameObjects.Graphics;

  private buildFreeGiftStrip(): void {
    const cx = Math.round(GAME_WIDTH / 2);
    const cy = Math.round(Y_FREE_GIFT_TOP + GIFT_H / 2);

    // Claim state (check early to determine initial appearance)
    const canClaim = this.offerManager.canCollectFreeGift(this.progress);
    const remainingMs = this.offerManager.getFreeGiftTimeRemaining(this.progress);

    // Gift icon OUTSIDE pulsing container for crisp rendering
    this.freeGiftIcon = this.add.image(cx - 42, cy, ASSET_KEY_GIFT_BOX);
    const giftScale = 44 / this.freeGiftIcon.width;
    this.freeGiftIcon.setScale(giftScale);
    this.freeGiftIcon.setDepth(10);

    // "Free Gift!" text OUTSIDE pulsing container
    this.freeGiftLabel = this.add.text(cx + 18, cy, 'Free Gift!', {
      fontFamily: FONT_FAMILY,
      fontSize: `${FONT_SIZE_SMALL}px`,
      color: '#FFFFFF',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5).setResolution(4);
    this.freeGiftLabel.setDepth(10);

    // Container for background only (this will pulse)
    this.freeGiftContainer = this.add.container(cx, cy);

    // Strip background - gold when available, grayed out when on cooldown
    this.freeGiftBg = this.add.graphics();
    this.drawGiftStripBackground(canClaim);
    this.freeGiftContainer.add(this.freeGiftBg);

    // Timer text - CENTERED (0, 0) when on cooldown
    this.freeGiftTimerText = this.add.text(0, 0, '', {
      fontFamily: FONT_FAMILY,
      fontSize: `${FONT_SIZE_SMALL}px`,
      color: '#FFFFFF',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5).setVisible(false).setResolution(4);
    this.freeGiftTimerText.setDepth(10);
    this.freeGiftContainer.add(this.freeGiftTimerText);

    // Make the entire strip clickable with a hit area
    const hitZone = this.add.zone(0, 0, GIFT_W, GIFT_H);
    hitZone.setInteractive({ useHandCursor: true });
    this.freeGiftContainer.add(hitZone);

    if (canClaim) {
      this.freeGiftTimerText.setVisible(false);
      this.freeGiftIcon?.setVisible(true);
      this.freeGiftLabel?.setVisible(true);
      this.setupGiftStripClickable(hitZone);
    } else {
      // On cooldown - hide icon/label, show centered timer, gray out button
      this.freeGiftIcon?.setVisible(false);
      this.freeGiftLabel?.setVisible(false);
      this.freeGiftTimerText.setText(this.offerManager.formatTimeRemaining(remainingMs));
      this.freeGiftTimerText.setVisible(true);
      hitZone.disableInteractive();

      // Start countdown timer
      this.freeGiftTimerEvent = this.time.addEvent({
        delay: 1000,
        loop: true,
        callback: () => {
          const ms = this.offerManager.getFreeGiftTimeRemaining(this.progress);
          if (ms <= 0) {
            this.freeGiftTimerText.setVisible(false);
            this.freeGiftTimerEvent?.remove();
            this.freeGiftTimerEvent = null;
            // Restore active appearance
            this.drawGiftStripBackground(true);
            this.freeGiftIcon?.setVisible(true);
            this.freeGiftLabel?.setVisible(true);
            this.setupGiftStripClickable(hitZone);
          } else {
            this.freeGiftTimerText.setText(this.offerManager.formatTimeRemaining(ms));
          }
        },
      });
    }

    log.debug('buildFreeGiftStrip', 'Free gift strip rendered', { canClaim });
  }

  /** Draw the gift strip background - gold when active, grayed when on cooldown */
  private drawGiftStripBackground(isActive: boolean): void {
    if (!this.freeGiftBg) return;
    this.freeGiftBg.clear();

    if (isActive) {
      // Gold background
      this.freeGiftBg.fillStyle(GIFT_BG, GIFT_BG_ALPHA);
      this.freeGiftBg.fillRoundedRect(-GIFT_W / 2, -GIFT_H / 2, GIFT_W, GIFT_H, GIFT_RADIUS);
      this.freeGiftBg.lineStyle(2, GIFT_BORDER, GIFT_BORDER_ALPHA);
      this.freeGiftBg.strokeRoundedRect(-GIFT_W / 2, -GIFT_H / 2, GIFT_W, GIFT_H, GIFT_RADIUS);
    } else {
      // Grayed out / disabled background
      this.freeGiftBg.fillStyle(0x6b5a2e, 0.7); // Darker muted gold
      this.freeGiftBg.fillRoundedRect(-GIFT_W / 2, -GIFT_H / 2, GIFT_W, GIFT_H, GIFT_RADIUS);
      this.freeGiftBg.lineStyle(2, 0x8b7a4e, 0.6); // Muted border
      this.freeGiftBg.strokeRoundedRect(-GIFT_W / 2, -GIFT_H / 2, GIFT_W, GIFT_H, GIFT_RADIUS);
    }
  }

  /** Make the gift strip clickable and add hover effects */
  private setupGiftStripClickable(hitZone: Phaser.GameObjects.Zone): void {
    hitZone.setInteractive({ useHandCursor: true });
    hitZone.on('pointerdown', () => this.claimFreeGift());
    hitZone.on('pointerover', () => this.freeGiftContainer?.setAlpha(0.9));
    hitZone.on('pointerout', () => this.freeGiftContainer?.setAlpha(1));
  }

  // ── Back Button (y:456-498) ─────────────────────────────────

  private buildBackButton(): void {
    const btnY = Y_BACK_BTN_CENTER;

    // Use the back button asset if available
    if (this.textures.exists(ASSET_KEY_BTN_BACK)) {
      const backBtn = this.add.image(Math.round(GAME_WIDTH / 2), btnY, ASSET_KEY_BTN_BACK);
      const targetWidth = 120;
      const scale = targetWidth / backBtn.width;
      backBtn.setScale(scale);
      backBtn.setInteractive({ useHandCursor: true });
      backBtn.on('pointerdown', () => {
        log.info('buildBackButton', 'Navigating to main menu');
        this.scene.start(SCENE_MAIN_MENU);
      });
      backBtn.on('pointerover', () => backBtn.setAlpha(0.85));
      backBtn.on('pointerout', () => backBtn.setAlpha(1));
    } else {
      // Fallback to text button with secondary gradient (purple)
      const backBtn = new GlButton(this, Math.round(GAME_WIDTH / 2), btnY, '← Back', {
        width: 120,
        height: 44,
        gradient: GRADIENT_BUTTON_PRIMARY,
        fontSize: FONT_SIZE_SMALL,
      });
      backBtn.onClick(() => {
        log.info('buildBackButton', 'Navigating to main menu');
        this.scene.start(SCENE_MAIN_MENU);
      });
    }
  }

  /**
   * Builds an array of digit sprite images for the given text (supports 0-9 and +).
   * Falls back to empty array if digit assets are not loaded.
   */
  private buildDigitSprites(
    text: string,
    centerX: number,
    y: number,
    digitSize: number,
    spacing: number = 2,
  ): Phaser.GameObjects.Image[] {
    const sprites: Phaser.GameObjects.Image[] = [];
    const chars = text.split('');

    // Check if all digit textures exist first
    let allExist = true;
    for (const char of chars) {
      if (char === '+') continue; // We'll handle + separately or skip
      const digitIndex = parseInt(char, 10);
      if (!isNaN(digitIndex) && digitIndex >= 0 && digitIndex <= 9) {
        const textureKey = DIGIT_TEXTURE_KEYS[digitIndex];
        if (!this.textures.exists(textureKey)) {
          allExist = false;
          break;
        }
      }
    }

    if (!allExist) return sprites; // Return empty if assets not loaded

    const totalWidth = chars.length * (digitSize + spacing) - spacing;
    let x = centerX - totalWidth / 2 + digitSize / 2;

    for (const char of chars) {
      if (char === '+') {
        // Use symbol_plus typography asset
        if (this.textures.exists('symbol_plus')) {
          const plusSprite = this.add.image(x, y, 'symbol_plus');
          const plusScale = digitSize / plusSprite.width;
          plusSprite.setScale(plusScale);
          sprites.push(plusSprite);
        }
      } else {
        const digitIndex = parseInt(char, 10);
        if (!isNaN(digitIndex) && digitIndex >= 0 && digitIndex <= 9) {
          const textureKey = DIGIT_TEXTURE_KEYS[digitIndex];
          const sprite = this.add.image(x, y, textureKey);
          const scale = digitSize / sprite.width;
          sprite.setScale(scale);
          sprites.push(sprite);
        }
      }
      x += digitSize + spacing;
    }

    return sprites;
  }

  // ── Stagger Entry Animation ─────────────────────────────────

  private animateEntries(): void {
    this.staggerItems.forEach((item, i) => {
      const targetY = item.y;
      item.setAlpha(0);
      item.y = targetY + STAGGER_OFFSET_Y;

      const tween = this.tweens.add({
        targets: item,
        alpha: 1,
        y: targetY,
        duration: STAGGER_DURATION,
        delay: i * STAGGER_DELAY,
        ease: 'Quad.easeOut',
      });
      this.entryTweens.push(tween);
    });
    log.debug('animateEntries', 'Entry animations started', { count: this.staggerItems.length });
  }

  // ── Purchase Confirmation Modal ─────────────────────────────

  private initiateConfirmation(sku: ProductSKU): void {
    if (this.purchaseInProgress) {
      log.debug('initiateConfirmation', 'Purchase already in progress');
      return;
    }

    const product = findProduct(sku);
    if (!product) {
      log.error('initiateConfirmation', 'Unknown SKU', { sku });
      return;
    }

    // B01: block if lives refill and lives are full
    if (sku === ProductSKU.LIVES_REFILL && this.progress.lives >= MAX_LIVES) {
      log.info('initiateConfirmation', 'Lives already full, purchase blocked');
      return;
    }

    log.info('initiateConfirmation', 'Showing confirmation', { sku, price: product.priceInTokens });

    this.confirmModal = new GlModal(this, { title: 'Confirm Purchase' });

    // Product icon in modal (48x48)
    const iconKey = this.getIconKeyForSKU(sku);
    if (iconKey && this.textures.exists(iconKey)) {
      const modalIcon = this.add.image(0, 0, iconKey).setDisplaySize(48, 48);
      this.confirmModal.addContent(modalIcon, 56);
    }

    // Product name (16px bold white)
    const nameText = this.add.text(0, 0, product.name, {
      fontFamily: FONT_FAMILY,
      fontSize: `${FONT_SIZE_MEDIUM}px`,
      color: '#FFFFFF',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5, 0).setResolution(4);
    this.confirmModal.addContent(nameText, 24);

    // Description (13px #AAAAAA)
    const descText = this.add.text(0, 0, product.description, {
      fontFamily: FONT_FAMILY,
      fontSize: '13px',
      color: '#AAAAAA',
      align: 'center',
      wordWrap: { width: 260 },
    }).setOrigin(0.5, 0).setResolution(4);
    this.confirmModal.addContent(descText, 28);

    // Price - show USD instead of tokens
    const priceText = this.add.text(0, 0, product.priceUSD, {
      fontFamily: FONT_FAMILY,
      fontSize: `${FONT_SIZE_MEDIUM}px`,
      color: '#FFD700',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5, 0).setResolution(4);
    this.confirmModal.addContent(priceText, 48);  // More spacing before button

    // Buy Now button (gold) - explicit height for proper spacing
    const buyBtn = new GlButton(this, 0, 0, 'Buy Now', {
      width: 180,
      height: 44,
      gradient: GRADIENT_BUTTON_GOLD,
      fontSize: FONT_SIZE_MEDIUM,
    });
    buyBtn.onClick(() => {
      this.confirmModal?.hide();
      this.confirmModal = null;
      this.executePurchase(sku);
    });
    this.confirmModal.addContent(buyBtn, 52);

    // Cancel button (purple) - explicit height for proper spacing
    const cancelBtn = new GlButton(this, 0, 0, 'Cancel', {
      width: 140,
      height: 40,
      gradient: GRADIENT_BUTTON_PRIMARY,
      fontSize: FONT_SIZE_SMALL,
    });
    cancelBtn.onClick(() => {
      log.debug('initiateConfirmation', 'Purchase cancelled by user');
      this.confirmModal?.hide();
      this.confirmModal = null;
    });
    this.confirmModal.addContent(cancelBtn, 48);

    this.confirmModal.show();
  }

  /** Map SKU to an appropriate icon texture key */
  private getIconKeyForSKU(sku: ProductSKU): string | null {
    switch (sku) {
      case ProductSKU.PACK_BEGINNER:
      case ProductSKU.PACK_JUMBO:
        return ASSET_KEY_COIN;
      case ProductSKU.PACK_SUPER:
        return ASSET_KEY_CHEST_SUPER;
      case ProductSKU.PACK_MEGA:
        return ASSET_KEY_CHEST_OPEN;
      case ProductSKU.HAMMER:
        return ASSET_KEY_HAMMER;
      case ProductSKU.RAINBOW:
        return ASSET_KEY_RAINBOW;
      default:
        return null;
    }
  }

  // ── Purchase Execution with Loading State ────────────────────

  private async executePurchase(sku: ProductSKU): Promise<void> {
    if (this.purchaseInProgress) return;

    const product = findProduct(sku);
    if (!product) return;

    this.purchaseInProgress = true;
    log.info('executePurchase', 'Starting purchase flow', { sku });

    // Disable all buttons and show spinner
    this.setAllButtonsEnabled(false);
    const activeBtn = this.buyButtons.get(sku);
    if (activeBtn) {
      this.showSpinner(activeBtn);
    }

    try {
      const paymentManager = new PaymentManager();
      const result = await paymentManager.purchase(sku);

      if (!result.success) {
        log.warn('executePurchase', 'Purchase did not succeed', { error: result.error });
        // Don't show error toast for cancellation
        if (result.error !== 'cancelled') {
          this.showErrorToast(result.error ?? 'Purchase failed');
        }
        return;
      }

      log.info('executePurchase', 'Purchase completed', { sku });

      // Deliver product (the PaymentManager already emitted PURCHASE_GRANT_ITEM,
      // but we also call deliverProduct here to update local state immediately)
      this.deliverProduct(sku);

      // Save progress with flush=true for critical purchase data
      const pdm = new PlayerDataManager();
      await pdm.saveProgress(this.progress, true);
      log.info('executePurchase', 'Progress saved and flushed');

      // Celebration animation
      CelebrationSystem.celebratePurchase(this, product.name);

    } catch (err) {
      log.error('executePurchase', 'Purchase failed', err);
      this.showErrorToast('Purchase failed. Please try again.');
    } finally {
      this.purchaseInProgress = false;
      this.hideSpinner();
      this.setAllButtonsEnabled(true);
    }
  }

  // ── Product Delivery ──────────────────────────────────────────

  private deliverProduct(sku: ProductSKU): void {
    log.info('deliverProduct', 'Delivering product', { sku });

    switch (sku) {
      case ProductSKU.LIVES_REFILL:
        this.progress.lives = MAX_LIVES;
        break;
      case ProductSKU.REMAP:
        this.progress.remapTokens += 1;
        break;
      case ProductSKU.EXTRA_MOVES:
        this.progress.remapTokens += 1;
        break;
      case ProductSKU.STARTER_PACK:
        this.progress.lives = MAX_LIVES;
        this.progress.remapTokens += 3;
        break;
      case ProductSKU.PACK_BEGINNER:
        this.progress.coins += 250;
        break;
      case ProductSKU.PACK_JUMBO:
        this.progress.coins += 1000;
        this.progress.gems += 10;
        break;
      case ProductSKU.PACK_SUPER:
        this.progress.coins += 3000;
        this.progress.gems += 30;
        this.progress.remapTokens += 3;
        break;
      case ProductSKU.PACK_MEGA:
        this.progress.coins += 8000;
        this.progress.gems += 100;
        this.progress.remapTokens += 10;
        break;
      case ProductSKU.HAMMER:
      case ProductSKU.BOMB_BOOSTER:
      case ProductSKU.RAINBOW:
        this.progress.remapTokens += 1;
        break;
      default:
        log.error('deliverProduct', 'Unhandled SKU', { sku });
    }

    setPlayerProgress(this.registry, this.progress);
    log.info('deliverProduct', 'Product delivered', {
      sku, lives: this.progress.lives, coins: this.progress.coins, gems: this.progress.gems,
    });
  }

  // ── Spinner Helpers ─────────────────────────────────────────

  private showSpinner(btn: GlButton): void {
    const bounds = btn.getBounds();
    this.spinnerGraphic = this.add.circle(bounds.centerX, bounds.centerY, 10, 0xffffff, 0)
      .setStrokeStyle(3, 0xffd700);
    this.spinnerGraphic.setDepth(1000);

    this.spinnerTween = this.tweens.add({
      targets: this.spinnerGraphic,
      angle: 360,
      duration: 800,
      repeat: -1,
      ease: 'Linear',
    });

    log.debug('showSpinner', 'Spinner shown');
  }

  private hideSpinner(): void {
    if (this.spinnerTween) {
      this.spinnerTween.stop();
      this.spinnerTween = null;
    }
    if (this.spinnerGraphic) {
      this.spinnerGraphic.destroy();
      this.spinnerGraphic = null;
    }
  }

  private setAllButtonsEnabled(enabled: boolean): void {
    this.buyButtons.forEach((btn) => {
      btn.setEnabled(enabled);
    });
  }

  // ── Error Toast ─────────────────────────────────────────────

  private showErrorToast(message: string): void {
    // Position toast in center of screen to avoid being cut off
    const toast = this.add.text(
      Math.round(GAME_WIDTH / 2),
      Math.round(GAME_HEIGHT / 2),
      message,
      {
        fontFamily: FONT_FAMILY,
        fontSize: `${FONT_SIZE_SMALL}px`,
        color: '#FF5252',
        backgroundColor: '#1a1a2e',
        padding: { x: 16, y: 10 },
      },
    ).setOrigin(0.5, 0.5).setDepth(2000);

    // Animate: slide in, pause, fade out
    toast.setAlpha(0);
    toast.setY(Math.round(GAME_HEIGHT / 2) + 20);
    this.tweens.add({
      targets: toast,
      alpha: 1,
      y: Math.round(GAME_HEIGHT / 2),
      duration: 200,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.time.delayedCall(2000, () => {
          this.tweens.add({
            targets: toast,
            alpha: 0,
            duration: 300,
            onComplete: () => toast.destroy(),
          });
        });
      },
    });
  }

  // ── Free Gift Claim ─────────────────────────────────────────

  private async claimFreeGift(): Promise<void> {
    log.info('claimFreeGift', 'Claiming free gift');
    const reward = this.offerManager.collectFreeGift(this.progress);

    if (reward.reward === 'none') {
      this.showErrorToast('Gift not available yet');
      return;
    }

    setPlayerProgress(this.registry, this.progress);
    const pdm = new PlayerDataManager();
    await pdm.saveProgress(this.progress, true);
    log.info('claimFreeGift', 'Free gift progress saved and flushed');

    // Note: No celebration popup for free gift (removed per design feedback)
    log.info('claimFreeGift', 'Free gift claimed', { reward });

    // Stop pulse animation and show timer for next cooldown
    if (this.claimPulseTween) {
      this.claimPulseTween.stop();
      this.claimPulseTween = null;
    }
    // Reset container scale
    this.freeGiftContainer?.setScale(1);

    // Hide the gift icon and label, show timer instead
    this.freeGiftIcon?.setVisible(false);
    this.freeGiftLabel?.setVisible(false);

    // Gray out the button background
    this.drawGiftStripBackground(false);

    const remainingMs = this.offerManager.getFreeGiftTimeRemaining(this.progress);
    this.freeGiftTimerText.setText(this.offerManager.formatTimeRemaining(remainingMs));
    this.freeGiftTimerText.setVisible(true);

    // Disable strip interaction during cooldown
    const hitZone = this.freeGiftContainer?.list?.find(
      (obj) => obj instanceof Phaser.GameObjects.Zone
    ) as Phaser.GameObjects.Zone | undefined;
    hitZone?.disableInteractive();

    if (this.freeGiftTimerEvent) {
      this.freeGiftTimerEvent.remove();
      this.freeGiftTimerEvent = null;
    }

    this.freeGiftTimerEvent = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        const ms = this.offerManager.getFreeGiftTimeRemaining(this.progress);
        if (ms <= 0) {
          this.freeGiftTimerText.setVisible(false);
          this.freeGiftTimerEvent?.remove();
          this.freeGiftTimerEvent = null;
          // Restore active appearance
          this.drawGiftStripBackground(true);
          // Show icon and label again
          this.freeGiftIcon?.setVisible(true);
          this.freeGiftLabel?.setVisible(true);
          // Re-enable strip interaction
          if (hitZone) {
            this.setupGiftStripClickable(hitZone);
          }
        } else {
          this.freeGiftTimerText.setText(this.offerManager.formatTimeRemaining(ms));
        }
      },
    });
  }

  // ── Cleanup ─────────────────────────────────────────────────

  shutdown(): void {
    log.info('shutdown', 'Cleaning up ShopScene');

    // Clean up timer events
    if (this.freeGiftTimerEvent) {
      this.freeGiftTimerEvent.remove();
      this.freeGiftTimerEvent = null;
    }

    // Clean up spinner
    this.hideSpinner();

    // Clean up claim pulse tween
    if (this.claimPulseTween) {
      this.claimPulseTween.stop();
      this.claimPulseTween = null;
    }

    // Clean up entry tweens
    this.entryTweens.forEach(t => {
      if (t.isPlaying()) t.stop();
    });
    this.entryTweens = [];

    // Clean up buttons and modal
    this.buyButtons.clear();
    this.confirmModal?.destroy();
    this.confirmModal = null;
    this.staggerItems = [];
  }
}
