/**
 * Gem Link — LevelSelectScene
 * Owner: Frontend Engineer
 * Task: C03
 *
 * World map with winding path, 30 level nodes, decorations,
 * and vertical scrolling.
 */

import Phaser from 'phaser';
import { GlButton, GlHUD } from '../../ui/UIComponents';
import { fadeIn, fadeTransition } from '../../ui/Transitions';
import { Logger } from '../../utils/Logger';
import {
  SCENE_LEVEL_SELECT,
  SCENE_GAMEPLAY,
  SCENE_MAIN_MENU,
  SCENE_SHOP,
  FONT_FAMILY,
  FONT_SIZE_SMALL,
  GRADIENT_BUTTON_SUCCESS,
  GRADIENT_BUTTON_PRIMARY,
  GAME_WIDTH,
  GAME_HEIGHT,
  EASE_QUAD,
  COLOR_EMERALD,
  ASSET_KEY_BG_LEVEL_SELECT,
  ASSET_KEY_HEADER_LEVEL,
  ASSET_KEY_ARROW_LEFT,
} from '../../utils/Constants';
import { StarRating } from '../../types/game.types';
import { getPlayerProgress } from '../../utils/RegistryHelper';
import { LivesSystem } from '../systems/LivesSystem';
import { GlModal } from '../../ui/UIComponents';

const log = new Logger('LevelSelectScene');

const TOTAL_LEVELS = 30;
const COLS = 5;
const NODE_H_SPACING = 65;
const NODE_V_SPACING = 80;
const MARGIN_TOP = 80;
const MARGIN_LEFT = 40;
const PATH_COLOR = 0xc8a96e;
const PATH_WIDTH = 6;
const NODE_RADIUS_UNLOCKED = 18;
const NODE_RADIUS_LOCKED = 15;
const GOLD_BORDER = 0xffd700;
const GRAY_FILL = 0x888888;
const STAR_DOT_GOLD = 0xffd700;
const STAR_DOT_EMPTY = 0x555555;
const CONTENT_HEIGHT = 600;
const SCROLL_BOUNDS_PADDING = 60;

interface LevelNode {
  x: number;
  y: number;
  level: number;
}

export class LevelSelectScene extends Phaser.Scene {
  private currentLevel: number = 1;
  private starRatings: Record<string, StarRating> = {};
  private nodes: LevelNode[] = [];
  private selectedRing?: Phaser.GameObjects.Graphics;
  private selectedRingTween?: Phaser.Tweens.Tween;
  private playBtnText?: Phaser.GameObjects.Text;
  private noLivesModal: GlModal | null = null;

  constructor() {
    super({ key: SCENE_LEVEL_SELECT });
  }

  init(): void {
    log.info('init', 'LevelSelectScene initialized');
  }

  create(): void {
    log.info('create', 'Building level select UI');
    fadeIn(this);

    const progress = getPlayerProgress(this.registry);
    this.currentLevel = progress.currentLevel ?? 1;
    this.starRatings = progress.stars ?? {};

    log.debug('create', 'Player progress loaded', { currentLevel: this.currentLevel });

    this.buildNodes();
    this.drawBackground();
    this.drawDecorations();
    this.drawPath();
    this.drawLevelNodes();
    this.setupScrolling();

    new GlHUD(this).onAllPlusClick(() => {
      this.scene.start(SCENE_SHOP);
    });

    // Level header sprite at top
    if (this.textures.exists(ASSET_KEY_HEADER_LEVEL)) {
      const header = this.add.image(GAME_WIDTH / 2, 54, ASSET_KEY_HEADER_LEVEL);
      const headerScale = 180 / header.width;
      header.setScale(headerScale);
      header.setScrollFactor(0);
      header.setDepth(900);
      log.debug('create', 'Level header sprite placed');
    }

    const playBtn = new GlButton(this, GAME_WIDTH / 2, 565, `PLAY Level ${this.currentLevel}`, {
      gradient: GRADIENT_BUTTON_SUCCESS,
      width: 200,
      height: 44,
    }).onClick(() => this.onPlayPressed());
    playBtn.setScrollFactor(0);

    // Keep reference to update label when selection changes
    this.playBtnText = (playBtn as any).list?.find(
      (c: any) => c instanceof Phaser.GameObjects.Text
    ) as Phaser.GameObjects.Text | undefined;

    this.addBackButton();

    log.info('create', 'LevelSelectScene ready');
  }

