// src/ui/UIComponents.ts
// Shared UI component library for Gem Link

import Phaser from 'phaser';
import { Logger } from '../utils/Logger';
import {
  FONT_FAMILY,
  FONT_SIZE_XS,
  FONT_SIZE_SMALL,
  FONT_SIZE_MEDIUM,
  FONT_SIZE_LARGE,
  UI_COLOR_PRIMARY,
  UI_COLOR_ACCENT,
  UI_COLOR_TEXT_DIM,
  UI_COLOR_SUCCESS,
  GRADIENT_BUTTON_PRIMARY,
  GRADIENT_BUTTON_SUCCESS,
  BTN_PRESS_SCALE,
  BTN_PRESS_DURATION,
  HUD_TOP_MARGIN,
  HUD_PILL_WIDTH,
  HUD_PILL_HEIGHT,
  HUD_PILL_GAP,
  HUD_PILL_RADIUS,
  HUD_ICON_SIZE,
  MODAL_WIDTH,
  MODAL_BORDER_RADIUS,
  MODAL_BACKDROP_ALPHA,
  MODAL_PADDING,
  MODAL_TITLE_GAP,
  MODAL_BUTTON_GAP,
  MODAL_MIN_HEIGHT,
  MODAL_MAX_HEIGHT,
  MODAL_SEPARATOR_ALPHA,
  CARD_WIDTH,
  CARD_HEIGHT,
  CARD_BORDER_RADIUS,
  CARD_BG_COLOR,
  CARD_BORDER_COLOR,
  RIBBON_HEIGHT,
  RIBBON_COLOR,
  RIBBON_TEXT_COLOR,
  BADGE_COLOR_HEART,
  BADGE_COLOR_COIN,
  BADGE_COLOR_GEM,
  Z_HUD,
  Z_MODAL,
  Z_PARTICLES,
  COLOR_MODAL_BACKDROP,
  GAME_WIDTH,
  GAME_HEIGHT,
  SHADOW_OFFSET,
  SHADOW_COLOR,
  SHADOW_ALPHA,
  EASE_BOUNCE,
  EASE_BACK,
  EASE_QUAD,
  ASSET_KEY_HEART,
  ASSET_KEY_COIN,
  ASSET_KEY_GEM,
  ASSET_KEY_STAR,
  TEXT_SHADOW_OFFSET_X,
  TEXT_SHADOW_OFFSET_Y,
  TEXT_SHADOW_BLUR,
  TEXT_SHADOW_COLOR,
} from '../utils/Constants';

/** Helper function to create text shadow style object */
const createTextShadow = (color = TEXT_SHADOW_COLOR, blur = TEXT_SHADOW_BLUR, offsetX = TEXT_SHADOW_OFFSET_X, offsetY = TEXT_SHADOW_OFFSET_Y): Phaser.Types.GameObjects.Text.TextShadow => ({
  offsetX,
  offsetY,
  blur,
  color,
  fill: true,
  stroke: false,
});

const log = new Logger('UIComponents');

/** Badge value font size (between XS and SMALL) */
const BADGE_VALUE_FONT_SIZE = Math.round((FONT_SIZE_XS + FONT_SIZE_SMALL) / 2);

// ---------------------------------------------------------------------------
// 1. GlButton
// ---------------------------------------------------------------------------

export interface GlButtonConfig {
  width?: number;
  height?: number;
  gradient?: readonly [number, number];
  fontSize?: number;
  icon?: string;
}

