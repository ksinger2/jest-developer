# TASK-005: Scene Architecture Plan

**Author:** Game Engineer
**Status:** PENDING PE APPROVAL
**Date:** 2026-02-27
**Dependencies:** TASK-001 (Logger), TASK-002 (Project scaffold)

---

## 1. What I'll Build

### 1.1 File Manifest

All files live under `src/game/scenes/`.

| # | File Path | Class Name | Est. Lines | Purpose |
|---|-----------|------------|------------|---------|
| 1 | `BootScene.ts` | `BootScene` | ~90 | SDK init stub, load player data, transition to PreloadScene |
| 2 | `PreloadScene.ts` | `PreloadScene` | ~120 | Asset loading with progress bar, transition to MainMenuScene |
| 3 | `MainMenuScene.ts` | `MainMenuScene` | ~130 | Menu UI: Play, Level Select, Shop buttons |
| 4 | `GameplayScene.ts` | `GameplayScene` | ~110 | Match-3 board shell (placeholder for engine integration) |
| 5 | `LevelCompleteScene.ts` | `LevelCompleteScene` | ~120 | Score display, star rating, next/retry buttons |
| 6 | `LevelSelectScene.ts` | `LevelSelectScene` | ~150 | 30-level grid with lock/unlock/star states |
| 7 | `ShopScene.ts` | `ShopScene` | ~100 | Product catalog display with purchase buttons |
| 8 | `index.ts` | _(barrel export)_ | ~15 | Re-exports all scene classes for Phaser config registration |

**Total estimated:** ~835 lines across 8 files.

---

### 1.2 Scene Details

#### 1.2.1 BootScene

**File:** `src/game/scenes/BootScene.ts`
**Class:** `BootScene extends Phaser.Scene`
**Scene Key:** `'BootScene'`

**Methods:**
| Method | Responsibility |
|--------|---------------|
| `constructor()` | Call `super({ key: 'BootScene' })` |
| `init()` | Log scene entry. No data expected (this is the entry point). |
| `create()` | 1. Log SDK initialization start. 2. Call SDK init stub (try/catch with error logging). 3. Load player progress from registry/stub, store in scene registry via `this.registry.set('playerProgress', data)`. 4. Log loaded data summary. 5. Transition to PreloadScene. |

**Data received via `scene.start()`:** None (entry point).
**Data passed out:** Sets `playerProgress: PlayerProgress` on the Phaser scene registry.
**Transitions to:** `PreloadScene`

---

#### 1.2.2 PreloadScene

**File:** `src/game/scenes/PreloadScene.ts`
**Class:** `PreloadScene extends Phaser.Scene`
**Scene Key:** `'PreloadScene'`

**Methods:**
| Method | Responsibility |
|--------|---------------|
| `constructor()` | Call `super({ key: 'PreloadScene' })` |
| `init()` | Log scene entry. |
| `preload()` | 1. Create progress bar graphics (rectangle outline + fill). 2. Listen to `this.load.on('progress', cb)` to update bar width and log progress at 25%/50%/75%/100% milestones. 3. Listen to `this.load.on('complete', cb)` to log completion. 4. Queue all game assets (placeholder calls: gem sprites, UI images, audio). Assets will be stub paths during shell phase -- they won't fail because we guard with `on('loaderror')`. |
| `create()` | 1. Log all assets loaded. 2. Destroy progress bar graphics. 3. Transition to MainMenuScene. |

**Data received via `scene.start()`:** None (arrives from BootScene automatically).
**Data passed out:** None directly; assets are now in Phaser's texture/audio cache.
**Transitions to:** `MainMenuScene`

---

#### 1.2.3 MainMenuScene

**File:** `src/game/scenes/MainMenuScene.ts`
**Class:** `MainMenuScene extends Phaser.Scene`
**Scene Key:** `'MainMenuScene'`

**Methods:**
| Method | Responsibility |
|--------|---------------|
| `constructor()` | Call `super({ key: 'MainMenuScene' })` |
| `init()` | Log scene entry. Read `playerProgress` from registry for display purposes (lives count, total stars). |
| `create()` | 1. Log UI construction start. 2. Render game title text (Phaser.GameObjects.Text). 3. Create "Play" button -- on click: start GameplayScene with `{ levelId: playerProgress.currentLevel }`. 4. Create "Level Select" button -- on click: start LevelSelectScene. 5. Create "Shop" button -- on click: launch ShopScene as overlay OR start ShopScene (see Design Decision below). 6. Log UI construction complete with button count. |

