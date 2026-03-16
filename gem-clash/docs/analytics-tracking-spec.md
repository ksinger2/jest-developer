# Analytics Tracking Specification — Gem Clash Phase 1

> **Document Owner:** Data Scientist
> **Last Updated:** March 15, 2026
> **Status:** APPROVED — Ready for Implementation
> **Target Completion:** Week 1 (Phase 1 Blocker)

---

## Executive Summary

This document specifies the **Phase 1 Analytics Tracking Implementation** for Gem Clash, addressing the HIGH RISK identified in `NextSteps.md` where zero analytics events are currently being fired despite SDK readiness.

**Scope:** 6 critical events required for Phase 1 launch
**Implementation:** AnalyticsManager utility class + scene instrumentation
**Validation:** Mock mode support, data quality checks, QA test plan
**Platform:** Jest Analytics via `JestSDK.analytics.logEvent()`

---

## 1. Platform Constraints

All tracking must comply with Jest Analytics requirements:

| Constraint | Requirement | Impact |
|------------|-------------|--------|
| Event Names | `snake_case` strings | Enforce naming convention |
| Properties | Flat key-value object (no nesting) | Flatten all data structures |
| PII Policy | No personally identifiable information | Exclude email, phone, real names |
| Mock Mode | Must handle gracefully when SDK unavailable | Already supported in JestSDKWrapper |
| Dashboard Access | Jest Developer Console Analytics tab | Post-launch monitoring |

**SDK Integration Point:**
```typescript
await JestSDKWrapper.getInstance().logEvent({
  eventName: 'level_completed',
  params: {
    level_id: 5,
    score: 4200,
    stars: 3
  }
});
```

---

## 2. Phase 1 Event Taxonomy

### 2.1 Event: `app_loaded`

**Trigger:** When the game finishes initial loading and Phaser game instance is created
**Location:** `/gem-clash/src/main.ts` after Phaser.Game instantiation
**Fires:** Once per session

#### Required Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `load_time_ms` | number | Time from page load to game ready (milliseconds) | `2340` |
| `sdk_version` | string | Jest SDK version if available | `"1.2.0"` or `"unknown"` |
| `is_guest` | boolean | Whether player is in guest mode (not registered) | `true` |
| `phaser_version` | string | Phaser framework version | `"3.80.1"` |

#### Optional Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `viewport_width` | number | Window inner width in pixels | `412` |
| `viewport_height` | number | Window inner height in pixels | `915` |
| `user_agent` | string | Browser user agent (truncated to 100 chars) | `"Mozilla/5.0..."` |

#### Example Payload

```json
{
  "eventName": "app_loaded",
  "params": {
    "load_time_ms": 2340,
    "sdk_version": "1.2.0",
    "is_guest": true,
    "phaser_version": "3.80.1",
    "viewport_width": 412,
    "viewport_height": 915
  }
}
```

#### Implementation Notes

- Measure `load_time_ms` from `performance.timing.navigationStart` to Phaser game creation
- Capture `is_guest` from `JestSDKWrapper.getPlayer().registered === false`
- Fire AFTER `JestSDKWrapper.init()` completes and BEFORE first scene starts
- If SDK is in mock mode, use `"mock"` for `sdk_version`

---

### 2.2 Event: `session_started`

**Trigger:** When player enters MainMenuScene (first scene after boot/preload)
**Location:** `/gem-clash/src/game/scenes/MainMenuScene.ts` in `create()` method
**Fires:** Once per session

#### Required Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `is_returning` | boolean | Whether player has saved progress (currentLevel > 1) | `true` |
| `current_level` | number | Player's current unlocked level | `12` |
| `total_stars` | number | Total stars earned across all levels | `28` |
| `lives_remaining` | number | Current lives count (0-5) | `3` |

#### Optional Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `days_since_last_session` | number | Days since last session (if tracked) | `2` |
| `has_incomplete_level` | boolean | Whether player has a level in progress | `false` |

#### Example Payload

```json
{
  "eventName": "session_started",
  "params": {
    "is_returning": true,
    "current_level": 12,
    "total_stars": 28,
    "lives_remaining": 3,
    "days_since_last_session": 2
  }
}
```