export class GlButton extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Graphics;
  private label: Phaser.GameObjects.Text;
  private btnWidth: number;
  private btnHeight: number;
  private gradient: readonly [number, number];
  private enabled = true;
  private clickCb?: () => void;
  private isPressed = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    labelText: string,
    config: GlButtonConfig = {},
  ) {
    super(scene, x, y);
    log.debug('constructor', 'Creating GlButton', { labelText });

    this.btnWidth = config.width ?? 200;
    this.btnHeight = config.height ?? 48;
    this.gradient = config.gradient ?? GRADIENT_BUTTON_PRIMARY;
    const fontSize = config.fontSize ?? FONT_SIZE_MEDIUM;

    this.bg = scene.add.graphics();
    this.drawBackground();
    this.add(this.bg);

    const iconPrefix = config.icon ? `${config.icon} ` : '';
    this.label = scene.add
      .text(0, 0, `${iconPrefix}${labelText}`, {
        fontFamily: FONT_FAMILY,
        fontSize: `${fontSize}px`,
        color: '#ffffff',
        fontStyle: 'bold',
        align: 'center',
        shadow: createTextShadow(),
      })
      .setOrigin(0.5);
    this.add(this.label);

    this.setSize(this.btnWidth, this.btnHeight);
    this.setInteractive({ useHandCursor: true });

    this.on('pointerdown', this.handleDown, this);
    this.on('pointerup', this.handleUp, this);
    this.on('pointerout', this.handleOut, this);

    scene.add.existing(this);
    log.info('constructor', 'GlButton created');
  }

  private drawBackground(): void {
    const g = this.bg;
    const w = this.btnWidth;
    const h = this.btnHeight;
    const r = 12;
    const hw = w / 2;
    const hh = h / 2;

    g.clear();

    // Shadow
    g.fillStyle(SHADOW_COLOR, SHADOW_ALPHA);
    g.fillRoundedRect(-hw + SHADOW_OFFSET, -hh + SHADOW_OFFSET, w, h, r);

    // Top half — lighter gradient color
    g.fillStyle(this.gradient[0], 1);
    g.fillRoundedRect(-hw, -hh, w, h, r);

    // Bottom half overlay — darker gradient color
    g.fillStyle(this.gradient[1], 1);
    g.fillRoundedRect(-hw, 0, w, hh, { tl: 0, tr: 0, bl: r, br: r });
  }

  private handleDown(): void {
    if (!this.enabled) return;
    this.isPressed = true;
    this.scene.tweens.add({
      targets: this,
      scaleX: BTN_PRESS_SCALE,
      scaleY: BTN_PRESS_SCALE,
      duration: BTN_PRESS_DURATION,
      ease: EASE_QUAD,
    });
  }

  private handleUp(): void {
    if (!this.enabled || !this.isPressed) return;
    this.isPressed = false;
    this.scene.tweens.add({
      targets: this,
      scaleX: 1,
      scaleY: 1,
      duration: BTN_PRESS_DURATION,
      ease: EASE_QUAD,
      onComplete: () => {
        if (this.clickCb) this.clickCb();
      },
    });
  }

  private handleOut(): void {
    if (!this.isPressed) return;
    this.isPressed = false;
    this.scene.tweens.add({
      targets: this,
      scaleX: 1,
      scaleY: 1,
      duration: BTN_PRESS_DURATION,
      ease: EASE_QUAD,
    });
  }

  onClick(callback: () => void): this {
    this.clickCb = callback;
    return this;
  }

  setEnabled(enabled: boolean): this {
    this.enabled = enabled;
    this.setAlpha(enabled ? 1 : 0.5);
    if (!enabled) this.disableInteractive();
    else this.setInteractive({ useHandCursor: true });
    log.debug('setEnabled', `Button enabled=${enabled}`);
    return this;
  }

  setLabel(text: string): this {
    this.label.setText(text);
    return this;
  }
}

// ---------------------------------------------------------------------------
// 2. GlBadge
// ---------------------------------------------------------------------------

export interface GlBadgeConfig {
  showPlus?: boolean;
  iconDraw?: (g: Phaser.GameObjects.Graphics) => void;
}

export class GlBadge extends Phaser.GameObjects.Container {
  private valueText: Phaser.GameObjects.Text;
  private plusCb?: () => void;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    icon: string,
    value: string | number,
    color: number,
    config: GlBadgeConfig = {},
  ) {
    super(scene, x, y);
    log.debug('constructor', 'Creating GlBadge', { icon, value });

    const pillWidth = HUD_PILL_WIDTH;
    const pillHeight = HUD_PILL_HEIGHT;
    const r = HUD_PILL_RADIUS;
    const halfW = Math.round(pillWidth / 2);
    const halfH = Math.round(pillHeight / 2);

    // Background: badge color at 0.80 alpha with capsule shape
    const bg = scene.add.graphics();
    bg.fillStyle(color, 0.80);
    bg.fillRoundedRect(-halfW, -halfH, pillWidth, pillHeight, r);
    // 1px white border at 0.2 alpha
    bg.lineStyle(1, 0xFFFFFF, 0.2);
    bg.strokeRoundedRect(-halfW, -halfH, pillWidth, pillHeight, r);
    this.add(bg);

    // Icon: 20x20 sprite image, positioned at x = -pillWidth/2 + 18
    const iconX = Math.round(-halfW + 18);
    if (config.iconDraw) {
      const iconGfx = scene.add.graphics();
      iconGfx.setPosition(iconX, 0);
      config.iconDraw(iconGfx);
      this.add(iconGfx);
    } else if (icon && scene.textures.exists(icon)) {
      const iconImg = scene.add.image(iconX, 0, icon);
      iconImg.setDisplaySize(HUD_ICON_SIZE, HUD_ICON_SIZE);
      this.add(iconImg);
    } else if (icon) {
      // Fallback to text icon if texture not found
      const iconText = scene.add
        .text(iconX, 0, icon, {
          fontFamily: FONT_FAMILY,
          fontSize: `${FONT_SIZE_SMALL}px`,
          color: '#ffffff',
        })
        .setOrigin(0.5);
      this.add(iconText);
    }

    // Value text: 14px bold white, positioned at x = -4 (slightly left of center)
    this.valueText = scene.add
      .text(-4, 0, String(value), {
        fontFamily: FONT_FAMILY,
        fontSize: `${BADGE_VALUE_FONT_SIZE}px`,
        color: '#ffffff',
        fontStyle: 'bold',
        shadow: createTextShadow(),
      })
      .setOrigin(0.5);
    this.add(this.valueText);

    // Plus button: 20x20 circle visual affordance at x = pillWidth/2 - 14
    if (config.showPlus) {
      const plusX = Math.round(halfW - 14);
      const plusRadius = Math.round(HUD_ICON_SIZE / 2);

      const plusBg = scene.add.graphics();
      plusBg.fillStyle(0xFFFFFF, 0.3);
      plusBg.fillCircle(plusX, 0, plusRadius);
      this.add(plusBg);

      const plusLabel = scene.add
        .text(plusX, 0, '+', {
          fontFamily: FONT_FAMILY,
          fontSize: `${FONT_SIZE_SMALL}px`,
          color: '#ffffff',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);
      this.add(plusLabel);
    }

    // Make entire pill tappable (navigates to shop); plus icon is visual affordance only
    this.setSize(pillWidth, pillHeight);
    this.setInteractive({ useHandCursor: true });
    this.on('pointerdown', () => {
      if (this.plusCb) this.plusCb();
    });

    scene.add.existing(this);
    log.info('constructor', 'GlBadge created');
  }

  setValue(val: string | number): this {
    this.valueText.setText(String(val));
    return this;
  }

  onPlusClick(callback: () => void): this {
    this.plusCb = callback;
    return this;
  }
}

