# Product Audit: Jest Submission Readiness Assessment

**Date:** 2026-03-02
**Author:** Principal Product Manager
**Verdict:** NOT READY FOR SUBMISSION -- 4 ship-blocking issues, 3 high-priority issues

---

## 1. Executive Summary

The game has strong visual polish (beautiful backgrounds, gem sprites, UI headers) and solid technical foundations (142 assets, 5.06 MB build, 184 passing unit tests, 30 designed levels). However, four critical issues make it unplayable or unshippable:

1. The game board is invisible during gameplay (frame covers all gems)
2. Level Select is orphaned -- no navigation path reaches it
3. The settings button does nothing
4. The shop layout has overlapping elements

Until these are resolved, a Jest reviewer would reject the submission within 60 seconds.

---

## 2. Screen-by-Screen Assessment

### 2.1 Main Menu

**Visual quality: STRONG**
- Beautiful rainbow-falls background with lush waterfall scene
- Gem Link logo is prominent and readable
- Gem board preview grid is attractive with floating animation
- Play button uses the green sprite and pulses invitingly
- HUD shows lives (heart), coins (+), gems (+) -- standard casual game pattern
- Free Gift banner at bottom with CLAIM CTA is good monetization surface
- Level badge shows "Level 1" with star count -- nice progression signal

**Issues found:**
- SHIP-BLOCKER: Play button routes directly to `SCENE_GAMEPLAY` (line 374), completely bypassing Level Select. The PRD (D-6) explicitly requires a "Level select/map screen" with "Visual progression path with numbered levels, star indicators, current/locked states."
- SHIP-BLOCKER: Settings gear at top-right has `// TODO: Open settings modal` (line 179). A no-op interactive element is a Jest review red flag. Either implement it or remove it.
- MINOR: "Match-3 Puzzle" subtitle is generic. The PRD vision is social/competitive -- subtitle could hint at that.
- MINOR: Version label "v0.3.0" should not ship to production.

**Intended flow per PRD:**
```
Main Menu -> [Play] -> Level Select -> [Select Level] -> Gameplay
Main Menu -> [Shop/+] -> Shop
Main Menu -> [Settings] -> Settings Modal (sound, notifications, about)
```

**Actual flow:**
```
Main Menu -> [Play] -> Gameplay (SKIPS Level Select)
Main Menu -> [+] -> Shop
Main Menu -> [Settings] -> Nothing
Main Menu -> [Free Gift] -> Shop
```

### 2.2 Gameplay Scene

**Visual quality: BROKEN**
- The ornate-gold frame (ASSET_KEY_FRAME_BOARD) completely obscures the entire gem grid
- Only the top row of gems is partially visible peeking over the frame border
- The frame is set to depth 1 (line 312) while gems (Gem.ts Container objects) have no explicit depth set, meaning they render at default depth 0 -- BEHIND the frame
- Board dimensions: 8x8 grid at 48px cells = 384x384 board area starting at y=90
- Frame is sized to boardWidth+16 x boardHeight+16, covering the entire play area

**Root cause:** `frame.setDepth(1)` in GameplayScene line 312. Gems are Containers added to the scene with no depth set (defaulting to 0). The frame renders ON TOP of all gems.

**Fix required:** Either set `frame.setDepth(0)` and ensure gems are at depth >= 1, or give gems an explicit depth above the frame. The Constants file already has `Z_BOARD = 100` and `Z_GEMS = 200` defined but they are not used in the actual rendering code.

**Other issues:**
- SHIP-BLOCKER: Players literally cannot see or interact with gems. The game is unplayable.
- The HUD row (Level 1 / Moves: 22) renders correctly above the board
- The booster tray at bottom shows Hammer (x2), +3 Moves, Rainbow (x0) -- these render correctly
- No visible back button or quit button in the screenshots. The audit notes a "tiny quit X" but it is barely discoverable. Players who get stuck cannot easily exit.
- Progress bar area appears blank (may be hidden behind the frame)

### 2.3 Shop Scene

**Visual quality: FAIR -- needs layout work**
- Shop header sprite renders at top
- HUD is present with lives/coins/gems
- Currency Packs section: 4 cards (Beginner, Jumbo, Super, Mega)
- Boosters section: 3 tiles (Hammer, Rainbow, +3 Moves)
- Free Gift strip with CLAIM button at bottom
- Back arrow at bottom-left for navigation to Main Menu