#### Implementation Notes

- Read player progress from `PlayerDataManager.loadProgress()`
- `is_returning` = `(playerProgress.currentLevel > 1)` or `(playerProgress.totalStars > 0)`
- Fire ONCE per MainMenuScene creation (use a guard flag to prevent double-firing on scene restart)
- Track `lastSessionAt` in PlayerProgress for `days_since_last_session` calculation

---

### 2.3 Event: `level_started`

**Trigger:** When player enters GameplayScene and the board is fully initialized
**Location:** `/gem-clash/src/game/scenes/GameplayScene.ts` after board generation completes
**Fires:** Once per level attempt (including retries)

#### Required Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `level_id` | number | Level number (1-30) | `5` |
| `moves_available` | number | Maximum moves for this level | `16` |
| `difficulty` | string | Level difficulty classification | `"medium"` |
| `gem_colors` | number | Number of gem colors active (4-6) | `5` |
| `attempt_number` | number | How many times player has attempted this level | `2` |

#### Optional Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `special_gems_enabled` | string | Comma-separated list of enabled special gems | `"line_clear,bomb"` |
| `previous_best_stars` | number | Best star rating achieved on this level (0-3) | `2` |
| `lives_before_start` | number | Lives remaining before starting | `4` |

#### Example Payload

```json
{
  "eventName": "level_started",
  "params": {
    "level_id": 5,
    "moves_available": 16,
    "difficulty": "medium",
    "gem_colors": 5,
    "attempt_number": 2,
    "special_gems_enabled": "line_clear,bomb",
    "previous_best_stars": 2,
    "lives_before_start": 4
  }
}
```

#### Implementation Notes

- Fire AFTER board generation (including seed-based initial state) completes
- Fire BEFORE player can make their first move
- Increment `attempt_number` in PlayerProgress per level (reset when level is 3-starred)
- Serialize `special_gems_enabled` as comma-separated string (flatten array)
- Pull `difficulty`, `moves_available`, `gem_colors` from `LevelData` interface

---

### 2.4 Event: `level_completed`

**Trigger:** When player's score meets or exceeds the level's 1-star threshold
**Location:** `/gem-clash/src/game/scenes/GameplayScene.ts` when win condition is detected
**Fires:** Once per successful level completion

#### Required Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `level_id` | number | Level number (1-30) | `5` |
| `score` | number | Final score achieved | `4200` |
| `stars` | number | Stars earned (1, 2, or 3) | `3` |
| `moves_used` | number | Total moves the player used | `13` |
| `moves_remaining` | number | Moves left when level completed | `3` |
| `duration_seconds` | number | Time from level_started to completion (seconds) | `87.3` |
| `cascades` | number | Total cascade chains triggered | `14` |

#### Optional Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `specials_created` | number | Total special gems created | `3` |
| `specials_activated` | number | Total special gems activated | `2` |
| `best_combo` | number | Longest cascade chain in this level | `4` |
| `purchased_extra_moves` | boolean | Whether player bought extra moves | `false` |

#### Example Payload

```json
{
  "eventName": "level_completed",
  "params": {
    "level_id": 5,
    "score": 4200,
    "stars": 3,
    "moves_used": 13,
    "moves_remaining": 3,
    "duration_seconds": 87.3,
    "cascades": 14,
    "specials_created": 3,
    "specials_activated": 2,
    "best_combo": 4,
    "purchased_extra_moves": false
  }
}
```

#### Implementation Notes

- Fire ONCE per completion (not on LevelCompleteScene show, but when win condition is met)
- Must fire BEFORE scene transition to LevelCompleteScene
- Star calculation:
  - 1 star = score >= `scoreThresholds.oneStar`
  - 2 stars = score >= `scoreThresholds.twoStar`
  - 3 stars = score >= `scoreThresholds.threeStar`
- Track `duration_seconds` from `level_started` timestamp to completion
- Cascade count comes from `ScoreSystem.cascadeMultiplier` tracking
- Set `purchased_extra_moves = true` if `ProductSKU.EXTRA_MOVES` was consumed during this attempt

---

### 2.5 Event: `level_failed`