  private buildNodes(): void {
    this.nodes = [];
    for (let i = 0; i < TOTAL_LEVELS; i++) {
      const row = Math.floor(i / COLS);
      const col = i % COLS;
      const isReversed = row % 2 === 1;
      const effectiveCol = isReversed ? COLS - 1 - col : col;

      const x = MARGIN_LEFT + effectiveCol * NODE_H_SPACING;
      const y = MARGIN_TOP + row * NODE_V_SPACING;

      this.nodes.push({ x, y, level: i + 1 });
    }
    log.debug('buildNodes', 'Level nodes positioned', { count: this.nodes.length });
  }

  private drawBackground(): void {
    // Use background image if available
    if (this.textures.exists(ASSET_KEY_BG_LEVEL_SELECT)) {
      const bg = this.add.image(GAME_WIDTH / 2, CONTENT_HEIGHT / 2, ASSET_KEY_BG_LEVEL_SELECT);
      const scaleX = GAME_WIDTH / bg.width;
      const scaleY = CONTENT_HEIGHT / bg.height;
      bg.setScale(Math.max(scaleX, scaleY));
      bg.setDepth(0);
      log.info('drawBackground', 'Level select background image loaded');
      return;
    }

    // Gradient fallback
    const gfx = this.add.graphics();
    const topColor = Phaser.Display.Color.ValueToColor(0x2d6a1e);
    const bottomColor = Phaser.Display.Color.ValueToColor(0x1a4510);

    for (let row = 0; row < CONTENT_HEIGHT; row++) {
      const t = row / CONTENT_HEIGHT;
      const r = Phaser.Math.Linear(topColor.red, bottomColor.red, t);
      const g = Phaser.Math.Linear(topColor.green, bottomColor.green, t);
      const b = Phaser.Math.Linear(topColor.blue, bottomColor.blue, t);
      const color = Phaser.Display.Color.GetColor(r, g, b);
      gfx.fillStyle(color, 1);
      gfx.fillRect(0, row, GAME_WIDTH, 1);
    }
    log.debug('drawBackground', 'Using gradient fallback');
  }

  private drawDecorations(): void {
    const gfx = this.add.graphics();

    // Trees
    const treePositions = [
      { x: 15, y: 120 }, { x: 370, y: 200 }, { x: 20, y: 340 },
      { x: 365, y: 420 }, { x: 10, y: 500 },
    ];

    gfx.fillStyle(0x1b8c2e, 0.6);
    for (const pos of treePositions) {
      gfx.fillTriangle(pos.x, pos.y - 20, pos.x - 12, pos.y + 10, pos.x + 12, pos.y + 10);
      gfx.fillTriangle(pos.x, pos.y - 30, pos.x - 9, pos.y - 5, pos.x + 9, pos.y - 5);
    }

    // Waterfall
    gfx.fillStyle(0x4488cc, 0.5);
    gfx.fillRect(375, 280, 10, 40);
    gfx.fillStyle(0x66aaee, 0.4);
    gfx.fillRect(376, 320, 8, 10);

    log.debug('drawDecorations', 'Decorative elements placed');
  }

  private drawPath(): void {
    const gfx = this.add.graphics();
    gfx.lineStyle(PATH_WIDTH, PATH_COLOR, 0.8);

    for (let i = 0; i < this.nodes.length - 1; i++) {
      const a = this.nodes[i];
      const b = this.nodes[i + 1];
      gfx.beginPath();
      gfx.moveTo(a.x, a.y);

      if (Math.abs(b.x - a.x) > NODE_H_SPACING * 0.5) {
        const midY = (a.y + b.y) / 2;
        gfx.lineTo(a.x, midY);
        gfx.lineTo(b.x, midY);
        gfx.lineTo(b.x, b.y);
      } else {
        gfx.lineTo(b.x, b.y);
      }
      gfx.strokePath();
    }

    log.debug('drawPath', 'Winding path drawn');
  }

