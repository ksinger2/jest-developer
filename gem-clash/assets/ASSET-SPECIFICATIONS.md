# Gem Link Asset Specifications

> **Owner:** Lead Designer
> **Status:** Ready for Asset Generation
> **Version:** 1.0 | **Date:** March 2026
> **Game:** Gem Link (formerly Gem Clash)
> **Platform:** Jest (jest.com) - HTML5 mobile webview
> **Engine:** Phaser 3 (WebGL/Canvas)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Gem Sprites](#2-gem-sprites)
3. [Special Gem Overlays](#3-special-gem-overlays)
4. [Board Background](#4-board-background)
5. [UI Elements](#5-ui-elements)
6. [Developer Console Assets](#6-developer-console-assets)
7. [Notification Images](#7-notification-images)
8. [File Naming Conventions](#8-file-naming-conventions)
9. [Export Settings](#9-export-settings)
10. [Sprite Atlas Configuration](#10-sprite-atlas-configuration)

---

## 1. Overview

### Build Size Budget
- **Total budget:** <10MB compressed
- **Asset budget:** ~2.5MB for all visual assets
- **Target formats:** WebP for game assets (smaller), PNG for Developer Console

### Resolution Strategy
- **Base resolution:** 64x64px for gems (scales down to 33x33px on small screens)
- **UI elements:** 2x assets for retina displays, scaled by Phaser
- **Viewport:** 390x844 base, RESIZE scale mode

### Color Space
- sRGB color space for all assets
- No ICC profiles embedded (reduces file size)

---

## 2. Gem Sprites

### 2.1 Gem Dimensions

| Property | Value |
|----------|-------|
| Canvas size | 64x64 px |
| Gem body | 56x56 px (centered, 4px margin) |
| Border radius | 8px (scaled) |
| Export format | WebP (game), PNG (source) |
| Export quality | WebP 85% |

### 2.2 Gem Color Specifications

#### Red Gem
| Property | Value | Usage |
|----------|-------|-------|
| Base color | `#FF4757` | Main gem body |
| Highlight | `#FF6B81` | Top-left gradient |
| Shadow | `#C0392B` | Bottom-right shadow |
| Glow (selected) | `rgba(255, 71, 87, 0.6)` | Selection state |
| Glow (matched) | `rgba(255, 71, 87, 0.9)` | Match flash |
| Shape marker | Diamond (rotated square) | Colorblind support |

**Visual Description:**
- Gradient: 135 degrees from `#FF4757` to `#FF6B81`
- Inner highlight: 4px white radial gradient at top-left, 15% opacity
- Shadow: Drop shadow `0 2px 4px rgba(192, 57, 43, 0.4)`
- Colorblind shape: 8x8px white diamond at center, 50% opacity

#### Blue Gem
| Property | Value | Usage |
|----------|-------|-------|
| Base color | `#1E90FF` | Main gem body |
| Highlight | `#54A0FF` | Top-left gradient |
| Shadow | `#1565C0` | Bottom-right shadow |
| Glow (selected) | `rgba(30, 144, 255, 0.6)` | Selection state |
| Glow (matched) | `rgba(30, 144, 255, 0.9)` | Match flash |
| Shape marker | Circle | Colorblind support |

**Visual Description:**
- Gradient: 135 degrees from `#1E90FF` to `#54A0FF`
- Inner highlight: 4px white radial gradient at top-left, 15% opacity
- Shadow: Drop shadow `0 2px 4px rgba(21, 101, 192, 0.4)`
- Colorblind shape: 8px diameter white circle at center, 50% opacity

#### Green Gem
| Property | Value | Usage |
|----------|-------|-------|
| Base color | `#2ED573` | Main gem body |
| Highlight | `#7BED9F` | Top-left gradient |
| Shadow | `#1B9E4B` | Bottom-right shadow |
| Glow (selected) | `rgba(46, 213, 115, 0.6)` | Selection state |
| Glow (matched) | `rgba(46, 213, 115, 0.9)` | Match flash |
| Shape marker | Triangle (pointing up) | Colorblind support |

**Visual Description:**
- Gradient: 135 degrees from `#2ED573` to `#7BED9F`
- Inner highlight: 4px white radial gradient at top-left, 15% opacity
- Shadow: Drop shadow `0 2px 4px rgba(27, 158, 75, 0.4)`
- Colorblind shape: 8px equilateral triangle pointing up, white, 50% opacity

#### Yellow Gem
| Property | Value | Usage |
|----------|-------|-------|
| Base color | `#FFA502` | Main gem body |
| Highlight | `#FFD43B` | Top-left gradient |
| Shadow | `#CC8400` | Bottom-right shadow |
| Glow (selected) | `rgba(255, 165, 2, 0.6)` | Selection state |
| Glow (matched) | `rgba(255, 165, 2, 0.9)` | Match flash |
| Shape marker | Star (5-point) | Colorblind support |

**Visual Description:**
- Gradient: 135 degrees from `#FFA502` to `#FFD43B`
- Inner highlight: 4px white radial gradient at top-left, 15% opacity
- Shadow: Drop shadow `0 2px 4px rgba(204, 132, 0, 0.4)`
- Colorblind shape: 8px 5-point star, white, 50% opacity

#### Purple Gem
| Property | Value | Usage |
|----------|-------|-------|
| Base color | `#9B59B6` | Main gem body |
| Highlight | `#BE90D4` | Top-left gradient |
| Shadow | `#7D3C98` | Bottom-right shadow |
| Glow (selected) | `rgba(155, 89, 182, 0.6)` | Selection state |
| Glow (matched) | `rgba(155, 89, 182, 0.9)` | Match flash |
| Shape marker | Hexagon | Colorblind support |

**Visual Description:**
- Gradient: 135 degrees from `#9B59B6` to `#BE90D4`
- Inner highlight: 4px white radial gradient at top-left, 15% opacity
- Shadow: Drop shadow `0 2px 4px rgba(125, 60, 152, 0.4)`
- Colorblind shape: 8px hexagon, white, 50% opacity

#### Orange Gem
| Property | Value | Usage |
|----------|-------|-------|
| Base color | `#FF6348` | Main gem body |
| Highlight | `#FF7F5B` | Top-left gradient |
| Shadow | `#CC4F3A` | Bottom-right shadow |
| Glow (selected) | `rgba(255, 99, 72, 0.6)` | Selection state |
| Glow (matched) | `rgba(255, 99, 72, 0.9)` | Match flash |
| Shape marker | Square | Colorblind support |

**Visual Description:**
- Gradient: 135 degrees from `#FF6348` to `#FF7F5B`
- Inner highlight: 4px white radial gradient at top-left, 15% opacity
- Shadow: Drop shadow `0 2px 4px rgba(204, 79, 58, 0.4)`
- Colorblind shape: 8x8px white square at center, 50% opacity

### 2.3 Gem States

Each gem requires three sprite states:

#### Base State (Idle)
- Standard gradient appearance as described above
- No glow effect
- Drop shadow for depth

#### Selected State (Glow)
- Scale: 115% of base (rendered at 64px, displayed at ~74px)
- Outer glow: `0 0 16px [gem-glow-color]`
- Border: 2px solid white at 50% opacity
- Brightness: +10%

#### Matched State (Burst)
- White overlay flash at 80% opacity
- Scale: 130% of base
- Particle burst effect (8 small fragments radiating outward)
- Note: This can be a single bright flash frame; animation handled in code

### 2.4 Gem File List

```
gems/
  gem_red_base.webp         # 64x64, Red gem idle state
  gem_red_selected.webp     # 64x64, Red gem selected (with glow baked in)
  gem_red_matched.webp      # 64x64, Red gem match flash
  gem_blue_base.webp
  gem_blue_selected.webp
  gem_blue_matched.webp
  gem_green_base.webp
  gem_green_selected.webp
  gem_green_matched.webp
  gem_yellow_base.webp
  gem_yellow_selected.webp
  gem_yellow_matched.webp
  gem_purple_base.webp
  gem_purple_selected.webp
  gem_purple_matched.webp
  gem_orange_base.webp
  gem_orange_selected.webp
  gem_orange_matched.webp
```

**Total: 18 gem sprite files**

---

## 3. Special Gem Overlays

Special gems use the base gem sprite with an overlay indicator. These overlays are rendered on top of the gem.

### 3.1 Line Clear Overlay

| Property | Value |
|----------|-------|
| Canvas size | 64x64 px |
| Arrow size | 32x8 px (horizontal) or 8x32 px (vertical) |
| Arrow color | `#FFFFFF` at 70% opacity |
| Style | Pointed arrow indicating direction |
| Variants | Horizontal, Vertical |

**Visual Description:**
- Horizontal: White arrow pointing both left and right (double-headed)
- Vertical: White arrow pointing both up and down (double-headed)
- Arrow has pointed ends, not flat
- Centered on canvas
- Subtle glow: `0 0 4px rgba(255, 255, 255, 0.5)`

**File List:**
```
gems/special/
  overlay_lineclear_h.webp   # 64x64, Horizontal line clear arrow
  overlay_lineclear_v.webp   # 64x64, Vertical line clear arrow
```

### 3.2 Bomb Overlay

| Property | Value |
|----------|-------|
| Canvas size | 64x64 px |
| Indicator size | 40x40 px centered |
| Style | Concentric circles radiating outward |
| Colors | White center, fading to transparent |

**Visual Description:**
- 3 concentric circles centered on canvas
- Inner circle: 12px diameter, white at 80% opacity
- Middle circle: 24px diameter, white at 50% opacity
- Outer circle: 36px diameter, white at 25% opacity
- Creates a "blast radius" indicator effect
- Alternative: Starburst/explosion pattern

**File List:**
```
gems/special/
  overlay_bomb.webp          # 64x64, Bomb indicator
  overlay_bomb_pulse_1.webp  # 64x64, Bomb pulse frame 1 (larger glow)
  overlay_bomb_pulse_2.webp  # 64x64, Bomb pulse frame 2 (smaller glow)
```

### 3.3 Color Bomb Overlay

| Property | Value |
|----------|-------|
| Canvas size | 64x64 px |
| Style | Rainbow gradient fill |
| Animation frames | 4 (for shimmer effect) |

**Visual Description:**
- Replaces the gem base color entirely (not an overlay)
- Rainbow gradient: `linear-gradient(135deg, #FFD93D, #FF6B6B, #9B59B6, #1E90FF, #2ED573)`
- Shimmer effect: Gradient position shifts across 4 frames
- Sparkle particles: 4-6 small white stars (4px) scattered on gem
- Border: Subtle white glow

**Color Stops:**
1. `#FFD93D` (Gold) - 0%
2. `#FF6B6B` (Coral) - 25%
3. `#9B59B6` (Purple) - 50%
4. `#1E90FF` (Blue) - 75%
5. `#2ED573` (Green) - 100%

**File List:**
```
gems/special/
  gem_colorbomb_1.webp       # 64x64, Color bomb shimmer frame 1
  gem_colorbomb_2.webp       # 64x64, Color bomb shimmer frame 2
  gem_colorbomb_3.webp       # 64x64, Color bomb shimmer frame 3
  gem_colorbomb_4.webp       # 64x64, Color bomb shimmer frame 4
```

---

## 4. Board Background

### 4.1 Board Container

| Property | Value |
|----------|-------|
| Content area | 320x320 px (scalable) |
| Background color | `rgba(255, 255, 255, 0.05)` |
| Border radius | 12px |
| Border | None (subtle background provides definition) |
| Shadow | `0 0 20px rgba(0, 0, 0, 0.3)` |

**Visual Description:**
- Very subtle white tint over dark background
- Slight inner shadow for depth
- No visible grid lines (gems create the visual grid)

**File List:**
```
ui/
  board_background.webp      # 320x320, Board container background
```

### 4.2 Grid Cell Background (Optional)

| Property | Value |
|----------|-------|
| Cell size | 40x40 px |
| Background | `rgba(255, 255, 255, 0.02)` |
| Border | `1px solid rgba(255, 255, 255, 0.03)` |
| Border radius | 4px |

**Visual Description:**
- Extremely subtle grid pattern
- Barely visible, provides slight depth
- Can be generated procedurally or as a tiled sprite

**File List:**
```
ui/
  grid_cell.webp             # 40x40, Single grid cell (optional, can be code-generated)
```

### 4.3 Screen Backgrounds

| Theme | Gradient Start | Gradient End | Levels |
|-------|----------------|--------------|--------|
| Gem Caverns | `#1A0533` | `#0D1B2A` | 1-10 |
| Crystal Falls | `#0D2137` | `#1A0A2E` | 11-20 |
| Ember Depths | `#2A0A0A` | `#1A0533` | 21-30 |

**Note:** Backgrounds are code-generated gradients, not image assets. No files needed.

---

## 5. UI Elements

### 5.1 Buttons

#### Primary Button (Large)
| Property | Value |
|----------|-------|
| Size | 320x52 px |
| Background | Gradient `135deg, #00FF88 to #00CC6A` |
| Text color | `#000000` |
| Border radius | 14px |
| Font size | 16px |
| Font weight | 700 |

**States:**
- Default: Base gradient
- Pressed: Scale 95%, brightness 90%
- Disabled: Background `rgba(255, 255, 255, 0.05)`, text `#555555`

#### Primary Button (Medium)
| Property | Value |
|----------|-------|
| Size | 200x44 px |
| Other properties | Same as Large |

#### Primary Button (Small)
| Property | Value |
|----------|-------|
| Size | 120x36 px |
| Font size | 13px |
| Other properties | Same as Large |

#### Secondary Button
| Property | Value |
|----------|-------|
| Background | `rgba(255, 255, 255, 0.08)` |
| Border | `1px solid rgba(255, 255, 255, 0.15)` |
| Text color | `#FFFFFF` |
| Other properties | Same sizing as Primary |

#### Button File List
```
ui/buttons/
  btn_primary_large.webp         # 320x52, Primary button default
  btn_primary_large_pressed.webp # 320x52, Primary button pressed
  btn_primary_large_disabled.webp # 320x52, Primary button disabled
  btn_primary_medium.webp        # 200x44
  btn_primary_medium_pressed.webp
  btn_primary_medium_disabled.webp
  btn_primary_small.webp         # 120x36
  btn_primary_small_pressed.webp
  btn_primary_small_disabled.webp
  btn_secondary_large.webp       # 320x52
  btn_secondary_large_pressed.webp
  btn_secondary_medium.webp      # 200x44
  btn_secondary_medium_pressed.webp
  btn_secondary_small.webp       # 120x36
  btn_secondary_small_pressed.webp
  btn_danger_large.webp          # 320x52, Gradient #FF4757 to #C0392B
  btn_danger_large_pressed.webp
  btn_gold_large.webp            # 320x52, Gradient #FFD93D to #FFA502
  btn_gold_large_pressed.webp
```

### 5.2 Icon Buttons

| Size | Diameter | Icon Size |
|------|----------|-----------|
| Small | 40px | 18px |
| Medium | 48px | 22px |
| Large | 56px | 28px |

**Style:**
- Shape: Circle
- Background: `rgba(255, 255, 255, 0.08)`
- Border: `2px solid rgba(255, 255, 255, 0.2)`
- Icon color: `#FFFFFF`

**File List:**
```
ui/buttons/
  iconbtn_small.webp             # 40x40, Icon button background
  iconbtn_small_pressed.webp
  iconbtn_medium.webp            # 48x48
  iconbtn_medium_pressed.webp
  iconbtn_large.webp             # 56x56
  iconbtn_large_pressed.webp
```

### 5.3 Icons

All icons are white (`#FFFFFF`) on transparent background.

| Icon | Size | Description |
|------|------|-------------|
| icon_pause | 24x24 | Two vertical bars |
| icon_play | 24x24 | Right-pointing triangle |
| icon_settings | 24x24 | Gear/cog |
| icon_close | 24x24 | X mark |
| icon_back | 24x24 | Left arrow/chevron |
| icon_forward | 24x24 | Right arrow/chevron |
| icon_home | 24x24 | House shape |
| icon_shop | 24x24 | Shopping cart |
| icon_lock | 24x24 | Padlock |
| icon_star_empty | 24x24 | Star outline |
| icon_star_filled | 24x24 | Star filled gold #FFD93D |
| icon_heart_full | 24x24 | Heart filled red #FF4757 |
| icon_heart_empty | 24x24 | Heart outline |
| icon_sound_on | 24x24 | Speaker with waves |
| icon_sound_off | 24x24 | Speaker with X |
| icon_music_on | 24x24 | Music note |
| icon_music_off | 24x24 | Music note with X |
| icon_share | 24x24 | Share/export arrow |
| icon_challenge | 24x24 | Crossed swords or VS |
| icon_refresh | 24x24 | Circular arrow |
| icon_check | 24x24 | Checkmark |
| icon_info | 24x24 | Info circle |

**File List:**
```
ui/icons/
  icon_pause.webp
  icon_play.webp
  icon_settings.webp
  icon_close.webp
  icon_back.webp
  icon_forward.webp
  icon_home.webp
  icon_shop.webp
  icon_lock.webp
  icon_star_empty.webp
  icon_star_filled.webp
  icon_heart_full.webp
  icon_heart_empty.webp
  icon_sound_on.webp
  icon_sound_off.webp
  icon_music_on.webp
  icon_music_off.webp
  icon_share.webp
  icon_challenge.webp
  icon_refresh.webp
  icon_check.webp
  icon_info.webp
```

### 5.4 Stars (Level Rating)

#### Small Stars (Level Select)
| Property | Value |
|----------|-------|
| Size | 14x14 px |
| Empty color | `#3A3A4A` |
| Filled color | `#FFD93D` |

#### Large Stars (Level Complete)
| Property | Value |
|----------|-------|
| Size | 48x48 px |
| Empty color | `#3A3A4A`, 2px stroke `#555555` |
| 1-star fill | Solid `#FFD93D` |
| 2-star fill | Gradient `135deg, #FFD93D to #FFA502` |
| 3-star fill | Gradient `135deg, #FFD93D to #FF6B6B` |

**File List:**
```
ui/stars/
  star_small_empty.webp      # 14x14
  star_small_filled.webp     # 14x14
  star_large_empty.webp      # 48x48
  star_large_1star.webp      # 48x48, Gold solid
  star_large_2star.webp      # 48x48, Gold-orange gradient
  star_large_3star.webp      # 48x48, Gold-red gradient
```

### 5.5 Hearts (Lives)

| Property | Value |
|----------|-------|
| Size | 20x20 px |
| Full color | `#FF4757` |
| Empty color | `#3A3A4A`, 1px stroke `#555555` |

**File List:**
```
ui/hearts/
  heart_full.webp            # 20x20
  heart_empty.webp           # 20x20
  heart_breaking_1.webp      # 20x20, Crack appearing
  heart_breaking_2.webp      # 20x20, Heart split
```

### 5.6 Progress Bar

| Property | Value |
|----------|-------|
| Track height | 8px (standard), 12px (large) |
| Track color | `rgba(255, 255, 255, 0.1)` |
| Fill gradient | `90deg, #00FF88 to #4D96FF` |
| Score fill gradient | `90deg, #FFD93D to #FFA502` |
| Border radius | Same as height (fully rounded) |

**File List:**
```
ui/progress/
  progress_track_8.webp      # 200x8, Track background (tiled)
  progress_fill_8.webp       # 200x8, Fill gradient (tiled)
  progress_score_8.webp      # 200x8, Score fill gradient (tiled)
  progress_track_12.webp     # 200x12, Large track
  progress_fill_12.webp      # 200x12, Large fill
  progress_marker.webp       # 6x6, Diamond threshold marker
```

### 5.7 Panels and Cards

#### Modal Card
| Property | Value |
|----------|-------|
| Background | `#16213E` |
| Border radius | 16px |
| Padding | 24px |
| Max width | 360px |

#### Shop Product Card
| Property | Value |
|----------|-------|
| Background | `rgba(255, 255, 255, 0.05)` |
| Border | `1px solid rgba(255, 255, 255, 0.08)` |
| Border radius | 14px |
| Height | 72px minimum |

#### Featured Product Card
| Property | Value |
|----------|-------|
| Border | `2px solid #FFD93D` |
| Background | `rgba(255, 217, 61, 0.08)` |

**File List:**
```
ui/panels/
  panel_modal.webp           # 360x400, Modal background (9-slice)
  panel_card.webp            # 320x80, Product card background (9-slice)
  panel_card_featured.webp   # 320x80, Featured card background (9-slice)
  panel_hud.webp             # 390x44, HUD bar background
  panel_toast_success.webp   # 320x48, Success toast background
  panel_toast_error.webp     # 320x48, Error toast background
  panel_toast_info.webp      # 320x48, Info toast background
```

### 5.8 Product Icons

| Product | Gradient | Icon Description |
|---------|----------|------------------|
| Extra Moves | `#FF6B6B to #FF4757` | Number "3" or plus sign |
| Starter Pack | `#4D96FF to #1E90FF` | Gift box or gem cluster |
| Lives Refill | `#FF4757 to #C0392B` | 5 hearts stacked |
| Season Pass | `#9B59B6 to #8E44AD` | Crown or VIP badge |
| Bomb Booster | `#FFD93D to #FFA502` | Bomb icon |

| Property | Value |
|----------|-------|
| Size | 50x50 px |
| Border radius | 12px |

**File List:**
```
ui/products/
  product_moves.webp         # 50x50
  product_starter.webp       # 50x50
  product_lives.webp         # 50x50
  product_seasonpass.webp    # 50x50
  product_bomb.webp          # 50x50
```

### 5.9 Level Select Node

| Property | Value |
|----------|-------|
| Size | 48x48 px |
| Shape | Circle |
| Border radius | 50% |

**States:**
| State | Background | Border |
|-------|------------|--------|
| Locked | `rgba(255, 255, 255, 0.05)` | `1px solid #3A3A4A` |
| Available | `#6C5CE7` | `2px solid #00FF88` |
| Completed 1-star | `rgba(255, 255, 255, 0.1)` | `1px solid rgba(255, 255, 255, 0.2)` |
| Completed 3-star | `rgba(255, 217, 61, 0.15)` | `1px solid #FFD93D` |

**File List:**
```
ui/levelselect/
  node_locked.webp           # 48x48
  node_available.webp        # 48x48
  node_completed.webp        # 48x48
  node_completed_gold.webp   # 48x48, 3-star variant
  node_connector.webp        # 4x64, Path line between nodes
```

### 5.10 Booster Button

| Property | Value |
|----------|-------|
| Size | 48x48 px |
| Border radius | 12px |
| Background | `rgba(255, 255, 255, 0.08)` |
| Border | `2px solid rgba(255, 255, 255, 0.2)` |

**File List:**
```
ui/boosters/
  booster_slot.webp          # 48x48, Empty booster button
  booster_slot_active.webp   # 48x48, Active/selected state
  booster_pricetag.webp      # 24x16, Price tag background
```

---

## 6. Developer Console Assets

### 6.1 Game Icon

Required sizes for Jest Developer Console:

| Size | Usage |
|------|-------|
| 512x512 px | Primary icon |
| 256x256 px | Medium displays |
| 128x128 px | Small displays |
| 64x64 px | Thumbnail |

**Visual Description:**
- Background: `#1A0A2E` (deep purple-navy)
- Content: Gem cluster (3 gems in triangle formation)
  - Top gem: Red (`#FF4757`)
  - Bottom-left: Blue (`#1E90FF`)
  - Bottom-right: Green (`#2ED573`)
- Gems overlap slightly, creating depth
- Each gem has its gradient and shadow
- Subtle sparkle effects (2-3 small white stars)
- NO TEXT in icon (platform displays game name)

**Design Notes:**
- Must be legible at 64x64px
- High saturation for marketplace visibility
- No fine details that disappear at small sizes

**File List:**
```
console/
  icon_512.png               # 512x512, PNG for console upload
  icon_256.png               # 256x256
  icon_128.png               # 128x128
  icon_64.png                # 64x64
```

### 6.2 Hero Image

| Property | Value |
|----------|-------|
| Size | 1200x630 px (16:9 aspect ratio) |
| Format | PNG |

**Visual Description:**
- Background: Gradient from `#1A0533` to `#0D1B2A`
- Main content (left 60%):
  - Game board showing 8x8 grid of colorful gems
  - A cascade in progress (gems falling, matches highlighting)
  - Combo text "Amazing!" floating above
  - Score counter visible in corner
- Social element (right 40%):
  - Semi-transparent VS challenge card
  - Two player avatars with scores
  - "VS" text with lightning effect
- Bottom: Gem Link logo (optional, if space allows)
- Overall feel: Energetic, social, colorful

**File List:**
```
console/
  hero_1200x630.png          # 1200x630, Hero banner
```

### 6.3 Card Color

| Property | Value |
|----------|-------|
| Hex | `#1A0A2E` |
| Usage | Explore card background color in Developer Console |

---

## 7. Notification Images

Images for SMS/RCS notifications. Must be uploaded to Developer Console for approval.

### 7.1 General Specifications

| Property | Value |
|----------|-------|
| Format | PNG (required by platform) |
| Recommended size | 1200x628 px (verify with Jest docs) |
| Background | Dark (`#1A0A2E` or `#0D1B2A`) |
| Style | Simple, clear at thumbnail sizes |
| SHAFT compliant | No gambling, alcohol, firearms, etc. |

### 7.2 Notification Templates

#### "Gems Waiting" (Return Prompt)
**Visual Description:**
- 3 colorful gems (red, blue, green) in a cluster
- Subtle sparkle/glow effects around gems
- Dark background
- NO TEXT (notification body provides context)

**File:** `notifications/notif_gems_waiting.png`

#### "Daily Reward" (Streak/Reward)
**Visual Description:**
- Gift box icon with golden glow
- Ribbon on gift box
- Small star bursts around it
- Dark background

**File:** `notifications/notif_daily_reward.png`

#### "Challenge VS" (PvP Challenge)
**Visual Description:**
- Two gem clusters facing each other
- Lightning bolt between them
- "VS" text in red (`#FF4757`)
- Red vs blue color scheme for opposing sides

**File:** `notifications/notif_challenge_vs.png`

#### "Star Milestone" (Achievement)
**Visual Description:**
- 3 large gold stars (`#FFD93D`)
- Particle effects around stars
- Space for milestone number below
- Dark background

**File:** `notifications/notif_star_milestone.png`

#### "Streak Fire" (Login Streak)
**Visual Description:**
- Flame icon in warm orange/red gradient
- Space for streak count number
- Warm glow effect
- Darker background with ember particles

**File:** `notifications/notif_streak_fire.png`

### 7.3 Notification File List

```
notifications/
  notif_gems_waiting.png     # 1200x628
  notif_daily_reward.png     # 1200x628
  notif_challenge_vs.png     # 1200x628
  notif_star_milestone.png   # 1200x628
  notif_streak_fire.png      # 1200x628
```

---

## 8. File Naming Conventions

### General Rules
- All lowercase
- Words separated by underscores
- No spaces or special characters
- Descriptive but concise

### Pattern
```
[category]_[name]_[variant]_[state].[extension]
```

### Examples
```
gem_red_base.webp            # Gem category, red name, base variant
gem_red_selected.webp        # Gem category, red name, selected state
btn_primary_large.webp       # Button category, primary variant, large size
btn_primary_large_pressed.webp  # With state
icon_star_filled.webp        # Icon category, star name, filled state
overlay_lineclear_h.webp     # Overlay category, lineclear name, horizontal variant
```

### Category Prefixes
| Prefix | Category |
|--------|----------|
| gem_ | Gem sprites |
| overlay_ | Special gem overlays |
| btn_ | Buttons |
| icon_ | Icons |
| iconbtn_ | Icon buttons |
| star_ | Star ratings |
| heart_ | Life hearts |
| panel_ | Panel/card backgrounds |
| node_ | Level select nodes |
| product_ | Shop product icons |
| progress_ | Progress bar elements |
| booster_ | Booster UI |
| notif_ | Notification images |

---

## 9. Export Settings

### WebP (Game Assets)
| Setting | Value |
|---------|-------|
| Quality | 85% |
| Compression | Lossy |
| Color space | sRGB |
| Metadata | None (strip all) |
| Alpha | Preserve transparency |

### PNG (Developer Console)
| Setting | Value |
|---------|-------|
| Compression | Maximum (PNG-8 where possible, PNG-24 for gradients) |
| Color space | sRGB |
| Metadata | None (strip all) |
| Interlacing | None |

### Optimization Tools
- **WebP:** Use `cwebp` or Squoosh
- **PNG:** Use `pngquant` + `optipng` or TinyPNG
- **Target:** <50KB per individual asset, <200KB for complex assets

---

## 10. Sprite Atlas Configuration

For optimal performance, gems and UI elements should be packed into texture atlases.

### Atlas 1: Gems (`gems.atlas`)
**Contents:**
- All 18 gem sprites (6 colors x 3 states)
- Line clear overlays (2)
- Bomb overlay (3 frames)
- Color bomb (4 frames)

**Total frames:** 27
**Estimated size:** 512x512 px atlas, ~150KB

### Atlas 2: UI Elements (`ui.atlas`)
**Contents:**
- All button sprites
- All icons
- Stars and hearts
- Progress bar elements

**Estimated size:** 1024x512 px atlas, ~200KB

### Atlas 3: Level Select (`levelselect.atlas`)
**Contents:**
- Level nodes (all states)
- Path connectors

**Estimated size:** 256x256 px atlas, ~50KB

### Atlas JSON Format (Phaser 3)
```json
{
  "frames": {
    "gem_red_base": {
      "frame": {"x": 0, "y": 0, "w": 64, "h": 64},
      "sourceSize": {"w": 64, "h": 64},
      "spriteSourceSize": {"x": 0, "y": 0, "w": 64, "h": 64}
    }
  },
  "meta": {
    "image": "gems.webp",
    "size": {"w": 512, "h": 512},
    "scale": "1"
  }
}
```

---

## Appendix A: Complete Asset Inventory

### Gem Sprites (18 files)
- gem_red_base.webp
- gem_red_selected.webp
- gem_red_matched.webp
- gem_blue_base.webp
- gem_blue_selected.webp
- gem_blue_matched.webp
- gem_green_base.webp
- gem_green_selected.webp
- gem_green_matched.webp
- gem_yellow_base.webp
- gem_yellow_selected.webp
- gem_yellow_matched.webp
- gem_purple_base.webp
- gem_purple_selected.webp
- gem_purple_matched.webp
- gem_orange_base.webp
- gem_orange_selected.webp
- gem_orange_matched.webp

### Special Gem Overlays (9 files)
- overlay_lineclear_h.webp
- overlay_lineclear_v.webp
- overlay_bomb.webp
- overlay_bomb_pulse_1.webp
- overlay_bomb_pulse_2.webp
- gem_colorbomb_1.webp
- gem_colorbomb_2.webp
- gem_colorbomb_3.webp
- gem_colorbomb_4.webp

### UI Elements (~60 files)
- Buttons: 18 files
- Icon buttons: 6 files
- Icons: 22 files
- Stars: 6 files
- Hearts: 4 files
- Progress bars: 6 files
- Panels: 7 files
- Products: 5 files
- Level select: 5 files
- Boosters: 3 files

### Developer Console (5 files)
- icon_512.png
- icon_256.png
- icon_128.png
- icon_64.png
- hero_1200x630.png

### Notification Images (5 files)
- notif_gems_waiting.png
- notif_daily_reward.png
- notif_challenge_vs.png
- notif_star_milestone.png
- notif_streak_fire.png

### Total Asset Count
- **Game assets (WebP):** ~87 files
- **Console assets (PNG):** 10 files
- **Estimated total size:** ~2.5MB (well within 10MB budget)

---

## Appendix B: Color Reference Card

### Brand Colors
```
Primary Purple:     #6C5CE7
Secondary Blue:     #4D96FF
Accent Green:       #00FF88
Accent Green Dark:  #00CC6A
```

### Background Colors
```
Deep Background:    #0A0A1A
Primary Background: #1A0A2E
Secondary Background: #0D1B2A
Surface:            #16213E
Board Background:   rgba(255,255,255,0.05)
```

### Gem Colors
```
Red:                #FF4757 / #FF6B81 / #C0392B
Blue:               #1E90FF / #54A0FF / #1565C0
Green:              #2ED573 / #7BED9F / #1B9E4B
Yellow:             #FFA502 / #FFD43B / #CC8400
Purple:             #9B59B6 / #BE90D4 / #7D3C98
Orange:             #FF6348 / #FF7F5B / #CC4F3A
```

### UI Colors
```
Text Primary:       #FFFFFF
Text Secondary:     #AAAAAA
Text Tertiary:      #888888
Text Disabled:      #555555
Error:              #FF4757
Success:            #2ED573
Warning:            #FFA502
Gold:               #FFD93D
```

---

*This specification document is the authoritative reference for all visual asset creation for Gem Link. Asset creators should follow these specifications exactly. Any questions or deviations must be approved by the Lead Designer.*