**Trigger:** When player runs out of moves and score is below 1-star threshold
**Location:** `/gem-clash/src/game/scenes/GameplayScene.ts` when fail condition is detected
**Fires:** Once per failed level attempt

#### Required Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `level_id` | number | Level number (1-30) | `10` |
| `score` | number | Final score achieved | `1800` |
| `moves_used` | number | Total moves the player used (equals maxMoves) | `12` |
| `duration_seconds` | number | Time from level_started to failure (seconds) | `102.5` |
| `closest_star_threshold` | number | 1-star threshold they were trying to reach | `3000` |

#### Optional Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `score_deficit` | number | Points short of 1-star threshold | `1200` |
| `cascades` | number | Total cascade chains triggered | `6` |
| `specials_created` | number | Total special gems created | `1` |
| `fail_modal_type` | string | Which fail modal was shown (close/far) | `"far"` |
| `purchased_extra_moves` | boolean | Whether player bought extra moves during attempt | `false` |

#### Example Payload

```json
{
  "eventName": "level_failed",
  "params": {
    "level_id": 10,
    "score": 1800,
    "moves_used": 12,
    "duration_seconds": 102.5,
    "closest_star_threshold": 3000,
    "score_deficit": 1200,
    "cascades": 6,
    "specials_created": 1,
    "fail_modal_type": "far",
    "purchased_extra_moves": false
  }
}
```

#### Implementation Notes

- Fire ONCE when fail condition is detected (moves = 0 AND score < 1-star threshold)
- Fire BEFORE showing fail modal UI
- `fail_modal_type`:
  - `"close"` if `score / oneStarThreshold >= 0.70` (player was close)
  - `"far"` if `score / oneStarThreshold < 0.70` (player was far)
- `score_deficit = oneStarThreshold - score`
- This event indicates a life was lost (decrement lives in PlayerProgress)

---

### 2.6 Event Group: Purchase Events

#### 2.6.1 Event: `purchase_started`

**Trigger:** When `PaymentManager.purchaseProduct()` is called
**Location:** `/gem-clash/src/sdk/PaymentManager.ts` at start of purchase flow
**Fires:** Once per purchase initiation (may not complete)

##### Required Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `sku` | string | Product SKU being purchased | `"gc_moves_3"` |
| `price` | number | Price in tokens | `1` |
| `trigger_point` | string | Where purchase was initiated | `"out_of_moves_modal"` |

##### Optional Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `level_id` | number | Active level if in gameplay | `10` |
| `lives_remaining` | number | Current lives count | `2` |
| `player_registered` | boolean | Whether player is registered | `true` |

##### Example Payload

```json
{
  "eventName": "purchase_started",
  "params": {
    "sku": "gc_moves_3",
    "price": 1,
    "trigger_point": "out_of_moves_modal",
    "level_id": 10,
    "lives_remaining": 2,
    "player_registered": true
  }
}
```

---

#### 2.6.2 Event: `purchase_completed`

**Trigger:** When `PaymentManager.consumePurchase()` succeeds and product is delivered
**Location:** `/gem-clash/src/sdk/PaymentManager.ts` after successful consumption
**Fires:** Once per successful purchase

##### Required Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `sku` | string | Product SKU purchased | `"gc_moves_3"` |
| `price` | number | Price in tokens | `1` |
| `purchase_token_prefix` | string | First 8 chars of purchase token (for deduplication) | `"abc12345"` |

##### Optional Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `level_id` | number | Active level if in gameplay | `10` |
| `time_to_complete_ms` | number | Time from purchase_started to completed | `3400` |
| `verification_method` | string | Client-only or server-verified | `"client_only"` |

##### Example Payload

```json
{
  "eventName": "purchase_completed",
  "params": {
    "sku": "gc_moves_3",
    "price": 1,
    "purchase_token_prefix": "abc12345",
    "level_id": 10,
    "time_to_complete_ms": 3400,
    "verification_method": "client_only"
  }
}
```

##### Implementation Notes

