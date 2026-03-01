# Product Requirements Document: Gem Clash

> **Author:** Principal Product Manager
> **Status:** Draft — Blockers Resolved, Ready for Development
> **Date:** February 2026 | **Version:** 1.0
> **Platform:** Jest (jest.com) — messaging-native HTML5 game marketplace
> **Approvers:** Principal Engineer, Lead Designer, Project Manager, Senior Game Strategist
> **Source Documents:** `game-strategy-assessment.md`, `gem-clash-mockup.html`, `jest.md`, `docs/jest-platform/`

---

## 1. Executive Summary

Gem Clash is a **social match-3 puzzle game with asynchronous PvP**, built for the Jest platform. Players complete move-limited levels, earn stars, and challenge friends to beat their scores via SMS/RCS messaging — leveraging Jest's unique messaging-native DNA as a core gameplay loop rather than a bolted-on feature.

**Why this game, why now, why Jest:**
- **Market proof:** Match-3 is the most proven casual genre globally (Royal Match $2B+, Candy Crush $20B+, Match Masters $100M+/year PvP model)
- **Platform gap:** Jest has 29 games and zero competitive/social match-3 — first-mover advantage
- **Revenue edge:** 90/10 developer split means $0.90 kept per $1 vs $0.70 on app stores — 29% more revenue per transaction

**Target launch:** MVP in 4 weeks, fully-featured in 12 weeks
**Revenue target:** $75/mo (Month 1) → $10,000/mo (Month 6) at conservative projections
**Primary differentiator:** The only match-3 on Jest with social challenges, IAP, and progressive content

---

## 2. Product Vision & Strategic Rationale

### 2.1 Vision Statement

> When players want a quick competitive break during a messaging session, Gem Clash gives them a 3-minute match-3 challenge they can share with friends — turning every completed level into a social moment that arrives in someone's inbox.

### 2.2 Why Match-3

Match-3 is the single most commercially successful casual game genre:
- Universally understood mechanic — zero tutorial friction
- Infinitely expandable via level content (Candy Crush: 15,000+ levels)
- Highest IAP conversion rates in casual gaming (3-7% of active players)
- Proven on HTML5/web platforms — lightweight, grid-based rendering

### 2.3 Why Jest

| Jest Advantage | Impact on Gem Clash |
|---|---|
| **90/10 revenue split** | $0.90 kept per $1 (vs $0.70 on App Store) — 29% more revenue |
| **3-4x retention** via SMS/RCS | Messaging inbox is the stickiest re-engagement surface |
| **Instant play** (no install) | Zero friction from discovery to gameplay |
| **30-60% lower UA costs** | Cheaper to acquire players than app store installs |
| **1 Token = $1 transparent pricing** | No obfuscated premium currency — builds trust |
| **Jest Games Fund** | Up to $200K mid-stage funding available with retention data |

### 2.4 Competitive Gap

The Jest marketplace has 29 games. Three are match/merge: Puppy Mansion (solo + renovation meta), Best Friends Puzzle (solo + story), Match Shapes (solo gem merging). **None have social/competitive features. None appear to have IAP. Nobody is doing PvP match-3.**

DoonDook publishes 16 of the 29 games — all simple, single-mechanic titles with no social layer, no progression meta, and no monetization. This is volume play, not depth. There is a massive gap for a well-crafted, deeply monetized social game.

### 2.5 Strategic Alignment

Gem Clash is the studio's **first title**. It is designed to:
1. Validate the 22-agent team's ability to ship on Jest
2. Build reusable infrastructure (SDK wrapper, CI/CD, analytics) for future titles
3. Generate D7 retention data for Jest Games Fund application ($200K)
4. Establish the studio's brand on a small, early-stage marketplace where first movers dominate

---

## 3. Target Audience

**Primary:** Casual match-3 players (Candy Crush, Royal Match, Toon Blast audience) who are already on Jest or reachable via SMS/RCS challenge links.

**Secondary:** Jest platform users browsing the Explore surface — players who try games by impulse when scrolling the marketplace.

**Tertiary:** Social gamers who enjoy competing with friends (Match Masters, Words with Friends model) — the PvP challenge mechanic expands beyond the pure-puzzle audience.

**Session Context:**
- Messaging app breaks: 3-5 minute sessions during texting pauses
- High intent but short attention — players expect immediate gameplay, not lengthy loading/tutorials
- US-only until Q3 2026 (14 countries added: FR, DE, ES, UK, BR, NL, AT, IT, NO, PT, SG, ZA, SE, CA)

> **Assumption requiring validation:** We do not have Jest user demographic data. Player persona is based on casual mobile game demographics (primarily 25-45, 65% female for match-3). Must validate post-launch via analytics.

---

## 4. User Stories

### 4.1 Guest Player (Pre-Registration)

| ID | User Story | Acceptance Criteria |
|---|---|---|
| G-1 | As a guest, I want to play match-3 levels immediately without signing up, so I can evaluate the game before committing | Game loads in <3 seconds; first level playable with zero registration; no purchase/notification prompts before Level 3 |
| G-2 | As a guest, I want my progress saved between sessions, so I don't lose my level when I return | Player progress stored in `JestSDK.data`; guest ID persists within sessions; Level + stars survive page reload |
| G-3 | As a guest who reached Level 3, I want to be prompted to register at a natural gameplay moment | Registration prompt appears after Level 3 completion (configurable); prompt is dismissible; game continues if dismissed; prompt reappears after Level 5 if still guest |
| G-4 | As a guest, I want to clearly understand what I gain by registering | Registration prompt explains: notifications, purchases, challenge friends, save progress permanently |

### 4.2 Registered Player (Core Loop)

