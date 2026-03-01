# Installing and Running the Test Suite

This guide shows how to install vitest and run the comprehensive test suite.

## Prerequisites

- Node.js 18+ installed
- npm installed
- Project dependencies installed (`npm install`)

## Step 1: Install Vitest

Run this command from the project root:

```bash
npm install -D vitest @vitest/ui jsdom @vitest/coverage-v8
```

This installs:
- `vitest` — Fast test runner (Vite-powered)
- `@vitest/ui` — Browser-based test UI
- `jsdom` — DOM environment for Phaser tests
- `@vitest/coverage-v8` — Code coverage reporting

## Step 2: Add Test Scripts to package.json

Open `package.json` and add these scripts to the `"scripts"` section:

```json
{
  "scripts": {
    "dev": "vite --port 3000",
    "build": "tsc --noEmit && vite build",
    "build:zip": "npm run build && node scripts/create-archive.js",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "size": "node scripts/check-size.js",
    "spike:fetch": "npx vite --port 3001 --open /test/fetch-spike.html",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

## Step 3: Run the Tests

### Run all tests once
```bash
npm run test
```

Expected output:
```
 ✓ src/__tests__/OfferManager.test.ts (21 tests)
 ✓ src/__tests__/ScoreSystem.test.ts (34 tests)
 ✓ src/__tests__/LevelManager.test.ts (25 tests)
 ✓ src/__tests__/Constants.test.ts (30 tests)
 ✓ src/__tests__/UIComponents.test.ts (40 tests)

Test Files  5 passed (5)
     Tests  150 passed (150)
  Start at  11:30:00
  Duration  2.3s
```

### Run tests in watch mode (auto-rerun on file changes)
```bash
npm run test:watch
```

### Generate coverage report
```bash
npm run test:coverage
```

Coverage report will be generated in `coverage/` directory. Open `coverage/index.html` in your browser.

Expected coverage:
- OfferManager: 100%
- ScoreSystem: 100%
- LevelManager: 100%
- Constants: N/A (validation tests)
- UIComponents: API contract coverage

### Run tests with UI (recommended for debugging)
```bash
npm run test:ui
```

Opens browser at http://localhost:51204/__vitest__/ with:
- Test execution visualization
- Interactive test tree
- Console output per test
- Rerun individual tests
- Filter by file or test name

## Step 4: Verify Installation

Run a single test file to verify everything works:

```bash
npm run test -- OfferManager.test.ts
```

Expected output:
```
 ✓ src/__tests__/OfferManager.test.ts (21 tests)
   ✓ OfferManager (21 tests)
     ✓ canCollectFreeGift (5 tests)
     ✓ getFreeGiftTimeRemaining (3 tests)
     ✓ formatTimeRemaining (6 tests)
     ✓ collectFreeGift (5 tests)
     ✓ isSpecialOfferActive (2 tests)
     ✓ getSpecialOfferTimeRemaining (2 tests)

Test Files  1 passed (1)
     Tests  21 passed (21)
```

## Troubleshooting

### Error: "Cannot find module 'vitest'"
**Solution:** Run `npm install -D vitest @vitest/ui jsdom @vitest/coverage-v8`

### Error: "ReferenceError: window is not defined"
**Solution:** Verify `vitest.config.ts` has `environment: 'jsdom'`

### Error: "Logger is not defined"
**Solution:** Check that `src/__tests__/setup.ts` exists and is referenced in `vitest.config.ts`

### Tests timeout
**Solution:** Increase timeout in `vitest.config.ts`:
```typescript
export default defineConfig({
  test: {
    testTimeout: 10000, // 10 seconds
  },
});
```

### Coverage not generated
**Solution:** Install coverage provider:
```bash
npm install -D @vitest/coverage-v8
```

## Running Specific Tests

### Run single test file
```bash
npm run test -- OfferManager.test.ts
```

### Run tests matching a pattern
```bash
npm run test -- -t "canCollectFreeGift"
```

### Run tests in a specific describe block
```bash
npm run test -- -t "ScoreSystem scoreMatches"
```

## CI/CD Integration

### GitHub Actions
Create `.github/workflows/test.yml`:

```yaml
name: Test
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

## Expected Test Results

After installation, running `npm run test` should show:

```
✓ OfferManager.test.ts
  ✓ canCollectFreeGift
    ✓ returns true when no previous claim exists
    ✓ returns false within cooldown period
    ✓ returns true after cooldown period has elapsed
    ✓ returns false exactly at cooldown boundary (just under)
    ✓ returns true exactly at cooldown boundary
  ✓ getFreeGiftTimeRemaining
    ✓ returns 0 when no previous claim exists
    ✓ returns correct countdown when inside cooldown period
    ✓ returns 0 when cooldown has elapsed
  ✓ formatTimeRemaining
    ✓ formats zero correctly as 00:00
    ✓ formats minutes and seconds correctly (mm:ss)
    ✓ formats single-digit minutes with leading zero
    ✓ formats two-digit minutes correctly
    ✓ rounds up partial seconds
    ✓ formats exactly 60 seconds as 01:00
  ✓ collectFreeGift
    ✓ updates lastFreeGiftAt timestamp
    ✓ awards coins with 80% probability (50 or 100 coins)
    ✓ awards 100 coins for roll between 0.6 and 0.8
    ✓ awards remap booster for roll >= 0.8
    ✓ returns none when gift not available yet
    ✓ does not modify player data when gift unavailable
  ✓ isSpecialOfferActive
    ✓ returns false when no offer expiry set
    ✓ returns true when offer expires in the future
    ✓ returns false when offer has expired
  ✓ getSpecialOfferTimeRemaining
    ✓ returns 0 when no offer expiry set
    ✓ returns correct time remaining for active offer
    ✓ returns 0 for expired offer

... (and 129 more tests)
```

## Next Steps

After successful installation:

1. Run full test suite: `npm run test`
2. Generate coverage report: `npm run test:coverage`
3. Review coverage in `coverage/index.html`
4. Add tests for new features before implementation
5. Set up CI/CD to run tests on every commit

## Questions?

- Test failures: Check `src/__tests__/README.md` for debugging tips
- Coverage questions: Contact QA Engineer
- Architecture questions: Contact Principal Engineer

---

**Installation Time:** ~2 minutes
**First Run Time:** ~3 seconds (150 tests)
**Watch Mode:** Auto-reruns in <100ms