- Fire AFTER product is delivered to player (e.g., moves added, lives refilled)
- `purchase_token_prefix` = first 8 characters of `purchaseToken` (for analytics deduplication, not for fraud prevention)
- `verification_method` = `"server_verified"` if backend verification succeeded, `"client_only"` if Track B failed or backend unavailable

---

#### 2.6.3 Event: `purchase_failed`

**Trigger:** When purchase flow fails (SDK error, player cancellation, verification failure)
**Location:** `/gem-clash/src/sdk/PaymentManager.ts` in error handlers
**Fires:** Once per purchase failure

##### Required Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `sku` | string | Product SKU attempted | `"gc_moves_3"` |
| `error_type` | string | Category of error | `"sdk_error"` |
| `error_message` | string | Error message (sanitized, max 200 chars) | `"Network timeout"` |

##### Optional Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `level_id` | number | Active level if in gameplay | `10` |
| `time_to_fail_ms` | number | Time from purchase_started to failure | `12000` |

##### Example Payload

```json
{
  "eventName": "purchase_failed",
  "params": {
    "sku": "gc_moves_3",
    "error_type": "sdk_error",
    "error_message": "Network timeout",
    "level_id": 10,
    "time_to_fail_ms": 12000
  }
}
```

##### Implementation Notes

- `error_type` values:
  - `"sdk_error"` — Jest SDK returned error
  - `"verification_failed"` — Backend rejected purchase
  - `"user_cancelled"` — Player dismissed purchase modal
  - `"network_error"` — Network timeout or connection issue
  - `"unknown"` — Unhandled error
- Sanitize `error_message` to remove any sensitive data
- Do NOT log full purchase tokens or player IDs in error messages

---

#### 2.6.4 Event: `purchase_cancelled`

**Trigger:** When player explicitly cancels purchase (dismisses modal, clicks cancel)
**Location:** `/gem-clash/src/sdk/PaymentManager.ts` or UI modal cancel handlers
**Fires:** Once per purchase cancellation

##### Required Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `sku` | string | Product SKU that was cancelled | `"gc_starter_pack"` |
| `trigger_point` | string | Where purchase was initiated | `"shop_scene"` |

##### Optional Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `time_to_cancel_ms` | number | Time from purchase_started to cancellation | `4200` |
| `level_id` | number | Active level if in gameplay | `null` |

##### Example Payload

```json
{
  "eventName": "purchase_cancelled",
  "params": {
    "sku": "gc_starter_pack",
    "trigger_point": "shop_scene",
    "time_to_cancel_ms": 4200
  }
}
```

---

## 3. AnalyticsManager Utility Class Specification

### 3.1 Purpose

Centralize all analytics event logging with:
- Data quality validation (no null/undefined required properties)
- Duplicate event detection (same event + params within 1 second)
- Mock mode support (graceful fallback when SDK unavailable)
- Timestamp consistency (auto-inject event timestamp)
- Type safety (TypeScript interfaces for all events)

### 3.2 File Location

`/gem-clash/src/managers/AnalyticsManager.ts`

### 3.3 Class Interface

