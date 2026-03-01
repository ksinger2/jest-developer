# Jest Platform Briefing

> **Purpose:** Role-specific TLDR for every team member building on the Jest platform. Read the Preamble first, then your role's section. For full API details, see `docs/jest-platform/`.

---

## Preamble: What Every Role Must Know

### What Is Jest

Jest is a **messaging-native game marketplace**. Games are web apps that run inside a sandboxed webview on jest.com. Players discover games via the Jest platform, play instantly in-browser (no install), and are re-engaged through SMS/RCS notifications sent to their phone's default messaging app.

- **Platform:** jest.com (web-based super-app)
- **SDK:** `JestSDK` global object — the single communication boundary between your game and the platform
- **Developer Console:** jest.com/developers — manage games, builds, products, images, sandbox users
- **Currency:** Jest Tokens (1 token = $1 USD)

### Hard Constraints (Violating = Rejection or Runtime Failure)

- All assets bundled in the build archive (no external CDN, no fetch to third-party servers)
- Mobile-first, touch-optimized, responsive layout
- Minimize build size and load time (compress assets, lazy-load non-critical resources)
- Asset paths must be relative to `index.html` (no absolute paths like `/assets/...`)
- No reliance on `window.location` or URL parameters (use `entryPayload` instead)
- Guest players MUST be supported for core gameplay
- Guests cannot receive notifications or make purchases
- No rewarded ads (not supported; use IAP instead)
- Content must comply with platform policies — no SHAFT content (Sex, Hate, Alcohol, Firearms, Tobacco, gambling, drugs)
- All games must be submitted for review and approved before going live
- Games must be both Approved AND set to Public to appear on the platform

### SDK Surface Area (Cheat Sheet)

| Module | Key Methods | Notes |
|--------|-------------|-------|
| **Player** | `getPlayer()` → `{ playerId, registered }` | Unique per game; persists guest→registered |
| **Player (signed)** | `getPlayerSigned()` → `{ playerSigned: JWS }` | For server-side auth (HS256, shared secret) |
| **Login** | `login({ entryPayload? })` | Prompts guest to register via SMS/RCS |
| **Player Data** | `data.get(key)`, `data.set(key, val)`, `data.set({})`, `data.delete(key)`, `data.flush()` | 1MB limit; shallow merge semantics; flush on exit |
| **Payments** | `getProducts()`, `beginPurchase({ productSku })`, `completePurchase({ purchaseToken })`, `getIncompletePurchases()` | 3-step flow; recover incompletes on startup |
| **Notifications** | `notifications.scheduleNotification({...})`, `notifications.unscheduleNotification({...})` | Registered users only; max 7 days ahead; images pre-approved |
| **Entry Payload** | `getEntryPayload()` | Arbitrary metadata passed via game link |
| **Referrals** | `referrals.shareReferralLink({...})`, `referrals.listReferrals()` | Share dialog + conversion tracking with signed JWS |

### Build & Technology

- **HTML5 (JS/TS)** — default for 2D games. Phaser, PixiJS, Cocos, Three.js, Babylon.js, Construct 3, Godot all work.
- **Unity WebGL** — for 3D/physics-heavy games. Larger builds, tighter performance constraints.
- SDK loaded via CDN script tag (`https://cdn.jest.com/sdk/latest/jestsdk.js`), not npm-bundled.
- Decision is made at project inception and is hard to reverse.

### Testing Tiers

1. **Mock mode** (local) — SDK auto-mocks when outside jest.com. Debug menu for simulating states.
2. **Hosted emulator** — Load local dev server inside jest.com shell via `?host=http://localhost:3000`.
3. **Sandbox users** — Real accounts created in Developer Console. Test uploaded builds with real platform features. Purchases are free.

### Content Review

- Games reviewed before listing (manual review). Must be Approved + Public to appear.
- Images for notifications reviewed before use (Pending → Pass/Fail).
- Notification content auto-moderated at runtime. Blocked notifications logged in Developer Console Events.
- Post-approval updates are subject to ongoing review but non-blocking.

### Doc References

All source documentation is saved locally in `docs/jest-platform/`. Key files:

