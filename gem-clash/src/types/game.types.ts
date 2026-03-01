/**
 * Gem Link — Shared Game Types
 * Owner: Principal Engineer
 *
 * These types are the single source of truth consumed by ALL agents.
 * Do NOT duplicate these types in other files.
 * Do NOT modify without PE approval.
 */

// ============================================================
// GEM TYPES
// ============================================================

/** The 6 gem colors available in the game */
export enum GemColor {
  RED = 'red',
  BLUE = 'blue',
  GREEN = 'green',
  YELLOW = 'yellow',
  PURPLE = 'purple',
  WHITE = 'white',
}

/** Special gem types created by matching patterns */
export enum SpecialGemType {
  NONE = 'none',
  /** Created by matching 4 in a row/column — clears entire row or column */
  LINE_CLEAR = 'line_clear',
  /** Created by L-shape or T-shape match (5 gems) — clears 3x3 area */
  BOMB = 'bomb',
  /** Created by matching 5 in a row/column — clears all gems of swapped color */
  COLOR_BOMB = 'color_bomb',
}

/** Visual state of a gem for rendering */
export enum GemState {
  IDLE = 'idle',
  SELECTED = 'selected',
  MATCHED = 'matched',
  CLEARING = 'clearing',
  FALLING = 'falling',
  SPAWNING = 'spawning',
}

/** Complete data for a single gem on the board */
export interface GemData {
  /** Unique identifier for this gem instance */
  id: string;
  /** Gem color */
  color: GemColor;
  /** Special gem type (NONE for regular gems) */
  specialType: SpecialGemType;
  /** Grid row position (0 = top) */
  row: number;
  /** Grid column position (0 = left) */
  col: number;
  /** Current visual state */
  state: GemState;
}

// ============================================================
// BOARD TYPES
// ============================================================

/** Grid position on the board */
export interface GridPosition {
  row: number;
  col: number;
}

/** A swap action between two adjacent gems */
export interface SwapAction {
  from: GridPosition;
  to: GridPosition;
}

/** Direction of a match */
export type MatchDirection = 'horizontal' | 'vertical';

/** A detected match on the board */
export interface Match {
  /** Positions of matched gems */
  gems: GridPosition[];
  /** Direction of the match */
  direction: MatchDirection;
  /** Color of matched gems */
  color: GemColor;
  /** Length of match (3, 4, or 5+) */
  length: number;
}

/** Result of a cascade resolution cycle */
export interface CascadeResult {
  /** All matches found and cleared in this cascade */
  matchesCleared: Match[];
  /** Special gems created during this cascade */
  specialsCreated: { position: GridPosition; type: SpecialGemType }[];
  /** Total gems cleared in this cascade step */
  gemsCleared: number;
  /** Cascade depth (1 = first cascade after player move, 2+ = chain) */
  depth: number;
}

// ============================================================
// LEVEL TYPES
// ============================================================

/** Difficulty classification for a level */
export type LevelDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

/** Score thresholds for star ratings */
export interface StarThresholds {
  /** Minimum score to pass (1 star) */
  oneStar: number;
  /** Good score (2 stars) */
  twoStar: number;
  /** Perfect score (3 stars) */
  threeStar: number;
}

/** Which special gems are enabled for a level */
export interface SpecialGemConfig {
  lineClears: boolean;
  bombs: boolean;
  colorBombs: boolean;
}

/** Complete configuration for a single level */
export interface LevelData {
  /** Level number (1-30) */
  id: number;
  /** Display name shown in level select */
  name: string;
  /** Brief description for level select screen */
  description: string;
  /** Difficulty classification */
  difficulty: LevelDifficulty;
  /** Grid dimensions (always 8x8 for Phase 1) */
  gridSize: { rows: number; cols: number };
  /** Number of active gem colors (4-6) */
  gemColors: number;
  /** Maximum moves allowed */
  maxMoves: number;
  /** Score thresholds for 1, 2, 3 stars */
  scoreThresholds: StarThresholds;
  /** Which special gems are enabled */
  specialGems: SpecialGemConfig;
  /** Objective description shown to player */
  objectives: string;
}

/** Result of completing a level */
export interface LevelResult {
  /** Level ID */
  levelId: number;
  /** Final score achieved */
  score: number;
  /** Stars earned (0 = failed, 1-3 = passed) */
  stars: 0 | 1 | 2 | 3;
  /** Total moves used */
  movesUsed: number;
  /** Moves remaining when level ended */
  movesRemaining: number;
  /** Duration in seconds */
  durationSeconds: number;
  /** Total cascade chains */
  totalCascades: number;
  /** Whether the player passed the level */
  passed: boolean;
}

