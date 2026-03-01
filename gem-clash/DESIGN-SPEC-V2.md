# Gem Link -- Design Specification V2: Visual Overhaul

> **Owner:** Lead Designer
> **Status:** ACTIVE -- Engineers implement from this document
> **Date:** 2026-02-28
> **Viewport:** 390x600 (portrait, mobile webview)
> **Engine:** Phaser 3 (WebGL/Canvas, Phaser.Scale.FIT)

---

## Table of Contents

1. [Critical Fixes Summary](#1-critical-fixes-summary)
2. [Text Rendering Fix](#2-text-rendering-fix)
3. [Asset Inventory and Loading Plan](#3-asset-inventory-and-loading-plan)
4. [Updated Design Tokens](#4-updated-design-tokens)
5. [HUD Pill Redesign](#5-hud-pill-redesign)
6. [MainMenuScene Redesign](#6-mainmenuscene-redesign)
7. [ShopScene Redesign](#7-shopscene-redesign)
8. [GameplayScene Redesign](#8-gameplayscene-redesign)
9. [LevelCompleteScene Adjustments](#9-levelcompletescene-adjustments)
10. [Modal and Popup Redesign](#10-modal-and-popup-redesign)
11. [Combo and Celebration Text Redesign](#11-combo-and-celebration-text-redesign)
12. [Animation Specifications](#12-animation-specifications)
13. [Color Palette (Updated)](#13-color-palette-updated)
14. [Gem Sprite Integration](#14-gem-sprite-integration)

---

## 1. Critical Fixes Summary

These are the 20 issues identified, mapped to the sections where each is resolved:

| # | Issue | Section |
|---|-------|---------|
| 1 | HUD pills too wide, margins broken, plus buttons overlap | 5 |
| 2 | All text blurry across the app | 2 |
| 3 | "Gem Link" title spacing too tight | 6 |
| 4 | Inconsistent vertical spacing | 4, 6, 7, 8 |
| 5 | "Current Level" text too small | 6 |
| 6 | Booster icons under board look terrible | 6 |
| 7 | Spacing between icon buttons and play button | 6 |
| 8 | Free Gift button broken texture/color | 6, 7 |
| 9 | Icon buttons non-functional -- remove | 6 |
| 10 | Entire shop layout broken | 7 |
| 11 | Text popups look like MS Word art | 11 |
| 12 | Confirm purchase modal buttons/text overlapping | 10 |
| 13 | No item descriptions/imagery in shop | 7 |
| 14 | Level title margin too small | 8 |
| 15 | Remove "First Steps" subtitle | 8 |
| 16 | Moves overlapping progress bar | 8 |
| 17 | Coins overlapping progress bar | 8 |
| 18 | Coins pill too wide | 8 |
| 19 | General crowding in gameplay | 8 |
| 20 | Boosters non-functional in gameplay | 8 |

---

## 2. Text Rendering Fix

### Root Cause Analysis

The game currently uses `Phaser.Scale.FIT` with `Phaser.Scale.MAX_ZOOM` and `roundPixels: false`. Phaser renders into a 390x600 canvas, then CSS-scales it to fill the device viewport. When the canvas is upscaled via CSS (which it always is on modern phones with 2x/3x DPR), all text rendered at native canvas resolution appears blurry because it was rasterized at 1x and then stretched.

Additionally, `roundPixels: false` means text can be positioned at sub-pixel coordinates (e.g., x=195.5), causing the browser to anti-alias the text, which produces a smeared/blurry appearance.

### Required Changes

#### A. Set canvas resolution multiplier

In `main.ts`, update the Phaser game config:

```
render: {
  pixelArt: false,
  antialias: true,
  roundPixels: true,     // CHANGE: was false
}
```

Set `roundPixels: true` to ensure all game objects (especially text) are positioned at integer pixel coordinates.

#### B. Use device pixel ratio for higher-resolution canvas

In `main.ts`, add a resolution multiplier to the game config:

```
const dpr = Math.min(window.devicePixelRatio || 1, 2);

const config: Phaser.Types.Core.GameConfig = {
  ...
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  resolution: dpr,       // ADD THIS
  render: {
    pixelArt: false,
    antialias: true,
    roundPixels: true,
  },
  ...
};
```

This makes the internal canvas render at 2x resolution on retina displays, so text is rasterized at 780x1200 then displayed at 390x600 CSS pixels. The result is crisp text on all devices.

**Important:** After adding `resolution: dpr`, visually verify all layout positions. Phaser's `resolution` scales the internal canvas but keeps the coordinate system the same (still 390x600 in game-world units), so no layout math should need to change. However, generated textures from `Graphics.generateTexture()` may need their size parameters multiplied by `dpr` to look correct -- this affects `GlParticles` and `CelebrationSystem`.

#### C. Integer positioning for all text

Every `scene.add.text(x, y, ...)` call must use integer x and y values. Use `Math.round()` when computing positions:

```
// WRONG
this.add.text(GAME_WIDTH / 2, 110.5, 'Gem Link', ...);

// RIGHT
this.add.text(Math.round(GAME_WIDTH / 2), 110, 'Gem Link', ...);
```

Since GAME_WIDTH is 390 (even), `GAME_WIDTH / 2` = 195 (integer), so most center placements are already fine. But any arithmetic that produces non-integer results must be rounded.

#### D. Font rendering improvements

Update the `FONT_FAMILY` constant:

```
export const FONT_FAMILY = '"Segoe UI", "Helvetica Neue", Arial, sans-serif';
```

For all bold text (titles, buttons, HUD values), add explicit `fontStyle: 'bold'` and consider adding slight stroke for contrast:

```
// For important text on dark backgrounds
{
  fontFamily: FONT_FAMILY,
  fontSize: '24px',
  color: '#FFFFFF',
  fontStyle: 'bold',
  stroke: '#000000',
  strokeThickness: 1,  // subtle outline improves readability
}
```

---

## 3. Asset Inventory and Loading Plan

### Available Sprite Assets

The following PNG sprites are already present in `public/assets/`:

#### Gem Sprites (`public/assets/gems/`)

| File | Size | Usage | Sprite Key |
|------|------|-------|------------|
| `heart.png` | 21.7KB | Red gem (GemColor.RED) | `gem_heart` |
| `diamond_blue.png` | 23.5KB | Blue gem (GemColor.BLUE) | `gem_diamond_blue` |
| `square.png` | 21.7KB | Green gem (GemColor.GREEN) | `gem_square` |
| `triangle.png` | 21.1KB | Yellow gem (GemColor.YELLOW) | `gem_triangle` |
| `diamond_purple.png` | 25.6KB | Purple gem (GemColor.PURPLE) | `gem_diamond_purple` |
| `circle_green.png` | 24.8KB | White/Star gem (GemColor.WHITE) | `gem_circle_green` |
| `diamond_gold.png` | 21.4KB | Special: Line Clear indicator | `gem_diamond_gold` |
| `circle_rainbow.png` | 25.2KB | Special: Color Bomb indicator | `gem_circle_rainbow` |

#### UI Sprites (`public/assets/ui/`)

| File | Size | Usage | Sprite Key |
|------|------|-------|------------|
| `logo.png` | 67KB | Title screen logo | `ui_logo` |
| `coin.png` | 8.9KB | Coin icon in HUD, shop | `ui_coin` |
| `star.png` | 7.1KB | Star icon, progress markers | `ui_star` |
| `bomb.png` | 8.9KB | Bomb booster icon | `ui_bomb` |
| `hammer.png` | 9KB | Hammer booster icon | `ui_hammer` |
| `rainbow.png` | 5.4KB | Rainbow booster icon | `ui_rainbow` |
| `reload.png` | 9.9KB | Re-map/shuffle icon | `ui_reload` |
| `chest_closed.png` | 18.6KB | Shop: closed treasure chest | `ui_chest_closed` |
| `chest_open_full.png` | 17.5KB | Shop: open chest with loot | `ui_chest_open` |
| `gem_cluster.png` | 18.4KB | Gem pack icon for shop | `ui_gem_cluster` |

**Total asset size: ~376KB** (well within 10MB budget)

### Loading Strategy

All assets must be loaded in `PreloadScene.preload()`. Add the following to the existing preload queue:

```
// Gem sprites
this.load.image('gem_heart', 'assets/gems/heart.png');
this.load.image('gem_diamond_blue', 'assets/gems/diamond_blue.png');
this.load.image('gem_square', 'assets/gems/square.png');
this.load.image('gem_triangle', 'assets/gems/triangle.png');
this.load.image('gem_diamond_purple', 'assets/gems/diamond_purple.png');
this.load.image('gem_circle_green', 'assets/gems/circle_green.png');
this.load.image('gem_diamond_gold', 'assets/gems/diamond_gold.png');
this.load.image('gem_circle_rainbow', 'assets/gems/circle_rainbow.png');

// UI sprites
this.load.image('ui_logo', 'assets/ui/logo.png');
this.load.image('ui_coin', 'assets/ui/coin.png');
this.load.image('ui_star', 'assets/ui/star.png');
this.load.image('ui_bomb', 'assets/ui/bomb.png');
this.load.image('ui_hammer', 'assets/ui/hammer.png');
this.load.image('ui_rainbow', 'assets/ui/rainbow.png');
this.load.image('ui_reload', 'assets/ui/reload.png');
this.load.image('ui_chest_closed', 'assets/ui/chest_closed.png');
this.load.image('ui_chest_open', 'assets/ui/chest_open_full.png');
this.load.image('ui_gem_cluster', 'assets/ui/gem_cluster.png');
```

### Gem Sprite Mapping

Create a new constant in `Constants.ts`:

```
export const GEM_SPRITE_MAP: Record<string, string> = {
  red: 'gem_heart',
  blue: 'gem_diamond_blue',
  green: 'gem_square',
  yellow: 'gem_triangle',
  purple: 'gem_diamond_purple',
  white: 'gem_circle_green',
};
```

---

## 4. Updated Design Tokens

### Spacing Scale (4px base grid)

```
SPACING_2   = 2      // Minimal gap (gem gutter)
SPACING_4   = 4      // Extra-tight
SPACING_8   = 8      // Tight (icon-to-text inside pill)
SPACING_12  = 12     // Standard inner padding
SPACING_16  = 16     // Section inner margin
SPACING_20  = 20     // Edge margin (unchanged)
SPACING_24  = 24     // Between distinct UI groups
SPACING_32  = 32     // Major section separation
SPACING_40  = 40     // Large section gap
SPACING_48  = 48     // Extra-large separation
```

### Updated Constants to Add/Change

```
// Replace existing values in Constants.ts:

// Edge margins
export const MARGIN_EDGE = 20;          // unchanged
export const MARGIN_SECTION = 24;       // was 16, increase for breathing room
export const MARGIN_SECTION_LARGE = 40; // NEW: between major screen sections

// HUD (complete replacement)
export const HUD_TOP_MARGIN = 12;       // NEW: gap from screen top to HUD pills
export const HUD_PILL_WIDTH = 90;       // was 100 (with plus) / 80 (without) -- now fixed
export const HUD_PILL_HEIGHT = 32;      // was 36 (badge radius * 2) -- slightly smaller
export const HUD_PILL_RADIUS = 16;      // half of height for capsule shape
export const HUD_PILL_GAP = 12;         // NEW: gap between pills (was GAME_WIDTH/4 = 97.5!)
export const HUD_ICON_SIZE = 20;        // NEW: sprite icon display size inside pill
export const HUD_ICON_LEFT_PAD = 8;     // NEW: left edge to icon center
export const HUD_TEXT_LEFT_PAD = 32;    // NEW: left edge to value text start
export const HUD_PLUS_SIZE = 20;        // NEW: plus button tap target
export const HUD_PLUS_RIGHT_PAD = 4;   // NEW: gap from plus button to pill right edge
export const HUD_TOTAL_WIDTH = 294;     // 3 pills * 90 + 2 gaps * 12 = 294 (fits in 390)

// Buttons
export const BTN_PLAY_WIDTH = 240;      // was 260 -- slightly narrower
export const BTN_PLAY_HEIGHT = 52;      // was 56 -- slightly shorter
export const BTN_SHOP_ITEM_WIDTH = 72;  // NEW
export const BTN_SHOP_ITEM_HEIGHT = 32; // NEW

// Cards
export const CARD_WIDTH = 160;          // was 80 -- double width for readable content
export const CARD_HEIGHT = 180;         // was 110 -- taller for icon + text + button
export const CARD_ICON_SIZE = 48;       // NEW: icon display size in card

// Modal
export const MODAL_WIDTH = 320;         // was 340 -- slightly narrower for more border
export const MODAL_PADDING = 24;        // NEW: internal padding
export const MODAL_BUTTON_GAP = 16;     // NEW: gap between modal buttons
export const MODAL_CONTENT_GAP = 20;    // NEW: gap between content elements

// Free Gift Banner
export const GIFT_BANNER_WIDTH = 350;   // was 340
export const GIFT_BANNER_HEIGHT = 56;   // was 44
```

### Font Size Adjustments

Current font sizes are fine but need context-specific overrides:

```
// Keep existing:
FONT_SIZE_XS   = 12
FONT_SIZE_SMALL = 16
FONT_SIZE_MEDIUM = 24
FONT_SIZE_LARGE = 36
FONT_SIZE_XL   = 48
FONT_SIZE_XXL  = 56

// Add new:
export const FONT_SIZE_HUD_VALUE = 14;     // NEW: pill value text (was 16, tighten)
export const FONT_SIZE_HUD_PLUS = 16;      // NEW: plus button character
export const FONT_SIZE_LEVEL_BADGE = 20;   // NEW: "Level 5" on main menu
export const FONT_SIZE_SECTION_TITLE = 20; // NEW: shop section headers
export const FONT_SIZE_CARD_TITLE = 14;    // NEW: shop card title
export const FONT_SIZE_CARD_DESC = 11;     // NEW: shop card description
export const FONT_SIZE_CARD_PRICE = 12;    // NEW: shop card price
export const FONT_SIZE_COMBO = 28;         // NEW: combo text on board
```

---

## 5. HUD Pill Redesign

### Problem

The current `GlBadge` has these issues:
- `pillWidth = 100` (with plus) is too wide; 3 pills at this width with `GAME_WIDTH/4` spacing overlap
- Icon is drawn via Graphics API (tiny, ugly)
- Plus button is a text object with `backgroundColor` -- it overflows the pill edge
- `spacing = Math.round(GAME_WIDTH / 4)` = 97.5px centers, which puts pills at x=-97, 0, +97 relative to screen center -- this causes overlap with 100px-wide pills

### New Design

```
Pill Layout (each pill):
+--------------------------------------+
|  [icon]  123  [+]                    |
+--------------------------------------+
  8px  20px  8px  text  8px  20px  4px
       icon       area       plus

Total pill width: 90px
Total pill height: 32px
Border radius: 16px (full capsule)
```

#### Pill Specifications

| Property | Value |
|----------|-------|
| Width | 90px |
| Height | 32px |
| Border radius | 16px |
| Background color | Semi-transparent with badge color at 0.80 alpha |
| Background border | 1px solid rgba(255,255,255,0.2) |
| Icon | Sprite image (ui_coin, gem_heart, ui_gem_cluster), 20x20px, positioned at x = -pillWidth/2 + 18 |
| Value text | 14px bold white, origin (0.5, 0.5), positioned at x = -4 (slightly left of center) |
| Plus button | 20x20px circle, rgba(255,255,255,0.3) background, "+" character 16px bold, positioned at x = pillWidth/2 - 14 |

#### HUD Container Specifications

| Property | Value |
|----------|-------|
| Container Y position | `HUD_TOP_MARGIN + HUD_PILL_HEIGHT / 2` = 12 + 16 = **28px** from top |
| Container X position | `GAME_WIDTH / 2` = 195 (centered) |
| Pill positions | Hearts: x = -102, Coins: x = 0, Gems: x = +102 |
| Pill gap calculation | 3 pills * 90px = 270px, 2 gaps * 12px = 24px, total = 294px, left margin = (390-294)/2 = 48px each side |

#### Badge Colors (unchanged but with border)

| Badge | Background Color | Alpha | Icon Sprite |
|-------|-----------------|-------|-------------|
| Hearts | `0xFF4466` | 0.80 | `gem_heart` (scaled to 20x20) |
| Coins | `0xFFD700` | 0.80 | `ui_coin` (scaled to 20x20) |
| Gems | `0xBB55FF` | 0.80 | `ui_gem_cluster` (scaled to 20x20) |

#### Plus Button Behavior

- Default: 20x20 circle with rgba(255,255,255,0.3) fill
- Pressed: Scale to 0.9, rgba(255,255,255,0.5) fill
- Action: Navigate to ShopScene
- Touch target: The full 20x20 area (meets 44px minimum when pill itself is interactive)
- NOTE: Make the entire pill tappable (not just the plus button). Tapping anywhere on the pill navigates to the shop. The plus icon is visual affordance only.

---

## 6. MainMenuScene Redesign

### Complete Layout Map (390x600)

```
Y Position    Element                          Height
-----------   ------                           ------
0-12          Top margin (empty)               12px
12-44         HUD Pills (hearts/coins/gems)    32px
44-56         Spacer                           12px
56-56         (Regen timer text, if needed)    (overlaid)
56-76         Spacer                           20px

76-76         Logo sprite (ui_logo)            --
              Logo display: centered at y=140
              Logo height: ~110px (scaled)
              Logo covers y=85 to y=195

195-207       Spacer                           12px

207-231       "Match-3 Puzzle" subtitle        24px
              y=219, font 16px

231-243       Spacer                           12px

243-283       Level Badge area                 40px
              "Level 5" in pill at y=263
              Font: 20px bold
              Star count next to it

283-295       Spacer                           12px

295-430       Gem Board Preview                135px
              6 cols x 5 rows
              Cell size: 22px
              Grid: 132 x 110
              Centered with border

430-454       Spacer                           24px

454-506       Play Button                      52px
              y center = 480
              Width: 240px
              "Play" with play icon sprite

506-530       Spacer                           24px

530-586       Free Gift Banner                 56px
              y center = 558
              Width: 350px
              Redesigned (see below)

586-600       Version label + bottom margin    14px
```

### Key Changes from Current

#### A. Replace "Gem Link" text with Logo Sprite

Remove the `buildTitle()` method that renders "Gem Link" as text with sparkles. Replace with:

```
// Add logo sprite
const logo = this.add.image(GAME_WIDTH / 2, 140, 'ui_logo');
logo.setDisplaySize(180, 90);  // Maintain aspect ratio; adjust to fit
```

The logo already contains the "Gem Link" text with gem decorations. No sparkle generation needed -- the logo image is the branding.

If the logo aspect ratio is different, measure the actual image dimensions on load and scale proportionally:

```
const logo = this.add.image(GAME_WIDTH / 2, 140, 'ui_logo');
const scale = Math.min(200 / logo.width, 100 / logo.height);
logo.setScale(scale);
```

#### B. Subtitle Spacing

Move "Match-3 Puzzle" from y=148 to y=219 (below the logo with 12px gap).

```
this.add.text(GAME_WIDTH / 2, 219, 'Match-3 Puzzle', {
  fontFamily: FONT_FAMILY,
  fontSize: '16px',
  color: '#AAAAAA',
}).setOrigin(0.5);
```

#### C. Level Badge Enlargement

Change the level badge:

```
Current: 100px wide pill at y=205, font 16px
New:     Full-width centered text at y=263, font 20px bold
```

New layout:

```
// Level badge - larger, more prominent
const badgeW = 140;
const badgeH = 32;
const badgeY = 255;
const centerX = GAME_WIDTH / 2;

// Background pill
const badgeGfx = this.add.graphics();
badgeGfx.fillStyle(0x6C3BD1, 0.85);
badgeGfx.fillRoundedRect(centerX - badgeW/2, badgeY, badgeW, badgeH, 16);
badgeGfx.lineStyle(1, 0xFFFFFF, 0.15);
badgeGfx.strokeRoundedRect(centerX - badgeW/2, badgeY, badgeW, badgeH, 16);

// Level text
this.add.text(centerX - 20, badgeY + 16, `Level ${level}`, {
  fontFamily: FONT_FAMILY,
  fontSize: '20px',
  color: '#FFFFFF',
  fontStyle: 'bold',
}).setOrigin(0.5);

// Star icon + count
const starIcon = this.add.image(centerX + 40, badgeY + 16, 'ui_star');
starIcon.setDisplaySize(16, 16);
this.add.text(centerX + 54, badgeY + 16, `${totalStars}`, {
  fontFamily: FONT_FAMILY,
  fontSize: '16px',
  color: '#FFD700',
  fontStyle: 'bold',
}).setOrigin(0, 0.5);
```

#### D. Remove Booster Tray and Icon Buttons

**Delete the entire `buildBoosterTray()` method and `drawBoosterIcon()` method.** These non-functional icons confuse users. Boosters are available in the shop and in-gameplay only.

This removes elements from y=410-445 and eliminates the need for the settings/hammer/bomb/rainbow icons on the main menu.

#### E. Play Button Repositioned

With the booster tray removed, the Play button moves up:

```
Current Y: 482
New Y:     480 (effectively same area, but with more breathing room above)
```

The play button now has proper spacing:
- Board preview ends at ~y=430
- 50px gap before Play button center at y=480
- Play button extends from y=454 to y=506

Play button specs:
- Width: 240px
- Height: 52px
- Gradient: GRADIENT_BUTTON_SUCCESS (green)
- Text: "Play" (no unicode arrow)
- Font: 24px bold
- Add play arrow via a small triangle drawn in Graphics next to the text, or use the word "Play" alone

#### F. Free Gift Banner Redesign

The current banner uses `fillGradientStyle` which produces the broken UV-map appearance. Replace entirely:

```
Banner specs:
- Y center: 558
- Width: 350px
- Height: 56px
- Background: Graphics rounded rect
  - Fill: 0x2A1A4E at alpha 0.95
  - Border: 1px solid 0xFFD700 at alpha 0.5
  - Border radius: 12px
- Layout (left to right):
  - x=-155: chest_closed sprite, 36x36px
  - x=-80 to x=+40: "Free Gift!" text, 16px bold, white
  - x=+100 to x=+155: Timer or "CLAIM" text, 12px, #FFD700

If canClaim is true:
  - Add gentle pulse animation on the whole banner (scale 1.0 to 1.02, 800ms yoyo)
  - Timer text shows "CLAIM" in 14px bold #FFD700

If canClaim is false:
  - No pulse animation
  - Timer text shows countdown "12:34" in 12px #AAAAAA
```

The banner is tappable -- navigates to ShopScene.

---

## 7. ShopScene Redesign

### Complete Layout Map (390x600, scrollable if needed)

```
Y Position    Element                          Height
-----------   ------                           ------
0-12          Top margin                       12px
12-44         HUD Pills                        32px
44-56         Spacer                           12px
56-96         "SHOP" Ribbon                    40px
96-108        Spacer                           12px

108-128       "Currency Packs" section title   20px
128-140       Spacer                           12px
140-328       Currency Pack Cards (2x2 grid)   188px
              2 rows of 2 cards
              Card: 160x180
              Gap between cards: 12px horiz, 12px vert
              Row 1: y center = 140 + 90 = 230
              Row 2: y center = 230 + 180 + 12 = would overflow

REVISED: Use horizontal scroll or single row of 4 smaller cards.
```

### REVISED SHOP LAYOUT

Given the 600px viewport height, a scrollable shop is not ideal for Phaser. Instead, use a **compact card layout** with smaller cards arranged efficiently.

```
Y Position    Element                          Height
-----------   ------                           ------
0-12          Top margin                       12px
12-44         HUD Pills                        32px
44-56         Spacer                           12px
56-96         "SHOP" Ribbon                    40px
96-112        Spacer                           16px

112-132       "Currency Packs" label           20px
132-140       Spacer                           8px
140-264       4 Currency Pack Cards in a row   124px
              Card: 80x124 (revised)
              Spacing: 6px between
              Total: 4*80 + 3*6 = 338px, centered

264-280       Spacer                           16px
280-300       "Boosters" label                 20px
300-308       Spacer                           8px
308-384       5 Booster tiles in a row         76px
              Tile: 56x76
              Spacing: 9px between
              Total: 5*56 + 4*9 = 316px, centered

384-400       Spacer                           16px
400-456       Free Gift Section                56px
456-472       Spacer                           16px
472-524       Back Button                      52px
524-600       Bottom padding                   76px
```

### Currency Pack Card Redesign

Each card: 80px wide, 124px tall

```
+--78px--(2px border)--+
|    [chest icon]       |  y: top + 8, icon 36x36
|    36x36              |
|                       |
|    "Beginner"         |  y: top + 52, 13px bold white
|    "250 coins"        |  y: top + 68, 11px #AAAAAA
|                       |
|  [====BUY 2T====]    |  y: top + 100, button 68x24
+----------------------+

Card background: 0x2A1A4E, alpha 1.0
Card border: 1.5px 0x6C3BD1, alpha 0.7
Card border radius: 10px
```

Card icon assignments:
- Beginner Pack: `ui_coin` (single coin)
- Jumbo Pack: `ui_coin` (or ui_gem_cluster)
- Super Pack: `ui_chest_closed`
- Mega Pack: `ui_chest_open`

Buy button:
- Width: 68px
- Height: 24px
- Gradient: GRADIENT_BUTTON_GOLD
- Text: "{price}T" in 12px bold
- Border radius: 8px

### Booster Tile Redesign

Each tile: 56px wide, 76px tall

```
+------54px------+
|                 |
|   [icon]        |  y: top + 6, icon 28x28
|   28x28         |
|                 |
|   "Hammer"      |  y: top + 42, 11px white
|                 |
|  [=1T=]         |  y: top + 58, button 48x20
+-----------------+

Tile background: 0x2A1A4E, alpha 0.8
Tile border: 1px 0x6C3BD1, alpha 0.5
Tile border radius: 8px
```

Booster icon assignments:
- Hammer: `ui_hammer`
- Bomb: `ui_bomb`
- Rainbow: `ui_rainbow`
- +3 Moves: `ui_reload` (or text "+3")
- Re-map: `ui_reload`

Buy button:
- Width: 48px
- Height: 20px
- Gradient: GRADIENT_BUTTON_GOLD
- Text: "{price}T" in 11px bold
- Border radius: 6px

### Lives Refill and Starter Pack

These were previously in a separate sub-row. Integrate them differently:

- **Lives Refill**: Add as a 6th item in the booster row (make the row wrap or add below)
- **Starter Pack**: Make it a special banner between boosters and free gift

**Starter Pack Banner** (y=384 area, replaces spacer):

```
+-------350px-------+
|  Starter Pack!     |  16px bold #FFD700
|  5x Moves + 3x    |  12px #FFFFFF
|  Lives + Skin      |
|      [3T]          |  Buy button
+-------------------+

Background: Gradient from 0x6C3BD1 to 0x4A1FA0
Border: 1px 0xFFD700 alpha 0.5
Height: 64px
Border radius: 10px
```

### Free Gift Section Redesign

```
+-------350px-------+
| [chest]  FREE GIFT!   [CLAIM] |
|  36x36   16px bold     14px   |
+-------------------------------+

Background: 0x2A1A4E alpha 0.95
Border: 1.5px 0xFFD700 alpha 0.6
Height: 56px
Border radius: 12px
```

When gift is claimable:
- "CLAIM" button styled as gold pill (48x28, GRADIENT_BUTTON_GOLD)
- Gentle pulse on entire container (scaleX/Y 1.0 to 1.02, 800ms, yoyo, repeat -1)

When on cooldown:
- Timer text "12:34" in 12px #AAAAAA replaces CLAIM button
- No pulse

### Section Title Style

```
"Currency Packs" / "Boosters" labels:
  fontFamily: FONT_FAMILY
  fontSize: '20px'
  color: '#FFB800'
  fontStyle: 'bold'
  x: MARGIN_EDGE (20px from left)
  origin: (0, 0.5)
```

### Back Button

```
Y center: 498
Width: 140px (narrower than before)
Height: 44px
Gradient: GRADIENT_BUTTON_PRIMARY
Text: "Back" 18px
Border radius: 12px
```

---

## 8. GameplayScene Redesign

### Current Issues

The GameplayScene packs the level title, HUD badges, progress bar, 8x8 board, and booster tray into 600px. The current layout:

```
y=0-36:   Level header + quit button
y=42:     Level name (subtitle)
y=56-74:  Score badge + Moves badge
y=78-96:  Progress bar
y=104+:   Board (8 rows * 46px = 368px, ends at y=472)
y=484+:   Booster tray
```

Problems:
- Level name at y=42 is unnecessary ("First Steps")
- Score/Moves badges at y=56 overlap with progress bar at y=78
- Coins badge is too wide (same GlBadge issue)
- Everything is too cramped

### New Layout

```
Y Position    Element                          Height
-----------   ------                           ------
0-8           Top margin                       8px
8-32          Level header row                 24px
              Quit button (left), "Level 1" (center)
              NO subtitle/level name

32-40         Spacer                           8px
40-58         Score and Moves row              18px
              Score pill (left), Moves pill (right)
              Compact pills, not full GlBadge

58-66         Spacer                           8px
66-82         Progress bar                     16px
              Full board width

82-90         Spacer                           8px
90-458        Board (8x8 grid)                 368px
              Cell size: 46px (44 + 2 spacing)

458-466       Spacer                           8px
466-504       Booster tray (simplified)        38px

504-600       Bottom padding                   96px
```

### Level Header (y=8-32)

```
Quit button:
  Position: x=24, y=20
  Size: 28x28
  Graphics: "X" or back arrow
  Touch target: 44x44 (zone overlay)

Level text:
  Position: x=GAME_WIDTH/2, y=20
  Text: "Level {n}"
  Font: 20px bold
  Color: #FFD700
  Origin: (0.5, 0.5)
```

**Remove the level name/subtitle entirely.** "First Steps" etc. adds no value during gameplay and wastes 20px of vertical space.

### Score and Moves Row (y=40-58)

Replace the current `GlBadge`-based HUD with custom compact pills:

```
Score pill (left side):
  Position: x = MARGIN_EDGE, y = 49 (center)
  Width: 100px
  Height: 18px (fitted, not 36px)
  Layout: [star icon 14x14] [score text]
  Background: 0x2A1A4E alpha 0.8, rounded 9px
  Icon: ui_star sprite at x = pillLeft + 12
  Text: score value, 14px bold white, x = pillLeft + 28

Moves pill (right side):
  Position: x = GAME_WIDTH - MARGIN_EDGE - 50, y = 49 (center)
  Width: 80px
  Height: 18px
  Layout: "Moves: {n}"
  Background: 0x2A1A4E alpha 0.8, rounded 9px
  Text: 14px bold, color depends on moves remaining:
    > 5 moves: #FFFFFF
    3-5 moves: #FFA502 (warning)
    1-2 moves: #FF4466 (danger)

Coins pill (center, optional -- only if coins shown during gameplay):
  Position: x = GAME_WIDTH/2, y = 49
  Width: 70px
  Height: 18px
  Layout: [coin icon 14x14] [count]
  If coins are NOT shown during gameplay, omit this entirely.
```

### Progress Bar (y=66-82)

```
Bar specs:
  x: centered, width = board width (368px)
  y: 66
  Height: 16px
  Background: 0x333344 (track), rounded 8px
  Fill: GRADIENT from 0x44DD44 to 0x22AA22 (green), rounded 8px

Star markers at 33%, 66%, 100% of bar:
  Icon: ui_star sprite, 12x12px
  Position: atop the bar at the threshold x position
  Color: Gold (0xFFD700) when earned, Gray (0x555555) when not
  When earned: brief scale-up animation (scale 0 to 1.2 to 1.0, 350ms)
```

### Board Area (y=90-458)

No changes to the board itself, but shift the `boardY` from 104 to 90 to reclaim the 14px saved by removing the subtitle and tightening the HUD.

```
this.boardY = 90;  // was 104
```

### Booster Tray (y=466-504)

The booster tray in gameplay should show available boosters with counts:

```
Layout: 3 booster slots centered horizontally
  Slot width: 48px
  Slot height: 38px
  Gap between slots: 16px
  Total: 3*48 + 2*16 = 176px, centered

Each slot:
  +------46px------+
  |   [icon 24x24] |
  |   "x2"         |  count badge, 11px
  +----------------+

  Background: 0x2A1A4E alpha 0.7, rounded 8px
  Border: 1px rgba(255,255,255,0.15)

  When tapped:
    If count > 0: activate booster (implementation is Game Engineer's scope)
    If count = 0: brief shake animation + flash red border (0.3s)

Boosters shown:
  Slot 1: Hammer (ui_hammer)
  Slot 2: Bomb (ui_bomb)
  Slot 3: Rainbow (ui_rainbow)

Count badge:
  Position: bottom-right corner of slot, offset by (-4, -4)
  Background: 0xFF4466, circular, radius 8
  Text: count number, 10px bold white
  If count = 0: show "0" with gray background (0x555555)
```

---

## 9. LevelCompleteScene Adjustments

### Current Issues

The scene is mostly fine but needs consistent spacing:

```
Current:
  Stars at y=105
  Ribbon at y=170
  Score at y=220
  Stats at y=270
  Next button at y=340
  Retry at y=400
  Menu at y=455
  Offer at y=490

Revised:
  Stars at y=100
  Ribbon at y=165
  Score at y=220 (unchanged)
  Stats at y=270 (unchanged)
  Next button at y=340 (unchanged)
  Retry at y=395 (was 400)
  Menu at y=445 (was 455)
  Offer at y=500 (was 490)
```

### Star Display with Sprites

Replace the `GlStarDisplay` Graphics-drawn stars with the `ui_star` sprite:

```
For each of the 3 star positions:
  If earned: display ui_star sprite, 32x32, full color (no tint)
  If not earned: display ui_star sprite, 32x32, tinted 0x555555, alpha 0.4

Animation for earned stars (sequential, 200ms delay between each):
  Scale from 0 to 1.3 (300ms, Bounce.easeOut)
  Then scale to 1.0 (150ms, Quad.easeOut)
  Emit gold sparkle burst at star position
```

---

## 10. Modal and Popup Redesign

### Current Issues

The `GlModal` has:
- Fixed height (320px) that doesn't account for content
- `addContent` stacks elements with only 12px gap
- Buttons added via addContent overlap because they don't respect their own height
- No internal padding structure

### New Modal Layout

```
Modal anatomy:
+-------320px-------+
|     24px padding   |
|                    |
|  TITLE             |  36px bold #FFD700, center
|                    |
|     16px gap       |
|  ________________  |  1px separator line, rgba(255,255,255,0.1)
|     16px gap       |
|                    |
|  [Content area]    |  Dynamic height
|                    |
|     20px gap       |
|                    |
|  [Primary Button]  |  Width: 200px, height: 44px
|     12px gap       |
|  [Secondary Btn]   |  Width: 160px, height: 36px
|                    |
|     24px padding   |
+-------------------+

Close button:
  Position: top-right corner, x = modalWidth/2 - 16, y = -modalHeight/2 + 16
  Size: 32x32 touch target
  Visual: "X" character, 20px, white, alpha 0.7
  On hover: alpha 1.0
```

### Confirm Purchase Modal Specific Layout

```
+-------320px-------+
|                    |
|  Confirm Purchase  |  Title
|  ________________  |
|                    |
|  [product icon]    |  48x48 sprite centered
|  "Hammer"          |  16px bold white
|  "Destroy any gem" |  13px #AAAAAA
|  "1 Token"         |  20px bold #FFD700
|                    |
|  [====Buy Now===]  |  200x44, gold gradient
|  [   Cancel    ]   |  160x36, purple gradient
|                    |
+-------------------+

Product icon mapping:
  Hammer -> ui_hammer
  Bomb -> ui_bomb
  Rainbow -> ui_rainbow
  +3 Moves -> ui_reload
  Re-map -> ui_reload
  Lives Refill -> gem_heart
  Beginner Pack -> ui_coin
  Jumbo Pack -> ui_gem_cluster
  Super Pack -> ui_chest_closed
  Mega Pack -> ui_chest_open
  Starter Pack -> ui_chest_open
```

### Auto-sizing Modal Height

Instead of a fixed 320px height, compute the modal height based on content:

```
const titleHeight = 36;
const separatorGap = 32;  // 16 + 16
const contentHeight = measured from content objects
const buttonAreaHeight = 44 + 12 + 36;  // primary + gap + secondary
const padding = 48;  // top 24 + bottom 24

totalHeight = titleHeight + separatorGap + contentHeight + 20 + buttonAreaHeight + padding;
modalHeight = Math.max(totalHeight, 240);  // minimum 240px
modalHeight = Math.min(modalHeight, 500);  // maximum 500px
```

---

## 11. Combo and Celebration Text Redesign

### Current Issue

The `CelebrationSystem.celebrateCombo()` method renders text like "Great!" and "Epic Combo!" with stroke that looks like MS Word WordArt. The black stroke at thickness 2 with bright colors creates an outdated look.

### New Combo Text Style

Replace stroke-based text with a **badge-style floating label**:

```
Combo text badge:
  Background: Rounded rect behind text
  Text: bold, no stroke
  Animation: pop in, float up, fade out

Depth 1 ("Linked!"):
  Background: rgba(255,255,255,0.15), 8px border radius
  Text: 18px bold #FFFFFF
  Padding: 6px horizontal, 3px vertical
  Animation: scale 0->1.0 (150ms Back.easeOut), float up 40px + fade (600ms)

Depth 2 ("Great!"):
  Background: rgba(255,215,0,0.25), 8px border radius
  Text: 24px bold #FFD700
  Padding: 8px horizontal, 4px vertical
  Animation: scale 0->1.1->1.0 (200ms Back.easeOut), float up 50px + fade (700ms)

Depth 3+ ("Epic Combo!"):
  Background: rgba(255,68,68,0.3), 10px border radius
  Text: 28px bold #FF4466
  Padding: 10px horizontal, 5px vertical
  Animation: scale 0->1.2->1.0 (250ms Back.easeOut), float up 60px + fade (800ms)
  Camera shake: 40ms, intensity 0.004
  NO rainbow tint cycling (remove the setTint timer)
```

### Points Display

The "+150" points text below the combo label:

```
Current: 16px white with black stroke
New:     14px bold #FFFFFF, no stroke, alpha 0.85
         Float up 30px and fade, 500ms delay 100ms
```

### Purchase Celebration

The `celebratePurchase` text currently uses 36px with stroke. Replace:

```
Background: 0x2A1A4E at alpha 0.9, rounded 12px
Text: 24px bold #FFD700, padding 16px horizontal, 8px vertical
Animation:
  1. Flash: white overlay alpha 0 to 0.2 to 0 (200ms)
  2. Badge: scale 0 to 1.1 (250ms Back.easeOut), then to 1.0 (100ms)
  3. Float up 60px + fade out over 1000ms (after 600ms hold)
  4. Gold particle burst: 8 particles from center
```

---

## 12. Animation Specifications

### Button Press

```
All GlButton instances:
  Press: scale to 0.95 over 80ms, Quad.easeOut
  Release: scale to 1.0 over 80ms, Quad.easeOut, trigger callback on complete

  No changes needed -- current implementation is correct.
```

### Play Button Pulse

```
Current: scale 1.0 to 1.04, 900ms, Sine.easeInOut, yoyo, repeat -1
New: scale 1.0 to 1.03, 1200ms, Sine.easeInOut, yoyo, repeat -1
  (slower, subtler -- less aggressive)
```

### Scene Transitions

```
Fade transition: 250ms, Quad.easeOut (unchanged, current is good)
```

### Gem Board Preview Float

```
Current: y offset 0 to 4, 2400ms, Sine.easeInOut, yoyo, repeat -1
New: y offset 0 to 3, 3000ms, Sine.easeInOut, yoyo, repeat -1
  (slower, more gentle)
```

### HUD Value Update

When a HUD pill value changes (coins, gems, lives):

```
1. Scale the value text to 1.15 (100ms, Back.easeOut)
2. Scale back to 1.0 (100ms, Quad.easeOut)
3. Brief gold flash on the pill background (alpha 0.8 to 1.0 to 0.8, 200ms)
```

### Star Earned in Progress Bar

```
When score crosses a star threshold:
1. Star marker scales from 1.0 to 1.5 (200ms, Back.easeOut)
2. Star marker scales to 1.0 (150ms, Quad.easeOut)
3. Gold particle burst (6 particles) from star position
4. Camera shake: 25ms, intensity 0.002
```

### Shop Card Entry Animation

When shop scene loads, cards should stagger in:

```
Each card starts at alpha 0, y offset +20px
Animate to alpha 1, y offset 0
Duration: 200ms per card
Stagger delay: 60ms between cards
Ease: Quad.easeOut
```

### Free Gift Claim Animation

```
1. Banner scales to 1.05 (150ms)
2. Gold burst from center (12 particles)
3. Floating text "+Free Gift!" rises from banner center
4. Banner scales to 0 and fades (300ms)
5. Banner reappears with cooldown timer (fade in 200ms)
```

---

## 13. Color Palette (Updated)

### Background and Surface Colors

| Token | Hex | Usage |
|-------|-----|-------|
| Background Deep | `#1A0A2E` | Primary scene background (unchanged) |
| Surface Dark | `#2A1A4E` | Card backgrounds, pill backgrounds |
| Surface Medium | `#3A2A5E` | Hover states, active card backgrounds |
| Board Background | `#0A0A3E` | Game board area |

### Accent Colors

| Token | Hex | Usage |
|-------|-----|-------|
| Gold Primary | `#FFD700` | Stars, prices, premium elements |
| Gold Dark | `#FFB800` | Gold hover/pressed states, warm gold |
| Emerald | `#00CC66` | Success, play button (keep current green) |
| Purple Primary | `#6C3BD1` | Buttons, borders, brand purple |
| Purple Dark | `#4A1FA0` | Button pressed, gradient bottom |

### Text Colors

| Token | Hex | Usage |
|-------|-----|-------|
| Text Primary | `#FFFFFF` | Primary text, headings, values |
| Text Secondary | `#AAAAAA` | Descriptions, subtitles |
| Text Muted | `#777777` | Hints, timestamps, inactive |
| Text Danger | `#FF4466` | Low lives, errors |
| Text Warning | `#FFA502` | Low moves |
| Text Gold | `#FFD700` | Prices, star counts |

### Gem Colors (for Graphics fallback -- sprites preferred)

These remain for any Graphics-drawn contexts (e.g., minimap, particles):

| Gem | Color | Shape |
|-----|-------|-------|
| Red | `#FF4466` | Heart |
| Blue | `#4499FF` | Diamond |
| Green | `#33DD66` | Square |
| Yellow | `#FFCC33` | Triangle |
| Purple | `#BB55FF` | Circle |
| White | `#EEEEFF` | Star |

### Gradient Presets

| Gradient | Top | Bottom | Usage |
|----------|-----|--------|-------|
| Button Primary | `#6C3BD1` | `#4A1FA0` | Default buttons, secondary actions |
| Button Success | `#44DD44` | `#22AA22` | Play button, confirm actions |
| Button Gold | `#FFD700` | `#FFB800` | Buy buttons, premium |
| Button Danger | `#FF4444` | `#CC2222` | Destructive actions |
| Board BG | `#0A0A3E` | `#150B40` | Board area background |

---

## 14. Gem Sprite Integration

### Replacing Graphics-Drawn Gems with Sprites

The `Gem` class (`src/game/objects/Gem.ts`) currently draws gems using the Graphics API. This must be replaced with sprite rendering.

### New Gem Rendering

Replace the `renderVisual()` method to use `Phaser.GameObjects.Image` instead of `Phaser.GameObjects.Graphics`:

```
Gem sprite display:
  Size: GEM_SIZE (44px) -- use setDisplaySize(44, 44)
  The sprite images are glossy and pre-rendered, so NO additional
  shadow, shine, or shape drawing is needed.

  Simply:
  1. Look up the sprite key from GEM_SPRITE_MAP[this.gemColor]
  2. Create an Image game object with that key
  3. Add it to the Gem container
  4. Scale to fit GEM_SIZE
```

### Special Gem Indicators with Sprites

For special gems, overlay an indicator on top of the base gem sprite:

```
LINE_CLEAR:
  Base gem sprite (normal)
  + White arrows overlay: two small arrow Graphics drawn left/right
  OR: gentle horizontal white stripe across the gem (2px, alpha 0.6)

BOMB:
  Base gem sprite (normal)
  + Concentric circle overlay: 1.5px white, alpha 0.4, radius 18px
  + Outer ring: 1px white, alpha 0.2, radius 22px

COLOR_BOMB:
  Use the circle_rainbow.png sprite instead of the normal gem sprite
  + Rainbow shimmer: cycle the tint color through hues
  Note: Phaser Image objects DO support setTint(), unlike Graphics.
  So the rainbow effect is simpler:
    tween target.hue from 0 to 360 over 1500ms repeat -1
    on each update: image.setTint(Phaser.Display.Color.HSLToColor(hue/360, 0.8, 0.7).color)
```

### Selected State

```
When gem is selected (SELECTED state):
  1. Scale gem to 1.1
  2. Add a white glow circle behind the gem:
     - Graphics circle at (0,0), radius = GEM_SIZE * 0.55
     - Color: 0xFFFFFF, alpha pulsing from 0.2 to 0.5 (600ms, yoyo, repeat -1)
```

### Matched/Clearing State

```
When gem is matched or clearing:
  1. Set sprite alpha to 0.4
  2. The clearing animation is handled by GameplayScene (scale to 0 + fade)
```

### Gem Board Preview (MainMenuScene)

The mini gem board on the main menu should also use sprites, not Graphics shapes:

```
For each cell in the 6x5 preview grid:
  Pick a random gem color
  Look up sprite key from GEM_SPRITE_MAP
  Create a small image: setDisplaySize(18, 18) // smaller than gameplay gems
  Position at grid cell center
```

This replaces the entire `drawMiniShape()` method and the `fillStar()` helper.

---

## Appendix A: File Change Summary

| File | Changes Required |
|------|-----------------|
| `src/main.ts` | Add `resolution: dpr`, set `roundPixels: true` |
| `src/utils/Constants.ts` | Add all new constants from Section 4 |
| `src/game/scenes/PreloadScene.ts` | Add asset loading for all sprites |
| `src/ui/UIComponents.ts` | Rewrite GlBadge, GlHUD, GlCard, GlModal |
| `src/game/scenes/MainMenuScene.ts` | Replace title with logo, remove booster tray, fix layout |
| `src/game/scenes/ShopScene.ts` | Complete layout redesign with sprites |
| `src/game/scenes/GameplayScene.ts` | Fix HUD spacing, remove subtitle, sprite-based boosters |
| `src/game/scenes/LevelCompleteScene.ts` | Star sprites, spacing adjustments |
| `src/game/objects/Gem.ts` | Replace Graphics rendering with Image sprites |
| `src/ui/CelebrationSystem.ts` | Replace WordArt text with badge-style labels |

## Appendix B: Asset Requirements Checklist

- [ ] All gem PNGs have transparent backgrounds (no white background)
- [ ] All UI PNGs have transparent backgrounds
- [ ] Logo PNG has transparent background
- [ ] All sprites are reasonably sized (under 100KB each)
- [ ] Verify gem sprites are square (width = height) for uniform scaling
- [ ] Verify gem sprites have distinct silhouettes at 44x44 display size
- [ ] Test color-blind accessibility: each gem has a unique shape regardless of color

## Appendix C: Implementation Priority

**Phase 1 -- Critical (do first):**
1. Text rendering fix (Section 2) -- affects everything
2. Asset loading in PreloadScene (Section 3)
3. HUD pill redesign (Section 5) -- affects all scenes
4. Gem sprite rendering (Section 14) -- core visual improvement

**Phase 2 -- Layout Fixes:**
5. MainMenuScene redesign (Section 6)
6. GameplayScene HUD fix (Section 8)
7. ShopScene redesign (Section 7)

**Phase 3 -- Polish:**
8. Modal redesign (Section 10)
9. Combo text redesign (Section 11)
10. Animation specs (Section 12)
11. LevelCompleteScene adjustments (Section 9)

---

*End of Design Specification V2*