**Data received via `scene.start()`:** Optional `{ returnFrom?: string }` to log where the player came back from.
**Data passed out:** Varies by button (see transitions).
**Transitions to:** `GameplayScene`, `LevelSelectScene`, `ShopScene`

**Design Decision -- Shop as Overlay vs. Full Scene:**
I will implement ShopScene as a full scene (using `scene.start()`), not an overlay. Rationale: overlays with `scene.launch()` add complexity around pausing the underlying scene and z-order management. If the PE prefers overlay behavior, I can refactor to use `scene.launch('ShopScene')` + `scene.pause()` on the calling scene, then `scene.resume()` on return. Both approaches are compatible with the shell architecture. **Requesting PE guidance on this.**

---

#### 1.2.4 GameplayScene

**File:** `src/game/scenes/GameplayScene.ts`
**Class:** `GameplayScene extends Phaser.Scene`
**Scene Key:** `'GameplayScene'`

**Methods:**
| Method | Responsibility |
|--------|---------------|
| `constructor()` | Call `super({ key: 'GameplayScene' })` |
| `init(data)` | Log scene entry + received data. Store `this.levelId` from `data.levelId`. Validate levelId is a number 1-30; log error if invalid. |
| `create()` | 1. Log level setup start with levelId. 2. Create placeholder board area (colored rectangle representing the 8x8 grid). 3. Create HUD shell: score text, moves remaining text, pause button. 4. Log "board shell ready -- awaiting match engine integration (future task)". 5. **Temporary:** Add a "Simulate Win" button and "Simulate Lose" button for testing scene flow. "Simulate Win" triggers transition to LevelCompleteScene with mock LevelResult. "Simulate Lose" triggers transition to LevelCompleteScene with `stars: 0, passed: false`. |
| `update(time, delta)` | Stub -- logs nothing (will be used by match engine later). Included as an empty method signature for future integration. |

**Data received via `scene.start()`:** `{ levelId: number }`
**Data passed out:** `LevelResult` to LevelCompleteScene.
**Transitions to:** `LevelCompleteScene`, `MainMenuScene` (via pause/quit)

---

#### 1.2.5 LevelCompleteScene

**File:** `src/game/scenes/LevelCompleteScene.ts`
**Class:** `LevelCompleteScene extends Phaser.Scene`
**Scene Key:** `'LevelCompleteScene'`

**Methods:**
| Method | Responsibility |
|--------|---------------|
| `constructor()` | Call `super({ key: 'LevelCompleteScene' })` |
| `init(data)` | Log scene entry + received data. Store `this.levelResult: LevelResult` from data. Validate required fields exist; log error if missing. |
| `create()` | 1. Log result display start. 2. Show "Level Complete!" or "Level Failed" header based on `levelResult.passed`. 3. Display score, stars earned (render 1-3 star icons or 0 for failure), moves used. 4. If passed: update `playerProgress` in registry (advance `currentLevel` if this was the highest, store star rating). Log progress update. 5. Create "Next Level" button (only if passed and levelId < 30) -- starts GameplayScene with `{ levelId: levelResult.levelId + 1 }`. 6. Create "Retry" button -- starts GameplayScene with `{ levelId: levelResult.levelId }`. 7. Create "Menu" button -- starts MainMenuScene. 8. Log UI construction complete. |

**Data received via `scene.start()`:** `{ levelResult: LevelResult }`
**Data passed out:** Updates `playerProgress` in registry. Passes `{ levelId }` to GameplayScene.
**Transitions to:** `GameplayScene` (next/retry), `MainMenuScene` (menu)

---

#### 1.2.6 LevelSelectScene

**File:** `src/game/scenes/LevelSelectScene.ts`
**Class:** `LevelSelectScene extends Phaser.Scene`
**Scene Key:** `'LevelSelectScene'`