| ID | User Story | Acceptance Criteria |
|---|---|---|
| R-1 | As a player, I want to complete move-limited match-3 levels with increasing difficulty | Levels 1-30 available at MVP; each level has 15-25 moves; difficulty increases progressively; clear win/lose states |
| R-2 | As a player, I want to earn 1-3 stars per level based on my score | Star thresholds defined per level; stars displayed on level map; total star count tracked |
| R-3 | As a player, I want to see a level map showing my progression | Visual map with numbered levels; completed levels show stars earned; current level highlighted; locked levels visible |
| R-4 | As a player, I want to create special gems by matching 4+ in specific patterns | 4 in a row → line clear gem; 5 in a row → bomb gem; L/T shape → color bomb; special gem activation animations play on match |
| R-5 | As a player, I want to purchase extra moves when I'm close to completing a level | "Out of moves" overlay shows "3 Extra Moves — $1" button; purchase flow completes in <5 seconds; moves added instantly; game resumes from current board state |
| R-6 | As a player, I want to receive SMS notifications that bring me back to the game | D0-D7 notifications scheduled on first login; progress-based content ("Level 12 is waiting!"); tapping notification deep-links to the game |
| R-7 | As a player, I want my purchases to be recovered if the game crashes during checkout | `getIncompletePurchases()` called on every startup and login; incomplete purchases auto-completed before enabling new purchases |

### 4.3 Social Player (PvP / Challenges)

| ID | User Story | Acceptance Criteria |
|---|---|---|
| S-1 | As a player, I want to challenge a friend to beat my score on a specific level | After completing a level, "Challenge a Friend" button appears; tapping triggers `shareReferralLink()` with level ID + score in `entryPayload` |
| S-2 | As a challenged player, I want to tap an SMS link and play the exact same level | `getEntryPayload()` detects challenge data; same level loads with identical layout (seed-based generation); friend's score displayed as target |
| S-3 | As a player, I want to see my challenge results and pending challenges | Challenge screen shows: active challenges (VS cards), pending from friends, completed results (won/lost) |
| S-4 | As a player, I want to gift a booster to a friend via messaging | "Gift a Friend" in shop triggers purchase + `shareReferralLink()` with gift data; friend opens link and receives item |

---

## 5. Feature Specifications

### 5.1 Phase 1: MVP (Weeks 1-4)

#### 5.1.1 Core Match-3 Gameplay

- **Grid:** 8x8 board with 5-6 gem colors
- **Matching:** 3+ in a row or column clears matched gems; cascade/gravity fill
- **Special gems:**
  - 4-match in a row → Line Clear (clears entire row or column)
  - 5-match in a row → Bomb (clears 3x3 area)
  - L-shape or T-shape match → Color Bomb (clears all gems of one color)
- **Move limit:** 15-25 moves per level (defined per level by Level Designer)
- **Scoring:** Points per match, combo multiplier for cascades, bonus for remaining moves
- **Star rating:** 1-3 stars per level based on score thresholds
- **Level map:** Visual progression showing completed levels (with stars), current level, locked future levels
- **30 hand-crafted levels** with progressive difficulty curve (see Level Designer deliverables)

**Edge cases to handle:**
- No possible moves remaining → auto-shuffle board
- Last move creates a cascade that passes the score threshold → award appropriate stars
- Player backgrounds the browser mid-level → `data.flush()` saves state; resume on return
- Player clears all gems → rare but possible; award max score bonus

#### 5.1.2 Jest SDK Integration

| SDK Method | Usage | When Called |
|---|---|---|
| `getPlayer()` | Identify guest vs registered; branch UI | App startup |
| `data.get()` / `data.set()` | Load/save player progress | Startup, level complete, purchase, session end |
| `data.flush()` | Persist data to platform | On exit, on pause, after purchase |
| `login()` | Prompt guest to register | After Level 3 completion (configurable) |
| `getEntryPayload()` | Detect challenge data, notification attribution | App startup |
| `getProducts()` | Load available IAP products | Shop screen load, pre-purchase prompt |
| `beginPurchase()` | Start checkout flow | Player taps purchase button |
| `completePurchase()` | Confirm after granting item | Immediately after item granted |
| `getIncompletePurchases()` | Recover interrupted purchases | App startup, post-login |

**PlayerData Schema (1MB budget):**
```
{
  "level": 12,                    // Current level
  "stars": { "1": 3, "2": 2 },   // Stars per level
  "totalStars": 42,               // Running total
  "coins": 150,                   // Soft currency
  "lives": 4,                     // Current lives (max 5)
  "livesRegenAt": 1709000000000,  // Timestamp for next life
  "boosters": { "bomb": 2 },     // Booster inventory
  "streak": { "day": 5, "lastClaim": "2026-02-27" },
  "challenges": [],               // Phase 2
  "notifState": {}                // Phase 2
}
```

**Guest mode behavior:**
- Levels 1-10: Full gameplay available
- Purchases: Disabled (show registration prompt on attempt)
- Notifications: Not scheduled
- Challenges: Not available (Phase 2)
- Progress: Saved via `playerData`; transfers on registration

#### 5.1.3 Monetization (Phase 1)

**3 Initial Products:**

| SKU | Name | Price | Description | Trigger |
|---|---|---|---|---|
| `gc_moves_3` | 3 Extra Moves | 1 Token ($1) | Add 3 moves to current level | "Out of moves" overlay |
| `gc_starter_pack` | Starter Pack | 2 Tokens ($2) | 5 boosters + 50 coins | Shop + post-Level 5 one-time offer |
| `gc_lives_refill` | Refill Lives | 1 Token ($1) | Restore all 5 lives | 0 lives remaining + shop |

**Purchase flow implementation:**
1. Display product via `getProducts()` (cache products, refresh on shop open)
2. Player taps buy → `beginPurchase({ productSku })`
3. On `result: "success"` → grant item to player (update `playerData`) → `completePurchase({ purchaseToken })`
4. On `result: "cancel"` → dismiss gracefully, return to game
5. On `result: "error"` → show error message; retry for `internal_error`; remove product for `invalid_product`
6. On startup: `getIncompletePurchases()` → grant + complete any recovered purchases before enabling new purchases

**Lives System:**
- Maximum 5 lives
- 1 life consumed per level attempt (success or failure)
- 1 life regenerates every 25 minutes
- Full refill available via IAP (1 Token)
- At 0 lives: show countdown timer + "Refill Lives" purchase prompt

#### 5.1.4 Build & Deployment

