/**
 * Gem Link — Game Constants
 * Owner: Frontend Lead Engineer
 * Task: TASK-002
 *
 * Centralized constants for game configuration.
 * Board/grid constants are in game.types.ts (owned by PE).
 * This file holds UI, rendering, and timing constants.
 */

// ============================================================
// DISPLAY
// ============================================================

/** Default game viewport dimensions (mobile-first, fits Jest webview) */
export const GAME_WIDTH = 390;
export const GAME_HEIGHT = 600;

/** Background color for the game canvas */
export const BACKGROUND_COLOR = 0x1A0A2E;
export const BACKGROUND_COLOR_HEX = '#1A0A2E';

// ============================================================
// GEM RENDERING
// ============================================================

/** Pixel size of each gem cell */
export const GEM_SIZE = 44;

/** Spacing between gems in pixels (increased from 2 for visual breathing room) */
export const GEM_SPACING = 4;

/** Gem colors mapped to hex values */
export const GEM_COLORS: Record<string, number> = {
  red: 0xFF4444,
  blue: 0x4488FF,
  green: 0x44DD44,
  yellow: 0xFFDD44,
  purple: 0xBB44FF,
  white: 0xEEEEFF,
} as const;

// ============================================================
// ANIMATION TIMINGS (milliseconds)
// ============================================================

/** Duration of gem swap animation */
export const SWAP_DURATION_MS = 200;

/** Duration of match clear animation */
export const CLEAR_DURATION_MS = 300;

/** Duration of gem falling animation (per row) */
export const FALL_DURATION_MS = 100;

/** Duration of gem spawn fade-in */
export const SPAWN_DURATION_MS = 150;

/** Delay between cascade steps */
export const CASCADE_DELAY_MS = 250;

/** Duration of score popup animation */
export const SCORE_POPUP_DURATION_MS = 800;

// ============================================================
// SCORING
// ============================================================

/** Base points per gem in a match */
export const BASE_MATCH_POINTS = 50;

/** Multiplier increase per cascade depth */
export const CASCADE_MULTIPLIER = 0.5;

/** Bonus points for 4-match (line clear creation) */
export const FOUR_MATCH_BONUS = 100;

/** Bonus points for 5-match (color bomb creation) */
export const FIVE_MATCH_BONUS = 250;

/** Bonus points for L/T shape (bomb creation) */
export const SHAPE_MATCH_BONUS = 150;

// ============================================================
// UI
// ============================================================

/** Font family used throughout the game */
export const FONT_FAMILY = 'Arial, Helvetica, sans-serif';

/** Common font sizes */
export const FONT_SIZE_SMALL = 16;
export const FONT_SIZE_MEDIUM = 24;
export const FONT_SIZE_LARGE = 36;
export const FONT_SIZE_XL = 48;

/** Minimum touch target size for accessibility (Apple/Google guidelines) */
export const MIN_TOUCH_TARGET = 48;

/** Standard margins/padding (increased for better visual separation) */
export const MARGIN_EDGE = 24;
export const MARGIN_SECTION = 20;

/** Standard button sizes */
export const BTN_WIDTH_LARGE = 260;
export const BTN_WIDTH_MEDIUM = 200;
export const BTN_WIDTH_SMALL = 140;
export const BTN_HEIGHT = 52;

/** Common UI colors */
export const UI_COLOR_PRIMARY = 0x6C3BD1;
export const UI_COLOR_SECONDARY = 0x2A1A4E;
export const UI_COLOR_ACCENT = 0xFFD700;
export const UI_COLOR_TEXT = 0xFFFFFF;
export const UI_COLOR_TEXT_DIM = 0xAAAAAA;
export const UI_COLOR_DANGER = 0xFF4444;
export const UI_COLOR_SUCCESS = 0x44DD44;

// ============================================================
// SCENE KEYS
// ============================================================

export const SCENE_BOOT = 'BootScene';
export const SCENE_PRELOAD = 'PreloadScene';
export const SCENE_MAIN_MENU = 'MainMenuScene';
export const SCENE_LEVEL_SELECT = 'LevelSelectScene';
export const SCENE_GAMEPLAY = 'GameplayScene';
export const SCENE_LEVEL_COMPLETE = 'LevelCompleteScene';
export const SCENE_SHOP = 'ShopScene';

// ============================================================
// RICH COLOR PALETTE (A01 — Visual Redesign Tokens)
// ============================================================

