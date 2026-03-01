# Gem Link — Master Execution Plan

> **Date:** 2026-02-28
> **Status:** AWAITING APPROVAL
> **Sources:** Lead Designer Spec (DESIGN-SPEC-V2.md), Principal Engineer Assessment, Game Strategist Balance Report
> **Viewport:** 390x600 | **Engine:** Phaser 3 + TypeScript + Vite

---

## Executive Summary

20+ issues identified across 3 screens (Home, Shop, Gameplay). Root causes: all-Graphics rendering (no sprite assets), hardcoded layout values, HUD component sizing bugs, non-functional features, and game balance issues. This plan organizes 35 tasks across 4 phases with strict file ownership to prevent merge conflicts.

---

## Phase 1: Foundation (No File Conflicts — All Parallel)

These tasks have zero dependencies and touch different files. All can execute simultaneously.

### Task 1.1: Text Rendering Fix
- **File:** `src/main.ts`
- **Agent:** Platform Engineer
- **Change:** Add `roundPixels: true` to render config, add `resolution: Math.min(window.devicePixelRatio || 1, 2)`, remove unused arcade physics config
- **Test Cases:**
  - TC-1.1-1: Text at all font sizes (12/16/24/36/48) renders crisply on retina display
  - TC-1.1-2: Build succeeds, game loads without errors
  - TC-1.1-3: Build size same or smaller (physics removal)
  - TC-1.1-4: Game object positions remain correct (no layout shifts)

### Task 1.2: Extract Constants — Eliminate Hardcoded Values
- **File:** `src/utils/Constants.ts`
- **Agent:** Platform Engineer
- **Change:** Add all new design tokens from DESIGN-SPEC-V2 Section 4:
  - HUD: `HUD_TOP_MARGIN: 10`, `HUD_PILL_WIDTH: 90`, `HUD_PILL_HEIGHT: 32`, `HUD_PILL_GAP: 12`, `HUD_PILL_RADIUS: 16`, `HUD_ICON_SIZE: 20`, `HUD_PILL_PADDING: 8`
  - Gameplay: `GAMEPLAY_HEADER_Y: 8`, `GAMEPLAY_HUD_Y: 40`, `GAMEPLAY_PROGRESS_Y: 66`, `GAMEPLAY_BOARD_Y: 90`, `GAMEPLAY_BOOSTER_Y: 466`
  - Shop: `SHOP_CARD_WIDTH: 82`, `SHOP_CARD_HEIGHT: 120`, `SHOP_CARD_GAP: 8`, `SHOP_BOOSTER_TILE_W: 72`, `SHOP_BOOSTER_TILE_H: 80`
  - Modal: `MODAL_PADDING: 24`, `MODAL_TITLE_GAP: 16`, `MODAL_BUTTON_GAP: 12`, `MODAL_MIN_HEIGHT: 240`, `MODAL_MAX_HEIGHT: 500`
  - Asset keys: `GEM_TEXTURE_MAP` object mapping gem colors to sprite keys
  - Booster tray: `BOOSTER_SLOT_SIZE: 48`, `BOOSTER_SLOT_GAP: 16`
- **Test Cases:**
  - TC-1.2-1: All new constants export correctly (no TS compilation errors)
  - TC-1.2-2: Existing constant values unchanged
  - TC-1.2-3: No duplicate constant names

### Task 1.3: Asset Extraction & Loading
- **Files:** `public/assets/gems/*.png`, `public/assets/ui/*.png`, `src/game/scenes/PreloadScene.ts`
- **Agent:** Asset Engineer
- **Change:**
  1. Extract individual sprites from user's composite images (remove white backgrounds)
  2. Save as transparent PNGs in `public/assets/gems/` and `public/assets/ui/`
  3. Add `this.load.image()` calls to PreloadScene for all sprites
- **Assets to extract:**
  - Gems (6): `gem_heart.png`, `gem_diamond.png`, `gem_square.png`, `gem_triangle.png`, `gem_circle.png`, `gem_star.png`
  - UI: `ui_bomb.png`, `ui_rainbow.png`, `ui_coin.png`, `ui_star.png`, `ui_hammer.png`, `ui_chest_closed.png`, `ui_chest_open.png`, `ui_heart.png`, `ui_gem.png`, `ui_logo.png`
  - Special: `circle_rainbow.png` (color bomb)