// ============================================================
// PLAYER TYPES
// ============================================================

/** Star rating for a single level (0 = not played) */
export type StarRating = 0 | 1 | 2 | 3;

/** Player progress data (stored in Jest playerData, max 1MB) */
export interface PlayerProgress {
  /** Schema version for migration support */
  schemaVersion: number;
  /** Highest unlocked level (1-based) */
  currentLevel: number;
  /** Star ratings per level { "1": 3, "2": 2, ... } */
  stars: Record<string, StarRating>;
  /** Total stars earned across all levels */
  totalStars: number;
  /** Current lives count (0-5) */
  lives: number;
  /** ISO timestamp of last life deduction (for regen timer) */
  lastLifeLostAt: string | null;
  /** Whether the tutorial has been completed */
  tutorialComplete: boolean;
  /** Sound settings */
  settings: {
    soundEnabled: boolean;
    musicEnabled: boolean;
  };
  /** Total gems matched (lifetime stat) */
  totalGemsMatched: number;
  /** Highest combo chain achieved */
  bestCombo: number;
  /** Re-map tokens available */
  remapTokens: number;
  /** Whether the player has ever used a free remap */
  hasUsedFreeRemap: boolean;
  /** Soft currency earned through gameplay */
  coins: number;
  /** Premium currency purchased with real money */
  gems: number;
  /** ISO timestamp of last free gift collection */
  lastFreeGiftAt: string | null;
  /** ISO timestamp of current special offer expiry */
  specialOfferExpiresAt: string | null;
}

/** Default player progress for new players */
export const DEFAULT_PLAYER_PROGRESS: PlayerProgress = {
  schemaVersion: 1,
  currentLevel: 1,
  stars: {},
  totalStars: 0,
  lives: 5,
  lastLifeLostAt: null,
  tutorialComplete: false,
  settings: {
    soundEnabled: true,
    musicEnabled: true,
  },
  totalGemsMatched: 0,
  bestCombo: 0,
  remapTokens: 2,
  hasUsedFreeRemap: false,
  coins: 0,
  gems: 0,
  lastFreeGiftAt: null,
  specialOfferExpiresAt: null,
};

// ============================================================
// GAME CONSTANTS
// ============================================================

/** Board dimensions */
export const GRID_ROWS = 8;
export const GRID_COLS = 8;

/** Minimum match length */
export const MIN_MATCH_LENGTH = 3;

/** Lives system */
export const MAX_LIVES = 5;
export const LIFE_REGEN_MINUTES = 30;

/** Re-map booster */
export const REMAP_STARTING_TOKENS = 2;
export const REMAP_MAX_PER_ATTEMPT = 2;

/** Guest mode */
export const GUEST_LEVEL_LIMIT = 10;

/** Build size */
export const BUILD_SIZE_WARN_MB = 8;
export const BUILD_SIZE_MAX_MB = 10;

// ============================================================
// SKU TYPES
// ============================================================

/** Phase 1 purchasable product SKUs (immutable after Jest registration) */
export enum ProductSKU {
  EXTRA_MOVES = 'gc_moves_3',
  LIVES_REFILL = 'gc_lives_refill',
  STARTER_PACK = 'gc_starter_pack',
  REMAP = 'gc_remap',
  // Tiered currency packs
  PACK_BEGINNER = 'gc_pack_beginner',
  PACK_JUMBO = 'gc_pack_jumbo',
  PACK_SUPER = 'gc_pack_super',
  PACK_MEGA = 'gc_pack_mega',
  // Boosters
  HAMMER = 'gc_hammer',
  BOMB_BOOSTER = 'gc_bomb_booster',
  RAINBOW = 'gc_rainbow',
}

/** Product catalog entry */
export interface ProductInfo {
  sku: ProductSKU;
  name: string;
  description: string;
  priceInTokens: number;
}

