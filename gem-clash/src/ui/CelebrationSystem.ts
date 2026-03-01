/**
 * Gem Link — Celebration System
 * Owner: Game Engineer
 * Task: A04 / Redesign 2.4
 *
 * Static utility class for celebration/juice effects.
 * Badge-style floating labels with rounded-rect backgrounds (no stroke).
 */

import { Logger } from '../utils/Logger';
import {
  FONT_FAMILY,
  FONT_SIZE_XS,
  FONT_SIZE_SMALL,
  FONT_SIZE_MEDIUM,
  EASE_BOUNCE,
  EASE_BACK,
  EASE_QUAD,
  GAME_WIDTH,
  GAME_HEIGHT,
  UI_COLOR_SECONDARY,
  Z_EFFECTS,
  Z_PARTICLES,
} from '../utils/Constants';

const log = new Logger('CelebrationSystem');

const TEX_PARTICLE_GOLD = '__celeb_particle_gold';
const TEX_PARTICLE_WHITE = '__celeb_particle_white';
const TEX_COIN = '__celeb_coin';
const TEX_CONFETTI = '__celeb_confetti';

/** Combo badge padding & border-radius per depth tier */
const COMBO_TIER_1_PAD_H = 6;
const COMBO_TIER_1_PAD_V = 3;
const COMBO_TIER_1_RADIUS = 8;
const COMBO_TIER_1_FONT = FONT_SIZE_SMALL + 2; // 18px
const COMBO_TIER_1_FLOAT = 40;
const COMBO_TIER_1_SCALE_IN_DURATION = 150;
const COMBO_TIER_1_FADE_DURATION = 600;

const COMBO_TIER_2_PAD_H = 8;
const COMBO_TIER_2_PAD_V = 4;
const COMBO_TIER_2_RADIUS = 8;
const COMBO_TIER_2_FONT = FONT_SIZE_MEDIUM; // 24px
const COMBO_TIER_2_FLOAT = 50;
const COMBO_TIER_2_SCALE_IN_DURATION = 200;
const COMBO_TIER_2_FADE_DURATION = 700;

const COMBO_TIER_3_PAD_H = 10;
const COMBO_TIER_3_PAD_V = 5;
const COMBO_TIER_3_RADIUS = 10;
const COMBO_TIER_3_FONT = FONT_SIZE_MEDIUM + 4; // 28px
const COMBO_TIER_3_FLOAT = 60;
const COMBO_TIER_3_SCALE_IN_DURATION = 250;
const COMBO_TIER_3_FADE_DURATION = 800;
const COMBO_TIER_3_SHAKE_DURATION = 40;
const COMBO_TIER_3_SHAKE_INTENSITY = 0.004;

const POINTS_FONT = FONT_SIZE_XS + 2; // 14px
const POINTS_ALPHA = 0.85;
const POINTS_FLOAT = 30;
const POINTS_DURATION = 500;
const POINTS_DELAY = 100;

/** Purchase celebration constants */
const PURCHASE_BG_ALPHA = 0.9;
const PURCHASE_BG_RADIUS = 12;
const PURCHASE_PAD_H = 16;
const PURCHASE_PAD_V = 8;
const PURCHASE_FONT = FONT_SIZE_MEDIUM; // 24px
const PURCHASE_HOLD_MS = 600;
const PURCHASE_FLOAT = 60;
const PURCHASE_PARTICLE_COUNT = 8;

function ensureTexture(scene: Phaser.Scene, key: string, drawFn: (g: Phaser.GameObjects.Graphics) => void, w: number, h: number): void {
  if (scene.textures.exists(key)) return;
  const g = scene.add.graphics();
  drawFn(g);
  g.generateTexture(key, w, h);
  g.destroy();
}

