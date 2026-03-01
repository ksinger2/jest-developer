/**
 * Gem Link — Scene Transitions
 * Owner: Game Engineer
 * Task: D01
 *
 * Smooth visual transition utilities for scene changes.
 */

import Phaser from 'phaser';
import { Logger } from '../utils/Logger';
import { GAME_WIDTH, GAME_HEIGHT, BACKGROUND_COLOR, EASE_QUAD } from '../utils/Constants';

const log = new Logger('Transitions');

/**
 * Fade out to dark purple screen
 */
export function fadeOut(scene: Phaser.Scene, duration: number = 300): Promise<void> {
  log.debug('fadeOut', 'Starting fade out', { duration });

  return new Promise((resolve) => {
    const rect = scene.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, BACKGROUND_COLOR);
    rect.setOrigin(0, 0);
    rect.setDepth(9999);
    rect.setAlpha(0);

    scene.tweens.add({
      targets: rect,
      alpha: 1,
      duration,
      ease: EASE_QUAD,
      onComplete: () => {
        log.info('fadeOut', 'Fade out complete');
        resolve();
      },
    });
  });
}

/**
 * Fade in from dark purple screen
 */
export function fadeIn(scene: Phaser.Scene, duration: number = 300): Promise<void> {
  log.debug('fadeIn', 'Starting fade in', { duration });

  return new Promise((resolve) => {
    const rect = scene.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, BACKGROUND_COLOR);
    rect.setOrigin(0, 0);
    rect.setDepth(9999);
    rect.setAlpha(1);

    scene.tweens.add({
      targets: rect,
      alpha: 0,
      duration,
      ease: EASE_QUAD,
      onComplete: () => {
        rect.destroy();
        log.info('fadeIn', 'Fade in complete');
        resolve();
      },
    });
  });
}

/**
 * Fade transition between scenes
 */
export function fadeTransition(
  scene: Phaser.Scene,
  targetScene: string,
  data?: object,
  duration: number = 250,
): void {
  log.info('fadeTransition', 'Transitioning to scene', { targetScene });

  fadeOut(scene, duration).then(() => {
    scene.scene.start(targetScene, data);
  });
}

/**
 * Slide scene content off-screen via camera scroll
 */
export function slideOut(
  scene: Phaser.Scene,
  direction: 'left' | 'right' | 'up' | 'down',
  duration: number = 300,
): Promise<void> {
  log.debug('slideOut', 'Starting slide out', { direction, duration });

  return new Promise((resolve) => {
    const camera = scene.cameras.main;
    const tweenConfig: Record<string, unknown> = {
      targets: camera,
      duration,
      ease: EASE_QUAD,
      onComplete: () => {
        log.info('slideOut', 'Slide out complete', { direction });
        resolve();
      },
    };

    switch (direction) {
      case 'left':
        tweenConfig.scrollX = -GAME_WIDTH;
        break;
      case 'right':
        tweenConfig.scrollX = GAME_WIDTH;
        break;
      case 'up':
        tweenConfig.scrollY = -GAME_HEIGHT;
        break;
      case 'down':
        tweenConfig.scrollY = GAME_HEIGHT;
        break;
    }

    scene.tweens.add(tweenConfig as Phaser.Types.Tweens.TweenBuilderConfig);
  });
}

/**
 * Scale out scene via camera zoom
 */
export function scaleOut(scene: Phaser.Scene, duration: number = 300): Promise<void> {
  log.debug('scaleOut', 'Starting scale out', { duration });

  return new Promise((resolve) => {
    const camera = scene.cameras.main;

    scene.tweens.add({
      targets: camera,
      zoom: 0,
      duration,
      ease: EASE_QUAD,
      onComplete: () => {
        log.info('scaleOut', 'Scale out complete');
        resolve();
      },
    });
  });
}