| Topic | File |
|-------|------|
| Platform overview | `introduction.md` |
| Technical requirements | `requirements/technical.md` |
| Gameplay requirements | `requirements/gameplay.md` |
| SDK overview | `sdk/index.md` |
| Player identity & data | `sdk/player.md` |
| Notifications SDK | `sdk/notifications.md` |
| Payments SDK | `sdk/payments.md` |
| Entry payload | `sdk/entry-payload.md` |
| Referrals SDK | `sdk/referrals.md` |
| Developer Console | `dev-console/index.md` |
| Game management | `dev-console/games.md` |
| Build management | `dev-console/builds.md` |
| Product management | `dev-console/products.md` |
| Image management | `dev-console/manage-images.md` |
| Sandbox users | `dev-console/sandbox-users.md` |
| Review & moderation | `content-review-and-moderation.md` |
| Testing overview | `testing/index.md` |
| Mock testing | `testing/mock.md` |
| Emulator testing | `testing/emulator.md` |
| Sandbox testing | `testing/sandbox.md` |
| Notifications guide | `guides/notifications.md` |
| User acquisition guide | `guides/user-acquisition.md` |
| Geographical availability | `availability.md` |

---

## Section 1: Principal Engineer

> **Your role:** Final authority on architecture, technical standards, and cross-team alignment.

### Jest-Specific Focus Areas

- **Runtime model:** Your game runs in a sandboxed iframe/webview on jest.com. You do NOT own the runtime. All platform communication goes through the `JestSDK` global object — this is your single I/O boundary.
- **SDK is CDN-loaded**, not npm-bundled — affects build pipeline, versioning, and dependency management.
- **No external network calls** from the client. All assets bundled. If you need a backend (for leaderboards, AI, anti-cheat), communication flows: Client → JestSDK → Jest Platform → Your Server.
- **State persistence:** `playerData` is the only storage mechanism (no localStorage/sessionStorage). 1MB limit, shallow merge semantics, must flush on exit.
- **Player identity:** `getPlayer()` returns `{ playerId, registered }`. For server-side verification, use `getPlayerSigned()` which returns an HS256 JWS signed with your game's shared secret.

### Critical Decisions You Own

- **Tech stack:** HTML5 (JS/TS) vs Unity WebGL — irreversible, decides build constraints
- **Backend or not:** Optional but recommended for payments verification, leaderboards, AI, anti-cheat
- **SDK wrapper layer design:** How SDK calls are abstracted across the codebase
- **Error categorization:** Which SDK failures are recoverable (retry) vs non-recoverable (degrade)
- **Environment progression:** Mock → Emulator → Sandbox → Production

### Gotchas

- `playerData.set()` has MERGE semantics, not replace — must `delete()` to remove keys
- `flush()` required on pause AND exit — data loss otherwise
- Guest players get temporary IDs; no notifications, no purchases — degrade gracefully
- Game can be paused/terminated at any time by the platform
- Game slug is immutable after creation
- Product SKUs are immutable after creation (must archive and recreate)

### Docs to Read

`requirements/technical.md`, `sdk/index.md`, `sdk/player.md`, `sdk/payments.md`, `dev-console/builds.md`

---

## Section 2: AI Engineer

> **Your role:** AI/ML infrastructure, model integration, prompt engineering.

### Jest-Specific Focus Areas

- **No external API calls from client** — the sandbox blocks outbound network requests. All AI model calls must route through your backend: Client → JestSDK → Your Server → Model Provider.
- **Latency budget:** Games must load fast and sessions are short. AI responses must not create perceptible delays.
- **Content compliance:** AI-generated content (text, images, usernames) must comply with SHAFT policy. Notifications with non-compliant content are auto-blocked.

### Jest-Specific AI Patterns

- Pre-compute AI content at build time where possible (reduce runtime latency)
- Cache AI responses in `playerData` (but budget within the 1MB limit)
- For dynamic content (adaptive difficulty, procedural generation, NPC behavior): send game state to your server, return AI decisions, apply client-side
- Player context available: `playerId`, `registered` status, all `playerData`, `entryPayload`