- **Tech stack:** Phaser 3 (Custom Build — exclude physics, 3D, FB Instant Games) + TypeScript + Vite
- **Build target:** <10MB (compressed archive)
- **SDK loading:** `<script src="https://cdn.jest.com/sdk/latest/jestsdk.js"></script>` in `index.html`
- **Asset requirements:** All bundled, relative paths, no external requests
- **Image formats:** WebP preferred (fallback to PNG for transparency)
- **Audio:** Mono, compressed (MP3/OGG), lazy-loaded after initial scene
- **Loading sequence:** Load menu assets first → show menu → async load gameplay assets

### 5.2 Phase 2: Social & Retention (Weeks 5-8)

#### 5.2.1 PvP Challenge System

- Player completes a level → "Challenge a Friend" button on results screen
- Triggers `referrals.shareReferralLink()` with `entryPayload: { type: "challenge", level: 12, score: 8450, seed: "abc123" }`
- Friend receives SMS with deep link → opens game → `getEntryPayload()` detects challenge → loads same level (seed-based) with target score displayed
- Both scores compared → winner displayed → option to rematch or challenge on next level
- Challenge history stored in `playerData` (budget: ~100KB of the 1MB limit)

#### 5.2.2 Notification System

**Schedule on first registered login (D0-D7):**

| Day | Template | Example (< 100 chars) |
|---|---|---|
| D0 | Welcome | "Your gems are waiting! Come back and complete your next level." |
| D1 | Progress | "Level [X] is ready for you. Can you earn 3 stars?" |
| D2 | Streak | "Day 2 streak bonus is ready to claim! Keep it going." |
| D3 | Social | "Challenge a friend and see who's the real gem master!" |
| D4 | Progress | "You're [X] stars away from unlocking bonus content." |
| D5 | Urgency | "Your daily challenge resets soon. Don't miss today's reward!" |
| D6 | Social | "Your friends are playing. Can you beat their scores?" |
| D7 | Reward | "7-day streak reward waiting! Log in to claim it." |

**Rules:**
- All notifications < 100 characters, basic characters only (no emoji)
- Do not mention game name (platform adds it automatically)
- Use `entryPayload` for attribution: `{ notification_template: "d3_social", notification_offset: 3 }`
- Rotate through 10+ templates to avoid Groundhog Day trap
- When player returns: unschedule all queued notifications → reschedule fresh set based on current state

**Image pipeline:**
- Upload notification images to Developer Console
- Wait for approval (status: Pending → Pass/Fail)
- Only approved images can be referenced in `scheduleNotification()`
- Start pipeline in Phase 1 to avoid Phase 2 bottleneck

#### 5.2.3 Retention Features

- **Daily challenge:** 1 unique level per day, shared globally. Leaderboard for daily scores.
- **7-day login streak:** Escalating rewards (Day 1: 10 coins → Day 7: 1 free booster + 50 coins)
- **Star milestones:** Unlock bonus content at 50, 100, 200 total stars

### 5.3 Phase 3: Polish & Scale (Weeks 9-12)

#### 5.3.1 Season Pass

- 4-week seasons with free track + premium track (5 Tokens / $5)
- Free track: coins, basic boosters (available to all players)
- Premium track: exclusive gem skins, board themes, bonus daily challenges
- Season XP earned from: level completions, daily challenges, streak bonuses, challenge wins

#### 5.3.2 Social Gifting

- "Gift a Friend" in shop: purchase a booster (1 Token) → `shareReferralLink()` with gift payload → friend opens link → item auto-granted
- Referral rewards: invite 3 friends who register → earn 5 free boosters

#### 5.3.3 Content Pipeline

- Level editor tooling for Level Designer (internal tool)
- Target: 10 new levels per week post-launch
- Seasonal visual themes (Spring, Summer, Holiday) — reskin gem art + board backgrounds
- Procedural level generation as stretch goal

#### 5.3.4 Analytics & Optimization

- Tag all notifications and share links with `entryPayload` for attribution
- Funnel tracking: session start → level complete → purchase → share → friend conversion
- A/B test notification copy using `notification_template` field
- Difficulty curve tuning: track completion rate per level, adjust star thresholds

---

## 6. Platform Constraints

All Jest hard constraints that engineering, design, and content must respect:

| Constraint | Detail | Violating = |
|---|---|---|
| **Bundled assets** | No external CDN, no fetch to third-party servers | Runtime failure |
| **Relative paths** | All asset paths relative to `index.html` (not `/assets/...`) | Asset load failure |
| **No URL params** | Use `entryPayload`, not `window.location` | Undefined behavior |
| **Guest mode mandatory** | Core gameplay without sign-in for first play | Review rejection |
| **No rewarded ads** | IAP only (IAA coming eventually) | Review rejection |
| **SHAFT policy** | No Sex, Hate, Alcohol, Firearms, Tobacco, gambling, drugs in any content | Content blocked / rejection |
| **Notification: 1/user/day** | Platform selects which game's notification to deliver, across ALL games | Reduced delivery |
| **Notification: 100 chars** | SMS character limit; emojis stripped | Truncated content |
| **Notification: 7-day window** | Cannot schedule more than 7 days ahead | Scheduling failure |
| **Notification images** | Must be pre-approved in Developer Console | Notification blocked |
| **playerData: 1MB limit** | Key-value store, shallow merge semantics | Data loss / errors |
| **playerData: flush required** | Must call `data.flush()` on exit | Progress loss |
| **Payment: 3-step flow** | `getProducts()` → `beginPurchase()` → `completePurchase()` | Payment failure |
| **Payment: recovery mandatory** | Must call `getIncompletePurchases()` on startup/login | Lost revenue |
| **SKU immutability** | Product SKUs cannot be changed after creation | Permanent naming |
| **Game slug immutability** | Game URL slug cannot be changed after creation | Permanent URL |
| **US-only** | Expanding to 14 countries Q3 2026 | Geo-blocked users |
| **Build review gate** | Manual review before listing; must be Approved + Public | Launch blocked |
| **SDK via CDN** | Loaded via script tag, not npm; version not pinnable | Potential breaking changes |

---

## 7. Designs Needed

