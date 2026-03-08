/**
 * Gem Link — Gem Game Object
 * Owner: Game Engineer
 * Task: 3.1
 *
 * Phaser game object representing a single gem on the board.
 * Renders using pre-loaded PNG sprite images with Graphics overlays
 * for special gem indicators and selection glow.
 */

import Phaser from 'phaser';
import { Logger } from '../../utils/Logger';
import { GemColor, GemState, SpecialGemType } from '../../types/game.types';
import {
  GEM_SIZE,
  GEM_TEXTURE_MAP,
  ASSET_KEY_RAINBOW_CIRCLE,
  EASE_QUAD,
} from '../../utils/Constants';

const log = new Logger('Gem');

const SELECTED_SCALE = 1.1;

/** Target display size for the gem sprite within the cell */
const SPRITE_DISPLAY_SIZE = GEM_SIZE * 0.92;

export class Gem extends Phaser.GameObjects.Container {
  public readonly gemId: string;
  public gridRow: number;
  public gridCol: number;
  public gemColor: GemColor;
  public specialType: SpecialGemType;
  public gemState: GemState;

  private spriteImage: Phaser.GameObjects.Image | null = null;
  private specialGfx: Phaser.GameObjects.Graphics | null = null;
  private rainbowImage: Phaser.GameObjects.Image | null = null;
  private glowGfx: Phaser.GameObjects.Graphics | null = null;
  private glowTween: Phaser.Tweens.Tween | null = null;
  private rainbowTween: Phaser.Tweens.Tween | null = null;

  constructor(
    scene: Phaser.Scene,
    gemId: string,
    row: number,
    col: number,
    color: GemColor,
    specialType: SpecialGemType = SpecialGemType.NONE,
  ) {
    super(scene, 0, 0);
    this.gemId = gemId;
    this.gridRow = row;
    this.gridCol = col;
    this.gemColor = color;
    this.specialType = specialType;
    this.gemState = GemState.IDLE;
    this.setSize(GEM_SIZE, GEM_SIZE);
    this.renderVisual();
    log.debug('constructor', `Gem created: ${gemId}`, { row, col, color, specialType });
  }

  // ── Visual rendering ───────────────────────────────────────────────

  renderVisual(): void {
    this.clearVisuals();

    // Determine alpha based on state
    let alpha = 1;
    if (this.gemState === GemState.MATCHED || this.gemState === GemState.CLEARING) {
      alpha = 0.4;
    }

    // Main gem sprite
    const textureKey = GEM_TEXTURE_MAP[this.gemColor] ?? 'gem_heart';
    this.spriteImage = this.scene.add.image(0, 0, textureKey);
    this.spriteImage.setAlpha(alpha);

    // Scale sprite to fit SPRITE_DISPLAY_SIZE
    const origW = this.spriteImage.width;
    const origH = this.spriteImage.height;
    if (origW > 0 && origH > 0) {
      const scaleFactor = SPRITE_DISPLAY_SIZE / Math.max(origW, origH);
      this.spriteImage.setScale(scaleFactor);
    }

    this.add(this.spriteImage);
    this.renderSpecialIndicator(alpha);
  }

  private renderSpecialIndicator(alpha: number): void {
    if (this.specialType === SpecialGemType.NONE) return;

    if (this.specialType === SpecialGemType.LINE_CLEAR) {
      // Arrows overlay using Graphics
      this.specialGfx = this.scene.add.graphics();
      this.specialGfx.lineStyle(2, 0xffffff, 0.9 * alpha);
      // Left arrow
      this.specialGfx.beginPath();
      this.specialGfx.moveTo(-4, 0);
      this.specialGfx.lineTo(-10, 0);
      this.specialGfx.strokePath();
      this.specialGfx.beginPath();
      this.specialGfx.moveTo(-8, -3);
      this.specialGfx.lineTo(-10, 0);
      this.specialGfx.lineTo(-8, 3);
      this.specialGfx.strokePath();
      // Right arrow
      this.specialGfx.beginPath();
      this.specialGfx.moveTo(4, 0);
      this.specialGfx.lineTo(10, 0);
      this.specialGfx.strokePath();
      this.specialGfx.beginPath();
      this.specialGfx.moveTo(8, -3);
      this.specialGfx.lineTo(10, 0);
      this.specialGfx.lineTo(8, 3);
      this.specialGfx.strokePath();
      this.add(this.specialGfx);
    } else if (this.specialType === SpecialGemType.BOMB) {
      // Ring overlay using Graphics
      const r1 = SPRITE_DISPLAY_SIZE * 0.55;
      const r2 = SPRITE_DISPLAY_SIZE * 0.65;
      this.specialGfx = this.scene.add.graphics();
      this.specialGfx.lineStyle(1.5, 0xffffff, 0.5 * alpha);
      this.specialGfx.strokeCircle(0, 0, r1);
      this.specialGfx.lineStyle(1, 0xffffff, 0.25 * alpha);
      this.specialGfx.strokeCircle(0, 0, r2);
      this.add(this.specialGfx);
    } else if (this.specialType === SpecialGemType.COLOR_BOMB) {
      // Use circle_rainbow texture if available, otherwise fall back to shimmer
      if (this.scene.textures.exists(ASSET_KEY_RAINBOW_CIRCLE)) {
        this.rainbowImage = this.scene.add.image(0, 0, ASSET_KEY_RAINBOW_CIRCLE);
        this.rainbowImage.setAlpha(alpha);
        const origW = this.rainbowImage.width;
        const origH = this.rainbowImage.height;
        if (origW > 0 && origH > 0) {
          const scaleFactor = SPRITE_DISPLAY_SIZE / Math.max(origW, origH);
          this.rainbowImage.setScale(scaleFactor);
        }
        // Replace the gem sprite with the rainbow circle
        if (this.spriteImage) {
          this.spriteImage.setVisible(false);
        }
        this.add(this.rainbowImage);
        this.startRainbowSpin();
      } else {
        this.startRainbowShimmer();
      }
    }
  }

