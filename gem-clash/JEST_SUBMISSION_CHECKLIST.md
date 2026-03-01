# Gem Link — Jest Platform Submission Checklist

**Game:** Gem Link
**Build Archive:** `gem-link.zip` (1.0 MB compressed)
**Date:** 2026-02-28
**Status:** Ready for Upload

---

## Build Verification (COMPLETE)

### Archive Details
- **File:** `/Users/karen/Desktop/Git Projects/skill-legal/gem-clash/gem-link.zip`
- **Size:** 1,033,635 bytes (0.99 MB) — Well under 10MB limit
- **Files:** 38 files total
- **Entry Point:** `index.html` at root
- **Assets:** All bundled locally (gems, UI, levels, JS bundle)

### Technical Validation
- [x] `index.html` is the entry point
- [x] Jest SDK script tag present: `<script src="https://cdn.jest.com/sdk/latest/jest-sdk.js"></script>`
- [x] All asset paths are relative (no absolute paths)
- [x] No external CDN requests (all assets bundled)
- [x] Build size under 10MB (current: 0.99 MB)
- [x] No hidden files or source maps in archive
- [x] TypeScript compilation successful (zero errors)
- [x] Tests passing (184/184)
- [x] Guest mode functional (levels 1-10 without registration)

### Code Quality
- [x] No console errors in development build
- [x] TypeScript strict mode enabled
- [x] All unused imports removed
- [x] Production build optimized and minified

---

## Pre-Submission Checklist

### 1. Jest Developer Console Setup

Before uploading the build, verify these items are configured in the Jest Developer Console:

#### Game Registration
- [ ] **Game slug:** `gem-link` (or chosen slug) registered
- [ ] **Game title:** "Gem Link" set
- [ ] **Description:** Match-3 puzzle game description added
- [ ] **Category:** Puzzle (or appropriate category) selected
- [ ] **Explore card image:** 16:9 aspect ratio image uploaded

#### Product Catalog (SKUs)
The game currently has 3 IAP products defined in code. Register these in Developer Console:

1. **Starter Pack**
   - SKU: `starter_pack`
   - Name: "Starter Pack"
   - Price: 2 Jest Tokens ($2.00 USD)
   - Description: "50 coins + 3 power-ups"

2. **Coin Bundle**
   - SKU: `coin_bundle`
   - Name: "Coin Bundle"
   - Price: 5 Jest Tokens ($5.00 USD)
   - Description: "200 coins for extra moves and power-ups"

3. **Premium Pass**
   - SKU: `premium_pass`
   - Name: "Premium Pass"
   - Price: 10 Jest Tokens ($10.00 USD)
   - Description: "Unlimited lives + exclusive gems"

#### Notification Configuration
The game schedules notifications. Configure these in Developer Console:

1. **Daily Reminder** (scheduled D1 after last play)
   - Template: "Your gems are waiting! Come back and play."
   - CTA: "Play Now"

2. **Level Progress** (scheduled after completing level 5, 10, 15, etc.)
   - Template: "Amazing progress! Next level unlocked."
   - CTA: "Continue"

3. **Streak Reminder** (scheduled if player has 3+ day streak)
   - Template: "Keep your streak alive! Don't miss today's match."
   - CTA: "Play"

**Note:** Notification images must be uploaded and approved separately in Developer Console > Manage Images.

#### Security Configuration
- [ ] **Shared secret:** Configured for JWT verification (required for server-side purchase verification)
- [ ] **Upload token:** Generated (if using CI/CD for build uploads)

#### Compliance
- [ ] **Privacy Policy URL:** Added (if collecting any player data)
- [ ] **SHAFT Compliance:** Self-certification completed (no Sex, Hate, Alcohol, Firearms, Tobacco content)

---

## Three-Tier Testing Gate

### Tier 1: Mock Mode (Local Development) — COMPLETED

- [x] All scenes load and transition correctly
- [x] Match-3 gameplay functions
- [x] Guest mode works (levels 1-10 accessible)
- [x] SDK initialization succeeds in mock mode
- [x] Player data saves/loads correctly
- [x] Purchase flow simulated (mock products display)
- [x] No JavaScript errors in console
- [x] All UI elements render correctly

### Tier 2: Emulator (Jest Developer Console) — PENDING

Upload the build to Jest Developer Console and test in the hosted emulator:

**URL Format:** `https://jest.com/play/gem-link?host=http://localhost:3000`