Explicit deliverables by phase for **Lead Designer** and **Level Designer**.

### Phase 1 Design Deliverables

| # | Deliverable | Owner | Notes |
|---|---|---|---|
| D-1 | **Visual design system** | Lead Designer | Color palette, typography, spacing, component library for game UI |
| D-2 | **Gem art** (5-6 colors) | Lead Designer | Each gem needs: base state, selected state, matched state (particle burst) |
| D-3 | **Special gem art** | Lead Designer | Line clear, bomb, color bomb — distinct from base gems, with activation animations |
| D-4 | **Board background** | Lead Designer | Default board background + borders; must work at 8x8 grid with 3px gaps |
| D-5 | **Main menu screen** | Lead Designer | Game logo, Play button, Shop button, Settings; Jest footer bar visible |
| D-6 | **Level select/map screen** | Lead Designer | Visual progression path with numbered levels, star indicators, current/locked states |
| D-7 | **Gameplay HUD** | Lead Designer | Topbar: level number, moves remaining, score. Booster tray below board. |
| D-8 | **Shop screen** | Lead Designer | Product cards with icon + name + description + price button (reference mockup) |
| D-9 | **Registration prompt** | Lead Designer | Modal overlay post-Level 3; explains benefits; dismissible; non-intrusive |
| D-10 | **Guest degradation UI** | Lead Designer | Grayed-out purchase buttons + "Register to unlock" labels for guests |
| D-11 | **Onboarding flow** | Lead Designer | Dedicated 3-screen onboarding per `guides/user-acquisition.md` best practice; most effective conversion tool |
| D-12 | **Developer Console assets** | Lead Designer | Game logo (square), hero image (wide banner), hex color for card |
| D-13 | **Animation specs** | Lead Designer | Gem swap, cascade/fall, match highlight, special gem activation, level complete |
| D-14 | **30 initial levels** | Level Designer | Progressive difficulty; star thresholds per level; move limits; special gem introduction pacing |
| D-15 | **Difficulty curve document** | Level Designer | Curve showing expected completion rate per level (target: 70-80% for early levels, 40-50% for hard levels) |

### Phase 2 Design Deliverables

| # | Deliverable | Owner | Notes |
|---|---|---|---|
| D-16 | **Challenge/VS screen** | Lead Designer | Reference mockup: player avatars, scores, VS indicator, pending challenges list |
| D-17 | **Share card visual** | Lead Designer | Image shown in SMS when sharing a challenge (optimized for messaging preview) |
| D-18 | **Notification image set** | Lead Designer | 5-10 images for notification attachments; must be uploaded and approved before use |
| D-19 | **Daily challenge UI** | Lead Designer | Distinct visual treatment for daily challenge level; countdown timer; leaderboard |
| D-20 | **Streak/reward claim UI** | Lead Designer | Login streak counter; escalating reward display; claim animation |

### Phase 3 Design Deliverables

| # | Deliverable | Owner | Notes |
|---|---|---|---|
| D-21 | **Season Pass UI** | Lead Designer | Free + premium track progression; season timer; XP bar |
| D-22 | **Cosmetic items** | Lead Designer | Board themes (3+), gem skins (2+ sets); must fit within build size budget |
| D-23 | **Gift-a-friend flow** | Lead Designer | Purchase → share → friend claim; SMS preview of gift |
| D-24 | **Level editor UI** | Lead Designer | Internal tool for Level Designer to create/test levels rapidly |

---

## 8. Engineering Decisions Needed

Unresolved technical decisions the engineering team must make. Each is flagged with urgency.

### Pre-Phase 1 — RESOLVED DECISIONS

> *All four blocker decisions resolved in team deliberation (Feb 2026). Participants: Principal Engineer, Principal PM, Senior Game Strategist, Frontend Lead, Backend Lead, Lead Designer, Project Manager.*

| # | Decision | Resolution | Rationale | Risks Accepted |
|---|---|---|---|---|
| E-1 | **Game engine** | **Phaser 3 (Custom Build)** — exclude physics, 3D, FB Instant Games plugin. Target ~700KB-1MB engine bundle. CI/CD alarm at 8MB total build. Custom build configured from Day 1. | Built-in scene management, input, tween/animation saves 1-2 weeks vs PixiJS. Match-3 tutorials/examples accelerate development. Tree-shaking mitigated by custom build. | Larger bundle than PixiJS (~200KB more); Phaser 4 migration irrelevant for our timeline |
| E-2 | **Game slug** | **`gem-clash`** — lowercase, hyphenated, matches Jest conventions. Prereq: Compliance Officer trademark check before Developer Console registration. | Matches game name exactly. Verified unique against all 29 Jest games. Shortest viable option. Hyphenated for readability/SEO. | Permanent URL if game rebrands (low risk — match-3 games rarely rebrand; display name can change; users reach via SMS deep links) |
| E-3 | **SKU naming** | **`gc_{descriptive_name}`** in snake_case. Phase 1 SKUs: `gc_moves_3`, `gc_starter_pack`, `gc_lives_refill`. Future: `gc_season_s1`, `gc_gift_booster`, `gc_moves_5`. Document convention before first SKU creation. | 2-letter game prefix namespaces for portfolio. Descriptive names are self-documenting. Quantity suffix (`_3`, `_5`) distinguishes variants. No over-engineering for 3 initial products. | No category prefix — manageable at <20 products/game |
| E-4 | **Backend for Phase 1** | **Two-track approach.** Track A (default): Client-only with hardened client-side validation. Track B (Week 1 spike): Test `fetch()` to external API from Jest webview. If external calls work → Cloudflare Worker JWT verification endpoint by end of Week 1. If blocked → client-only accepted, backend deferred to Phase 2. `getIncompletePurchases()` recovery is mandatory regardless. | Unblocks development immediately while testing the assumption. Cloudflare Worker = serverless, free tier, ~30 lines, 2-3 day implementation. Client hardening is valuable regardless. | If client-only: trivially spoofable purchases (low practical risk at 15 paying users/month). Track B spike owned by DevOps + Frontend Lead. |

#### E-4 Spike Findings: External API Access from Jest Webview

