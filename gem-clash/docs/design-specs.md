# Gem Link -- Design Specifications

**Owner:** Lead Designer
**Version:** 1.0
**Date:** 2026-02-28
**Viewport:** 390 x 600 (portrait, no scrolling on main screens)
**Renderer:** Phaser 3 Graphics API only (no image assets, no external fonts)
**Font:** Arial / Helvetica only (`FONT_FAMILY`)

---

## Table of Contents

1. [SPEC-01: HUD Badge System (P0)](#spec-01-hud-badge-system-p0)
2. [SPEC-02: MainMenuScene Layout (P0)](#spec-02-mainmenuscene-layout-p0)
3. [SPEC-03: GameplayScene HUD Layout (P0)](#spec-03-gameplayscene-hud-layout-p0)
4. [SPEC-04: ShopScene Layout (P1)](#spec-04-shopscene-layout-p1)
5. [SPEC-05: Floating Text & Toast Style (P1)](#spec-05-floating-text--toast-style-p1)
6. [Appendix A: Constants Reference](#appendix-a-constants-reference)
7. [Appendix B: New Constants Required](#appendix-b-new-constants-required)

---

## SPEC-01: HUD Badge System (P0)

### Problem Statement

The current `GlBadge` pills are too wide (80-100px), overlap each other within the
390px viewport, have blurry text, and the plus-button interactive areas are
unreliable. The `GlHUD` bar positions badges using `GAME_WIDTH / 4` spacing, which
causes uneven distribution and edge crowding.

### Design Goals

- Three compact pill badges (Hearts, Coins, Gems) that fit comfortably in 390px
- Each badge has a graphics-drawn icon, a value label, and an optional "+" button
- Clear visual hierarchy: icon is the identifier, value is the data, "+" is the action
- Minimum `MIN_TOUCH_TARGET` (48px) hit area on the plus button
- Crisp text rendering at all sizes

---

### 1.1 GlBadge Component Anatomy

```
+--[ PILL ]-------------------------------+
|  [ICON]  [VALUE]  [+]                   |
+------------------------------------------+

Layout (origin center):
  Total pill width:  96px  (with plus button)
                     68px  (without plus button)
  Total pill height: 32px
  Border radius:     16px  (full pill / half height)
```

#### Dimensions

| Property             | With Plus | Without Plus | Constant Reference       |
|----------------------|-----------|--------------|--------------------------|
| Pill width           | 96px      | 68px         | `BADGE_PILL_WIDTH_PLUS` (new) / `BADGE_PILL_WIDTH` (new) |
| Pill height          | 32px      | 32px         | `BADGE_PILL_HEIGHT` (new) |
| Border radius        | 16px      | 16px         | Half of pill height      |
| Icon area center-X   | -pillW/2 + 16 | -pillW/2 + 16 | Computed           |
| Value text center-X  | +2 (with plus) / +6 (no plus) | -- | Computed    |
| Plus button center-X | +pillW/2 - 14 | N/A        | Computed                 |

#### Icon Specifications (Graphics-drawn, 14x14 bounding box)

**Heart Icon** (badge color: `BADGE_COLOR_HEART` = 0xFF4466)
```
Center at icon area. White fill (0xFFFFFF, alpha 1.0).
- Two overlapping circles: radius 4px, centers at (-3, -2) and (+3, -2)
- One triangle: points (-7, 0), (7, 0), (0, 7)
Total bounding box: ~14x10px
```

**Coin Icon** (badge color: `BADGE_COLOR_COIN` = 0xFFD700)
```
Center at icon area. White fill (0xFFFFFF, alpha 1.0).
- Outer circle: radius 6px, fill white
- Inner circle: radius 3px, fill BADGE_COLOR_COIN (0xFFD700)
Total bounding box: 12x12px
```

**Gem Icon** (badge color: `BADGE_COLOR_GEM` = 0xBB55FF)
```
Center at icon area. White fill (0xFFFFFF, alpha 1.0).
- Diamond path: 4 points at (0,-7), (6,0), (0,7), (-6,0)
Total bounding box: 12x14px
```

#### Value Text

| Property     | Value                         |
|--------------|-------------------------------|
| Font size    | `FONT_SIZE_SMALL` (16px)      |
| Font weight  | Bold                          |
| Color        | `#FFFFFF`                     |
| Origin       | (0.5, 0.5) centered          |
| Max width    | 36px (truncate with ellipsis if value exceeds 5 chars) |

#### Plus Button

| Property       | Value                                |
|----------------|--------------------------------------|
| Display        | Text "+" in bold white               |
| Font size      | `FONT_SIZE_SMALL` (16px)             |
| Background     | `rgba(255,255,255,0.25)` pill        |
| Padding        | 4px horizontal, 1px vertical         |
| Hit area       | 32x32px zone centered on the "+" (exceeds visual) |
| Touch target   | Meets `MIN_TOUCH_TARGET` (48px) via zone expansion |

#### Pill Background

| Property     | Value                                       |
|--------------|---------------------------------------------|
| Fill color   | Badge-specific color at 0.85 alpha          |
| Shape        | Rounded rect with radius = height / 2       |
| Shadow       | None (pills are lightweight UI)             |
| Border       | 1px stroke at white 0.15 alpha              |

#### Interactive States

| State    | Visual Change                                            |
|----------|----------------------------------------------------------|
| Normal   | Base pill as described above                             |
| Pressed  | Entire badge scales to `BTN_PRESS_SCALE` (0.95) for `BTN_PRESS_DURATION` (80ms) |
| Disabled | Alpha reduced to 0.5, plus button hidden, non-interactive |

---

### 1.2 GlHUD Bar

The HUD bar is the top-level container that holds the three badges.

```
+==================================================+
|  [Hearts]    [Coins]    [Gems]                   |  y: 0 to HUD_HEIGHT
+==================================================+

Full width: GAME_WIDTH (390px)
Height: HUD_HEIGHT (50px)
```

#### Layout

| Property                | Value                                   |
|-------------------------|-----------------------------------------|
| Container position      | x: `GAME_WIDTH / 2` (195), y: `HUD_HEIGHT / 2` (25) |
| Background              | `HUD_BG_COLOR` (0x1A0A2E) at `HUD_BG_ALPHA` (0.95)  |
| Background rect         | Full width, x: -195 to +195, y: -25 to +25 |
| Z-depth                 | `Z_HUD` (900)                           |
| Top padding (safe area) | 4px from top edge of HUD                |

#### Badge Positioning (3-column centered layout)

The three badges are evenly distributed across the HUD width, with equal
edge margins. Total available width = `GAME_WIDTH` - 2 * `MARGIN_EDGE` = 350px.

| Badge   | X Position (relative to HUD center) | Absolute X |
|---------|-------------------------------------|------------|
| Hearts  | -116                                | 79         |
| Coins   | 0                                   | 195        |
| Gems    | +116                                | 311        |

This gives 116px spacing between badge centers. With pill width of 96px, the gap
between adjacent pill edges is 116 - 96 = 20px (comfortable, no overlap).

Badge Y position: 0 (centered within HUD bar).

#### Method: `updateValues(lives, coins, gems)`

Updates all three badge value texts. Called on scene create and after any
transaction (purchase, life regen, reward claim).

---

### 1.3 Edge Cases

| Scenario           | Behavior                                        |
|--------------------|-------------------------------------------------|
| Value = 0          | Display "0" in white, no special styling        |
| Value > 99999      | Truncate display to "99K+" format               |
| Lives at MAX (5)   | Heart icon pulses gently (scale 1.0 to 1.05, 1200ms yoyo) |
| Plus tapped         | Navigates to ShopScene                          |
| Rapid taps on plus | Debounce: ignore taps within 300ms of last      |

---

## SPEC-02: MainMenuScene Layout (P0)

### Problem Statement

The current main menu has inconsistent spacing, text that is too small, a broken
free gift gradient, non-functional icon buttons, and an unnecessary booster tray
that creates visual clutter. The layout needs to be clean, hierarchical, and
professionally spaced within the 600px viewport.

### Design Goals

- Clear vertical rhythm with generous spacing
- Strong title treatment as the visual anchor
- Prominent Play button as the primary CTA
- Free Gift banner as a secondary engagement hook
- Settings icon accessible but not dominant
- REMOVE booster tray entirely (PE decision)

---

### 2.1 Vertical Layout Map

```
Y=0    +================================+
       |          GlHUD (50px)          |  SPEC-01
Y=50   +================================+
       |                                |
       |     Settings icon (top-right)  |  y: 62
       |                                |
Y=88   |        "Gem Link" title        |  Gold, 42px bold
Y=122  |      "Match-3 Puzzle"          |  Dim, 24px
       |                                |
Y=150  |   Current Level X  |  Stars    |  Pill badge + star count
       |                                |
Y=180  +---  Gem Board Preview  --------+  y: 180 to 340
       |    (6x5 decorative grid)       |
       |    floating animation          |
Y=340  +--------------------------------+
       |                                |
Y=370  |    [>>> PLAY >>>]  btn         |  Green, 260x56, pulsing
       |                                |
Y=430  +--- Free Gift Banner -----------+  y: 430 to 474
       |  gradient pill, timer, tap     |
Y=474  +--------------------------------+
       |                                |
Y=488  |         v0.2.0                 |  Dim, 12px, 0.5 alpha
       |                                |
Y=600  +================================+
```

---

### 2.2 Component Specifications

#### Settings Icon (top-right)

| Property       | Value                                     |
|----------------|-------------------------------------------|
| Position       | x: `GAME_WIDTH - MARGIN_EDGE - 16` (354), y: 62 |
| Size           | 32x32px visual, 48x48 hit zone (`MIN_TOUCH_TARGET`) |
| Shape          | Gear: white outer circle r=7, inner circle r=3 (cut-out effect) |
| Color          | 0xFFFFFF at 0.7 alpha                     |
| Action         | Opens settings modal (sound, music, notifications toggles) |
| Z-depth        | Default (below HUD)                       |

#### Game Title "Gem Link"

| Property          | Value                                     |
|-------------------|-------------------------------------------|
| Position          | x: `GAME_WIDTH / 2` (195), y: 88         |
| Font size         | 42px (custom, between `FONT_SIZE_LARGE` and `FONT_SIZE_XL`) |
| Font weight       | Bold                                      |
| Color             | `#FFD700` (`UI_COLOR_ACCENT`)             |
| Stroke            | `#7a5c00`, thickness 3px                  |
| Origin            | (0.5, 0.5) centered                      |

#### Sparkle Decorations

| Property       | Value                                        |
|----------------|----------------------------------------------|
| Count          | 6 sparkles distributed around title          |
| Shape          | `Phaser.GameObjects.Star` with 4 points, inner=2, outer=5 |
| Color          | 0xFFD700 at 0.6 alpha                       |
| Animation      | Alpha 0.3 to 0.9, scale 0.6 to 1.2, 1200-2000ms yoyo repeat, `EASE_QUAD`, random delay 0-600ms |
| Positions      | Symmetric pairs: (-110, -20), (+115, -15), (-80, +25), (+85, +20), (-50, -30), (+55, -28) relative to title center |

#### Subtitle "Match-3 Puzzle"

| Property       | Value                                        |
|----------------|----------------------------------------------|
| Position       | x: 195, y: 122                               |
| Font size      | `FONT_SIZE_MEDIUM` (24px)                    |
| Color          | `UI_COLOR_TEXT_DIM` (0xAAAAAA -> `#AAAAAA`)  |
| Origin         | (0.5, 0.5)                                   |

#### Level Badge + Stars Row

```
+--[ Level Pill ]--+   [star icon] 12
```

| Element        | Property              | Value                           |
|----------------|-----------------------|---------------------------------|
| Level pill     | Position              | x: 130, y: 150                 |
| Level pill     | Width x Height        | 100 x 28px                     |
| Level pill     | Border radius         | 14px                           |
| Level pill     | Fill                  | `UI_COLOR_PRIMARY` at 0.85     |
| Level pill     | Text                  | "Level {N}" centered in pill   |
| Level pill     | Font                  | `FONT_SIZE_SMALL` (16px), bold, white |
| Star count     | Position              | x: 245, y: 150                 |
| Star count     | Font                  | `FONT_SIZE_SMALL` (16px), `#FFD700` |
| Star count     | Format                | "{totalStars}" with small star icon drawn to the left |
| Star icon      | Size                  | 10px radius 5-pointed star, gold |

#### Gem Board Preview

| Property          | Value                                       |
|-------------------|---------------------------------------------|
| Grid              | 6 columns x 5 rows                         |
| Cell size         | 22px                                        |
| Gem radius        | 5px                                         |
| Grid pixel size   | 132 x 110                                   |
| Grid position     | Centered: x = (390 - 132) / 2 + 11 = 140, y = 180 + 11 = 191 |
| Border            | 1px stroke, white at 0.15 alpha, rounded rect with 8px radius, 8px padding around grid |
| Border rect       | x: (390 - 148) / 2 = 121, y: 172, w: 148, h: 126 |
| Gem shapes        | Random from: circle, diamond, triangle, square, heart, star |
| Gem colors        | Random from `GEM_SHAPE_COLORS`              |
| Gem alpha          | 0.85                                        |
| Float animation   | y offset 0 to 4px, 2400ms, yoyo, repeat forever, `Sine.easeInOut` |

#### Play Button

| Property          | Value                                       |
|-------------------|---------------------------------------------|
| Position          | x: `GAME_WIDTH / 2` (195), y: 370          |
| Width             | `BTN_WIDTH_LARGE` (260px)                   |
| Height            | 56px                                        |
| Gradient          | `GRADIENT_BUTTON_SUCCESS` [0x44DD44, 0x22AA22] |
| Label             | "Play" (use Unicode triangle U+25B6 prefix: "\u25B6 Play") |
| Font size         | `FONT_SIZE_MEDIUM` (24px), bold             |
| Border radius     | 12px                                        |
| Shadow            | `SHADOW_OFFSET` (2px), `SHADOW_COLOR` at `SHADOW_ALPHA` |
| Pulse animation   | Scale 1.0 to 1.04, 900ms, yoyo, repeat forever, `Sine.easeInOut` |
| Tap behavior      | If lives > 0: fade transition to GameplayScene. If lives = 0: show No Lives modal |

#### Free Gift Banner

| Property           | Value                                       |
|--------------------|---------------------------------------------|
| Position           | x: 195, y: 452 (center of banner)          |
| Width              | 340px (`GAME_WIDTH - MARGIN_EDGE * 2 - 10`) |
| Height             | 44px                                        |
| Border radius      | 12px                                        |
| Background         | Two-tone gradient: top-left 0x6C3483, bottom-right 0x2980B9 (use `fillGradientStyle`) |
| Border             | 1px stroke, white at 0.25 alpha             |
| Label text         | "Free Gift Available!" (if claimable) or "Free Gift" (if timer active) |
| Label position     | x: -10 relative to center, y: center       |
| Label font         | `FONT_SIZE_SMALL` (16px), bold, white       |
| Timer text         | Position x: 140 relative to center, y: center |
| Timer font         | `FONT_SIZE_XS` (12px), `#FFD700`           |
| Timer format       | "HH:MM:SS" or "CLAIM" when ready            |
| Tap behavior       | Navigate to ShopScene                       |
| Interactive zone   | Full banner rect                             |

#### Version Label

| Property       | Value                                        |
|----------------|----------------------------------------------|
| Position       | x: 195, y: 488                               |
| Font size      | `FONT_SIZE_XS` (12px)                        |
| Color          | `UI_COLOR_TEXT_DIM` (`#AAAAAA`)               |
| Alpha          | 0.5                                           |
| Text           | "v0.2.0"                                      |

---

### 2.3 Removed Elements

- **Booster tray**: REMOVED per PE decision. Boosters are accessed only during
  gameplay (remap button on GameplayScene) and the Shop.

---

### 2.4 Edge Cases

| Scenario                 | Behavior                                          |
|--------------------------|---------------------------------------------------|
| Guest user (no progress) | Level = 1, Stars = 0, Lives = 5, Coins = 0, Gems = 0 |
| Max level reached        | "Level 30" displayed, Play button still functional |
| Lives = 0                | Play button tap shows "Out of Lives!" modal       |
| Free gift ready          | Banner text changes to "Free Gift Available!", timer shows "CLAIM" |
| Life regenerating        | Small red text below HUD: "Next life: MM:SS" at y=52 |

---

## SPEC-03: GameplayScene HUD Layout (P0)

### Problem Statement

The current gameplay HUD has overlapping elements: the Moves counter overlaps the
progress bar, the Coins badge overlaps the progress bar, and the "Level N" header
lacks top margin. The "First Steps" subtitle wastes vertical space. Elements need
clear separation and the layout must maximize board area.

### Design Goals

- Clear three-row HUD above the board: header row, badges row, progress bar
- No element overlap whatsoever
- Maximize board area (8x8 grid at 46px cells = 368px needed)
- Score display and moves counter clearly separated
- Star progress bar with animated markers

---

### 3.1 Vertical Layout Map

```
Y=0    +================================+
       |  [X]    Level N       [Moves]  |  ROW 1: Header (y: 0-40)
Y=40   +--------------------------------+
       |  [Score: 0]      progress bar  |  ROW 2: Score + Progress (y: 40-62)
Y=62   +--------------------------------+
       |        8px gap                 |
Y=70   +================================+
       |                                |
       |          8x8 BOARD             |  y: 70 to 438
       |        (368 x 368)             |
       |                                |
Y=438  +================================+
       |  Boosters [Re-map btn]         |  ROW 4: Booster tray (y: 438-494)
Y=494  +================================+
       |        Bottom margin           |
Y=600  +================================+
```

**Critical measurement:** Board height = 8 * 46 = 368px. Board starts at y=70,
ends at y=438. Booster tray below at y=450. Total used: 494px out of 600px.
Remaining 106px is bottom safe area.

---

### 3.2 ROW 1: Header (y: 0 to 40)

```
+--[X]----[  Level N  ]----[Moves: 15]--+
   16,20     195,20           354,20
```

#### Quit Button (top-left)

| Property       | Value                                        |
|----------------|----------------------------------------------|
| Position       | x: `MARGIN_EDGE` (20) - 4 = 16, y: 6       |
| Size           | 36x36px visual                               |
| Hit zone       | 48x48px centered (`MIN_TOUCH_TARGET`)        |
| Background     | `UI_COLOR_DANGER` (0xFF4444) at 0.8 alpha, rounded rect, radius 8px |
| Icon           | White "X" drawn with 2 crossed lines, 3px stroke, 16px span |
| Action         | Shows quit confirmation overlay               |

#### Level Title (center)

| Property       | Value                                        |
|----------------|----------------------------------------------|
| Position       | x: `GAME_WIDTH / 2` (195), y: 20            |
| Font size      | `FONT_SIZE_MEDIUM` (24px)                    |
| Font weight    | Bold                                         |
| Color          | `UI_COLOR_ACCENT` (0xFFD700 -> `#FFD700`)   |
| Origin         | (0.5, 0.5) centered                         |
| Text           | "Level {N}"                                  |

**REMOVED:** Level name subtitle ("First Steps" etc.) -- wastes vertical space.

#### Moves Badge (top-right)

```
   +-------+
   | Moves |   label above circle
   |  15   |   number inside circle
   +-------+
```

| Property            | Value                                     |
|---------------------|-------------------------------------------|
| Circle center       | x: `GAME_WIDTH - MARGIN_EDGE - 22` (348), y: 24 |
| Circle radius       | 18px                                      |
| Circle fill         | `UI_COLOR_PRIMARY` (0x6C3BD1) at 0.7     |
| Circle stroke       | `UI_COLOR_ACCENT` at 0.3, 1px            |
| Number text         | Centered in circle, `FONT_SIZE_MEDIUM` (24px), bold, white |
| "Moves" label       | Above circle at y: circle_y - radius - 6 = 0 |
| Label font          | `FONT_SIZE_XS` (12px), `UI_COLOR_TEXT_DIM` |
| Low moves warning   | When moves <= 3: circle fill changes to `UI_COLOR_DANGER` (0xFF4444), number pulses scale 1.0 to 1.15, 400ms yoyo |

---

### 3.3 ROW 2: Score Badge + Progress Bar (y: 40 to 62)

```
+--[coin 0   ]--[===progress bar=======]--+
   20,51         88,51              378,51
```

#### Score Badge (left side)

| Property         | Value                                       |
|------------------|---------------------------------------------|
| Position         | x: `MARGIN_EDGE` (20), y: 42               |
| Width x Height   | 64 x 22px                                   |
| Border radius    | 11px (half height)                          |
| Fill             | `UI_COLOR_PRIMARY` at 0.7                   |
| Stroke           | `UI_COLOR_ACCENT` at 0.3, 1px              |
| Coin icon        | Gold circle (r=6) at x+14, inner circle (r=3) |
| Score text       | x: badge_x + 28, y: badge_y + 11           |
| Score font       | `FONT_SIZE_SMALL` (16px), bold, white       |
| Score animation  | Counter rolls up from displayed to target, 400ms |

#### Star Progress Bar (right of score badge)

| Property         | Value                                       |
|------------------|---------------------------------------------|
| Position         | x: 88, y: 42                                |
| Width            | `GAME_WIDTH - MARGIN_EDGE - 88` = 282px     |
| Height           | 18px                                         |
| Border radius    | 8px (near-pill)                              |
| Background fill  | 0x1A0A2E at 0.8                             |
| Background stroke| 1px, 0x444466 at 0.6                        |
| Fill color       | Before 1-star: `UI_COLOR_PRIMARY` (purple). After 1-star: `UI_COLOR_SUCCESS` (green). After 2-star: `UI_COLOR_ACCENT` (gold) |
| Fill alpha       | 0.9                                          |
| Fill animation   | Smooth tween to target width, 400ms, `EASE_QUAD` |

#### Star Markers on Progress Bar

Three star markers are placed at proportional positions based on star thresholds.

| Property         | Value                                       |
|------------------|---------------------------------------------|
| Position Y       | Centered on progress bar (y: 42 + 9 = 51)  |
| Position X       | `barX + (threshold[i] / threshold[2]) * barW` |
| Shape            | 5-pointed star, radius 7px                  |
| Empty star       | Fill 0x555555 at 0.5, stroke 0x888888 at 0.6, 2px |
| Filled star      | Fill 0xFFD700 at 1.0, no stroke             |
| Z-depth          | 10 (above progress bar fill)                |
| Earn animation   | Scale 0 to 1.3 over 350ms (`EASE_BACK`), settle to 1.0 over 200ms, gold particle burst (10 particles) |
| Pulse (near star)| When score >= 80% of next threshold: gentle scale pulse 1.0 to 1.15, 600ms yoyo |

---

### 3.4 Board Area (y: 70 to 438)

| Property           | Value                                       |
|--------------------|---------------------------------------------|
| Board origin       | x: (`GAME_WIDTH` - boardWidth) / 2 = 11, y: 70 |
| Board size         | 368 x 368px (8 cols * 46px, 8 rows * 46px) |
| Cell size          | `GEM_SIZE` + `GEM_SPACING` = 44 + 2 = 46px |
| Background         | Gradient using `GRADIENT_BOARD_BG` [0x0A0A3E, 0x150B40] |
| Border radius      | 8px                                          |
| Glow border        | 3px outer glow, `UI_COLOR_PRIMARY` at 0.25 alpha |
| Cell grid lines    | 1px, 0x444466 at 0.3 alpha                  |
| Gap above board    | 8px (from y=62 to y=70)                     |

---

### 3.5 Booster Tray (y: 450 to 494)

| Property           | Value                                       |
|--------------------|---------------------------------------------|
| Position           | Centered at x: 195, y: 466                 |
| Tray height        | 44px                                        |
| "Boosters" label   | Left of remap button, `FONT_SIZE_SMALL - 2` (14px), `UI_COLOR_TEXT_DIM` |
| Remap button width | 170px                                       |
| Remap button height| 44px                                        |
| Remap button center| x: centerX + 20 = 215, y: 466              |
| Button fill        | `UI_COLOR_PRIMARY` when enabled, `UI_COLOR_SECONDARY` at 0.5 when disabled |
| Button radius      | 10px                                        |
| Button text        | `FONT_SIZE_SMALL` (16px), bold, white       |
| Button label       | "Re-map ({N})" or "Re-map (Free!)" for first use or "Re-map (Buy)" when out |

---

### 3.6 Quit Confirmation Overlay

| Property           | Value                                          |
|--------------------|------------------------------------------------|
| Backdrop           | Full screen (390x600), black at 0.7 alpha      |
| Dialog position    | Centered at (195, 300)                          |
| Dialog size        | 300 x 200px                                     |
| Dialog fill        | `UI_COLOR_PRIMARY`, radius `MODAL_BORDER_RADIUS` (16px) |
| Dialog border      | 2px, `UI_COLOR_ACCENT` at 0.6                  |
| Title              | "Quit Level?", `FONT_SIZE_LARGE` (36px), `UI_COLOR_ACCENT`, bold |
| Body text          | "Your progress will be lost.", `FONT_SIZE_SMALL`, white, centered |
| "Quit" button      | 120x40px, `GRADIENT_BUTTON_DANGER`, "Quit", navigates to MainMenu |
| "Resume" button    | 120x40px, `GRADIENT_BUTTON_PRIMARY`, "Resume", hides overlay |
| Button spacing     | 16px gap between buttons, centered horizontally |
| Z-depth            | `Z_OVERLAY` (1100)                              |
| Appear animation   | Backdrop fades 0 to 0.7 over 200ms, dialog scales 0.8 to 1.0 over 300ms `EASE_BACK` |

---

### 3.7 Edge Cases

| Scenario              | Behavior                                      |
|-----------------------|-----------------------------------------------|
| Score = 0             | Progress bar shows empty, all stars empty      |
| Score > 3-star max    | Progress bar full (100%), all 3 stars filled   |
| Moves = 0             | Game transitions to level-fail flow            |
| Moves = 1, 2, or 3   | Moves badge turns red, number pulses           |
| Score counter overflow| Max display "99999", font shrinks to `FONT_SIZE_XS` if > 5 digits |
| Remap tokens = 0      | Button shows "Re-map (Buy)", tap opens ShopScene |
| First remap ever      | Button shows "Re-map (Free!)" for first-time players |

---

## SPEC-04: ShopScene Layout (P1)

### Problem Statement

The current shop has overlapping text on cards (80px cards are too narrow for
meaningful content), the confirmation modal has overlapping elements, there are no
item descriptions or imagery, and the layout is cramped. Cards need to be larger
with clear visual hierarchy.

### Design Goals

- Wider cards with room for icon, title, description, and price
- Clear section headers for Currency Packs and Boosters
- Professional purchase confirmation modal
- Celebration animation on successful purchase
- Proper error handling with toast feedback

---

### 4.1 Vertical Layout Map

```
Y=0    +================================+
       |          GlHUD (50px)          |  SPEC-01
Y=50   +================================+
       |                                |
Y=70   |       << SHOP >> ribbon        |
       |                                |
Y=100  |   Currency Packs (label)       |
Y=118  |  [Card1] [Card2] [Card3] [Card4]  y: 118-228
Y=228  |                                |
Y=238  |   Boosters & Items (label)     |
Y=256  |  [B1] [B2] [B3] [B4] [B5]     |  y: 256-310
Y=310  |                                |
Y=316  |  [Lives Refill] [Starter Pack] |  y: 316-360
Y=360  |                                |
Y=372  |  +--- FREE GIFT banner ------+ |  y: 372-454
       |  | FREE GIFT!               | |
       |  | timer / Ready to claim!  | |
       |  | [Claim] button           | |
       |  +---------------------------+ |
Y=454  |                                |
Y=474  |       [ Back ] button          |
       |                                |
Y=600  +================================+
```

---

### 4.2 New Constants Required for Cards

The current `CARD_WIDTH` (80px) and `CARD_HEIGHT` (110px) are too small for shop
cards with descriptions. We define new layout-specific values in the scene code
(not in Constants.ts since these are scene-specific).

| Value                    | Pixels | Notes                    |
|--------------------------|--------|--------------------------|
| Shop card width          | 82px   | Fits 4 across with spacing |
| Shop card height         | 110px  | Room for icon+title+price |
| Shop card spacing        | (390 - 40 - 328) / 3 = ~7px | Between cards |
| Shop card border radius  | `CARD_BORDER_RADIUS` (12px) | |

---

### 4.3 Component Specifications

#### Shop Ribbon

| Property           | Value                                       |
|--------------------|---------------------------------------------|
| Component          | `GlRibbon`                                  |
| Position           | x: 195, y: 70                               |
| Text               | "SHOP"                                       |
| Width              | 240px (default)                              |
| Color              | `RIBBON_COLOR` (0x1E90FF)                   |
| Text color         | `RIBBON_TEXT_COLOR` (0xFFD700)               |
| Font               | `FONT_SIZE_MEDIUM` (24px), bold              |
| Shadow             | `SHADOW_OFFSET`, `SHADOW_COLOR`, `SHADOW_ALPHA` |

#### Section Headers

| Property           | Value                                       |
|--------------------|---------------------------------------------|
| Position X         | `MARGIN_EDGE` (20)                          |
| Font size          | `FONT_SIZE_MEDIUM` (24px)                   |
| Color              | `#FFB800` (`COLOR_WARM_GOLD`)               |
| Font weight        | Normal (not bold)                           |
| Currency header Y  | 100                                          |
| Boosters header Y  | 238                                          |

#### Currency Pack Cards (4 cards)

Products: Beginner, Jumbo, Super, Mega

```
+--[ CARD ]--------+
|                   |
|   [Chest Icon]    |  Graphics-drawn treasure chest
|                   |
|   "Beginner"      |  Title
|   "250 Coins"     |  Description (REMOVED - not enough space)
|                   |
|   [ 50T ]         |  Buy button
+-------------------+
```

| Property           | Value                                       |
|--------------------|---------------------------------------------|
| Card component     | `GlCard`                                    |
| Card width         | `CARD_WIDTH` (80px)                         |
| Card height        | `CARD_HEIGHT` (110px)                       |
| Row Y              | 118 + `CARD_HEIGHT` / 2 = 173              |
| Card spacing       | (`GAME_WIDTH` - 2 * `MARGIN_EDGE` - 4 * 80) / 3 = ~3.3px |
| Card X positions   | 60, 143, 227, 310 (centers)                |
| Card background    | `CARD_BG_COLOR` (0x2A1A4E)                  |
| Card border        | 2px, `CARD_BORDER_COLOR` (0x6C3BD1) at 0.8 |
| Icon area          | Top 40px of card, graphics-drawn chest or coin stack |
| Title              | `FONT_SIZE_SMALL` (16px), bold, white, centered |
| Title Y            | icon_bottom + 4px                            |
| Buy button         | Bottom of card, width: card_width - 8, height: 26px |
| Buy button gradient| `GRADIENT_BUTTON_SUCCESS`                   |
| Buy button font    | `FONT_SIZE_XS` (12px)                       |
| Buy button text    | "{priceInTokens}T"                          |

**Card Icon Drawings (Graphics API):**

- Beginner (small chest): Brown rect 20x14, gold latch 8x4 on top, `COLOR_CHEST_BROWN` + `COLOR_COIN_GOLD`
- Jumbo (medium chest): Brown rect 24x16, two gold coins stacked, slight shine line
- Super (large chest): Brown rect 28x18, gold trim, three coins, glow circle
- Mega (epic chest): Brown rect 28x18 with purple tint, gold crown on top, sparkle dots

#### Booster Row (5 items)

Products: Hammer, Bomb, Rainbow, +3 Moves, Re-map

```
   [Label]
   [ Price ]   small button
```

| Property           | Value                                       |
|--------------------|---------------------------------------------|
| Button width       | 58px                                        |
| Button height      | 28px                                        |
| Row Y              | 256 (label top), 291 (button center)        |
| Spacing            | (`GAME_WIDTH` - 2 * `MARGIN_EDGE` - 5 * 58) / 4 = ~15px |
| X positions        | 49, 122, 195, 268, 341 (centers)            |
| Label              | `FONT_SIZE_XS` (12px), white, centered above button |
| Button gradient    | `GRADIENT_BUTTON_GOLD`                      |
| Button font        | `FONT_SIZE_SMALL` (16px)                    |
| Button text        | "{priceInTokens}T"                          |

#### Extra Booster Row (Lives Refill, Starter Pack)

| Property           | Value                                       |
|--------------------|---------------------------------------------|
| Row Y              | 316 (label), 338 (button center)            |
| Button width       | 90px                                        |
| Button height      | 28px                                        |
| X positions        | 140 and 250 (centers, symmetrically placed) |
| Label              | `FONT_SIZE_SMALL` (16px), white, centered   |
| Lives Refill       | If lives full: show "Lives Full!" green text, hide button |

#### Free Gift Section

| Property           | Value                                       |
|--------------------|---------------------------------------------|
| Banner background  | `Phaser.GameObjects.Rectangle`, 350 x 82px  |
| Banner position    | Centered at (195, 413)                       |
| Banner fill        | 0xFF6B35 (warm orange)                      |
| Banner stroke      | 2px, 0xFFD700 (gold)                        |
| "FREE GIFT!" text  | Center of banner top, `FONT_SIZE_LARGE` (36px), bold, white |
| Pulse animation    | Scale 1.0 to 1.08, 600ms, yoyo, `Sine.easeInOut` |
| Timer text         | Below title, `FONT_SIZE_SMALL` (16px), `#FFE0B2` |
| Claim button       | Bottom of banner, `BTN_WIDTH_MEDIUM` (200px) x 28px |
| Claim button       | `GRADIENT_BUTTON_GOLD` when claimable, `GRADIENT_BUTTON_PRIMARY` when locked |

#### Back Button

| Property           | Value                                       |
|--------------------|---------------------------------------------|
| Position           | x: 195, y: 490                               |
| Width              | `BTN_WIDTH_MEDIUM` (200px)                   |
| Height             | `BTN_HEIGHT` (52px)                          |
| Gradient           | `GRADIENT_BUTTON_PRIMARY`                    |
| Font               | `FONT_SIZE_MEDIUM` (24px)                    |
| Text               | "Back"                                       |
| Action             | Navigate to MainMenuScene                    |

---

### 4.4 Purchase Confirmation Modal

```
+==================================+
|        Confirm Purchase          |  Title
|                                  |
|     [Chest Icon - large]         |  40x40 icon
|                                  |
|       Beginner Pack              |  Product name
|       250 Coins + 5 Gems        |  Description
|       50 Tokens                  |  Price
|                                  |
|    [ Buy Now ]   [ Cancel ]      |  Two buttons
|                                  |
+==================================+
```

| Property           | Value                                       |
|--------------------|---------------------------------------------|
| Component          | `GlModal`                                   |
| Title              | "Confirm Purchase"                          |
| Width              | `MODAL_WIDTH` (340px)                       |
| Height             | 320px                                       |
| Background         | `UI_COLOR_PRIMARY`                          |
| Border             | 2px, `UI_COLOR_ACCENT` at 0.6              |
| Border radius      | `MODAL_BORDER_RADIUS` (16px)               |
| Close button       | "X" top-right, `FONT_SIZE_MEDIUM`, white    |
| Icon               | Graphics-drawn chest at y offset +40, 40x40 bounding box |
| Product name       | `FONT_SIZE_MEDIUM` (24px), bold, white, centered |
| Description        | `FONT_SIZE_SMALL` (16px), `UI_COLOR_TEXT_DIM`, centered, word-wrap 260px |
| Price line          | `FONT_SIZE_SMALL` (16px), `#FFD700`, bold   |
| "Buy Now" button   | 160 x 40px, `GRADIENT_BUTTON_GOLD`, `FONT_SIZE_SMALL` |
| "Cancel" button    | 120 x 36px, `GRADIENT_BUTTON_PRIMARY`, `FONT_SIZE_SMALL` |
| Button gap         | 12px vertical between Buy and Cancel        |
| Appear animation   | Backdrop fade 200ms, dialog scale 0.8 to 1.0 over 300ms `EASE_BACK` |
| Z-depth            | `Z_MODAL` (1010)                            |

---

### 4.5 Purchase Flow States

#### Loading State (during purchase API call)

| Property           | Value                                       |
|--------------------|---------------------------------------------|
| All buttons        | Disabled (alpha 0.5, non-interactive)       |
| Active button      | Shows spinning arc (drawn with Graphics, rotating 360deg/800ms) |
| Spinner size       | 16px diameter arc                           |
| Spinner color      | White at 0.8 alpha                          |

#### Success State

| Property           | Value                                       |
|--------------------|---------------------------------------------|
| Celebration        | `CelebrationSystem.celebratePurchase(scene, productName)` |
| Screen flash       | White flash, 100ms fade in, 100ms hold, 100ms fade out |
| Floating text      | "+{productName}!" gold, `FONT_SIZE_LARGE`, scale bounce in, float up and fade |
| Gold particles     | 8 particles burst from center               |
| All buttons        | Re-enabled after 1000ms                     |

#### Failure State

| Property           | Value                                       |
|--------------------|---------------------------------------------|
| Error toast        | See SPEC-05 for toast specifications        |
| All buttons        | Re-enabled immediately                      |
| No celebration     | Silent failure, only toast shown             |

---

### 4.6 Edge Cases

| Scenario                | Behavior                                     |
|-------------------------|----------------------------------------------|
| Lives at MAX_LIVES (5)  | Lives Refill button hidden, "Lives Full!" shown in green |
| Insufficient tokens     | Payment API returns error, failure toast shown |
| Purchase while loading  | Blocked (purchaseInProgress flag)            |
| Modal open + backdrop tap| Modal closes, purchase cancelled              |
| Timer reaches zero      | Timer text changes to "Ready to claim!", Claim button enabled |
| Gift already claimed    | Timer shows countdown to next gift            |
| Very long product name  | Word-wrap within card width - 12px            |

---

## SPEC-05: Floating Text & Toast Style (P1)

### Problem Statement

Floating text popups look unprofessional with inconsistent sizing, no animations,
and poor readability. Purchase feedback (success/failure) is unclear. Combo text
during gameplay needs better visual scaling to convey excitement.

### Design Goals

- Consistent floating text animation pattern across all contexts
- Clear visual distinction between score popups, combo text, purchase feedback
- Readable text with proper stroke outlines for contrast
- Satisfying "juice" animations that match the genre

---

### 5.1 Score Popup (during gameplay, per match)

Appears at the center of the matched gems, floats upward and fades.

| Property           | Value                                       |
|--------------------|---------------------------------------------|
| Text               | "+{points}"                                  |
| Font size          | `FONT_SIZE_SMALL` (16px)                    |
| Color              | `#FFFFFF`                                    |
| Stroke             | `#000000`, thickness 1px                    |
| Origin             | (0.5, 0.5) centered                        |
| Z-depth            | `Z_EFFECTS + 2` (302)                       |
| Initial alpha      | 0.9                                          |
| Animation          | Float up 40px over 600ms, fade to 0 over 600ms, delay 100ms. `EASE_QUAD` |
| Cleanup            | Destroy text object on animation complete    |

---

### 5.2 Combo Text (during gameplay, per cascade depth)

Appears at the center of the matched area with increasing drama per depth.

| Depth | Label        | Font Size               | Color      | Start Scale | Extras                    |
|-------|-------------|-------------------------|------------|-------------|---------------------------|
| 1     | "Linked!"    | `FONT_SIZE_SMALL` (16px)  | `#FFFFFF`  | 1.0         | None                      |
| 2     | "Great!"     | `FONT_SIZE_MEDIUM` (24px) | `#FFD700`  | 1.2         | None                      |
| 3+    | "Epic Combo!"| `FONT_SIZE_LARGE` (36px)  | `#FF4444`  | 1.4+        | Rainbow tint cycle, camera shake |

#### Common Animation (all depths)

| Property           | Value                                       |
|--------------------|---------------------------------------------|
| Stroke             | `#000000`, thickness 2px                    |
| Origin             | (0.5, 0.5) centered                        |
| Z-depth            | `Z_EFFECTS + 3` (303)                       |
| Appear             | Scale from 0 to startScale+0.1 over 200ms, `EASE_BACK` |
| Settle             | Scale to startScale over 100ms              |
| Float + Fade       | Float up 70px, alpha to 0, over 800ms, delay 200ms, `EASE_QUAD` |
| Cleanup            | Destroy on complete                          |

#### Depth 3+ Extras

| Property           | Value                                       |
|--------------------|---------------------------------------------|
| Rainbow tint       | Cycle through [0xFF0000, 0xFF8800, 0xFFFF00, 0x00FF00, 0x0088FF, 0xFF00FF] every 80ms |
| Camera shake       | Intensity 0.005, duration 50ms              |

---

### 5.3 Purchase Success Toast

Full-screen celebration shown after successful shop purchase.

| Property           | Value                                       |
|--------------------|---------------------------------------------|
| Screen flash       | White rectangle over full viewport, alpha 0 to 0.3 over 100ms, hold 100ms, fade back to 0 |
| Flash Z-depth      | `Z_EFFECTS + 10` (310)                       |
| Main text          | "+{productName}!"                            |
| Text font          | `FONT_SIZE_LARGE` (36px), bold               |
| Text color         | `#FFD700`                                    |
| Text stroke        | `#000000`, thickness 3px                     |
| Text position      | Center of viewport: (195, 300)               |
| Text Z-depth       | `Z_EFFECTS + 11` (311)                       |
| Appear animation   | Scale 0 to 1.2 over 300ms, `EASE_BACK`     |
| Settle animation   | Scale 1.2 to 1.0 over 150ms, `EASE_QUAD`   |
| Exit animation     | Float up 80px + alpha to 0 over 700ms, delay 800ms |
| Gold particles     | 8 particles burst from center, speed 40-120, lifespan 600ms |
| Particle Z-depth   | `Z_PARTICLES` (1200)                         |
| Particle cleanup   | Destroy emitter after 800ms                  |

---

### 5.4 Purchase Failure Toast

Subtle, non-disruptive error feedback.

| Property           | Value                                       |
|--------------------|---------------------------------------------|
| Background         | Dark semi-transparent pill: 0x000000 at 0.7 alpha |
| Pill dimensions    | Auto-width based on text + 24px horizontal padding, 36px height |
| Pill border radius | 18px (half height)                          |
| Pill position      | Center X: 195, Y: `GAME_HEIGHT - 80` = 520 (bottom area) |
| Text               | Error message (e.g. "Purchase failed")       |
| Text font          | `FONT_SIZE_SMALL` (16px), white             |
| Text origin        | (0.5, 0.5) centered in pill                 |
| Z-depth            | `Z_OVERLAY` (1100)                           |
| Appear animation   | Slide up from y+20, alpha 0 to 1 over 200ms |
| Hold               | Visible for 2500ms                           |
| Exit animation     | Alpha 1 to 0 over 300ms                     |
| Cleanup            | Destroy all objects on exit complete          |

---

### 5.5 "Lives Full!" Indicator

Shown in the shop when player has max lives.

| Property           | Value                                       |
|--------------------|---------------------------------------------|
| Text               | "Lives Full!"                                |
| Font size          | `FONT_SIZE_SMALL` (16px)                    |
| Color              | `#4CAF50` (material green -- readable on dark bg) |
| Position           | Where the Lives Refill buy button would be   |
| Origin             | (0.5, 0)                                     |
| Animation          | None (static text)                           |

---

### 5.6 Generic Floating Reward Text

Used for "+N coins", "+N gems", or any reward animation.

| Property           | Value                                       |
|--------------------|---------------------------------------------|
| Text               | "+{amount}" or "+{amount} {unit}"           |
| Font size          | `FONT_SIZE_MEDIUM` (24px)                   |
| Color              | Configurable, default `#FFFFFF`              |
| Stroke             | `#000000`, thickness 2px                    |
| Z-depth            | `Z_EFFECTS + 1` (301)                        |
| Appear animation   | Scale 0 to 1.1 over 150ms, `EASE_BACK`     |
| Settle             | Scale 1.1 to 1.0 over 80ms                 |
| Float + Fade       | Float up 60px, alpha to 0, duration 770ms, `EASE_QUAD` |
| Total duration     | 1000ms (default, configurable)               |
| Cleanup            | Destroy on complete                          |

---

### 5.7 Star Earned Celebration

Triggered when score crosses a star threshold during gameplay.

| Property           | Value                                       |
|--------------------|---------------------------------------------|
| Gold particle burst| 10 particles from star marker position, speed 50-130, lifespan 500ms |
| Star graphic       | 5-pointed star, radius 16px, gold fill, black stroke 2px |
| Star appear        | Scale 0 to 1.3 over 350ms, `EASE_BACK`     |
| Star settle        | Scale 1.3 to 1.0 over 200ms, `EASE_QUAD`   |
| Star hold          | Visible for 2000ms                           |
| Star exit          | Alpha to 0 over 300ms, then destroy         |
| Camera shake       | Intensity 0.003, duration 30ms               |
| Z-depth            | `Z_EFFECTS + 7` (307)                        |

---

## Appendix A: Constants Reference

All values below are sourced from `src/utils/Constants.ts`. Designers and
engineers must reference these constants by name, never by hardcoded value.

### Display

| Constant            | Value    | Usage                          |
|---------------------|----------|--------------------------------|
| `GAME_WIDTH`        | 390      | Viewport width                 |
| `GAME_HEIGHT`       | 600      | Viewport height                |
| `BACKGROUND_COLOR`  | 0x1A0A2E | Dark purple canvas background  |

### Gem Rendering

| Constant      | Value | Usage                    |
|---------------|-------|--------------------------|
| `GEM_SIZE`    | 44    | Pixel size of each gem   |
| `GEM_SPACING` | 2     | Gap between gems         |

### Typography

| Constant           | Value | Usage              |
|--------------------|-------|--------------------|
| `FONT_FAMILY`      | "Arial, Helvetica, sans-serif" | All text |
| `FONT_SIZE_XS`     | 12    | Captions, labels   |
| `FONT_SIZE_SMALL`  | 16    | Body text, badges  |
| `FONT_SIZE_MEDIUM` | 24    | Headings, buttons  |
| `FONT_SIZE_LARGE`  | 36    | Large headings     |
| `FONT_SIZE_XL`     | 48    | Hero text          |
| `FONT_SIZE_XXL`    | 56    | Splash text        |

### Spacing

| Constant         | Value | Usage                    |
|------------------|-------|--------------------------|
| `MARGIN_EDGE`    | 20    | Screen edge padding      |
| `MARGIN_SECTION` | 16    | Between sections         |

### UI Colors

| Constant             | Value    | Usage                      |
|----------------------|----------|----------------------------|
| `UI_COLOR_PRIMARY`   | 0x6C3BD1 | Purple brand color         |
| `UI_COLOR_SECONDARY` | 0x2A1A4E | Dark purple surfaces       |
| `UI_COLOR_ACCENT`    | 0xFFD700 | Gold highlights            |
| `UI_COLOR_TEXT`      | 0xFFFFFF | Primary text               |
| `UI_COLOR_TEXT_DIM`  | 0xAAAAAA | Secondary / muted text     |
| `UI_COLOR_DANGER`    | 0xFF4444 | Error, low-moves warning   |
| `UI_COLOR_SUCCESS`   | 0x44DD44 | Success, progress          |

### Badge Colors

| Constant            | Value    | Usage            |
|---------------------|----------|------------------|
| `BADGE_COLOR_HEART` | 0xFF4466 | Hearts badge     |
| `BADGE_COLOR_COIN`  | 0xFFD700 | Coins badge      |
| `BADGE_COLOR_GEM`   | 0xBB55FF | Gems badge       |

### Button Sizes

| Constant           | Value | Usage            |
|--------------------|-------|------------------|
| `BTN_WIDTH_LARGE`  | 260   | Primary CTA      |
| `BTN_WIDTH_MEDIUM` | 200   | Secondary CTA    |
| `BTN_WIDTH_SMALL`  | 140   | Tertiary buttons |
| `BTN_HEIGHT`       | 52    | Standard height  |
| `MIN_TOUCH_TARGET` | 48    | Minimum tap area |

### Gradients (top, bottom)

| Constant                  | Values               | Usage           |
|---------------------------|----------------------|-----------------|
| `GRADIENT_BUTTON_PRIMARY` | [0x6C3BD1, 0x4A1FA0] | Default button  |
| `GRADIENT_BUTTON_SUCCESS` | [0x44DD44, 0x22AA22] | Play / confirm  |
| `GRADIENT_BUTTON_GOLD`    | [0xFFD700, 0xFFB800] | Purchase / CTA  |
| `GRADIENT_BUTTON_DANGER`  | [0xFF4444, 0xCC2222] | Destructive act |
| `GRADIENT_BOARD_BG`       | [0x0A0A3E, 0x150B40] | Board surface   |

### HUD

| Constant            | Value    | Usage                    |
|---------------------|----------|--------------------------|
| `HUD_HEIGHT`        | 50       | HUD bar height           |
| `HUD_BG_COLOR`      | 0x1A0A2E | HUD background           |
| `HUD_BG_ALPHA`      | 0.95     | HUD background opacity   |
| `HUD_BADGE_RADIUS`  | 18       | Badge pill corner radius |
| `HUD_BADGE_SPACING` | 8        | Gap between badges       |

### Modal

| Constant              | Value | Usage                 |
|-----------------------|-------|-----------------------|
| `MODAL_WIDTH`         | 340   | Dialog width          |
| `MODAL_BORDER_RADIUS` | 16    | Dialog corner radius  |
| `MODAL_BACKDROP_ALPHA`| 0.7   | Overlay darkness      |

### Card

| Constant             | Value    | Usage                 |
|----------------------|----------|-----------------------|
| `CARD_WIDTH`         | 80       | Card width            |
| `CARD_HEIGHT`        | 110      | Card height           |
| `CARD_BORDER_RADIUS` | 12       | Card corner radius    |
| `CARD_BG_COLOR`      | 0x2A1A4E | Card background       |
| `CARD_BORDER_COLOR`  | 0x6C3BD1 | Card border           |

### Z-Depth Ordering

| Constant           | Value | Usage                        |
|--------------------|-------|------------------------------|
| `Z_BOARD`          | 100   | Board background             |
| `Z_GEMS`           | 200   | Gem sprites                  |
| `Z_EFFECTS`        | 300   | Celebrations, floating text  |
| `Z_HUD`            | 900   | HUD overlay                  |
| `Z_MODAL_BACKDROP` | 1000  | Modal darkening              |
| `Z_MODAL`          | 1010  | Modal dialog                 |
| `Z_OVERLAY`        | 1100  | Top-level overlays, toasts   |
| `Z_PARTICLES`      | 1200  | Particle effects             |

### Animation

| Constant            | Value            | Usage                 |
|---------------------|------------------|-----------------------|
| `EASE_BOUNCE`       | "Bounce.easeOut" | Playful arrivals      |
| `EASE_BACK`         | "Back.easeOut"   | Overshoot pop-in      |
| `EASE_ELASTIC`      | "Elastic.easeOut"| Springy effects       |
| `EASE_QUAD`         | "Quad.easeOut"   | Smooth standard       |
| `BTN_PRESS_SCALE`   | 0.95             | Button press feedback |
| `BTN_PRESS_DURATION`| 80ms             | Button press speed    |
| `SHADOW_OFFSET`     | 2px              | Drop shadow distance  |
| `SHADOW_COLOR`      | 0x000000         | Shadow color          |
| `SHADOW_ALPHA`      | 0.3              | Shadow opacity        |

### Timing

| Constant                | Value | Usage                    |
|-------------------------|-------|--------------------------|
| `SWAP_DURATION_MS`      | 200   | Gem swap animation       |
| `CLEAR_DURATION_MS`     | 300   | Match clear animation    |
| `FALL_DURATION_MS`      | 100   | Gem fall per row         |
| `SPAWN_DURATION_MS`     | 150   | New gem fade-in          |
| `CASCADE_DELAY_MS`      | 250   | Between cascade steps    |
| `SCORE_POPUP_DURATION_MS`| 800  | Score float duration     |

---

## Appendix B: New Constants Required

The following constants should be added to `Constants.ts` to support these specs.
These are recommendations from the Lead Designer for the Frontend Lead Engineer
to implement.

```typescript
// ============================================================
// BADGE DIMENSIONS (SPEC-01)
// ============================================================

/** Badge pill width with plus button */
export const BADGE_PILL_WIDTH_PLUS = 96;

/** Badge pill width without plus button */
export const BADGE_PILL_WIDTH = 68;

/** Badge pill height */
export const BADGE_PILL_HEIGHT = 32;

/** Badge spacing between centers in HUD */
export const BADGE_CENTER_SPACING = 116;

// ============================================================
// TOAST DIMENSIONS (SPEC-05)
// ============================================================

/** Error toast pill height */
export const TOAST_HEIGHT = 36;

/** Error toast horizontal padding */
export const TOAST_PADDING_H = 24;

/** Error toast border radius */
export const TOAST_BORDER_RADIUS = 18;

/** Error toast display duration in ms */
export const TOAST_DISPLAY_MS = 2500;

/** Error toast fade out duration in ms */
export const TOAST_FADE_MS = 300;

/** Error toast Y position from bottom */
export const TOAST_Y = GAME_HEIGHT - 80; // 520

// ============================================================
// GAMEPLAY HUD LAYOUT (SPEC-03)
// ============================================================

/** Y position where the game board starts */
export const BOARD_TOP_Y = 70;

/** Score badge width in gameplay HUD */
export const GAMEPLAY_SCORE_BADGE_W = 64;

/** Score badge height in gameplay HUD */
export const GAMEPLAY_SCORE_BADGE_H = 22;

/** Moves circle radius in gameplay HUD */
export const GAMEPLAY_MOVES_RADIUS = 18;
```

---

## Design Review Checklist

Before any screen implementation is considered complete, verify:

- [ ] All colors reference Constants.ts names (no hardcoded hex)
- [ ] All font sizes reference Constants.ts names
- [ ] All touch targets meet `MIN_TOUCH_TARGET` (48px)
- [ ] All interactive elements have pressed/disabled states
- [ ] Text has sufficient contrast (white on dark purple = WCAG AAA)
- [ ] No elements overlap at 390x600 viewport
- [ ] Animations have specified duration, easing, and property
- [ ] Z-depth ordering is correct (HUD > Effects > Gems > Board)
- [ ] Edge cases documented (empty, max, error, loading)
- [ ] SHAFT policy compliance verified (no gambling aesthetics)

---

*End of Design Specifications v1.0*