**Methods:**
| Method | Responsibility |
|--------|---------------|
| `constructor()` | Call `super({ key: 'LevelSelectScene' })` |
| `init()` | Log scene entry. Read `playerProgress` from registry. |
| `create()` | 1. Log grid construction start. 2. Read `playerProgress.currentLevel` and `playerProgress.stars`. 3. Create a 6-column x 5-row grid of level buttons (30 total). Each button: a) If `levelId <= currentLevel`: render as unlocked. Show star rating (0-3 stars from `playerProgress.stars[levelId]`). On click: start GameplayScene with `{ levelId }`. b) If `levelId > currentLevel`: render as locked (greyed out, lock icon placeholder). On click: log "Level {id} is locked" -- no transition. 4. Create "Back" button -- starts MainMenuScene. 5. Log grid complete with `{ unlockedCount, totalStars }`. |

**Data received via `scene.start()`:** None.
**Data passed out:** `{ levelId: number }` to GameplayScene.
**Transitions to:** `GameplayScene`, `MainMenuScene` (back)

---

#### 1.2.7 ShopScene

**File:** `src/game/scenes/ShopScene.ts`
**Class:** `ShopScene extends Phaser.Scene`
**Scene Key:** `'ShopScene'`

**Methods:**
| Method | Responsibility |
|--------|---------------|
| `constructor()` | Call `super({ key: 'ShopScene' })` |
| `init()` | Log scene entry. Read `playerProgress` from registry (to show current lives count, etc.). |
| `create()` | 1. Log shop construction start. 2. Iterate over `PRODUCT_CATALOG` from `game.types.ts`. 3. For each `ProductInfo`: render name, description, price. Create a "Buy" button that logs `purchase_started` event with SKU and emits `GameEvent.PURCHASE_STARTED` via the Phaser event system. (Actual purchase flow is handled by SDK integration in a future task -- button click only logs + emits for now.) 4. Create "Back" button -- starts MainMenuScene. 5. Log shop complete with product count. |

**Data received via `scene.start()`:** None (could accept `{ returnTo?: string }` in future for overlay mode).
**Data passed out:** Emits `GameEvent.PURCHASE_STARTED` events.
**Transitions to:** `MainMenuScene` (back)

---

#### 1.2.8 index.ts (Barrel Export)

**File:** `src/game/scenes/index.ts`

```typescript
export { BootScene } from './BootScene';
export { PreloadScene } from './PreloadScene';
export { MainMenuScene } from './MainMenuScene';
export { GameplayScene } from './GameplayScene';
export { LevelCompleteScene } from './LevelCompleteScene';
export { LevelSelectScene } from './LevelSelectScene';
export { ShopScene } from './ShopScene';
```

This barrel export allows the Phaser config to import all scenes in one line:
```typescript
import { BootScene, PreloadScene, MainMenuScene, ... } from './game/scenes';
```

---

### 1.3 Scene Transition Map

```
                    +------------+
                    | BootScene  |
                    +-----+------+
                          |
                          v
                    +------------+
                    | PreloadScene|
                    +-----+------+
                          |
                          v
                  +----------------+
          +-------| MainMenuScene  |-------+
          |       +---+--------+---+       |
          |           |        |           |
          v           v        v           v
   +-----------+ +--------+ +---------+
   |LevelSelect| |Gameplay| |ShopScene|
   +-----------+ |  Scene | +---------+
          |       +---+----+       |
          |           |            |
          |           v            |
          |  +----------------+    |
          |  |LevelComplete   |    |
          |  |     Scene      |    |
          |  +--+-----+---+--+    |
          |     |     |   |       |
          |     | Retry   |       |
          |     v     |   v       |
          |  Gameplay |  MainMenu |
          |   Scene   |   Scene   |
          |           v           |
          +----> GameplayScene    |
          |      (from level btn) |
          +--------> MainMenuScene<-+
```

**Complete transition table:**

| From | To | Trigger | Data Passed |
|------|----|---------|-------------|
| BootScene | PreloadScene | Auto (after init) | None |
| PreloadScene | MainMenuScene | Auto (after load) | None |
| MainMenuScene | GameplayScene | "Play" button | `{ levelId: number }` |
| MainMenuScene | LevelSelectScene | "Level Select" button | None |
| MainMenuScene | ShopScene | "Shop" button | None |
| LevelSelectScene | GameplayScene | Level button click | `{ levelId: number }` |
| LevelSelectScene | MainMenuScene | "Back" button | None |
| GameplayScene | LevelCompleteScene | Level ends | `{ levelResult: LevelResult }` |
| GameplayScene | MainMenuScene | Pause > Quit | None |
| LevelCompleteScene | GameplayScene | "Next Level" button | `{ levelId: number }` |
| LevelCompleteScene | GameplayScene | "Retry" button | `{ levelId: number }` |
| LevelCompleteScene | MainMenuScene | "Menu" button | None |
| ShopScene | MainMenuScene | "Back" button | None |