// ---------------------------------------------------------------------------
// 3. GlHUD
// ---------------------------------------------------------------------------

export class GlHUD extends Phaser.GameObjects.Container {
  private heartsBadge: GlBadge;
  private coinsBadge: GlBadge;
  private gemsBadge: GlBadge;

  constructor(scene: Phaser.Scene) {
    // Container at center X, Y = HUD_TOP_MARGIN + HUD_PILL_HEIGHT/2
    const hudY = Math.round(HUD_TOP_MARGIN + HUD_PILL_HEIGHT / 2);
    super(scene, Math.round(GAME_WIDTH / 2), hudY);
    log.debug('constructor', 'Creating GlHUD');

    // Dark backdrop strip for contrast over vivid backgrounds
    const backdrop = scene.add.graphics();
    backdrop.fillStyle(0x000000, 0.55);
    backdrop.fillRect(0, 0, GAME_WIDTH, HUD_TOP_MARGIN + HUD_PILL_HEIGHT + 8);
    backdrop.setDepth(Z_HUD - 1);
    backdrop.setScrollFactor(0);

    // Pill X positions: spacing = HUD_PILL_WIDTH + HUD_PILL_GAP = 102
    const pillSpacing = HUD_PILL_WIDTH + HUD_PILL_GAP;

    this.heartsBadge = new GlBadge(scene, -pillSpacing, 0, ASSET_KEY_HEART, 5, BADGE_COLOR_HEART, {
      showPlus: true,
    });
    this.coinsBadge = new GlBadge(scene, 0, 0, ASSET_KEY_COIN, 0, BADGE_COLOR_COIN, {
      showPlus: true,
    });
    this.gemsBadge = new GlBadge(scene, pillSpacing, 0, ASSET_KEY_GEM, 0, BADGE_COLOR_GEM, {
      showPlus: true,
    });

    this.add([this.heartsBadge, this.coinsBadge, this.gemsBadge]);
    this.setDepth(Z_HUD);
    this.setScrollFactor(0);

    scene.add.existing(this);
    log.info('constructor', 'GlHUD created');
  }

  updateValues(lives: number, coins: number, gems: number): this {
    this.heartsBadge.setValue(lives);
    this.coinsBadge.setValue(coins);
    this.gemsBadge.setValue(gems);
    log.debug('updateValues', 'HUD updated', { lives, coins, gems });
    return this;
  }

  /** Wire all badge + buttons to the same callback (typically navigate to shop) */
  onAllPlusClick(callback: () => void): this {
    this.heartsBadge.onPlusClick(callback);
    this.coinsBadge.onPlusClick(callback);
    this.gemsBadge.onPlusClick(callback);
    return this;
  }

  getHeartsBadge(): GlBadge { return this.heartsBadge; }
  getCoinsBadge(): GlBadge { return this.coinsBadge; }
  getGemsBadge(): GlBadge { return this.gemsBadge; }
}

// ---------------------------------------------------------------------------
// 4. GlModal
// ---------------------------------------------------------------------------

export interface GlModalConfig {
  title: string;
  width?: number;
  height?: number;
}

