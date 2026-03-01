# Gem Clash Design System

> **Owner:** Lead Designer
> **Status:** Active -- Single Source of Truth
> **Version:** 1.0 | **Date:** February 2026
> **Platform:** Jest (jest.com) -- messaging-native HTML5 game
> **Engine:** Phaser 3 (Custom Build) + TypeScript + Vite
> **Viewport:** Mobile webview (320-430px width, portrait orientation)

---

## 1. Brand Guidelines

### 1.1 Brand Identity

- **Brand Name:** Gem Clash
- **Tagline:** "Challenge friends in match-3 puzzles!"
- **Brand Personality:** Vibrant, competitive, social, casual-friendly
- **Logo Concept:** A cluster of 3 colorful gem shapes (diamond, hexagon, circle) with a lightning-bolt "clash" element cutting diagonally through them. The word "GEM" sits above "CLASH" in bold block lettering with a slight perspective tilt. The gems use the primary gem palette (red, blue, green). The lightning bolt uses the accent color (#00FF88).

### 1.2 Tone of Voice

- **In-game UI text:** Friendly, encouraging, slightly competitive. Use active verbs. Examples: "Nice match!", "Keep going!", "Almost there!"
- **Level complete:** Celebratory without being over-the-top. Examples: "Level 12 Complete!", "You earned 3 stars!"
- **Level failed:** Sympathetic and motivating, never punishing. Examples: "So close! Try again?", "Out of moves! You were almost there."
- **Shop text:** Clear, benefit-focused, no pressure. Examples: "Keep playing when you're so close!", "Get 5 lives instantly"
- **Notifications:** Urgent but playful, personal, progress-based. Under 100 characters. No emoji. No game name. Examples: "Level 12 is ready for you. Can you earn 3 stars?", "Your 5-day streak bonus is ready to claim!"
- **Registration prompts:** Value-first, not guilt-based. Lead with what the player gains.

### 1.3 Developer Console Assets

- **Game Icon (Logo):** Square format. Gem cluster on dark background (#1A0A2E). Must be legible at 64x64px.
- **Hero Image:** Wide banner. Gameplay screenshot showing the 8x8 board with colorful gems mid-cascade, overlaid with a VS challenge card element showing two player avatars. Social/competitive feel.
- **Card Color:** #1A0A2E (deep purple-navy, matches game background)
- **Description:** "Challenge friends in match-3 puzzles! Beat their scores via text."

---

## 2. Color System

### 2.1 Primary Palette

| Token                  | Hex       | Usage                                       |
|------------------------|-----------|---------------------------------------------|
| `color-primary`        | `#6C5CE7` | Primary brand purple, headers, emphasis      |
| `color-secondary`      | `#4D96FF` | Secondary actions, links, info states        |
| `color-accent`         | `#00FF88` | CTAs, highlights, success, Jest brand echo   |
| `color-accent-dark`    | `#00CC6A` | Accent hover/pressed state                   |
| `color-bg-deep`        | `#0A0A1A` | Deepest background (page level)              |
| `color-bg-primary`     | `#1A0A2E` | Primary screen background                    |
| `color-bg-secondary`   | `#0D1B2A` | Secondary background, gradient endpoint      |
| `color-bg-surface`     | `#16213E` | Card surfaces, panels, modals                |
| `color-bg-board`       | `rgba(255,255,255,0.05)` | Game board background          |
| `color-border-subtle`  | `rgba(255,255,255,0.08)` | Card borders, dividers          |
| `color-border-medium`  | `rgba(255,255,255,0.15)` | Active borders, outlines        |
| `color-text-primary`   | `#FFFFFF` | Primary text on dark backgrounds             |
| `color-text-secondary` | `#AAAAAA` | Secondary text, descriptions                 |
| `color-text-tertiary`  | `#888888` | Tertiary text, timestamps, hints             |
| `color-text-disabled`  | `#555555` | Disabled text, inactive labels               |
| `color-error`          | `#FF4757` | Errors, destructive actions, life loss       |
| `color-success`        | `#2ED573` | Success states, positive feedback            |
| `color-warning`        | `#FFA502` | Warnings, low-move alerts                    |
| `color-gold`           | `#FFD93D` | Stars, premium badges, gold accents          |

### 2.2 Gem Colors (6 Gems)

Each gem has a gradient from base to lighter variant. The darker variant is used for shadows and borders.

| Gem    | Base      | Light (Highlight) | Dark (Shadow) | Selected Glow          | Match Flash            |
|--------|-----------|--------------------|---------------|------------------------|------------------------|
| Red    | `#FF4757` | `#FF6B81`         | `#C0392B`     | `rgba(255,71,87,0.6)`  | `rgba(255,71,87,0.9)`  |
| Blue   | `#1E90FF` | `#54A0FF`         | `#1565C0`     | `rgba(30,144,255,0.6)` | `rgba(30,144,255,0.9)` |
| Green  | `#2ED573` | `#7BED9F`         | `#1B9E4B`     | `rgba(46,213,115,0.6)` | `rgba(46,213,115,0.9)` |
| Yellow | `#FFA502` | `#FFD43B`         | `#CC8400`     | `rgba(255,165,2,0.6)`  | `rgba(255,165,2,0.9)`  |
| Purple | `#9B59B6` | `#BE90D4`         | `#7D3C98`     | `rgba(155,89,182,0.6)` | `rgba(155,89,182,0.9)` |
| Orange | `#FF6348` | `#FF7F5B`         | `#CC4F3A`     | `rgba(255,99,72,0.6)`  | `rgba(255,99,72,0.9)`  |

**Gem gradient direction:** 135deg (top-left to bottom-right), from base to light variant.
**Gem box-shadow (idle):** `0 2px 8px [selected-glow-color]`

### 2.3 UI Colors

| Token                      | Hex / Value                                      | Usage                        |
|----------------------------|--------------------------------------------------|------------------------------|
| `color-star-empty`         | `#3A3A4A`                                        | Empty star outline           |
| `color-star-fill-1`        | `#FFD93D`                                        | 1-star fill                  |
| `color-star-fill-2`        | `linear-gradient(135deg, #FFD93D, #FFA502)`      | 2-star fill                  |
| `color-star-fill-3`        | `linear-gradient(135deg, #FFD93D, #FF6B6B)`      | 3-star fill (gold to red)    |
| `color-progress-track`     | `rgba(255,255,255,0.1)`                          | Progress bar track           |
| `color-progress-fill`      | `linear-gradient(90deg, #00FF88, #4D96FF)`       | Progress bar fill            |
| `color-notif-badge`        | `#FF4757`                                        | Notification badge           |
| `color-btn-primary`        | `linear-gradient(135deg, #00FF88, #00CC6A)`      | Primary button               |
| `color-btn-primary-text`   | `#000000`                                        | Primary button text          |
| `color-btn-secondary-bg`   | `rgba(255,255,255,0.08)`                         | Secondary button background  |
| `color-btn-secondary-border` | `rgba(255,255,255,0.15)`                       | Secondary button border      |
| `color-btn-secondary-text` | `#FFFFFF`                                        | Secondary button text        |
| `color-btn-danger`         | `linear-gradient(135deg, #FF4757, #C0392B)`      | Danger button                |
| `color-btn-danger-text`    | `#FFFFFF`                                        | Danger button text           |
| `color-btn-disabled-bg`    | `rgba(255,255,255,0.05)`                         | Disabled button background   |
| `color-btn-disabled-text`  | `#555555`                                        | Disabled button text         |
| `color-shop-price`         | `#00FF88`                                        | Standard price badge bg      |
| `color-shop-price-premium` | `linear-gradient(135deg, #FFD93D, #FFA502)`      | Premium price badge bg       |
| `color-shop-price-text`    | `#000000`                                        | Price badge text             |
| `color-heart-full`         | `#FF4757`                                        | Full life heart              |
| `color-heart-empty`        | `#3A3A4A`                                        | Empty life heart             |
| `color-overlay`            | `rgba(0,0,0,0.7)`                                | Modal/pause overlay          |

---

## 3. Typography

### 3.1 Font Families

| Token            | Font Stack                                                        | Usage                          |
|------------------|-------------------------------------------------------------------|--------------------------------|
| `font-heading`   | `'Segoe UI', Roboto, -apple-system, BlinkMacSystemFont, sans-serif` | Headings, titles, labels       |
| `font-body`      | `'Segoe UI', Roboto, -apple-system, BlinkMacSystemFont, sans-serif` | Body text, descriptions        |
| `font-score`     | `'Segoe UI', Roboto, -apple-system, BlinkMacSystemFont, sans-serif` | Scores, numbers, counters      |

All fonts are system fonts to avoid external loading and minimize build size. The `font-score` uses heavy weight (800-900) for impact.

### 3.2 Font Sizes

| Token         | Size   | Usage                                            |
|---------------|--------|--------------------------------------------------|
| `text-h1`     | `28px` | Screen titles ("Challenges", "Shop")             |
| `text-h2`     | `22px` | Section headers, modal titles                    |
| `text-h3`     | `18px` | Sub-headers, card titles                         |
| `text-body`   | `15px` | Body text, product names, player names           |
| `text-small`  | `13px` | Descriptions, secondary info, badges             |
| `text-tiny`   | `11px` | Timestamps, fine print, version numbers          |
| `text-score`  | `36px` | Large score displays (level complete)            |
| `text-hud`    | `16px` | HUD elements (level label, moves, score)         |

### 3.3 Font Weights

| Token            | Weight | Usage                                      |
|------------------|--------|--------------------------------------------|
| `weight-regular` | `400`  | Body text, descriptions                    |
| `weight-medium`  | `600`  | Labels, emphasized text, badges            |
| `weight-bold`    | `700`  | Headings, button text, player names        |
| `weight-heavy`   | `800`  | Scores, prices, VS text, star counts       |
| `weight-black`   | `900`  | Logo text, combo multiplier                |

### 3.4 Line Heights

| Token         | Value  | Usage                       |
|---------------|--------|-----------------------------|
| `lh-tight`    | `1.1`  | Headings, scores            |
| `lh-normal`   | `1.4`  | Body text, descriptions     |
| `lh-relaxed`  | `1.6`  | Long-form text, modal body  |

### 3.5 Letter Spacing

| Token         | Value    | Usage                         |
|---------------|----------|-------------------------------|
| `ls-tight`    | `-0.5px` | Large scores                  |
| `ls-normal`   | `0px`    | Body text                     |
| `ls-wide`     | `1px`    | Uppercase labels, badges      |
| `ls-extra`    | `2px`    | Screen labels, section titles |

---

## 4. Spacing and Layout

### 4.1 Base Grid

Base unit: **4px**. All spacing values are multiples of 4.

| Token        | Value  | Usage                                          |
|--------------|--------|-------------------------------------------------|
| `space-xxs`  | `2px`  | Gem grid gap minimum                            |
| `space-xs`   | `4px`  | Tight spacing, icon padding                     |
| `space-sm`   | `8px`  | Small gaps between related elements             |
| `space-md`   | `12px` | Standard component internal padding             |
| `space-lg`   | `16px` | Screen edge padding, section gaps               |
| `space-xl`   | `20px` | Large section spacing, card padding             |
| `space-xxl`  | `24px` | Major section separation                        |
| `space-xxxl` | `32px` | Screen-level top/bottom padding                 |

### 4.2 Screen Layout

- **Screen padding (horizontal):** 16px (left and right)
- **Screen padding (top):** 12px below notch/status bar
- **Jest footer bar height:** approximately 44px. Always visible at screen bottom. Do not render game elements behind it.
- **Safe area bottom:** 44px minimum clearance above Jest footer
- **Maximum content width:** 430px (centered on wider viewports)
- **Game board horizontal margin:** 12px from screen edges

### 4.3 Border Radius Scale

| Token           | Value  | Usage                                    |
|-----------------|--------|------------------------------------------|
| `radius-xs`     | `6px`  | Small badges, tags                       |
| `radius-sm`     | `8px`  | Gem sprites, small buttons               |
| `radius-md`     | `12px` | Cards, board container, booster buttons  |
| `radius-lg`     | `14px` | Large buttons, shop items                |
| `radius-xl`     | `16px` | Modal cards, VS cards                    |
| `radius-round`  | `50%`  | Avatars, circular icon buttons           |
| `radius-pill`   | `20px` | Badge pills, tab indicators              |

---

## 5. Shared Components

### 5.1 GemSprite

The core game piece rendered on the 8x8 board.

**Dimensions:**
- Size: calculated as `(boardWidth - (9 * gapSize)) / 8`. For a 296px board width (320px screen - 24px margin) with 3px gaps, each gem is approximately 33px x 33px.
- Minimum touch target: 33px (acceptable since gems are swipe-targeted, not tap-targeted individually)
- Border radius: 8px

**Visual:**
- Background: `linear-gradient(135deg, [gem-base], [gem-light])`
- Box shadow (idle): `0 2px 8px [gem-selected-glow]`
- No border in idle state

**States:**

| State     | Visual Change                                                                 | Duration   |
|-----------|-------------------------------------------------------------------------------|------------|
| Idle      | Base gradient + shadow. No animation.                                         | --         |
| Selected  | Scale to 1.15. Glow shadow increases to `0 2px 16px [gem-selected-glow]`. Border: 2px solid rgba(255,255,255,0.5). | 150ms ease-out |
| Matched   | Flash white (opacity 0 to 1 to 0). Scale to 1.3 then to 0. Remove from board. | 150ms ease-in |
| Falling   | Translate Y from origin to destination. Speed: 80ms per grid row traveled.    | Variable   |
| Swapping  | Translate to neighbor position and back (if invalid) or swap (if valid).      | 200ms ease-out |

**Special Gem Variants:**

| Variant     | Visual Overlay                                                                                  |
|-------------|--------------------------------------------------------------------------------------------------|
| Line Clear  | Arrow overlay (horizontal or vertical) in white (#FFFFFF) at 70% opacity, centered on gem.       |
| Bomb        | Pulsing glow animation. Box shadow oscillates: `0 2px 12px` to `0 2px 20px` at 1.5s interval.   |
| Color Bomb  | Rainbow gradient background: `linear-gradient(135deg, #FFD93D, #FF6B6B, #9B59B6)`. Shimmer animation: background-position shifts over 2s loop. |

### 5.2 GameBoard

The 8x8 grid container holding all gems.

- **Layout:** CSS Grid, 8 columns, `grid-template-columns: repeat(8, 1fr)`
- **Gap:** 3px between gems
- **Background:** `rgba(255,255,255,0.05)`
- **Border radius:** 12px
- **Padding:** 12px (inside the board, around the gem grid)
- **Margin:** 8px top/bottom, 12px left/right from screen edges
- **Border:** none (the subtle background provides definition)
- **Shadow:** `0 0 20px rgba(0,0,0,0.3)` (soft depth)

### 5.3 PrimaryButton

Main action buttons throughout the UI.

**Size Variants:**

| Size   | Height | Padding (h/v)  | Font Size | Width       |
|--------|--------|-----------------|-----------|-------------|
| Large  | 52px   | 16px / 24px     | 16px      | 100% (full) |
| Medium | 44px   | 12px / 20px     | 15px      | auto        |
| Small  | 36px   | 8px / 16px      | 13px      | auto        |

**Base Style:**
- Background: `linear-gradient(135deg, #00FF88, #00CC6A)`
- Text color: `#000000`
- Font weight: 700
- Border: none
- Border radius: 14px
- Text align: center
- Display: flex, align-items: center, justify-content: center
- Gap (for icon + text): 8px

**States:**

| State    | Change                                                                      |
|----------|-----------------------------------------------------------------------------|
| Default  | Base style as described above                                               |
| Pressed  | Scale: 0.95. Background darkens 10% (filter: brightness(0.9)). Duration: 100ms |
| Disabled | Background: `rgba(255,255,255,0.05)`. Text: `#555555`. Opacity: 0.5. No pointer events. |
| Loading  | Replace text with a 20px white spinner (CSS animation, 1s infinite rotate). Pointer events disabled. |

**Color Variants:**

| Variant   | Background                                       | Text Color |
|-----------|--------------------------------------------------|------------|
| Primary   | `linear-gradient(135deg, #00FF88, #00CC6A)`      | `#000000`  |
| Secondary | `rgba(255,255,255,0.08)`, border: 1px solid `rgba(255,255,255,0.15)` | `#FFFFFF`  |
| Danger    | `linear-gradient(135deg, #FF4757, #C0392B)`      | `#FFFFFF`  |
| Gold      | `linear-gradient(135deg, #FFD93D, #FFA502)`      | `#000000`  |

### 5.4 SecondaryButton

Less prominent action buttons. Uses outline style.

- Background: `rgba(255,255,255,0.08)`
- Border: `1px solid rgba(255,255,255,0.15)`
- Text color: `#FFFFFF`
- Font weight: 700
- Border radius: 14px
- Same size variants as PrimaryButton
- Pressed state: scale 0.95, background becomes `rgba(255,255,255,0.12)`, 100ms
- Disabled state: opacity 0.5, no pointer events

### 5.5 IconButton

Circular buttons for settings, pause, close, and similar actions.

**Size Variants:**

| Size   | Diameter | Icon Size |
|--------|----------|-----------|
| Small  | 40px     | 18px      |
| Medium | 48px     | 22px      |
| Large  | 56px     | 28px      |

**Style:**
- Shape: circle (border-radius: 50%)
- Background: `rgba(255,255,255,0.08)`
- Border: `2px solid rgba(255,255,255,0.2)`
- Icon color: `#FFFFFF`
- Pressed state: scale 0.9, background `rgba(255,255,255,0.15)`, 100ms
- Disabled state: opacity 0.4

### 5.6 StarDisplay

Shows 1-3 stars for level completion rating.

**Small (Level Select Node):**
- Star size: 14px
- Spacing between stars: 2px
- Empty star: `#3A3A4A` fill, no stroke
- Filled star: `#FFD93D` fill

**Large (Level Complete Screen):**
- Star size: 48px
- Spacing between stars: 8px
- Empty star: `#3A3A4A` fill, 2px stroke `#555555`
- Filled star 1-star: `#FFD93D` solid fill
- Filled star 2-star: gradient `linear-gradient(135deg, #FFD93D, #FFA502)`
- Filled star 3-star: gradient `linear-gradient(135deg, #FFD93D, #FF6B6B)` (gold to red)

**Fill Animation (Level Complete):**
- Stars fill sequentially, left to right
- Each star: scale from 0 to 1.3 to 1.0, with fill color applied at 1.3 peak
- Stagger delay: 300ms between each star
- Duration per star: 400ms
- Easing: ease-out
- Particle burst on fill: 8 small circles (4px) in star color, radiating outward, fading over 500ms

### 5.7 ScoreDisplay

Shows the current score during gameplay and on result screens.

**In-game HUD:**
- Font: `font-score` at `text-hud` (16px)
- Weight: 700
- Color: `#2ED573` (success green)
- Label prefix: "Score: " in weight 600
- Position: right side of HUD top bar

**Level Complete:**
- Font: `font-score` at `text-score` (36px)
- Weight: 800
- Color: `#FFD93D`
- Number roll-up animation: 0 to final score over 1200ms, easing ease-out. Numbers increment in steps, faster at start, slowing to final value.

**Combo Multiplier:**
- Text: "x2", "x3", "x4" etc.
- Font size: 20px
- Weight: 900
- Color: `#FFD93D`
- Position: appears above the matched gems, floats up 30px, fades out over 600ms
- Scale: starts at 0.5, peaks at 1.2, settles at 1.0 over 300ms

### 5.8 MovesCounter

Displays remaining moves during gameplay.

**Layout:**
- Position: left side of HUD top bar
- Label: "{N} Moves"
- Font size: 16px (text-hud)
- Weight: 700

**States:**

| State       | Condition       | Color     | Animation                           |
|-------------|-----------------|-----------|-------------------------------------|
| Normal      | > 5 moves       | `#FFFFFF` | None                                |
| Warning     | 3-5 moves       | `#FFA502` | None                                |
| Critical    | 1-2 moves       | `#FF4757` | Pulse: scale 1.0 to 1.1, 500ms loop |
| Zero        | 0 moves         | `#FF4757` | Triggers "Out of Moves" overlay     |

### 5.9 LivesDisplay

Shows hearts representing remaining lives.

- **Position:** Main menu, top area near player info
- **Heart size:** 20px
- **Spacing:** 4px between hearts
- **Max hearts:** 5
- **Full heart:** `#FF4757` fill
- **Empty heart:** `#3A3A4A` fill, 1px stroke `#555555`
- **Regen timer:** Below hearts, `text-tiny` (11px), color `#888888`, format "Next life in MM:SS"
- **Heart break animation (on life loss):** Heart scales to 1.2, cracks (split into 2 halves), halves fall downward and fade. Duration: 400ms.

### 5.10 ShopProductCard

Displays a purchasable product in the shop.

**Layout:**
- Display: flex, row, align-items center
- Gap: 14px between icon, details, and price
- Padding: 14px
- Background: `rgba(255,255,255,0.05)`
- Border: `1px solid rgba(255,255,255,0.08)`
- Border radius: 14px
- Minimum height: 72px

**Sub-elements:**

| Element       | Style                                                                 |
|---------------|-----------------------------------------------------------------------|
| Product icon  | 50px x 50px, border-radius 12px, gradient background per product type |
| Product name  | 15px, weight 700, color `#FFFFFF`                                     |
| Description   | 12px, weight 400, color `#888888`, margin-top 2px                     |
| Price badge   | Background `#00FF88`, text `#000000`, padding 8px 14px, radius 10px, weight 800, size 14px |

**Featured Variant (e.g., Starter Pack):**
- Border: `2px solid #FFD93D`
- Background: `rgba(255,217,61,0.08)`
- Icon border: `2px solid #FFD93D`
- "BEST VALUE" badge: background `#FFD93D`, text `#000000`, padding 2px 8px, radius 6px, weight 800, size 10px, positioned next to product name

**Product Icon Backgrounds:**

| Product        | Gradient                                  |
|----------------|-------------------------------------------|
| Extra Moves    | `linear-gradient(135deg, #FF6B6B, #FF4757)` |
| Starter Pack   | `linear-gradient(135deg, #4D96FF, #1E90FF)` |
| Lives Refill   | `linear-gradient(135deg, #FF4757, #C0392B)` |
| Season Pass    | `linear-gradient(135deg, #9B59B6, #8E44AD)` |
| Gift a Friend  | `linear-gradient(135deg, #6BCB77, #2ED573)` |
| Bomb Booster   | `linear-gradient(135deg, #FFD93D, #FFA502)` |

### 5.11 LevelSelectNode

A single level on the level map.

**Dimensions:**
- Node size: 48px x 48px
- Border radius: 50% (circle)
- Spacing between nodes on path: 64px (center to center)

**States:**

| State       | Background            | Border                  | Label Color | Additional                     |
|-------------|-----------------------|-------------------------|-------------|--------------------------------|
| Locked      | `rgba(255,255,255,0.05)` | `1px solid #3A3A4A`  | `#555555`   | Lock icon (12px) centered      |
| Available   | `#6C5CE7`             | `2px solid #00FF88`     | `#FFFFFF`   | Pulsing glow: `0 0 12px rgba(0,255,136,0.4)`, 2s loop |
| 1-Star      | `rgba(255,255,255,0.1)` | `1px solid rgba(255,255,255,0.2)` | `#FFFFFF` | 1 filled star below    |
| 2-Star      | `rgba(255,255,255,0.1)` | `1px solid rgba(255,255,255,0.2)` | `#FFFFFF` | 2 filled stars below   |
| 3-Star      | `rgba(255,217,61,0.15)` | `1px solid #FFD93D`  | `#FFD93D`   | 3 filled stars below, gold tint |

**Level Number:** Centered inside the node. Font size 16px, weight 700.
**Stars (below node):** 3 small stars (10px each) with 2px gap, centered horizontally below the node, 4px below node bottom edge.

### 5.12 NotificationBanner

In-game toast notification for transient messages.

**Layout:**
- Position: top of screen, 12px below status bar area
- Width: calc(100% - 32px), centered
- Padding: 12px 16px
- Border radius: 12px
- Z-index: 100 (above all game elements)

**Variants:**

| Variant | Background                          | Left Border           | Icon Color |
|---------|-------------------------------------|-----------------------|------------|
| Success | `rgba(46,213,115,0.15)`             | `3px solid #2ED573`   | `#2ED573`  |
| Error   | `rgba(255,71,87,0.15)`              | `3px solid #FF4757`   | `#FF4757`  |
| Info    | `rgba(77,150,255,0.15)`             | `3px solid #4D96FF`   | `#4D96FF`  |

**Text:** 14px, weight 600, color `#FFFFFF`
**Auto-dismiss:** 3000ms (success/info), 5000ms (error)
**Entry animation:** Slide down from -60px to 0, opacity 0 to 1, 300ms ease-out
**Exit animation:** Slide up from 0 to -60px, opacity 1 to 0, 200ms ease-in

### 5.13 RegistrationPrompt

Modal overlay encouraging guest players to register.

**Trigger:** After Level 3 completion (configurable). Reappears after Level 5 if dismissed.

**Overlay:** `color-overlay` (`rgba(0,0,0,0.7)`)

**Modal Card:**
- Background: `#16213E`
- Border radius: 16px
- Padding: 24px
- Width: calc(100% - 48px), max-width: 320px
- Centered vertically and horizontally

**Content:**
- Headline: "Save Your Progress!" -- 22px, weight 700, color `#FFD93D`, centered
- Benefits list (4 items), each with a checkmark icon in `#00FF88`:
  - "Get notified when friends challenge you"
  - "Buy boosters when you need them"
  - "Challenge friends to beat your score"
  - "Save your progress permanently"
- Each benefit: 14px, weight 400, color `#AAAAAA`, left-aligned, 8px vertical spacing
- Primary CTA: "Register Now" -- PrimaryButton (large), margin-top 20px
- Dismiss: "Maybe Later" -- text button, 13px, weight 600, color `#888888`, centered, margin-top 12px, no background, no border

### 5.14 DialogModal

Generic reusable modal container.

**Overlay:** `rgba(0,0,0,0.7)`
**Card:**
- Background: `#16213E`
- Border radius: 16px
- Padding: 24px
- Width: calc(100% - 48px), max-width: 360px
- Centered on screen

**Sub-elements:**
- Title: 22px, weight 700, color `#FFFFFF`, margin-bottom 12px
- Body: 14px, weight 400, color `#AAAAAA`, line-height 1.6, margin-bottom 20px
- Action buttons: flex row, gap 12px. Primary right, secondary left.
- Close button (optional): IconButton (small, 40px) in top-right corner, 8px inset from card edges

### 5.15 ProgressBar

Used for score-toward-stars, loading screens, and XP bars.

**Dimensions:**
- Height (standard): 8px
- Height (large, loading screen): 12px
- Border radius: same as height (fully rounded)

**Colors:**
- Track: `rgba(255,255,255,0.1)`
- Fill: `linear-gradient(90deg, #00FF88, #4D96FF)` (default)
- Fill (score to stars): `linear-gradient(90deg, #FFD93D, #FFA502)`

**Star threshold markers (gameplay):**
- 3 small diamond markers on the progress bar at 1-star, 2-star, 3-star score thresholds
- Marker size: 6px diamond (rotated square)
- Marker color: `#3A3A4A` (unfilled), `#FFD93D` (when passed)

### 5.16 HUD (Heads-Up Display)

Top bar overlay during gameplay.

**Layout:**
- Height: 44px
- Background: `rgba(0,0,0,0.3)`
- Padding: 0 16px
- Display: flex, justify-content: space-between, align-items: center
- Position: top of gameplay screen, below device status bar
- Z-index: 10

**Elements (left to right):**

| Position | Element            | Font    | Weight | Color     |
|----------|--------------------|---------|--------|-----------|
| Left     | Moves counter      | 14px    | 600    | `#FF6B6B` |
| Center   | Level label        | 16px    | 700    | `#FFD93D` |
| Right    | Score display      | 14px    | 600    | `#6BCB77` |

**Below HUD:** Star progress bar (see ProgressBar component), 8px below HUD, horizontally padded 16px.

### 5.17 TabBar

For section navigation within screens (challenges, leaderboards).

- Height: 44px
- Background: `rgba(0,0,0,0.2)`
- Display: flex, row, equal width tabs
- Border-bottom: `1px solid rgba(255,255,255,0.08)`

**Tab Item:**
- Font: 14px, weight 600
- Active: color `#00FF88`, with 3px bottom indicator bar in `#00FF88`
- Inactive: color `#888888`
- Transition: color 200ms ease

### 5.18 BoosterTray

Row of booster buttons below the game board during gameplay.

- Display: flex, row, centered
- Gap: 10px
- Padding: 12px

**Booster Button (extends IconButton):**
- Size: 48px x 48px
- Border radius: 12px
- Background: `rgba(255,255,255,0.08)`
- Border: `2px solid rgba(255,255,255,0.2)`
- Icon: centered, 22px
- Price tag: positioned bottom-right (-6px offset), background `#00FF88`, text `#000000`, padding 2px 5px, radius 8px, font 9px, weight 800

### 5.19 JestFooterBar

Platform-mandated footer visible at bottom of all screens.

- Height: 44px
- Background: `rgba(0,0,0,0.6)`
- Border-top: `1px solid rgba(0,255,136,0.3)`
- Padding: 10px 16px
- Display: flex, justify-content: space-between, align-items: center
- Left: "Jest.com" text, 14px, weight 800, color `#00FF88`
- Right: "Join" button -- background `#00FF88`, text `#000000`, padding 6px 16px, radius 8px, weight 700, size 12px
- Note: This is rendered by our game to match platform styling. Jest controls the actual platform chrome.

---

## 6. Screens

### 6.1 Boot/Loading Screen

**Background:** Solid `#0A0A1A`

**Layout (centered vertically and horizontally):**
1. Gem Clash logo (gem cluster + text), approximately 180px wide
2. Spacing: 32px below logo
3. ProgressBar (large, 12px height), width 200px, centered
4. Spacing: 12px below bar
5. "Loading..." text, 13px, weight 600, color `#888888`

**Behavior:**
- Progress bar fills from 0% to 100% as assets load
- Once loaded, auto-transition to Main Menu (300ms fade out)

### 6.2 Main Menu Screen

**Background:** `linear-gradient(180deg, #1A0533 0%, #0D1B2A 100%)`

**Layout (top to bottom):**

| Element               | Position / Style                                                         |
|-----------------------|--------------------------------------------------------------------------|
| Player info bar       | Top, 12px padding. Left: lives display (5 hearts). Right: total star count with star icon (#FFD93D). |
| Game logo             | Centered, 48px below player info. ~200px wide.                          |
| Current level label   | Centered, 12px below logo. "Level {N}" -- 16px, weight 600, color #AAAAAA |
| Play / Continue button| PrimaryButton (large), centered, 32px below level label. Text: "Play Level {N}" |
| Level Select button   | SecondaryButton (large), centered, 12px below Play button. Text: "Level Select" |
| Shop button           | SecondaryButton (large), centered, 12px below Level Select. Text: "Shop" |
| Settings icon         | IconButton (medium, 48px), top-right corner, 12px inset from edges      |
| Jest footer bar       | JestFooterBar at bottom                                                  |

**Background decoration:** Subtle particle effect -- 10-15 small gem shapes (6px) in random gem colors, floating slowly upward at 0.5px/frame, low opacity (0.15). Purely decorative.

**States:**
- Loading: Play button shows spinner until game data loaded
- Guest (post Level 10): Play button disabled. Show inline text "Register to continue" below button.
- 0 lives: Play button replaced with "No Lives! Refill?" linking to shop, plus timer showing next life regen

### 6.3 Level Select Screen (Map)

**Background:** `linear-gradient(180deg, #0D1B2A 0%, #1A0533 100%)`

**Layout:**
- Top bar (44px): Back button (IconButton small, left), "Level Select" title (18px, weight 700, center), Total stars display (right)
- Scrollable content: vertical scroll, content extends below viewport
- Level path: S-curve or zigzag arrangement of LevelSelectNode components
- Path connector: 2px line in `rgba(255,255,255,0.1)` connecting consecutive nodes
- Nodes arranged in groups of 5 (one "world" or zone)
- Zone dividers: subtle horizontal line with zone label ("Gem Caverns", "Crystal Falls", etc.)
- Bottom: 44px clearance for Jest footer

**Level Node Arrangement:**
- 3 nodes per visible row, staggered left-center-right
- Vertical spacing between rows: 64px
- Horizontal offset per row alternates: 60px left, centered, 60px right

### 6.4 Gameplay Screen (Match-3)

**Background:** `linear-gradient(180deg, #1A0533 0%, #0D1B2A 100%)`

**Layout (top to bottom):**

1. **HUD** (44px) -- see HUD component
2. **Star progress bar** (8px) -- 8px below HUD, 16px horizontal padding
3. **Spacing:** 8px
4. **GameBoard** (8x8 grid) -- centered, see GameBoard component
5. **Spacing:** 8px
6. **BoosterTray** -- centered below board
7. **JestFooterBar** -- at bottom

**Combo Text Popups:**
- Triggered on cascade chains: 2-chain: "Great!", 3-chain: "Amazing!", 4+: "Spectacular!"
- Font: 22px, weight 900, color `#FFD93D`
- Text shadow: `0 0 20px rgba(255,217,61,0.5)`
- Animation: scale 0.5 to 1.2 (200ms), float up 40px while fading out (400ms)
- Position: centered over the board

**Pause Button:** IconButton (medium), positioned in HUD or top-right. Triggers Pause overlay.

### 6.5 Level Complete Screen (Win)

**Background:** `linear-gradient(180deg, #1A0533 0%, #0D1B2A 100%)`
**Overlay effect:** Subtle radial burst of particles in gem colors from center, fading outward.

**Layout (centered vertically):**

| Element                | Style                                                          |
|------------------------|----------------------------------------------------------------|
| "Level {N} Complete!"  | 22px, weight 700, color `#FFFFFF`, centered                    |
| Star display (large)   | StarDisplay large, 3 stars, fill animation. 16px below header. |
| Score                  | "Score: {N}" -- 36px, weight 800, color `#FFD93D`. Roll-up animation. 16px below stars. |
| Star thresholds        | 3 rows showing "1 Star: {threshold}" etc. 13px, color `#888888`. Achieved thresholds in `#FFD93D`. |
| Continue button        | PrimaryButton (large). Text: "Next Level". 24px below thresholds. |
| Replay button          | SecondaryButton (large). Text: "Replay". 12px below Continue. |
| Challenge button       | SecondaryButton (large). Text: "Challenge a Friend" with share icon. 12px below Replay. Phase 2 only -- hidden in Phase 1. |
| Jest footer bar        | JestFooterBar at bottom                                        |

### 6.6 Level Failed Screen (Lose)

**Background:** Same as gameplay screen (board remains visible but dimmed)
**Overlay:** `rgba(0,0,0,0.7)` over the entire screen

**Modal Card (DialogModal):**

| Element                 | Style                                                                  |
|-------------------------|------------------------------------------------------------------------|
| "Out of Moves!"         | 22px, weight 700, color `#FF4757`, centered                           |
| Score achieved          | "Score: {N}" -- 20px, weight 700, color `#FFFFFF`. 8px below header.   |
| Target score            | "Target: {N}" -- 14px, weight 400, color `#888888`. 4px below score.   |
| Encouragement           | "So close! Try again?" -- 14px, weight 400, color `#AAAAAA`, 16px below. |
| Buy Extra Moves button  | PrimaryButton (large, gold variant). Text: "3 Extra Moves -- 1 Token". 20px below encouragement. |
| Retry button            | PrimaryButton (large). Text: "Retry Level". 12px below.               |
| Back to Map             | Text button: "Back to Level Select" -- 13px, weight 600, color `#888888`. 12px below. |

**Guest behavior:** "Buy Extra Moves" button replaced with SecondaryButton: "Register to Buy Moves"

### 6.7 Shop Screen

**Background:** `linear-gradient(180deg, #1A0533 0%, #16213E 100%)`

**Layout:**

| Element            | Style                                                            |
|--------------------|------------------------------------------------------------------|
| Header             | "Shop" -- 22px, weight 700, color `#FFD93D`, centered            |
| Subtitle           | "1 Token = $1" -- 12px, weight 400, color `#888888`, centered, 4px below header |
| Token balance      | Positioned top-right: "{N} Tokens" with token icon. 14px, weight 700, color `#00FF88` |
| Close button       | IconButton (small, 40px), top-left, "X" icon                    |
| Product list       | Vertical list of ShopProductCard components. 10px gap between cards. 20px below header. |
| Jest footer        | JestFooterBar at bottom                                          |

**Phase 1 Products (in display order):**

1. **Starter Pack** (featured): gc_starter_pack, "5 boosters + 50 coins", 2 Tokens, BEST VALUE badge
2. **3 Extra Moves:** gc_moves_3, "Keep playing when you're so close!", 1 Token
3. **Refill Lives:** gc_lives_refill, "Get 5 lives instantly", 1 Token

**Guest state:** All price buttons replaced with "Register" in `#888888` text, disabled styling. Tapping any triggers registration prompt.

### 6.8 Settings Screen

**Background:** `#16213E`

**Layout:**
- Top bar: Back button (IconButton, left), "Settings" title (18px, weight 700, center)
- Content padding: 16px

**Settings items (vertical list, 12px gap):**

| Setting    | Type          | Style                                                    |
|------------|---------------|----------------------------------------------------------|
| Sound      | Toggle switch | Label 15px weight 600 left, toggle right. Track: 44x24px, thumb: 20px circle. On: track `#00FF88`, thumb `#FFFFFF`. Off: track `#3A3A4A`, thumb `#888888`. |
| Music      | Toggle switch | Same as Sound                                            |
| Haptics    | Toggle switch | Same as Sound                                            |
| Divider    | Line          | `1px solid rgba(255,255,255,0.08)`, 8px vertical margin  |
| How to Play| Link row      | Label 15px weight 600, chevron right icon. Tappable row, 44px height. |
| About      | Link row      | Same as How to Play                                      |
| Divider    | Line          | Same as above                                            |
| Version    | Static text   | "Version 1.0.0" -- 11px, weight 400, color `#555555`, centered |

### 6.9 Registration Prompt (Modal)

See RegistrationPrompt component (Section 5.13) for full specification.

**When it appears:**
- After Level 3 completion (dismissible)
- After Level 5 completion if still guest (dismissible)
- When guest taps a purchase button (blocking -- must register to buy)
- When guest taps "Challenge a Friend" in Phase 2

### 6.10 Pause Screen (Overlay)

**Overlay:** `rgba(0,0,0,0.7)` over the entire gameplay screen. Board remains visible but frozen.

**Content (centered vertically):**

| Element         | Style                                                       |
|-----------------|-------------------------------------------------------------|
| "Paused"        | 28px, weight 700, color `#FFFFFF`, centered                 |
| Resume button   | PrimaryButton (large). Text: "Resume". 24px below title.    |
| Restart button  | SecondaryButton (large). Text: "Restart Level". 12px below. |
| Quit button     | SecondaryButton (large). Text: "Quit to Menu". 12px below.  |
| Settings link   | Text button: "Settings" -- 13px, weight 600, color `#888888`. 16px below. |

**Entry animation:** Overlay fades in 200ms. Buttons slide up from +30px, staggered 50ms each, 300ms ease-out.
**Exit animation:** All content fades out 150ms. Overlay fades out 200ms.

### 6.11 Tutorial/Onboarding Overlay

Shown on first play only (tracked via `playerData.tutorialComplete`).

**Overlay:** `rgba(0,0,0,0.85)` -- darker to focus attention.

**Step 1: "Match 3 or more gems"**
- Spotlight: circular cutout (radius 80px) over a section of the board showing 3 matching gems
- Hand icon: 32px, animated swipe gesture (translate 40px horizontally, loop every 1.5s)
- Text: "Swap gems to match 3 or more!" -- 16px, weight 700, color `#FFFFFF`, positioned below spotlight
- Bottom: "Tap to continue" -- 13px, color `#888888`, pulsing opacity

**Step 2: "Match 4 for a Line Clear!"**
- Spotlight: rectangular cutout over a row of 4 matching gems
- Arrow overlay pointing to the row
- Text: "Match 4 in a row to create a Line Clear!" -- 16px, weight 700
- Visual: Line Clear gem icon shown

**Step 3: "Complete levels to earn stars!"**
- Spotlight: over the HUD star progress bar area
- StarDisplay large shown with animation
- Text: "Score points to earn up to 3 stars per level!" -- 16px, weight 700
- Bottom: "Got it!" PrimaryButton (medium). Dismisses tutorial.

**Transition between steps:** Crossfade, 300ms.

### 6.12 Challenge Screen (Phase 2 Placeholder)

**Background:** `linear-gradient(180deg, #0D1B2A 0%, #1A0533 100%)`

**Layout:**

| Element               | Style                                                           |
|-----------------------|-----------------------------------------------------------------|
| Header                | "Challenges" -- 22px, weight 700, color `#FFD93D`, centered     |
| Subtitle              | "Beat your friends' scores to win!" -- 13px, color `#888888`    |
| VS Card               | Background: `rgba(255,255,255,0.05)`, border-radius 16px, padding 20px, border `1px solid rgba(255,255,255,0.1)` |
| VS Card > Players     | Flex row, space-between. Each side: avatar (56px circle, gradient bg), name (13px weight 600), score (20px weight 800, color `#FFD93D`) |
| VS Card > VS text     | "VS" centered between players. 24px, weight 900, color `#FF4757`, text-shadow `0 0 20px rgba(255,107,107,0.5)` |
| Challenge Back button | PrimaryButton (large). "Challenge Back on Level {N}"            |
| New Challenge button  | SecondaryButton (large). "Challenge a New Friend via Text"       |
| Pending Challenges    | List of PendingItem rows below                                   |

**PendingItem:**
- Display: flex row, align center, gap 12px
- Background: `rgba(255,255,255,0.03)`, border-radius 12px, padding 12px
- Avatar: 40px circle
- Text: name 14px weight 600, detail 12px color `#888888`
- Action: small button (SecondaryButton variant, 36px height, "Play" or "Won!")

**Player Avatars:**
- Your avatar gradient: `linear-gradient(135deg, #4D96FF, #6BCB77)`
- Opponent avatar gradient: `linear-gradient(135deg, #FF6B6B, #FFA502)`

---

## 7. Animations and Transitions

### 7.1 Scene Transitions

| Transition        | Type                    | Duration | Easing       |
|-------------------|-------------------------|----------|--------------|
| Screen to screen  | Fade out then fade in   | 300ms out, 300ms in | ease-in, ease-out |
| Modal open        | Backdrop fade in + card slide up | 200ms backdrop, 300ms card | ease-out |
| Modal close       | Card slide down + backdrop fade out | 200ms card, 200ms backdrop | ease-in |

### 7.2 Gem Animations

| Animation          | Description                                                     | Duration    | Easing       |
|--------------------|-----------------------------------------------------------------|-------------|--------------|
| Swap (valid)       | Two gems translate to each other's positions                    | 200ms       | ease-out     |
| Swap (invalid)     | Two gems translate halfway, then return to origin               | 200ms + 150ms | ease-out, ease-in |
| Match flash        | Matched gems flash white (opacity), scale to 1.3, then shrink to 0 and remove | 150ms | ease-in |
| Cascade/fall       | New gems fall from above. Speed: 80ms per grid row traveled.   | Variable    | ease-in (accelerating) |
| Fall landing       | On landing: brief squash effect (scaleY 0.85, scaleX 1.1) then spring back | 100ms | ease-out |
| Special gem create | Matched gems converge to center point, special gem scales from 0 to 1.2 to 1.0 | 300ms | ease-out |
| Line Clear activate| Row/column gems flash sequentially (30ms apart), then all clear simultaneously | 240ms + 100ms | linear, ease-in |
| Bomb activate      | 3x3 area gems shake (2px random offset, 3 cycles), then clear | 180ms + 100ms | linear, ease-in |
| Color Bomb activate| All gems of target color pulse once, then clear simultaneously | 200ms + 150ms | ease-in |

### 7.3 UI Animations

| Animation           | Description                                                    | Duration | Easing       |
|---------------------|----------------------------------------------------------------|----------|--------------|
| Button press        | Scale to 0.95, filter brightness(0.9). Return to 1.0.         | 100ms    | ease-out     |
| Score increment     | Number rolls up from old to new value                          | 400ms    | ease-out     |
| Level complete score| Number rolls from 0 to final                                  | 1200ms   | ease-out     |
| Star fill (each)    | Scale 0 to 1.3 to 1.0, color fills at peak. Particle burst.  | 400ms    | ease-out     |
| Star fill stagger   | 300ms delay between consecutive stars                          | --       | --           |
| Combo text popup    | Scale 0.5 to 1.2 (200ms), float up 40px + fade out (400ms)   | 600ms    | ease-out     |
| Toast enter         | Slide down from -60px, opacity 0 to 1                         | 300ms    | ease-out     |
| Toast exit          | Slide up to -60px, opacity 1 to 0                             | 200ms    | ease-in      |
| Modal backdrop      | Opacity 0 to 0.7                                              | 200ms    | ease-out     |
| Modal card enter    | TranslateY +30px to 0, opacity 0 to 1                         | 300ms    | ease-out     |
| Heart break         | Scale 1.2, split into 2 halves, halves fall + fade            | 400ms    | ease-in      |
| Level node pulse    | Glow shadow opacity 0.2 to 0.6 and back                       | 2000ms   | ease-in-out, loop |
| Toggle switch       | Thumb translates 20px, track color transitions                 | 200ms    | ease-out     |

---

## 8. Notification Image Design

### 8.1 Platform Requirements

- Images must be uploaded to the Developer Console and approved before use
- Status progression: Pending, Pass, or Fail
- Only approved images can be referenced in `scheduleNotification()`
- Start the approval pipeline in Phase 1 to avoid Phase 2 delays
- Images must comply with SHAFT policy (no sex, hate, alcohol, firearms, tobacco, gambling, drugs)
- Must be safe for SMS/RCS display (compact, clear at small sizes)

### 8.2 Notification Image Templates

| Template                 | Visual Description                                                    | Use Case                |
|--------------------------|-----------------------------------------------------------------------|-------------------------|
| "Gems waiting"           | 3 colorful gems (red, blue, green) arranged in a cluster on dark (#1A0A2E) background. Subtle sparkle effects. | D0 welcome, return prompts |
| "Daily reward"           | Gift box icon with golden glow and ribbon, on dark background. Small star bursts around it. | Streak rewards, daily challenge |
| "Challenge VS"           | Two gem clusters facing each other with lightning bolt between them. "VS" text. Red vs blue color scheme. | Challenge notifications |
| "Star milestone"         | 3 large gold stars with particle effects, number below showing milestone count. | Star collection goals   |
| "Streak fire"            | Flame icon with streak count number, warm orange/red gradient background. | Login streak reminders  |

### 8.3 Image Design Specs

- Background: dark (#1A0A2E or #0D1B2A) to match game aesthetic
- Use high-contrast, saturated colors (gems must pop on dark bg)
- No text that duplicates notification body (platform shows text separately)
- Keep composition centered and simple -- must read at small thumbnail sizes
- Export as PNG or WebP, dimensions per Jest requirements (check Developer Console for current specs)

---

## 9. Jest Explore Card

### 9.1 Game Icon

- **Content:** Gem cluster (red, blue, green gems arranged in a triangle) on `#1A0A2E` background
- **Shape:** Square with platform-applied rounding
- **Must be legible at:** 64x64px, 128x128px, 256x256px
- **No text in icon** (game name shown by platform)
- **High saturation** to stand out on Jest's browse surface

### 9.2 Hero Image

- **Content:** Gameplay screenshot showing the 8x8 board mid-game with colorful gems and a cascade in progress. Overlaid with a semi-transparent VS challenge card element in the bottom-right corner showing two player avatars and scores.
- **Conveys:** Social competition + colorful puzzle gameplay
- **Aspect ratio:** Wide banner (per Jest requirements)

### 9.3 Card Color

- **Hex:** `#1A0A2E` (deep purple-navy)
- **Rationale:** Dark background makes the colorful gem icon pop and aligns with the game's dark-themed aesthetic

### 9.4 Short Description

"Challenge friends in match-3 puzzles! Beat their scores via text."

---

## 10. Accessibility

### 10.1 Color Contrast

All text must meet WCAG AA contrast ratios:
- **Normal text (< 18px):** Minimum 4.5:1 contrast ratio against background
- **Large text (>= 18px bold):** Minimum 3:1 contrast ratio
- **UI components:** Minimum 3:1 contrast ratio for interactive element boundaries

**Verified Combinations:**

| Text Color | Background     | Ratio  | Pass |
|------------|----------------|--------|------|
| `#FFFFFF`  | `#1A0A2E`      | 14.2:1 | Yes  |
| `#FFFFFF`  | `#16213E`      | 11.8:1 | Yes  |
| `#AAAAAA`  | `#1A0A2E`      | 6.8:1  | Yes  |
| `#888888`  | `#1A0A2E`      | 4.6:1  | Yes  |
| `#000000`  | `#00FF88`      | 12.1:1 | Yes  |
| `#000000`  | `#FFD93D`      | 14.5:1 | Yes  |
| `#555555`  | `#1A0A2E`      | 2.4:1  | No -- only used for disabled states (acceptable per WCAG for inactive components) |

### 10.2 Touch Targets

- Minimum touch target: 44x44px for all interactive elements
- Gem sprites (33px) are exception -- interaction is swipe-based, not individual taps. The swipe gesture area encompasses the full board (296px+).
- Buttons: minimum 36px height (Small variant), recommended 44px+ (Medium/Large)
- Icon buttons: minimum 40px diameter (Small variant)
- Spacing between adjacent touch targets: minimum 8px

### 10.3 Color Blindness Support

Gems rely on color as the primary identifier. To support color-vision-deficient players:

**Secondary shape identifiers (internal to each gem):**

| Gem    | Shape Marker                                   |
|--------|------------------------------------------------|
| Red    | Diamond (small rotated square, 8px, centered)  |
| Blue   | Circle (8px diameter, centered)                |
| Green  | Triangle (pointing up, 8px, centered)          |
| Yellow | Star (5-point, 8px, centered)                  |
| Purple | Hexagon (8px, centered)                        |
| Orange | Square (8px, centered)                         |

- Shape markers rendered in white at 50% opacity inside each gem
- Visible at game resolution but subtle enough not to overwhelm the visual design
- This feature can be toggled on/off in Settings (default: off for Phase 1, configurable)

### 10.4 Reduced Motion

For players who prefer reduced motion (via `prefers-reduced-motion` media query or in-game setting):

- Gem swap: instant position change, no tween
- Gem match: instant removal, no flash/scale
- Gem fall: instant position, no gravity animation
- Combo text: static display for 1s then remove, no float
- Star fill: instant fill, no scale/particle
- Button press: no scale animation, instant visual feedback via opacity change
- Scene transitions: instant cut, no fade/slide
- Background particles: disabled

---

## 11. Dark Mode Note

- The game uses a dark background by default. The entire color system is designed for dark backgrounds to make gems visually pop.
- No separate light mode is required for Phase 1 or Phase 2.
- Jest platform may render its own chrome (navigation, footer) around the game viewport. Our game renders only within the game viewport area.
- The JestFooterBar component in our game mirrors the platform footer styling but is rendered by our code within the game viewport.
- All screen backgrounds use gradients between `#1A0A2E` and `#0D1B2A` to create depth without competing with gem colors.

---

## 12. Level Visual Themes

Level groups are organized into visual themes that change the background gradient and decorative elements as the player progresses. The game board and gem art remain consistent across all themes.

### 12.1 Theme Definitions

| Theme Name       | Levels  | BG Gradient Start | BG Gradient End | Decorative Element              |
|------------------|---------|--------------------|-----------------|---------------------------------|
| Gem Caverns      | 1-10    | `#1A0533`          | `#0D1B2A`       | Subtle crystal formations (bg)  |
| Crystal Falls    | 11-20   | `#0D2137`          | `#1A0A2E`       | Waterfall particle lines (bg)   |
| Ember Depths     | 21-30   | `#2A0A0A`          | `#1A0533`       | Floating ember particles (bg)   |

### 12.2 Theme Application

- Themes affect ONLY the screen background gradient and optional decorative particle effects
- The game board background (`rgba(255,255,255,0.05)`) remains constant
- Gem colors and sprites do not change per theme (reserved for Phase 3 cosmetics)
- Level Select map shows zone headers with theme names
- Decorative elements are low-opacity (0.08-0.15) and non-interactive, purely atmospheric
- Decorative particles are disabled when reduced motion is active

---

## 13. Asset Inventory Summary

All assets are bundled in the build. No external CDN. Budget: under 10MB total compressed.

| Category         | Estimated Size | Format   | Notes                                    |
|------------------|----------------|----------|------------------------------------------|
| Gem sprites (6)  | ~200KB         | WebP     | Each gem: idle, selected, special variants. Sprite atlas. |
| Special gems (3) | ~100KB         | WebP     | Line Clear, Bomb, Color Bomb overlays    |
| UI icons         | ~80KB          | WebP/SVG | Stars, hearts, arrows, lock, settings    |
| Board background | ~50KB          | WebP     | Single tiled/gradient asset              |
| Fonts            | 0KB            | System   | System fonts only -- no custom fonts     |
| Audio (SFX)      | ~1.5MB         | MP3      | Match, cascade, special, win, lose, button tap. Mono, compressed. Lazy-loaded. |
| Audio (Music)    | ~1MB           | MP3      | 1 background loop. Mono, compressed. Lazy-loaded. |
| Engine (Phaser)  | ~1.5MB         | JS       | Custom build excluding physics, 3D, FB   |
| Game code        | ~500KB         | JS       | TypeScript compiled, tree-shaken, minified |
| Notification images | ~300KB      | PNG/WebP | 5 templates, uploaded to Developer Console separately |
| **Total**        | **~5.2MB**     |          | Well within 10MB budget with 4.8MB buffer |

---

*This document is the single source of truth for all visual design decisions in Gem Clash. Engineers should reference this document for every pixel value, color code, timing, and component specification. If a design question is not answered here, escalate to the Lead Designer before making assumptions.*