---

## 2. Integration Points

### 2.1 I Depend On

| Dependency | Task | What I Import | Status |
|-----------|------|---------------|--------|
| Logger | TASK-001 | `Logger` class from `src/utils/Logger.ts` | COMPLETE -- file exists |
| Project scaffold | TASK-002 | Directory structure (`src/game/scenes/` exists), Phaser dependency | ASSUMED COMPLETE -- directories exist |
| Shared types | PE-owned | `LevelResult`, `PlayerProgress`, `DEFAULT_PLAYER_PROGRESS`, `LevelData`, `GameEvent`, `PRODUCT_CATALOG`, `ProductInfo`, `StarRating`, `GUEST_LEVEL_LIMIT` from `src/types/game.types.ts` | COMPLETE -- file exists |

### 2.2 Others Depend On Me

| Consumer | What They Need | Contract |
|----------|---------------|----------|
| Frontend Engineer (UI overlay) | Scene keys to overlay UI onto (e.g., HUD overlay on GameplayScene). They need to know scene keys are stable strings. | Scene keys are the class names: `'BootScene'`, `'PreloadScene'`, `'MainMenuScene'`, `'GameplayScene'`, `'LevelCompleteScene'`, `'LevelSelectScene'`, `'ShopScene'` |
| Game Engineer (future self) | GameplayScene shell with `init(data)` accepting `{ levelId }`, `create()` with board area placeholder, and `update()` hook for the match engine. | GameplayScene exposes these methods and stores `this.levelId`. Match engine will populate the board area created in `create()`. |
| Phaser config owner | Barrel export of all scene classes for the `scene: [...]` array in Phaser game config. | `src/game/scenes/index.ts` exports all 7 scene classes. |

### 2.3 Shared Types I'll Import

From `src/types/game.types.ts`:
- `PlayerProgress` -- stored in Phaser registry, read by most scenes
- `DEFAULT_PLAYER_PROGRESS` -- used by BootScene when no saved data exists
- `LevelResult` -- passed from GameplayScene to LevelCompleteScene
- `StarRating` -- used by LevelSelectScene for star display
- `GameEvent` -- emitted by ShopScene for purchase events
- `PRODUCT_CATALOG` / `ProductInfo` -- iterated by ShopScene
- `GUEST_LEVEL_LIMIT` -- used by LevelSelectScene to determine max levels for guest mode

I will NOT import: `GemData`, `GemColor`, `SpecialGemType`, `GemState`, `GridPosition`, `SwapAction`, `Match`, `CascadeResult` -- these belong to the match engine (future task).

---

## 3. Logging Strategy

Every scene instantiates its own Logger: `private logger = new Logger('SceneName');`

### 3.1 Lifecycle Logging