**Verdict: UNCERTAIN — strong circumstantial evidence that `fetch()` IS allowed, but requires empirical validation.**

The engineering team conducted a thorough review of all 25 Jest platform docs. Key findings:

1. **The official docs say "restricted," not "blocked"** — and specifically in the context of *asset loading*, not API calls. The section heading is "Do not load external assets."
2. **The JWT verification paradox:** Jest's own payments docs recommend server-side JWT verification (`"Use a standard JWT/JWS library on your backend"`) — but there is no documented SDK relay mechanism for client→server communication. The SDK surface (Player, PlayerData, Payments, Notifications, EntryPayload, Referrals) has no proxy/relay capability. This strongly implies direct `fetch()` is allowed.
3. **The official docs explicitly acknowledge backends:** `player.md` says "If your game has a backend" and describes sending signed payloads "to your server." `games.md` documents a "Shared Secret" for "authenticating your game server."
4. **No CSP/sandbox documentation found:** No mention of Content-Security-Policy headers, iframe sandbox attributes, or any specific blocking mechanism in any of the 25 docs.
5. **The team's internal briefing (`jest.md`) claims the sandbox blocks outbound requests** — but this appears to be an interpretation, not a documented fact. The briefing's `Client → JestSDK → Jest Platform → Your Server` relay pattern has no corresponding SDK API.

**Required next step:** Deploy a minimal test game to Jest that attempts `fetch('https://httpbin.org/get')` and observe the result. This can be done in the hosted emulator first (`?host=http://localhost:3000`), then as an uploaded build with a sandbox user. **Estimated time: <1 hour.**

**Verification server is pre-built:** Regardless of the spike outcome, the Cloudflare Worker JWT verification endpoint is ready to deploy at `backend/worker/`. See `backend/README.md` for deployment instructions. The client-side wrapper (`backend/client-wrapper.ts`) integrates into the game's purchase flow.

### Phase 1 Decisions

| # | Decision | Options | Notes |
|---|---|---|---|
| E-5 | **playerData schema** | See Section 5.1.2 | Must budget within 1MB; define key structure before development |
| E-6 | **Board generation algorithm** | Pure random vs. seed-based | Seed-based needed for Phase 2 PvP (same seed = same board). Implement seed-based from Phase 1 to avoid rewrite. |
| E-7 | **Guaranteed-solvable boards** | Pre-check vs. runtime shuffle | Must ensure player is never stuck with zero moves; either validate board at generation or auto-shuffle when no moves available |
| E-8 | **Asset pipeline** | Sprite atlas vs. individual files; WebP vs. PNG | Sprite atlas + WebP recommended for build size; need fallback strategy for older browsers |
| E-9 | **Build size budget allocation** | How to split <10MB | Proposed: Engine ~2MB, sprites ~3MB, audio ~2MB, fonts ~0.5MB, code ~1MB, buffer ~1.5MB |
| E-10 | **SDK wrapper layer** | Thin wrapper vs. full abstraction | Wrapper should handle: error retry, guest fallback, data.flush scheduling, SDK init race conditions |

### Phase 2 Decisions

| # | Decision | Options | Notes |
|---|---|---|---|
| E-11 | **Challenge state storage** | playerData (client-only) vs. backend DB | Client-only limits: can't query across players, no global leaderboard. Backend enables richer social features but adds infrastructure. |
| E-12 | **Score anti-cheat** | Trust client vs. server verification | Client-reported scores are trivially spoofable. For Phase 2 among friends, spoofing risk is low. Backend verification needed if leaderboards become competitive. |
| E-13 | **Notification scheduling engine** | State machine in playerData vs. backend scheduler | Must handle: D0-D7 initial schedule, reschedule on return, Groundhog Day rotation, stale notification cleanup |

---

## 9. Finance Decisions Needed

### 9.1 Product Catalog & Pricing

- **Decision:** Which products launch in Phase 1 vs. Phase 2 vs. Phase 3? Strategy assessment proposes 6 products total.
- **Phase 1 recommendation:** 3 products (Extra Moves $1, Starter Pack $2, Lives Refill $1) — validate purchase flow and conversion before expanding catalog
- **SKU naming:** ✅ Resolved. Convention: `gc_{descriptive_name}`. Phase 1 SKUs: `gc_moves_3`, `gc_starter_pack`, `gc_lives_refill`
- **Open question:** Does 1 Token = $1 transparent pricing help or hurt conversion? No benchmark data exists on Jest. Must validate post-launch.

### 9.2 Revenue Projection Validation

| Assumption | Value | Risk |
|---|---|---|
| Month 1 DAU | 500 | **HIGH** — No data on organic Jest Explore traffic for new games |
| Month 1 payer conversion | 3% | **MEDIUM** — Industry average for match-3 is 3-7%, but Jest is unproven |
| Month 1 ARPPU | $5 | **MEDIUM** — With only $1-$2 products, requires 3-5 purchases/payer/month |
| Month 6 DAU | 20,000 | **HIGH** — Assumes 40x growth in 5 months; what drives this? |
| 90/10 revenue retained | $0.90 per $1 | **LOW** — Confirmed in Jest docs |

**Recommendation:** Treat Month 1-3 projections as "proof of concept" thresholds, not revenue targets. The real goal is D7 retention data to qualify for Jest Games Fund.

### 9.3 Jest Games Fund Strategy

- **Available:** $200K (mid-stage), $1M (flagship), $40K (experimental)
- **Requirement:** Retention data (exact thresholds unknown)
- **Timeline:** Apply after 2-4 weeks of live data (Week 6-8)
- **Decision needed:** Which tier to target? $200K mid-stage is most realistic for a new studio with one title.
- **Risk:** Fund approval is not guaranteed. Revenue plan must not depend on it.

### 9.4 Cost Structure

| Cost Category | Detail | Decision Needed |
|---|---|---|
| Development | 22-agent team for 12 weeks | What is the burn rate? Agent cost model? |
| Backend hosting | If building payment verification server | Cloud provider, expected load, cost estimate |
| Notification delivery | $0 — Jest subsidizes 100% | No cost |
| Payment processing | $0 — Jest handles checkout | No cost |
| Asset creation | Gem art, board themes, audio | In-house (Lead Designer) or outsource? |

