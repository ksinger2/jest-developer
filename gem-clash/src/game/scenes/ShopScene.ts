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
  MARGIN_EDGE,
  SHOP_SECTION_TITLE_SIZE,
  ASSET_KEY_COIN,
  ASSET_KEY_CHEST_CLOSED,
  ASSET_KEY_CHEST_OPEN,
  ASSET_KEY_HAMMER,
  ASSET_KEY_RAINBOW,
  ASSET_KEY_BG_SHOP,
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

// ── Layout Y anchors ──────────────────────────────────────────
const Y_RIBBON_CENTER = 76;
const Y_CURRENCY_TITLE = 112;
const Y_CURRENCY_CARDS_TOP = 140;
const Y_BOOSTER_TITLE = 280;
const Y_BOOSTER_TILES_TOP = 308;
const Y_FREE_GIFT_TOP = 400;
const Y_BACK_BTN_CENTER = 478;

// ── Card dimensions ───────────────────────────────────────────
const CARD_W = 80;
const CARD_H = 130;  // Increased to accommodate larger button
const CARD_GAP = 10;  // Increased from 6 for better separation
const CARD_BG = 0x2A1A4E;
const CARD_BORDER = 0x6C3BD1;
const CARD_BORDER_ALPHA = 0.7;
const CARD_RADIUS = 10;
const CARD_ICON_SIZE = 36;
const CARD_BUY_BTN_W = 68;
const CARD_BUY_BTN_H = 36;  // Increased from 24 for 44px min touch target compliance
// Card buy button radius is set inside GlButton drawBackground (default 12)

// ── Booster tile dimensions ───────────────────────────────────
const TILE_W = 60;  // Slightly wider for better proportion
const TILE_H = 88;  // Increased to accommodate larger button
const TILE_GAP = 16;
const TILE_BG = 0x2A1A4E;
const TILE_BG_ALPHA = 0.8;
const TILE_BORDER = 0x6C3BD1;
const TILE_BORDER_ALPHA = 0.5;
const TILE_RADIUS = 8;
const TILE_ICON_SIZE = 28;
const TILE_BUY_BTN_W = 52;  // Slightly wider
const TILE_BUY_BTN_H = 32;  // Increased from 20 for 44px min touch target compliance

// ── Free Gift strip ───────────────────────────────────────────
const GIFT_W = 350;
const GIFT_H = 56;
const GIFT_BG = 0x2A1A4E;
const GIFT_BG_ALPHA = 0.95;
const GIFT_BORDER = 0xFFD700;
const GIFT_BORDER_ALPHA = 0.6;
const GIFT_RADIUS = 12;
const GIFT_CHEST_SIZE = 36;
const GIFT_CLAIM_W = 48;
const GIFT_CLAIM_H = 28;

// ── Animation ─────────────────────────────────────────────────
const STAGGER_DURATION = 200;
const STAGGER_DELAY = 60;
const STAGGER_OFFSET_Y = 20;

// ── Back button ───────────────────────────────────────────────
const BACK_BTN_W = 140;
const BACK_BTN_H = 44;
// Back button radius is set inside GlButton drawBackground (default 12)

/** Helper to find a product by SKU enum value */
function findProduct(sku: ProductSKU): ProductInfo | undefined {
  return PRODUCT_CATALOG.find(p => p.sku === sku);
}