| Scene | init() | create() | Transitions |
|-------|--------|----------|-------------|
| BootScene | `[BootScene.init] Scene entered` | `[BootScene.create] SDK init starting` / `[BootScene.create] Player data loaded { currentLevel, totalStars, lives }` / `[BootScene.create] Transitioning to PreloadScene` | N/A |
| PreloadScene | `[PreloadScene.init] Scene entered` | `[PreloadScene.preload] Loading assets...` / `[PreloadScene.preload] Progress: 25%` (at milestones) / `[PreloadScene.create] All assets loaded, transitioning to MainMenuScene` | N/A |
| MainMenuScene | `[MainMenuScene.init] Scene entered { returnFrom }` | `[MainMenuScene.create] Building menu UI` / `[MainMenuScene.create] Menu ready (3 buttons)` | `[MainMenuScene.create] Button clicked: Play { levelId }` / `Level Select` / `Shop` |
| GameplayScene | `[GameplayScene.init] Scene entered { levelId: 5 }` | `[GameplayScene.create] Building board shell for level 5` / `[GameplayScene.create] Board shell ready` | `[GameplayScene.create] Level ended, transitioning to LevelCompleteScene { passed, score, stars }` |
| LevelCompleteScene | `[LevelCompleteScene.init] Scene entered { levelResult: {...} }` | `[LevelCompleteScene.create] Displaying results: passed=true, score=1200, stars=2` / `[LevelCompleteScene.create] Progress updated { newCurrentLevel, newTotalStars }` | `[LevelCompleteScene.create] Button clicked: Next { levelId }` / `Retry` / `Menu` |
| LevelSelectScene | `[LevelSelectScene.init] Scene entered` | `[LevelSelectScene.create] Building level grid { unlockedCount: 5, totalStars: 12 }` | `[LevelSelectScene.create] Level selected { levelId }` / `[LevelSelectScene.create] Level locked, ignoring tap { levelId }` |
| ShopScene | `[ShopScene.init] Scene entered` | `[ShopScene.create] Building shop { productCount: 3 }` | `[ShopScene.create] Purchase initiated { sku, name, price }` |

### 3.2 Error Logging

Every scene wraps its `create()` body in a try/catch:

```
try {
  // ... scene logic
} catch (err) {
  this.logger.error('create', 'Failed to build scene', err);
  // Fallback: transition to MainMenuScene (or BootScene if we're early in the chain)
}
```

Specific error logs:
- `[BootScene.create] SDK init failed -- using defaults` (warn level)
- `[GameplayScene.init] Invalid levelId received` (error level, falls back to level 1)
- `[LevelCompleteScene.init] Missing levelResult data` (error level, returns to MainMenuScene)

### 3.3 Log Level Usage

| Level | When Used |
|-------|-----------|
| `debug` | Verbose details: individual button creation, grid cell rendering |
| `info` | Scene entry/exit, transitions, player progress updates |
| `warn` | Fallback paths: missing data handled gracefully, SDK stub warnings |
| `error` | Unrecoverable issues: missing required data, catch block entries |

---

## 4. Pre-Render Verification

### 4.1 Expected Console Output: Full Boot Flow

When the game starts, the console should show this exact sequence:

```
[BootScene.init] Scene entered
[BootScene.create] SDK init starting
[BootScene.create] SDK init complete (stub)
[BootScene.create] Player data loaded {"currentLevel":1,"totalStars":0,"lives":5}
[BootScene.create] Transitioning to PreloadScene
[PreloadScene.init] Scene entered
[PreloadScene.preload] Loading assets...
[PreloadScene.preload] Progress: 25%
[PreloadScene.preload] Progress: 50%
[PreloadScene.preload] Progress: 75%
[PreloadScene.preload] Progress: 100%
[PreloadScene.create] All assets loaded, transitioning to MainMenuScene
[MainMenuScene.init] Scene entered
[MainMenuScene.create] Building menu UI
[MainMenuScene.create] Menu ready (3 buttons)
```

### 4.2 Expected Console Output: Play Button Flow

After clicking "Play" from MainMenuScene:

```
[MainMenuScene.create] Button clicked: Play {"levelId":1}
[GameplayScene.init] Scene entered {"levelId":1}
[GameplayScene.create] Building board shell for level 1
[GameplayScene.create] Board shell ready -- awaiting match engine integration
```

### 4.3 Expected Console Output: Simulate Win Flow

After clicking "Simulate Win" in GameplayScene:

```
[GameplayScene.create] Level ended, transitioning to LevelCompleteScene {"passed":true,"score":1500,"stars":2}
[LevelCompleteScene.init] Scene entered {"levelResult":{"levelId":1,"score":1500,"stars":2,"movesUsed":15,"movesRemaining":5,"durationSeconds":120,"totalCascades":8,"passed":true}}
[LevelCompleteScene.create] Displaying results: passed=true, score=1500, stars=2
[LevelCompleteScene.create] Progress updated {"newCurrentLevel":2,"newTotalStars":2}
[LevelCompleteScene.create] Results UI ready (3 buttons)
```

### 4.4 Verification Checklist

Before marking TASK-005 as complete, I will verify:

