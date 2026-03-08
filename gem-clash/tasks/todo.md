# Gem Link -- Submission Readiness Audit

**Date:** 2026-03-02
**Auditor:** Project Manager
**Build Status:** Compiles clean, 5.2 MB (under 10 MB limit)
**Tests:** 184 unit tests passing

---

## Overall Readiness: ~65% for Jest Submission

The game compiles, renders all 5 core scenes, and has a working match-3 engine
with 30 levels. However, 6 issues (2 critical, 2 high, 2 medium) must be
resolved before submission. The critical gameplay board bug alone makes the
game unplayable in its current state.

---

## BLOCKING ISSUES (ordered by priority)

### P0-1: Gameplay Board Invisible -- Frame Depth Covers Gems
- **Severity:** P0 CRITICAL -- game is unplayable
- **File:** `src/game/scenes/GameplayScene.ts` line 312
- **Root Cause:** `frame.setDepth(1)` puts the ornate-gold frame ON TOP of all
  gems (which have default depth 0). The frame covers the entire board.
- **Screenshot:** audit-02-gameplay.png -- large gold frame fills viewport,
  only top row of gems barely visible
- **Fix:** Change `frame.setDepth(1)` to `frame.setDepth(-1)` so the frame
  renders behind the board background and gems.
- **Effort:** 5 minutes (one-line change)
- **Owner:** Game Engineer
- **Status:** [ ] Not started

### P0-2: Level Select Unreachable -- No Navigation Path
- **Severity:** P0 CRITICAL -- entire scene is orphaned
- **Files:** `src/game/scenes/MainMenuScene.ts` lines 364-375
- **Root Cause:** The Play button on MainMenu calls
  `fadeTransition(this, SCENE_GAMEPLAY, { levelId })`, bypassing Level Select
  entirely. There is no button, link, or gesture that navigates to
  SCENE_LEVEL_SELECT from any scene.
- **Impact:** Level Select scene exists and works (screenshot confirms
  functional node grid with path) but players can never reach it. The only
  entry point is via developer tools.
- **Fix:** Change the Play button to navigate to SCENE_LEVEL_SELECT instead of
  SCENE_GAMEPLAY. Level Select already has its own Play button that launches
  the selected level into SCENE_GAMEPLAY.
- **Effort:** 15 minutes (change navigation target + test flow)
- **Owner:** Frontend Engineer
- **Status:** [ ] Not started

### P1-1: Shop Layout Overlap
- **Severity:** P1 HIGH -- usability issue, affects monetization
- **File:** `src/game/scenes/ShopScene.ts` (layout Y anchors, lines 53-59)
- **Root Cause:** Currency cards (Y_CURRENCY_CARDS_TOP=140, CARD_H=130),
  booster tiles (Y_BOOSTER_TILES_TOP=308, TILE_H=88), free gift strip
  (Y_FREE_GIFT_TOP=400, GIFT_H=56), and back button (Y_BACK_BTN_CENTER=478)
  are stacked into a 600px viewport with no scroll, causing elements to
  overlap at the bottom. The back button at Y=478 sits on top of the free
  gift strip which ends at Y=456.
- **Screenshot:** audit-04-shop.png -- elements cramped but mostly readable;
  bottom section overlaps
- **Fix:** Either (a) add vertical scrolling to the shop, or (b) reduce
  spacing/sizes to fit within viewport, or (c) compress free gift strip and
  shift back button down. Approach (b) is fastest.
- **Effort:** 30-45 minutes
- **Owner:** Senior Frontend Engineer
- **Status:** [ ] Not started

### P1-2: Settings Gear Has No Handler
- **Severity:** P1 HIGH -- broken interactive element
- **File:** `src/game/scenes/MainMenuScene.ts` line 179
- **Root Cause:** `// TODO: Open settings modal` -- the pointerdown handler
  logs a message but does nothing.
- **Impact:** Players see a clickable gear icon that does nothing. This fails
  the "all states handled" quality gate.
- **Fix:** Either (a) implement a minimal settings modal (sound on/off,
  music on/off, credits), or (b) remove the gear icon until settings is
  implemented. Option (b) is safer pre-submission.
- **Effort:** 10 minutes to remove, 1-2 hours to implement
- **Owner:** Frontend Engineer
- **Status:** [ ] Not started