/** Section title color */
const GOLD_HEX = '#FFB800';

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
  private freeGiftClaimBtn: GlButton | null = null;
  private claimPulseTween: Phaser.Tweens.Tween | null = null;
  private entryTweens: Phaser.Tweens.Tween[] = [];
  private staggerItems: Phaser.GameObjects.Container[] = [];

  constructor() {
    super({ key: SCENE_SHOP });
    log.info('constructor', 'ShopScene registered');
  }

  create(): void {
    log.info('create', 'Building shop layout');
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

  // ── Ribbon (y:56-96) ───────────────────────────────────────

  private buildRibbon(): void {
    new GlRibbon(this, Math.round(GAME_WIDTH / 2), Y_RIBBON_CENTER, 'SHOP');
    log.debug('buildRibbon', 'Shop ribbon placed');
  }

  // ── Currency Packs (y:112-264) ──────────────────────────────

  private buildCurrencySection(): void {
    this.add.text(MARGIN_EDGE, Y_CURRENCY_TITLE, 'Currency Packs', {
      fontFamily: FONT_FAMILY,
      fontSize: `${SHOP_SECTION_TITLE_SIZE}px`,
      color: GOLD_HEX,
      fontStyle: 'bold',
    }).setOrigin(0, 0);

    const packs: { sku: ProductSKU; label: string; iconKey: string }[] = [
      { sku: ProductSKU.PACK_BEGINNER, label: 'Beginner', iconKey: ASSET_KEY_COIN },
      { sku: ProductSKU.PACK_JUMBO, label: 'Jumbo', iconKey: ASSET_KEY_COIN },
      { sku: ProductSKU.PACK_SUPER, label: 'Super', iconKey: ASSET_KEY_CHEST_CLOSED },
      { sku: ProductSKU.PACK_MEGA, label: 'Mega', iconKey: ASSET_KEY_CHEST_OPEN },
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

    // Icon (texture-based if loaded, fallback to graphics)
    const iconY = -halfH + 8 + Math.round(CARD_ICON_SIZE / 2);
    if (this.textures.exists(iconKey)) {
      const icon = this.add.image(0, iconY, iconKey)
        .setDisplaySize(CARD_ICON_SIZE, CARD_ICON_SIZE);
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

    // Title text (13px bold white)
    const titleText = this.add.text(0, -halfH + 52, label, {
      fontFamily: FONT_FAMILY,
      fontSize: '13px',
      color: '#FFFFFF',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5, 0);
    container.add(titleText);

    // Description text (11px #AAAAAA)
    const descText = this.add.text(0, -halfH + 68, product.description, {
      fontFamily: FONT_FAMILY,
      fontSize: '11px',
      color: '#AAAAAA',
      align: 'center',
      wordWrap: { width: CARD_W - 8 },
    }).setOrigin(0.5, 0);
    container.add(descText);

    // Buy button at bottom of card (adjusted for new card height)
    const btnY = -halfH + 104;
    const buyBtn = new GlButton(this, cx, cy + btnY, `${product.priceInTokens}T`, {
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
    this.add.text(MARGIN_EDGE, Y_BOOSTER_TITLE, 'Boosters', {
      fontFamily: FONT_FAMILY,
      fontSize: `${SHOP_SECTION_TITLE_SIZE}px`,
      color: GOLD_HEX,
      fontStyle: 'bold',
    }).setOrigin(0, 0);

    const boosters: { sku: ProductSKU; label: string; iconKey: string | null; iconText?: string }[] = [
      { sku: ProductSKU.HAMMER, label: 'Hammer', iconKey: ASSET_KEY_HAMMER },
      { sku: ProductSKU.RAINBOW, label: 'Rainbow', iconKey: ASSET_KEY_RAINBOW },
      { sku: ProductSKU.EXTRA_MOVES, label: '+3 Moves', iconKey: null, iconText: '+3' },
    ];

    const totalWidth = TILE_W * 3 + TILE_GAP * 2;
    const startX = Math.round((GAME_WIDTH - totalWidth) / 2 + TILE_W / 2);

    boosters.forEach((booster, i) => {
      const product = findProduct(booster.sku);
      if (!product) return;

      const cx = startX + i * (TILE_W + TILE_GAP);
      const cy = Math.round(Y_BOOSTER_TILES_TOP + TILE_H / 2);
      const tile = this.buildBoosterTile(
        cx, cy, booster.label, product, booster.iconKey, booster.iconText,
      );
      this.staggerItems.push(tile);
    });

    log.debug('buildBoosterSection', 'Booster tiles rendered');
  }

  private buildBoosterTile(
    cx: number,
    cy: number,
    label: string,
    product: ProductInfo,
    iconKey: string | null,
    iconText?: string,
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

    // Icon area (y: top + 6, centered)
    const iconY = -halfH + 6 + Math.round(TILE_ICON_SIZE / 2);
    if (iconKey && this.textures.exists(iconKey)) {
      const icon = this.add.image(0, iconY, iconKey)
        .setDisplaySize(TILE_ICON_SIZE, TILE_ICON_SIZE);
      container.add(icon);
    } else if (iconText) {
      // Text icon for +3 Moves
      const txtIcon = this.add.text(0, iconY, iconText, {
        fontFamily: FONT_FAMILY,
        fontSize: `${FONT_SIZE_MEDIUM}px`,
        color: '#FFD700',
        fontStyle: 'bold',
      }).setOrigin(0.5, 0.5);
      container.add(txtIcon);
    } else {
      // Fallback graphic
      const fallbackG = this.add.graphics();
      fallbackG.fillStyle(0xFFD700, 1);
      fallbackG.fillCircle(0, iconY, Math.round(TILE_ICON_SIZE / 2));
      container.add(fallbackG);
    }

    // Label text (12px white - increased for readability)
    const labelText = this.add.text(0, -halfH + 44, label, {
      fontFamily: FONT_FAMILY,
      fontSize: '12px',
      color: '#FFFFFF',
      align: 'center',
    }).setOrigin(0.5, 0);
    container.add(labelText);

    // Buy button (adjusted for new tile height)
    const btnY = -halfH + 62;
    const buyBtn = new GlButton(this, cx, cy + btnY, `${product.priceInTokens}T`, {
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

  private buildFreeGiftStrip(): void {
    const cx = Math.round(GAME_WIDTH / 2);
    const cy = Math.round(Y_FREE_GIFT_TOP + GIFT_H / 2);

    // Strip background
    const bg = this.add.graphics();
    bg.fillStyle(GIFT_BG, GIFT_BG_ALPHA);
    bg.fillRoundedRect(
      Math.round(cx - GIFT_W / 2),
      Math.round(cy - GIFT_H / 2),
      GIFT_W,
      GIFT_H,
      GIFT_RADIUS,
    );
    bg.lineStyle(1.5, GIFT_BORDER, GIFT_BORDER_ALPHA);
    bg.strokeRoundedRect(
      Math.round(cx - GIFT_W / 2),
      Math.round(cy - GIFT_H / 2),
      GIFT_W,
      GIFT_H,
      GIFT_RADIUS,
    );

    // Chest icon (left side)
    const chestX = Math.round(cx - GIFT_W / 2 + 30);
    if (this.textures.exists(ASSET_KEY_CHEST_CLOSED)) {
      this.add.image(chestX, cy, ASSET_KEY_CHEST_CLOSED)
        .setDisplaySize(GIFT_CHEST_SIZE, GIFT_CHEST_SIZE);
    } else {
      const chestG = this.add.graphics();
      chestG.fillStyle(0x8B4513, 1);
      chestG.fillRoundedRect(
        chestX - Math.round(GIFT_CHEST_SIZE / 2),
        cy - Math.round(GIFT_CHEST_SIZE / 2),
        GIFT_CHEST_SIZE,
        GIFT_CHEST_SIZE,
        4,
      );
    }

    // "FREE GIFT!" text (center-left area)
    this.add.text(Math.round(cx - 20), cy, 'FREE GIFT!', {
      fontFamily: FONT_FAMILY,
      fontSize: `${FONT_SIZE_SMALL}px`,
      color: '#FFFFFF',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);

    // Claim state
    const canClaim = this.offerManager.canCollectFreeGift(this.progress);
    const remainingMs = this.offerManager.getFreeGiftTimeRemaining(this.progress);

    // Right side: either CLAIM button or timer
    const rightX = Math.round(cx + GIFT_W / 2 - 48);

    if (canClaim) {
      this.freeGiftClaimBtn = new GlButton(this, rightX, cy, 'CLAIM', {
        width: GIFT_CLAIM_W,
        height: GIFT_CLAIM_H,
        gradient: GRADIENT_BUTTON_GOLD,
        fontSize: FONT_SIZE_XS,
      });
      this.freeGiftClaimBtn.onClick(() => this.claimFreeGift());

      // Pulse animation for claim button
      this.claimPulseTween = this.tweens.add({
        targets: this.freeGiftClaimBtn,
        scaleX: 1.06,
        scaleY: 1.06,
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      // Timer text (hidden when claimable, but needed for reference)
      this.freeGiftTimerText = this.add.text(rightX, cy, '', {
        fontFamily: FONT_FAMILY,
        fontSize: `${FONT_SIZE_XS}px`,
        color: '#AAAAAA',
      }).setOrigin(0.5, 0.5).setVisible(false);
    } else {
      this.freeGiftTimerText = this.add.text(
        rightX,
        cy,
        this.offerManager.formatTimeRemaining(remainingMs),
        {
          fontFamily: FONT_FAMILY,
          fontSize: `${FONT_SIZE_XS}px`,
          color: '#AAAAAA',
        },
      ).setOrigin(0.5, 0.5);

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
            // Switch to claim button
            this.showClaimButton(rightX, cy);
          } else {
            this.freeGiftTimerText.setText(this.offerManager.formatTimeRemaining(ms));
          }
        },
      });
    }

    log.debug('buildFreeGiftStrip', 'Free gift strip rendered', { canClaim });
  }

  /** Dynamically show the claim button when cooldown expires */
  private showClaimButton(x: number, y: number): void {
    this.freeGiftClaimBtn = new GlButton(this, x, y, 'CLAIM', {
      width: GIFT_CLAIM_W,
      height: GIFT_CLAIM_H,
      gradient: GRADIENT_BUTTON_GOLD,
      fontSize: FONT_SIZE_XS,
    });
    this.freeGiftClaimBtn.onClick(() => this.claimFreeGift());

    this.claimPulseTween = this.tweens.add({
      targets: this.freeGiftClaimBtn,
      scaleX: 1.06,
      scaleY: 1.06,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  // ── Back Button (y:456-498) ─────────────────────────────────

  private buildBackButton(): void {
    new GlButton(this, Math.round(GAME_WIDTH / 2), Y_BACK_BTN_CENTER, 'Back', {
      width: BACK_BTN_W,
      height: BACK_BTN_H,
      gradient: GRADIENT_BUTTON_PRIMARY,
      fontSize: 18,
    }).onClick(() => {
      log.info('buildBackButton', 'Navigating to main menu');
      this.scene.start(SCENE_MAIN_MENU);
    });
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
      this.confirmModal.addContent(modalIcon, 52);
    }

    // Product name (16px bold white)
    const nameText = this.add.text(0, 0, product.name, {
      fontFamily: FONT_FAMILY,
      fontSize: `${FONT_SIZE_SMALL}px`,
      color: '#FFFFFF',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5, 0);
    this.confirmModal.addContent(nameText);

    // Description (13px #AAAAAA)
    const descText = this.add.text(0, 0, product.description, {
      fontFamily: FONT_FAMILY,
      fontSize: '13px',
      color: '#AAAAAA',
      align: 'center',
      wordWrap: { width: 260 },
    }).setOrigin(0.5, 0);
    this.confirmModal.addContent(descText);

    // Price (20px bold #FFD700)
    const priceText = this.add.text(0, 0, `${product.priceInTokens} Tokens`, {
      fontFamily: FONT_FAMILY,
      fontSize: `${FONT_SIZE_MEDIUM}px`,
      color: '#FFD700',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5, 0);
    this.confirmModal.addContent(priceText);

    // Buy Now button (gold)
    const buyBtn = new GlButton(this, 0, 0, 'Buy Now', {
      width: 160,
      height: 40,
      gradient: GRADIENT_BUTTON_GOLD,
      fontSize: FONT_SIZE_SMALL,
    });
    buyBtn.onClick(() => {
      this.confirmModal?.hide();
      this.confirmModal = null;
      this.executePurchase(sku);
    });
    this.confirmModal.addContent(buyBtn);

    // Cancel button (purple)
    const cancelBtn = new GlButton(this, 0, 0, 'Cancel', {
      width: 120,
      height: 36,
      gradient: GRADIENT_BUTTON_PRIMARY,
      fontSize: FONT_SIZE_SMALL,
    });
    cancelBtn.onClick(() => {
      log.debug('initiateConfirmation', 'Purchase cancelled by user');
      this.confirmModal?.hide();
      this.confirmModal = null;
    });
    this.confirmModal.addContent(cancelBtn);

    this.confirmModal.show();
  }

  /** Map SKU to an appropriate icon texture key */
  private getIconKeyForSKU(sku: ProductSKU): string | null {
    switch (sku) {
      case ProductSKU.PACK_BEGINNER:
      case ProductSKU.PACK_JUMBO:
        return ASSET_KEY_COIN;
      case ProductSKU.PACK_SUPER:
        return ASSET_KEY_CHEST_CLOSED;
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
        this.showErrorToast(result.error ?? 'Purchase failed');
        return;
      }

      log.info('executePurchase', 'Purchase completed', { sku });

      // Deliver product
      this.deliverProduct(sku);

      // Save progress
      const pdm = new PlayerDataManager();
      await pdm.saveProgress(this.progress);
      log.info('executePurchase', 'Progress saved');

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
    const toast = this.add.text(
      Math.round(GAME_WIDTH / 2),
      GAME_HEIGHT - 60,
      message,
      {
        fontFamily: FONT_FAMILY,
        fontSize: `${FONT_SIZE_SMALL}px`,
        color: '#FF5252',
        backgroundColor: '#1a1a2e',
        padding: { x: 12, y: 6 },
      },
    ).setOrigin(0.5, 0.5).setDepth(2000);

    this.tweens.add({
      targets: toast,
      alpha: 0,
      delay: 2500,
      duration: 500,
      onComplete: () => toast.destroy(),
    });
  }

  // ── Free Gift Claim ─────────────────────────────────────────

  private claimFreeGift(): void {
    log.info('claimFreeGift', 'Claiming free gift');
    const reward = this.offerManager.collectFreeGift(this.progress);

    if (reward.reward === 'none') {
      this.showErrorToast('Gift not available yet');
      return;
    }

    setPlayerProgress(this.registry, this.progress);
    const pdm = new PlayerDataManager();
    pdm.saveProgress(this.progress);

    CelebrationSystem.celebratePurchase(this, 'Free Gift');
    log.info('claimFreeGift', 'Free gift claimed', { reward });

    // Remove claim button and show timer for next cooldown
    if (this.claimPulseTween) {
      this.claimPulseTween.stop();
      this.claimPulseTween = null;
    }
    if (this.freeGiftClaimBtn) {
      this.freeGiftClaimBtn.setVisible(false);
    }
    const remainingMs = this.offerManager.getFreeGiftTimeRemaining(this.progress);
    this.freeGiftTimerText.setText(this.offerManager.formatTimeRemaining(remainingMs));
    this.freeGiftTimerText.setVisible(true);

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
          // Re-show claim button
          const rightX = Math.round(GAME_WIDTH / 2 + GIFT_W / 2 - 48);
          const cy = Math.round(Y_FREE_GIFT_TOP + GIFT_H / 2);
          this.showClaimButton(rightX, cy);
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
    this.freeGiftClaimBtn = null;
    this.staggerItems = [];
  }
}