- [ ] Every scene logs on `init()` entry with data received
- [ ] Every scene logs on `create()` with what is being built
- [ ] Every scene transition logs the from-scene, to-scene, and data passed
- [ ] The full Boot -> Preload -> MainMenu flow produces the exact console output in 4.1
- [ ] Clicking every button produces a logged transition
- [ ] Error cases (missing data) are caught and logged at error level
- [ ] No scene transition drops data silently (every `scene.start()` call with data has a corresponding `init(data)` that logs it)
- [ ] PlayerProgress in the registry is readable by all scenes that need it
- [ ] The barrel export in `index.ts` exports all 7 scene classes

---

## 5. Scene Data Flow

### 5.1 Data Passing Between Scenes

There are exactly two mechanisms for data flow:

**Mechanism 1: `scene.start()` data parameter (transient, per-transition)**

Used for data that is specific to a single transition:

```typescript
// Sender
this.scene.start('GameplayScene', { levelId: 5 });

// Receiver
init(data: { levelId: number }) {
  this.levelId = data.levelId;
}
```

| Data Object | Sender(s) | Receiver | Shape |
|-------------|-----------|----------|-------|
| Level selection | MainMenuScene, LevelSelectScene, LevelCompleteScene | GameplayScene | `{ levelId: number }` |
| Level result | GameplayScene | LevelCompleteScene | `{ levelResult: LevelResult }` |

**Mechanism 2: Phaser Scene Registry (persistent, shared state)**

Used for data that persists across the entire session and is read by multiple scenes:

```typescript
// Writer (BootScene, LevelCompleteScene)
this.registry.set('playerProgress', progressData);

// Reader (any scene)
const progress = this.registry.get('playerProgress') as PlayerProgress;
```

| Registry Key | Type | Writer(s) | Reader(s) |
|-------------|------|-----------|-----------|
| `'playerProgress'` | `PlayerProgress` | BootScene (initial load), LevelCompleteScene (updates after level end) | MainMenuScene, GameplayScene, LevelSelectScene, ShopScene, LevelCompleteScene |

### 5.2 Why Not EventBus for Scene Data?

The Phaser registry is the correct tool for persistent shared state. EventBus (`GameEvent` enum) is reserved for real-time gameplay events (gems matched, score updates, purchase flow). Scene data flow does not need pub/sub -- it is deterministic and synchronous at transition time.

However, ShopScene will emit `GameEvent.PURCHASE_STARTED` via `this.game.events.emit()` because purchase handling is asynchronous and crosses module boundaries (SDK integration). This is the one exception where a scene emits a GameEvent.

### 5.3 Data Flow Diagram

```
  BootScene
    |
    | registry.set('playerProgress', DEFAULT_PLAYER_PROGRESS)
    v
  PreloadScene
    |
    | (no data mutation)
    v
  MainMenuScene
    |  reads registry.get('playerProgress')
    |
    +---> GameplayScene  (data: { levelId })
    |       |  reads registry.get('playerProgress')
    |       |
    |       +---> LevelCompleteScene  (data: { levelResult })
    |               |  reads + WRITES registry 'playerProgress'
    |               |
    |               +---> GameplayScene (data: { levelId: next })
    |               +---> GameplayScene (data: { levelId: same })
    |               +---> MainMenuScene
    |
    +---> LevelSelectScene
    |       |  reads registry.get('playerProgress')
    |       +---> GameplayScene (data: { levelId })
    |       +---> MainMenuScene
    |
    +---> ShopScene
            |  reads registry.get('playerProgress')
            |  emits GameEvent.PURCHASE_STARTED
            +---> MainMenuScene
```

---

## 6. Risks & Mitigations

### Risk 1: Scene transitions can lose data

**Description:** If `scene.start('TargetScene', data)` is called but the target scene's `init(data)` does not capture the data before `create()` runs, the data is lost. Phaser passes data to `init()`, NOT to `create()`.

**Mitigation:** Every scene that receives data stores it on `this` in `init()`, never in `create()`. Pattern:

```typescript
private levelId!: number;  // definite assignment assertion

init(data: { levelId: number }): void {
  this.levelId = data.levelId ?? 1;  // fallback default
  this.logger.info('init', 'Scene entered', { levelId: this.levelId });
}
```

Additionally, every `init()` validates received data and logs a warning if defaults are used.

---