- **Test Cases:**
  - TC-1.3-1: All PNGs have transparent backgrounds (no white halos)
  - TC-1.3-2: All texture keys exist after PreloadScene completes
  - TC-1.3-3: Build size remains under 2MB
  - TC-1.3-4: No `loaderror` events in console

### Task 1.4: Level Rebalance
- **File:** `assets/levels/levels.json`
- **Agent:** Level Designer
- **Change:** Update all 30 levels per Game Strategist recommendations:
  - Levels 1-5: 15-18 moves (down from 22-25)
  - Levels 6-10: 12-15 moves (down from 18-22)
  - Levels 11-15: 10-13 moves (down from 17-20)
  - Levels 16-20: 9-12 moves (down from 15-18)
  - Levels 21-25: 8-10 moves (down from 13-16)
  - Levels 26-30: 7-9 moves (down from 12-14)
  - Include breather levels every 3-5 levels
  - Update star thresholds per scoring math
- **Test Cases:**
  - TC-1.4-1: Valid JSON, all 30 levels present
  - TC-1.4-2: Move limits decrease overall from level 1 to 30
  - TC-1.4-3: Star thresholds increase: 1-star < 2-star < 3-star for each level
  - TC-1.4-4: objectives.target equals 1-star threshold for each level
  - TC-1.4-5: Breather levels (7, 13, 18, 23, 27) have slightly higher move counts than neighbors

### Task 1.5: Free Gift Cooldown Update
- **File:** `src/types/game.types.ts`
- **Agent:** Game Engineer
- **Change:** Update `FREE_GIFT_COOLDOWN_MINUTES` from 20 to 240 (4 hours)
- **Test Cases:**
  - TC-1.5-1: OfferManager uses 240-minute cooldown
  - TC-1.5-2: Timer display shows hours:minutes format for values > 60 min

---

## Phase 2: UI Component Fixes (Parallel — Different Files)

Depends on: Phase 1.2 (new constants must exist). Can start as soon as Constants.ts is updated.

### Task 2.1: GlBadge & GlHUD Redesign
- **File:** `src/ui/UIComponents.ts` (GlBadge + GlHUD sections only)
- **Agent:** UI Engineer
- **Change per DESIGN-SPEC-V2 Section 5:**
  - GlBadge: Reduce to 90px wide, 32px tall capsule, 8px internal padding
  - Icon: 20x20 sprite image (fallback to emoji), 8px gap to value text
  - Value: 16px bold white, right-aligned
  - Plus button: Integrated into pill (entire pill is tappable), "+" on right edge
  - GlHUD: 3 pills centered, 12px gap between, 10px top margin
  - HUD background: Full width bar, 50px tall, 0x1A0A2E at 95% alpha
- **Test Cases:**
  - TC-2.1-1: Three HUD badges do NOT overlap each other
  - TC-2.1-2: Total badge area fits within 390px viewport with margins
  - TC-2.1-3: Tap "+" on each badge fires callback
  - TC-2.1-4: Badge values display correct numbers
  - TC-2.1-5: Large values (9999) don't overflow pill

### Task 2.2: GlModal Fix
- **File:** `src/ui/UIComponents.ts` (GlModal section only)
- **Agent:** UI Engineer (same agent as 2.1 — same file)
- **Change per DESIGN-SPEC-V2 Section 10:**
  - Auto-sizing height based on content (not fixed 320px)
  - 24px top/bottom padding, 16px gap between elements
  - Separator line between title and content
  - Backdrop click closes modal; dialog body click does NOT (add `setInteractive()` on dialog container)
- **Test Cases:**
  - TC-2.2-1: Click inside dialog body → modal stays open
  - TC-2.2-2: Click backdrop → modal closes
  - TC-2.2-3: Modal height adjusts to content (short content = shorter modal)
  - TC-2.2-4: Buttons and text never overlap inside modal

### Task 2.3: GlCard Enhancement
- **File:** `src/ui/UIComponents.ts` (GlCard section only)
- **Agent:** UI Engineer (same file)
- **Change:** Cards support sprite icon images, properly wrap text, show descriptions

