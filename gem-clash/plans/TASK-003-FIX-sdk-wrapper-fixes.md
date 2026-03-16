# SDK Wrapper Critical Fixes Plan

**Status:** IMPLEMENTED - March 15, 2026
**Owner:** Frontend Lead Engineer
**Task:** TASK-003-FIX
**Estimated Time:** 4-5 hours
**Date:** March 15, 2026

---

## Issue Summary

The current `JestSDKWrapper.ts` has four critical misalignments with the Jest SDK documentation:

| Issue | Current State | Required State | Severity |
|-------|---------------|----------------|----------|
| Method naming | `purchaseProduct()` / `consumePurchase()` | `beginPurchase()` / `completePurchase()` | HIGH |
| Payment recovery | Missing | `getIncompletePurchases()` required | CRITICAL |
| Data persistence | No flush calls | `data.flush()` on exit/pause/purchase | HIGH |
| Attribution | Missing | `getEntryPayload()` required | MEDIUM |

---

## 1. Method Renaming (JestSDKWrapper.ts + types.ts)

### Current signatures (WRONG):
```typescript
// JestSDKWrapper.ts lines 164-187
async purchaseProduct(productId: string): Promise<JestPurchaseResult>

// JestSDKWrapper.ts lines 189-204
async consumePurchase(purchaseToken: string): Promise<void>
```

### Required signatures (per Jest SDK docs):
```typescript
/**
 * Begin a purchase flow for the given product SKU.
 * Returns success with purchase data, cancel, or error.
 */
async beginPurchase(productSku: string): Promise<JestBeginPurchaseResult>

/**
 * Complete a purchase after granting the item to the player.
 * MUST be called AFTER durable item grant to prevent double-grants.
 */
async completePurchase(purchaseToken: string): Promise<JestCompletePurchaseResult>
```

### New type definitions to add to `src/sdk/types.ts`:

```typescript
/** Jest PurchaseData returned from beginPurchase and getIncompletePurchases */
export interface JestPurchaseData {
  purchaseToken: string;
  productSku: string;
  credits: number;           // Price in Jest Tokens
  createdAt: number;         // JS timestamp (ms since epoch)
  completedAt: number | null; // null until completePurchase called
}

/** Result from JestSDK.payments.beginPurchase() */
export type JestBeginPurchaseResult =
  | { result: 'success'; purchase: JestPurchaseData; purchaseSigned: string }
  | { result: 'cancel' }
  | { result: 'error'; error: 'login_required' | 'internal_error' | 'invalid_product' };

/** Result from JestSDK.payments.completePurchase() */
export type JestCompletePurchaseResult =
  | { result: 'success' }
  | { result: 'error'; error: 'internal_error' | 'invalid_token' };

/** Result from JestSDK.payments.getIncompletePurchases() */
export interface JestIncompletePurchasesResult {
  purchases: JestPurchaseData[];
  purchasesSigned: string;
  hasMore: boolean;
}

/** Entry payload from notification/referral links */
export type JestEntryPayload = Record<string, unknown>;
```

### Update JestSDK interface in types.ts:
```typescript
export interface JestSDK {
  // ... existing methods ...

  // Payments (CORRECTED - namespaced)
  payments: {
    getProducts(): Promise<JestProduct[]>;
    beginPurchase(params: { productSku: string }): Promise<JestBeginPurchaseResult>;
    completePurchase(params: { purchaseToken: string }): Promise<JestCompletePurchaseResult>;
    getIncompletePurchases(): Promise<JestIncompletePurchasesResult>;
  };

  // Player Data (CORRECTED - namespaced per SDK docs)
  data: {
    getAll(): Record<string, unknown>;
    get(key: string): unknown;
    set(data: Record<string, unknown>): void;
    set(key: string, value: unknown): void;
    delete(key: string): void;
    flush(): Promise<void>;
  };

  // Entry Payload (NEW)
  getEntryPayload(): JestEntryPayload;
}
```

---

## 2. Add `getIncompletePurchases()` Method

### New method for JestSDKWrapper.ts:

```typescript
/**
 * Recover incomplete purchases from previous sessions.
 * MUST be called on app startup and after login to handle crash recovery.
 * Per Jest docs: Guest players cannot have incomplete purchases.
 * If hasMore is true, call again after completing returned purchases.
 */
async getIncompletePurchases(): Promise<JestIncompletePurchasesResult> {
  this.logger.debug('getIncompletePurchases', 'Checking for incomplete purchases');

  const emptyResult: JestIncompletePurchasesResult = {
    purchases: [],
    purchasesSigned: '',
    hasMore: false,
  };

  try {
    if (this.mockMode || !this.sdk) {
      this.logger.info('getIncompletePurchases', '[MOCK] No incomplete purchases in mock mode');
      return emptyResult;
    }

    const result = await this.sdk.payments.getIncompletePurchases();
    this.logger.info('getIncompletePurchases', 'Incomplete purchases retrieved', {
      count: result.purchases.length,
      hasMore: result.hasMore,
    });
    return result;
  } catch (err) {
    this.logger.error('getIncompletePurchases', 'Failed to get incomplete purchases', err);
    return emptyResult;
  }
}
```