### Risk 2: Phaser scene lifecycle gotchas (init vs create order)

**Description:** Phaser's scene lifecycle is: `init()` -> `preload()` -> `create()` -> `update()`. On subsequent visits to the same scene (if the scene is not destroyed), `init()` is called again but the scene's state from the previous visit may persist if instance properties are not reset.

**Mitigation:**
- Every `init()` explicitly resets all scene-level state properties. No scene relies on state from a previous activation.
- We use `scene.start()` (which stops the current scene and starts the target) rather than `scene.switch()` or `scene.launch()` for all primary transitions. This means each scene goes through the full `init() -> create()` lifecycle every time.
- Document this pattern with a code comment at the top of every scene file.

---

### Risk 3: Registry data can become stale or corrupted

**Description:** Multiple scenes read/write `playerProgress` in the registry. If LevelCompleteScene writes a partial update, other scenes may read inconsistent state.

**Mitigation:**
- Only TWO scenes write to the registry: BootScene (initial load) and LevelCompleteScene (post-level update).
- LevelCompleteScene performs an atomic read-modify-write: read the full `PlayerProgress` object, mutate the necessary fields, write the entire object back. Never write individual fields.
- Every write logs the before and after state for debugging.

---

### Risk 4: PreloadScene fails with missing assets

**Description:** During the shell phase, no actual asset files exist in `assets/`. Phaser's loader will emit `loaderror` events.

**Mitigation:**
- Register a `this.load.on('loaderror', ...)` handler that logs the missing file at `warn` level but does NOT block the transition to MainMenuScene.
- All visual elements in the shell phase will use Phaser's built-in graphics primitives (rectangles, text) rather than loaded sprites. This means scenes are fully functional even with zero loaded assets.
- When real assets are added (future tasks), the PreloadScene loader calls are already in place -- we just need to update the file paths.

---

### Risk 5: ShopScene purchase buttons have no backend

**Description:** ShopScene renders "Buy" buttons, but there is no SDK purchase flow yet.

**Mitigation:**
- Buy buttons log the intent and emit `GameEvent.PURCHASE_STARTED` but perform no state mutation.
- A visible "[STUB]" label will appear next to the price on each product during the shell phase, making it obvious this is not functional yet.
- The GameEvent emission establishes the integration contract for the SDK engineer.

---

### Risk 6: LevelSelectScene must handle 30 buttons efficiently

**Description:** Rendering 30 interactive buttons in a grid could have layout or performance concerns on mobile.

**Mitigation:**
- Use a simple calculated grid layout: `x = col * cellWidth + offsetX`, `y = row * cellHeight + offsetY` for a 6x5 grid. No scroll container needed for 30 items at reasonable cell sizes.
- Each button is a lightweight Phaser.GameObjects.Container with a rectangle background + text + optional star indicators. No heavy game objects.
- Profile in browser dev tools before considering virtualization (almost certainly not needed for 30 items).

---

## 7. Open Questions for PE

1. **ShopScene: Full scene or overlay?** I have planned it as a full scene (`scene.start`). Should it instead be launched as an overlay (`scene.launch`) on top of MainMenuScene? This affects whether MainMenuScene pauses/resumes and whether the Shop has a semi-transparent background.

2. **GameplayScene pause menu:** Should a "Pause" button that opens a small overlay (resume/quit) be part of this task, or deferred to the match engine integration task? I have included a stub quit-to-menu path but not a full pause overlay.

3. **Scene registry typing:** Phaser's `this.registry.get()` returns `unknown`. Should I create a typed wrapper (e.g., `getPlayerProgress(): PlayerProgress`) in a shared utility, or is casting inline acceptable for the shell phase?

4. **Asset manifest:** Should PreloadScene load from a centralized asset manifest file (e.g., `src/game/assets.ts`), or should the load calls be inline in PreloadScene? A manifest file is cleaner but adds a file outside this task's scope.

---

_Plan ready for PE review. No code will be written until approval is received._

---

## 8. PE Approval

**Reviewer:** Principal Engineer
**Date:** 2026-02-27
**Status:** ✅ APPROVED — Proceed to implementation

### PE Assessment