/** Deep blue board background */
export const COLOR_BOARD_BG = 0x0A0A3E;

/** Warm gold accent */
export const COLOR_WARM_GOLD = 0xFFB800;

/** Emerald accent */
export const COLOR_EMERALD = 0x00CC66;

// ============================================================
// GEM SHAPE COLORS (distinct per-shape palette)
// ============================================================

export const GEM_SHAPE_COLORS = {
  heart:    0xFF4466,  // red
  diamond:  0x4499FF,  // blue
  triangle: 0xFFCC33,  // yellow
  square:   0x33DD66,  // green / emerald
  circle:   0xBB55FF,  // purple
  star:     0xEEEEFF,  // white
} as const;

// ============================================================
// SHOP COLORS
// ============================================================

export const COLOR_CHEST_BROWN = 0x8B4513;
export const COLOR_COIN_GOLD = 0xFFD700;
export const COLOR_RIBBON_BLUE = 0x1E90FF;

// ============================================================
// HUD BADGE COLORS
// ============================================================

export const BADGE_COLOR_HEART = 0xFF4466;
export const BADGE_COLOR_COIN = 0xFFD700;
export const BADGE_COLOR_GEM = 0xBB55FF;

// ============================================================
// MODAL / CARD BACKDROP COLORS
// ============================================================

export const COLOR_MODAL_BACKDROP = 0x000000;
export const MODAL_BACKDROP_DEFAULT_ALPHA = 0.7;

export const COLOR_CARD_BG = 0x2A1A4E;
export const COLOR_CARD_BORDER = 0x6C3BD1;

// ============================================================
// GRADIENT PRESETS (top color, bottom color)
// ============================================================

export const GRADIENT_BUTTON_PRIMARY: readonly [number, number] = [0x6C3BD1, 0x4A1FA0];
export const GRADIENT_BUTTON_SUCCESS: readonly [number, number] = [0x44DD44, 0x22AA22];
export const GRADIENT_BUTTON_GOLD:    readonly [number, number] = [0xFFD700, 0xFFB800];
export const GRADIENT_BUTTON_DANGER:  readonly [number, number] = [0xFF4444, 0xCC2222];
export const GRADIENT_BOARD_BG:       readonly [number, number] = [0x0A0A3E, 0x150B40];

// ============================================================
// ADDITIONAL FONT SIZES
// ============================================================

export const FONT_SIZE_XS = 12;
export const FONT_SIZE_XXL = 56;

// ============================================================
// Z-DEPTH CONSTANTS (render ordering)
// ============================================================

export const Z_BOARD = 100;
export const Z_GEMS = 200;
export const Z_EFFECTS = 300;
export const Z_HUD = 900;
export const Z_MODAL_BACKDROP = 1000;
export const Z_MODAL = 1010;
export const Z_OVERLAY = 1100;
export const Z_PARTICLES = 1200;

// ============================================================
// ANIMATION EASING PRESETS
// ============================================================

export const EASE_BOUNCE = 'Bounce.easeOut';
export const EASE_BACK = 'Back.easeOut';
export const EASE_ELASTIC = 'Elastic.easeOut';
export const EASE_QUAD = 'Quad.easeOut';

// ============================================================
// SHADOW CONFIG
// ============================================================

export const SHADOW_OFFSET = 2;
export const SHADOW_COLOR = 0x000000;
export const SHADOW_ALPHA = 0.4;

// ============================================================
// TEXT SHADOW CONFIG (for better readability)
// ============================================================

/** Text shadow offset in pixels */
export const TEXT_SHADOW_OFFSET_X = 1;
export const TEXT_SHADOW_OFFSET_Y = 2;
/** Text shadow blur radius */
export const TEXT_SHADOW_BLUR = 3;
/** Text shadow color */
export const TEXT_SHADOW_COLOR = '#000000';
/** Text shadow alpha (0-1) */
export const TEXT_SHADOW_ALPHA = 0.5;

// ============================================================
// BUTTON PRESS ANIMATION
// ============================================================

export const BTN_PRESS_SCALE = 0.95;
export const BTN_PRESS_DURATION = 80;

// ============================================================
// HUD CONFIG
// ============================================================

export const HUD_HEIGHT = 50;
export const HUD_BG_COLOR = 0x1A0A2E;
export const HUD_BG_ALPHA = 0.95;
export const HUD_BADGE_RADIUS = 18;
export const HUD_BADGE_SPACING = 8;

