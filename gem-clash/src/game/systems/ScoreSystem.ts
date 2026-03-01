/**
 * Gem Link — Score System
 * Owner: Game Engineer
 *
 * Tracks score, calculates points from matches, applies cascade multipliers,
 * and determines star rating at level end.
 *
 * Scoring rules:
 * - Base: 50 points per gem in a match
 * - 4-match bonus: +100
 * - 5-match bonus: +250
 * - L/T shape bonus: +150
 * - Cascade multiplier: 1x, 1.5x, 2x, 2.5x, ... (+0.5 per cascade depth)
 * - Remaining moves bonus: 100 per move at level end
 */

import { Logger } from '../../utils/Logger';
import { Match, SpecialGemType, StarRating } from '../../types/game.types';
import {
  BASE_MATCH_POINTS,
  CASCADE_MULTIPLIER,
  FOUR_MATCH_BONUS,
  FIVE_MATCH_BONUS,
  SHAPE_MATCH_BONUS,
} from '../../utils/Constants';

const logger = new Logger('ScoreSystem');

/** Bonus points per remaining move at level end */
const REMAINING_MOVES_BONUS = 100;

/** Result of scoring a set of matches in one cascade step */
export interface ScoreBreakdown {
  /** Points from this cascade step (before multiplier) */
  basePoints: number;
  /** Cascade multiplier applied */
  multiplier: number;
  /** Final points after multiplier */
  totalPoints: number;
  /** Number of gems cleared */
  gemsCleared: number;
}

export class ScoreSystem {
  /** Current total score */
  private score: number = 0;

  /** Current cascade depth (resets after each player move) */
  private cascadeDepth: number = 0;

  /** Total cascades this level (for stats) */
  private totalCascades: number = 0;

  /** Best combo chain this level */
  private bestCombo: number = 0;

  /** Star thresholds for current level [1star, 2star, 3star] */
  private starThresholds: [number, number, number] = [0, 0, 0];

  constructor() {
    logger.info('constructor', 'ScoreSystem created');
  }

  /**
   * Initialize for a new level.
   */
  init(starThresholds: [number, number, number]): void {
    this.score = 0;
    this.cascadeDepth = 0;
    this.totalCascades = 0;
    this.bestCombo = 0;
    this.starThresholds = starThresholds;

    logger.info('init', 'ScoreSystem initialized', { starThresholds });
  }

  /**
   * Signal start of a new cascade chain (after each player move).
   */
  startCascadeChain(): void {
    this.cascadeDepth = 0;
    logger.debug('startCascadeChain', 'New cascade chain started');
  }

  /**
   * Score a set of matches from one cascade step.
   * Advances cascade depth and applies multiplier.
   */
  scoreMatches(
    matches: Match[],
    specialGemsTriggered: SpecialGemType[] = [],
    totalGemsCleared: number = 0,
  ): ScoreBreakdown {
    this.cascadeDepth++;

    if (this.cascadeDepth > 1) {
      this.totalCascades++;
      if (this.cascadeDepth > this.bestCombo) {
        this.bestCombo = this.cascadeDepth;
      }
    }

    // Calculate base points
    let basePoints = 0;

    // Points per gem in matches
    const gemsInMatches = totalGemsCleared > 0
      ? totalGemsCleared
      : matches.reduce((sum, m) => sum + m.gems.length, 0);
    basePoints += gemsInMatches * BASE_MATCH_POINTS;

    // Length bonuses
    for (const match of matches) {
      if (match.length >= 5) {
        basePoints += FIVE_MATCH_BONUS;
      } else if (match.length === 4) {
        basePoints += FOUR_MATCH_BONUS;
      }
    }

    // Shape bonuses (L/T = intersection of H+V)
    for (const special of specialGemsTriggered) {
      if (special === SpecialGemType.BOMB) {
        basePoints += SHAPE_MATCH_BONUS;
      }
    }

    // Cascade multiplier: 1x, 1.5x, 2x, 2.5x, ...
    const multiplier = 1 + (this.cascadeDepth - 1) * CASCADE_MULTIPLIER;
    const totalPoints = Math.round(basePoints * multiplier);

    this.score += totalPoints;

    const breakdown: ScoreBreakdown = {
      basePoints,
      multiplier,
      totalPoints,
      gemsCleared: gemsInMatches,
    };

    logger.info('scoreMatches', `Cascade ${this.cascadeDepth}: +${totalPoints} pts (${basePoints} × ${multiplier})`, {
      matches: matches.length,
      gemsCleared: gemsInMatches,
      totalScore: this.score,
    });

    return breakdown;
  }

  /**
   * Add arbitrary bonus points (e.g., from booster activations).
   */
  addBonusPoints(points: number): void {
    this.score += points;
    logger.info('addBonusPoints', `+${points} bonus points`, { totalScore: this.score });
  }

  /**
   * Add bonus points for remaining moves at level end.
   */
  addRemainingMovesBonus(movesRemaining: number): number {
    const bonus = movesRemaining * REMAINING_MOVES_BONUS;
    this.score += bonus;

    logger.info('addRemainingMovesBonus', `+${bonus} bonus from ${movesRemaining} remaining moves`, {
      totalScore: this.score,
    });

    return bonus;
  }

  /**
   * Calculate star rating based on current score.
   */
  calculateStars(): StarRating {
    if (this.score >= this.starThresholds[2]) return 3;
    if (this.score >= this.starThresholds[1]) return 2;
    if (this.score >= this.starThresholds[0]) return 1;
    return 0;
  }

  /**
   * Check if the minimum passing score has been reached.
   */
  hasPassed(): boolean {
    return this.score >= this.starThresholds[0];
  }

  /**
   * Get current score.
   */
  getScore(): number {
    return this.score;
  }

  /**
   * Get current cascade depth.
   */
  getCascadeDepth(): number {
    return this.cascadeDepth;
  }

  /**
   * Get total cascades triggered this level.
   */
  getTotalCascades(): number {
    return this.totalCascades;
  }

  /**
   * Get the best combo chain length.
   */
  getBestCombo(): number {
    return this.bestCombo;
  }

  /**
   * Get star thresholds.
   */
  getStarThresholds(): [number, number, number] {
    return [...this.starThresholds] as [number, number, number];
  }
}