This is an excellent plan. The scene architecture is well-designed with clear data flow, comprehensive logging, and sensible risk mitigations. The separation of transient data (scene.start) vs persistent state (registry) is correct. The verification checklist is thorough. No file ownership overlaps with other agents. All imports come from PE-owned shared types.

### Answers to Open Questions

**Q1: ShopScene — Full scene or overlay?**
**A: Full scene (`scene.start`).** Your rationale is correct. For Phase 1, simplicity wins. Overlays with `scene.launch()` + pause/resume add state management complexity we don't need yet. If we decide to add overlay behavior later (e.g., for a "quick buy" during gameplay), we can refactor ShopScene at that time — the interface contract (scene key, data shape) stays the same either way. **Proceed with full scene.**

**Q2: GameplayScene pause menu?**
**A: Defer to match engine integration task.** For the scene shell, the "Simulate Win/Lose" buttons are sufficient for testing flow. A proper pause menu (overlay with resume/quit/settings) should be built when the match engine is live and there's actually gameplay to pause. For now, include only the quit-to-menu path you've already planned. **No pause overlay in TASK-005.**

**Q3: Scene registry typing?**
**A: Create a typed helper utility.** Inline casting with `as PlayerProgress` is acceptable for the shell phase, BUT create a small utility now to prevent inconsistent casts later. Place it at `src/utils/RegistryHelper.ts`:

```typescript
import Phaser from 'phaser';
import { PlayerProgress, DEFAULT_PLAYER_PROGRESS } from '../types/game.types';

const REGISTRY_KEY_PLAYER_PROGRESS = 'playerProgress';

export function getPlayerProgress(registry: Phaser.Data.DataManager): PlayerProgress {
  return (registry.get(REGISTRY_KEY_PLAYER_PROGRESS) as PlayerProgress) ?? DEFAULT_PLAYER_PROGRESS;
}

export function setPlayerProgress(registry: Phaser.Data.DataManager, progress: PlayerProgress): void {
  registry.set(REGISTRY_KEY_PLAYER_PROGRESS, progress);
}
```

This keeps the registry key centralized (one constant, not 7 hardcoded strings), provides a fallback default, and gives scenes a clean import. This is ONE extra file (~15 lines) within your scope. Use it in all scenes instead of raw `registry.get/set` calls. **Create `RegistryHelper.ts` as part of TASK-005.**

**Q4: Asset manifest?**
**A: Inline in PreloadScene for now.** An `assets.ts` manifest file is the correct long-term solution, but for the shell phase there are zero real assets — everything is stub paths that will 404 gracefully. Creating a manifest file now would be premature. When real assets are added (after Lead Designer delivers sprites), we'll create `src/game/assets.ts` as a separate micro-task. **Keep load calls inline in PreloadScene.**

### PE Modifications Required

1. **Add `src/utils/RegistryHelper.ts`** to your file manifest (~15 lines, new file).
2. **Use `getPlayerProgress()` / `setPlayerProgress()`** in all scenes instead of raw `this.registry.get/set` calls.
3. **Update file count:** 8 files → 9 files (7 scenes + barrel export + RegistryHelper).
4. **main.ts update:** After building all scenes, update `src/main.ts` to import all 7 scene classes from the barrel export and register them in the Phaser config's `scene: [...]` array. This is within your scope.
5. **BootScene replacement:** The existing `src/game/scenes/BootScene.ts` was a placeholder from TASK-002. Your new BootScene should **replace it entirely** with the full SDK init + player data loading + registry setup behavior described in your plan.

### PE Checklist

- [x] File paths match project structure (`src/game/scenes/`, `src/utils/`)
- [x] Naming: PascalCase classes, camelCase methods
- [x] No circular dependencies (scenes import types + Logger + RegistryHelper, never each other)
- [x] Logging in every public method + every error path + every state transition
- [x] No file ownership overlaps (all `src/game/scenes/*` owned by Game Engineer)
- [x] Shared types consumed from `src/types/game.types.ts` (not duplicated)
- [x] Scene keys match Constants.ts values

### Authorization

**Game Engineer: You are cleared to begin implementation of TASK-005.** Write all 9 files (7 scenes + barrel export + RegistryHelper). Replace the existing BootScene.ts. Update main.ts scene registration. Verify the full boot flow produces the expected console output from Section 4.1. All code must compile with `tsc --noEmit` and build with `vite build`.