```typescript
/**
 * AnalyticsManager — Centralized Analytics Event Logging
 * Owner: Data Scientist
 *
 * Singleton class that wraps JestSDKWrapper.logEvent() with:
 * - Data quality validation
 * - Duplicate event detection
 * - Type-safe event interfaces
 * - Mock mode graceful handling
 */

import { Logger } from '../utils/Logger';
import { JestSDKWrapper } from '../sdk/JestSDKWrapper';

/** Base interface for all analytics events */
interface BaseAnalyticsEvent {
  eventName: string;
  params: Record<string, string | number | boolean>;
}

/** Specific event interfaces (type-safe properties) */
interface AppLoadedEvent extends BaseAnalyticsEvent {
  eventName: 'app_loaded';
  params: {
    load_time_ms: number;
    sdk_version: string;
    is_guest: boolean;
    phaser_version: string;
    viewport_width?: number;
    viewport_height?: number;
    user_agent?: string;
  };
}

interface SessionStartedEvent extends BaseAnalyticsEvent {
  eventName: 'session_started';
  params: {
    is_returning: boolean;
    current_level: number;
    total_stars: number;
    lives_remaining: number;
    days_since_last_session?: number;
    has_incomplete_level?: boolean;
  };
}

interface LevelStartedEvent extends BaseAnalyticsEvent {
  eventName: 'level_started';
  params: {
    level_id: number;
    moves_available: number;
    difficulty: string;
    gem_colors: number;
    attempt_number: number;
    special_gems_enabled?: string;
    previous_best_stars?: number;
    lives_before_start?: number;
  };
}

interface LevelCompletedEvent extends BaseAnalyticsEvent {
  eventName: 'level_completed';
  params: {
    level_id: number;
    score: number;
    stars: number;
    moves_used: number;
    moves_remaining: number;
    duration_seconds: number;
    cascades: number;
    specials_created?: number;
    specials_activated?: number;
    best_combo?: number;
    purchased_extra_moves?: boolean;
  };
}

interface LevelFailedEvent extends BaseAnalyticsEvent {
  eventName: 'level_failed';
  params: {
    level_id: number;
    score: number;
    moves_used: number;
    duration_seconds: number;
    closest_star_threshold: number;
    score_deficit?: number;
    cascades?: number;
    specials_created?: number;
    fail_modal_type?: string;
    purchased_extra_moves?: boolean;
  };
}

interface PurchaseStartedEvent extends BaseAnalyticsEvent {
  eventName: 'purchase_started';
  params: {
    sku: string;
    price: number;
    trigger_point: string;
    level_id?: number;
    lives_remaining?: number;
    player_registered?: boolean;
  };
}

interface PurchaseCompletedEvent extends BaseAnalyticsEvent {
  eventName: 'purchase_completed';
  params: {
    sku: string;
    price: number;
    purchase_token_prefix: string;
    level_id?: number;
    time_to_complete_ms?: number;
    verification_method?: string;
  };
}

interface PurchaseFailedEvent extends BaseAnalyticsEvent {
  eventName: 'purchase_failed';
  params: {
    sku: string;
    error_type: string;
    error_message: string;
    level_id?: number;
    time_to_fail_ms?: number;
  };
}

interface PurchaseCancelledEvent extends BaseAnalyticsEvent {
  eventName: 'purchase_cancelled';
  params: {
    sku: string;
    trigger_point: string;
    time_to_cancel_ms?: number;
    level_id?: number;
  };
}

/** Union type of all Phase 1 events */
type Phase1AnalyticsEvent =
  | AppLoadedEvent
  | SessionStartedEvent
  | LevelStartedEvent
  | LevelCompletedEvent
  | LevelFailedEvent
  | PurchaseStartedEvent
  | PurchaseCompletedEvent
  | PurchaseFailedEvent
  | PurchaseCancelledEvent;

export class AnalyticsManager {
  private static instance: AnalyticsManager | null = null;
  private logger = new Logger('AnalyticsManager');
  private sdk: JestSDKWrapper;

  /** Duplicate detection cache: eventName+params hash -> timestamp */
  private recentEvents: Map<string, number> = new Map();

  /** Duplicate detection window (milliseconds) */
  private readonly DUPLICATE_WINDOW_MS = 1000;

  private constructor() {
    this.sdk = JestSDKWrapper.getInstance();
  }

  /** Get singleton instance */
  static getInstance(): AnalyticsManager {
    if (!AnalyticsManager.instance) {
      AnalyticsManager.instance = new AnalyticsManager();
    }
    return AnalyticsManager.instance;
  }

  /**
   * Log an analytics event with validation and duplicate detection
   */
  async logEvent(event: Phase1AnalyticsEvent): Promise<void> {
    try {
      // 1. Validate required properties are not null/undefined
      this.validateEvent(event);

      // 2. Check for duplicate events
      if (this.isDuplicate(event)) {
        this.logger.warn('logEvent', 'Duplicate event detected, skipping', { event });
        return;
      }

      // 3. Auto-inject timestamp
      const enrichedParams = {
        ...event.params,
        event_timestamp: Date.now(),
      };

      // 4. Log via SDK wrapper (handles mock mode gracefully)
      await this.sdk.logEvent({
        eventName: event.eventName,
        params: enrichedParams,
      });

      // 5. Update duplicate detection cache
      this.markEventSent(event);

      this.logger.info('logEvent', `Event logged: ${event.eventName}`, { event });
    } catch (err) {
      this.logger.error('logEvent', 'Failed to log analytics event', err);
      // DO NOT throw — analytics failures should not break gameplay
    }
  }

  /**
   * Validate that all required properties are present and not null/undefined
   */
  private validateEvent(event: Phase1AnalyticsEvent): void {
    const params = event.params as Record<string, unknown>;

    for (const [key, value] of Object.entries(params)) {
      if (value === null || value === undefined) {
        throw new Error(`Event ${event.eventName} has null/undefined property: ${key}`);
      }
    }
  }

  /**
   * Check if this event is a duplicate (same eventName + params within 1 second)
   */
  private isDuplicate(event: Phase1AnalyticsEvent): boolean {
    const hash = this.hashEvent(event);
    const lastSent = this.recentEvents.get(hash);

    if (lastSent && Date.now() - lastSent < this.DUPLICATE_WINDOW_MS) {
      return true;
    }

    return false;
  }

  /**
   * Mark event as sent for duplicate detection
   */
  private markEventSent(event: Phase1AnalyticsEvent): void {
    const hash = this.hashEvent(event);
    this.recentEvents.set(hash, Date.now());

    // Clean up old entries (older than 2x duplicate window)
    const cutoff = Date.now() - this.DUPLICATE_WINDOW_MS * 2;
    for (const [key, timestamp] of this.recentEvents.entries()) {
      if (timestamp < cutoff) {
        this.recentEvents.delete(key);
      }
    }
  }

  /**
   * Create a hash of event for duplicate detection
   */
  private hashEvent(event: Phase1AnalyticsEvent): string {
    const sortedParams = Object.keys(event.params)
      .sort()
      .map((key) => `${key}=${event.params[key]}`)
      .join('&');

    return `${event.eventName}:${sortedParams}`;
  }

  /**
   * Clear duplicate detection cache (for testing)
   */
  clearCache(): void {
    this.recentEvents.clear();
  }
}
```