### Integration point - PaymentManager.ts needs new method:

```typescript
/**
 * Recover and complete any incomplete purchases from previous sessions.
 * Called on app startup (BootScene) and after successful login.
 */
async recoverIncompletePurchases(
  grantItem: (sku: string, purchaseToken: string) => Promise<void>
): Promise<number> {
  this.logger.info('recoverIncompletePurchases', 'Starting purchase recovery');

  let totalRecovered = 0;
  let hasMore = true;

  while (hasMore) {
    const result = await this.sdk.getIncompletePurchases();
    hasMore = result.hasMore;

    for (const purchase of result.purchases) {
      try {
        await grantItem(purchase.productSku, purchase.purchaseToken);
        const completeResult = await this.sdk.completePurchase(purchase.purchaseToken);

        if (completeResult.result === 'success') {
          totalRecovered++;
          this.logger.info('recoverIncompletePurchases', 'Purchase recovered', {
            sku: purchase.productSku,
          });
        }
      } catch (err) {
        this.logger.error('recoverIncompletePurchases', 'Failed to recover purchase', {
          sku: purchase.productSku,
          error: err,
        });
      }
    }
  }

  await this.sdk.flushPlayerData();
  return totalRecovered;
}
```

---

## 3. Add `data.flush()` Method and Integration Points

### New method for JestSDKWrapper.ts:

```typescript
/**
 * Flush any pending player data changes to the server immediately.
 * The SDK batches updates; this forces immediate persistence.
 *
 * MUST be called:
 * - On app pause/exit (visibilitychange, beforeunload)
 * - After completing a purchase
 * - After critical progress saves (level complete, star earn)
 */
async flushPlayerData(): Promise<void> {
  this.logger.debug('flushPlayerData', 'Flushing player data to server');

  try {
    if (this.mockMode || !this.sdk) {
      this.logger.info('flushPlayerData', '[MOCK] Flush simulated');
      return;
    }

    await this.sdk.data.flush();
    this.logger.info('flushPlayerData', 'Player data flushed successfully');
  } catch (err) {
    this.logger.error('flushPlayerData', 'Failed to flush player data', err);
  }
}
```

### Integration points requiring flush() calls:

| Location | File | Trigger | Priority |
|----------|------|---------|----------|
| App lifecycle | `BootScene.ts` | `visibilitychange` event (pause) | CRITICAL |
| App lifecycle | `BootScene.ts` | `beforeunload` event (exit) | CRITICAL |
| Purchase complete | `PaymentManager.ts` | After `completePurchase()` succeeds | CRITICAL |
| Level complete | `LevelCompleteScene.ts` | After saving stars/progress | HIGH |

### New lifecycle handler to add in BootScene.ts:

```typescript
private registerLifecycleHandlers(): void {
  const sdkWrapper = JestSDKWrapper.getInstance();

  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'hidden') {
      this.logger.info('lifecycleHandler', 'App paused - flushing player data');
      await sdkWrapper.flushPlayerData();
    }
  });

  window.addEventListener('beforeunload', () => {
    this.logger.info('lifecycleHandler', 'App exiting - flushing player data');
    sdkWrapper.flushPlayerData();
  });

  this.logger.info('registerLifecycleHandlers', 'Lifecycle flush handlers registered');
}
```

---

## 4. Add `getEntryPayload()` Method

### New method for JestSDKWrapper.ts:

Per Jest SDK docs at `docs/jest-platform/sdk/entry-payload.md`:

```typescript
/**
 * Get the entry payload that was passed when the game was launched.
 * Used for challenge attribution, notification attribution, referral tracking.
 * Returns empty object if no payload was provided.
 */
getEntryPayload(): JestEntryPayload {
  this.logger.debug('getEntryPayload', 'Fetching entry payload');
  const emptyResult: JestEntryPayload = {};

  try {
    if (this.mockMode || !this.sdk) {
      // In dev mode, check URL for test payload (per Jest docs)
      const urlParams = new URLSearchParams(window.location.search);
      const encoded = urlParams.get('entryPayload');
      if (encoded) {
        try {
          const decoded = JSON.parse(decodeURIComponent(encoded));
          this.logger.info('getEntryPayload', '[MOCK] Entry payload from URL', { decoded });
          return decoded;
        } catch {
          this.logger.warn('getEntryPayload', '[MOCK] Failed to parse URL entry payload');
        }
      }
      return emptyResult;
    }

    const payload = this.sdk.getEntryPayload();
    this.logger.info('getEntryPayload', 'Entry payload retrieved', { payload });
    return payload;
  } catch (err) {
    this.logger.error('getEntryPayload', 'Failed to get entry payload', err);
    return emptyResult;
  }
}
```

