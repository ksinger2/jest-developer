# Next Game Strategy: Portfolio Expansion for Jest Platform

> Produced by: Senior Game Strategist
> Date: 2026-03-02
> Status: RECOMMENDATION — awaiting team decision

---

## Executive Summary

After analyzing the Jest marketplace (30 games), our Gem Link codebase, the Jest platform's retention advantages, and the broader F2P mobile market, my top recommendation for Game 2 is a **tower defense game** — a genre with zero representation on Jest, strong monetization patterns, high reuse of our Phaser/TS infrastructure, and natural alignment with Jest's short-session, notification-driven re-engagement model.

---

## 1. Jest Marketplace Analysis

### Current Genre Distribution (30 games)

| Genre | Count | Games |
|-------|-------|-------|
| Puzzle (match/merge/block) | 9 | Puppy Mansion, Best Friends Puzzle, Match Shapes, Blend Fruits, Onet Puzzle, BlockUp Puzzle, Tetra Blocks, Dragon Candy, Dos Dots |
| Word | 4 | Infinite Crosswords, Word Clues, Word Haven, Word Guess |
| Logic/Number | 3 | Sudoku, Shikaku, 2048 Remastered |
| Card/Solitaire | 2 | Solitaire Klondike, Solitaire Pyramid |
| Trivia/Quiz | 2 | Quiz Mania, Daily IQ |
| Action/Skill | 3 | Disk Rush, Bottle Flip, Zumba Story |
| Tile | 1 | Mahjong Classic |
| Memory | 1 | Memory Match |
| Strategy | 1 | Sea Battle |
| Story | 1 | Episode |
| Art/Creative | 1 | Poly Art |
| Merge/2048 | 2 | 2048 Cube Merge, 2048 Remastered |

### Gaps Identified

The following popular F2P mobile genres have **zero representation** on Jest:

1. **Tower Defense** — 0 games (Bloons TD 6, Kingdom Rush, Arknights all top earners on mobile)
2. **Idle/Incremental** — 0 games (Cookie Clicker, Idle Miner are top casual earners)
3. **Runner/Endless** — 0 games (Subway Surfers, Temple Run)
4. **Simulation/Tycoon** — 0 games
5. **RPG/Gacha** — 0 games (though likely too complex for Jest's constraints)

### Key Insight

The marketplace is **saturated with passive puzzle games** (puzzle + word + logic = 16 of 30 games). The opportunity is in genres that add more active gameplay while staying within Jest's 10MB build limit and short-session format.

---

## 2. TOP RECOMMENDATION: Tower Defense ("Gem Fortress")

### Concept

**Gem Fortress** is a casual tower defense game set in the same fantasy gem universe as Gem Link. Players place gem-powered towers along a winding path to defend their crystal vault from waves of enemies (shadow creatures, gem thieves, corrupted spirits). Each tower type corresponds to a gem color from Gem Link — ruby towers deal splash damage, sapphire towers slow enemies, emerald towers poison, etc.

The game is designed for Jest's short-session format: each wave takes 60-90 seconds, a full level is 3-5 waves (3-5 minutes total), and players earn stars based on remaining health, enemies destroyed, and towers used. Between sessions, players upgrade towers, unlock new tower types, and progress through a 30-level campaign across themed worlds.

### Why Tower Defense for Jest

**1. Zero competition.** Not a single TD game on the platform. First-mover advantage in a genre that has proven billion-dollar viability on mobile (Bloons TD 6: $35M+ revenue, Kingdom Rush series: $20M+, Arknights: $1B+).

**2. Perfect session length.** TD maps naturally run 3-5 minutes — exactly Jest's sweet spot. Unlike idle games (which need background processing Jest cannot provide) or runners (which demand continuous attention), TD has natural pause points between waves.

**3. Notification-native design.** TD progression creates perfect notification hooks:
- "Wave 15 is waiting — your towers are ready!"
- "New tower unlocked: Amethyst Hex Cannon"
- "Your crystal vault needs defending — enemies approaching!"
- "Daily challenge available: survive 10 waves with only 3 towers"

**4. Deep monetization.** TD has the strongest IAP potential of any genre that fits Jest's constraints:
- Consumable boosters (freeze all enemies, double tower damage for one wave, extra life)
- Tower unlock packs (premium tower types)
- Tower skins (cosmetic, using gem variants from our asset library)
- Level skip / extra lives
- Daily challenge entry (premium currency)

**5. Maximum codebase reuse.** Our existing Phaser 3 + TypeScript architecture transfers directly:
- Scene management system (Boot, Preload, MainMenu, LevelSelect, Gameplay, LevelComplete, Shop) — identical structure
- Jest SDK wrapper, PaymentManager, PlayerDataManager — copy verbatim
- UIComponents (GlButton, GlHUD, GlModal, GlRibbon) — reuse as-is
- EventBus, Logger, Constants pattern — reuse
- SpriteNumber utility — reuse for score/wave counters
- Level data JSON format — adapt for wave definitions
- Asset loading pipeline and review system — reuse entirely

**6. Art asset synergy.** The gem theme carries over:
- 6 gem sprites become tower type icons (ruby tower, sapphire tower, etc.)
- Gem color palette carries to tower/projectile effects
- Fantasy backgrounds (crystal canyon, highland valley, rainbow falls) work as TD map themes
- UI assets (frames, buttons, progress bars, headers, coins) reuse directly
- Only new assets needed: tower sprites, enemy sprites, map paths, projectile effects

### Core Mechanics

| Mechanic | Description |
|----------|-------------|
| Tower placement | Tap grid cells along a path to place towers. 6 tower types (gem-colored), each with unique attack pattern |
| Wave progression | 3-5 waves per level. Enemies follow a fixed path. Difficulty scales via enemy count, speed, and health |
| Tower upgrades | 3 upgrade tiers per tower (in-level: spend earned gold). Between levels: permanent upgrades via coins |
| Special abilities | Charged abilities (tap to activate): freeze wave, meteor strike, heal vault. Cooldown-based, purchasable refills |
| Star rating | 3 stars based on: vault health remaining, enemies killed, towers placed efficiency |
| Boss waves | Every 5th level features a boss enemy with unique mechanics |

### Tower Types (mapped to Gem Link gems)

| Tower | Gem | Attack | Range | Special |
|-------|-----|--------|-------|---------|
| Ruby Blaster | Red/Heart | High single-target DPS | Medium | Crit chance on low-HP enemies |
| Sapphire Prism | Blue/Diamond | Slow beam | Long | Slows all enemies in range |
| Emerald Spike | Green/Square | Poison AoE | Short | DoT that stacks |
| Topaz Bolt | Yellow/Triangle | Chain lightning | Medium | Jumps to 3 nearby enemies |
| Amethyst Hex | Purple/Circle | Splash damage | Medium | Stuns on 3rd hit |
| Diamond Sentry | White/Star | Balanced, fast fire | Long | Reveals invisible enemies |

### Monetization Strategy

**Price Tier 1: Impulse (1-2 Tokens)**
- Extra Life (continue from current wave after vault destroyed): 1 Token
- Freeze Wave (stops all enemies for 10 seconds): 1 Token
- Double Damage (all towers 2x for one wave): 1 Token
- Tower Slot Unlock (place one extra tower on the map): 2 Tokens

**Price Tier 2: Core (3-5 Tokens)**
- Starter Pack (5 extra lives + 3 freeze waves + 500 gold): 3 Tokens
- Tower Upgrade Pack (instant max upgrade on any tower for one level): 3 Tokens
- Gold Pack (2500 gold for permanent upgrades): 5 Tokens

**Price Tier 3: Premium (10-20 Tokens)**
- Elite Pack (10,000 gold + 5 of each booster + 2 premium tower skins): 10 Tokens
- Commander Pack (25,000 gold + 15 of each booster + all premium skins + exclusive tower): 20 Tokens

**Free Gift System (reuse Gem Link pattern):**
- 4-hour cooldown, random booster or 100 gold
- Drives registration (guests cannot receive free gifts)

**Revenue Projections (conservative):**
- Target ARPU: $0.80/month (lower than Gem Link due to new genre learning)
- Target purchase conversion: 3% of registered users
- At 90/10 split, $0.72/user retained
- Break-even at ~500 monthly active registered users

### Asset Requirements (START NOW)

**Priority 1 — Towers (6 sprites, each at 3 upgrade tiers = 18 total)**

| Asset | Description | Size | Priority |
|-------|-------------|------|----------|
| tower_ruby_t1 | Red crystal tower, tier 1 (simple) | 64x64 | IMMEDIATE |
| tower_ruby_t2 | Red crystal tower, tier 2 (enhanced) | 64x64 | IMMEDIATE |
| tower_ruby_t3 | Red crystal tower, tier 3 (ornate) | 64x64 | IMMEDIATE |
| tower_sapphire_t1-t3 | Blue crystal tower, 3 tiers | 64x64 | IMMEDIATE |
| tower_emerald_t1-t3 | Green crystal tower, 3 tiers | 64x64 | IMMEDIATE |
| tower_topaz_t1-t3 | Yellow crystal tower, 3 tiers | 64x64 | IMMEDIATE |
| tower_amethyst_t1-t3 | Purple crystal tower, 3 tiers | 64x64 | IMMEDIATE |
| tower_diamond_t1-t3 | White/clear crystal tower, 3 tiers | 64x64 | IMMEDIATE |

**Priority 2 — Enemies (8-10 sprites)**

| Asset | Description | Size | Priority |
|-------|-------------|------|----------|
| enemy_shadow_basic | Dark wisp/shadow creature (basic) | 32x32 | IMMEDIATE |
| enemy_shadow_fast | Smaller, faster shadow | 32x32 | IMMEDIATE |
| enemy_shadow_tank | Large armored shadow | 48x48 | IMMEDIATE |
| enemy_shadow_swarm | Tiny, appears in groups | 24x24 | HIGH |
| enemy_shadow_healer | Glowing shadow that heals others | 32x32 | HIGH |
| enemy_shadow_boss_1 | Large boss shadow (world 1) | 64x64 | HIGH |
| enemy_shadow_boss_2 | Boss shadow (world 2) | 64x64 | MEDIUM |
| enemy_shadow_boss_3 | Boss shadow (world 3) | 64x64 | MEDIUM |
| enemy_shadow_invisible | Semi-transparent enemy | 32x32 | MEDIUM |
| enemy_shadow_flying | Winged shadow (skips some path) | 32x32 | MEDIUM |

**Priority 3 — Map Elements**

| Asset | Description | Size | Priority |
|-------|-------------|------|----------|
| tile_path | Stone/dirt path tile | 48x48 | IMMEDIATE |
| tile_grass | Grass/terrain background tile | 48x48 | IMMEDIATE |
| tile_placement | Tower placement spot (glowing) | 48x48 | IMMEDIATE |
| vault_crystal | Crystal vault (player's base) | 64x64 | IMMEDIATE |
| vault_crystal_damaged | Vault at low health | 64x64 | HIGH |
| spawn_portal | Enemy spawn point | 48x48 | HIGH |

**Priority 4 — UI (partially reusable from Gem Link)**

| Asset | Description | Reusable? | Priority |
|-------|-------------|-----------|----------|
| header_fortress | "Gem Fortress" header sprite | NEW | HIGH |
| icon_wave | Wave counter icon | NEW | HIGH |
| icon_gold | In-level gold currency | REUSE ui_coin | DONE |
| icon_health | Vault health icon | REUSE ui_heart | DONE |
| btn_play_green | Play button | REUSE | DONE |
| icon_arrow_left/right | Navigation | REUSE | DONE |
| icon_settings | Settings gear | REUSE | DONE |
| progress_bar_empty/full | Wave progress | REUSE | DONE |
| frame_board | Map frame | REUSE | DONE |
| digits 0-9 | Score/wave display | REUSE | DONE |
| All shop UI | Buttons, modals, cards | REUSE | DONE |

**Priority 5 — Backgrounds (3 new, can reuse 1 from Gem Link)**

| Asset | Description | Size | Priority |
|-------|-------------|------|----------|
| bg_fortress_menu | Fortress-themed main menu | 390x600 | HIGH |
| bg_world_1 | Crystal caves map background | 390x600 | HIGH |
| bg_world_2 | Shadow forest map background | 390x600 | MEDIUM |
| bg_world_3 | Volcanic gem mines background | 390x600 | MEDIUM |
| bg_level_select | Can reuse crystal-canyon-sunset | REUSE | DONE |

**Total new assets needed: ~35-40 sprites**
**Estimated combined size: ~800KB (well within 10MB limit with engine overhead)**

### Development Timeline

| Phase | Duration | Deliverables |
|-------|----------|-------------|
| **Phase 1: Core Engine** | Week 1-2 | Grid-based map system, tower placement, basic enemy pathfinding, wave spawner, single tower type (Ruby), 5 test levels |
| **Phase 2: Tower Variety** | Week 3 | All 6 tower types, upgrade system (3 tiers), tower selection UI, targeting logic |
| **Phase 3: Content + Polish** | Week 4 | 30 levels across 3 worlds, boss mechanics, star rating, level select, difficulty balancing |
| **Phase 4: Monetization + SDK** | Week 5 | Shop scene (copy from Gem Link, adapt SKUs), boosters, free gift, Jest payment integration, notifications |
| **Phase 5: QA + Submission** | Week 6 | Playwright e2e tests (reuse framework), balance pass, build optimization, Jest submission |

**Total: 6 weeks** (aggressive but achievable given codebase reuse)

### What We Reuse vs. Build New

**Reuse directly (copy from Gem Link):**
- `/src/sdk/` — entire directory (JestSDKWrapper, PaymentManager, PlayerDataManager, types)
- `/src/utils/` — EventBus, Logger, RegistryHelper, Constants (adapt values)
- `/src/ui/` — UIComponents (GlButton, GlHUD, GlModal, GlRibbon), SpriteNumber, CelebrationSystem, Transitions
- `vite.config.ts` — identical build pipeline
- `playwright.config.ts` + e2e test structure
- Scene skeleton: Boot, Preload, MainMenu, LevelSelect, LevelComplete, Shop
- `scripts/process-assets.cjs` — asset pipeline

**Build new:**
- `/src/game/systems/MapManager.ts` — grid-based map with path + placement zones (replaces BoardManager)
- `/src/game/systems/TowerManager.ts` — tower creation, upgrades, targeting, firing
- `/src/game/systems/EnemyManager.ts` — enemy spawning, pathfinding, health, death
- `/src/game/systems/WaveManager.ts` — wave definitions, spawning schedule, boss triggers
- `/src/game/systems/ProjectileManager.ts` — projectile movement, collision, effects
- `/src/game/objects/Tower.ts` — tower game object (replaces Gem.ts)
- `/src/game/objects/Enemy.ts` — enemy game object
- `/src/game/scenes/GameplayScene.ts` — TD-specific gameplay (biggest rewrite)
- `/src/types/game.types.ts` — new type definitions for TD mechanics
- `public/assets/levels/levels.json` — wave/map definitions

### Retention Strategy

| Metric | Target | Mechanism |
|--------|--------|-----------|
| D1 | 45% | Wave cliffhanger: "Wave 4 of 5 — can you finish?" + notification |
| D7 | 25% | Daily challenge system (unique modifier each day) + tower unlock progression |
| D30 | 12% | World progression (3 worlds, 30 levels), permanent upgrade grind, weekly boss events |
| Registration | 55% of D1 | Gate permanent upgrades + free gift + notification scheduling behind registration |

### Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Build size exceeds 10MB | LOW | HIGH | TD sprites are small (32-64px). Estimated total: ~2-3MB with engine. Gem Link is 5MB with larger backgrounds. |
| TD gameplay too complex for casual Jest audience | MEDIUM | MEDIUM | Simplify: auto-targeting towers, clear enemy paths, generous wave timing. Reference: Bloons TD Battles (very casual-friendly) |
| Development takes longer than 6 weeks | MEDIUM | LOW | Phase 1-2 are the critical path. Ship with 15 levels if needed, expand post-launch. |
| Cannibalization of Gem Link players | LOW | LOW | Different genre appeals to different player segments. Shared theme creates cross-promotion opportunity. |
| Enemy pathfinding performance on mobile | LOW | MEDIUM | Pre-computed paths (not runtime A*). Enemies follow fixed waypoints. No performance concern. |

---

## 3. RUNNER-UP #1: Idle Gem Mine

### Concept

An idle/incremental game where players manage a gem mine. Tap to mine gems, hire workers, upgrade equipment, and unlock deeper mine levels with rarer gems. Earnings continue while away (simulated on return). Uses the gem theme and art assets from Gem Link.

### Why It's Strong

- **Zero idle games on Jest** — completely uncontested genre
- **Notification-perfect** — "Your miners found a rare sapphire!" "Your mine earned 50,000 gold while you were away!"
- **Maximum art reuse** — gem sprites are literally the core game objects
- **Simple to build** — no complex physics or pathfinding. Primarily UI + number scaling
- **Strong monetization** — speed-up boosters, premium workers, auto-tap, offline earning multipliers

### Why It's #2, Not #1

- **Offline progression is tricky on Jest.** There is no background processing. We would simulate offline earnings on return (calculate time delta), but this feels less "real" than native idle games.
- **Lower engagement ceiling.** Idle games have high D1 retention but lower session depth. Players check in for 30 seconds, tap, leave. This limits IAP opportunity per session.
- **Jest's 1MB playerData limit.** Idle games accumulate complex state (worker counts, upgrade levels, mine depth, prestige layers). Need careful state management.

### Asset Requirements (if chosen)

- Mine background sprites (cave layers, 3-5 depth levels): ~10 sprites
- Worker sprites (pickaxe miner, cart pusher, elevator operator): ~8 sprites
- Equipment sprites (drill, dynamite, minecart, elevator): ~6 sprites
- UI: mine depth indicator, earnings counter, worker roster — partially reusable
- **Total new: ~25 sprites**

### Estimated Timeline: 4-5 weeks

---

## 4. RUNNER-UP #2: Gem Solitaire (Tripeaks/Golf)

### Concept

A card solitaire game with a gem/crystal theme. Players clear cards from a pyramid/tripeaks layout by selecting cards one higher or lower than the active card. Streaks build multipliers. Gem-themed card backs and power-ups (wild cards, reshuffles, peek) create IAP opportunities.

### Why It's Strong

- **Only 2 solitaire games on Jest** (Klondike and Pyramid) — room for a third variant (Tripeaks/Golf is the highest-grossing solitaire sub-genre on mobile, per Solitaire Grand Harvest: $500M+ lifetime revenue)
- **Fastest to build** — card games are UI-heavy but logic-simple. No physics, no pathfinding, no complex AI.
- **Proven Jest audience fit** — card/puzzle players already exist on the platform
- **Extremely high codebase reuse** — scene structure, shop, SDK, all UI components transfer directly
- **Small asset footprint** — card sprites (52 cards + backs + gem accents), minimal backgrounds

### Why It's #2, Not #1

- **Crowded adjacent space.** While Tripeaks specifically is absent, the "card game" category already has entries. Less differentiated than TD.
- **Lower monetization ceiling.** Card solitaire monetizes through boosters (wild cards, undos, reshuffles) at $0.99-1.99 price points. Lacks the depth of IAP catalog that TD or idle games support.
- **Less exciting for the team.** Strategically sound but not a portfolio differentiator. Feels like "another puzzle game" to Jest players browsing the marketplace.

### Asset Requirements (if chosen)

- Card face sprites (52 standard + 2 jokers): 54 sprites at 48x32
- Card back sprite (gem-themed): 1 sprite
- Gem accent overlays for card suits: 4 sprites
- Table/layout backgrounds: 2-3 sprites
- Power-up icons (wild, reshuffle, peek, undo): 4 sprites
- **Total new: ~65 sprites (but very small individual size)**

### Estimated Timeline: 3-4 weeks

---

## 5. Recommendation Summary

| Criterion | Gem Fortress (TD) | Idle Gem Mine | Gem Solitaire |
|-----------|-------------------|---------------|---------------|
| Market gap on Jest | **Zero TD games** | **Zero idle games** | 2 solitaire exist |
| Monetization depth | **Deep** (boosters, towers, cosmetics, packs) | Medium (speed-ups, multipliers) | Moderate (boosters, undos) |
| Codebase reuse | ~60% | ~50% | **~70%** |
| Art asset reuse | ~40% (gems as tower themes) | **~60%** (gems are the product) | ~30% (new card art) |
| Development time | 6 weeks | 4-5 weeks | **3-4 weeks** |
| Session length fit | **Excellent** (3-5 min waves) | Good (30s-2min check-ins) | Good (3-5 min rounds) |
| Notification hooks | **Excellent** (wave progress, unlocks) | **Excellent** (offline earnings) | Good (daily deals, streaks) |
| Portfolio diversification | **High** (active gameplay vs puzzle) | High (idle vs puzzle) | Low (still card/puzzle) |
| Revenue potential | **High** ($1.50+ ARPU achievable) | Medium ($0.80 ARPU) | Medium ($0.60 ARPU) |

### Final Verdict

**Build Gem Fortress (Tower Defense) as Game 2.**

It fills the biggest competitive gap on Jest, has the deepest monetization potential, creates the strongest portfolio diversification from Gem Link, and leverages the gem/crystal theme for brand continuity. The 6-week timeline is aggressive but achievable given the infrastructure we can copy from Gem Link.

**Start asset creation immediately** on Priority 1 items: the 18 tower sprites (6 types x 3 tiers) and the 5 basic enemy sprites. These are on the critical path — the engine can be built with placeholder graphics, but final art needs to be ready by Week 4.

---

## 6. Immediate Next Steps

- [ ] Begin tower sprite creation (Priority 1 — 18 sprites)
- [ ] Begin enemy sprite creation (Priority 2 — 5 basic enemies)
- [ ] Create new repo/directory: `gem-fortress/`
- [ ] Copy shared infrastructure from `gem-clash/`: sdk/, utils/, ui/, vite.config, playwright.config
- [ ] Design 10 map layouts (grid-based, with path waypoints and placement zones)
- [ ] Define wave data format in `levels.json` (enemy types, counts, spawn intervals, boss waves)
- [ ] Register game slug on Jest Developer Console: "gem-fortress"
- [ ] Define product catalog (SKUs are immutable — plan carefully)