### Task 2.4: CelebrationSystem Redesign
- **File:** `src/ui/CelebrationSystem.ts`
- **Agent:** UI Engineer
- **Change per DESIGN-SPEC-V2 Section 11:**
  - Replace WordArt stroke text with badge-style floating labels
  - Rounded rect background behind combo text
  - Remove rainbow tint cycling on "Epic Combo!"
  - Purchase celebration: badge-style with gold particle burst
- **Test Cases:**
  - TC-2.4-1: Combo text renders with rounded rect background, no stroke
  - TC-2.4-2: "Linked!" (depth 1) is white, "Great!" (depth 2) is gold, "Epic Combo!" (depth 3+) is red
  - TC-2.4-3: Purchase text has badge background, floats up, fades out

### Task 2.5: GameplayScene Layout Fix
- **File:** `src/game/scenes/GameplayScene.ts`
- **Agent:** Game Engineer
- **Change per DESIGN-SPEC-V2 Section 8:**
  - Remove level name subtitle ("First Steps")
  - Increase top margin to 8px above level header
  - Compact score/moves pills (18px tall, not using GlBadge)
  - Fix progress bar position: y=66, clear of badges
  - Board shifts from y=104 to y=90
  - Simplified booster tray with 3 sprite-icon slots at y=466
  - Moves text color changes based on count (white > 5, orange 3-5, red 1-2)
- **Test Cases:**
  - TC-2.5-1: "Level X" has ≥8px top margin
  - TC-2.5-2: No subtitle text displayed
  - TC-2.5-3: Score badge does NOT overlap progress bar
  - TC-2.5-4: Moves badge does NOT overlap progress bar
  - TC-2.5-5: Progress bar has ≥6px gap from board
  - TC-2.5-6: Moves text turns orange at 3-5 moves, red at 1-2
  - TC-2.5-7: Board renders fully within viewport

### Task 2.6: MainMenuScene Redesign
- **File:** `src/game/scenes/MainMenuScene.ts`
- **Agent:** Frontend Engineer
- **Change per DESIGN-SPEC-V2 Section 6:**
  - Replace text "Gem Link" title with `ui_logo` sprite (centered, 200x100 display)
  - Remove booster tray entirely (`buildBoosterTray()` deleted)
  - Enlarge level badge to 20px bold gold
  - Gem board preview uses sprite Images (18x18) instead of Graphics shapes
  - Play button: 220x52, green gradient, centered
  - Redesign Free Gift banner: dark surface background, rounded 12px, treasure chest icon, CLAIM button or timer
  - Consistent 12-24px spacing between all sections
- **Test Cases:**
  - TC-2.6-1: Logo sprite displays centered, not text
  - TC-2.6-2: No booster icons below the board
  - TC-2.6-3: Level badge text is 20px bold gold
  - TC-2.6-4: Play button centered, tappable
  - TC-2.6-5: Free Gift banner renders without UV artifacts
  - TC-2.6-6: Free Gift CLAIM button works and delivers reward
  - TC-2.6-7: All elements have consistent spacing

### Task 2.7: ShopScene Complete Redesign
- **File:** `src/game/scenes/ShopScene.ts`
- **Agent:** Senior Frontend Engineer
- **Change per DESIGN-SPEC-V2 Section 7:**
  - Currency packs: 4 cards with treasure chest sprites, 82x120px each
  - Booster section: Tile-based layout with sprite icons (72x80 each)
  - Each item has: icon, name, description, buy button
  - Free Gift section with chest sprite
  - Proper confirm purchase modal using GlModal (shows product icon, name, description, price)
  - Fix contentContainer (add to display list)
  - Show "Purchases available on Jest" banner outside Jest
- **Test Cases:**
  - TC-2.7-1: All shop items have visible sprite icons
  - TC-2.7-2: No text overlaps any component
  - TC-2.7-3: Each item shows name + description + price
  - TC-2.7-4: Confirm purchase modal shows product details with proper spacing
  - TC-2.7-5: "Lives Refill" hidden when lives are full
  - TC-2.7-6: Back button navigates to main menu

---