// ============================================================
// MODAL CONFIG
// ============================================================

export const MODAL_WIDTH = 340;
export const MODAL_BORDER_RADIUS = 16;
export const MODAL_BACKDROP_ALPHA = 0.7;

// ============================================================
// CARD CONFIG
// ============================================================

export const CARD_WIDTH = 80;
export const CARD_HEIGHT = 110;
export const CARD_BORDER_RADIUS = 12;
export const CARD_BG_COLOR = 0x2A1A4E;
export const CARD_BORDER_COLOR = 0x6C3BD1;

// ============================================================
// RIBBON CONFIG
// ============================================================

export const RIBBON_HEIGHT = 40;
export const RIBBON_COLOR = 0x1E90FF;
export const RIBBON_TEXT_COLOR = 0xFFD700;

// ============================================================
// HUD LAYOUT CONSTANTS
// ============================================================

/** Top margin for the HUD row (increased for breathing room from top edge) */
export const HUD_TOP_MARGIN = 16;

/** Width of each HUD pill (e.g., lives, coins, gems) */
export const HUD_PILL_WIDTH = 90;

/** Height of each HUD pill */
export const HUD_PILL_HEIGHT = 32;

/** Gap between HUD pills */
export const HUD_PILL_GAP = 12;

/** Border radius for HUD pill rounded rectangles */
export const HUD_PILL_RADIUS = 16;

/** Icon size inside HUD pills */
export const HUD_ICON_SIZE = 20;

/** Internal padding inside HUD pills */
export const HUD_PILL_PADDING = 8;

// ============================================================
// GAMEPLAY SCENE LAYOUT CONSTANTS
// ============================================================

/** Y position of the level header text (increased for breathing room from top) */
export const GAMEPLAY_HEADER_Y = 12;

/** Y position of the HUD row in gameplay */
export const GAMEPLAY_HUD_ROW_Y = 40;

/** Y position of the progress bar */
export const GAMEPLAY_PROGRESS_Y = 66;

/** Y position of the board top edge */
export const GAMEPLAY_BOARD_Y = 90;

/** Y position of the booster tray (increased gap from board bottom) */
export const GAMEPLAY_BOOSTER_Y = 480;

/** Font size for the gameplay header */
export const GAMEPLAY_HEADER_FONT_SIZE = 20;

/** Height of compact pills used in gameplay HUD */
export const GAMEPLAY_COMPACT_PILL_HEIGHT = 24;

/** Border radius for compact pills */
export const GAMEPLAY_COMPACT_PILL_RADIUS = 12;

// ============================================================
// SHOP LAYOUT CONSTANTS
// ============================================================

/** Width of shop cards */
export const SHOP_CARD_WIDTH = 82;

/** Height of shop cards */
export const SHOP_CARD_HEIGHT = 120;

/** Gap between shop cards (increased for better separation) */
export const SHOP_CARD_GAP = 12;

/** Width of booster tiles in the shop */
export const SHOP_BOOSTER_TILE_W = 72;

/** Height of booster tiles in the shop */
export const SHOP_BOOSTER_TILE_H = 80;

/** Gap between booster tiles (increased for better separation) */
export const SHOP_BOOSTER_TILE_GAP = 10;

/** Font size for shop section titles */
export const SHOP_SECTION_TITLE_SIZE = 20;

// ============================================================
// MODAL LAYOUT CONSTANTS
// ============================================================

/** Internal padding for modal content */
export const MODAL_PADDING = 24;

/** Gap between modal title and content */
export const MODAL_TITLE_GAP = 16;

/** Gap between modal action buttons */
export const MODAL_BUTTON_GAP = 12;

/** Minimum height for modals */
export const MODAL_MIN_HEIGHT = 240;

/** Maximum height for modals */
export const MODAL_MAX_HEIGHT = 500;

/** Alpha for modal separator lines */
export const MODAL_SEPARATOR_ALPHA = 0.1;

// ============================================================
// BOOSTER TRAY CONSTANTS
// ============================================================

/** Size of each booster slot in the tray */
export const BOOSTER_SLOT_SIZE = 48;

/** Gap between booster slots */
export const BOOSTER_SLOT_GAP = 16;

/** Radius of the booster count badge */
export const BOOSTER_COUNT_BADGE_RADIUS = 10;

/** Font size for the booster count number */
export const BOOSTER_COUNT_FONT_SIZE = 13;

// ============================================================
// MOVES WARNING COLOR THRESHOLDS
// ============================================================