### 9.5 Challenge Wager Legality

> **CRITICAL FLAG:** The strategy assessment proposes a "Challenge Wager" feature where players bet 1 Token ($1) on score outcomes (line 82). **This likely constitutes gambling under SHAFT policy** (which explicitly blocks gambling). The SHAFT policy covers: Sex, Hate, Alcohol, Firearms, Tobacco — including gambling and drugs.

**Recommendation:** **Kill this feature.** Replace with non-monetary stakes: "Challenge for bragging rights" with cosmetic rewards for winners, not token wagering.

---

## 10. Success Metrics & KPIs

### Primary Metrics

| Metric | Target | How Measured | Phase |
|---|---|---|---|
| **D1 retention** | >40% | Jest Analytics tab | Phase 1 |
| **D7 retention** | >20% | Jest Analytics tab | Phase 1 |
| **D30 retention** | >10% | Jest Analytics tab | Phase 2+ |
| **Guest → registered conversion** | >50% of D1 | `getPlayer().registered` tracking | Phase 1 |
| **Purchase conversion** | 3-5% of registered | Purchase funnel events | Phase 1 |
| **ARPPU (monthly)** | $5 (M1), $8 (M3), $10 (M6) | Revenue / paying users | Phase 1+ |

### Secondary Metrics

| Metric | Target | Phase |
|---|---|---|
| Build load time | <3 seconds on mid-range mobile | Phase 1 |
| Build size | <10MB | Phase 1 |
| Level completion rate (Levels 1-10) | 70-80% | Phase 1 |
| Level completion rate (Levels 20-30) | 40-50% | Phase 1 |
| Challenge share rate | >10% of sessions | Phase 2 |
| Notification-attributed sessions | Track % of daily sessions from notifications | Phase 2 |
| Streak continuation rate (D3+) | >30% of streak starters | Phase 2 |
| Season Pass purchase rate | >5% of registered payers | Phase 3 |

### Anti-Metrics (Do NOT optimize for)

- Total downloads / plays (vanity — retention matters more)
- Session length > 10 minutes (over-engagement risks burnout in casual)
- Purchase prompts per session (aggressive prompting reduces LTV)

---

## 11. Go-to-Market Strategy

### Launch Sequence

| Week | Action | Goal |
|---|---|---|
| Week 1-4 | Development + Jest review submission | Build + get approved |
| Week 4-5 | Soft launch (Approved + Public) | Organic Jest Explore traffic |
| Week 5-6 | Activate notifications + challenges | Enable retention + viral loops |
| Week 6-8 | Collect D7/D14 retention data | Qualify for Jest Games Fund |
| Week 8 | Apply for Jest Games Fund ($200K) | Fund application |
| Week 9-12 | Season Pass + content pipeline | Scale revenue |
| Q3 2026 | Geographic expansion prep | 14 new countries |

### Explore Surface Optimization

Per `guides/user-acquisition.md`, the Explore surface is a key discovery channel. Optimize:
- **Game icon:** Eye-catching, readable at small sizes — the gem cluster from mockup
- **Hero image:** Action shot of gameplay with social challenge UI visible
- **Description:** "Challenge friends in match-3 puzzles! Beat their scores via text." (short, social-focused)
- **Color:** Vibrant gradient that stands out against Jest's dark background

### Dedicated Onboarding

Per Jest's own guidance, dedicated onboarding flows are "the most effective way to convert players." Design a 3-screen interactive onboarding:
1. **Screen 1:** Show a pre-set board → player makes one match → gems cascade satisfyingly
2. **Screen 2:** Show a friend challenge notification → "Beat Sarah's score!" → player completes a mini-level
3. **Screen 3:** Registration prompt with context: "Register to save your progress and challenge friends"

If accepted into Jest Games Fund, the Jest team will help design this flow.

---

## 12. Risks

| # | Risk | Severity | Likelihood | Mitigation |
|---|---|---|---|---|
| R-1 | **HTML5 performance on low-end Android** | High | Medium | Lightweight animations; budget build size <10MB; test on emulator with throttled CPU |
| R-2 | **Low initial traffic** (new game on new platform) | High | High | SMS viral loops, Explore optimization, Jest Fund application for UA support |
| R-3 | **Notification slot competition** (1/user/day across ALL games) | High | High | Use `priority: 'high'`; deeply integrate notifications with game state; make notifications irresistible and personal |
| R-4 | **Content review rejection** delays launch | Medium | Medium | Pre-check all content against SHAFT; Compliance Officer reviews everything; submit early |
| R-5 | **Image approval bottleneck** delays Phase 2 notifications | Medium | Medium | Start image pipeline in Phase 1; upload images weeks before they're needed |
| R-6 | **Match-3 genre has 3 existing Jest competitors** | Medium | Low | None have social/PvP — our core differentiator |
| R-7 | **Player churn without rewarded ads** as safety valve | Medium | Medium | Generous free tier; daily challenges; skill-based earning; social competition replaces ad dopamine |
| R-8 | **Content pipeline bottleneck** (10+ levels/week needed) | Medium | High | Level editor tooling in Phase 3; procedural generation as stretch goal |
| R-9 | **playerData 1MB limit** constrains feature expansion | Low | Medium | Budget schema carefully; monitor usage; migrate to backend if approaching limit |
| R-10 | **Score spoofing** in PvP challenges | Medium | Medium | Tolerate in Phase 2 (friends only); implement server-side verification if leaderboards launch |
| R-11 | **SKU/slug naming mistakes** (immutable) | High | Low | Team review + PPM sign-off before any slug/SKU creation |
| R-12 | **SDK breaking changes** (CDN-loaded, not pinnable) | Medium | Low | SDK wrapper layer isolates game code; regression tests on SDK methods |

---

## 13. Tradeoffs