**Issues found:**
- HIGH: Cards and tiles visually overlap. The currency cards end at y~270 and booster title starts at y=280 -- only 10px gap. With card height of 130px, the bottom of currency cards at y=140+130=270 butts up against the booster title. This feels cramped.
- HIGH: The back arrow is at (36, 478), which is buried between the free gift strip (y=400-456) and the bottom edge. It is small (32px) and positioned in an unusual location. Standard practice puts back buttons at top-left.
- MEDIUM: Buy button labels show "2T", "5T", "10T", "27T" -- the "T" for Tokens is not intuitive. First-time players will not know what "T" means. The PRD specifies using Jest Tokens which map to dollars. Consider "$2", "$5" etc. or "2 Tokens".
- MEDIUM: No visual indication of what each pack contains. The description text at 11px on a small card is very hard to read.
- MINOR: The Shop HUD "+" buttons do not appear to have click handlers (line 188 shows `new GlHUD(this)` with no `.onAllPlusClick()`), unlike the Main Menu HUD which routes to Shop.

**Monetization flow assessment:**
- The purchase confirmation modal (initiateConfirmation) is well-implemented: shows product icon, name, description, price, Buy Now + Cancel buttons
- PaymentManager integration is present for Jest SDK purchases
- Product delivery logic handles all SKUs
- CelebrationSystem fires on successful purchase -- good dopamine hit
- Error toast displays on failure
- Lives-full check prevents wasted refill purchase
- The fundamental monetization pipeline WORKS if you can navigate to and use the shop

### 2.4 Level Select Scene

**Visual quality: STRONG -- but unreachable**
- Crystal-canyon-sunset background is visually impressive
- 30 level nodes in a winding path with S-curves (5 columns)
- Level 1 shows unlocked with gold border + glow ring animation
- Locked levels show with gray circles and lock icons
- Level header sprite at top
- Play button at bottom center
- Back arrow at bottom-left
- Star dots below completed levels
- Vertical scrolling implemented for the full 30-level map

**Issues found:**
- SHIP-BLOCKER: This scene is orphaned. No scene in the game transitions to `SCENE_LEVEL_SELECT`. The Main Menu Play button goes directly to Gameplay. This is the single most important navigation bug in the game.
- MEDIUM: When a level node is tapped, it only updates `this.currentLevel` (line 271) but gives no visual feedback to the player that the level was selected. There should be a highlighted state or selection indicator.
- MINOR: The Play button at the bottom does not show which level will be played. It should say "Play Level 1" or similar.

---

## 3. Critical Path Analysis: Can a Player Play This Game End-to-End?

### Current state: NO

| Step | Status | Blocker |
|------|--------|---------|
| 1. Open game | OK | Loads to Main Menu |
| 2. Tap Play | BROKEN | Skips Level Select, goes to Gameplay |
| 3. See the board | BROKEN | Frame covers all gems |
| 4. Make a match | BROKEN | Cannot see or tap gems |
| 5. Complete a level | BROKEN | Cannot play |
| 6. See results | BLOCKED | Never reaches LevelComplete |
| 7. Progress to next level | BLOCKED | Never completes a level |
| 8. Visit Shop | OK | Via HUD "+" or Free Gift banner |
| 9. Purchase an item | LIKELY OK | PaymentManager integrated, but untestable without Jest SDK |
| 10. Return to menu | OK | Shop back arrow works |

**The game is 100% unplayable in its current state.** A first-time player will tap Play, see an ornate gold frame with no visible gems, and immediately exit.

---

## 4. Navigation Architecture: Current vs. Required

### Current (Broken)
```
Boot -> Preload -> MainMenu
                     |--[Play]--> Gameplay (board invisible)
                     |--[+/Gift]--> Shop --[Back]--> MainMenu
                     |--[Settings]--> (nothing)
                   LevelSelect (orphaned, unreachable)
```

### Required (PRD-Aligned)
```
Boot -> Preload -> MainMenu
                     |--[Play]--> LevelSelect --[Select + Play]--> Gameplay -> LevelComplete -> LevelSelect
                     |--[Shop/+]--> Shop --[Back]--> MainMenu
                     |--[Settings]--> Settings Modal (sound toggle, notifications, about)
                     |--[Free Gift]--> Shop
```

### Changes needed:
1. MainMenu `onPlayTap()` should route to `SCENE_LEVEL_SELECT` instead of `SCENE_GAMEPLAY`
2. LevelSelect should pass the selected level to Gameplay
3. LevelComplete should route back to LevelSelect (not MainMenu)
4. Settings should open a modal with sound toggle at minimum
5. Gameplay should have a clearly visible back/quit button

---

## 5. Ship-Blocking Issues (Must Fix Before Submission)