export class GlModal extends Phaser.GameObjects.Container {
  private backdrop: Phaser.GameObjects.Graphics;
  private dialog: Phaser.GameObjects.Container;
  private dialogBg: Phaser.GameObjects.Graphics;
  private contentContainer: Phaser.GameObjects.Container;
  private closeCb?: () => void;
  private dialogWidth: number;
  private fixedHeight: number | undefined;
  private nextContentY = 0;
  private titleText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, config: GlModalConfig) {
    super(scene, 0, 0);
    log.debug('constructor', 'Creating GlModal', { title: config.title });

    this.dialogWidth = config.width ?? MODAL_WIDTH;
    this.fixedHeight = config.height;
    const gameH = GAME_HEIGHT;
    const gameW = GAME_WIDTH;

    // Backdrop — click closes modal
    this.backdrop = scene.add.graphics();
    this.backdrop.fillStyle(COLOR_MODAL_BACKDROP, MODAL_BACKDROP_ALPHA);
    this.backdrop.fillRect(0, 0, gameW, gameH);
    this.backdrop.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, gameW, gameH),
      Phaser.Geom.Rectangle.Contains,
    );
    this.backdrop.on('pointerdown', () => this.handleClose());
    this.add(this.backdrop);

    // Dialog container centered on screen
    this.dialog = scene.add.container(Math.round(gameW / 2), Math.round(gameH / 2));

    // Dialog background (will be redrawn on show for auto-sizing)
    this.dialogBg = scene.add.graphics();
    this.dialog.add(this.dialogBg);

    // Title: 36px bold gold, centered
    const accentHex = `#${UI_COLOR_ACCENT.toString(16).padStart(6, '0')}`;
    this.titleText = scene.add
      .text(0, 0, config.title, {
        fontFamily: FONT_FAMILY,
        fontSize: `${FONT_SIZE_LARGE}px`,
        color: accentHex,
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: this.dialogWidth - MODAL_PADDING * 2 },
        shadow: createTextShadow(),
      })
      .setOrigin(0.5, 0);
    this.dialog.add(this.titleText);

    // Close "X" button at top-right corner
    const closeBtn = scene.add
      .text(0, 0, '\u2715', {
        fontFamily: FONT_FAMILY,
        fontSize: `${FONT_SIZE_MEDIUM}px`,
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.handleClose());
    this.dialog.add(closeBtn);

    // Content container — positioned below separator + gap
    this.contentContainer = scene.add.container(0, 0);
    this.dialog.add(this.contentContainer);

    this.add(this.dialog);
    this.setDepth(Z_MODAL);
    this.setVisible(false);
    this.setAlpha(0);

    // Draw initial layout
    this._layoutDialog();

    scene.add.existing(this);
    log.info('constructor', 'GlModal created');
  }

  /**
   * Recalculates dialog height from content and repositions all elements.
   * Layout: padding -> title -> gap -> separator -> gap -> content -> padding
   */
  private _layoutDialog(): void {
    const dw = this.dialogWidth;
    const pad = MODAL_PADDING;
    const titleGap = MODAL_TITLE_GAP;

    // Measure title height
    const titleH = this.titleText.height || FONT_SIZE_LARGE;

    // Title Y: positioned at top + padding
    // Separator Y: below title + gap
    const sepOffsetFromTop = pad + titleH + titleGap;
    // sepOffsetFromTop used below for separator drawing and content positioning

    // Content starts below separator + another gap
    const contentOffsetFromTop = sepOffsetFromTop + 1 + titleGap;

    // Compute total height
    let totalHeight: number;
    if (this.fixedHeight !== undefined) {
      totalHeight = this.fixedHeight;
    } else {
      // Auto-height: pad + title + gap + sep(1) + gap + content + pad
      const contentH = this.nextContentY > 0 ? this.nextContentY : 0;
      totalHeight = contentOffsetFromTop + contentH + pad;
      totalHeight = Math.max(totalHeight, MODAL_MIN_HEIGHT);
      totalHeight = Math.min(totalHeight, MODAL_MAX_HEIGHT);
    }

    const halfH = Math.round(totalHeight / 2);
    const halfW = Math.round(dw / 2);

    // Redraw background
    this.dialogBg.clear();
    this.dialogBg.fillStyle(UI_COLOR_PRIMARY, 1);
    this.dialogBg.fillRoundedRect(-halfW, -halfH, dw, totalHeight, MODAL_BORDER_RADIUS);
    this.dialogBg.lineStyle(2, UI_COLOR_ACCENT, 0.6);
    this.dialogBg.strokeRoundedRect(-halfW, -halfH, dw, totalHeight, MODAL_BORDER_RADIUS);

    // Draw separator line: 1px, rgba(255,255,255, MODAL_SEPARATOR_ALPHA)
    this.dialogBg.lineStyle(1, 0xFFFFFF, MODAL_SEPARATOR_ALPHA);
    const sepY = Math.round(-halfH + sepOffsetFromTop);
    const sepHalfW = Math.round(halfW - pad);
    this.dialogBg.beginPath();
    this.dialogBg.moveTo(-sepHalfW, sepY);
    this.dialogBg.lineTo(sepHalfW, sepY);
    this.dialogBg.strokePath();

    // Position title
    this.titleText.setPosition(0, Math.round(-halfH + pad));

    // Position close X button: top-right corner
    const closeBtn = this.dialog.getAt(2) as Phaser.GameObjects.Text;
    closeBtn.setPosition(Math.round(halfW - 20), Math.round(-halfH + 16));

    // Position content container
    this.contentContainer.setPosition(0, Math.round(-halfH + contentOffsetFromTop));

    // Make dialog body interactive so clicks don't pass through to backdrop
    this.dialog.setSize(dw, totalHeight);
    this.dialog.setInteractive(
      new Phaser.Geom.Rectangle(-halfW, -halfH, dw, totalHeight),
      Phaser.Geom.Rectangle.Contains,
    );
  }

  addContent(gameObject: Phaser.GameObjects.GameObject, height?: number): this {
    this.contentContainer.add(gameObject);
    (gameObject as unknown as { y: number }).y = this.nextContentY;
    const measuredHeight = height
      ?? ((gameObject as any).getBounds?.()?.height)
      ?? 30;
    this.nextContentY += measuredHeight + MODAL_BUTTON_GAP;

    // Re-layout to adjust dialog height for new content
    this._layoutDialog();
    return this;
  }

  show(): this {
    log.debug('show', 'Showing modal');
    // Final layout pass before display
    this._layoutDialog();

    this.setVisible(true);
    this.dialog.setScale(0.8);
    this.setAlpha(0);
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 200,
      ease: EASE_QUAD,
    });
    this.scene.tweens.add({
      targets: this.dialog,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: EASE_BACK,
    });
    return this;
  }

  hide(): this {
    log.debug('hide', 'Hiding modal');
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 200,
      ease: EASE_QUAD,
      onComplete: () => {
        this.setVisible(false);
      },
    });
    this.scene.tweens.add({
      targets: this.dialog,
      scaleX: 0.8,
      scaleY: 0.8,
      duration: 200,
      ease: EASE_QUAD,
    });
    return this;
  }

  onClose(callback: () => void): this {
    this.closeCb = callback;
    return this;
  }

  private handleClose(): void {
    this.hide();
    if (this.closeCb) this.closeCb();
  }
}