## Phase 3: Gem Sprite Integration & Gameplay Features

Depends on: Phase 1.3 (assets loaded), Phase 2.5 (GameplayScene layout)

### Task 3.1: Gem.ts Sprite Refactor
- **File:** `src/game/objects/Gem.ts`
- **Agent:** Game Engineer
- **Change per DESIGN-SPEC-V2 Section 14:**
  - Replace `renderVisual()` Graphics drawing with `Phaser.GameObjects.Image`
  - Map gem colors to sprite keys via `GEM_TEXTURE_MAP`
  - Special gem indicators overlay on sprite (line clear: arrows, bomb: rings, color bomb: rainbow sprite)
  - Selected state: 1.1x scale + white glow circle behind gem
  - Remove `fillStar()` helper and all Graphics shape drawing
- **Test Cases:**
  - TC-3.1-1: All 64 gems render as sprites (not Graphics)
  - TC-3.1-2: Each gem color maps to correct sprite
  - TC-3.1-3: Selected gem shows glow + scale
  - TC-3.1-4: Matched gems clear with shrink animation
  - TC-3.1-5: 4-match creates LINE_CLEAR gem with indicator
  - TC-3.1-6: 5-match creates COLOR_BOMB gem with rainbow sprite
  - TC-3.1-7: No missing texture errors in console
  - TC-3.1-8: Remap destroys old sprites, creates new ones correctly

### Task 3.2: Implement Hammer Booster
- **File:** `src/game/scenes/GameplayScene.ts` (booster section)
- **Agent:** Game Engineer
- **Mechanic:** Tap hammer icon → board enters targeting mode → tap any gem → gem destroyed → cascade
- **Does NOT consume a move**
- **Cost:** 1 token (50 gems / 500 coins alternative)
- **Test Cases:**
  - TC-3.2-1: Tapping hammer enters targeting mode (visual indicator)
  - TC-3.2-2: Tapping gem in targeting mode destroys it
  - TC-3.2-3: Cascade triggers after gem destruction
  - TC-3.2-4: Move count unchanged after booster use
  - TC-3.2-5: With 0 tokens/0 gems: shows "not enough" feedback
  - TC-3.2-6: Tapping outside board cancels targeting mode

### Task 3.3: Implement Rainbow Booster
- **File:** `src/game/scenes/GameplayScene.ts`
- **Agent:** Game Engineer
- **Mechanic:** Tap rainbow icon → tap any gem → all gems of that color cleared → cascade
- **Does NOT consume a move**
- **Test Cases:**
  - TC-3.3-1: Tapping rainbow shows color selection (tap any gem)
  - TC-3.3-2: Tapping a gem clears ALL gems of that color
  - TC-3.3-3: Cascade and gravity run after clearing
  - TC-3.3-4: Move count unchanged
  - TC-3.3-5: Score updates correctly for all cleared gems

### Task 3.4: Timer & Tween Leak Fixes
- **Files:** `src/game/scenes/GameplayScene.ts`, `src/game/scenes/MainMenuScene.ts`, `src/game/scenes/ShopScene.ts`
- **Agent:** Game Engineer
- **Change:** Every `time.addEvent`, `time.delayedCall`, and `tweens.add` with `repeat: -1`:
  1. Stored reference in class field
  2. Cleaned up in `shutdown()` method
  3. Null-check guard before creating
- **Test Cases:**
  - TC-3.4-1: Navigate MainMenu → Gameplay → Quit → MainMenu 10 times: no console errors
  - TC-3.4-2: Open shop, back, open shop 5 times: no orphaned tweens
  - TC-3.4-3: Play level, fail, retry 5 times: scoreCounterTimer properly cleaned

---

## Phase 4: Polish & Code Quality

### Task 4.1: Modal Consolidation
- **File:** `src/game/scenes/GameplayScene.ts`
- **Agent:** Game Engineer
- **Change:** Replace 5 manual overlay implementations with GlModal:
  1. Quit confirmation (`showConfirmOverlay`)
  2. Fail modal (`showFailModal`)
  3. Extra moves confirmation (`showExtraMovesConfirmation`)
  4. Remap confirmation (`showRemapConfirmOverlay`)
  5. Buy remap token (`showBuyRemapTokenOverlay`)