  private drawLevelNodes(): void {
    for (const node of this.nodes) {
      const isUnlocked = node.level <= this.currentLevel;
      const isCurrent = node.level === this.currentLevel;
      const stars = (this.starRatings[String(node.level)] ?? 0) as StarRating;

      if (isUnlocked) {
        this.drawUnlockedNode(node, isCurrent, stars);
      } else {
        this.drawLockedNode(node);
      }
    }

    log.debug('drawLevelNodes', 'All level nodes rendered', { unlocked: this.currentLevel });
  }

  private drawUnlockedNode(node: LevelNode, isCurrent: boolean, stars: StarRating): void {
    const gfx = this.add.graphics();

    // Gold-bordered green circle for all unlocked nodes
    gfx.fillStyle(COLOR_EMERALD, 1);
    gfx.fillCircle(node.x, node.y, NODE_RADIUS_UNLOCKED);
    gfx.lineStyle(3, GOLD_BORDER, 1);
    gfx.strokeCircle(node.x, node.y, NODE_RADIUS_UNLOCKED);

    // Selection ring for current/selected level
    if (isCurrent) {
      this.showSelectionRing(node.x, node.y);
    }

    this.add.text(node.x, node.y, `${node.level}`, {
      fontFamily: FONT_FAMILY,
      fontSize: `${FONT_SIZE_SMALL}px`,
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    if (stars > 0) {
      this.drawStarDots(node.x, node.y + NODE_RADIUS_UNLOCKED + 8, stars);
    }

    const hitArea = this.add
      .zone(node.x, node.y, NODE_RADIUS_UNLOCKED * 2 + 10, NODE_RADIUS_UNLOCKED * 2 + 10)
      .setInteractive({ useHandCursor: true });

    hitArea.on('pointerdown', () => {
      log.info('nodePressed', 'Level node tapped', { level: node.level });
      this.currentLevel = node.level;
      this.showSelectionRing(node.x, node.y);
      if (this.playBtnText) {
        this.playBtnText.setText(`PLAY Level ${node.level}`);
      }
    });
  }

  private showSelectionRing(x: number, y: number): void {
    if (this.selectedRingTween) {
      this.selectedRingTween.destroy();
      this.selectedRingTween = undefined;
    }
    if (this.selectedRing) {
      this.selectedRing.destroy();
    }
    this.selectedRing = this.add.graphics();
    this.selectedRing.lineStyle(4, 0xffffff, 0.9);
    this.selectedRing.strokeCircle(x, y, NODE_RADIUS_UNLOCKED + 6);

    this.selectedRingTween = this.tweens.add({
      targets: this.selectedRing,
      alpha: { from: 0.4, to: 1 },
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: EASE_QUAD,
    });
  }

  private drawStarDots(cx: number, cy: number, stars: StarRating): void {
    const gfx = this.add.graphics();
    const dotRadius = 4;
    const dotSpacing = 12;
    const startX = cx - dotSpacing;

    for (let i = 0; i < 3; i++) {
      const filled = i < stars;
      gfx.fillStyle(filled ? STAR_DOT_GOLD : STAR_DOT_EMPTY, filled ? 1 : 0.4);
      gfx.fillCircle(startX + i * dotSpacing, cy, dotRadius);
    }
  }

  private drawLockedNode(node: LevelNode): void {
    const gfx = this.add.graphics();
    // Dark semi-transparent backdrop for visibility over busy backgrounds
    gfx.fillStyle(0x000000, 0.5);
    gfx.fillCircle(node.x, node.y, NODE_RADIUS_LOCKED + 2);
    gfx.fillStyle(GRAY_FILL, 0.85);
    gfx.fillCircle(node.x, node.y, NODE_RADIUS_LOCKED);
    gfx.lineStyle(2, 0x555555, 0.8);
    gfx.strokeCircle(node.x, node.y, NODE_RADIUS_LOCKED);

    // Lock icon
    const lockGfx = this.add.graphics();
    lockGfx.fillStyle(0x444444, 1);
    lockGfx.fillRoundedRect(node.x - 5, node.y - 2, 10, 8, 2);
    lockGfx.lineStyle(2, 0x444444, 1);
    lockGfx.beginPath();
    lockGfx.arc(node.x, node.y - 2, 5, Math.PI, 0, false);
    lockGfx.strokePath();

    this.add.text(node.x, node.y + NODE_RADIUS_LOCKED + 8, `${node.level}`, {
      fontFamily: FONT_FAMILY,
      fontSize: '12px',
      color: '#999999',
      fontStyle: 'bold',
    }).setOrigin(0.5);
  }

  private setupScrolling(): void {
    const totalHeight = CONTENT_HEIGHT + SCROLL_BOUNDS_PADDING;
    const cam = this.cameras.main;

    cam.setBounds(0, 0, GAME_WIDTH, totalHeight);
    cam.setScroll(0, 0);

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown) {
        cam.scrollY -= (pointer.y - pointer.prevPosition.y);
        cam.scrollY = Phaser.Math.Clamp(cam.scrollY, 0, totalHeight - GAME_HEIGHT);
      }
    }, this);