// ---------------------------------------------------------------------------
// 5. GlRibbon
// ---------------------------------------------------------------------------

export interface GlRibbonConfig {
  width?: number;
  color?: number;
}

export class GlRibbon extends Phaser.GameObjects.Container {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    config: GlRibbonConfig = {},
  ) {
    super(scene, x, y);
    log.debug('constructor', 'Creating GlRibbon', { text });

    const w = config.width ?? 240;
    const h = RIBBON_HEIGHT;
    const notch = 12;
    const color = config.color ?? RIBBON_COLOR;

    const g = scene.add.graphics();

    // Shadow
    g.fillStyle(SHADOW_COLOR, SHADOW_ALPHA);
    g.fillRect(-w / 2 + SHADOW_OFFSET, -h / 2 + SHADOW_OFFSET, w, h);

    // Ribbon body with notches on both sides
    g.fillStyle(color, 1);
    g.beginPath();
    g.moveTo(-w / 2, -h / 2);
    g.lineTo(w / 2, -h / 2);
    g.lineTo(w / 2 - notch, 0);
    g.lineTo(w / 2, h / 2);
    g.lineTo(-w / 2, h / 2);
    g.lineTo(-w / 2 + notch, 0);
    g.closePath();
    g.fillPath();

    this.add(g);

    const colorHex = `#${RIBBON_TEXT_COLOR.toString(16).padStart(6, '0')}`;
    const label = scene.add
      .text(0, 0, text, {
        fontFamily: FONT_FAMILY,
        fontSize: `${FONT_SIZE_MEDIUM}px`,
        color: colorHex,
        fontStyle: 'bold',
        align: 'center',
        shadow: createTextShadow(),
      })
      .setOrigin(0.5);
    this.add(label);

    scene.add.existing(this);
    log.info('constructor', 'GlRibbon created');
  }
}

// ---------------------------------------------------------------------------
// 6. GlStarDisplay
// ---------------------------------------------------------------------------

export interface GlStarDisplayConfig {
  size?: number;
  animated?: boolean;
}