### 3.4 Usage Examples

```typescript
// In main.ts — app_loaded
const analyticsManager = AnalyticsManager.getInstance();

await analyticsManager.logEvent({
  eventName: 'app_loaded',
  params: {
    load_time_ms: 2340,
    sdk_version: '1.2.0',
    is_guest: true,
    phaser_version: '3.80.1',
    viewport_width: 412,
    viewport_height: 915,
  },
});

// In GameplayScene.ts — level_started
await analyticsManager.logEvent({
  eventName: 'level_started',
  params: {
    level_id: 5,
    moves_available: 16,
    difficulty: 'medium',
    gem_colors: 5,
    attempt_number: 2,
    special_gems_enabled: 'line_clear,bomb',
  },
});

// In PaymentManager.ts — purchase_completed
await analyticsManager.logEvent({
  eventName: 'purchase_completed',
  params: {
    sku: 'gc_moves_3',
    price: 1,
    purchase_token_prefix: purchaseToken.substring(0, 8),
    level_id: this.currentLevelId,
    verification_method: 'server_verified',
  },
});
```

---

## 4. Implementation Checklist

### 4.1 AnalyticsManager Implementation

- [ ] Create `/gem-clash/src/managers/AnalyticsManager.ts` with full specification above
- [ ] Define all Phase 1 event interfaces (9 event types)
- [ ] Implement validation logic (no null/undefined required properties)
- [ ] Implement duplicate detection (1-second window)
- [ ] Add unit tests for AnalyticsManager (event validation, duplicate detection, mock mode)

### 4.2 Event Instrumentation

