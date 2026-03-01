# Senior Game Strategist Assessment
## TLDR: What to Build First, Why, and How to Make Money

**Date:** February 2026
**Status:** Pre-development strategic recommendation
**Platform:** Jest (jest.com) — messaging-native HTML5 game marketplace

---

## THE RECOMMENDATION: Build a Social Match-3 Puzzle with PvP

**Game Concept:** "Gem Clash" (working title) — A competitive match-3 puzzle game where players challenge friends head-to-head via messaging. Combine the proven match-3 loop (Candy Crush / Royal Match) with asynchronous PvP scoring (Match Masters model), purpose-built for Jest's messaging-native DNA.

---

## WHY THIS GAME FIRST

### 1. Match-3 is the single most proven casual genre
- Royal Match: $2B+ lifetime revenue
- Candy Crush: $20B+ lifetime
- Toon Blast, Homescapes, Best Friends Puzzle (already on Jest)
- The core mechanic is simple to implement, infinitely expandable, and universally understood

### 2. Jest's marketplace has a gap
The current Jest catalog (29 games) has puzzle games but **no competitive/social match-3**:
- Puppy Mansion (HayHay) — solo match-3 + renovation meta
- Best Friends Puzzle (InLogic) — solo match-3 + story
- **Nobody is doing PvP match-3 on Jest** — this is the opportunity

### 3. Social fits Jest's messaging DNA perfectly
- Challenge a friend via SMS: "I scored 12,450 on Level 23 — beat that!"
- Friend receives text with deep link to play the same level and try to beat the score
- This creates a natural **viral loop** that works with (not against) Jest's SMS/RCS re-engagement
- Match Masters proved this model generates $100M+/year on mobile

### 4. Fastest path to revenue
- Match-3 has the highest IAP conversion rates in casual gaming (3-7%)
- Functional IAP (extra moves, boosters, lives) monetizes naturally within gameplay
- Revenue from Week 1 with starter packs and single-booster purchases
- No need for complex backend infrastructure — stateless levels with score comparison

### 5. HTML5 is perfect for match-3
- Lightweight: Grid-based rendering, sprite animations, particle effects
- Small build size achievable (5-15MB)
- No physics engine needed, no 3D rendering
- Phaser or PixiJS handles everything we need
- Fast load times = players in the game instantly

---

## HOW WE MAKE MONEY

### Revenue Model: "Social Value" Micro-Pricing

Jest's 1 Token = $1 transparency + 90/10 developer split means we price lower than mobile and still earn more per transaction.

| Product | Price (Tokens) | Revenue to Us | Mobile Equivalent |
|---------|---------------|--------------|-------------------|
| Single Booster (3 extra moves) | 1 Token ($1) | $0.90 | $0.99 IAP nets $0.69 |
| Starter Pack (5 boosters + 50 coins) | 2 Tokens ($2) | $1.80 | $1.99 nets $1.39 |
| Challenge Pack (challenge 5 friends + rewards) | 3 Tokens ($3) | $2.70 | $2.99 nets $2.09 |
| Season Pass (4-week premium track) | 5 Tokens ($5) | $4.50 | $4.99 nets $3.49 |
| Gift a Friend (send a booster to someone) | 1 Token ($1) | $0.90 | No mobile equivalent |

### Revenue Projection (Conservative)

| Metric | Month 1 | Month 3 | Month 6 |
|--------|---------|---------|---------|
| DAU | 500 | 5,000 | 20,000 |
| Payer conversion | 3% | 4% | 5% |
| ARPPU/month | $5 | $8 | $10 |
| Monthly Revenue | $75 | $1,600 | $10,000 |
| Dev Revenue (90%) | $67.50 | $1,440 | $9,000 |

*Note: These are conservative. Top Jest games with Jest Fund backing see much faster growth. Apply for the $200K mid-stage Jest Games Fund once we have D7 retention data.*

### Key Monetization Features