### P2-1: No Back/Pause Button Visible in Gameplay
- **Severity:** P2 MEDIUM -- UX friction
- **File:** `src/game/scenes/GameplayScene.ts` lines 268-273
- **Root Cause:** A quit button exists at position (24, headerCenterY) as a
  small 28x28 "X" icon in the top-left corner. It works (launches a confirm
  modal) but is not obvious to players.
- **Screenshot:** audit-02-gameplay.png -- quit button is barely visible
  behind the frame (and currently hidden by the P0-1 bug)
- **Fix:** After fixing P0-1, verify the quit button is visible. Consider
  increasing its visual prominence or adding a label.
- **Effort:** 15 minutes (verify after P0-1 fix, minor styling if needed)
- **Owner:** Game Engineer
- **Status:** [ ] Not started (blocked by P0-1)

### P2-2: LevelComplete Scene Transition Not Testable via __GAME__
- **Severity:** P2 MEDIUM -- testing gap
- **Root Cause:** Playwright audit could not capture the LevelComplete scene
  because scene.start via __GAME__ did not successfully trigger the
  transition.
- **Impact:** Cannot verify LevelComplete UI in automated testing. Manual
  testing is required.
- **Fix:** Add a helper method on __GAME__ or use scene.launch instead of
  scene.start. Alternatively, play through a level in the e2e test.
- **Effort:** 30 minutes
- **Owner:** Game Engineer
- **Status:** [ ] Not started

---

## FIX ORDER (recommended sprint plan)

| Order | Issue | Est. Time | Dependency |
|-------|-------|-----------|------------|
| 1 | P0-1 Frame depth | 5 min | None |
| 2 | P0-2 Level Select nav | 15 min | None |
| 3 | P1-1 Shop layout | 30-45 min | None |
| 4 | P1-2 Settings gear | 10 min | None |
| 5 | P2-1 Quit button visibility | 15 min | After P0-1 |
| 6 | P2-2 LevelComplete testing | 30 min | After P0-1 |

Total estimated effort: ~2 hours

---

## SUBMISSION CHECKLIST STATUS

| Requirement | Status | Notes |
|-------------|--------|-------|
| Build under 10MB | PASS | 5.2 MB |
| index.html entry point | PASS | Works |
| All assets bundled (no CDN) | PASS | All in dist/ |
| Guest mode (10 levels) | BLOCKED | Level Select unreachable (P0-2) |
| TypeScript strict mode | PASS | tsc --noEmit clean |
| SHAFT compliance | NEEDS REVIEW | No obvious violations |
| SKUs registered | NOT STARTED | Developer Console pending |
| Explore card | NOT STARTED | Asset needed |
| Notification templates (3) | NOT STARTED | Backend work |
| Build archive | PASS | dist/ ready |
| Three-tier testing | PARTIAL | Unit tests pass; e2e partial |

---

## WHAT IS WORKING WELL

- **Main Menu (audit-01):** Logo, gem board preview, Play button, HUD with
  lives/coins/gems, free gift banner, version label all rendering correctly.
  Background image (rainbow-falls) looks polished.
- **Level Select (audit-06):** Winding path with 30 nodes, level header sprite,
  back button, Play button all present. First node shows as active with
  glow ring. Background (crystal-canyon) renders well.
- **Shop (audit-04):** All 4 currency packs and 3 boosters render with icons,
  labels, and buy buttons. Shop header sprite at top. Free gift strip
  present. Layout just needs spacing adjustment.
- **Match-3 Engine:** 30 levels designed, seeded boards, scoring system,
  cascades, special gems, boosters, fail modal, and level complete flow
  all implemented.
- **Asset Pipeline:** 142 assets processed, sprite-based digits, progress bar,
  frames, backgrounds all integrated.
- **Code Quality:** TypeScript strict mode, structured logging throughout,
  scene lifecycle cleanup, graceful fallbacks for missing textures.

---

## Previous TODO (completed)
- [x] Yellow gem: citrine-triangle -> yellow-wide-radiant
- [x] Star/6th gem: aqua-shield -> orange-wide-chevron
- [x] Menu bg -> rainbow-falls
- [x] Gameplay bg -> highland-valley
- [x] Level Select bg -> crystal-canyon
- [x] Level frame -> ornate-gold
- [x] Play green sprite
- [x] Arrow left/right integration
- [x] Settings gear on MainMenu
- [x] Shop/Level headers
- [x] Progress bar sprites
- [x] Digit sprites for score
- [x] Level complete sprite
- [x] Green banner fallback