    log.debug('setupScrolling', 'Camera scrolling enabled', { contentHeight: totalHeight });
  }

  private addBackButton(): void {
    if (this.textures.exists(ASSET_KEY_ARROW_LEFT)) {
      const arrow = this.add.image(36, 565, ASSET_KEY_ARROW_LEFT);
      const arrowScale = 32 / Math.max(arrow.width, arrow.height);
      arrow.setScale(arrowScale);
      arrow.setScrollFactor(0);
      arrow.setInteractive({ useHandCursor: true });
      arrow.on('pointerdown', () => {
        log.info('addBackButton', 'Navigating to main menu');
        fadeTransition(this, SCENE_MAIN_MENU);
      });
    } else {
      const backBtn = new GlButton(this, 40, 565, '< BACK', {
        width: 80,
        height: 36,
        gradient: GRADIENT_BUTTON_PRIMARY,
      }).onClick(() => {
        log.info('addBackButton', 'Navigating to main menu');
        fadeTransition(this, SCENE_MAIN_MENU);
      });
      backBtn.setScrollFactor(0);
    }
  }

  private onPlayPressed(): void {
    log.info('onPlayPressed', 'Play button pressed', { level: this.currentLevel });

    // Check if player has lives
    const progress = getPlayerProgress(this.registry);
    const livesSystem = LivesSystem.getInstance();
    const status = livesSystem.getStatus(progress);

    if (!status.canPlay) {
      log.info('onPlayPressed', 'No lives available - showing modal', {
        lives: status.currentLives,
        timeUntilNextLife: status.timeUntilNextLife,
      });
      this.showNoLivesModal(status.timeUntilNextLife);
      return;
    }

    log.info('onPlayPressed', 'Starting gameplay', { level: this.currentLevel });
    this.registry.set('selectedLevel', this.currentLevel);
    fadeTransition(this, SCENE_GAMEPLAY);
  }

  /**
   * Show modal when player has no lives.
   * Displays time until next life regenerates.
   */
  private showNoLivesModal(timeUntilNextLife: string): void {
    if (this.noLivesModal) return;

    log.info('showNoLivesModal', 'Displaying no lives modal');

    this.noLivesModal = new GlModal(this, { title: 'No Lives!', width: 320 });

    const msg = this.add.text(0, 0, 'You have run out of lives.', {
      fontFamily: FONT_FAMILY,
      fontSize: `${FONT_SIZE_SMALL}px`,
      color: '#AAAAAA',
      align: 'center',
    }).setOrigin(0.5, 0);
    this.noLivesModal.addContent(msg);

    const timerMsg = this.add.text(0, 0, `Next life in: ${timeUntilNextLife}`, {
      fontFamily: FONT_FAMILY,
      fontSize: `${FONT_SIZE_SMALL}px`,
      color: '#FFD700',
      align: 'center',
    }).setOrigin(0.5, 0);
    this.noLivesModal.addContent(timerMsg);

    const okBtn = new GlButton(this, 0, 0, 'OK', {
      width: 160, height: 40, gradient: GRADIENT_BUTTON_PRIMARY,
    });
    okBtn.onClick(() => {
      log.info('showNoLivesModal', 'OK pressed');
      this.hideNoLivesModal();
    });
    this.noLivesModal.addContent(okBtn, 40);

    this.noLivesModal.onClose(() => {
      this.hideNoLivesModal();
    });

    this.noLivesModal.show();
  }

  /**
   * Hide the no lives modal.
   */
  private hideNoLivesModal(): void {
    if (this.noLivesModal) {
      this.noLivesModal.destroy();
      this.noLivesModal = null;
    }
  }
}
