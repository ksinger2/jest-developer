/**
 * Gem Link — Registry Helper
 * Owner: Game Engineer
 * Task: TASK-005
 *
 * Typed wrapper for Phaser registry access.
 * All registry reads/writes for player progress go through this module.
 */

import Phaser from 'phaser';
import { PlayerProgress, DEFAULT_PLAYER_PROGRESS } from '../types/game.types';

const REGISTRY_KEY_PLAYER_PROGRESS = 'playerProgress';

export function getPlayerProgress(registry: Phaser.Data.DataManager): PlayerProgress {
  return (registry.get(REGISTRY_KEY_PLAYER_PROGRESS) as PlayerProgress) ?? DEFAULT_PLAYER_PROGRESS;
}

export function setPlayerProgress(registry: Phaser.Data.DataManager, progress: PlayerProgress): void {
  registry.set(REGISTRY_KEY_PLAYER_PROGRESS, progress);
}