| # | Issue | Severity | Scene | Effort |
|---|-------|----------|-------|--------|
| S1 | Game board invisible -- frame depth covers gems | SHIP-BLOCKER | Gameplay | Small (depth fix) |
| S2 | Level Select orphaned -- no route from Main Menu | SHIP-BLOCKER | MainMenu | Small (change scene target) |
| S3 | Settings gear is a no-op | SHIP-BLOCKER | MainMenu | Medium (build modal) |
| S4 | Gameplay has no visible exit button | SHIP-BLOCKER | Gameplay | Small (add back button) |

## 6. High-Priority Issues (Should Fix Before Submission)

| # | Issue | Severity | Scene | Effort |
|---|-------|----------|-------|--------|
| H1 | Shop layout cramped -- cards/tiles overlap | HIGH | Shop | Medium (adjust Y anchors) |
| H2 | Shop back arrow buried at bottom-left at y=478 | HIGH | Shop | Small (move to top-left) |
| H3 | Level Select node tap has no visual feedback | HIGH | LevelSelect | Small (add highlight) |

## 7. Medium/Low Priority Issues

| # | Issue | Scene | Notes |
|---|-------|-------|-------|
| M1 | Buy button "T" labels not intuitive | Shop | Change to "$" or "Tokens" |
| M2 | Play button on Level Select does not show level number | LevelSelect | "Play Level N" |
| M3 | Version label "v0.3.0" visible in production | MainMenu | Remove or hide |
| M4 | Z-depth constants defined but unused | All | Use Z_BOARD, Z_GEMS, Z_HUD consistently |
| M5 | No onboarding flow exists | -- | PRD D-11 requires 3-screen onboarding |
| M6 | No registration prompt at Level 3 | Gameplay | PRD G-3 requirement |
| M7 | LevelComplete routing unknown | LevelComplete | Should route to LevelSelect, not MainMenu |

---

## 8. Jest Platform Submission Readiness Checklist

| Requirement | Status | Notes |
|-------------|--------|-------|
| Game loads in under 3 seconds | LIKELY OK | 5.06 MB build, async asset loading |
| Guest mode works (no forced registration) | OK | No registration gates exist |
| Core gameplay functional | FAIL | Board invisible, game unplayable |
| SHAFT compliance | OK | No sex, hate, alcohol, firearms, tobacco content |
| Bundle under 10 MB | OK | 5.06 MB |
| All interactive elements functional | FAIL | Settings gear no-op |
| Navigation complete (no dead ends) | FAIL | Level Select orphaned |
| IAP products registered | UNKNOWN | Need to register SKUs in Jest Developer Console |
| Explore card assets ready | NOT STARTED | Need hero image, icon, description |
| Notification templates defined | NOT STARTED | PRD requires 10+ templates |

**Overall submission readiness: 30%** -- the foundation is solid but the game is unplayable.

---

## 9. Recommended Fix Order

Priority sequence optimized for fastest path to a playable submission candidate:

1. **Fix gem depth** (S1) -- 15 minutes. Set frame to Z_BOARD depth, gems to Z_GEMS depth. This single fix makes the game playable.
2. **Route Play to Level Select** (S2) -- 10 minutes. Change `onPlayTap()` to route to `SCENE_LEVEL_SELECT`.
3. **Add visible quit button to Gameplay** (S4) -- 20 minutes. Add back arrow or X button at top-left of gameplay HUD.
4. **Build minimal Settings modal** (S3) -- 30 minutes. Sound on/off toggle, version info, "About" text.
5. **Fix Shop layout spacing** (H1+H2) -- 30 minutes. Increase Y gaps, move back arrow to top-left.
6. **Level Select polish** (H3+M2) -- 20 minutes. Node selection feedback, "Play Level N" label.

Total estimated engineering time for ship-blocking fixes: approximately 2 hours.

---

## 10. What Is Working Well

Credit where due -- significant progress has been made:

- **Asset pipeline** is excellent: 142 assets processed, automated script, review page
- **Visual quality** of backgrounds, gems, and UI sprites is above-average for Jest games
- **Monetization infrastructure** is complete: 7 SKUs, confirmation modal, payment flow, celebration animations
- **Game systems** are solid: BoardManager, MatchEngine, ScoreSystem, InputHandler, 30 levels with seeded deterministic boards
- **Free Gift system** with cooldown timer and claim flow
- **Life regeneration** with timer display
- **No-lives modal** with shop redirect
- **Build hygiene**: TypeScript compiles clean, 184 unit tests pass, 5.06 MB build

The engineering quality is high. The bugs are surface-level (wrong depth, wrong scene target) rather than architectural. Two hours of focused fixes would make this a legitimate submission candidate.