function ensureParticleTextures(scene: Phaser.Scene): void {
  ensureTexture(scene, TEX_PARTICLE_GOLD, (g) => {
    g.fillStyle(0xFFD700, 1);
    g.fillCircle(4, 4, 4);
  }, 8, 8);

  ensureTexture(scene, TEX_PARTICLE_WHITE, (g) => {
    g.fillStyle(0xFFFFFF, 1);
    g.fillCircle(3, 3, 3);
  }, 6, 6);

  ensureTexture(scene, TEX_COIN, (g) => {
    g.fillStyle(0xFFD700, 1);
    g.fillCircle(5, 5, 5);
    g.fillStyle(0xFFC000, 1);
    g.fillCircle(5, 5, 3);
  }, 10, 10);

  ensureTexture(scene, TEX_CONFETTI, (g) => {
    g.fillStyle(0xFFFFFF, 1);
    g.fillRect(0, 0, 6, 4);
  }, 6, 4);
}

/**
 * Draws a rounded-rect badge behind a text object and returns a container
 * holding both the background and the text.
 */
function createBadge(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  fontSize: number,
  textColor: string,
  bgColor: number,
  bgAlpha: number,
  padH: number,
  padV: number,
  radius: number,
  depthBase: number,
): Phaser.GameObjects.Container {
  const txt = scene.add.text(0, 0, text, {
    fontFamily: FONT_FAMILY,
    fontSize: `${fontSize}px`,
    fontStyle: 'bold',
    color: textColor,
    align: 'center',
  }).setOrigin(0.5);

  const bgW = txt.width + padH * 2;
  const bgH = txt.height + padV * 2;

  const bg = scene.add.graphics();
  bg.fillStyle(bgColor, bgAlpha);
  bg.fillRoundedRect(
    Math.round(-bgW / 2),
    Math.round(-bgH / 2),
    Math.round(bgW),
    Math.round(bgH),
    radius,
  );

  const container = scene.add.container(Math.round(x), Math.round(y), [bg, txt]);
  container.setDepth(depthBase);
  return container;
}

export class CelebrationSystem {

  static celebratePurchase(scene: Phaser.Scene, productName: string): void {
    log.info('celebratePurchase', 'Celebrating purchase', { productName });
    ensureParticleTextures(scene);

    const cx = Math.round(GAME_WIDTH / 2);
    const cy = Math.round(GAME_HEIGHT / 2);

    // White screen flash
    const flash = scene.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0xFFFFFF, 0)
      .setDepth(Z_EFFECTS + 10).setScrollFactor(0);
    scene.tweens.add({
      targets: flash, alpha: 0.3, duration: 100, yoyo: true, hold: 100,
      onComplete: () => flash.destroy(),
    });

    // Badge-style label: dark purple bg + gold text
    const badge = createBadge(
      scene, cx, cy,
      `+${productName}!`,
      PURCHASE_FONT,
      '#FFD700',
      UI_COLOR_SECONDARY, // 0x2A1A4E
      PURCHASE_BG_ALPHA,
      PURCHASE_PAD_H,
      PURCHASE_PAD_V,
      PURCHASE_BG_RADIUS,
      Z_EFFECTS + 11,
    );
    badge.setScale(0).setScrollFactor(0);

    // Scale in: 0 -> 1.1 -> 1.0, then hold, then float up + fade
    scene.tweens.add({
      targets: badge,
      scale: { from: 0, to: 1.1 },
      duration: 300,
      ease: EASE_BACK,
      onComplete: () => {
        scene.tweens.add({
          targets: badge, scale: 1, duration: 150, ease: EASE_QUAD,
        });
        scene.tweens.add({
          targets: badge,
          y: cy - PURCHASE_FLOAT,
          alpha: 0,
          delay: PURCHASE_HOLD_MS,
          duration: 700,
          onComplete: () => badge.destroy(),
        });
      },
    });