| # | We Choose | We Sacrifice | Rationale |
|---|---|---|---|
| T-1 | **HTML5 (Phaser 3)** over Unity WebGL | 3D capabilities, physics engine, Unity ecosystem | Match-3 doesn't need 3D; HTML5 meets Jest's performance requirements; smaller builds |
| T-2 | **Client-only Phase 1** (no backend) | Server-side purchase verification, global leaderboards | Validate gameplay first; add backend in Phase 2 when social features require it |
| T-3 | **IAP only** (no rewarded ads) | Rewarded-ad revenue (30-60% of mobile casual revenue) | Jest constraint, not a choice; design around it |
| T-4 | **30 hand-crafted levels** over procedural generation | Faster content pipeline, infinite content | Quality matters for first impression; procedural gen is Phase 3 stretch goal |
| T-5 | **$1-$5 micro-pricing** over $10-$100 bundles | Higher per-transaction revenue | Jest's transparent $1=$1 pricing makes large purchases feel expensive; volume over whales |
| T-6 | **Async PvP** over real-time multiplayer | Real-time competitive excitement | No server infrastructure needed; messaging DNA is asynchronous; Match Masters proved async works |
| T-7 | **US-only launch** | Global audience at launch | Platform constraint until Q3 2026; focused market simplifies compliance |
| T-8 | **Guest mode: first 10 levels** over full access | Guest satisfaction for players who refuse to register | 10 levels demonstrates value; registration unlocks notifications (= retention) |
| T-9 | **Phaser 3** over PixiJS | Smaller bundle, more rendering control | Phaser's scene management, input handling, and tween system save engineering time for a multi-screen game |

---

## 14. Concerns & Open Questions

### Blockers — ✅ ALL RESOLVED

| # | Question | Resolution | Date |
|---|---|---|---|
| C-1 | **Game slug selection** | `gem-clash` — pending Compliance Officer trademark check | Feb 2026 |
| C-2 | **Tech stack confirmation** | Phaser 3 (Custom Build) confirmed | Feb 2026 |
| C-3 | **Backend for Phase 1?** | Two-track: client-only default + Week 1 spike to test external API access | Feb 2026 |
| C-4 | **Product SKU naming convention** | `gc_{descriptive_name}` — documented convention | Feb 2026 |

### High-Priority Unknowns

| # | Question | Why It Matters |
|---|---|---|
| C-5 | **Jest review turnaround time** — how long from submission to approval? | Determines launch date; no SLA found in docs |
| C-6 | **Image approval turnaround** — for notification images? | Could delay Phase 2 notification launch |
| C-7 | **Jest Games Fund requirements** — what metrics needed? Application form? | Affects Phase 2 timeline and revenue plan |
| C-8 | **Notification delivery rate** — with 29+ games competing for 1 daily slot, what % of our notifications actually reach the messaging inbox? | Critical for retention strategy |
| C-9 | **SDK version stability** — CDN-loaded, not pinnable. Can an SDK update break our game? | Risk of unannounced breaking changes |
| C-10 | **Challenge Wager** — does wagering tokens violate SHAFT gambling prohibition? | Feature must be killed or redesigned if yes |

### Medium-Priority Unknowns

| # | Question | When Needed |
|---|---|---|
| C-11 | Jest organic DAU per new game — what Explore traffic to expect? | Pre-launch projections |
| C-12 | Jest user demographics — age, gender, behavior patterns? | Target audience validation |
| C-13 | Performance of existing match-3 games on Jest (Puppy Mansion, Best Friends) | Competitive positioning |
| C-14 | IAA (in-app advertising) timeline — when is ad support coming? | Future monetization planning |
| C-15 | Multi-country pricing — are Jest Token prices country-specific when 14 countries launch? | Q3 2026 expansion prep |

### Assumptions Requiring Post-Launch Validation

| # | Assumption | How to Validate |
|---|---|---|
| C-16 | 500 DAU in Month 1 without paid UA | Monitor Jest Analytics; adjust GTM if <200 DAU by Week 3 |
| C-17 | 3% purchase conversion rate from Day 1 | Track purchase funnel; if <1.5%, revisit pricing/placement |
| C-18 | Match-3 players on Jest will engage with PvP challenges | Track challenge share rate in Phase 2; pivot if <5% |
| C-19 | SMS notifications deliver 3-4x retention vs mobile push | Compare D7 with/without notifications; A/B test |
| C-20 | <10MB build size achievable with Phaser 3 + 30 levels | Monitor build pipeline; alarm at >8MB |

---

## 15. Team Assignments (RACI)

**R** = Responsible (does the work) | **A** = Accountable (owns the outcome) | **C** = Consulted | **I** = Informed

| Deliverable | R | A | C | I |
|---|---|---|---|---|
| Match-3 engine + game logic | Game Engineer | Principal Engineer | Frontend Lead | PPM |
| Phaser setup + SDK wrapper | Frontend Lead | Principal Engineer | Game Engineer | QA |
| UI screens (menu, shop, map) | Frontend Engineer | Frontend Lead | Lead Designer | PPM |
| Visual design system + gem art | Lead Designer | PPM | Frontend Lead | All |
| Level design (30 levels) | Level Designer | Game Producer | Data Scientist, Lead Designer | PPM |
| Payment verification (if backend) | Backend Lead | Principal Engineer | Revenue Ops | QA |
| Notification content (10+ templates) | Content Manager | Game Producer | Compliance Officer | Lead Designer |
| Notification images | Lead Designer | Content Manager | Compliance Officer | Release Manager |
| CI/CD pipeline (build → Jest) | DevOps Engineer | Principal Engineer | Release Manager | Backend Lead |
| Test plan + execution | QA Engineer | Project Manager | All Engineers | PPM |
| Manual QA (mobile testing) | Manual QA Tester | QA Engineer | Frontend Lead | Project Manager |
| SHAFT compliance review | Compliance Officer | PPM | Content Manager | Release Manager |
| Analytics event taxonomy | Data Scientist | PPM | Revenue Ops | Game Producer |
| Product pricing + tracking | Revenue Ops Analyst | PPM | Data Scientist | Backend Lead |
| Release submission + tracking | Release Manager | Project Manager | QA, DevOps | All |
| Incident response | Incident Manager | Project Manager | DevOps, Backend Lead | All |
| Sprint management | Project Manager | PPM | All Leads | All |
| PvP challenge system | Game Engineer + Frontend Lead | Principal Engineer | Lead Designer | PPM |
| Season Pass system | Game Engineer | Game Producer | Lead Designer, Revenue Ops | PPM |
| Game strategy + market intel | Senior Game Strategist | PPM | All | All |

