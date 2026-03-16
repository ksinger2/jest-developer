/**
 * Gem Link — GameplayScene
 * Owner: Game Engineer
 *
 * Full match-3 gameplay with interactive board, swap detection,
 * match resolution, cascades, scoring, and win/lose conditions.
 * Includes score progress bar with animated star markers and
 * two-tier fail state modal.
 *
 * Layout optimized for Jest webview (~600px viewport).
 */

import Phaser from 'phaser';
import { Logger } from '../../utils/Logger';
import {
  SCENE_GAMEPLAY,
  SCENE_LEVEL_COMPLETE,
  SCENE_MAIN_MENU,
  FONT_FAMILY,
  FONT_SIZE_SMALL,
  FONT_SIZE_MEDIUM,
  GEM_SIZE,
  GEM_SPACING,
  SWAP_DURATION_MS,
  CLEAR_DURATION_MS,
  FALL_DURATION_MS,
  SPAWN_DURATION_MS,
  CASCADE_DELAY_MS,
  SCORE_POPUP_DURATION_MS,
  UI_COLOR_ACCENT,
  UI_COLOR_TEXT,
  UI_COLOR_DANGER,
  UI_COLOR_SUCCESS,
  UI_COLOR_SECONDARY,
  UI_COLOR_TEXT_DIM,
  UI_COLOR_PRIMARY,
  UI_COLOR_WARNING,
  MARGIN_EDGE,
  GRADIENT_BOARD_BG,
  GAME_WIDTH,
  GAME_HEIGHT,
  GAMEPLAY_HEADER_Y,
  GAMEPLAY_HUD_ROW_Y,
  GAMEPLAY_PROGRESS_Y,
  GAMEPLAY_BOARD_Y,
  GAMEPLAY_BOOSTER_Y,
  GAMEPLAY_HEADER_FONT_SIZE,
  GAMEPLAY_COMPACT_PILL_HEIGHT,
  GAMEPLAY_COMPACT_PILL_RADIUS,
  BOOSTER_SLOT_SIZE,
  BOOSTER_SLOT_GAP,
  BOOSTER_COUNT_BADGE_RADIUS,
  BOOSTER_COUNT_FONT_SIZE,
  MOVES_WARNING_THRESHOLD,
  MOVES_DANGER_THRESHOLD,
  ASSET_KEY_HAMMER,
  ASSET_KEY_RAINBOW,
  GRADIENT_BUTTON_DANGER,
  GRADIENT_BUTTON_SUCCESS,
  GRADIENT_BUTTON_PRIMARY,
  GRADIENT_BUTTON_GOLD,
  ASSET_KEY_BG_GAMEPLAY,
  ASSET_KEY_PROGRESS_EMPTY,
  ASSET_KEY_PROGRESS_FULL,
  ASSET_KEY_FRAME_BOARD,
  DIGIT_TEXTURE_KEYS,
  Z_BOARD,
  Z_GEMS,
} from '../../utils/Constants';
import { SpriteNumber } from '../../ui/SpriteNumber';
import {
  GemData,
  GemState,
  SpecialGemType,
  GridPosition,
  SwapAction,
  LevelResult,
  GRID_ROWS,
  GRID_COLS,
  GameEvent,
  REMAP_MAX_PER_ATTEMPT,
  ProductSKU,
  PlayerProgress,
} from '../../types/game.types';
import { getPlayerProgress, setPlayerProgress } from '../../utils/RegistryHelper';
import { PlayerDataManager } from '../../sdk/PlayerDataManager';
import { PaymentManager } from '../../sdk/PaymentManager';
import { Gem } from '../objects/Gem';
import { BoardManager } from '../systems/BoardManager';
import { findAllMatches, hasValidMoves, wouldSwapCreateMatch, getSpecialGemAffectedPositions } from '../systems/MatchEngine';
import { ScoreSystem } from '../systems/ScoreSystem';
import { LevelManager, RawLevelData } from '../systems/LevelManager';
import { InputHandler } from '../systems/InputHandler';
import { LivesSystem } from '../systems/LivesSystem';
import { CelebrationSystem } from '../../ui/CelebrationSystem';
import { GlModal, GlButton } from '../../ui/UIComponents';
import { AnalyticsManager } from '../../analytics/AnalyticsManager';

/** Convert a numeric color to a hex string */
const colorHex = (c: number): string => `#${c.toString(16).padStart(6, '0')}`;

/** Fail modal threshold — ratio of finalScore / oneStarThreshold */
const FAIL_CLOSE_RATIO = 0.70;

interface GameplayData {
  levelId?: number;
}

/** Game state machine states */
enum PlayState {
  LOADING = 'loading',
  IDLE = 'idle',
  SWAPPING = 'swapping',
  CHECKING = 'checking',
  CLEARING = 'clearing',
  FALLING = 'falling',
  GAME_OVER = 'game_over',
  BOOSTER_TARGETING = 'booster_targeting',
}

/** Which booster targeting mode is active */
type BoosterTargetMode = 'hammer' | 'rainbow' | null;

export class GameplayScene extends Phaser.Scene {
  private logger = new Logger('GameplayScene');
  private levelId!: number;

  // ── Systems ──
  private boardManager!: BoardManager;
  private scoreSystem!: ScoreSystem;
  private levelManager!: LevelManager;
  private inputHandler!: InputHandler;

  // ── Visual state ──
  /** Map of gemId → Gem game object */
  private gemSprites: Map<string, Gem> = new Map();

  /** Board origin in screen coordinates */
  private boardX: number = 0;
  private boardY: number = 0;
  private cellSize: number = 0;

  /** Board background graphics */
  private boardGfx!: Phaser.GameObjects.Graphics;

  // ── HUD elements ──
  private scoreText!: Phaser.GameObjects.Text;
  private movesText!: Phaser.GameObjects.Text;
  private scorePillGfx!: Phaser.GameObjects.Graphics;
  private movesPillGfx!: Phaser.GameObjects.Graphics;
  private displayedScore: number = 0;
  private scoreCounterTimer: Phaser.Time.TimerEvent | null = null;
  private spriteScore?: SpriteNumber;
  private boardGlowGfx!: Phaser.GameObjects.Graphics;

  // ── Booster tray elements ──
  private boosterSlotGfx: Phaser.GameObjects.Graphics[] = [];
  private boosterCountTexts: Phaser.GameObjects.Text[] = [];
  private boosterZones: Phaser.GameObjects.Zone[] = [];

  // ── Progress bar elements ──
  private progressBarGfx!: Phaser.GameObjects.Graphics;
  private progressBarBgGfx!: Phaser.GameObjects.Graphics;
  private progressBarEmptyImg?: Phaser.GameObjects.Image;
  private progressBarFullImg?: Phaser.GameObjects.Image;
  private usingSpriteProgress: boolean = false;
  private progressBarX: number = 0;
  private progressBarY: number = 0;
  private progressBarWidth: number = 0;
  private progressBarHeight: number = 16;
  /** Star marker graphics objects (3 total) */
  private starMarkers: Phaser.GameObjects.Graphics[] = [];
  /** Star marker x positions on the progress bar */
  private starMarkerXPositions: number[] = [];
  /** Track which stars have been earned (for animation) */
  private earnedStars: boolean[] = [false, false, false];
  /** Pulse tween reference for "close to next star" pulse */
  private starPulseTween: Phaser.Tweens.Tween | null = null;
  /** Index of star currently pulsing (-1 = none) */
  private pulsingStarIndex: number = -1;

  // ── Game state ──
  private playState: PlayState = PlayState.LOADING;

  /** GlModal for the quit confirmation — null when not created */
  private confirmModal: GlModal | null = null;

  /** GlModal for the fail state — null when not created */
  private failModal: GlModal | null = null;

  // ── Remap booster state ──
  /** How many remaps used this attempt */
  private remapsUsedThisAttempt: number = 0;
  /** Available remap tokens (loaded from player progress) */
  private remapTokensAvailable: number = 0;
  /** Whether this player has used their first-ever free remap */
  private hasUsedFreeRemap: boolean = false;
  /** GlModal for the extra moves / remap confirmation — null when not created */
  private extraMovesModal: GlModal | null = null;

  // ── Booster targeting state ──
  /** Which booster targeting mode is active (null = none) */
  private boosterTargetMode: BoosterTargetMode = null;
  /** Overlay container shown during booster targeting */
  private boosterTargetOverlay: Phaser.GameObjects.Container | null = null;
  /** Board tap zone used during booster targeting */
  private boosterBoardZone: Phaser.GameObjects.Zone | null = null;

  constructor() {
    super({ key: SCENE_GAMEPLAY });
    this.logger.info('constructor', 'GameplayScene instance created');
  }

  init(data: GameplayData): void {
    const rawLevel = data?.levelId;
    this.logger.info('init', 'GameplayScene entered', { levelId: rawLevel });

    if (typeof rawLevel === 'number' && rawLevel >= 1 && rawLevel <= 30) {
      this.levelId = rawLevel;
    } else {
      this.logger.warn('init', `Invalid levelId "${rawLevel}" — falling back to 1`);
      this.levelId = 1;
    }

    this.confirmModal = null;
    this.failModal = null;
    this.extraMovesModal = null;
    this.remapsUsedThisAttempt = 0;
    this.boosterTargetMode = null;
    this.boosterTargetOverlay = null;
    this.boosterBoardZone = null;
    this.playState = PlayState.LOADING;
    this.gemSprites = new Map();
    this.displayedScore = 0;
    this.scoreCounterTimer = null;
    this.logger.info('init', `Level set to ${this.levelId}`);
  }