1. **Extra Moves (1 Token)** — When the player runs out of moves but is close to completing a level. Highest conversion moment in match-3.
2. **Boosters (1-2 Tokens)** — Bomb, row clear, color bomb. Purchased pre-level or during gameplay.
3. **Lives Refill (1 Token)** — 5 lives, 1 regenerates per 25 minutes. Refill all for $1.
4. **Challenge Wager (1 Token)** — Bet a token that you'll beat your friend's score. Winner takes the pot. (Check Jest TOS for this.)
5. **Season Pass (5 Tokens)** — 4-week seasons with exclusive cosmetics, bonus daily challenges, and extra rewards. Free track + premium track.
6. **Gift Boosters (1 Token)** — Send a friend a booster via messaging. They get the item + the game link. Viral acquisition built into monetization.

---

## WHAT WE NEED TO BUILD

### Phase 1: MVP (Weeks 1-4)

**Core Game:**
- Match-3 grid (8x8) with standard gem types (5-6 colors)
- Basic matching logic (3+ in a row/column)
- Special gems: 4-match = line clear, 5-match = bomb, L/T-match = color bomb
- 30 hand-crafted levels with progressive difficulty
- Move-limited gameplay (15-25 moves per level)
- Level map with star ratings (1-3 stars)
- Score tracking per level

**Jest Integration:**
- `JestSDK.getPlayer()` — identify player, guest vs registered
- `JestSDK.data` — save player progress (level, stars, coins)
- `JestSDK.login()` — prompt registration after level 3
- Guest mode supports full gameplay (first 10 levels)

**Basic Monetization:**
- 3 products in Developer Console: Extra Moves (1T), Booster Pack (2T), Lives Refill (1T)
- `getProducts()` → `beginPurchase()` → `completePurchase()` flow
- `getIncompletePurchases()` recovery on startup

**Tech Stack:**
- Phaser 3 (or PixiJS) for game rendering
- TypeScript
- Vite for bundling
- All assets bundled (no CDN)
- Target build: <10MB

### Phase 2: Social & Retention (Weeks 5-8)

**PvP Challenge System:**
- Asynchronous score challenges via `referrals.shareReferralLink()`
- "Beat my score" share card with level screenshot
- Challenge tracking via `entryPayload`
- Results comparison when both players complete the level

**Notifications:**
- D0-D7 daily notification schedule via `notifications.scheduleNotification()`
- Progress-based: "Level 12 is waiting! Your puppy needs rescuing!"
- Social: "[Friend] just beat your score on Level 8!"
- Image pre-approval pipeline for notification images
- Groundhog Day avoidance: rotate through 10+ notification templates

**Retention Features:**
- Daily challenge (1 unique level per day, shared across all players)
- 7-day login streak with escalating rewards
- Star collection goal (collect X stars to unlock bonus content)

### Phase 3: Polish & Scale (Weeks 9-12)

**Content Pipeline:**
- Level editor tooling for rapid level creation
- Target: 10 new levels per week
- Seasonal themes (visual reskins: Spring, Summer, etc.)

**Season Pass:**
- 4-week seasons with free/premium tracks
- Premium: 5 Tokens ($5)
- Exclusive cosmetics (board themes, gem skins)

**Social Gifting:**
- Send a friend a booster via messaging (1 Token)
- Referral rewards: invite 3 friends who register → earn 5 free boosters

**Analytics:**
- `entryPayload` tags on all notifications and shares
- Funnel tracking: session → level complete → purchase → share
- A/B test notification copy

---

## TEAM ASSIGNMENTS