/** Phase 1 product catalog */
export const PRODUCT_CATALOG: ProductInfo[] = [
  {
    sku: ProductSKU.EXTRA_MOVES,
    name: 'Extra Moves',
    description: '+3 moves during active level',
    priceInTokens: 1,
  },
  {
    sku: ProductSKU.LIVES_REFILL,
    name: 'Lives Refill',
    description: 'Refill lives to 5/5',
    priceInTokens: 2,
  },
  {
    sku: ProductSKU.STARTER_PACK,
    name: 'Starter Pack',
    description: '5x Extra Moves + 3x Lives Refill + Exclusive Gem Skin',
    priceInTokens: 3,
  },
  {
    sku: ProductSKU.REMAP,
    name: 'Re-map',
    description: 'Shuffle all gems on the board — keep your score & moves',
    priceInTokens: 1,
  },
  {
    sku: ProductSKU.PACK_BEGINNER,
    name: 'Beginner Pack',
    description: '250 coins',
    priceInTokens: 2,
  },
  {
    sku: ProductSKU.PACK_JUMBO,
    name: 'Jumbo Pack',
    description: '1000 coins + 10 gems',
    priceInTokens: 5,
  },
  {
    sku: ProductSKU.PACK_SUPER,
    name: 'Super Pack',
    description: '3000 coins + 30 gems + 3 boosters',
    priceInTokens: 10,
  },
  {
    sku: ProductSKU.PACK_MEGA,
    name: 'Mega Pack',
    description: '8000 coins + 100 gems + 10 boosters',
    priceInTokens: 20,
  },
  {
    sku: ProductSKU.HAMMER,
    name: 'Hammer',
    description: 'Destroy any single gem on the board',
    priceInTokens: 1,
  },
  {
    sku: ProductSKU.BOMB_BOOSTER,
    name: 'Bomb Booster',
    description: 'Create a bomb gem at a random position',
    priceInTokens: 2,
  },
  {
    sku: ProductSKU.RAINBOW,
    name: 'Rainbow',
    description: 'Clear all gems of a chosen color',
    priceInTokens: 1,
  },
];

// ============================================================
// OFFER TYPES
// ============================================================

/** Configuration for timed offers and free gifts */
export interface OfferTimer {
  /** Unique offer ID */
  id: string;
  /** Display name */
  name: string;
  /** Duration in minutes */
  durationMinutes: number;
  /** Reward description */
  reward: string;
  /** Whether this is a free gift (vs paid offer) */
  isFreeGift: boolean;
}

/** Free gift cooldown in minutes (4 hours) */
export const FREE_GIFT_COOLDOWN_MINUTES = 240;

/** Default offers */
export const OFFERS: OfferTimer[] = [
  {
    id: 'daily_free_gift',
    name: 'Free Gift',
    durationMinutes: FREE_GIFT_COOLDOWN_MINUTES,
    reward: 'Random booster or 50 coins',
    isFreeGift: true,
  },
];

// ============================================================
// EVENT TYPES (for EventBus cross-module communication)
// ============================================================

/** Game events emitted via EventBus */
export enum GameEvent {
  // Gameplay
  GEMS_MATCHED = 'gems_matched',
  CASCADE_COMPLETE = 'cascade_complete',
  SPECIAL_GEM_CREATED = 'special_gem_created',
  SPECIAL_GEM_ACTIVATED = 'special_gem_activated',
  SCORE_UPDATED = 'score_updated',
  MOVES_UPDATED = 'moves_updated',
  BOARD_STABLE = 'board_stable',
  BOARD_DEADLOCKED = 'board_deadlocked',
  REMAP_ACTIVATED = 'remap_activated',

  // Level
  LEVEL_STARTED = 'level_started',
  LEVEL_COMPLETED = 'level_completed',
  LEVEL_FAILED = 'level_failed',

  // Lives
  LIFE_LOST = 'life_lost',
  LIFE_REGENERATED = 'life_regenerated',
  LIVES_REFILLED = 'lives_refilled',

  // Purchase
  PURCHASE_STARTED = 'purchase_started',
  PURCHASE_COMPLETED = 'purchase_completed',
  PURCHASE_FAILED = 'purchase_failed',
  PURCHASE_CANCELLED = 'purchase_cancelled',

  // Player
  PLAYER_DATA_LOADED = 'player_data_loaded',
  PLAYER_DATA_SAVED = 'player_data_saved',
  PLAYER_REGISTERED = 'player_registered',

  // Offers
  OFFER_AVAILABLE = 'offer_available',
  FREE_GIFT_COLLECTED = 'free_gift_collected',
  OFFER_EXPIRED = 'offer_expired',

  // Currency
  COINS_UPDATED = 'coins_updated',
  GEMS_UPDATED = 'gems_updated',
}