---

## 16. Dependencies & Sequencing

### Phase 1 Critical Path

```
Week 1:
  [RESOLVED] E-1: Phaser 3 Custom Build ─┐
  [RESOLVED] E-2: Slug = gem-clash       ─┤
  [RESOLVED] E-3: SKUs = gc_* convention ─┼──→ Developer Console setup
  [RESOLVED] E-4: Two-track approach     ─┘

  Lead Designer: Begin D-1 through D-5 (design system, gems, menu)
  Level Designer: Begin D-14 (level design, difficulty curve)
  Frontend Lead: Phaser project scaffold + SDK wrapper (E-10)
  DevOps: CI/CD pipeline setup + Track B spike (test external API from Jest)
  Backend Lead: If Track B succeeds → Cloudflare Worker JWT verification (2-3 days)
  Compliance Officer: Trademark check on "Gem Clash" before slug registration

Week 2:
  Game Engineer: Match-3 engine core (grid, matching, cascades)
  Frontend Engineer: UI screens (menu, level select, settings)
  Lead Designer: D-6 through D-10 (level map, HUD, shop, registration)
  Content Manager: Begin notification copy drafts
  Lead Designer: Upload notification images for approval ← START EARLY

Week 3:
  Game Engineer: Special gems + scoring + star system
  Level Designer: Complete 30 levels with star thresholds
  Backend Lead: Payment verification endpoint (if E-4 = backend)
  QA Engineer: Test plan creation
  Revenue Ops: Product creation in Developer Console

Week 4:
  Integration: SDK wrapper + gameplay + shop + payments
  QA: Full test pass (match logic, payments, SDK, guest mode)
  Compliance Officer: SHAFT review of all content
  Release Manager: Submit build for Jest review
  Manual QA: Mobile testing on iOS Simulator
```

### Cross-Phase Dependencies

| Dependency | From | To | Why |
|---|---|---|---|
| Seed-based board generation | Phase 1 (E-6) | Phase 2 PvP | Same seed = same board for challenger and defender |
| Notification image approval | Phase 1 (start pipeline) | Phase 2 notification launch | Approval turnaround unknown; start early |
| Backend infrastructure | Phase 2 (if E-4 = deferred) | Phase 2 PvP state, Phase 3 leaderboards | Social features may require cross-player queries |
| Level editor tooling | Phase 3 (D-24) | Ongoing content pipeline | Without tooling, 10 levels/week is unsustainable |
| D7 retention data | Phase 1 launch + 2 weeks | Jest Games Fund application | Fund requires retention metrics |

### External Dependencies

| Dependency | Owner | Impact |
|---|---|---|
| Jest build review approval | Jest review team | Blocks launch; no SLA known |
| Notification image approval | Jest review team | Blocks Phase 2 notifications |
| Jest Games Fund decision | Jest business team | $200K funding; timeline unknown |
| Jest geographic expansion | Jest platform | 14 countries Q3 2026; affects compliance prep |
| Jest SDK updates | Jest engineering | CDN-loaded; could break our game without notice |

---

## 17. Appendices

### Appendix A: SDK API Reference

See `jest.md` Preamble → SDK Surface Area table (lines 32-43) and individual SDK docs in `docs/jest-platform/sdk/`.

### Appendix B: Competitive Analysis

See `game-strategy-assessment.md` → Competitive Analysis section (29 games by publisher and genre).

### Appendix C: Revenue Comparison (Jest vs App Store)

See `gem-clash-mockup.html` → Revenue section (advantage table with 6 comparison metrics).

### Appendix D: Design Mockup

See `gem-clash-mockup.html` — 3 phone screens (gameplay, challenges, shop), SMS notification flow, development timeline.

### Appendix E: Notification Copy Templates

**Status:** To be authored by Content Manager in Week 2.
Must include 10+ variants rotating across D0-D7 to avoid Groundhog Day trap. All <100 chars, basic characters only, no game name, no SHAFT content.

### Appendix F: playerData Schema Specification

**Status:** To be authored by Principal Engineer in Week 1.
Must budget within 1MB limit. See proposed schema in Section 5.1.2. Needs formal review for: key naming conventions, data type choices, migration strategy for schema changes.

### Appendix G: Purchase Verification Server

**Status:** ✅ Pre-built, ready to deploy if Track B spike confirms external API access.

Code at `backend/worker/` — Cloudflare Worker with single `POST /verify-purchase` endpoint:
- `backend/worker/src/types.ts` — Type definitions, allowed SKUs, constants
- `backend/worker/src/verify.ts` — JWT verification logic (7 sequential checks: signature, payload shape, audience, subject, SKU, completion state, freshness)
- `backend/worker/src/index.ts` — Worker entry point with CORS, rate limiting (100 req/IP/min via KV), audit logging
- `backend/worker/wrangler.toml` — Cloudflare Worker configuration
- `backend/client-wrapper.ts` — Client-side integration (drop-in purchase verification for the game)
- `backend/README.md` — Deployment guide

Deployment: `cd backend/worker && npm install && wrangler secret put JEST_SHARED_SECRET && wrangler secret put JEST_GAME_ID && wrangler deploy`

### Appendix H: Platform Documentation

Full Jest platform docs available locally at `docs/jest-platform/` (25 files). Key references:
- `sdk/payments.md` — Purchase lifecycle, JWT verification
- `guides/notifications.md` — Scheduling, content, attribution
- `guides/user-acquisition.md` — Explore optimization, onboarding, attribution
- `requirements/technical.md` — Build constraints
- `requirements/gameplay.md` — Guest mode, IAP-only
- `availability.md` — Geographic expansion timeline

---

*Document authored by the Principal Product Manager. This PRD is a living document — update as decisions are made and assumptions are validated.*