### Gotchas

- Cannot call external APIs (OpenAI, etc.) directly from client — sandbox blocks it
- `playerData` is 1MB total — budget AI cache carefully
- AI-generated notification text is subject to runtime moderation

### Docs to Read

`requirements/technical.md`, `sdk/player.md`, `sdk/notifications.md`

---

## Section 3: Backend Lead Engineer

> **Your role:** Server-side architecture, APIs, databases, auth, security.

### Jest-Specific Focus Areas

- **JWS verification (HS256):** Verify player identity server-side using `getPlayerSigned()`. The shared secret (base64-encoded) is in Developer Console > Games > Secrets. Decode before use with most JWT libraries.
- **Payment verification:** `beginPurchase()` returns `purchaseSigned` (JWT). Verify on your server BEFORE granting items. Validate `aud` (game ID) and `sub` (player ID) claims.
- **Three-step payment flow (your server's role):**
  1. Client calls `beginPurchase()` → receives `purchaseSigned`
  2. Your server verifies JWT, grants item, stores `purchaseToken` as idempotency key
  3. Client calls `completePurchase({ purchaseToken })`
- **Incomplete purchase recovery:** On startup, client calls `getIncompletePurchases()` → sends `purchasesSigned` to your server → verify, grant, complete. Loop until `hasMore === false`.
- **Referral verification:** `listReferrals()` returns `referralsSigned` — same JWS pattern. Verify before granting referral rewards.

### Secrets Management

- **Shared Secret:** For JWS verification (player auth, purchases, referrals). Never in client code.
- **Upload Token:** For programmatic build uploads via CI/CD. Keep secure.
- If shared secret is leaked, rotate immediately in Developer Console.

### API Design Notes

- Your server is optional but recommended for: payment verification, leaderboards, multiplayer, anti-cheat, AI
- No direct client-to-server communication — client talks to JestSDK, your server verifies signed payloads
- Prices are in Jest Tokens (integer, 1 token = $1 USD) — field name is `credits` in PurchaseData

### Gotchas

- Products are defined in Developer Console, not hardcoded — your server should not assume product catalog
- `iat` claim included in JWS but no explicit expiration — implement your own freshness check (e.g., reject > 24h)
- Guest players: no purchases, no notifications — your server should handle gracefully

### Docs to Read

`sdk/player.md`, `sdk/payments.md`, `sdk/referrals.md`, `dev-console/games.md`

---

## Section 4: Frontend Lead Engineer

> **Your role:** Frontend architecture, component library, code standards.

### Jest-Specific Focus Areas

- **No external resources:** No CDN fonts, no external CSS, no external images — everything bundled in the build archive.
- **No web storage APIs:** No `localStorage`, `sessionStorage` — use `JestSDK.data.*` exclusively.
- **SDK wrapper layer:** All SDK calls should be wrapped with error handling, retry logic, and guest-player fallbacks. Establish this pattern before any feature work begins.
- **Lifecycle management:** Games can be paused/resumed/terminated at any time. Register handlers on boot, not retroactively.
- **Framework choice:** Lightweight renderers (Pixi.js, Phaser, Canvas2D) for games. React/Vue only justified for DOM-heavy games (quiz, trivia). Build size matters.

### Architecture Patterns

- SDK init before any game code (`await JestSDK.init()`)
- Every SDK call wrapped in try/catch
- Render all states: loading, empty, error, success for all SDK-backed features
- Guest vs registered player: conditionally show/hide features (no purchases, no notifications for guests)
- `flush()` player data on pause AND exit events
- Asset loading: critical assets in initial load, non-critical lazy-loaded

### Code Standards

- Relative asset paths only (e.g., `assets/myImage.jpg`, NOT `/assets/myImage.jpg`)
- Use `entryPayload` for passing data into the game, never URL params
- Touch-optimized UI (mobile messaging context)
- No autoplay audio — require user interaction first

### Docs to Read

`requirements/technical.md`, `sdk/index.md`, `sdk/player.md`, `testing/mock.md`

---

## Section 5: Frontend Engineer

> **Your role:** UI implementation, design system adherence, pixel-perfect screens.

### Jest-Specific Focus Areas

- **Sandboxed webview:** Everything runs inside jest.com's iframe. No external resources, no web storage, no URL params.
- **State rendering:** Every SDK-backed feature needs: loading state, empty/default state, error state, success state.
- **Guest vs registered UI:** Guest players see core gameplay but cannot access purchases or notifications. Show appropriate prompts to register.
- **Interruption handling:** Players can receive calls, background the app, or force-quit mid-game. Your UI must handle pause/resume gracefully.

### UI Constraints

- Mobile-first, touch-optimized (messaging app context — players play in messaging breaks)
- Short session UX — every screen must be immediately understandable
- Audio: respect mute state, no autoplay, gate behind user interaction
- All images/fonts/assets bundled locally (no external loading)
- Compress images (.webp/.avif), use appropriate dimensions

### Key UI Patterns

- Store UI: display products from `getProducts()`, handle purchase states (success, cancel, error)
- Notification scheduling UI: only show to registered players
- Registration prompts: show at natural moments (after completing a level, unlocking a feature)
- Pause overlay when game is interrupted

### Docs to Read

`requirements/technical.md`, `requirements/gameplay.md`, `sdk/player.md`

---

## Section 6: Senior Frontend Engineer

> **Your role:** End-to-end feature delivery — types through SDK integration through state management through UI through analytics.

### Jest-Specific Focus Areas

- **Feature anatomy:** Build in this order: types → SDK wrapper → state machine → UI → boot integration → analytics.
- **You own the full feature**, not just the view layer. SDK integration, error handling, retry logic, guest fallbacks, and analytics tagging are all your responsibility.
- **Payment integration** is the most complex feature. Master the three-step flow: `getProducts()` → `beginPurchase(sku)` → `completePurchase(token)`. Always recover incompletes on startup.
- **Notification scheduling:** Use `scheduleNotification()` with `entryPayload` for attribution. Unschedule stale notifications when player returns. Only for registered users.
- **Referral system:** `shareReferralLink()` opens share dialog with `entryPayload`. Track conversions via `listReferrals()`. Verify server-side before granting rewards.

### Key Method Signatures

- `JestSDK.getPlayer()` → `{ playerId: string, registered: boolean }`
- `JestSDK.getPlayerSigned()` → `{ playerSigned: JWS string }`
- `JestSDK.data.set({})` — shallow merge, NOT replace
- `JestSDK.data.flush()` → `Promise<void>` — call on pause AND exit
- `JestSDK.payments.beginPurchase({ productSku })` → `{ result, purchase?, purchaseSigned? }`
- `JestSDK.payments.completePurchase({ purchaseToken })` → `{ result }`
- `JestSDK.payments.getIncompletePurchases()` → `{ purchases[], purchasesSigned, hasMore }`
- `JestSDK.notifications.scheduleNotification({ body, ctaText, identifier, scheduledInDays?, scheduledAt?, priority?, imageReference?, entryPayload? })`
- `JestSDK.referrals.shareReferralLink({ reference, entryPayload?, shareTitle?, shareText? })`
- `JestSDK.getEntryPayload()` → `{ [key: string]: unknown }`

### Gotchas Checklist

- [ ] `playerData.set()` merges, does not replace
- [ ] Guest players: no notifications, no purchases — degrade gracefully
- [ ] Always recover incomplete purchases on boot (`getIncompletePurchases()`)
- [ ] `flush()` on pause AND exit
- [ ] Audio autoplay blocked — require user interaction
- [ ] `beginPurchase()` can also throw (timeout) — treat as retryable
- [ ] `completePurchase()` only AFTER durable grant — if you confirm first and crash, purchase is lost
- [ ] Notification images must be pre-approved in Developer Console
- [ ] Keep notification text < 100 chars, basic characters only (no emoji for SMS)
- [ ] Product SKUs come from Developer Console, not hardcoded

### Docs to Read

`sdk/player.md`, `sdk/payments.md`, `sdk/notifications.md`, `sdk/referrals.md`, `sdk/entry-payload.md`, `guides/notifications.md`

---

## Section 7: Lead Designer

> **Your role:** Design system, UX patterns, accessibility, component specs.

### Jest-Specific Focus Areas

- **Context:** Games run inside a mobile messaging app webview. Players are in their SMS inbox. Sessions are short, attention is high but brief.
- **Interruption-tolerant design:** Players can receive calls, switch apps, or be interrupted at any point. Design for seamless pause/resume.
- **Guest vs registered experience:** Guest players get core gameplay but cannot purchase or receive notifications. Design natural moments to prompt registration (after achieving something, not before).
- **Store/purchase UI:** The checkout overlay is platform-controlled (Jest handles it). You design the product display and the flow leading to checkout, not the checkout itself.
- **Notification content design:** You design the notification copy, CTA text, and image. Keep text < 100 chars, basic characters only (emoji may be stripped for SMS). Images must be uploaded and approved via Developer Console.

### Design Constraints

- Mobile-first, touch-optimized
- No external fonts or images from CDN — everything bundled in the build
- Build size includes all assets — design within budget
- Both portrait and landscape orientations should be considered
- Platform provides game branding surfaces: logo (square), hero image (wide banner), card color, description

### Key UX Decisions

- When to prompt registration (natural gameplay moments, not friction)
- Notification strategy (what's worth re-engaging the player for?)
- Store layout and product presentation
- Onboarding flow design (dedicated onboardings are the #1 conversion driver)
- How the game degrades for guest players

### Docs to Read

`requirements/gameplay.md`, `guides/notifications.md`, `guides/user-acquisition.md`, `dev-console/games.md`

---

## Section 8: Principal Product Manager

> **Your role:** Product strategy, competitive analysis, requirements, go-to-market.

### Jest-Specific Focus Areas

- **Distribution model:** Games discovered within Jest's messaging-native marketplace. No app store, no install. Players play instantly in-browser.
- **Monetization:** Jest Token system (1 token = $1 USD). Products defined in Developer Console with SKU, name, description, price. No rewarded ads currently (IAA coming soon).
- **Retention mechanism:** SMS/RCS notifications — the platform's core retention lever. At most 1 notification per user per day across ALL games. Priority field influences selection. This is the stickiest re-engagement channel available.
- **Guest → Registered funnel:** Critical conversion. Guest players can play but can't receive notifications or purchase. Registration unlocks the messaging channel. Dedicated onboardings are the most effective conversion tool.
- **Geographic scope:** Live in US only. Expanding to 14 countries Q3'2026 (Canada, UK, France, Germany, Brazil, Spain, Netherlands, Italy, Norway, Portugal, Austria, Sweden, Singapore, South Africa).

### Go-to-Market Considerations

- Game submission: upload build → submit for review → approval → set Public
- Content review: games manually reviewed, notifications auto-moderated, images manually reviewed
- Game slug (URL) is immutable after creation — choose carefully
- Developer Console provides analytics: DAU, new users, retention
- Jest Games Fund available for onboarding flow design and UA support
- UTM parameters supported for paid acquisition attribution

### Key Metrics to Own

- Load time (minimize for conversion)
- Guest → Registered conversion rate
- Notification opt-in and open rates (platform-managed, but strategy is yours)
- Purchase funnel: view products → begin purchase → complete purchase
- D1/D7/D30 retention
- Entry source attribution (organic, notification, referral, paid)

### Docs to Read

`introduction.md`, `requirements/gameplay.md`, `guides/user-acquisition.md`, `guides/notifications.md`, `availability.md`

---

## Section 9: Project Manager

> **Your role:** Feature tracking, exit criteria, cross-functional coordination.

### Jest-Specific Focus Areas

- **Delivery pipeline:** Dev (mock mode) → Integration (emulator) → QA (sandbox users) → Build upload → Submit for review → Approval → Go live
- **Review is a gate:** Games must be approved before listing. Plan for review turnaround time. Rejections require fixes and resubmission.
- **Post-launch updates** are subject to ongoing review but are non-blocking — you can keep deploying.
- **Team coordination:** Backend owns payment verification + JWS auth. Frontend owns SDK integration + UI. QA owns all three testing tiers. Designer owns notification content + onboarding flow. PM owns product catalog + pricing in Developer Console.

### Delivery Milestones

1. SDK integration complete (all modules wrapped and tested in mock mode)
2. Mock mode testing pass (all features, all states, guest + registered)
3. Emulator testing pass (real SDK inside jest.com shell)
4. Sandbox user testing pass (uploaded build, real device, real purchase flow)
5. Build upload + submission for review
6. Review approval
7. Set to Public → Live

### Risk Areas

- Build size creep (especially with Unity WebGL)
- Payment flow edge cases (interrupted purchases, recovery on startup)
- Notification content rejection (SHAFT policy, image approval delays)
- Guest player degradation not implemented (causes rejection)
- Game slug chosen poorly (immutable)

### Docs to Read

`testing/index.md`, `dev-console/builds.md`, `dev-console/games.md`, `content-review-and-moderation.md`

---

## Section 10: QA Engineer

> **Your role:** Automated test suite, quality gatekeeper.

### Jest-Specific Focus Areas

- **Three testing tiers** — structure your test suite accordingly:
  1. **Mock mode:** SDK auto-mocks outside jest.com. Debug menu simulates states. Write unit/integration tests here.
  2. **Hosted emulator:** Real SDK, local code. Append `?host=http://localhost:3000` to game URL on jest.com. Integration tests.
  3. **Sandbox users:** Real accounts, uploaded build, real platform. End-to-end validation.

### Critical Test Scenarios

**Payments (highest risk):**
- Full 3-step purchase: `getProducts()` → `beginPurchase()` → `completePurchase()`
- Player cancels checkout (`result: "cancel"`)
- Purchase error (`result: "error"`, each error code)
- Incomplete purchase recovery on startup (`getIncompletePurchases()` loop until `hasMore === false`)
- Guest player attempts purchase (should be blocked gracefully)
- `completePurchase()` called only AFTER grant (never before)

**Player Identity & Data:**
- Guest vs registered player states
- `playerData.set()` merge semantics (set two keys, verify both persist, verify no overwrite)
- `playerData` 1MB limit exceeded (should fail gracefully)
- `flush()` called on pause and exit
- Default values for new players (no existing data)

**Notifications:**
- Schedule notification for registered user (verify in Developer Console)
- Attempt to schedule for guest (should not schedule)
- Unschedule by identifier
- Replace notification by reusing identifier
- Invalid/unapproved `imageReference` (should fail, check Events > Errors)
- Notification text > 100 chars, emoji characters

**Lifecycle:**
- Pause/resume under all conditions (mid-purchase, mid-save, mid-animation)
- SDK init failure handling
- Force-quit and return (data persisted via flush?)

**Build Verification:**
- No unhandled promise rejections
- All asset paths relative
- No external network requests

### Docs to Read

`testing/mock.md`, `testing/emulator.md`, `testing/sandbox.md`, `sdk/payments.md`, `sdk/player.md`

---

## Section 11: Manual QA Tester

> **Your role:** Exhaustive manual testing, device matrix, visual audits.

### Jest-Specific Focus Areas

- **Device testing:** Games run in Jest app webview, not standalone browser. Test on real mobile devices.
- **Sandbox user testing:** Create sandbox users in Developer Console → Generate Login Link → test on device.
- **Test all player types:** Guest (no account), newly registered, returning (with existing playerData).

### Test Matrix

**Core Flows:**
- [ ] Full game flow as guest player (gameplay works, purchases/notifications blocked gracefully)
- [ ] Full game flow as registered player (all features available)
- [ ] Returning player with existing data (progress loaded correctly)

**Payments:**
- [ ] Buy a product (sandbox = free), verify item granted
- [ ] Cancel mid-checkout, verify no item granted
- [ ] Interrupted purchase (force-quit after `beginPurchase`, reopen, verify recovery)

**Notifications:**
- [ ] Schedule notification as registered player → verify in Developer Console
- [ ] Receive notification → tap → game opens with correct `entryPayload`
- [ ] Verify notification text/image display correctly

**Referrals:**
- [ ] Share referral link → open on another device/account → verify `entryPayload` arrives
- [ ] Verify conversion appears in `listReferrals()`

**Interruptions:**
- [ ] Incoming call during gameplay → resume works
- [ ] Background app → return → state preserved
- [ ] Force-quit → reopen → data persisted (if flush() was called)

**Content Compliance:**
- [ ] No SHAFT content in game, notifications, or user-generated text
- [ ] Notification images approved in Developer Console

### Docs to Read

`testing/sandbox.md`, `dev-console/sandbox-users.md`, `requirements/gameplay.md`

---

## Section 12: Data Scientist

> **Your role:** Analytics taxonomy, event tracking, measurement frameworks.

### Jest-Specific Focus Areas

- **No external analytics SDKs from client** — sandbox blocks outbound network requests. Tracking must route through your backend or use Jest's built-in analytics.
- **Entry source attribution** is built into the platform:
  - UTM parameters (paid acquisition): `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`
  - `entryPayload` (viral/social): structured attribution data accessible via `getEntryPayload()`
  - Notification attribution: embed `notification_template` and `notification_offset` in `entryPayload` when scheduling

### Jest-Specific Events to Track

| Event | Source | Notes |
|-------|--------|-------|
| Session start/end | `JestSDK.init()` + game logic | Track duration |
| Player type | `getPlayer().registered` | Guest vs registered segmentation |
| Entry source | `getEntryPayload()` + UTM params | Organic, notification, referral, paid |
| Registration | `login()` completion | Guest → Registered conversion |
| Product view | `getProducts()` call | Store impression |
| Purchase begin | `beginPurchase()` | Funnel step 1 |
| Purchase complete | `completePurchase()` | Funnel step 2 (revenue event) |
| Purchase cancel/error | `beginPurchase()` result | Drop-off analysis |
| Notification scheduled | `scheduleNotification()` | With template + offset tags |
| Notification opened | `entryPayload.notification_template` | Re-engagement attribution |
| Referral shared | `shareReferralLink()` | Viral loop start |
| Referral converted | `listReferrals()` | Viral loop completion |

### Jest-Specific Funnels

1. **Guest → Registered:** Session start → Core gameplay → Registration prompt → `login()` → Registered
2. **Purchase funnel:** View products → Begin purchase → Complete purchase (3-step, watch for drop-off at each step)
3. **Notification loop:** Schedule → Deliver (platform-managed) → Open → Re-engaged session → Schedule next
4. **Referral loop:** Share link → Friend opens → Friend plays → Friend registers → Conversion counted

### Gotchas

- Player IDs are opaque strings — do not parse or assume format
- Guest player IDs may not persist across sessions
- Notification delivery is platform-managed (at most 1/user/day across ALL games) — you control scheduling, not delivery
- `entryPayload` is your primary attribution mechanism for non-UTM traffic

### Docs to Read

`sdk/player.md`, `sdk/entry-payload.md`, `guides/notifications.md`, `guides/user-acquisition.md`

---

## Section 13: Senior Game Strategist

> **Role:** Market intelligence, competitive analysis, monetization strategy, and development planning. You decide what the studio builds and how it makes money.

### Jest Marketplace Landscape

- **29+ games live** on jest.com — dominated by casual genres: puzzle, word, card, match/merge, action, quiz, story
- **Revenue model:** Jest Tokens (1 token = $1 USD), **90/10 revenue split** favoring developers (vs 70/30 app stores)
- **Retention edge:** Messaging-native re-engagement delivers **3-4x retention** vs traditional mobile
- **UA edge:** **30-60% lower** user acquisition costs than mobile app installs
- **Funding available:** Jest Games Fund — $1M/flagship, $200K/mid-stage, $40K/experimental
- **Current market:** US-only. 14 countries Q3'2026 (FR, DE, ES, UK, BR, NL, AT, IT, NO, PT, SG, ZA, SE, CA)

### Strategic Advantages to Exploit

1. **Instant play (no install)** — Zero friction from discovery to gameplay. Design onboarding to capitalize on this.
2. **Messaging inbox as retention surface** — The stickiest re-engagement channel. Registration unlocks it. Push players to register early.
3. **1/user/day notification cap** — Platform handles delivery. Schedule aggressively (D0-D7), the platform deduplicates. Quality over quantity.
4. **No rewarded ads** — IAP is the only revenue model. Design for purchase motivation, not ad tolerance.
5. **90/10 split** — Each dollar earned keeps $0.90. Dramatically changes LTV math vs app stores.
6. **Small marketplace** — 29 games = opportunity to dominate categories. First-mover advantage in underserved genres.

### Monetization Framework

- **Products defined in Developer Console** — SKU, name, Jest Token price, image, description
- **3-step payment flow:** `getProducts()` → `beginPurchase({productSku})` → `completePurchase({purchaseToken})`
- **Recovery required:** Call `getIncompletePurchases()` on startup — if a purchase was interrupted, complete it before enabling new purchases
- **IAP categories to design:**
  - Consumables: coins, energy, hints, extra lives, boosters
  - Non-consumables: premium levels, character unlocks, cosmetics
  - Content packs: level bundles, seasonal content
- **Pricing benchmarks (F2P mobile):** Starter packs $0.99-$1.99, core currency $4.99-$9.99, premium bundles $19.99-$49.99
- **Jest Token consideration:** 1:1 USD mapping means pricing feels more "real" — be strategic about price points

### Retention Mechanics to Prioritize

- **Session design:** 3-5 minute sessions (messaging context = short attention windows)
- **Progression systems:** Levels, XP, unlocks — clear sense of advancement
- **Daily rewards / login streaks** — Tie to notification scheduling (D1-D7 reminders)
- **Social hooks:** Referral system (`shareReferralLink`), leaderboards, challenges
- **Content freshness:** Regular level/content updates to prevent staleness
- **Notification strategy:** Progress-based notifications ("Level 12 is waiting!"), not generic ("Come back and play!")

### F2P Market Intelligence

- **Top casual genres (mobile):** Match-3, word puzzles, merge games, idle/incremental, card games, trivia
- **Key retention mechanics:** Daily challenges, limited-time events, progression gates, social competition
- **Sustainable monetization patterns:** Soft gates (energy/lives), hard gates (premium content), cosmetics, convenience (skip timers)
- **Anti-patterns to avoid:** Pay-to-win, aggressive pop-ups, mandatory purchases to progress, deceptive pricing

### Development Planning Framework

1. **Game 1 (MVP):** Pick the genre with highest Jest platform fit + fastest path to revenue. Ship in 4-6 weeks.
2. **Validate:** Measure D1/D7 retention, registration conversion, purchase conversion, notification re-engagement
3. **Game 2:** Diversify genre. Apply learnings from Game 1. Ship in 4-6 weeks.
4. **Scale:** Double down on the game with better metrics. Apply for Jest Games Fund with data.
5. **Portfolio:** Build to 3-5 games. Share backend infrastructure, analytics, and content pipeline.

### Key Metrics to Target

| Metric | Target | Why |
|--------|--------|-----|
| D1 retention | >40% | Platform messaging should make this achievable |
| D7 retention | >20% | Jest's 3-4x advantage makes this realistic |
| D30 retention | >10% | Content freshness and social hooks drive this |
| Registration rate | >50% of D1 | Unlocks notifications = unlocks retention |
| Purchase conversion | >3-5% of registered | Higher than mobile average due to engaged base |
| ARPU (monthly) | $0.50-$2.00 | 90/10 split makes lower ARPU viable |

### Playtesting Protocol

1. Play every game on jest.com — assess mechanics, monetization, UX, onboarding
2. Note: which games feel polished, which have IAP, which have progression, which feel sticky
3. Test on iOS Simulator (iPhone 17 Pro) via idb to assess mobile experience
4. Research top F2P mobile games (Candy Crush, Wordle, Royal Match, Merge Mansion, etc.) for mechanic benchmarks
5. Document findings → produce competitive matrix → recommend studio's first game

### Docs to Read

`sdk/payments.md`, `guides/notifications.md`, `guides/user-acquisition.md`, `availability.md`, `dev-console/products.md`
