/**
 * Gem Link — SpriteNumber
 * Owner: Frontend Engineer
 *
 * Renders numbers using digit sprite assets (digit_0 through digit_9)
 * instead of text. Supports positioning, scaling, alignment, and
 * animated value changes.
 */

import Phaser from 'phaser';
import { DIGIT_TEXTURE_KEYS } from '../utils/Constants';

type Alignment = 'left' | 'center' | 'right';

interface SpriteNumberConfig {
  /** X position */
  x: number;
  /** Y position */
  y: number;
  /** Height of each digit in pixels (width scales proportionally) */
  digitHeight?: number;
  /** Gap between digits in pixels */
  spacing?: number;
  /** Text alignment relative to x position */
  align?: Alignment;
  /** Initial value to display */
  value?: number;
  /** Optional comma separator for thousands */
  commas?: boolean;
}

export class SpriteNumber extends Phaser.GameObjects.Container {
  private digitHeight: number;
  private spacing: number;
  private align: Alignment;
  private currentValue: number;
  private digitImages: Phaser.GameObjects.Image[] = [];
  private commas: boolean;

  constructor(scene: Phaser.Scene, config: SpriteNumberConfig) {
    super(scene, config.x, config.y);

    this.digitHeight = config.digitHeight ?? 24;
    this.spacing = config.spacing ?? 2;
    this.align = config.align ?? 'center';
    this.currentValue = config.value ?? 0;
    this.commas = config.commas ?? false;

    scene.add.existing(this);
    this.rebuild();
  }

  /** Update the displayed number */
  setValue(value: number): this {
    const v = Math.max(0, Math.floor(value));
    if (v === this.currentValue) return this;
    this.currentValue = v;
    this.rebuild();
    return this;
  }

  getValue(): number {
    return this.currentValue;
  }

  /** Animate from current value to target over durationMs */
  animateTo(
    scene: Phaser.Scene,
    target: number,
    durationMs: number = 1000,
    ease: string = 'Cubic.easeOut',
  ): void {
    const counter = { value: this.currentValue };
    scene.tweens.add({
      targets: counter,
      value: target,
      duration: durationMs,
      ease,
      onUpdate: () => {
        this.setValue(Math.floor(counter.value));
      },
      onComplete: () => {
        this.setValue(target);
      },
    });
  }

  private rebuild(): void {
    // Remove old digit images
    for (const img of this.digitImages) {
      img.destroy();
    }
    this.digitImages = [];

    const str = this.commas
      ? this.currentValue.toLocaleString()
      : String(this.currentValue);

    // Build digit images
    let totalWidth = 0;
    const digitData: { key: string | null; width: number }[] = [];

    for (const ch of str) {
      if (ch === ',') {
        // For commas, use a small gap
        digitData.push({ key: null, width: this.spacing * 2 });
        totalWidth += this.spacing * 2;
      } else {
        const digit = parseInt(ch, 10);
        if (isNaN(digit) || digit < 0 || digit > 9) continue;
        const key = DIGIT_TEXTURE_KEYS[digit];
        // Check texture exists before using
        if (!this.scene.textures.exists(key)) continue;

        const tex = this.scene.textures.get(key);
        const frame = tex.get();
        const scale = this.digitHeight / frame.height;
        const w = frame.width * scale;
        digitData.push({ key, width: w });
        totalWidth += w;
      }
    }

    // Add spacing between digits
    if (digitData.length > 1) {
      totalWidth += this.spacing * (digitData.length - 1);
    }

    // Calculate starting X based on alignment
    let curX: number;
    if (this.align === 'left') {
      curX = 0;
    } else if (this.align === 'right') {
      curX = -totalWidth;
    } else {
      curX = -totalWidth / 2;
    }

    for (const d of digitData) {
      if (d.key === null) {
        // Comma gap
        curX += d.width + this.spacing;
        continue;
      }

      const img = this.scene.add.image(curX + d.width / 2, 0, d.key);
      const scale = this.digitHeight / img.height;
      img.setScale(scale);
      this.add(img);
      this.digitImages.push(img);
      curX += d.width + this.spacing;
    }
  }
}