- [ ] **app_loaded** — `/gem-clash/src/main.ts` after Phaser.Game creation
- [ ] **session_started** — `/gem-clash/src/game/scenes/MainMenuScene.ts` in `create()`
- [ ] **level_started** — `/gem-clash/src/game/scenes/GameplayScene.ts` after board init
- [ ] **level_completed** — `/gem-clash/src/game/scenes/GameplayScene.ts` when win detected
- [ ] **level_failed** — `/gem-clash/src/game/scenes/GameplayScene.ts` when fail detected
- [ ] **purchase_started** — `/gem-clash/src/sdk/PaymentManager.ts` in `purchaseProduct()`
- [ ] **purchase_completed** — `/gem-clash/src/sdk/PaymentManager.ts` after `consumePurchase()`
- [ ] **purchase_failed** — `/gem-clash/src/sdk/PaymentManager.ts` in error handlers
- [ ] **purchase_cancelled** — `/gem-clash/src/sdk/PaymentManager.ts` or UI cancel handlers

### 4.3 Data Quality Validation

- [ ] Add TypeScript type checking for all event properties
- [ ] Verify no events fire with null/undefined required properties
- [ ] Test duplicate detection (fire same event twice within 1 second)
- [ ] Verify events fire in mock mode (check console logs)
- [ ] Verify events fire in live mode (check Jest Analytics dashboard)

### 4.4 QA Test Plan

- [ ] **Test Case 1:** Load game → verify `app_loaded` fires once with correct properties
- [ ] **Test Case 2:** Reach MainMenuScene → verify `session_started` fires once
- [ ] **Test Case 3:** Start level → verify `level_started` fires with correct level_id
- [ ] **Test Case 4:** Complete level → verify `level_completed` fires with correct score/stars
- [ ] **Test Case 5:** Fail level → verify `level_failed` fires with correct score
- [ ] **Test Case 6:** Initiate purchase → verify `purchase_started` fires
- [ ] **Test Case 7:** Complete purchase → verify `purchase_completed` fires
- [ ] **Test Case 8:** Cancel purchase → verify `purchase_cancelled` fires
- [ ] **Test Case 9:** Fail purchase → verify `purchase_failed` fires with error_type
- [ ] **Test Case 10:** Fire duplicate event → verify second event is skipped

---

## 5. Dashboard Specifications

### 5.1 Real-Time Dashboard (Jest Developer Console)

**Available Metrics (Built-in):**
- Active players (last 15 minutes)
- DAU, WAU, MAU
- New users today
- Retention curves (D1, D7, D30)

**Custom Queries:**
- Level completion funnel (level_started → level_completed per level_id)
- Purchase funnel (purchase_started → purchase_completed per SKU)
- Average session length (session_started → app closed)

### 5.2 Level Health Dashboard (Custom Analysis)

**Metrics to Track:**
- **Completion Rate:** `level_completed / level_started` per level_id
- **Average Score:** Mean score from `level_completed` events per level_id
- **Average Moves Used:** Mean moves_used from `level_completed` events
- **Difficulty Spike Detection:** Flag if completion rate drops >15% from previous level

**Alert Thresholds:**
- Completion rate < 50% → Level is too hard
- Completion rate > 90% → Level is too easy
- Average moves remaining < 2 → Level is too tight
- Average moves remaining > 8 → Level is too easy

### 5.3 Monetization Dashboard

**Metrics to Track:**
- **Purchase Conversion:** `unique players with purchase_completed / DAU`
- **ARPU:** `sum(price from purchase_completed) / DAU`
- **ARPPU:** `sum(price from purchase_completed) / unique purchasers`
- **Purchase Funnel:** `purchase_started → purchase_completed` drop-off rate
- **SKU Performance:** Revenue per SKU, conversion rate per SKU

**Target KPIs (from PRD):**
- Purchase Conversion: >5% of registered players
- ARPU: TBD (benchmark after Week 1)
- ARPPU: $3-5 for casual match-3

---

## 6. Phase 2+ Event Taxonomy (Out of Scope)

The following events are EXCLUDED from Phase 1 but defined for future implementation:

**Gameplay Events:**
- `gem_matched` — Per match event (may generate high volume)
- `special_gem_created` — When special gem is created
- `special_gem_activated` — When special gem is activated
- `board_reshuffled` — When deadlock triggers auto-reshuffle

**Progression Events:**
- `tutorial_started` — When tutorial begins
- `tutorial_completed` — When tutorial ends
- `registration_prompted` — When registration modal is shown
- `registration_completed` — When player registers
- `registration_skipped` — When player dismisses registration