Test Items:
- [ ] SDK initializes correctly (real SDK, not mock)
- [ ] Player data loads/saves via real SDK
- [ ] Product catalog retrieves correctly from Developer Console
- [ ] Scene transitions work inside Jest webview
- [ ] All UI elements render correctly in Jest environment
- [ ] No CORS or network errors in console
- [ ] Guest vs registered player states differentiated

### Tier 3: Sandbox (Pre-Production) — PENDING

Create sandbox users in Developer Console and test the uploaded build:

**Test Accounts:**
- Create 2-3 sandbox users via Developer Console
- Generate login links for each user
- Test on real mobile devices (iOS/Android)

Test Items:
- [ ] Full purchase flow with test payments (sandbox = free)
- [ ] JWT verification succeeds (if backend implemented)
- [ ] Notification delivery works (schedule → verify in Developer Console)
- [ ] Analytics events appear in Developer Console dashboard
- [ ] Performance acceptable on target devices (no lag, smooth 60fps)
- [ ] Guest → Registered conversion flow works
- [ ] Player data persists across sessions
- [ ] Incomplete purchase recovery works (force-quit during purchase, reopen, verify completion)

---

## Upload Instructions

### Step 1: Navigate to Developer Console
1. Go to: https://jest.com/developers
2. Log in with your Jest developer account
3. Select your game (or create new game if first submission)

### Step 2: Upload Build
1. Navigate to **Builds** section
2. Click **Upload New Build**
3. Select file: `/Users/karen/Desktop/Git Projects/skill-legal/gem-clash/gem-link.zip`
4. Wait for upload to complete
5. Build will appear in "Pending Review" status

### Step 3: Submit for Review
1. Once build is uploaded, click **Submit for Review**
2. Complete any required submission forms
3. Confirm submission

### Step 4: Track Review Status
- Review typically takes 1-3 business days
- Check Developer Console for review status updates
- Respond promptly to any reviewer feedback

### Step 5: Go Live
Once approved:
1. Set game visibility to **Public** in Developer Console
2. Game will appear in Jest marketplace
3. Monitor analytics and player feedback

---

## Post-Upload Testing (Emulator)

After uploading to Jest Developer Console, test the build in the hosted emulator:

### Access the Emulator
1. In Developer Console, navigate to your game
2. Copy the game URL (e.g., `https://jest.com/play/gem-link`)
3. Open in browser with emulator mode enabled

### Verification Tests
- [ ] Game loads without errors
- [ ] SDK initialization succeeds
- [ ] Player data persists (save progress, reload, verify)
- [ ] Products display correctly from catalog
- [ ] Purchase flow works (mock payment in emulator)
- [ ] Notifications can be scheduled (verify in Events log)
- [ ] No console errors or warnings

---

## Common Rejection Reasons (Avoid These)

1. **Missing Guest Mode:** Game requires registration to play core gameplay
2. **External Assets:** Game tries to load fonts/images from external CDN
3. **Broken Purchase Flow:** `completePurchase()` called before grant, or incomplete purchase recovery not implemented
4. **SHAFT Violations:** Content contains prohibited material
5. **Poor Performance:** Game lags or crashes on target devices
6. **Broken Navigation:** Back button or pause/resume not handled correctly
7. **Missing SDK Integration:** SDK not initialized or key features (playerData, payments) not implemented

---

## Build Regeneration (If Needed)

If you need to regenerate the build archive:

```bash
cd "/Users/karen/Desktop/Git Projects/skill-legal/gem-clash"
npm run build:zip
```

This will:
1. Run TypeScript compilation (`tsc --noEmit`)
2. Build production bundle with Vite
3. Create `gem-link.zip` in project root
4. Validate archive structure

---

## Contact & Support

- **Jest Developer Console:** https://jest.com/developers
- **Jest Platform Docs:** See `/Users/karen/Desktop/Git Projects/skill-legal/docs/jest-platform/`
- **Technical Support:** support@jest.com (if issues arise)

---

## Next Steps

1. **Complete Developer Console setup** (game registration, SKUs, notifications, secrets)
2. **Upload build** to Jest Developer Console
3. **Run Tier 2 tests** (emulator)
4. **Create sandbox users** and run Tier 3 tests
5. **Submit for review**
6. **Address any reviewer feedback**
7. **Go live** once approved

---

**Ready for Upload:** YES
**Archive Location:** `/Users/karen/Desktop/Git Projects/skill-legal/gem-clash/gem-link.zip`
**Archive Size:** 0.99 MB (well under 10MB limit)
**Build Quality:** PASS (zero TypeScript errors, 184 tests passing)