- **Test Cases:**
  - TC-4.1-1: Quit confirmation uses GlModal, shows/hides correctly
  - TC-4.1-2: Fail modal uses GlModal, two-tier layout works
  - TC-4.1-3: All modals close on backdrop tap, stay open on body tap

### Task 4.2: Scene Shutdown Cleanup
- **Files:** All scene files
- **Agent:** Game Engineer
- **Change:** Add proper `shutdown()` methods that destroy all timers, tweens, and temporary game objects

### Task 4.3: OfferManager Reward Update
- **File:** `src/game/systems/OfferManager.ts`
- **Agent:** Game Engineer
- **Change per Game Strategist:**
  - 50% chance: 100 coins (up from 50)
  - 30% chance: 200 coins (up from 100)
  - 20% chance: 1 Hammer or 1 Rainbow booster
- **Test Cases:**
  - TC-4.3-1: Reward distribution matches new probabilities
  - TC-4.3-2: Booster rewards properly add to player inventory

---

## File Ownership Map (Prevents Merge Conflicts)

| File | Owner Agent | Tasks |
|------|------------|-------|
| `src/main.ts` | Platform Engineer | 1.1 |
| `src/utils/Constants.ts` | Platform Engineer | 1.2 |
| `src/game/scenes/PreloadScene.ts` | Asset Engineer | 1.3 |
| `public/assets/**` | Asset Engineer | 1.3 |
| `assets/levels/levels.json` | Level Designer | 1.4 |
| `src/types/game.types.ts` | Game Engineer | 1.5 |
| `src/ui/UIComponents.ts` | UI Engineer | 2.1, 2.2, 2.3 |
| `src/ui/CelebrationSystem.ts` | UI Engineer | 2.4 |
| `src/game/scenes/GameplayScene.ts` | Game Engineer | 2.5, 3.2, 3.3, 3.4, 4.1, 4.2 |
| `src/game/scenes/MainMenuScene.ts` | Frontend Engineer | 2.6 |
| `src/game/scenes/ShopScene.ts` | Senior Frontend Engineer | 2.7 |
| `src/game/objects/Gem.ts` | Game Engineer | 3.1 |
| `src/game/systems/OfferManager.ts` | Game Engineer | 4.3 |

---

## Workflow Per Task

1. **Agent receives task** → reads relevant design spec sections + engineering assessment
2. **Agent writes plan** → code approach, structure, algorithms → submits to Engineering Lead
3. **Engineering Lead reviews plan** → approves or requests changes
4. **Agent implements** → writes code following plan
5. **Agent verifies** → runs `npm run build` (must pass), tests in browser
6. **Engineering Lead code review** → checks for: naming issues, hardcoded values, inconsistencies, memory leaks, security vulnerabilities, bugs
7. **Agent iterates** until approved
8. **Task marked complete**

---

## Code Quality Standards (All Agents Must Follow)

1. **Zero hardcoded values** — all numbers go to Constants.ts or file-top const blocks
2. **Timer/tween cleanup** — stored reference, null-check, cleanup in shutdown()
3. **Use GlModal for all modals** — no manual backdrop+dialog construction
4. **Integer pixel positions** — `Math.round()` for all computed x/y coordinates
5. **Sprite-based rendering** — use Image game objects, not Graphics, for all visual elements that have sprite assets
6. **No unused imports** — `noUnusedLocals: true` in tsconfig
7. **Prefix unused params** — `_paramName` pattern
8. **Logging** — every public method, error path, and state transition must log

---

## Success Criteria

- [ ] All 20 user-reported issues resolved
- [ ] All text renders crisply on retina displays
- [ ] All gem and UI elements use sprite assets (not Graphics shapes)
- [ ] No overlapping elements on any screen
- [ ] Consistent spacing across all screens
- [ ] Boosters functional in gameplay (Hammer, Rainbow)
- [ ] Shop items show descriptions and imagery
- [ ] Modals properly sized with no overlap
- [ ] Level difficulty appropriately challenging
- [ ] Build size < 2MB
- [ ] No console errors during normal gameplay flow
- [ ] No memory leaks (10 scene transitions without issues)