**Engagement Events:**
- `notification_scheduled` — When notification is scheduled (Phase 2)
- `notification_received` — When notification is delivered (Phase 2)
- `referral_sent` — When player shares referral link (Phase 2)
- `referral_accepted` — When new player joins via referral (Phase 2)

**System Events:**
- `error_occurred` — When unhandled error occurs

---

## 7. Privacy & Compliance

### 7.1 No PII Policy

**NEVER log the following in analytics events:**
- Player email addresses
- Phone numbers
- Real names
- IP addresses (Jest may collect server-side)
- Device IDs (beyond what Jest SDK provides)
- Purchase tokens (except first 8 chars for deduplication)

**Allowed Player Identifiers:**
- `player_id` (Jest's anonymized player ID)
- `is_guest` boolean flag
- `is_registered` boolean flag

### 7.2 SHAFT Compliance

All event properties must comply with Jest SHAFT policy:
- No references to Sex, Hate, Alcohol, Firearms, Tobacco
- No gambling terminology (no "bet", "wager", "stake")
- Product names and descriptions must pass SHAFT audit

---

## 8. Estimated Implementation Time

| Task | Estimated Time | Owner |
|------|----------------|-------|
| Create AnalyticsManager.ts | 2 hours | Frontend Lead |
| Define all event interfaces | 1 hour | Data Scientist |
| Instrument app_loaded | 30 minutes | Frontend Lead |
| Instrument session_started | 30 minutes | Frontend Lead |
| Instrument level_started | 45 minutes | Game Engineer |
| Instrument level_completed | 45 minutes | Game Engineer |
| Instrument level_failed | 45 minutes | Game Engineer |
| Instrument purchase events (4 events) | 2 hours | Frontend Lead |
| Write unit tests | 2 hours | QA Engineer |
| QA validation (10 test cases) | 2 hours | QA Engineer |
| **TOTAL** | **12.5 hours** | **~2 days** |

---

## 9. Success Criteria

**Phase 1 Exit Criteria:**
- [ ] All 6 critical event groups implemented (9 total events)
- [ ] AnalyticsManager utility class complete with validation
- [ ] All events fire correctly in mock mode (verified in console logs)
- [ ] All events pass QA validation (10 test cases)
- [ ] No null/undefined required properties in any event
- [ ] Duplicate detection prevents event spam
- [ ] Documentation complete and approved by Principal Product Manager

**Post-Launch Validation:**
- [ ] Events visible in Jest Developer Console Analytics tab
- [ ] Level completion funnel shows data for levels 1-10
- [ ] Purchase funnel shows drop-off rates
- [ ] No analytics-related errors in production logs

---

## 10. Appendix: Event Trigger Point Reference

| Event | Scene | Method | Guard Condition |
|-------|-------|--------|----------------|
| `app_loaded` | main.ts | After Phaser.Game creation | Fire once per page load |
| `session_started` | MainMenuScene | `create()` | Fire once per scene creation (use flag) |
| `level_started` | GameplayScene | After `boardManager.initBoard()` | Fire once per level attempt |
| `level_completed` | GameplayScene | When `score >= oneStarThreshold` | Fire once when win detected |
| `level_failed` | GameplayScene | When `moves === 0 && score < oneStarThreshold` | Fire once when fail detected |
| `purchase_started` | PaymentManager | `purchaseProduct()` start | Fire at start of flow |
| `purchase_completed` | PaymentManager | After `consumePurchase()` success | Fire after product delivered |
| `purchase_failed` | PaymentManager | In catch blocks | Fire on any error |
| `purchase_cancelled` | PaymentManager or UI | Cancel handler | Fire on explicit cancel |

---

## Document Approval

**Author:** Data Scientist
**Reviewers:**
- [ ] Principal Product Manager (KPI alignment)
- [ ] Frontend Lead Engineer (implementation feasibility)
- [ ] Game Engineer (gameplay event timing)
- [ ] QA Engineer (test plan coverage)

**Status:** READY FOR IMPLEMENTATION
**Target Sprint:** Week 1 — Phase 1 Blocker

---

*End of Analytics Tracking Specification*
