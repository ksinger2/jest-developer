/**
 * Gem Link — LevelCompleteScene
 * Owner: Frontend Engineer
 * Task: C05
 *
 * Displays level results with animated stars, score counter,
 * celebration effects, and navigation buttons.
 */

import Phaser from 'phaser';
import { Logger } from '../../utils/Logger';
import {
  GlButton,
  GlHUD,
  GlRibbon,
  GlStarDisplay,
  GlParticles,
} from '../../ui/UIComponents';
import { CelebrationSystem } from '../../ui/CelebrationSystem';
import { OfferManager } from '../systems/OfferManager';
import { fadeIn } from '../../ui/Transitions';
import {
  SCENE_LEVEL_COMPLETE,
  SCENE_GAMEPLAY,
  SCENE_MAIN_MENU,
  FONT_FAMILY,
  FONT_SIZE_SMALL,
  FONT_SIZE_MEDIUM,
  FONT_SIZE_LARGE,
  FONT_SIZE_XS,
  GAME_WIDTH,
  UI_COLOR_TEXT_DIM,
  GRADIENT_BUTTON_SUCCESS,
  GRADIENT_BUTTON_PRIMARY,
  GRADIENT_BUTTON_DANGER,
} from '../../utils/Constants';
import { LevelResult, StarRating } from '../../types/game.types';
import { getPlayerProgress, setPlayerProgress } from '../../utils/RegistryHelper';
import { PlayerDataManager } from '../../sdk/PlayerDataManager';

const log = new Logger('LevelCompleteScene');

const MAX_LEVEL = 30;
const SCORE_ROLL_DURATION = 1200;
const CELEBRATION_DELAY = 400;
const CENTER_X = GAME_WIDTH / 2;

export class LevelCompleteScene extends Phaser.Scene {
  private result!: LevelResult;
  private scoreText!: Phaser.GameObjects.Text;
  private offerManager!: OfferManager;

  constructor() {
    super({ key: SCENE_LEVEL_COMPLETE });
  }

  init(data: LevelResult): void {
    log.info('init', 'LevelCompleteScene initialized', { levelId: data?.levelId });

    if (!data || typeof data.levelId !== 'number' || typeof data.score !== 'number') {
      log.error('init', 'Invalid LevelResult data received', { data });
      this.result = {
        levelId: 1,
        score: 0,
        stars: 0 as StarRating,
        passed: false,
        movesUsed: 0,
        movesRemaining: 0,
        durationSeconds: 0,
        totalCascades: 0,
      };
      return;
    }

    this.result = data;
    log.debug('init', 'Result stored', {
      levelId: data.levelId,
      passed: data.passed,
      stars: data.stars,
      score: data.score,
    });
  }

  create(): void {
    log.info('create', 'Building level complete UI');

    fadeIn(this);

    if (this.result.passed) {
      this.updatePlayerProgress();
    }

    this.buildHUD();
    this.buildStarDisplay();
    this.buildRibbon();
    this.buildScoreDisplay();
    this.buildStats();
    this.buildActionButtons();
    this.buildMenuButton();
    this.buildOfferBanner();

    if (this.result.passed) {
      this.time.delayedCall(CELEBRATION_DELAY, () => {
        log.debug('create', 'Triggering celebration', { stars: this.result.stars });
        CelebrationSystem.celebrateLevelComplete(this, this.result.stars);

        if (this.result.stars === 3) {
          log.debug('create', 'Perfect score — extra confetti');
          GlParticles.confetti(this);
        }
      });
    }

    log.info('create', 'LevelCompleteScene ready');
  }

  private updatePlayerProgress(): void {
    log.info('updatePlayerProgress', 'Persisting progress', {
      levelId: this.result.levelId,
      stars: this.result.stars,
    });

    try {
      const progress = getPlayerProgress(this.registry);
      const levelKey = String(this.result.levelId);

      const previousStars = (progress.stars[levelKey] ?? 0) as number;
      if (this.result.stars > previousStars) {
        progress.stars[levelKey] = this.result.stars as StarRating;
      }

      if (this.result.levelId >= progress.currentLevel && this.result.levelId < MAX_LEVEL) {
        progress.currentLevel = this.result.levelId + 1;
      }

      progress.totalStars = Object.values(progress.stars).reduce(
        (sum: number, s) => sum + (s || 0), 0,
      );

      setPlayerProgress(this.registry, progress);

      const pdm = new PlayerDataManager();
      pdm.saveProgress(progress);

      log.info('updatePlayerProgress', 'Progress saved', {
        currentLevel: progress.currentLevel,
        totalStars: progress.totalStars,
      });
    } catch (err) {
      log.error('updatePlayerProgress', 'Failed to persist progress', err);
    }
  }

  private buildHUD(): void {
    new GlHUD(this);
    log.debug('buildHUD', 'HUD rendered');
  }

  private buildStarDisplay(): void {
    new GlStarDisplay(this, CENTER_X, 105, this.result.stars);
    log.debug('buildStarDisplay', 'Stars displayed', { stars: this.result.stars });
  }

  private buildRibbon(): void {
    const text = this.result.passed ? 'Level Complete!' : 'Level Failed';
    new GlRibbon(this, CENTER_X, 170, text);
    log.debug('buildRibbon', 'Ribbon rendered', { text });
  }