export class GlStarDisplay extends Phaser.GameObjects.Container {
  private starObjects: (Phaser.GameObjects.Graphics | Phaser.GameObjects.Image)[] = [];
  private starSize: number;
  private isAnimated: boolean;
  private useSprite: boolean;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    stars: 0 | 1 | 2 | 3,
    config: GlStarDisplayConfig = {},
  ) {
    super(scene, x, y);
    log.debug('constructor', 'Creating GlStarDisplay', { stars });

    this.starSize = config.size ?? 24;
    this.isAnimated = config.animated ?? false;
    this.useSprite = scene.textures.exists(ASSET_KEY_STAR);

    const spacing = this.starSize * 2.2;
    for (let i = 0; i < 3; i++) {
      const filled = i < stars;
      const posX = (i - 1) * spacing;

      if (this.useSprite) {
        const img = scene.add.image(posX, 0, ASSET_KEY_STAR);
        const displaySize = this.starSize * 2;
        img.setDisplaySize(displaySize, displaySize);
        if (!filled) {
          img.setTint(0x555555);
          img.setAlpha(0.5);
        }
        this.starObjects.push(img);
        this.add(img);
      } else {
        const g = scene.add.graphics();
        g.x = posX;
        this.drawStarGraphics(g, filled);
        this.starObjects.push(g);
        this.add(g);
      }
    }

    if (this.isAnimated && stars > 0) {
      this.animateStars(stars);
    }

    scene.add.existing(this);
    log.info('constructor', 'GlStarDisplay created');
  }

  private drawStarGraphics(g: Phaser.GameObjects.Graphics, filled: boolean): void {
    g.clear();
    const s = this.starSize;

    if (filled) {
      g.fillStyle(0xffd700, 1);
    } else {
      g.fillStyle(0x555555, 0.5);
    }

    // 5-pointed star path
    g.beginPath();
    for (let i = 0; i < 5; i++) {
      const outerAngle = (Math.PI / 2) * -1 + (i * 2 * Math.PI) / 5;
      const innerAngle = outerAngle + Math.PI / 5;
      const ox = Math.cos(outerAngle) * s;
      const oy = Math.sin(outerAngle) * s;
      const ix = Math.cos(innerAngle) * (s * 0.45);
      const iy = Math.sin(innerAngle) * (s * 0.45);

      if (i === 0) {
        g.moveTo(ox, oy);
      } else {
        g.lineTo(ox, oy);
      }
      g.lineTo(ix, iy);
    }
    g.closePath();
    g.fillPath();

    if (!filled) {
      g.lineStyle(2, 0x888888, 0.6);
      g.strokePath();
    }
  }

  setStars(count: 0 | 1 | 2 | 3): this {
    log.debug('setStars', `Setting stars to ${count}`);
    for (let i = 0; i < 3; i++) {
      const filled = i < count;
      const obj = this.starObjects[i];

      if (this.useSprite && obj instanceof Phaser.GameObjects.Image) {
        if (filled) {
          obj.clearTint();
          obj.setAlpha(1);
        } else {
          obj.setTint(0x555555);
          obj.setAlpha(0.5);
        }
      } else if (obj instanceof Phaser.GameObjects.Graphics) {
        this.drawStarGraphics(obj, filled);
      }
    }
    if (this.isAnimated && count > 0) {
      this.animateStars(count);
    }
    return this;
  }

  private animateStars(count: number): void {
    for (let i = 0; i < count; i++) {
      const star = this.starObjects[i];
      star.setScale(0);
      this.scene.tweens.add({
        targets: star,
        scaleX: 1,
        scaleY: 1,
        duration: 400,
        delay: i * 200,
        ease: EASE_BOUNCE,
      });
    }
  }
}

// ---------------------------------------------------------------------------
// 7. GlProgressBar
// ---------------------------------------------------------------------------

export interface GlProgressBarConfig {
  bgColor?: number;
  fillColor?: number;
  starPositions?: number[];
}