/** Moves remaining threshold to show warning color */
export const MOVES_WARNING_THRESHOLD = 5;

/** Moves remaining threshold to show danger color */
export const MOVES_DANGER_THRESHOLD = 2;

/** Warning color for low-moves state (orange) */
export const UI_COLOR_WARNING = 0xFFA502;

// ============================================================
// ASSET TEXTURE KEYS
// ============================================================

/** Map from gem color name to its texture key */
export const GEM_TEXTURE_MAP: Record<string, string> = {
  red: 'gem_heart',
  blue: 'gem_diamond',
  green: 'gem_square',
  yellow: 'gem_triangle',
  purple: 'gem_circle',
  white: 'gem_star',
};

/** UI asset texture keys */
export const ASSET_KEY_LOGO = 'ui_logo';
export const ASSET_KEY_BOMB = 'ui_bomb';
export const ASSET_KEY_RAINBOW = 'ui_rainbow';
export const ASSET_KEY_COIN = 'ui_coin';
export const ASSET_KEY_STAR = 'ui_star';
export const ASSET_KEY_HAMMER = 'ui_hammer';
export const ASSET_KEY_CHEST_CLOSED = 'ui_chest_closed';
export const ASSET_KEY_CHEST_OPEN = 'ui_chest_open';
export const ASSET_KEY_HEART = 'ui_heart';
export const ASSET_KEY_GEM = 'ui_gem';
export const ASSET_KEY_RAINBOW_CIRCLE = 'circle_rainbow';

// ============================================================
// BACKGROUND ASSET KEYS
// ============================================================

/** Background image for gameplay scene */
export const ASSET_KEY_BG_GAMEPLAY = 'bg_gameplay';
/** Background image for main menu scene */
export const ASSET_KEY_BG_MENU = 'bg_menu';
/** Background image for shop scene */
export const ASSET_KEY_BG_SHOP = 'bg_shop';
/** Background image for level select scene */
export const ASSET_KEY_BG_LEVEL_SELECT = 'bg_level_select';

// ============================================================
// UI SPRITE ASSET KEYS (promoted from extras)
// ============================================================

/** Play button green sprite */
export const ASSET_KEY_BTN_PLAY_GREEN = 'btn_play_green';
/** Arrow right icon (next buttons) */
export const ASSET_KEY_ARROW_RIGHT = 'icon_arrow_right';
/** Arrow left icon (back buttons) */
export const ASSET_KEY_ARROW_LEFT = 'icon_arrow_left';
/** Settings gear icon */
export const ASSET_KEY_SETTINGS = 'icon_settings';
/** Level select header sprite */
export const ASSET_KEY_HEADER_LEVEL = 'header_level';
/** Shop header sprite */
export const ASSET_KEY_HEADER_SHOP = 'header_shop';
/** Progress bar empty (background track) */
export const ASSET_KEY_PROGRESS_EMPTY = 'progress_bar_empty';
/** Progress bar full (fill overlay) */
export const ASSET_KEY_PROGRESS_FULL = 'progress_bar_full';
/** Green banner (fallback button background) */
export const ASSET_KEY_BANNER_GREEN = 'banner_green';
/** Level complete celebration sprite */
export const ASSET_KEY_LEVEL_COMPLETE = 'level_complete';

// ============================================================
// DIGIT SPRITE ASSET KEYS
// ============================================================

/** Digit sprite keys for number rendering (0-9) */
export const DIGIT_TEXTURE_KEYS: string[] = [
  'digit_0', 'digit_1', 'digit_2', 'digit_3', 'digit_4',
  'digit_5', 'digit_6', 'digit_7', 'digit_8', 'digit_9',
];

// ============================================================
// FRAME ASSET KEYS
// ============================================================

/** Golden button frame (nine-slice) */
export const ASSET_KEY_FRAME_BUTTON_GOLD = 'frame_button_gold';
/** Green button frame (nine-slice) */
export const ASSET_KEY_FRAME_BUTTON_GREEN = 'frame_button_green';
/** Panel frame (nine-slice) */
export const ASSET_KEY_FRAME_PANEL = 'frame_panel';
/** Board frame */
export const ASSET_KEY_FRAME_BOARD = 'frame_board';

// ============================================================
// FREE GIFT CONSTANTS
// ============================================================

/** Cooldown in hours between free gift claims */
export const FREE_GIFT_COOLDOWN_HOURS = 4;