  create(): void {
    this.logger.info('create', `Level ${this.levelId} setup started`);

    try {
      const centerX = GAME_WIDTH / 2;
      this.cellSize = GEM_SIZE + GEM_SPACING;

      // ── Background image (if available) ──
      this.buildBackground();

      // ── Initialize systems ──
      this.boardManager = new BoardManager();
      this.scoreSystem = new ScoreSystem();
      this.levelManager = new LevelManager();
      this.inputHandler = new InputHandler(this);

      // Load level catalog from preloaded cache
      const levelsJson = this.cache.json.get('levels') as RawLevelData[];
      if (!levelsJson) {
        this.logger.error('create', 'Level data not found in cache!');
        return;
      }
      this.levelManager.loadCatalog(levelsJson);

      // Start the level
      const levelData = this.levelManager.startLevel(this.levelId);
      if (!levelData) {
        this.logger.error('create', `Failed to load level ${this.levelId}`);
        return;
      }

      // Initialize score system with star thresholds
      this.scoreSystem.init(levelData.starThresholds);

      // ── ROW 1: Level header + quit button (y: 8–32) ──
      const headerCenterY = Math.round(GAMEPLAY_HEADER_Y + 12);
      this.createQuitButton(24, headerCenterY, () => {
        this.logger.info('create', 'Quit button pressed');
        this.showConfirmOverlay();
      });

      this.add.text(centerX, headerCenterY, `Level ${this.levelId}`, {
        fontFamily: FONT_FAMILY,
        fontSize: `${GAMEPLAY_HEADER_FONT_SIZE}px`,
        color: colorHex(UI_COLOR_ACCENT),
        fontStyle: 'bold',
      }).setOrigin(0.5);

      // ── ROW 2: Score pill + Moves pill (y: 40–58) ──
      this.createCompactHUDPills(levelData.moveLimit);

      // ── ROW 3: SCORE PROGRESS BAR (y: 66–82) ──
      const boardWidth = GRID_COLS * this.cellSize;
      this.progressBarX = Math.round(centerX - boardWidth / 2);
      this.progressBarY = GAMEPLAY_PROGRESS_Y;
      this.progressBarWidth = boardWidth;
      this.progressBarHeight = 16;

      this.createProgressBar(levelData.starThresholds);
      this.logger.info('create', 'Progress bar created', {
        barWidth: this.progressBarWidth,
        starThresholds: levelData.starThresholds,
      });

      // ── BOARD AREA (y: 90+) — 8px gap below progress bar ──
      const boardHeight = GRID_ROWS * this.cellSize;
      this.boardX = Math.round(centerX - boardWidth / 2);
      this.boardY = GAMEPLAY_BOARD_Y;

      // Board frame sprite (rendered behind everything)
      if (this.textures.exists(ASSET_KEY_FRAME_BOARD)) {
        const framePad = 8; // padding around board
        const frame = this.add.image(
          this.boardX + boardWidth / 2,
          this.boardY + boardHeight / 2,
          ASSET_KEY_FRAME_BOARD,
        );
        frame.setDisplaySize(boardWidth + framePad * 2, boardHeight + framePad * 2);
        frame.setDepth(Z_BOARD);
      }

      // Board glow border
      this.boardGlowGfx = this.add.graphics();
      this.boardGlowGfx.setDepth(Z_BOARD + 1);
      this.drawBoardGlow(this.boardX, this.boardY, boardWidth, boardHeight);

      // Board background with gradient
      this.boardGfx = this.add.graphics();
      this.boardGfx.setDepth(Z_BOARD + 2);
      this.drawBoardBackground(this.boardX, this.boardY, boardWidth, boardHeight);

      // Cell outlines
      for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
          this.boardGfx.lineStyle(1, 0x444466, 0.3);
          this.boardGfx.strokeRect(
            this.boardX + col * this.cellSize,
            this.boardY + row * this.cellSize,
            this.cellSize,
            this.cellSize,
          );
        }
      }

      // ── Initialize board with gems ──
      const grid = this.boardManager.initBoard(
        levelData.colorCount,
        levelData.seed,
        levelData.specialGemUnlocks,
      );

      // Create gem sprites for initial board
      this.createAllGemSprites(grid);

      // ── Initialize input handler ──
      this.inputHandler.init(
        this.boardX,
        this.boardY,
        (swap) => this.handleSwapRequest(swap),
        (pos) => this.handleSelectionChange(pos),
      );

      // ── BOOSTER TRAY (y: 466–504) ──
      const progress = getPlayerProgress(this.registry);
      this.remapTokensAvailable = progress.remapTokens ?? 2;
      this.hasUsedFreeRemap = progress.hasUsedFreeRemap ?? false;
      this.remapsUsedThisAttempt = 0;

      this.createBoosterTray(centerX, GAMEPLAY_BOOSTER_Y);
      this.logger.info('create', 'Booster tray created', {
        remapTokens: this.remapTokensAvailable,
        hasUsedFreeRemap: this.hasUsedFreeRemap,
      });

      // ── Ready to play ──
      this.playState = PlayState.IDLE;
      this.logger.info('create', 'GameplayScene fully initialized — ready to play', {
        levelId: this.levelId,
        levelName: levelData.name,
        moveLimit: levelData.moveLimit,
        colorCount: levelData.colorCount,
        specialGems: levelData.specialGemUnlocks,
      });