export class GlProgressBar extends Phaser.GameObjects.Container {
  private barWidth: number;
  private barHeight: number;
  private fillBar: Phaser.GameObjects.Graphics;
  private progress = 0;
  private fillColor: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    config: GlProgressBarConfig = {},
  ) {
    super(scene, x, y);
    log.debug('constructor', 'Creating GlProgressBar');

    this.barWidth = width;
    this.barHeight = height;
    this.fillColor = config.fillColor ?? UI_COLOR_SUCCESS;
    const bgColor = config.bgColor ?? 0x333344;
    const r = height / 2;

    // Background track
    const bg = scene.add.graphics();
    bg.fillStyle(bgColor, 1);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, r);
    this.add(bg);

    // Fill bar
    this.fillBar = scene.add.graphics();
    this.add(this.fillBar);

    // Star markers
    if (config.starPositions) {
      for (const pct of config.starPositions) {
        const mx = -width / 2 + width * pct;
        const marker = scene.add.graphics();
        marker.fillStyle(0xffd700, 1);
        marker.fillCircle(mx, 0, 6);
        marker.fillStyle(0x000000, 0.3);
        marker.fillCircle(mx, 0, 3);
        this.add(marker);
      }
    }

    scene.add.existing(this);
    log.info('constructor', 'GlProgressBar created');
  }

  setProgress(value: number): this {
    const target = Phaser.Math.Clamp(value, 0, 1);
    log.debug('setProgress', `Animating progress to ${target}`);

    this.scene.tweens.addCounter({
      from: this.progress * 100,
      to: target * 100,
      duration: 400,
      ease: EASE_QUAD,
      onUpdate: (tween) => {
        const v = tween.getValue() / 100;
        this.progress = v;
        this.drawFill(v);
      },
    });
    return this;
  }

  getProgress(): number {
    return this.progress;
  }

  private drawFill(value: number): void {
    const g = this.fillBar;
    const w = this.barWidth;
    const h = this.barHeight;
    const r = h / 2;
    const fillW = Math.max(h, w * value); // min width = pill shape

    g.clear();
    if (value <= 0) return;

    g.fillStyle(this.fillColor, 1);
    g.fillRoundedRect(-w / 2, -h / 2, fillW, h, r);
  }
}

// ---------------------------------------------------------------------------
// 8. GlCard
// ---------------------------------------------------------------------------

export interface GlCardConfig {
  title: string;
  description: string;
  price: string;
  iconDraw?: (g: Phaser.GameObjects.Graphics) => void;
  iconTexture?: string;
}

export class GlCard extends Phaser.GameObjects.Container {
  private buyCb?: () => void;
  private buyBtn: GlButton;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: GlCardConfig,
  ) {
    super(scene, x, y);
    log.debug('constructor', 'Creating GlCard', { title: config.title });

    const w = CARD_WIDTH;
    const h = CARD_HEIGHT;
    const r = CARD_BORDER_RADIUS;
    const hasIcon = !!(config.iconTexture || config.iconDraw);

    // Background
    const bg = scene.add.graphics();
    bg.fillStyle(CARD_BG_COLOR, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, r);
    bg.lineStyle(2, CARD_BORDER_COLOR, 0.8);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, r);
    this.add(bg);

    // Icon area — sprite image takes priority over draw callback
    const iconAreaY = Math.round(-h / 2 + 40);
    if (config.iconTexture && scene.textures.exists(config.iconTexture)) {
      const iconImg = scene.add.image(0, iconAreaY, config.iconTexture);
      // Scale to fit within card width with padding
      const maxIconSize = Math.round(w - MODAL_PADDING);
      const iconScale = Math.min(maxIconSize / iconImg.width, maxIconSize / iconImg.height, 1);
      iconImg.setScale(iconScale);
      this.add(iconImg);
    } else if (config.iconDraw) {
      const iconG = scene.add.graphics();
      config.iconDraw(iconG);
      iconG.y = iconAreaY;
      this.add(iconG);
    }

    // Title: positioned below icon area (or near top if no icon)
    const titleY = Math.round(-h / 2 + (hasIcon ? 55 : 14));
    const title = scene.add
      .text(0, titleY, config.title, {
        fontFamily: FONT_FAMILY,
        fontSize: `${FONT_SIZE_SMALL}px`,
        color: '#ffffff',
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: w - FONT_SIZE_XS },
      })
      .setOrigin(0.5, 0);
    this.add(title);

    // Description: properly wrapped/truncated
    const descMaxY = Math.round(h / 2 - 30); // Leave room for buy button
    const descY = Math.round(title.y + title.height + 6);
    const descAvailH = Math.max(descMaxY - descY, FONT_SIZE_XS);
    const dimHex = `#${UI_COLOR_TEXT_DIM.toString(16).padStart(6, '0')}`;
    const desc = scene.add
      .text(0, descY, config.description, {
        fontFamily: FONT_FAMILY,
        fontSize: `${FONT_SIZE_XS}px`,
        color: dimHex,
        align: 'center',
        wordWrap: { width: w - MODAL_PADDING },
      })
      .setOrigin(0.5, 0);

    // Truncate if description overflows available space
    if (desc.height > descAvailH) {
      desc.setCrop(0, 0, desc.width, descAvailH);
    }
    this.add(desc);

    // Buy button at bottom
    this.buyBtn = new GlButton(scene, 0, Math.round(h / 2 - 20), config.price, {
      width: w - 8,
      height: 26,
      gradient: GRADIENT_BUTTON_SUCCESS,
      fontSize: FONT_SIZE_XS,
    });
    this.buyBtn.onClick(() => {
      if (this.buyCb) this.buyCb();
    });
    this.add(this.buyBtn);

    scene.add.existing(this);
    log.info('constructor', 'GlCard created');
  }

  onBuy(callback: () => void): this {
    this.buyCb = callback;
    return this;
  }

  setEnabled(enabled: boolean): this {
    this.buyBtn.setEnabled(enabled);
    this.setAlpha(enabled ? 1 : 0.6);
    return this;
  }
}

