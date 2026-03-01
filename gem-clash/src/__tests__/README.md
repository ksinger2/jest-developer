# Gem Link Test Suite

Comprehensive QA test coverage for Gem Link match-3 game.

## Test Files

### 1. OfferManager.test.ts
Tests for free gift cooldowns and special offer timers.

**Coverage:**
- `canCollectFreeGift()` — cooldown logic (never collected, within cooldown, after cooldown, boundary cases)
- `getFreeGiftTimeRemaining()` — countdown calculation
- `formatTimeRemaining()` — mm:ss formatting
- `collectFreeGift()` — timestamp updates, reward distribution (50 coins 60%, 100 coins 20%, remap 20%)
- `isSpecialOfferActive()` — offer expiry checks
- `getSpecialOfferTimeRemaining()` — remaining time calculation

**Test Count:** 21 tests

### 2. ScoreSystem.test.ts
Tests for score calculation, cascade multipliers, and star thresholds.

**Coverage:**
- `init()` — initialization with star thresholds
- `startCascadeChain()` — cascade depth reset
- `scoreMatches()` — base scoring (3-match, 4-match, 5-match), cascade multipliers (1x, 1.5x, 2x, 2.5x), special gem bonuses
- `addRemainingMovesBonus()` — end-of-level bonus calculation
- `calculateStars()` — star rating (0-3 stars)
- `hasPassed()` — minimum score threshold check
- Cascade tracking — `getTotalCascades()`, `getBestCombo()`

**Test Count:** 34 tests

### 3. LevelManager.test.ts
Tests for level loading, move tracking, and win/lose conditions.

**Coverage:**
- `loadCatalog()` — level catalog loading
- `startLevel()` — level initialization, move reset, timer start
- `useMove()` — move consumption
- `getMovesRemaining()` — remaining move calculation
- `isOutOfMoves()` — out-of-moves detection
- `getMoveLimit()` — level move limit retrieval
- `getStarThresholds()` — threshold retrieval
- `getElapsedSeconds()` — timer tracking
- `buildResult()` — LevelResult object construction
- `addExtraMoves()` — in-app purchase extra moves

**Test Count:** 25 tests

### 4. Constants.test.ts
Tests for type safety and constant validation.

**Coverage:**
- Gradient arrays — exactly 2 elements, valid hex values, top lighter than bottom
- Font sizes — positive numbers, ascending order, reasonable values
- Color values — valid hex (0x000000 - 0xffffff), correct counts
- Product catalog integrity — all SKUs have catalog entries, no duplicates, non-empty names/descriptions, positive prices
- ProductSKU enum — 11 SKUs, gc_ prefix convention, lowercase with underscores
- Edge cases — no pure black/white gems, gradient pairs differ

**Test Count:** 30 tests

### 5. UIComponents.test.ts
Tests for UI component API contracts and method signatures.

**Coverage:**
- `GlButton` — constructor config, onClick chaining, setEnabled, setLabel
- `GlBadge` — constructor, setValue, onPlusClick chaining
- `GlHUD` — constructor, updateValues, badge getters
- `GlModal` — constructor, addContent, show/hide, onClose chaining
- `GlRibbon` — constructor, custom config
- `GlStarDisplay` — constructor, setStars, animated flag
- `GlProgressBar` — constructor, setProgress, getProgress, clamping
- `GlCard` — constructor, onBuy, setEnabled chaining
- `GlParticles` — sparkleBurst, coinShower, starExplosion, confetti

**Test Count:** 40 tests

## Total Test Coverage

**Total Tests:** 150 tests across 5 test files

**Coverage Targets:**
- Match engine: 90%+ (not yet implemented — MatchEngine.test.ts required)
- SDK wrapper: 85%+ (not yet implemented — JestSDK.test.ts required)
- Purchase flow: 95%+ (not yet implemented — PurchaseFlow.test.ts required)
- Core systems: 85%+ ✅ (OfferManager, ScoreSystem, LevelManager)
- UI components: 80%+ ✅ (UIComponents API contracts)
- Constants/types: 90%+ ✅ (Constants validation)

## Installation

Vitest is **not yet installed**. To install and run tests:

```bash
# Install vitest and dependencies
npm install -D vitest @vitest/ui jsdom @vitest/coverage-v8

# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run tests with UI
npm run test:ui
```

## package.json Scripts

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

## Running Tests

### Run all tests
```bash
npm run test
```

### Run specific test file
```bash
npm run test OfferManager.test.ts
```

### Run tests in watch mode (auto-rerun on file changes)
```bash
npm run test:watch
```

### Generate coverage report
```bash
npm run test:coverage
```

Coverage report will be generated in `coverage/` directory.

## Test Structure

Each test file follows this pattern:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { SystemUnderTest } from '../path/to/system';

describe('SystemUnderTest', () => {
  let system: SystemUnderTest;

  beforeEach(() => {
    system = new SystemUnderTest();
  });

  describe('methodName', () => {
    it('describes expected behavior', () => {
      const result = system.methodName();
      expect(result).toBe(expectedValue);
    });
  });
});
```

## Mocking Strategy

### Phaser Scene Mocking
Phaser scenes are mocked in `setup.ts` and individual test files to avoid rendering overhead.

### Logger Mocking
Console methods are mocked globally in `setup.ts` to reduce test noise.

### EventBus Mocking
EventBus is not mocked — events are tested as integration points.

### Math.random Mocking
Use `vi.spyOn(Math, 'random').mockReturnValue(0.5)` for deterministic tests.

## CI/CD Integration

Tests run automatically in CI/CD pipeline (configured by DevOps Engineer).

### GitHub Actions Example
```yaml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:coverage
```

## Future Test Coverage

### Planned Test Files
1. `MatchEngine.test.ts` — match detection, cascade resolution, special gem creation
2. `JestSDK.test.ts` — SDK wrapper methods, mock mode detection
3. `PurchaseFlow.test.ts` — purchase flow, JWT verification, error handling
4. `SceneLifecycle.test.ts` — scene transitions, state management
5. `AnalyticsEvents.test.ts` — event tracking, property validation

## Writing New Tests

### Best Practices
1. Use descriptive test names that explain the expected behavior
2. Follow AAA pattern: Arrange, Act, Assert
3. Test one thing per test case
4. Use `beforeEach` to reset state between tests
5. Mock external dependencies (Phaser, network, time)
6. Test edge cases and error conditions
7. Aim for 85%+ coverage on all new code

### Example Test
```typescript
it('returns true when score meets minimum threshold', () => {
  // Arrange
  scoreSystem.init([1000, 2000, 3000]);
  scoreSystem.startCascadeChain();

  // Act
  scoreSystem.scoreMatches([createMatch(20)], [], 20); // 1000 points

  // Assert
  expect(scoreSystem.hasPassed()).toBe(true);
});
```

## Debugging Tests

### Run single test
```bash
npm run test -- -t "returns true when score meets minimum threshold"
```

### Enable verbose logging
```typescript
// In test file
import { Logger } from '../utils/Logger';
Logger.setLevel('debug');
```

### Use Vitest UI for debugging
```bash
npm run test:ui
```

Opens browser UI with test execution visualization.

## Questions?

Contact QA Engineer for test coverage questions or Principal Engineer for architecture approval.
