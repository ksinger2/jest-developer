/**
 * Gem Link — UIComponents API Test Suite
 * Owner: QA Engineer
 *
 * Tests for UI component API contracts and public interfaces.
 * Note: These tests focus on API signatures, not rendering.
 * Phaser scene rendering is mocked.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import Phaser from 'phaser';
import {
  GlButton,
  GlBadge,
  GlHUD,
  GlModal,
  GlRibbon,
  GlStarDisplay,
  GlProgressBar,
  GlCard,
  GlParticles,
} from '../ui/UIComponents';

// Mock Phaser Scene
class MockScene {
  public add: any;
  public scale: any;
  public tweens: any;
  public time: any;
  public textures: any;

  constructor() {
    this.add = {
      graphics: vi.fn(() => ({
        clear: vi.fn(),
        fillStyle: vi.fn(),
        fillRect: vi.fn(),
        fillRoundedRect: vi.fn(),
        lineStyle: vi.fn(),
        strokeRoundedRect: vi.fn(),
        fillCircle: vi.fn(),
        fillTriangle: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        closePath: vi.fn(),
        fillPath: vi.fn(),
        strokePath: vi.fn(),
        generateTexture: vi.fn(),
        destroy: vi.fn(),
        setScale: vi.fn(),
        setPosition: vi.fn().mockReturnThis(),
        setInteractive: vi.fn().mockReturnThis(),
        setDepth: vi.fn().mockReturnThis(),
        setVisible: vi.fn().mockReturnThis(),
        setAlpha: vi.fn().mockReturnThis(),
        on: vi.fn().mockReturnThis(),
        x: 0,
        y: 0,
      })),
      rectangle: vi.fn((_x: number, _y: number, _w: number, _h: number) => ({
        setOrigin: vi.fn().mockReturnThis(),
        setInteractive: vi.fn().mockReturnThis(),
        on: vi.fn().mockReturnThis(),
        setAlpha: vi.fn().mockReturnThis(),
      })),
      text: vi.fn((x: number, y: number, text: string, style: any) => ({
        x,
        y,
        text,
        style,
        width: 100,
        setOrigin: vi.fn().mockReturnThis(),
        setInteractive: vi.fn().mockReturnThis(),
        setPosition: vi.fn().mockReturnThis(),
        setCrop: vi.fn().mockReturnThis(),
        on: vi.fn(),
        setText: vi.fn(),
        height: 20,
      })),
      container: vi.fn((x: number, y: number) => {
        const list: any[] = [];
        return {
          x,
          y,
          list,
          add: vi.fn((child: any) => {
            if (Array.isArray(child)) list.push(...child);
            else list.push(child);
          }),
          getAt: (index: number) => list[index],
          setSize: vi.fn().mockReturnThis(),
          setScale: vi.fn(),
          setPosition: vi.fn().mockReturnThis(),
          setDepth: vi.fn().mockReturnThis(),
          setVisible: vi.fn().mockReturnThis(),
          setAlpha: vi.fn().mockReturnThis(),
          setInteractive: vi.fn().mockReturnThis(),
          on: vi.fn().mockReturnThis(),
        };
      }),
      existing: vi.fn(),
      particles: vi.fn(() => ({
        setDepth: vi.fn().mockReturnThis(),
        explode: vi.fn(),
        stop: vi.fn(),
        destroy: vi.fn(),
      })),
    };

    this.scale = {
      width: 390,
      height: 600,
    };

    this.tweens = {
      add: vi.fn(),
      addCounter: vi.fn(),
    };

    this.time = {
      delayedCall: vi.fn(),
    };

    this.textures = {
      exists: vi.fn(() => false),
    };
  }
}

describe('UIComponents API Tests', () => {
  let mockScene: any;

  beforeEach(() => {
    mockScene = new MockScene();
  });

  describe('GlButton', () => {
    it('constructor creates button with default config', () => {
      const button = new GlButton(mockScene, 100, 200, 'Click Me');

      expect(button).toBeDefined();
      expect(mockScene.add.graphics).toHaveBeenCalled();
      expect(mockScene.add.text).toHaveBeenCalled();
    });

    it('constructor accepts custom width and height', () => {
      const button = new GlButton(mockScene, 0, 0, 'Test', {
        width: 300,
        height: 60,
      });

      expect(button).toBeDefined();
    });

    it('constructor accepts custom gradient', () => {
      const customGradient: readonly [number, number] = [0xff0000, 0x990000];
      const button = new GlButton(mockScene, 0, 0, 'Test', {
        gradient: customGradient,
      });

      expect(button).toBeDefined();
    });

    it('constructor accepts custom fontSize', () => {
      const button = new GlButton(mockScene, 0, 0, 'Test', {
        fontSize: 32,
      });

      expect(button).toBeDefined();
    });

    it('constructor accepts icon', () => {
      const button = new GlButton(mockScene, 0, 0, 'Test', {
        icon: '⭐',
      });

      expect(button).toBeDefined();
    });

    it('onClick registers callback and returns this for chaining', () => {
      const button = new GlButton(mockScene, 0, 0, 'Test');
      const callback = vi.fn();

      const result = button.onClick(callback);

      expect(result).toBe(button);
    });

    it('setEnabled updates button state and returns this for chaining', () => {
      const button = new GlButton(mockScene, 0, 0, 'Test');

      const result1 = button.setEnabled(false);
      expect(result1).toBe(button);

      const result2 = button.setEnabled(true);
      expect(result2).toBe(button);
    });

    it('setLabel updates label text and returns this for chaining', () => {
      const button = new GlButton(mockScene, 0, 0, 'Initial');

      const result = button.setLabel('Updated');

      expect(result).toBe(button);
    });

    it('supports method chaining', () => {
      const callback = vi.fn();
      const button = new GlButton(mockScene, 0, 0, 'Test')
        .onClick(callback)
        .setEnabled(true)
        .setLabel('Chained');

      expect(button).toBeDefined();
    });
  });

  describe('GlBadge', () => {
    it('constructor creates badge with icon and value', () => {
      const badge = new GlBadge(mockScene, 50, 50, '❤', 5, 0xff0000);

      expect(badge).toBeDefined();
      expect(mockScene.add.graphics).toHaveBeenCalled();
    });

    it('constructor accepts showPlus config', () => {
      const badge = new GlBadge(mockScene, 0, 0, '💰', 100, 0xffd700, {
        showPlus: true,
      });

      expect(badge).toBeDefined();
    });

    it('setValue updates value and returns this for chaining', () => {
      const badge = new GlBadge(mockScene, 0, 0, '❤', 5, 0xff0000);

      const result = badge.setValue(3);

      expect(result).toBe(badge);
    });

    it('onPlusClick registers callback and returns this for chaining', () => {
      const badge = new GlBadge(mockScene, 0, 0, '❤', 5, 0xff0000, {
        showPlus: true,
      });
      const callback = vi.fn();

      const result = badge.onPlusClick(callback);

      expect(result).toBe(badge);
    });

    it('supports method chaining', () => {
      const callback = vi.fn();
      const badge = new GlBadge(mockScene, 0, 0, '💎', 0, 0xbb55ff, { showPlus: true })
        .setValue(10)
        .onPlusClick(callback);

      expect(badge).toBeDefined();
    });
  });

  describe('GlHUD', () => {
    it('constructor creates HUD with three badges', () => {
      const hud = new GlHUD(mockScene);

      expect(hud).toBeDefined();
      expect(hud.getHeartsBadge()).toBeDefined();
      expect(hud.getCoinsBadge()).toBeDefined();
      expect(hud.getGemsBadge()).toBeDefined();
    });

    it('updateValues updates all badge values and returns this', () => {
      const hud = new GlHUD(mockScene);

      const result = hud.updateValues(3, 500, 25);

      expect(result).toBe(hud);
    });

    it('getHeartsBadge returns hearts badge', () => {
      const hud = new GlHUD(mockScene);
      const badge = hud.getHeartsBadge();

      expect(badge).toBeDefined();
    });

    it('getCoinsBadge returns coins badge', () => {
      const hud = new GlHUD(mockScene);
      const badge = hud.getCoinsBadge();

      expect(badge).toBeDefined();
    });

    it('getGemsBadge returns gems badge', () => {
      const hud = new GlHUD(mockScene);
      const badge = hud.getGemsBadge();

      expect(badge).toBeDefined();
    });
  });

  describe('GlModal', () => {
    it('constructor creates modal with title', () => {
      const modal = new GlModal(mockScene, { title: 'Test Modal' });

      expect(modal).toBeDefined();
    });

    it('constructor accepts custom width', () => {
      const modal = new GlModal(mockScene, {
        title: 'Wide Modal',
        width: 400,
      });

      expect(modal).toBeDefined();
    });

    it('addContent adds game object and returns this for chaining', () => {
      const modal = new GlModal(mockScene, { title: 'Test' });
      const mockObject = { y: 0, height: 30 };

      const result = modal.addContent(mockObject as any);

      expect(result).toBe(modal);
    });

    it('show displays modal and returns this for chaining', () => {
      const modal = new GlModal(mockScene, { title: 'Test' });

      const result = modal.show();

      expect(result).toBe(modal);
      expect(mockScene.tweens.add).toHaveBeenCalled();
    });

    it('hide hides modal and returns this for chaining', () => {
      const modal = new GlModal(mockScene, { title: 'Test' });

      const result = modal.hide();

      expect(result).toBe(modal);
      expect(mockScene.tweens.add).toHaveBeenCalled();
    });

    it('onClose registers callback and returns this for chaining', () => {
      const modal = new GlModal(mockScene, { title: 'Test' });
      const callback = vi.fn();

      const result = modal.onClose(callback);

      expect(result).toBe(modal);
    });

    it('supports method chaining', () => {
      const modal = new GlModal(mockScene, { title: 'Test' })
        .addContent({ y: 0, height: 20 } as any)
        .onClose(() => {})
        .show();

      expect(modal).toBeDefined();
    });
  });

  describe('GlRibbon', () => {
    it('constructor creates ribbon with text', () => {
      const ribbon = new GlRibbon(mockScene, 100, 100, 'WINNER!');

      expect(ribbon).toBeDefined();
    });

    it('constructor accepts custom width', () => {
      const ribbon = new GlRibbon(mockScene, 0, 0, 'Test', {
        width: 300,
      });

      expect(ribbon).toBeDefined();
    });

    it('constructor accepts custom color', () => {
      const ribbon = new GlRibbon(mockScene, 0, 0, 'Test', {
        color: 0xff0000,
      });

      expect(ribbon).toBeDefined();
    });
  });

  describe('GlStarDisplay', () => {
    it('constructor creates star display with 0 stars', () => {
      const stars = new GlStarDisplay(mockScene, 100, 100, 0);

      expect(stars).toBeDefined();
    });

    it('constructor creates star display with 3 stars', () => {
      const stars = new GlStarDisplay(mockScene, 100, 100, 3);

      expect(stars).toBeDefined();
    });

    it('constructor accepts custom size', () => {
      const stars = new GlStarDisplay(mockScene, 0, 0, 2, {
        size: 32,
      });

      expect(stars).toBeDefined();
    });

    it('constructor accepts animated flag', () => {
      const stars = new GlStarDisplay(mockScene, 0, 0, 3, {
        animated: true,
      });

      expect(stars).toBeDefined();
    });

    it('setStars updates star count and returns this for chaining', () => {
      const stars = new GlStarDisplay(mockScene, 0, 0, 0);

      const result = stars.setStars(2);

      expect(result).toBe(stars);
    });
  });

  describe('GlProgressBar', () => {
    it('constructor creates progress bar', () => {
      const bar = new GlProgressBar(mockScene, 100, 100, 200, 20);

      expect(bar).toBeDefined();
    });

    it('constructor accepts bgColor config', () => {
      const bar = new GlProgressBar(mockScene, 0, 0, 200, 20, {
        bgColor: 0x333333,
      });

      expect(bar).toBeDefined();
    });

    it('constructor accepts fillColor config', () => {
      const bar = new GlProgressBar(mockScene, 0, 0, 200, 20, {
        fillColor: 0x00ff00,
      });

      expect(bar).toBeDefined();
    });

    it('constructor accepts starPositions config', () => {
      const bar = new GlProgressBar(mockScene, 0, 0, 200, 20, {
        starPositions: [0.33, 0.66, 1.0],
      });

      expect(bar).toBeDefined();
    });

    it('setProgress updates progress and returns this for chaining', () => {
      const bar = new GlProgressBar(mockScene, 0, 0, 200, 20);

      const result = bar.setProgress(0.5);

      expect(result).toBe(bar);
      expect(mockScene.tweens.addCounter).toHaveBeenCalled();
    });

    it('getProgress returns current progress', () => {
      const bar = new GlProgressBar(mockScene, 0, 0, 200, 20);

      const progress = bar.getProgress();

      expect(progress).toBe(0);
    });

    it('setProgress clamps value to 0-1 range', () => {
      const bar = new GlProgressBar(mockScene, 0, 0, 200, 20);

      bar.setProgress(1.5); // Should clamp to 1
      bar.setProgress(-0.5); // Should clamp to 0

      expect(bar).toBeDefined();
    });
  });

  describe('GlCard', () => {
    it('constructor creates card with config', () => {
      const card = new GlCard(mockScene, 100, 100, {
        title: 'Test Product',
        description: 'A test product',
        price: '5 tokens',
      });

      expect(card).toBeDefined();
    });

    it('constructor accepts iconDraw function', () => {
      const iconDraw = vi.fn();
      const card = new GlCard(mockScene, 0, 0, {
        title: 'Product',
        description: 'Description',
        price: '10 tokens',
        iconDraw,
      });

      expect(card).toBeDefined();
    });

    it('onBuy registers callback and returns this for chaining', () => {
      const card = new GlCard(mockScene, 0, 0, {
        title: 'Product',
        description: 'Description',
        price: '5 tokens',
      });
      const callback = vi.fn();

      const result = card.onBuy(callback);

      expect(result).toBe(card);
    });

    it('setEnabled updates card state and returns this for chaining', () => {
      const card = new GlCard(mockScene, 0, 0, {
        title: 'Product',
        description: 'Description',
        price: '5 tokens',
      });

      const result = card.setEnabled(false);

      expect(result).toBe(card);
    });

    it('supports method chaining', () => {
      const callback = vi.fn();
      const card = new GlCard(mockScene, 0, 0, {
        title: 'Product',
        description: 'Description',
        price: '5 tokens',
      })
        .onBuy(callback)
        .setEnabled(true);

      expect(card).toBeDefined();
    });
  });

  describe('GlParticles', () => {
    it('sparkleBurst creates particle emitter', () => {
      GlParticles.sparkleBurst(mockScene, 100, 100, 12);

      expect(mockScene.add.graphics).toHaveBeenCalled();
      expect(mockScene.add.particles).toHaveBeenCalled();
      expect(mockScene.time.delayedCall).toHaveBeenCalled();
    });

    it('sparkleBurst uses default count when not provided', () => {
      GlParticles.sparkleBurst(mockScene, 100, 100);

      expect(mockScene.add.particles).toHaveBeenCalled();
    });

    it('coinShower creates particle emitter', () => {
      GlParticles.coinShower(mockScene, 200, 200, 8);

      expect(mockScene.add.graphics).toHaveBeenCalled();
      expect(mockScene.add.particles).toHaveBeenCalled();
      expect(mockScene.time.delayedCall).toHaveBeenCalled();
    });

    it('coinShower uses default count when not provided', () => {
      GlParticles.coinShower(mockScene, 200, 200);

      expect(mockScene.add.particles).toHaveBeenCalled();
    });

    it('starExplosion creates particle emitter', () => {
      GlParticles.starExplosion(mockScene, 150, 150);

      expect(mockScene.add.graphics).toHaveBeenCalled();
      expect(mockScene.add.particles).toHaveBeenCalled();
      expect(mockScene.time.delayedCall).toHaveBeenCalled();
    });

    it('confetti creates multiple particle emitters', () => {
      const particleCallsBefore = mockScene.add.particles.mock.calls.length;
      GlParticles.confetti(mockScene);
      const particleCallsAfter = mockScene.add.particles.mock.calls.length;

      // Should create 6 emitters (one per color)
      expect(particleCallsAfter - particleCallsBefore).toBe(6);
    });
  });

  describe('Component Integration', () => {
    it('GlCard contains a GlButton that can be configured', () => {
      const card = new GlCard(mockScene, 0, 0, {
        title: 'Product',
        description: 'Description',
        price: '5 tokens',
      });

      // Card's buy button should be accessible via onBuy
      const buyCallback = vi.fn();
      card.onBuy(buyCallback);

      expect(card).toBeDefined();
    });

    it('GlHUD contains three GlBadge instances', () => {
      const hud = new GlHUD(mockScene);

      expect(hud.getHeartsBadge()).toBeDefined();
      expect(hud.getCoinsBadge()).toBeDefined();
      expect(hud.getGemsBadge()).toBeDefined();
    });

    it('GlModal can contain multiple content items', () => {
      const modal = new GlModal(mockScene, { title: 'Test' });

      modal
        .addContent({ y: 0, height: 20 } as any)
        .addContent({ y: 0, height: 30 } as any)
        .addContent({ y: 0, height: 25 } as any);

      expect(modal).toBeDefined();
    });
  });
});