// ---------------------------------------------------------------------------
// 9. GlParticles (static utility)
// ---------------------------------------------------------------------------

export class GlParticles {
  private static textureCache = new Set<string>();

  private static ensureTexture(
    scene: Phaser.Scene,
    key: string,
    drawFn: (g: Phaser.GameObjects.Graphics) => void,
    size: number,
  ): void {
    if (this.textureCache.has(key) && scene.textures.exists(key)) return;
    const g = scene.add.graphics();
    drawFn(g);
    g.generateTexture(key, size, size);
    g.destroy();
    this.textureCache.add(key);
  }

  static sparkleBurst(scene: Phaser.Scene, x: number, y: number, count = 12): void {
    log.debug('sparkleBurst', 'Emitting sparkle burst', { x, y, count });

    this.ensureTexture(scene, '_gl_sparkle', (g) => {
      g.fillStyle(0xffd700, 1);
      g.fillRect(0, 0, 6, 6);
    }, 6);

    const emitter = scene.add.particles(x, y, '_gl_sparkle', {
      speed: { min: 60, max: 180 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 600,
      quantity: count,
      emitting: false,
      tint: [0xffd700, 0xffffff, 0xffee88],
    });
    emitter.setDepth(Z_PARTICLES);
    emitter.explode(count);

    scene.time.delayedCall(800, () => emitter.destroy());
  }

  static coinShower(scene: Phaser.Scene, x: number, y: number, count = 8): void {
    log.debug('coinShower', 'Emitting coin shower', { x, y, count });

    this.ensureTexture(scene, '_gl_coin', (g) => {
      g.fillStyle(0xf5c842, 1);
      g.fillCircle(5, 5, 5);
      g.fillStyle(0xdaa520, 1);
      g.fillCircle(5, 5, 3);
    }, 10);

    const emitter = scene.add.particles(x, y, '_gl_coin', {
      speed: { min: 40, max: 120 },
      angle: { min: -120, max: -60 },
      gravityY: 300,
      scale: { start: 1.2, end: 0.4 },
      alpha: { start: 1, end: 0.3 },
      lifespan: 900,
      quantity: count,
      emitting: false,
    });
    emitter.setDepth(Z_PARTICLES);
    emitter.explode(count);

    scene.time.delayedCall(1100, () => emitter.destroy());
  }

  static starExplosion(scene: Phaser.Scene, x: number, y: number): void {
    log.debug('starExplosion', 'Emitting star explosion', { x, y });

    this.ensureTexture(scene, '_gl_star_particle', (g) => {
      g.fillStyle(0xffd700, 1);
      // Small diamond shape
      g.fillTriangle(4, 0, 8, 4, 4, 8);
      g.fillTriangle(4, 0, 0, 4, 4, 8);
    }, 8);

    const emitter = scene.add.particles(x, y, '_gl_star_particle', {
      speed: { min: 100, max: 250 },
      scale: { start: 1.5, end: 0 },
      alpha: { start: 1, end: 0 },
      rotate: { start: 0, end: 360 },
      lifespan: 700,
      quantity: 16,
      emitting: false,
      tint: [0xffd700, 0xffffff, 0xffaa00],
    });
    emitter.setDepth(Z_PARTICLES);
    emitter.explode(16);

    scene.time.delayedCall(900, () => emitter.destroy());
  }

  static confetti(scene: Phaser.Scene): void {
    log.debug('confetti', 'Emitting full-screen confetti');

    const colors = [0xff4466, 0x44bbff, 0xffdd44, 0x44ff88, 0xff88ff, 0xff8844];

    colors.forEach((color, i) => {
      const key = `_gl_confetti_${i}`;
      this.ensureTexture(scene, key, (g) => {
        g.fillStyle(color, 1);
        g.fillRect(0, 0, 6, 10);
      }, 10);

      const emitter = scene.add.particles(GAME_WIDTH / 2, -20, key, {
        x: { min: -GAME_WIDTH / 2, max: GAME_WIDTH / 2 },
        speed: { min: 30, max: 100 },
        angle: { min: 70, max: 110 },
        gravityY: 120,
        rotate: { start: 0, end: Phaser.Math.Between(-360, 360) },
        scale: { start: 1, end: 0.5 },
        alpha: { start: 1, end: 0.6 },
        lifespan: 2500,
        frequency: 60,
        quantity: 2,
      });
      emitter.setDepth(Z_PARTICLES);

      scene.time.delayedCall(2000, () => {
        emitter.stop();
        scene.time.delayedCall(2600, () => emitter.destroy());
      });
    });
  }
}