  private startRainbowSpin(): void {
    this.stopRainbowShimmer();
    if (!this.rainbowImage) return;
    this.rainbowTween = this.scene.tweens.add({
      targets: this.rainbowImage,
      angle: 360,
      duration: 2000,
      repeat: -1,
      ease: 'Linear',
    });
  }

  private startRainbowShimmer(): void {
    this.stopRainbowShimmer();
    if (!this.spriteImage) return;
    const target = { tintValue: 0 };
    this.rainbowTween = this.scene.tweens.add({
      targets: target,
      tintValue: 360,
      duration: 1500,
      repeat: -1,
      ease: EASE_QUAD,
      onUpdate: () => {
        if (this.spriteImage) {
          const hueColor = Phaser.Display.Color.HSLToColor(target.tintValue / 360, 0.8, 0.6).color;
          this.spriteImage.setTint(hueColor);
        }
      },
    });
  }

  private stopRainbowShimmer(): void {
    if (this.rainbowTween) { this.rainbowTween.destroy(); this.rainbowTween = null; }
  }

  // ── State management ───────────────────────────────────────────────

  setGemState(state: GemState): void {
    if (this.gemState === state) return;
    const prev = this.gemState;
    this.gemState = state;
    log.debug('setGemState', `Gem ${this.gemId} state: ${prev} → ${state}`);

    if (state === GemState.SELECTED) {
      this.showSelectedGlow();
      this.setScale(SELECTED_SCALE);
    } else {
      this.hideSelectedGlow();
      this.setScale(1);
    }

    // Re-render for matched/clearing alpha changes
    if (state === GemState.MATCHED || state === GemState.CLEARING || prev === GemState.MATCHED || prev === GemState.CLEARING) {
      this.renderVisual();
    }
  }

  private showSelectedGlow(): void {
    this.hideSelectedGlow();
    this.glowGfx = this.scene.add.graphics();
    this.glowGfx.lineStyle(3, 0xffffff, 0.5);
    this.glowGfx.strokeCircle(0, 0, GEM_SIZE * 0.55);
    this.addAt(this.glowGfx, 0);

    this.glowTween = this.scene.tweens.add({
      targets: this.glowGfx,
      alpha: { from: 0.3, to: 0.8 },
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: EASE_QUAD,
    });
  }

  private hideSelectedGlow(): void {
    if (this.glowTween) { this.glowTween.destroy(); this.glowTween = null; }
    if (this.glowGfx) { this.glowGfx.destroy(); this.glowGfx = null; }
  }

  // ── Property setters ───────────────────────────────────────────────

  setGemColor(color: GemColor): void {
    this.gemColor = color;
    this.renderVisual();
  }

  setSpecialType(type: SpecialGemType): void {
    this.specialType = type;
    this.renderVisual();
    if (type !== SpecialGemType.NONE) {
      log.info('setSpecialType', `Gem ${this.gemId} became ${type}`, {
        row: this.gridRow,
        col: this.gridCol,
      });
    }
  }

  setGridPosition(row: number, col: number): void {
    this.gridRow = row;
    this.gridCol = col;
  }

  // ── Cleanup ────────────────────────────────────────────────────────

  private clearVisuals(): void {
    this.hideSelectedGlow();
    this.stopRainbowShimmer();
    if (this.spriteImage) { this.spriteImage.destroy(); this.spriteImage = null; }
    if (this.specialGfx) { this.specialGfx.destroy(); this.specialGfx = null; }
    if (this.rainbowImage) { this.rainbowImage.destroy(); this.rainbowImage = null; }
  }

  destroyGem(): void {
    log.debug('destroyGem', `Destroying gem ${this.gemId}`);
    this.clearVisuals();
    this.destroy();
  }
}