### Integration point - BootScene.ts:

```typescript
// In BootScene.create(), after SDK init:
const entryPayload = sdkWrapper.getEntryPayload();
if (entryPayload.challengeId) {
  this.logger.info('create', 'Game launched from challenge', {
    challengeId: entryPayload.challengeId,
    senderId: entryPayload.senderId,
  });
  // Store in registry for GameplayScene to handle
  this.registry.set('pendingChallenge', entryPayload);
}
if (entryPayload.notificationId) {
  this.logger.info('create', 'Game launched from notification', {
    notificationId: entryPayload.notificationId,
  });
  // Track for analytics
}
```

---

## 5. Update PaymentManager Purchase Flow

### Before (WRONG):
```typescript
const result = await this.sdk.purchaseProduct(sku);
await this.sdk.consumePurchase(result.purchaseToken);
```

### After (CORRECT per Jest SDK docs):
```typescript
const beginResult = await this.sdk.beginPurchase(sku);

if (beginResult.result === 'cancel') {
  EventBus.emit(GameEvent.PURCHASE_CANCELLED, { sku });
  return { success: false, productId: sku, error: 'cancelled' };
}

if (beginResult.result === 'error') {
  EventBus.emit(GameEvent.PURCHASE_FAILED, { sku, error: beginResult.error });
  return { success: false, productId: sku, error: beginResult.error };
}

// Grant item BEFORE completing (critical order per Jest docs!)
EventBus.emit(GameEvent.PURCHASE_GRANT_ITEM, {
  sku,
  purchase: beginResult.purchase,
  purchaseSigned: beginResult.purchaseSigned,
});

// Complete purchase AFTER grant
await this.sdk.completePurchase(beginResult.purchase.purchaseToken);

// Flush player data
await this.sdk.flushPlayerData();

EventBus.emit(GameEvent.PURCHASE_COMPLETED, { sku });
```

---

## 6. Files to Modify

| File | Changes | Est. Time |
|------|---------|-----------|
| `src/sdk/types.ts` | Add new types, update JestSDK interface | 30 min |
| `src/sdk/JestSDKWrapper.ts` | Rename methods, add 3 new methods | 1.5 hr |
| `src/sdk/PaymentManager.ts` | Update purchase flow, add recovery method | 1 hr |
| `src/sdk/PlayerDataManager.ts` | Add flush() calls after saves | 20 min |
| `src/game/scenes/BootScene.ts` | Add lifecycle handlers, entry payload check | 45 min |
| `src/game/scenes/LevelCompleteScene.ts` | Add flush() after progress save | 15 min |
| `src/game/scenes/ShopScene.ts` | Update to use new purchase flow | 20 min |

**Total Estimated Time: 4-5 hours**

---

## 7. Testing Checklist

- [ ] `beginPurchase()` returns correct result types (success/cancel/error)
- [ ] `completePurchase()` called AFTER item grant
- [ ] `getIncompletePurchases()` called on app startup
- [ ] `flushPlayerData()` called on visibilitychange (hidden)
- [ ] `flushPlayerData()` called on beforeunload
- [ ] `flushPlayerData()` called after purchase completion
- [ ] `getEntryPayload()` returns URL-encoded payload in mock mode
- [ ] Mock mode returns appropriate defaults for all new methods
- [ ] All methods have proper try/catch with error logging
- [ ] PaymentManager blocks purchases when SDK unavailable

---

## 8. Rollout Plan

1. **Phase A** (Day 1): Update types.ts with new interfaces
2. **Phase B** (Day 1): Update JestSDKWrapper.ts with corrected methods
3. **Phase C** (Day 1): Update PaymentManager.ts purchase flow
4. **Phase D** (Day 2): Add lifecycle handlers in BootScene
5. **Phase E** (Day 2): Update consuming scenes (Shop, LevelComplete)
6. **Phase F** (Day 2): QA validation in mock mode
7. **Phase G** (Day 3): Test in Jest emulator (blocked on DevOps spike)

---

## Blockers

- None for mock mode development
- Jest emulator testing blocked on Track B spike (TASK-004)

## Dependencies

- QA Engineer: Add SDK wrapper tests after implementation
- Backend Lead: Verify JWT payload shapes match new types

---

*This SDK fix plan was generated by Frontend Lead Engineer on March 15, 2026.*