      // ── ANALYTICS: level_started ──
      this.fireLevelStartedAnalytics(levelData, progress);

    } catch (err: unknown) {
      this.logger.error('create', 'Error during GameplayScene create', err);
    }
  }

  /**
   * Fire level_started analytics event.
   * Called after board initialization is complete and before player can make their first move.
   */
  private fireLevelStartedAnalytics(levelData: RawLevelData, progress: PlayerProgress): void {
    // Determine difficulty based on level data
    // Phase 1: derive from level id (1-10 = easy, 11-20 = medium, 21-30 = hard)
    let difficulty = 'easy';
    if (this.levelId > 20) {
      difficulty = 'hard';
    } else if (this.levelId > 10) {
      difficulty = 'medium';
    }

    // Get previous best stars for this level
    const levelKey = String(this.levelId);
    const previousBestStars = progress.stars[levelKey] ?? 0;

    // Build special gems enabled string
    const specialGemsEnabled = levelData.specialGemUnlocks?.join(',') || '';

    // Calculate attempt number (Phase 1: use simple heuristic based on if level was attempted before)
    // TODO: Track attempt_number properly in PlayerProgress
    const attemptNumber = previousBestStars > 0 ? 2 : 1;

    const analytics = AnalyticsManager.getInstance();
    analytics.trackLevelStarted({
      level_id: this.levelId,
      moves_available: levelData.moveLimit,
      difficulty,
      gem_colors: levelData.colorCount,
      attempt_number: attemptNumber,
      special_gems_enabled: specialGemsEnabled || undefined,
      previous_best_stars: previousBestStars,
      lives_before_start: progress.lives,
    }).catch((err) => {
      this.logger.error('fireLevelStartedAnalytics', 'Failed to fire level_started', err);
    });

    this.logger.info('fireLevelStartedAnalytics', 'level_started analytics event fired', {
      level_id: this.levelId,
      moves_available: levelData.moveLimit,
      difficulty,
      gem_colors: levelData.colorCount,
    });
  }

  update(): void {
    // Currently all logic is event-driven via async chains
    // Future: animation tick updates if needed
  }

  // ------------------------------------------------------------------
  // Gem Sprite Management
  // ------------------------------------------------------------------

  /**
   * Create Gem sprites for the entire board.
   */
  private createAllGemSprites(grid: (GemData | null)[][]): void {
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const gemData = grid[row][col];
        if (gemData) {
          this.createGemSprite(gemData);
        }
      }
    }
    this.logger.debug('createAllGemSprites', `Created ${this.gemSprites.size} gem sprites`);
  }

  /**
   * Create a single Gem sprite and position it on the board.
   */
  private createGemSprite(gemData: GemData): Gem {
    const { x, y } = this.gridToScreen(gemData.row, gemData.col);
    const gem = new Gem(
      this,
      gemData.id,
      gemData.row,
      gemData.col,
      gemData.color,
      gemData.specialType,
    );
    gem.setPosition(x, y);
    gem.setDepth(Z_GEMS);
    this.add.existing(gem as unknown as Phaser.GameObjects.GameObject);
    this.gemSprites.set(gemData.id, gem);
    return gem;
  }

  /**
   * Convert grid position to screen coordinates (center of cell).
   */
  private gridToScreen(row: number, col: number): { x: number; y: number } {
    return {
      x: this.boardX + col * this.cellSize + this.cellSize / 2,
      y: this.boardY + row * this.cellSize + this.cellSize / 2,
    };
  }

  // ------------------------------------------------------------------
  // Input Handling
  // ------------------------------------------------------------------

  /**
   * Handle visual feedback for gem selection.
   */
  private handleSelectionChange(pos: GridPosition | null): void {
    // Reset all gems to IDLE
    for (const gem of this.gemSprites.values()) {
      if (gem.gemState === GemState.SELECTED) {
        gem.setGemState(GemState.IDLE);
      }
    }

    // Set new selection
    if (pos) {
      const gemData = this.boardManager.getGemAt(pos.row, pos.col);
      if (gemData) {
        const sprite = this.gemSprites.get(gemData.id);
        sprite?.setGemState(GemState.SELECTED);
      }
    }
  }

  /**
   * Handle a swap request from the input handler.
   */
  private handleSwapRequest(swap: SwapAction): void {
    if (this.playState !== PlayState.IDLE) {
      this.logger.debug('handleSwapRequest', 'Ignoring swap — not in IDLE state');
      return;
    }

    const gemA = this.boardManager.getGemAt(swap.from.row, swap.from.col);
    const gemB = this.boardManager.getGemAt(swap.to.row, swap.to.col);

    if (!gemA || !gemB) {
      this.logger.debug('handleSwapRequest', 'Ignoring swap — empty cell');
      return;
    }

    // Check if this swap would create a match
    const grid = this.boardManager.getGrid();
    const wouldMatch = wouldSwapCreateMatch(grid, swap.from, swap.to);

    // Also allow if either gem is a special gem (special activation)
    const hasSpecial = gemA.specialType !== SpecialGemType.NONE || gemB.specialType !== SpecialGemType.NONE;

    if (!wouldMatch && !hasSpecial) {
      this.logger.info('handleSwapRequest', 'Invalid swap — no match would result');
      this.animateInvalidSwap(swap);
      return;
    }

    this.logger.info('handleSwapRequest', 'Valid swap — executing', {
      from: `(${swap.from.row},${swap.from.col})`,
      to: `(${swap.to.row},${swap.to.col})`,
    });

    // Use a move
    this.levelManager.useMove();
    this.updateHUD();

    // Execute the swap
    this.executeSwap(swap);
  }

  // ------------------------------------------------------------------
  // Swap + Match + Cascade Pipeline
  // ------------------------------------------------------------------

  /**
   * Execute a swap with animation, then check for matches.
   */
  private executeSwap(swap: SwapAction): void {
    this.playState = PlayState.SWAPPING;
    this.inputHandler.setEnabled(false);

    const gemA = this.boardManager.getGemAt(swap.from.row, swap.from.col);
    const gemB = this.boardManager.getGemAt(swap.to.row, swap.to.col);
    if (!gemA || !gemB) return;

    // Execute in data model
    this.boardManager.executeSwap(swap);

    // Animate both gems to their new positions
    const spriteA = this.gemSprites.get(gemA.id);
    const spriteB = this.gemSprites.get(gemB.id);

    const posA = this.gridToScreen(swap.to.row, swap.to.col);
    const posB = this.gridToScreen(swap.from.row, swap.from.col);

    let completed = 0;
    const onComplete = () => {
      completed++;
      if (completed === 2) {
        // Update sprite grid tracking
        if (spriteA) spriteA.setGridPosition(swap.to.row, swap.to.col);
        if (spriteB) spriteB.setGridPosition(swap.from.row, swap.from.col);

        // Start cascade chain
        this.scoreSystem.startCascadeChain();
        this.checkAndResolveMatches();
      }
    };

    if (spriteA) {
      this.tweens.add({
        targets: spriteA,
        x: posA.x,
        y: posA.y,
        duration: SWAP_DURATION_MS,
        ease: 'Power2',
        onComplete,
      });
    } else {
      onComplete();
    }

    if (spriteB) {
      this.tweens.add({
        targets: spriteB,
        x: posB.x,
        y: posB.y,
        duration: SWAP_DURATION_MS,
        ease: 'Power2',
        onComplete,
      });
    } else {
      onComplete();
    }
  }

  /**
   * Animate an invalid swap (swap and swap back).
   */
  private animateInvalidSwap(swap: SwapAction): void {
    const gemA = this.boardManager.getGemAt(swap.from.row, swap.from.col);
    const gemB = this.boardManager.getGemAt(swap.to.row, swap.to.col);
    if (!gemA || !gemB) return;

    const spriteA = this.gemSprites.get(gemA.id);
    const spriteB = this.gemSprites.get(gemB.id);

    const posA = this.gridToScreen(swap.to.row, swap.to.col);
    const posB = this.gridToScreen(swap.from.row, swap.from.col);

    // Temporarily disable input
    this.inputHandler.setEnabled(false);

    // Animate forward
    if (spriteA) {
      this.tweens.add({
        targets: spriteA,
        x: posA.x,
        y: posA.y,
        duration: SWAP_DURATION_MS / 2,
        ease: 'Power2',
        yoyo: true,
      });
    }
    if (spriteB) {
      this.tweens.add({
        targets: spriteB,
        x: posB.x,
        y: posB.y,
        duration: SWAP_DURATION_MS / 2,
        ease: 'Power2',
        yoyo: true,
        onComplete: () => {
          this.inputHandler.setEnabled(true);
        },
      });
    }
  }

  /**
   * Check board for matches and resolve them.
   * Called recursively for cascade chains.
   */
  private checkAndResolveMatches(): void {
    this.playState = PlayState.CHECKING;

    const grid = this.boardManager.getGrid();
    const analysis = findAllMatches(grid);

    if (analysis.matches.length === 0) {
      this.logger.debug('checkAndResolveMatches', 'No matches — cascade chain complete');
      this.onCascadeChainComplete();
      return;
    }

    // Collect special gem activations
    const specialActivations: GridPosition[] = [];
    const specialGemTypes: SpecialGemType[] = [];

    for (const pos of analysis.allMatchedPositions) {
      const gem = grid[pos.row]?.[pos.col];
      if (gem && gem.specialType !== SpecialGemType.NONE) {
        specialActivations.push(pos);
        specialGemTypes.push(gem.specialType);
      }
    }

    // Get additional positions from special gem effects
    let allPositions = [...analysis.allMatchedPositions];
    for (const pos of specialActivations) {
      const gem = grid[pos.row]?.[pos.col];
      if (gem) {
        const affected = getSpecialGemAffectedPositions(grid, pos, gem.specialType);
        for (const aff of affected) {
          const key = `${aff.row},${aff.col}`;
          if (!allPositions.some((p) => `${p.row},${p.col}` === key)) {
            allPositions.push(aff);
          }
        }
      }
    }

    // Score the matches
    const breakdown = this.scoreSystem.scoreMatches(
      analysis.matches,
      specialGemTypes,
      allPositions.length,
    );

    this.updateHUD();

    // Show score popup
    this.showScorePopup(allPositions, breakdown.totalPoints);

    // Emit events
    this.game.events.emit(GameEvent.GEMS_MATCHED, {
      count: allPositions.length,
      score: breakdown.totalPoints,
    });

    // Animate clearing
    this.playState = PlayState.CLEARING;
    this.animateClearGems(allPositions, analysis.specialGems, () => {
      // After clearing: remove gems from data model
      this.boardManager.removeGems(allPositions);

      // Place special gems where applicable
      for (const special of analysis.specialGems) {
        // Only place if the special gem position isn't being cleared
        // (it will be placed as a new gem with the special type)
        const matchColor = analysis.matches.find((m) =>
          m.gems.some((g) => g.row === special.position.row && g.col === special.position.col),
        )?.color;

        if (matchColor) {
          const newGem = this.boardManager.placeSpecialGem(
            special.position,
            special.type,
            matchColor,
          );
          if (newGem) {
            // Create sprite for the special gem
            const sprite = this.createGemSprite(newGem);
            // Quick scale-in animation
            sprite.setScale(0);
            this.tweens.add({
              targets: sprite,
              scaleX: 1,
              scaleY: 1,
              duration: SPAWN_DURATION_MS,
              ease: 'Back.easeOut',
            });
          }
        }
      }

      // Apply gravity
      this.applyGravityAndSpawn();
    });
  }

  /**
   * Animate gems being cleared (shrink + fade).
   */
  private animateClearGems(
    positions: GridPosition[],
    _specialGems: { position: GridPosition; type: SpecialGemType }[],
    onComplete: () => void,
  ): void {
    const grid = this.boardManager.getGrid();
    let animCount = 0;
    let totalAnims = 0;

    for (const pos of positions) {
      const gemData = grid[pos.row]?.[pos.col];
      if (!gemData) continue;

      const sprite = this.gemSprites.get(gemData.id);
      if (!sprite) continue;

      totalAnims++;
      sprite.setGemState(GemState.CLEARING);

      this.tweens.add({
        targets: sprite,
        scaleX: 0,
        scaleY: 0,
        alpha: 0,
        duration: CLEAR_DURATION_MS,
        ease: 'Power2',
        onComplete: () => {
          sprite.destroyGem();
          this.gemSprites.delete(gemData.id);
          animCount++;
          if (animCount >= totalAnims) {
            onComplete();
          }
        },
      });
    }

    // If no animations to play, complete immediately
    if (totalAnims === 0) {
      onComplete();
    }
  }

  /**
   * Apply gravity and spawn new gems, then check for more matches.
   */
  private applyGravityAndSpawn(): void {
    this.playState = PlayState.FALLING;

    // Apply gravity
    const falls = this.boardManager.applyGravity();

    // Animate falling gems
    let fallAnimCount = 0;
    const totalFalls = falls.length;

    for (const fall of falls) {
      const sprite = this.gemSprites.get(fall.gemId);
      if (!sprite) continue;

      const targetPos = this.gridToScreen(fall.toRow, fall.col);
      const fallDistance = fall.toRow - fall.fromRow;

      sprite.setGridPosition(fall.toRow, fall.col);

      this.tweens.add({
        targets: sprite,
        y: targetPos.y,
        duration: FALL_DURATION_MS * fallDistance,
        ease: 'Bounce.easeOut',
        onComplete: () => {
          fallAnimCount++;
          if (fallAnimCount >= totalFalls) {
            this.spawnAndCheckAgain();
          }
        },
      });
    }

    if (totalFalls === 0) {
      this.spawnAndCheckAgain();
    }
  }

  /**
   * Spawn new gems in empty spaces and check for cascading matches.
   */
  private spawnAndCheckAgain(): void {
    const spawned = this.boardManager.spawnNewGems();

    let spawnAnimCount = 0;
    const totalSpawns = spawned.length;

    for (const gemData of spawned) {
      // Create sprite at position above the board, then animate in
      const targetPos = this.gridToScreen(gemData.row, gemData.col);
      const sprite = this.createGemSprite(gemData);
      sprite.setPosition(targetPos.x, this.boardY - this.cellSize); // Start above board
      sprite.setAlpha(0);

      this.tweens.add({
        targets: sprite,
        y: targetPos.y,
        alpha: 1,
        duration: FALL_DURATION_MS * (gemData.row + 1),
        ease: 'Bounce.easeOut',
        onComplete: () => {
          spawnAnimCount++;
          if (spawnAnimCount >= totalSpawns) {
            // Delay then check for cascading matches
            this.time.delayedCall(CASCADE_DELAY_MS, () => {
              this.checkAndResolveMatches();
            });
          }
        },
      });
    }

    if (totalSpawns === 0) {
      this.time.delayedCall(CASCADE_DELAY_MS, () => {
        this.checkAndResolveMatches();
      });
    }
  }

  /**
   * Called when a cascade chain is fully resolved (no more matches).
   */
  private onCascadeChainComplete(): void {
    this.logger.info('onCascadeChainComplete', 'Cascade chain resolved', {
      score: this.scoreSystem.getScore(),
      movesRemaining: this.levelManager.getMovesRemaining(),
    });

    this.game.events.emit(GameEvent.BOARD_STABLE);

    // Check for game over conditions
    if (this.levelManager.isOutOfMoves()) {
      this.onLevelEnd();
      return;
    }

    // Check for deadlock
    const grid = this.boardManager.getGrid();
    if (!hasValidMoves(grid)) {
      this.logger.warn('onCascadeChainComplete', 'Board deadlocked — reshuffling');
      this.game.events.emit(GameEvent.BOARD_DEADLOCKED);
      this.boardManager.reshuffleBoard();
      this.rebuildAllSprites();
    }

    // Ready for next input
    this.playState = PlayState.IDLE;
    this.inputHandler.setEnabled(true);
  }

  /**
   * Handle level end (out of moves).
   */
  private onLevelEnd(): void {
    this.playState = PlayState.GAME_OVER;
    this.inputHandler.setEnabled(false);

    // Add remaining moves bonus (if passed)
    const stars = this.scoreSystem.calculateStars();
    const passed = stars > 0;

    if (passed) {
      const movesBonus = this.scoreSystem.addRemainingMovesBonus(
        this.levelManager.getMovesRemaining(),
      );
      if (movesBonus > 0) {
        this.updateHUD();
      }
    }

    const finalStars = this.scoreSystem.calculateStars();
    const result = this.levelManager.buildResult(
      this.scoreSystem.getScore(),
      finalStars,
      this.scoreSystem.getTotalCascades(),
      finalStars > 0,
    );

    this.logger.info('onLevelEnd', `Level ${this.levelId} ended`, result);

    // Emit event
    this.game.events.emit(
      result.passed ? GameEvent.LEVEL_COMPLETED : GameEvent.LEVEL_FAILED,
      result,
    );

    // Fire analytics event BEFORE scene transition
    if (result.passed) {
      this.fireLevelCompletedAnalytics(result);
    } else {
      this.fireLevelFailedAnalytics(result);
    }

    if (result.passed) {
      // Pass → go straight to LevelCompleteScene
      this.time.delayedCall(800, () => {
        this.scene.start(SCENE_LEVEL_COMPLETE, result);
      });
    } else {
      // Fail → deduct a life and persist
      this.deductLife();

      // Show in-scene fail modal with two-tier UX
      this.time.delayedCall(600, () => {
        this.showFailModal(result);
      });
    }
  }

  /**
   * Fire level_completed analytics event.
   * Called when player wins the level (score >= 1-star threshold).
   */
  private fireLevelCompletedAnalytics(result: LevelResult): void {
    const analytics = AnalyticsManager.getInstance();

    analytics.trackLevelCompleted({
      level_id: result.levelId,
      score: result.score,
      stars: result.stars,
      moves_used: result.movesUsed,
      moves_remaining: result.movesRemaining,
      duration_seconds: result.durationSeconds,
      cascades: result.totalCascades,
      // TODO: Track specials_created, specials_activated, best_combo in ScoreSystem
      purchased_extra_moves: false, // TODO: Track if extra moves were purchased this attempt
    }).catch((err) => {
      this.logger.error('fireLevelCompletedAnalytics', 'Failed to fire level_completed', err);
    });

    this.logger.info('fireLevelCompletedAnalytics', 'level_completed analytics event fired', {
      level_id: result.levelId,
      score: result.score,
      stars: result.stars,
    });
  }

  /**
   * Fire level_failed analytics event.
   * Called when player fails the level (moves = 0 and score < 1-star threshold).
   */
  private fireLevelFailedAnalytics(result: LevelResult): void {
    const thresholds = this.scoreSystem.getStarThresholds();
    const oneStarThreshold = thresholds[0];
    const scoreDeficit = Math.max(0, oneStarThreshold - result.score);
    const ratio = oneStarThreshold > 0 ? result.score / oneStarThreshold : 0;
    const failModalType = ratio >= FAIL_CLOSE_RATIO ? 'close' : 'far';

    const analytics = AnalyticsManager.getInstance();

    analytics.trackLevelFailed({
      level_id: result.levelId,
      score: result.score,
      moves_used: result.movesUsed,
      duration_seconds: result.durationSeconds,
      closest_star_threshold: oneStarThreshold,
      score_deficit: scoreDeficit,
      cascades: result.totalCascades,
      fail_modal_type: failModalType,
      purchased_extra_moves: false, // TODO: Track if extra moves were purchased this attempt
    }).catch((err) => {
      this.logger.error('fireLevelFailedAnalytics', 'Failed to fire level_failed', err);
    });

    this.logger.info('fireLevelFailedAnalytics', 'level_failed analytics event fired', {
      level_id: result.levelId,
      score: result.score,
      fail_modal_type: failModalType,
      score_deficit: scoreDeficit,
    });
  }

  // ------------------------------------------------------------------
  // Visual Feedback
  // ------------------------------------------------------------------

  /**
   * Show a floating score popup at the center of cleared gems.
   */
  private showScorePopup(positions: GridPosition[], points: number): void {
    if (positions.length === 0 || points === 0) return;

    // Calculate center of matched gems
    let sumX = 0;
    let sumY = 0;
    for (const pos of positions) {
      const screenPos = this.gridToScreen(pos.row, pos.col);
      sumX += screenPos.x;
      sumY += screenPos.y;
    }
    const cx = sumX / positions.length;
    const cy = sumY / positions.length;

    const cascadeDepth = this.scoreSystem.getCascadeDepth();
    const label = cascadeDepth > 1 ? `+${points} x${cascadeDepth}!` : `+${points}`;

    const popup = this.add.text(cx, cy, label, {
      fontFamily: FONT_FAMILY,
      fontSize: cascadeDepth > 1 ? '20px' : '16px',
      color: colorHex(UI_COLOR_ACCENT),
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(500);

    this.tweens.add({
      targets: popup,
      y: cy - 40,
      alpha: 0,
      duration: SCORE_POPUP_DURATION_MS,
      ease: 'Power2',
      onComplete: () => popup.destroy(),
    });

    // Trigger combo celebration for cascades
    if (cascadeDepth > 1) {
      CelebrationSystem.celebrateCombo(this, cx, cy, cascadeDepth, points);
    }
  }

  /**
   * Update HUD elements: score pill, moves pill, progress bar fill.
   */
  private updateHUD(): void {
    // Animate score counter
    const targetScore = this.scoreSystem.getScore();
    this.animateScoreCounter(targetScore);

    // Update moves counter with color-coded text
    const movesRemaining = this.levelManager.getMovesRemaining();
    this.movesText.setText(`Moves: ${movesRemaining}`);
    this.movesText.setColor(this.getMovesColor(movesRemaining));

    // Redraw moves pill background
    const pillH = GAMEPLAY_COMPACT_PILL_HEIGHT;
    const pillR = GAMEPLAY_COMPACT_PILL_RADIUS;
    const movesPillW = 80;
    const movesPillX = Math.round(GAME_WIDTH - MARGIN_EDGE - movesPillW);
    const movesPillY = GAMEPLAY_HUD_ROW_Y;
    this.drawMovesPill(movesPillX, movesPillY, movesPillW, pillH, pillR, movesRemaining);

    // Update progress bar fill
    this.updateProgressBarFill();

    // Check for star threshold crossings and pulse
    this.checkStarThresholds();
  }

  /**
   * Animate the score counter rolling up from current displayed value to target.
   */
  private animateScoreCounter(target: number): void {
    if (this.displayedScore === target) return;

    if (this.scoreCounterTimer) {
      this.scoreCounterTimer.destroy();
      this.scoreCounterTimer = null;
    }

    const start = this.displayedScore;
    const diff = target - start;
    const steps = 20;
    let step = 0;

    this.scoreCounterTimer = this.time.addEvent({
      delay: 30,
      repeat: steps - 1,
      callback: () => {
        step++;
        const t = step / steps;
        // Ease out cubic
        const eased = 1 - Math.pow(1 - t, 3);
        this.displayedScore = Math.round(start + diff * eased);
        this.scoreText.setText(this.displayedScore.toLocaleString());
        if (this.spriteScore) this.spriteScore.setValue(this.displayedScore);
      },
    });
  }

  /**
   * Create compact HUD pills for score (left) and moves (right).
   * Uses GAMEPLAY_HUD_ROW_Y as the row baseline.
   */
  private createCompactHUDPills(moveLimit: number): void {
    const pillH = GAMEPLAY_COMPACT_PILL_HEIGHT;
    const pillR = GAMEPLAY_COMPACT_PILL_RADIUS;
    const rowCenterY = Math.round(GAMEPLAY_HUD_ROW_Y + pillH / 2);

    // ── Score pill (left side) ──
    const scorePillX = MARGIN_EDGE;
    const scorePillW = 100;
    const scorePillY = Math.round(rowCenterY - pillH / 2);

    this.scorePillGfx = this.add.graphics();
    this.scorePillGfx.fillStyle(UI_COLOR_SECONDARY, 0.8);
    this.scorePillGfx.fillRoundedRect(scorePillX, scorePillY, scorePillW, pillH, pillR);

    // Star icon (small gold graphic, 14x14)
    const starIconCX = Math.round(scorePillX + 12);
    const starIconCY = rowCenterY;
    this.drawMiniStar(this.scorePillGfx, starIconCX, starIconCY, 6, true);

    // Use sprite digits for score if available
    const hasDigits = this.textures.exists(DIGIT_TEXTURE_KEYS[0]);
    if (hasDigits) {
      this.spriteScore = new SpriteNumber(this, {
        x: Math.round(scorePillX + 24),
        y: rowCenterY,
        digitHeight: 14,
        align: 'left',
        value: 0,
      });
    }
    this.scoreText = this.add.text(Math.round(scorePillX + 24), rowCenterY, '0', {
      fontFamily: FONT_FAMILY,
      fontSize: '14px',
      color: '#FFFFFF',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);
    if (hasDigits) this.scoreText.setVisible(false);

    // ── Moves pill (right side) ──
    const movesPillW = 80;
    const movesPillX = Math.round(GAME_WIDTH - MARGIN_EDGE - movesPillW);
    const movesPillY = Math.round(rowCenterY - pillH / 2);

    this.movesPillGfx = this.add.graphics();
    this.drawMovesPill(movesPillX, movesPillY, movesPillW, pillH, pillR, moveLimit);

    this.movesText = this.add.text(
      Math.round(movesPillX + movesPillW / 2),
      rowCenterY,
      `Moves: ${moveLimit}`,
      {
        fontFamily: FONT_FAMILY,
        fontSize: '14px',
        color: '#FFFFFF',
        fontStyle: 'bold',
      },
    ).setOrigin(0.5);
  }

  /**
   * Draw the moves pill background. Color varies by remaining moves.
   */
  private drawMovesPill(
    x: number, y: number, w: number, h: number, r: number,
    _movesRemaining: number,
  ): void {
    this.movesPillGfx.clear();
    this.movesPillGfx.fillStyle(UI_COLOR_SECONDARY, 0.8);
    this.movesPillGfx.fillRoundedRect(x, y, w, h, r);
  }

  /**
   * Get the text color for the moves counter based on remaining moves.
   */
  private getMovesColor(movesRemaining: number): string {
    if (movesRemaining <= MOVES_DANGER_THRESHOLD) {
      return colorHex(UI_COLOR_DANGER);
    }
    if (movesRemaining <= MOVES_WARNING_THRESHOLD) {
      return colorHex(UI_COLOR_WARNING);
    }
    return '#FFFFFF';
  }

  /**
   * Draw a small 5-pointed star icon on a Graphics object.
   */
  private drawMiniStar(
    g: Phaser.GameObjects.Graphics,
    cx: number, cy: number, radius: number, filled: boolean,
  ): void {
    const color = filled ? 0xFFD700 : 0x555555;
    g.fillStyle(color, 1);
    g.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? radius : radius * 0.45;
      const angle = (-Math.PI / 2) + (Math.PI / 5) * i;
      const px = cx + Math.cos(angle) * r;
      const py = cy + Math.sin(angle) * r;
      if (i === 0) g.moveTo(px, py);
      else g.lineTo(px, py);
    }
    g.closePath();
    g.fillPath();
  }

  /**
   * Build scene background (image if available, gradient fallback).
   */
  private buildBackground(): void {
    if (this.textures.exists(ASSET_KEY_BG_GAMEPLAY)) {
      const bg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, ASSET_KEY_BG_GAMEPLAY);
      const scaleX = GAME_WIDTH / bg.width;
      const scaleY = GAME_HEIGHT / bg.height;
      bg.setScale(Math.max(scaleX, scaleY));
      bg.setDepth(0);
      this.logger.info('buildBackground', 'Background image loaded');
    } else {
      // Gradient fallback
      const gradient = this.add.graphics();
      gradient.fillGradientStyle(0x1A0A2E, 0x1A0A2E, 0x0D1B2A, 0x0D1B2A, 1);
      gradient.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      gradient.setDepth(0);
      this.logger.debug('buildBackground', 'Using gradient fallback');
    }
  }

  /**
   * Draw a gradient board background using GRADIENT_BOARD_BG colors.
   */
  private drawBoardBackground(bx: number, by: number, bw: number, bh: number): void {
    const topColor = Phaser.Display.Color.ValueToColor(GRADIENT_BOARD_BG[0]);
    const bottomColor = Phaser.Display.Color.ValueToColor(GRADIENT_BOARD_BG[1]);
    const strips = 16;
    const stripH = bh / strips;

    for (let i = 0; i < strips; i++) {
      const t = i / (strips - 1);
      const r = Phaser.Math.Linear(topColor.red, bottomColor.red, t);
      const g = Phaser.Math.Linear(topColor.green, bottomColor.green, t);
      const b = Phaser.Math.Linear(topColor.blue, bottomColor.blue, t);
      const color = Phaser.Display.Color.GetColor(r, g, b);
      // Darken edges slightly
      const edgeDarken = 1 - 0.08 * Math.abs(i - strips / 2) / (strips / 2);
      this.boardGfx.fillStyle(color, edgeDarken);
      this.boardGfx.fillRect(bx, by + i * stripH, bw, stripH + 1);
    }
  }

  /**
   * Draw a subtle glow border around the board.
   */
  private drawBoardGlow(bx: number, by: number, bw: number, bh: number): void {
    // Outer glow
    this.boardGlowGfx.lineStyle(6, UI_COLOR_PRIMARY, 0.12);
    this.boardGlowGfx.strokeRect(bx - 3, by - 3, bw + 6, bh + 6);
    // Inner glow
    this.boardGlowGfx.lineStyle(2, UI_COLOR_PRIMARY, 0.25);
    this.boardGlowGfx.strokeRect(bx - 1, by - 1, bw + 2, bh + 2);
  }

  // ------------------------------------------------------------------
  // Score Progress Bar
  // ------------------------------------------------------------------

  /**
   * Create the score progress bar with star markers.
   * Called once during create().
   */
  private createProgressBar(starThresholds: [number, number, number]): void {
    const barX = this.progressBarX;
    const barY = this.progressBarY;
    const barW = this.progressBarWidth;
    const barH = this.progressBarHeight;
    const threeStarMax = starThresholds[2];

    this.logger.debug('createProgressBar', 'Creating progress bar', {
      barX, barY, barW, barH, threeStarMax,
    });

    // Use sprite-based progress bar if assets available
    const hasSpriteBar = this.textures.exists(ASSET_KEY_PROGRESS_EMPTY) &&
                         this.textures.exists(ASSET_KEY_PROGRESS_FULL);

    if (hasSpriteBar) {
      this.usingSpriteProgress = true;

      // Empty bar background — force both width AND height to match the bar dimensions
      this.progressBarEmptyImg = this.add.image(barX + barW / 2, barY + barH / 2, ASSET_KEY_PROGRESS_EMPTY);
      this.progressBarEmptyImg.setDisplaySize(barW, barH);
      this.progressBarEmptyImg.setDepth(5);

      // Full bar overlay — same display size so they align perfectly
      this.progressBarFullImg = this.add.image(barX + barW / 2, barY + barH / 2, ASSET_KEY_PROGRESS_FULL);
      this.progressBarFullImg.setDisplaySize(barW, barH);
      this.progressBarFullImg.setDepth(6);
      // Start with 0 progress — crop to 0 width
      this.progressBarFullImg.setCrop(0, 0, 0, this.progressBarFullImg.height);

      // Placeholder graphics (hidden but needed so other code doesn't crash)
      this.progressBarBgGfx = this.add.graphics();
      this.progressBarGfx = this.add.graphics();
    } else {
      this.usingSpriteProgress = false;

      // Background track (dark, rounded)
      this.progressBarBgGfx = this.add.graphics();
      this.progressBarBgGfx.fillStyle(0x333344, 1);
      this.progressBarBgGfx.fillRoundedRect(barX, barY, barW, barH, 8);

      // Fill layer (drawn on top, updated each frame)
      this.progressBarGfx = this.add.graphics();
    }

    // Star markers at proportional positions
    this.starMarkerXPositions = [];
    this.starMarkers = [];
    this.earnedStars = [false, false, false];

    for (let i = 0; i < 3; i++) {
      const ratio = starThresholds[i] / threeStarMax;
      const markerX = barX + ratio * barW;
      this.starMarkerXPositions.push(markerX);

      // Graphics-drawn star (empty)
      const starGfx = this.add.graphics();
      starGfx.setPosition(markerX, barY + barH / 2);
      this.drawProgressStar(starGfx, 0, 0, 7, false);
      starGfx.setDepth(10);

      this.starMarkers.push(starGfx);
    }

    this.logger.debug('createProgressBar', 'Star markers placed', {
      positions: this.starMarkerXPositions.map((x) => Math.round(x)),
    });
  }

  /**
   * Redraw the progress bar fill based on current score.
   */
  private updateProgressBarFill(): void {
    const score = this.scoreSystem.getScore();
    const thresholds = this.scoreSystem.getStarThresholds();
    const threeStarMax = thresholds[2];

    // Fill ratio capped at 100%
    const fillRatio = Math.min(score / threeStarMax, 1);

    if (this.usingSpriteProgress && this.progressBarFullImg) {
      // Sprite-based: crop the full bar image to show progress
      const cropW = Math.round(fillRatio * this.progressBarFullImg.width);
      this.progressBarFullImg.setCrop(0, 0, cropW, this.progressBarFullImg.height);
      return;
    }

    const barX = this.progressBarX;
    const barY = this.progressBarY;
    const barW = this.progressBarWidth;
    const barH = this.progressBarHeight;
    const fillWidth = fillRatio * barW;

    this.progressBarGfx.clear();

    if (fillWidth > 0) {
      // Gradient-like fill using accent color
      // Use green tint if past 1-star, gold if past 2-star
      let fillColor = UI_COLOR_PRIMARY; // purple before 1 star
      if (score >= thresholds[1]) {
        fillColor = UI_COLOR_ACCENT; // gold after 2 stars
      } else if (score >= thresholds[0]) {
        fillColor = UI_COLOR_SUCCESS; // green after 1 star
      }

      this.progressBarGfx.fillStyle(fillColor, 0.9);
      this.progressBarGfx.fillRoundedRect(barX, barY, Math.max(fillWidth, 8), barH, 8);
    }
  }

  /**
   * Check if we've crossed a star threshold and animate accordingly.
   * Also pulse the next uncrossed star when within 10%.
   */
  private checkStarThresholds(): void {
    const score = this.scoreSystem.getScore();
    const thresholds = this.scoreSystem.getStarThresholds();
    const threeStarMax = thresholds[2];

    // Check star crossings
    for (let i = 0; i < 3; i++) {
      if (!this.earnedStars[i] && score >= thresholds[i]) {
        this.earnedStars[i] = true;
        this.animateStarEarned(i);
        this.logger.info('checkStarThresholds', `Star ${i + 1} earned!`, {
          threshold: thresholds[i],
          score,
        });
      }
    }

    // Pulse next unearned star when within 10% of threshold
    const nextStarIndex = this.earnedStars.indexOf(false);
    if (nextStarIndex >= 0 && nextStarIndex < 3) {
      const nextThreshold = thresholds[nextStarIndex];
      const distanceRatio = (nextThreshold - score) / threeStarMax;

      if (distanceRatio <= 0.10 && distanceRatio > 0) {
        if (this.pulsingStarIndex !== nextStarIndex) {
          this.startStarPulse(nextStarIndex);
        }
      } else {
        if (this.pulsingStarIndex === nextStarIndex) {
          this.stopStarPulse();
        }
      }
    } else {
      this.stopStarPulse();
    }
  }

  /**
   * Animate a star being earned — scale bounce + color change + particle burst.
   */
  private animateStarEarned(index: number): void {
    const star = this.starMarkers[index];
    if (!star) return;

    // Stop pulse if this star was pulsing
    if (this.pulsingStarIndex === index) {
      this.stopStarPulse();
    }

    // Change to filled gold star
    this.drawProgressStar(star, 0, 0, 7, true);

    // Scale bounce animation
    this.tweens.add({
      targets: star,
      scaleX: 1.6,
      scaleY: 1.6,
      duration: 200,
      ease: 'Back.easeOut',
      yoyo: true,
      onComplete: () => {
        star.setScale(1.2);
      },
    });

    // Simple particle burst using tiny text dots
    const cx = this.starMarkerXPositions[index];
    const cy = this.progressBarY + this.progressBarHeight / 2;
    for (let p = 0; p < 6; p++) {
      const angle = (Math.PI * 2 * p) / 6;
      const dot = this.add.text(cx, cy, '✦', {
        fontFamily: FONT_FAMILY,
        fontSize: '10px',
        color: colorHex(UI_COLOR_ACCENT),
      }).setOrigin(0.5).setDepth(15);

      this.tweens.add({
        targets: dot,
        x: cx + Math.cos(angle) * 25,
        y: cy + Math.sin(angle) * 25,
        alpha: 0,
        duration: 400,
        ease: 'Power2',
        onComplete: () => dot.destroy(),
      });
    }

    this.logger.debug('animateStarEarned', `Star ${index + 1} animation played`);
  }

  /**
   * Start pulsing a star marker (close to earning it).
   */
  private startStarPulse(index: number): void {
    this.stopStarPulse();
    this.pulsingStarIndex = index;

    const star = this.starMarkers[index];
    if (!star) return;

    this.starPulseTween = this.tweens.add({
      targets: star,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 500,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
  }

  /**
   * Stop any active star pulse.
   */
  private stopStarPulse(): void {
    if (this.starPulseTween) {
      this.starPulseTween.stop();
      this.starPulseTween = null;
    }
    if (this.pulsingStarIndex >= 0 && this.starMarkers[this.pulsingStarIndex]) {
      this.starMarkers[this.pulsingStarIndex].setScale(1);
    }
    this.pulsingStarIndex = -1;
  }

  /**
   * Draw a 5-pointed star shape on a Graphics object.
   * Used for progress bar star markers.
   */
  private drawProgressStar(g: Phaser.GameObjects.Graphics, cx: number, cy: number, radius: number, filled: boolean): void {
    g.clear();
    const color = filled ? 0xFFD700 : 0x555555;
    const alpha = filled ? 1 : 0.5;
    g.fillStyle(color, alpha);
    g.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? radius : radius * 0.45;
      const angle = (-Math.PI / 2) + (Math.PI / 5) * i;
      const px = cx + Math.cos(angle) * r;
      const py = cy + Math.sin(angle) * r;
      if (i === 0) g.moveTo(px, py);
      else g.lineTo(px, py);
    }
    g.closePath();
    g.fillPath();
    if (!filled) {
      g.lineStyle(1, 0x888888, 0.4);
      g.strokePath();
    }
  }

  /**
   * Rebuild all gem sprites from the data model (after reshuffle).
   */
  private rebuildAllSprites(): void {
    // Destroy all existing sprites
    for (const sprite of this.gemSprites.values()) {
      sprite.destroyGem();
    }
    this.gemSprites.clear();

    // Recreate from grid
    const grid = this.boardManager.getGrid();
    this.createAllGemSprites(grid);

    this.logger.debug('rebuildAllSprites', 'All gem sprites rebuilt after reshuffle');
  }

  // ------------------------------------------------------------------
  // Confirmation Overlay (preserved from v0.1.2)
  // ------------------------------------------------------------------

  private showConfirmOverlay(): void {
    if (this.confirmModal) return;

    this.inputHandler.setEnabled(false);
    this.logger.info('showConfirmOverlay', 'Displaying quit confirmation');

    this.confirmModal = new GlModal(this, { title: 'Quit Level?', width: 320 });

    const msg = this.add.text(0, 0, 'Your progress will be lost.', {
      fontFamily: FONT_FAMILY,
      fontSize: `${FONT_SIZE_SMALL}px`,
      color: colorHex(UI_COLOR_TEXT_DIM),
      align: 'center',
    }).setOrigin(0.5, 0);
    this.confirmModal.addContent(msg);

    const quitBtn = new GlButton(this, 0, 0, 'Yes, Quit', {
      width: 200, height: 40, gradient: GRADIENT_BUTTON_DANGER, fontSize: FONT_SIZE_SMALL,
    });
    quitBtn.onClick(() => {
      this.logger.info('showConfirmOverlay', 'User confirmed quit');
      this.hideConfirmOverlay();
      this.inputHandler.destroy();
      this.scene.start(SCENE_MAIN_MENU, { returnFrom: SCENE_GAMEPLAY });
    });
    this.confirmModal.addContent(quitBtn, 40);

    const keepBtn = new GlButton(this, 0, 0, 'Keep Playing', {
      width: 200, height: 40, gradient: GRADIENT_BUTTON_SUCCESS, fontSize: FONT_SIZE_SMALL,
    });
    keepBtn.onClick(() => {
      this.logger.info('showConfirmOverlay', 'User cancelled quit');
      this.hideConfirmOverlay();
      if (this.playState === PlayState.IDLE) {
        this.inputHandler.setEnabled(true);
      }
    });
    this.confirmModal.addContent(keepBtn, 40);

    this.confirmModal.onClose(() => {
      this.hideConfirmOverlay();
      if (this.playState === PlayState.IDLE) {
        this.inputHandler.setEnabled(true);
      }
    });

    this.confirmModal.show();
  }

  private hideConfirmOverlay(): void {
    if (this.confirmModal) {
      this.confirmModal.destroy();
      this.confirmModal = null;
    }
  }

  // ------------------------------------------------------------------
  // Lives System
  // ------------------------------------------------------------------

  /**
   * Deduct one life on level failure.
   * Uses LivesSystem for deduction logic and persists to SDK.
   */
  private deductLife(): void {
    const progress = getPlayerProgress(this.registry);
    const livesSystem = LivesSystem.getInstance();

    // Use LivesSystem to handle deduction and event emission
    livesSystem.deductLife(progress);

    // Update registry
    setPlayerProgress(this.registry, progress);

    this.logger.info('deductLife', `Life deducted via LivesSystem — ${progress.lives} remaining`, {
      lives: progress.lives,
      lastLifeLostAt: progress.lastLifeLostAt,
    });

    // Persist to SDK (fire-and-forget)
    const pdm = new PlayerDataManager();
    pdm.saveProgress(progress).catch((err: unknown) => {
      this.logger.error('deductLife', 'Failed to persist life deduction', err);
    });
  }

  // ------------------------------------------------------------------
  // Fail State Modal (Feature 2: Two-Tier UX)
  // ------------------------------------------------------------------

  /**
   * Show the fail state modal with two-tier UX:
   * - "So close!" (score >= 70% of 1-star) → Continue primary, Try Again secondary
   * - "Keep going!" (score < 70%) → Try Again primary, Continue secondary + tip
   */
  private showFailModal(result: LevelResult): void {
    if (this.failModal) return;

    this.logger.info('showFailModal', 'Displaying fail modal', {
      score: result.score,
      levelId: result.levelId,
    });

    // Determine tier
    const thresholds = this.scoreSystem.getStarThresholds();
    const oneStarThreshold = thresholds[0];
    const ratio = oneStarThreshold > 0 ? result.score / oneStarThreshold : 0;
    const isClose = ratio >= FAIL_CLOSE_RATIO;

    this.logger.info('showFailModal', `Fail tier: ${isClose ? 'SO_CLOSE' : 'KEEP_GOING'}`, {
      ratio: Math.round(ratio * 100),
      threshold: FAIL_CLOSE_RATIO,
    });

    const headerText = isClose ? 'So close!' : 'Keep going!';
    this.failModal = new GlModal(this, { title: headerText, width: 340 });

    // Score line
    const scoreLine = this.add.text(0, 0, `Score: ${result.score}`, {
      fontFamily: FONT_FAMILY,
      fontSize: `${FONT_SIZE_MEDIUM}px`,
      color: colorHex(UI_COLOR_TEXT),
      align: 'center',
    }).setOrigin(0.5, 0);
    this.failModal.addContent(scoreLine);

    // Mini progress bar inside modal (drawn as a container)
    const miniBarW = 300;
    const miniBarH = 14;
    const threeStarMax = thresholds[2];
    const fillRatio = Math.min(result.score / threeStarMax, 1);
    const fillW = Math.max(fillRatio * miniBarW, 4);

    const miniBarContainer = this.add.container(0, 0);

    const miniBarBg = this.add.graphics();
    miniBarBg.fillStyle(0x1A0A2E, 0.8);
    miniBarBg.fillRoundedRect(-miniBarW / 2, 0, miniBarW, miniBarH, 6);
    miniBarBg.lineStyle(1, 0x444466, 0.5);
    miniBarBg.strokeRoundedRect(-miniBarW / 2, 0, miniBarW, miniBarH, 6);
    miniBarContainer.add(miniBarBg);

    let barColor = UI_COLOR_PRIMARY;
    if (ratio >= 1) barColor = UI_COLOR_SUCCESS;
    else if (ratio >= FAIL_CLOSE_RATIO) barColor = UI_COLOR_ACCENT;
    const miniBarFill = this.add.graphics();
    miniBarFill.fillStyle(barColor, 0.9);
    miniBarFill.fillRoundedRect(-miniBarW / 2, 0, fillW, miniBarH, 6);
    miniBarContainer.add(miniBarFill);

    // Mini star markers on bar
    for (let i = 0; i < 3; i++) {
      const starRatio = thresholds[i] / threeStarMax;
      const starX = -miniBarW / 2 + starRatio * miniBarW;
      const starChar = result.score >= thresholds[i] ? '\u2605' : '\u2606';
      const starColor = result.score >= thresholds[i]
        ? colorHex(UI_COLOR_ACCENT)
        : colorHex(UI_COLOR_TEXT_DIM);

      const miniStar = this.add.text(starX, miniBarH / 2, starChar, {
        fontFamily: FONT_FAMILY,
        fontSize: '14px',
        color: starColor,
      }).setOrigin(0.5);
      miniBarContainer.add(miniStar);
    }

    this.failModal.addContent(miniBarContainer, miniBarH + 4);

    // Target line: "Need X for star"
    const targetText = this.add.text(0, 0,
      `Need ${oneStarThreshold} for \u2605`, {
        fontFamily: FONT_FAMILY,
        fontSize: `${FONT_SIZE_SMALL - 2}px`,
        color: colorHex(UI_COLOR_TEXT_DIM),
        align: 'center',
      }).setOrigin(0.5, 0);
    this.failModal.addContent(targetText);

    // "+3 Extra Moves" purchase button (both tiers) — has confirmation
    const extraMovesBtn = new GlButton(this, 0, 0, '+3 Extra Moves', {
      width: 240, height: 44, gradient: GRADIENT_BUTTON_GOLD, fontSize: FONT_SIZE_SMALL,
    });
    extraMovesBtn.onClick(() => {
      this.logger.info('showFailModal', 'Extra Moves pressed — showing confirmation');
      this.showExtraMovesConfirmation(result);
    });
    this.failModal.addContent(extraMovesBtn, 44);

    if (isClose) {
      // Tier 1: "So close!" — Continue primary (green), Try Again secondary
      const continueBtn = new GlButton(this, 0, 0, 'Continue', {
        width: 200, height: 40, gradient: GRADIENT_BUTTON_SUCCESS, fontSize: FONT_SIZE_SMALL,
      });
      continueBtn.onClick(() => {
        this.logger.info('showFailModal', 'Continue pressed (so close tier)');
        this.hideFailModal();
        this.scene.start(SCENE_LEVEL_COMPLETE, result);
      });
      this.failModal.addContent(continueBtn, 40);

      const tryAgainBtn = new GlButton(this, 0, 0, 'Try Again', {
        width: 200, height: 40, gradient: GRADIENT_BUTTON_PRIMARY, fontSize: FONT_SIZE_SMALL,
      });
      tryAgainBtn.onClick(() => {
        this.logger.info('showFailModal', 'Try Again pressed (so close tier)');
        this.hideFailModal();
        this.scene.start(SCENE_GAMEPLAY, { levelId: this.levelId });
      });
      this.failModal.addContent(tryAgainBtn, 40);

      const menuBtn = new GlButton(this, 0, 0, 'Menu', {
        width: 200, height: 40, gradient: GRADIENT_BUTTON_PRIMARY, fontSize: FONT_SIZE_SMALL,
      });
      menuBtn.onClick(() => {
        this.logger.info('showFailModal', 'Menu pressed');
        this.hideFailModal();
        this.scene.start(SCENE_MAIN_MENU, { returnFrom: SCENE_GAMEPLAY });
      });
      this.failModal.addContent(menuBtn, 40);
    } else {
      // Tier 2: "Keep going!" — Tip text + Try Again primary (green), Continue secondary
      const tip = this.add.text(0, 0,
        'Tip: Try to create chain cascades for big combos!', {
          fontFamily: FONT_FAMILY,
          fontSize: `${FONT_SIZE_SMALL - 2}px`,
          color: colorHex(UI_COLOR_TEXT_DIM),
          wordWrap: { width: 290 },
          align: 'center',
        }).setOrigin(0.5, 0);
      this.failModal.addContent(tip);

      const tryAgainBtn = new GlButton(this, 0, 0, 'Try Again', {
        width: 200, height: 40, gradient: GRADIENT_BUTTON_SUCCESS, fontSize: FONT_SIZE_SMALL,
      });
      tryAgainBtn.onClick(() => {
        this.logger.info('showFailModal', 'Try Again pressed (keep going tier)');
        this.hideFailModal();
        this.scene.start(SCENE_GAMEPLAY, { levelId: this.levelId });
      });
      this.failModal.addContent(tryAgainBtn, 40);

      const continueBtn = new GlButton(this, 0, 0, 'Continue', {
        width: 200, height: 40, gradient: GRADIENT_BUTTON_PRIMARY, fontSize: FONT_SIZE_SMALL,
      });
      continueBtn.onClick(() => {
        this.logger.info('showFailModal', 'Continue pressed (keep going tier)');
        this.hideFailModal();
        this.scene.start(SCENE_LEVEL_COMPLETE, result);
      });
      this.failModal.addContent(continueBtn, 40);

      const menuBtn = new GlButton(this, 0, 0, 'Menu', {
        width: 200, height: 40, gradient: GRADIENT_BUTTON_PRIMARY, fontSize: FONT_SIZE_SMALL,
      });
      menuBtn.onClick(() => {
        this.logger.info('showFailModal', 'Menu pressed');
        this.hideFailModal();
        this.scene.start(SCENE_MAIN_MENU, { returnFrom: SCENE_GAMEPLAY });
      });
      this.failModal.addContent(menuBtn, 40);
    }

    this.failModal.show();
  }

  /**
   * Hide the fail modal.
   */
  private hideFailModal(): void {
    if (this.failModal) {
      this.failModal.destroy();
      this.failModal = null;
    }
  }

  /**
   * Show confirmation dialog before purchasing Extra Moves.
   */
  private showExtraMovesConfirmation(failResult: LevelResult): void {
    if (this.extraMovesModal) return;

    this.logger.info('showExtraMovesConfirmation', 'Showing Extra Moves purchase confirmation');

    this.extraMovesModal = new GlModal(this, { title: 'Buy Extra Moves?', width: 320 });

    const desc = this.add.text(0, 0, '+3 moves to keep playing this level.', {
      fontFamily: FONT_FAMILY,
      fontSize: `${FONT_SIZE_SMALL}px`,
      color: colorHex(UI_COLOR_TEXT_DIM),
      wordWrap: { width: 280 },
      align: 'center',
    }).setOrigin(0.5, 0);
    this.extraMovesModal.addContent(desc);

    const buyBtn = new GlButton(this, 0, 0, 'Buy Now', {
      width: 200, height: 40, gradient: GRADIENT_BUTTON_SUCCESS, fontSize: FONT_SIZE_SMALL,
    });
    buyBtn.onClick(() => {
      this.logger.info('showExtraMovesConfirmation', 'Confirmed — starting purchase');
      this.hideExtraMovesModal();
      this.purchaseExtraMoves(failResult);
    });
    this.extraMovesModal.addContent(buyBtn, 40);

    const cancelBtn = new GlButton(this, 0, 0, 'Cancel', {
      width: 200, height: 40, gradient: GRADIENT_BUTTON_PRIMARY, fontSize: FONT_SIZE_SMALL,
    });
    cancelBtn.onClick(() => {
      this.logger.info('showExtraMovesConfirmation', 'Cancelled');
      this.hideExtraMovesModal();
    });
    this.extraMovesModal.addContent(cancelBtn, 40);

    this.extraMovesModal.onClose(() => {
      this.hideExtraMovesModal();
    });

    this.extraMovesModal.show();
  }

  /**
   * Purchase +3 Extra Moves via PaymentManager.
   * On success: add 3 moves to level, hide fail modal, resume play.
   */
  private async purchaseExtraMoves(_failResult: LevelResult): Promise<void> {
    this.logger.info('purchaseExtraMoves', 'Starting Extra Moves purchase');

    const pm = new PaymentManager();

    try {
      const result = await pm.purchase(ProductSKU.EXTRA_MOVES);

      if (!result.success) {
        const isCancelled = result.error?.toLowerCase().includes('cancel');
        this.logger.info('purchaseExtraMoves',
          isCancelled ? 'Purchase cancelled' : 'Purchase failed',
          { error: result.error },
        );
        return;
      }

      // Purchase succeeded — add 3 moves and resume gameplay
      this.levelManager.addExtraMoves(3);
      this.playState = PlayState.IDLE;

      this.logger.info('purchaseExtraMoves', '+3 moves added — resuming gameplay', {
        newMovesRemaining: this.levelManager.getMovesRemaining(),
      });

      // Update HUD
      this.updateHUD();

      // Hide the fail modal
      this.hideFailModal();

      // Re-enable input
      this.inputHandler.setEnabled(true);

    } catch (err: unknown) {
      this.logger.error('purchaseExtraMoves', 'Purchase threw an exception', err);
    }
  }

  // ------------------------------------------------------------------
  // Re-map Booster (Feature 3)
  // ------------------------------------------------------------------

  /**
   * Create the booster tray with 3 sprite-icon slots: Hammer, Rainbow, +3 Moves.
   * Positioned at GAMEPLAY_BOOSTER_Y. Each slot is BOOSTER_SLOT_SIZE wide x 38px tall.
   */
  private createBoosterTray(centerX: number, trayY: number): void {
    const slotW = BOOSTER_SLOT_SIZE;
    const slotH = 38;
    const gap = BOOSTER_SLOT_GAP;
    const totalWidth = slotW * 3 + gap * 2;
    const startX = Math.round(centerX - totalWidth / 2);

    // Booster definitions: key, label for icon, count
    const boosters = [
      { key: ASSET_KEY_HAMMER, label: 'H', count: 0 },
      { key: ASSET_KEY_RAINBOW, label: 'R', count: 0 },
      { key: 'moves3', label: '+3', count: 0 },
    ];

    // Load counts from progress (both Hammer and Rainbow share remapTokens for now)
    const progress = getPlayerProgress(this.registry);
    const tokens = progress.remapTokens ?? 2;
    boosters[0].count = tokens;  // Hammer uses remap tokens
    boosters[1].count = tokens;  // Rainbow also uses remap tokens
    boosters[2].count = 0;       // +3 Moves — not yet purchasable

    this.boosterSlotGfx = [];
    this.boosterCountTexts = [];
    this.boosterZones = [];

    for (let i = 0; i < 3; i++) {
      const slotX = startX + i * (slotW + gap);
      const slotCX = Math.round(slotX + slotW / 2);
      const slotCY = Math.round(trayY + slotH / 2);

      // Slot background
      const slotGfx = this.add.graphics();
      slotGfx.fillStyle(UI_COLOR_SECONDARY, 0.7);
      slotGfx.fillRoundedRect(slotX, trayY, slotW, slotH, 8);
      slotGfx.lineStyle(1, 0xFFFFFF, 0.15);
      slotGfx.strokeRoundedRect(slotX, trayY, slotW, slotH, 8);
      this.boosterSlotGfx.push(slotGfx);

      // Icon (use texture if available, otherwise draw a text label)
      const booster = boosters[i];
      if (booster.key !== 'moves3' && this.textures.exists(booster.key)) {
        const icon = this.add.image(slotCX, slotCY - 2, booster.key);
        icon.setDisplaySize(32, 32);
      } else {
        // Fallback: text icon
        this.add.text(slotCX, slotCY - 2, booster.label, {
          fontFamily: FONT_FAMILY,
          fontSize: `${FONT_SIZE_SMALL}px`,
          color: colorHex(UI_COLOR_ACCENT),
          fontStyle: 'bold',
        }).setOrigin(0.5);
      }

      // Count badge at bottom-right
      const badgeX = Math.round(slotX + slotW - 6);
      const badgeY = Math.round(trayY + slotH - 6);
      const badgeR = BOOSTER_COUNT_BADGE_RADIUS;

      const badgeBg = this.add.graphics();
      badgeBg.fillStyle(UI_COLOR_PRIMARY, 0.9);
      badgeBg.fillCircle(badgeX, badgeY, badgeR);

      const countText = this.add.text(badgeX, badgeY, `x${booster.count}`, {
        fontFamily: FONT_FAMILY,
        fontSize: `${BOOSTER_COUNT_FONT_SIZE}px`,
        color: '#FFFFFF',
        fontStyle: 'bold',
      }).setOrigin(0.5);
      this.boosterCountTexts.push(countText);

      // Touch zone
      const zone = this.add.zone(slotCX, slotCY, slotW, slotH)
        .setInteractive({ useHandCursor: true });
      zone.on('pointerdown', () => this.onBoosterSlotTapped(i));
      this.boosterZones.push(zone);
    }

  }

  /**
   * Handle booster slot tap. Slot 0 = Hammer, Slot 1 = Rainbow, Slot 2 = +3 Moves.
   */
  private onBoosterSlotTapped(slotIndex: number): void {
    // If already in targeting mode for this slot, cancel it
    if (this.boosterTargetMode !== null) {
      const activeSlot = this.boosterTargetMode === 'hammer' ? 0 : 1;
      if (slotIndex === activeSlot) {
        this.logger.info('onBoosterSlotTapped', `Cancelling ${this.boosterTargetMode} targeting`);
        this.cancelBoosterTargeting();
        return;
      }
      // Tapped a different slot while targeting — cancel first
      this.cancelBoosterTargeting();
    }

    if (slotIndex === 0) {
      this.onHammerPressed();
      return;
    }

    if (slotIndex === 1) {
      this.onRainbowPressed();
      return;
    }

    // Slot 2 (+3 Moves) is not yet implemented — show shake animation
    this.logger.info('onBoosterSlotTapped', `Booster slot ${slotIndex} tapped — not yet available`);
    this.shakeBoosterSlot(slotIndex);
  }

  /**
   * Shake a booster slot to indicate it's empty or unavailable.
   */
  private shakeBoosterSlot(slotIndex: number): void {
    const zone = this.boosterZones[slotIndex];
    if (!zone) return;

    const gfx = this.boosterSlotGfx[slotIndex];
    if (!gfx) return;

    // Quick horizontal shake
    this.tweens.add({
      targets: [gfx],
      x: 3,
      duration: 50,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        gfx.setPosition(0, 0);
      },
    });
  }

  // ------------------------------------------------------------------
  // Hammer Booster (slot 0) — destroy a single gem
  // ------------------------------------------------------------------

  /**
   * Handle Hammer booster press. Enter targeting mode if player has tokens.
   */
  private onHammerPressed(): void {
    if (this.playState !== PlayState.IDLE) {
      this.logger.debug('onHammerPressed', 'Cannot use hammer — not in IDLE state');
      return;
    }

    if (this.remapTokensAvailable <= 0 && this.hasUsedFreeRemap) {
      this.logger.info('onHammerPressed', 'No tokens — shake slot');
      this.shakeBoosterSlot(0);
      return;
    }

    // Use free remap if available, otherwise check tokens
    if (!this.hasUsedFreeRemap || this.remapTokensAvailable > 0) {
      this.logger.info('onHammerPressed', 'Entering hammer targeting mode');
      this.enterBoosterTargeting('hammer');
    }
  }

  /**
   * Execute the hammer booster on the given grid position.
   * Destroys the single gem, consumes a token, triggers cascade.
   * Does NOT consume a move.
   */
  private executeHammer(pos: GridPosition): void {
    const grid = this.boardManager.getGrid();
    const gemData = grid[pos.row]?.[pos.col];
    if (!gemData) {
      this.logger.debug('executeHammer', 'No gem at target position');
      this.cancelBoosterTargeting();
      return;
    }

    this.logger.info('executeHammer', 'Destroying gem with hammer', {
      row: pos.row, col: pos.col, color: gemData.color,
    });

    // Cancel targeting overlay
    this.cancelBoosterTargeting();

    // Consume token
    this.consumeBoosterToken();

    // Animate and destroy the gem
    this.playState = PlayState.CLEARING;
    this.inputHandler.setEnabled(false);

    const sprite = this.gemSprites.get(gemData.id);
    if (sprite) {
      sprite.setGemState(GemState.CLEARING);
      this.tweens.add({
        targets: sprite,
        scaleX: 1.5,
        scaleY: 1.5,
        alpha: 0,
        duration: CLEAR_DURATION_MS,
        ease: 'Power2',
        onComplete: () => {
          sprite.destroyGem();
          this.gemSprites.delete(gemData.id);

          // Remove from data model
          this.boardManager.removeGems([pos]);

          // Trigger gravity + cascade (no move consumed)
          this.applyGravityAndSpawn();
        },
      });
    } else {
      // No sprite, just remove and cascade
      this.boardManager.removeGems([pos]);
      this.applyGravityAndSpawn();
    }

    // Show a small score popup for the single gem
    this.showScorePopup([pos], 10);
  }

  // ------------------------------------------------------------------
  // Rainbow Booster (slot 1) — clear all gems of a color
  // ------------------------------------------------------------------

  /**
   * Handle Rainbow booster press. Enter color-selection mode if player has tokens.
   */
  private onRainbowPressed(): void {
    if (this.playState !== PlayState.IDLE) {
      this.logger.debug('onRainbowPressed', 'Cannot use rainbow — not in IDLE state');
      return;
    }

    if (this.remapTokensAvailable <= 0 && this.hasUsedFreeRemap) {
      this.logger.info('onRainbowPressed', 'No tokens — shake slot');
      this.shakeBoosterSlot(1);
      return;
    }

    // Use free remap if available, otherwise check tokens
    if (!this.hasUsedFreeRemap || this.remapTokensAvailable > 0) {
      this.logger.info('onRainbowPressed', 'Entering rainbow targeting mode');
      this.enterBoosterTargeting('rainbow');
    }
  }

  /**
   * Execute the rainbow booster: clear all gems matching the tapped gem's color.
   * Consumes a token, triggers cascade. Does NOT consume a move.
   */
  private executeRainbow(pos: GridPosition): void {
    const grid = this.boardManager.getGrid();
    const gemData = grid[pos.row]?.[pos.col];
    if (!gemData) {
      this.logger.debug('executeRainbow', 'No gem at target position');
      this.cancelBoosterTargeting();
      return;
    }

    const targetColor = gemData.color;
    this.logger.info('executeRainbow', 'Clearing all gems of color', { color: targetColor });

    // Cancel targeting overlay
    this.cancelBoosterTargeting();

    // Consume token
    this.consumeBoosterToken();

    // Find all positions matching the color
    const positionsToRemove: GridPosition[] = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const g = grid[r]?.[c];
        if (g && g.color === targetColor) {
          positionsToRemove.push({ row: r, col: c });
        }
      }
    }

    if (positionsToRemove.length === 0) {
      this.logger.debug('executeRainbow', 'No gems of that color found');
      this.playState = PlayState.IDLE;
      this.inputHandler.setEnabled(true);
      return;
    }

    this.logger.info('executeRainbow', `Clearing ${positionsToRemove.length} gems of color ${targetColor}`);

    // Score the cleared gems (base 10 points per gem)
    const points = positionsToRemove.length * 10;
    this.scoreSystem.addBonusPoints(points);
    this.updateHUD();
    this.showScorePopup(positionsToRemove, points);

    // Animate and destroy all matching gems
    this.playState = PlayState.CLEARING;
    this.inputHandler.setEnabled(false);

    this.animateClearGems(positionsToRemove, [], () => {
      // Remove from data model
      this.boardManager.removeGems(positionsToRemove);

      // Trigger gravity + cascade (no move consumed)
      this.applyGravityAndSpawn();
    });
  }

  // ------------------------------------------------------------------
  // Shared Booster Targeting Logic
  // ------------------------------------------------------------------

  /**
   * Enter booster targeting mode. Shows overlay and intercepts board taps.
   */
  private enterBoosterTargeting(mode: BoosterTargetMode): void {
    this.boosterTargetMode = mode;
    this.playState = PlayState.BOOSTER_TARGETING;
    this.inputHandler.setEnabled(false);

    const w = GAME_WIDTH;
    const boardWidth = GRID_COLS * this.cellSize;
    const boardHeight = GRID_ROWS * this.cellSize;

    // Create overlay container
    this.boosterTargetOverlay = this.add.container(0, 0).setDepth(900);

    // Dim everything except the board area — top region
    const dimTop = this.add.graphics();
    dimTop.fillStyle(0x000000, 0.4);
    dimTop.fillRect(0, 0, w, this.boardY);
    this.boosterTargetOverlay.add(dimTop);

    // Dim left of board
    const dimLeft = this.add.graphics();
    dimLeft.fillStyle(0x000000, 0.4);
    dimLeft.fillRect(0, this.boardY, this.boardX, boardHeight);
    this.boosterTargetOverlay.add(dimLeft);

    // Dim right of board
    const dimRight = this.add.graphics();
    dimRight.fillStyle(0x000000, 0.4);
    dimRight.fillRect(this.boardX + boardWidth, this.boardY, w - this.boardX - boardWidth, boardHeight);
    this.boosterTargetOverlay.add(dimRight);

    // Dim below board
    const dimBottom = this.add.graphics();
    dimBottom.fillStyle(0x000000, 0.4);
    dimBottom.fillRect(0, this.boardY + boardHeight, w, GAME_HEIGHT - this.boardY - boardHeight);
    this.boosterTargetOverlay.add(dimBottom);

    // Instruction text
    const instructionText = mode === 'hammer' ? 'Tap a gem to destroy' : 'Tap a gem color to clear';
    const instruction = this.add.text(Math.round(w / 2), this.boardY - 14, instructionText, {
      fontFamily: FONT_FAMILY,
      fontSize: `${FONT_SIZE_SMALL}px`,
      color: colorHex(UI_COLOR_ACCENT),
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(901);
    this.boosterTargetOverlay.add(instruction);

    // Board highlight border
    const highlight = this.add.graphics().setDepth(901);
    highlight.lineStyle(2, UI_COLOR_ACCENT, 0.8);
    highlight.strokeRect(this.boardX - 2, this.boardY - 2, boardWidth + 4, boardHeight + 4);
    this.boosterTargetOverlay.add(highlight);

    // Board touch zone — intercepts taps on the board
    this.boosterBoardZone = this.add.zone(
      Math.round(this.boardX + boardWidth / 2),
      Math.round(this.boardY + boardHeight / 2),
      boardWidth,
      boardHeight,
    ).setInteractive({ useHandCursor: true }).setDepth(902);
    this.boosterBoardZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.handleBoosterBoardTap(pointer.x, pointer.y);
    });

    // Cancel zone — covers entire screen outside board to cancel on tap
    const cancelZone = this.add.zone(
      Math.round(w / 2),
      Math.round(GAME_HEIGHT / 2),
      w,
      GAME_HEIGHT,
    ).setInteractive().setDepth(899);
    cancelZone.on('pointerdown', () => {
      this.logger.info('enterBoosterTargeting', 'Tapped outside board — cancelling targeting');
      this.cancelBoosterTargeting();
    });
    this.boosterTargetOverlay.add(cancelZone);

    this.logger.info('enterBoosterTargeting', `Targeting mode active: ${mode}`);
  }

  /**
   * Handle a tap on the board during booster targeting mode.
   */
  private handleBoosterBoardTap(screenX: number, screenY: number): void {
    if (!this.boosterTargetMode) return;

    // Convert screen coords to grid position
    const col = Math.floor((screenX - this.boardX) / this.cellSize);
    const row = Math.floor((screenY - this.boardY) / this.cellSize);

    if (row < 0 || row >= GRID_ROWS || col < 0 || col >= GRID_COLS) {
      this.logger.debug('handleBoosterBoardTap', 'Tap outside grid bounds');
      return;
    }

    const pos: GridPosition = { row, col };

    if (this.boosterTargetMode === 'hammer') {
      this.executeHammer(pos);
    } else if (this.boosterTargetMode === 'rainbow') {
      this.executeRainbow(pos);
    }
  }

  /**
   * Cancel booster targeting mode and return to IDLE.
   */
  private cancelBoosterTargeting(): void {
    this.boosterTargetMode = null;

    if (this.boosterTargetOverlay) {
      this.boosterTargetOverlay.destroy();
      this.boosterTargetOverlay = null;
    }

    if (this.boosterBoardZone) {
      this.boosterBoardZone.destroy();
      this.boosterBoardZone = null;
    }

    if (this.playState === PlayState.BOOSTER_TARGETING) {
      this.playState = PlayState.IDLE;
      this.inputHandler.setEnabled(true);
    }
  }

  /**
   * Consume one booster token (shared by hammer and rainbow).
   * Uses the free remap if not yet used, otherwise deducts from remapTokensAvailable.
   */
  private consumeBoosterToken(): void {
    this.remapsUsedThisAttempt++;
    if (!this.hasUsedFreeRemap) {
      this.hasUsedFreeRemap = true;
      this.logger.info('consumeBoosterToken', 'Free token consumed');
    } else {
      this.remapTokensAvailable = Math.max(0, this.remapTokensAvailable - 1);
      this.logger.info('consumeBoosterToken', `Token consumed — ${this.remapTokensAvailable} remaining`);
    }

    // Persist token change
    const progress = getPlayerProgress(this.registry);
    progress.remapTokens = this.remapTokensAvailable;
    progress.hasUsedFreeRemap = this.hasUsedFreeRemap;
    setPlayerProgress(this.registry, progress);

    const pdm = new PlayerDataManager();
    pdm.saveProgress(progress).catch((err: unknown) => {
      this.logger.error('consumeBoosterToken', 'Failed to persist token change', err);
    });

    // Update booster count badges
    this.updateRemapButton();
    this.updateRainbowBadge();
  }

  /**
   * Update the rainbow booster (slot 1) count badge.
   */
  private updateRainbowBadge(): void {
    const countText = this.boosterCountTexts[1];
    if (countText) {
      countText.setText(`x${this.remapTokensAvailable}`);
      countText.setAlpha(this.remapTokensAvailable > 0 ? 1 : 0.4);
    }
  }

  /**
   * Update the remap button visual state (booster slot 0 count badge).
   */
  private updateRemapButton(): void {
    const canRemap = this.canUseRemap();
    const countText = this.boosterCountTexts[0];
    if (countText) {
      const label = !this.hasUsedFreeRemap
        ? 'x1'
        : `x${this.remapTokensAvailable}`;
      countText.setText(label);
      countText.setAlpha(canRemap ? 1 : 0.4);
    }
  }

  /**
   * Check whether the player can use a remap right now.
   */
  private canUseRemap(): boolean {
    if (this.remapsUsedThisAttempt >= REMAP_MAX_PER_ATTEMPT) return false;
    if (this.playState !== PlayState.IDLE) return false;
    // Free remap available?
    if (!this.hasUsedFreeRemap) return true;
    // Has tokens?
    return this.remapTokensAvailable > 0;
  }

  /**
   * Hide the extra moves confirmation modal.
   */
  private hideExtraMovesModal(): void {
    if (this.extraMovesModal) {
      this.extraMovesModal.destroy();
      this.extraMovesModal = null;
    }
  }

  // ------------------------------------------------------------------
  // Button helpers
  // ------------------------------------------------------------------

  /**
   * Create the quit button with a Graphics-drawn X icon.
   * Visual: 28x28 rounded rect centered at (cx, cy).
   * Touch target: 44x44 for accessibility.
   */
  private createQuitButton(cx: number, cy: number, callback: () => void): void {
    const visualSize = 28;
    const touchSize = 44;
    const halfVisual = visualSize / 2;

    const bg = this.add.graphics();
    bg.fillStyle(UI_COLOR_DANGER, 0.8);
    bg.fillRoundedRect(cx - halfVisual, cy - halfVisual, visualSize, visualSize, 6);

    // Draw X icon with two crossed lines
    const icon = this.add.graphics();
    icon.lineStyle(2.5, 0xFFFFFF, 1);
    icon.beginPath();
    icon.moveTo(cx - 6, cy - 6);
    icon.lineTo(cx + 6, cy + 6);
    icon.moveTo(cx + 6, cy - 6);
    icon.lineTo(cx - 6, cy + 6);
    icon.strokePath();

    // Hit zone 44x44 for accessibility
    const zone = this.add.zone(cx, cy, touchSize, touchSize).setInteractive({ useHandCursor: true });
    zone.on('pointerdown', callback);
  }

  // ------------------------------------------------------------------
  // Cleanup — prevent timer and tween leaks on scene transition
  // ------------------------------------------------------------------

  shutdown(): void {
    this.logger.info('shutdown', 'GameplayScene shutting down — cleaning up resources');

    // ── Timers ──
    if (this.scoreCounterTimer) {
      this.scoreCounterTimer.destroy();
      this.scoreCounterTimer = null;
    }

    // ── Tweens ──
    if (this.starPulseTween) {
      this.starPulseTween.stop();
      this.starPulseTween = null;
    }

    // ── Modals (GlModal instances) ──
    if (this.confirmModal) {
      this.confirmModal.destroy();
      this.confirmModal = null;
    }

    if (this.failModal) {
      this.failModal.destroy();
      this.failModal = null;
    }

    if (this.extraMovesModal) {
      this.extraMovesModal.destroy();
      this.extraMovesModal = null;
    }

    if (this.boosterTargetOverlay) {
      this.boosterTargetOverlay.destroy();
      this.boosterTargetOverlay = null;
    }

    if (this.boosterBoardZone) {
      this.boosterBoardZone.destroy();
      this.boosterBoardZone = null;
    }

    // ── Input handler ──
    if (this.inputHandler) {
      this.inputHandler.destroy();
    }

    // ── Gem sprites ──
    for (const sprite of this.gemSprites.values()) {
      sprite.destroyGem();
    }
    this.gemSprites.clear();

    // ── Booster zones ──
    for (const zone of this.boosterZones) {
      zone.destroy();
    }
    this.boosterZones = [];
    this.boosterSlotGfx = [];
    this.boosterCountTexts = [];

    // ── Reset state ──
    this.boosterTargetMode = null;
    this.pulsingStarIndex = -1;
    this.earnedStars = [false, false, false];
    this.starMarkers = [];
    this.starMarkerXPositions = [];

    this.logger.info('shutdown', 'GameplayScene cleanup complete');
  }

}