| Role | Phase 1 Responsibility |
|------|----------------------|
| **Game Engineer** | Match-3 engine, grid logic, special gems, animations |
| **Frontend Lead** | Phaser/PixiJS setup, build pipeline, Jest SDK integration |
| **Frontend Engineer** | UI screens (menu, level select, settings, shop) |
| **Lead Designer** | Visual design system, gem art, board themes, UI/UX |
| **Level Designer** | 30 initial levels, difficulty curve, star thresholds |
| **Backend Lead** | Payment verification endpoint, playerData schema design |
| **Game Producer** | Sprint management, level content calendar, milestone tracking |
| **QA Engineer** | Test plan for match-3 logic, payment flows, SDK integration |
| **Content Manager** | Notification copy (10+ templates), image assets for approval |
| **Data Scientist** | Analytics framework, funnel event definitions |
| **Revenue Ops Analyst** | Product pricing, conversion tracking setup |
| **DevOps Engineer** | CI/CD pipeline: build → upload to Jest → activate |
| **Release Manager** | Submission to Jest review, approval tracking |
| **Compliance Officer** | SHAFT review of all content, policy compliance checklist |

---

## COMPETITIVE ANALYSIS: JEST MARKETPLACE

### Current Jest Games (29 total)

**By Publisher:**
- DoonDook: 16 games (Sudoku, Tetra Blocks, Match Shapes, Solitaire Pyramid, 2048 Remastered, Word Guess, Blend Fruits, Bottle Flip, BlockUp Puzzle, Solitaire Klondike, Word Clues, Word Haven, Sea Battle, Memory Match, Dos Dots, Disk Rush, Onet Puzzle, Shikaku, Mahjong Classic)
- InLogic: 4 games (Zumba Story, Best Friends Puzzle, 2048 Cube Merge, Poly Art, Quiz Mania)
- Innerworks: 3 games (Dragon Candy, Daily IQ, Infinite Crosswords)
- HayHay: 1 game (Puppy Mansion)
- Episode Interactive: 1 game (Episode)

**By Genre:**
- Puzzle/Logic: 10 (Sudoku, BlockUp, Shikaku, Onet, Mahjong, Poly Art, etc.)
- Word: 4 (Word Guess, Word Clues, Word Haven, Infinite Crosswords)
- Match/Merge: 3 (Puppy Mansion, Best Friends Puzzle, Match Shapes)
- Card/Solitaire: 2 (Solitaire Pyramid, Solitaire Klondike)
- Number/2048: 2 (2048 Remastered, 2048 Cube Merge)
- Action/Arcade: 3 (Zumba Story, Bottle Flip, Disk Rush)
- Trivia/Quiz: 2 (Daily IQ, Quiz Mania)
- Story: 1 (Episode)
- Memory: 1 (Memory Match)
- Strategy: 1 (Sea Battle)

### Key Observation
**DoonDook dominates with 16 games** — but they're all simple, single-mechanic games with no social features, no IAP, and no progression meta. They appear to be volume plays, not deeply monetized. **There is no game on Jest that combines proven match-3 mechanics with social/competitive features and IAP.** This is the gap.

---

## RISK FACTORS

| Risk | Mitigation |
|------|-----------|
| HTML5 performance on low-end devices | Keep animations lightweight; test on budget Android via emulator |
| Low initial traffic (new platform) | Apply for Jest Games Fund; leverage SMS viral loops for organic growth |
| Match-3 is competitive genre | Differentiate with social/PvP — nobody on Jest has this |
| Player churn without rewarded ads as safety valve | Replace with skill-based earning (daily challenges) and generous free tier |
| Content pipeline bottleneck (need 10+ levels/week) | Build level editor tooling in Phase 3; procedural generation as stretch goal |

---

## BOTTOM LINE

**Build a social match-3.** It's the most proven casual genre, it fits Jest's messaging DNA perfectly, it monetizes from day one with transparent micro-pricing, and nobody on the platform is doing it with social features. Ship the MVP in 4 weeks, get D7 retention data, apply for the Jest Games Fund with $200K, and scale from there.

The 90/10 revenue split means every $1 we earn keeps $0.90 — that's 29% more revenue per transaction than App Store games. Price lower, earn more, and build trust with transparent pricing. This is our edge.