    // Gold particle burst
    const emitter = scene.add.particles(cx, cy, TEX_PARTICLE_GOLD, {
      speed: { min: 40, max: 120 },
      angle: { min: 0, max: 360 },
      lifespan: 600,
      quantity: PURCHASE_PARTICLE_COUNT,
      emitting: false,
      alpha: { start: 1, end: 0 },
      scale: { start: 1, end: 0.2 },
    });
    emitter.setDepth(Z_PARTICLES).setScrollFactor(0);
    emitter.explode(PURCHASE_PARTICLE_COUNT);
    scene.time.delayedCall(800, () => emitter.destroy());
  }

  static celebrateLevelComplete(scene: Phaser.Scene, stars: 0 | 1 | 2 | 3): void {
    log.info('celebrateLevelComplete', 'Level complete celebration', { stars });
    ensureParticleTextures(scene);

    const starY = GAME_HEIGHT * 0.50;
    const starSpacing = 50;
    const starStartX = GAME_WIDTH / 2 - (Math.max(stars, 1) - 1) * starSpacing / 2;
    const starRadius = 16;

    for (let i = 0; i < stars; i++) {
      const sx = starStartX + i * starSpacing;
      const starGfx = scene.add.graphics();
      starGfx.setPosition(sx, -40);
      starGfx.fillStyle(0xFFD700, 1);
      starGfx.lineStyle(2, 0x000000, 1);
      starGfx.beginPath();
      for (let p = 0; p < 10; p++) {
        const r = p % 2 === 0 ? starRadius : starRadius * 0.45;
        const angle = (-Math.PI / 2) + (Math.PI / 5) * p;
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        if (p === 0) starGfx.moveTo(px, py);
        else starGfx.lineTo(px, py);
      }
      starGfx.closePath();
      starGfx.fillPath();
      starGfx.strokePath();
      starGfx.setDepth(Z_EFFECTS + 6).setScale(0).setScrollFactor(0);

      const delay = 600 + i * 400;
      scene.tweens.add({
        targets: starGfx, y: starY, scale: 1.3, duration: 500, delay, ease: EASE_BOUNCE,
        onComplete: () => {
          scene.tweens.add({ targets: starGfx, scale: 1, duration: 200, ease: EASE_QUAD });
          const burst = scene.add.particles(sx, starY, TEX_PARTICLE_GOLD, {
            speed: { min: 30, max: 90 }, angle: { min: 0, max: 360 },
            lifespan: 500, quantity: 6, emitting: false,
            alpha: { start: 1, end: 0 }, scale: { start: 0.8, end: 0.1 },
          });
          burst.setDepth(Z_PARTICLES).setScrollFactor(0);
          burst.explode(6);
          scene.time.delayedCall(600, () => burst.destroy());
        },
      });

      scene.time.delayedCall(3500, () => {
        scene.tweens.add({ targets: starGfx, alpha: 0, duration: 400, onComplete: () => starGfx.destroy() });
      });
    }

    if (stars === 3) {
      const confettiDelay = 600 + 3 * 400 + 300;
      scene.time.delayedCall(confettiDelay, () => {
        const colors = [0xFF4444, 0x44FF44, 0x4444FF, 0xFFFF44, 0xFF44FF, 0x44FFFF];
        for (let j = 0; j < 30; j++) {
          const confettiX = Phaser.Math.Between(20, GAME_WIDTH - 20);
          const piece = scene.add.rectangle(confettiX, -10, 6, 4, Phaser.Utils.Array.GetRandom(colors))
            .setDepth(Z_PARTICLES).setScrollFactor(0);
          scene.tweens.add({
            targets: piece, y: GAME_HEIGHT + 20, angle: Phaser.Math.Between(-360, 360),
            x: confettiX + Phaser.Math.Between(-40, 40), alpha: { from: 1, to: 0.2 },
            duration: Phaser.Math.Between(1200, 2000), delay: Phaser.Math.Between(0, 400),
            ease: EASE_QUAD, onComplete: () => piece.destroy(),
          });
        }
      });
    }
  }

  static celebrateCombo(scene: Phaser.Scene, x: number, y: number, depth: number, points: number): void {
    log.debug('celebrateCombo', 'Combo celebration', { depth, points });

    let label: string;
    let textColor: string;
    let bgColor: number;
    let bgAlpha: number;
    let fontSize: number;
    let padH: number;
    let padV: number;
    let radius: number;
    let targetScale: number;
    let scaleInDuration: number;
    let floatDistance: number;
    let fadeDuration: number;

    if (depth <= 1) {
      label = 'Linked!';
      textColor = '#FFFFFF';
      bgColor = 0xFFFFFF;
      bgAlpha = 0.15;
      fontSize = COMBO_TIER_1_FONT;
      padH = COMBO_TIER_1_PAD_H;
      padV = COMBO_TIER_1_PAD_V;
      radius = COMBO_TIER_1_RADIUS;
      targetScale = 1.0;
      scaleInDuration = COMBO_TIER_1_SCALE_IN_DURATION;
      floatDistance = COMBO_TIER_1_FLOAT;
      fadeDuration = COMBO_TIER_1_FADE_DURATION;
    } else if (depth === 2) {
      label = 'Great!';
      textColor = '#FFD700';
      bgColor = 0xFFD700;
      bgAlpha = 0.25;
      fontSize = COMBO_TIER_2_FONT;
      padH = COMBO_TIER_2_PAD_H;
      padV = COMBO_TIER_2_PAD_V;
      radius = COMBO_TIER_2_RADIUS;
      targetScale = 1.0;
      scaleInDuration = COMBO_TIER_2_SCALE_IN_DURATION;
      floatDistance = COMBO_TIER_2_FLOAT;
      fadeDuration = COMBO_TIER_2_FADE_DURATION;
    } else {
      label = 'Epic Combo!';
      textColor = '#FF4466';
      bgColor = 0xFF4444;
      bgAlpha = 0.3;
      fontSize = COMBO_TIER_3_FONT;
      padH = COMBO_TIER_3_PAD_H;
      padV = COMBO_TIER_3_PAD_V;
      radius = COMBO_TIER_3_RADIUS;
      targetScale = 1.0;
      scaleInDuration = COMBO_TIER_3_SCALE_IN_DURATION;
      floatDistance = COMBO_TIER_3_FLOAT;
      fadeDuration = COMBO_TIER_3_FADE_DURATION;
    }

    // Build badge-style label (rounded rect bg + text, no stroke)
    const badge = createBadge(
      scene,
      Math.round(x),
      Math.round(y - 10),
      label,
      fontSize,
      textColor,
      bgColor,
      bgAlpha,
      padH,
      padV,
      radius,
      Z_EFFECTS + 3,
    );
    badge.setScale(0);

    // Overshoot scale for depth 2 and 3+
    const overshootScale = depth <= 1 ? targetScale : (depth === 2 ? 1.1 : 1.2);

    scene.tweens.add({
      targets: badge,
      scale: { from: 0, to: overshootScale },
      duration: scaleInDuration,
      ease: EASE_BACK,
      onComplete: () => {
        // Settle to target scale (for depth 1 no settle needed since overshoot == target)
        if (overshootScale !== targetScale) {
          scene.tweens.add({
            targets: badge, scale: targetScale, duration: 100,
          });
        }
        // Float up and fade
        scene.tweens.add({
          targets: badge,
          y: Math.round(y - 10) - floatDistance,
          alpha: 0,
          duration: fadeDuration,
          ease: EASE_QUAD,
          onComplete: () => badge.destroy(),
        });
      },
    });

    // Camera shake for depth 3+
    if (depth >= 3) {
      scene.cameras.main.shake(COMBO_TIER_3_SHAKE_DURATION, COMBO_TIER_3_SHAKE_INTENSITY);
    }

    // Points display: 14px bold white, no stroke, alpha 0.85
    const ptsTxt = scene.add.text(Math.round(x), Math.round(y + 5), `+${points}`, {
      fontFamily: FONT_FAMILY,
      fontSize: `${POINTS_FONT}px`,
      fontStyle: 'bold',
      color: '#FFFFFF',
      align: 'center',
    }).setOrigin(0.5).setDepth(Z_EFFECTS + 2).setAlpha(POINTS_ALPHA);

    scene.tweens.add({
      targets: ptsTxt,
      y: Math.round(y + 5) - POINTS_FLOAT,
      alpha: 0,
      duration: POINTS_DURATION,
      delay: POINTS_DELAY,
      onComplete: () => ptsTxt.destroy(),
    });
  }

  static celebrateStarEarned(scene: Phaser.Scene, x: number, y: number, starIndex: number): void {
    log.info('celebrateStarEarned', 'Star earned', { starIndex });
    ensureParticleTextures(scene);

    const emitter = scene.add.particles(x, y, TEX_PARTICLE_GOLD, {
      speed: { min: 50, max: 130 }, angle: { min: 0, max: 360 },
      lifespan: 500, quantity: 10, emitting: false,
      alpha: { start: 1, end: 0 }, scale: { start: 1, end: 0.1 },
    });
    emitter.setDepth(Z_PARTICLES).setScrollFactor(0);
    emitter.explode(10);
    scene.time.delayedCall(700, () => emitter.destroy());

    const starGfx = scene.add.graphics();
    starGfx.setPosition(x, y);
    starGfx.fillStyle(0xFFD700, 1);
    starGfx.lineStyle(2, 0x000000, 1);
    starGfx.beginPath();
    const starRadius = 16;
    for (let p = 0; p < 10; p++) {
      const r = p % 2 === 0 ? starRadius : starRadius * 0.45;
      const angle = (-Math.PI / 2) + (Math.PI / 5) * p;
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      if (p === 0) starGfx.moveTo(px, py);
      else starGfx.lineTo(px, py);
    }
    starGfx.closePath();
    starGfx.fillPath();
    starGfx.strokePath();
    starGfx.setDepth(Z_EFFECTS + 7).setScale(0).setScrollFactor(0);

    scene.tweens.add({
      targets: starGfx, scale: 1.3, duration: 350, ease: EASE_BACK,
      onComplete: () => {
        scene.tweens.add({ targets: starGfx, scale: 1, duration: 200, ease: EASE_QUAD });
        scene.time.delayedCall(2000, () => {
          scene.tweens.add({ targets: starGfx, alpha: 0, duration: 300, onComplete: () => starGfx.destroy() });
        });
      },
    });

    scene.cameras.main.shake(30, 0.003);
  }

  static screenFlash(scene: Phaser.Scene, color: number, duration: number): void {
    log.debug('screenFlash', 'Screen flash', { color, duration });
    const overlay = scene.add.rectangle(
      Math.round(GAME_WIDTH / 2),
      Math.round(GAME_HEIGHT / 2),
      GAME_WIDTH, GAME_HEIGHT, color, 0,
    ).setDepth(Z_EFFECTS + 20).setScrollFactor(0);

    const half = duration / 2;
    scene.tweens.add({
      targets: overlay, alpha: 0.4, duration: half, yoyo: true, hold: 0,
      onComplete: () => overlay.destroy(),
    });
  }

  static floatingText(
    scene: Phaser.Scene, x: number, y: number, text: string,
    config?: { color?: string; fontSize?: number; duration?: number },
  ): void {
    log.debug('floatingText', 'Floating text', { text });

    const color = config?.color ?? '#FFFFFF';
    const fontSize = config?.fontSize ?? FONT_SIZE_MEDIUM;
    const duration = config?.duration ?? 1000;

    const txt = scene.add.text(x, y, text, {
      fontFamily: FONT_FAMILY, fontSize: `${fontSize}px`, color,
      stroke: '#000000', strokeThickness: 2, align: 'center',
    }).setOrigin(0.5).setDepth(Z_EFFECTS + 1).setScale(0);

    scene.tweens.add({
      targets: txt, scale: { from: 0, to: 1.1 }, duration: 150, ease: EASE_BACK,
      onComplete: () => {
        scene.tweens.add({ targets: txt, scale: 1, duration: 80 });
        scene.tweens.add({
          targets: txt, y: y - 60, alpha: 0, duration: duration - 230,
          ease: EASE_QUAD, onComplete: () => txt.destroy(),
        });
      },
    });
  }

  static coinRain(scene: Phaser.Scene, count: number): void {
    log.info('coinRain', 'Coin rain', { count });
    ensureParticleTextures(scene);

    const staggerStep = Math.min(500 / Math.max(count, 1), 80);

    for (let i = 0; i < count; i++) {
      scene.time.delayedCall(i * staggerStep, () => {
        const coinX = Phaser.Math.Between(20, GAME_WIDTH - 20);
        const coin = scene.add.image(coinX, -10, TEX_COIN)
          .setDepth(Z_PARTICLES).setScrollFactor(0);

        const drift = Phaser.Math.Between(-30, 30);
        const fallDuration = Phaser.Math.Between(1000, 1600);

        scene.tweens.add({
          targets: coin, y: GAME_HEIGHT + 15, x: coinX + drift, angle: Phaser.Math.Between(-180, 180),
          duration: fallDuration, ease: EASE_QUAD,
          onUpdate: () => {
            if (coin.y > GAME_HEIGHT * 0.75) {
              coin.alpha = Math.max(0, 1 - (coin.y - GAME_HEIGHT * 0.75) / (GAME_HEIGHT * 0.25));
            }
          },
          onComplete: () => coin.destroy(),
        });
      });
    }
  }

  /**
   * Creates sparkle particles at the given position when a gem is matched.
   * Color-matched sparkles for visual coherence.
   */
  static gemMatchSparkle(scene: Phaser.Scene, x: number, y: number, gemColor: number): void {
    log.debug('gemMatchSparkle', 'Gem match sparkle', { x, y, gemColor });

    const texKey = `__gem_sparkle_${gemColor.toString(16)}`;
    ensureTexture(scene, texKey, (g) => {
      g.fillStyle(gemColor, 1);
      g.fillCircle(4, 4, 4);
    }, 8, 8);

    const emitter = scene.add.particles(x, y, texKey, {
      speed: { min: 40, max: 100 },
      angle: { min: 0, max: 360 },
      lifespan: 400,
      quantity: 6,
      emitting: false,
      alpha: { start: 1, end: 0 },
      scale: { start: 1, end: 0.2 },
    });
    emitter.setDepth(Z_PARTICLES);
    emitter.explode(6);
    scene.time.delayedCall(500, () => emitter.destroy());
  }

  /**
   * Creates a radial burst effect for special gem activations (bombs, line clears).
   */
  static specialGemBurst(scene: Phaser.Scene, x: number, y: number, specialType: 'bomb' | 'line' | 'color'): void {
    log.info('specialGemBurst', 'Special gem burst', { specialType, x, y });
    ensureParticleTextures(scene);

    let color1: number, color2: number, count: number;

    switch (specialType) {
      case 'bomb':
        color1 = 0xFF6600;
        color2 = 0xFFCC00;
        count = 16;
        break;
      case 'line':
        color1 = 0x00FFFF;
        color2 = 0xFFFFFF;
        count = 12;
        break;
      case 'color':
        color1 = 0xFF00FF;
        color2 = 0x00FF00;
        count = 20;
        break;
    }

    const texKeyA = `__burst_${color1.toString(16)}`;
    ensureTexture(scene, texKeyA, (g) => {
      g.fillStyle(color1, 1);
      g.fillCircle(4, 4, 4);
    }, 8, 8);

    const emitterA = scene.add.particles(x, y, texKeyA, {
      speed: { min: 80, max: 200 },
      angle: { min: 0, max: 360 },
      lifespan: 600,
      quantity: Math.floor(count / 2),
      emitting: false,
      alpha: { start: 1, end: 0 },
      scale: { start: 1.2, end: 0.2 },
    });
    emitterA.setDepth(Z_PARTICLES);
    emitterA.explode(Math.floor(count / 2));

    const texKeyB = `__burst_${color2.toString(16)}`;
    ensureTexture(scene, texKeyB, (g) => {
      g.fillStyle(color2, 1);
      g.fillCircle(3, 3, 3);
    }, 6, 6);

    const emitterB = scene.add.particles(x, y, texKeyB, {
      speed: { min: 60, max: 150 },
      angle: { min: 0, max: 360 },
      lifespan: 500,
      quantity: Math.ceil(count / 2),
      emitting: false,
      alpha: { start: 1, end: 0 },
      scale: { start: 1, end: 0.3 },
    });
    emitterB.setDepth(Z_PARTICLES);
    emitterB.explode(Math.ceil(count / 2));

    // Screen flash for special gems
    CelebrationSystem.screenFlash(scene, color1, 150);

    // Camera shake for bombs
    if (specialType === 'bomb') {
      scene.cameras.main.shake(80, 0.01);
    }

    scene.time.delayedCall(800, () => {
      emitterA.destroy();
      emitterB.destroy();
    });
  }

  /**
   * Ambient floating particles for polished background effect.
   * Creates slowly floating sparkles that persist.
   */
  static createAmbientParticles(scene: Phaser.Scene): Phaser.GameObjects.Particles.ParticleEmitter {
    log.debug('createAmbientParticles', 'Creating ambient particles');
    ensureParticleTextures(scene);

    const emitter = scene.add.particles(GAME_WIDTH / 2, GAME_HEIGHT, TEX_PARTICLE_WHITE, {
      x: { min: 0, max: GAME_WIDTH },
      y: { min: GAME_HEIGHT, max: GAME_HEIGHT + 20 },
      speed: { min: 15, max: 35 },
      angle: { min: -100, max: -80 },
      lifespan: 6000,
      frequency: 400,
      quantity: 1,
      alpha: { start: 0.4, end: 0 },
      scale: { start: 0.5, end: 0.1 },
    });
    emitter.setDepth(Z_EFFECTS - 1);
    return emitter;
  }

  /**
   * Creates a "level up" celebration with multiple effects.
   */
  static celebrateLevelUp(scene: Phaser.Scene, newLevel: number): void {
    log.info('celebrateLevelUp', 'Level up celebration', { newLevel });
    ensureParticleTextures(scene);

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // Badge-style level up label
    const badge = createBadge(
      scene, cx, cy - 40,
      `Level ${newLevel}!`,
      32,
      '#FFD700',
      0x2A1A4E,
      0.95,
      20,
      10,
      14,
      Z_EFFECTS + 15,
    );
    badge.setScale(0).setScrollFactor(0);

    scene.tweens.add({
      targets: badge,
      scale: { from: 0, to: 1.2 },
      duration: 400,
      ease: EASE_BOUNCE,
      onComplete: () => {
        scene.tweens.add({
          targets: badge, scale: 1, duration: 150, ease: EASE_QUAD,
        });
        scene.tweens.add({
          targets: badge,
          y: cy - 100,
          alpha: 0,
          delay: 1500,
          duration: 600,
          onComplete: () => badge.destroy(),
        });
      },
    });

    // Gold sparkles around the badge
    const emitter = scene.add.particles(cx, cy - 40, TEX_PARTICLE_GOLD, {
      speed: { min: 60, max: 140 },
      angle: { min: 0, max: 360 },
      lifespan: 800,
      quantity: 20,
      emitting: false,
      alpha: { start: 1, end: 0 },
      scale: { start: 1.2, end: 0.2 },
    });
    emitter.setDepth(Z_PARTICLES).setScrollFactor(0);
    emitter.explode(20);
    scene.time.delayedCall(1000, () => emitter.destroy());

    // Screen flash
    CelebrationSystem.screenFlash(scene, 0xFFD700, 200);
  }
}