  private buildScoreDisplay(): void {
    this.scoreText = this.add.text(CENTER_X, 220, '0', {
      fontFamily: FONT_FAMILY,
      fontSize: `${FONT_SIZE_LARGE}px`,
      color: '#FFD700',
    }).setOrigin(0.5);

    const counter = { value: 0 };
    this.tweens.add({
      targets: counter,
      value: this.result.score,
      duration: SCORE_ROLL_DURATION,
      ease: 'Cubic.easeOut',
      onUpdate: () => {
        this.scoreText.setText(Math.floor(counter.value).toLocaleString());
      },
      onComplete: () => {
        this.scoreText.setText(this.result.score.toLocaleString());
        log.debug('buildScoreDisplay', 'Score roll-up complete', { score: this.result.score });
      },
    });

    log.debug('buildScoreDisplay', 'Score counter animating', { target: this.result.score });
  }

  private buildStats(): void {
    const baseY = 270;
    const lineHeight = 24;
    const dimColor = `#${UI_COLOR_TEXT_DIM.toString(16).padStart(6, '0')}`;
    const stats = [
      { label: 'Moves Used', value: `${this.result.movesUsed}` },
      { label: 'Cascades', value: `${this.result.totalCascades}` },
    ];

    stats.forEach((stat, i) => {
      const y = baseY + i * lineHeight;

      this.add.text(CENTER_X - 80, y, stat.label, {
        fontFamily: FONT_FAMILY,
        fontSize: `${FONT_SIZE_XS}px`,
        color: dimColor,
      }).setOrigin(0, 0.5);

      this.add.text(CENTER_X + 80, y, stat.value, {
        fontFamily: FONT_FAMILY,
        fontSize: `${FONT_SIZE_SMALL}px`,
        color: '#FFFFFF',
      }).setOrigin(1, 0.5);
    });

    log.debug('buildStats', 'Stats rendered');
  }

  private buildActionButtons(): void {
    const showNext = this.result.passed && this.result.levelId < MAX_LEVEL;

    if (showNext) {
      new GlButton(this, CENTER_X, 340, 'Next Level', {
        width: 200,
        height: 48,
        gradient: GRADIENT_BUTTON_SUCCESS,
        fontSize: FONT_SIZE_MEDIUM,
      }).onClick(() => this.onNextLevel());
    }

    const retryY = showNext ? 400 : 350;
    new GlButton(this, CENTER_X, retryY, 'Retry', {
      width: 160,
      height: 40,
      gradient: GRADIENT_BUTTON_PRIMARY,
      fontSize: FONT_SIZE_SMALL,
    }).onClick(() => this.onRetry());

    log.debug('buildActionButtons', 'Buttons rendered', { showNext });
  }

  private buildMenuButton(): void {
    new GlButton(this, CENTER_X, 455, 'Menu', {
      width: 120,
      height: 36,
      gradient: GRADIENT_BUTTON_DANGER,
      fontSize: FONT_SIZE_SMALL,
    }).onClick(() => this.onMenu());

    log.debug('buildMenuButton', 'Menu button rendered');
  }

  private buildOfferBanner(): void {
    try {
      this.offerManager = OfferManager.getInstance();
      const progress = getPlayerProgress(this.registry);
      const canClaim = this.offerManager.canCollectFreeGift(progress);

      if (!canClaim) {
        const remaining = this.offerManager.getFreeGiftTimeRemaining(progress);
        if (remaining <= 0) return;

        const bannerY = 490;
        this.add.rectangle(CENTER_X, bannerY, 340, 48, 0x2a1a4a, 0.9)
          .setStrokeStyle(1, 0xffd700);

        this.add.text(CENTER_X, bannerY - 8, 'Free Gift!', {
          fontFamily: FONT_FAMILY,
          fontSize: `${FONT_SIZE_SMALL}px`,
          color: '#FFD700',
        }).setOrigin(0.5);

        const countdownText = this.add.text(CENTER_X, bannerY + 10, '', {
          fontFamily: FONT_FAMILY,
          fontSize: `${FONT_SIZE_XS}px`,
          color: `#${UI_COLOR_TEXT_DIM.toString(16).padStart(6, '0')}`,
        }).setOrigin(0.5);

        this.time.addEvent({
          delay: 1000,
          loop: true,
          callback: () => {
            const rem = this.offerManager.getFreeGiftTimeRemaining(progress);
            countdownText.setText(this.offerManager.formatTimeRemaining(rem));
          },
        });
      }

      log.debug('buildOfferBanner', 'Offer banner rendered', { canClaim });
    } catch (err) {
      log.error('buildOfferBanner', 'Failed to build offer banner', err);
    }
  }

  private onNextLevel(): void {
    const nextId = this.result.levelId + 1;
    log.info('onNextLevel', 'Navigating to next level', { nextId });
    this.scene.start(SCENE_GAMEPLAY, { levelId: nextId });
  }

  private onRetry(): void {
    log.info('onRetry', 'Retrying level', { levelId: this.result.levelId });
    this.scene.start(SCENE_GAMEPLAY, { levelId: this.result.levelId });
  }

  private onMenu(): void {
    log.info('onMenu', 'Returning to main menu');
    this.scene.start(SCENE_MAIN_MENU);
  }
}
