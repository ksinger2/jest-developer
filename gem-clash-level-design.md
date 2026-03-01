# Gem Clash: Level Design Document

> **Author:** Level Designer
> **Status:** Complete -- Ready for Engineering
> **Date:** February 2026 | **Version:** 1.0
> **Deliverables:** D-14 (30 initial levels), D-15 (Difficulty curve)
> **Consumers:** Game Engineer (level data), Lead Designer (visual pacing), Data Scientist (baseline metrics)

---

## 1. Design Philosophy

### Core Principles

**Teach one thing at a time.** Every new mechanic (line clear, bomb, color bomb, 6th color) is introduced in isolation before being combined with others. Players should never encounter two new concepts simultaneously.

**Flow state is the goal.** The majority of levels should feel "just challenging enough" -- the player should succeed more often than they fail, but never feel like the game is trivially easy. The sweet spot is where players think "I almost had 3 stars -- one more try."

**Star system drives replay.** The gap between 1-star (barely pass) and 3-star (mastery) must be meaningful. A player who scrapes by with 1 star should feel motivated to return and improve, not frustrated by an impossible ceiling. Three-starring a hard level should feel like a genuine accomplishment.

**Failure should feel fair.** When a player loses, they should understand why -- they ran out of moves because they didn't chain combos or use specials effectively, not because the board was unsolvable. The seed-based generation guarantees every board has paths to success.

**Monetization pressure is a gradient, not a wall.** Early levels never require purchases. Mid-game levels are completable without spending but 3-starring may require skill or boosters. Late levels are designed so that less-skilled players may want extra moves, but expert players can still succeed for free. The IAP "out of moves" prompt should feel like a helpful option, not a ransom demand.

### Level Group Themes

| Group | Levels | Theme | Focus |
|-------|--------|-------|-------|
| Zone 1 | 1-5 | **Tutorial** | Teach basic matching, introduce the game feel |
| Zone 2 | 6-10 | **Foundation** | Build confidence with line clears and bombs |
| Zone 3 | 11-15 | **Expansion** | All specials unlocked, moderate challenge |
| Zone 4 | 16-20 | **Challenge** | 6th gem color, tighter constraints |
| Zone 5 | 21-25 | **Mastery** | Expert play required, special combos essential |
| Zone 6 | 26-30 | **Pinnacle** | Endgame -- tight moves, high thresholds, IAP-friendly |

---

## 2. Difficulty Curve

### Progression Shape

The difficulty curve is not a straight line. It follows a "sawtooth" pattern with gradual ramps and periodic breather levels to prevent frustration spirals.

```
Difficulty
 10 |                                                          X X
  9 |                                                      X       X
  8 |                                              X   X       .
  7 |                                          X       .   .
  6 |                                  X   X       .
  5 |                              X       .   .
  4 |                      X   X       v
  3 |              X   X       v
  2 |          X       v
  1 |  X   X       v
  0 |__X___________________________________________________________
     1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30
                                    Level Number

     X = Level difficulty    v = Breather level    . = Steep ramp
```

Key inflection points:
- **Level 10:** First major spike ("boss" level). Tests line clear + bomb together.
- **Level 15:** Difficulty plateau before the 6th color introduction.
- **Level 16:** 6th color introduces a step increase in base difficulty.
- **Level 20:** Second boss level. Tests mastery of 6-color boards.
- **Level 25:** High difficulty with a breather at L23.
- **Level 30:** Final boss. Peak difficulty of the MVP.

### Target Completion Rates

These are first-attempt completion rates (passing with at least 1 star). Analytics will refine these post-launch.

| Zone | Levels | Target 1st-Attempt Pass Rate | Target 3-Star Rate |
|------|--------|------------------------------|-------------------|
| Tutorial | 1-5 | 90-95% | 60-70% |
| Foundation | 6-10 | 75-85% | 35-50% |
| Expansion | 11-15 | 60-75% | 20-35% |
| Challenge | 16-20 | 50-65% | 15-25% |
| Mastery | 21-25 | 40-55% | 8-15% |
| Pinnacle | 26-30 | 35-50% | 5-10% |

### Breather Levels

Every 5-7 levels, a deliberately easier level breaks the tension. These prevent frustration spirals where a player fails 3+ times in a row and churns.

| Breather Level | Placement Rationale |
|---------------|-------------------|
| Level 7 | After the L6 difficulty bump; rewards players before bomb introduction |
| Level 13 | After the L11-12 color bomb learning curve |
| Level 18 | Critical breather after the 6th color shock at L16-17 |
| Level 23 | Relief before the final difficulty ramp to L25 |
| Level 27 | Brief respite in the endgame gauntlet |

---

## 3. Mechanic Introduction Schedule

### Pacing Table

| Level | New Mechanic | Why Here | Player Understanding After |
|-------|-------------|----------|---------------------------|
| 1-3 | Basic matching (3-in-a-row) | Foundation -- learn swap, match, cascade | "I swap gems to make matches of 3+" |
| 4 | Line Clear (match 4 in a row) | After basic comfort; single new concept | "4 in a row makes a special gem" |
| 5 | Line Clear practice | Reinforce before adding complexity | "Line clears are powerful -- I should aim for 4-matches" |
| 6-7 | Line Clear strategy | Slightly harder boards encourage deliberate line clear use | "I can use line clears strategically to clear problem areas" |
| 8 | Bomb (L/T-shape match) | New shape pattern; distinct from line clear | "L or T shapes make bombs that clear a 3x3 area" |
| 9 | Bomb practice | Combined with line clear on same board | "I have two special tools now" |
| 10 | Boss level | Tests both line clear + bomb together | "I need both specials to beat tough levels" |
| 11 | Color Bomb (match 5 in a row) | Final special gem; most powerful | "5 in a row makes the ultimate special" |
| 12 | Color Bomb practice | Reinforce 5-match pattern recognition | "Color bombs clear all of one color -- game-changing" |
| 13-15 | All specials combined | Full toolkit available; difficulty from thresholds | "I have all my tools -- now I need to use them well" |
| 16 | 6th gem color | New difficulty axis; more colors = fewer natural matches | "The board is harder with more colors" |
| 17-30 | Mastery of all systems | Difficulty from move limits and thresholds | "I need optimal play to 3-star these levels" |

### Special Gem Unlock Progression

```
Level:  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30
        |--------|  |-----|  |-----|  |--|  |--|  |--|  |------------------------------------------------
        Basic only  +Line   Line     +Bomb Both +Color All three specials available
                    Clear   mastery        +Line  Bomb  (line_clear + bomb + color_bomb)
                                           Clear
```

---

## 4. Level Data Format

Each level is defined as a JSON object consumed by the Game Engineer's level loader. The format supports Phase 1 score-based objectives and is extensible for Phase 2 objective types.

```json
{
  "id": 1,
  "name": "First Steps",
  "moveLimit": 25,
  "starThresholds": [500, 1500, 3000],
  "seed": "level_001_v1",
  "colorCount": 5,
  "specialGemUnlocks": [],
  "objectives": {
    "type": "score",
    "target": 500
  },
  "designNotes": "Tutorial level. Very generous moves. Player learns basic swap mechanic."
}
```

### Field Reference

| Field | Type | Range | Description |
|-------|------|-------|-------------|
| `id` | integer | 1-30 | Level number. Sequential, unique. Determines map position. |
| `name` | string | -- | Thematic level name displayed in UI. Keep short (2-3 words). |
| `moveLimit` | integer | 12-25 | Number of moves allowed. Primary difficulty lever. |
| `starThresholds` | [int, int, int] | -- | Score needed for 1-star, 2-star, 3-star. Must be ascending. `starThresholds[0]` must equal `objectives.target`. |
| `seed` | string | -- | Deterministic seed for board generation. Format: `level_XXX_v1`. Same seed always produces the same starting board. Enables PvP (same seed = same board for both players). Bump version suffix when rebalancing. |
| `colorCount` | integer | 5-6 | Number of gem colors on the board. 5 = easier (more natural matches), 6 = harder. |
| `specialGemUnlocks` | string[] | [] or subset of ["line_clear", "bomb", "color_bomb"] | Which special gems can be created on this level. Empty array = basic matching only. |
| `objectives.type` | string | "score" | Phase 1: all levels are score-based. Phase 2 may add "clear_color", "reach_bottom", etc. |
| `objectives.target` | integer | -- | Minimum score to pass the level (1-star threshold). Must equal `starThresholds[0]`. |
| `designNotes` | string | -- | Designer intent. Documentation only -- stripped from production JSON. |

### Scoring Reference (for threshold calibration)

These values are the Game Engineer's domain, but the Level Designer needs them to set meaningful thresholds:

- Basic 3-match: ~50 points
- 4-match: ~100 points (+ line clear gem created)
- 5-match: ~150 points (+ bomb or color bomb created)
- Cascade bonus: 1.5x multiplier per cascade level (cascade 1 = 1.5x, cascade 2 = 2.25x, etc.)
- Special gem activation: ~200-500 points depending on gems cleared
- Remaining moves bonus: ~100 points per unused move

A player making ~20 basic matches with no specials and no cascades scores roughly 1,000 points. A skilled player chaining specials and cascades on the same board can score 5,000-10,000+.

---

## 5. All 30 Levels -- Full Specification

---

### ZONE 1: TUTORIAL (Levels 1-5)

**Zone Goal:** Teach the basic swap-and-match mechanic. Build confidence. No player should fail here.

**Zone Characteristics:**
- Very generous move counts (20-25)
- Low star thresholds
- 5 gem colors only
- No special gems in L1-3
- Line Clear introduced in L4-5

---

#### Level 1 -- "First Steps"

| Property | Value |
|----------|-------|
| Move Limit | 25 |
| Star Thresholds | 500 / 1,500 / 3,000 |
| Color Count | 5 |
| Special Gems | None |
| Objective | Score 500 |
| Seed | `level_001_v1` |

**Design Notes:** The very first level. A player with zero match-3 experience should pass this with 10+ moves remaining. The generous 25-move budget means even random swapping will likely produce enough matches to hit 500. The 3-star threshold (3,000) is reachable but gives returning players something to aim for. This level exists to teach the core swap gesture and the satisfaction of cascading gems.

---

#### Level 2 -- "Getting Warmer"

| Property | Value |
|----------|-------|
| Move Limit | 24 |
| Star Thresholds | 600 / 1,800 / 3,500 |
| Color Count | 5 |
| Special Gems | None |
| Objective | Score 600 |
| Seed | `level_002_v1` |

**Design Notes:** Slight bump from L1. Still extremely forgiving. The marginally higher 1-star threshold teaches players that scores matter. Players who got cascades in L1 will start recognizing the pattern. The 3-star gap (600 to 3,500) introduces the idea that there's always room to improve.

---

#### Level 3 -- "Cascade Valley"

| Property | Value |
|----------|-------|
| Move Limit | 23 |
| Star Thresholds | 800 / 2,200 / 4,200 |
| Color Count | 5 |
| Special Gems | None |
| Objective | Score 800 |
| Seed | `level_003_v1` |

**Design Notes:** Named to hint at cascades. This is the last purely-basic level. The 1-star target (800) is still very achievable with 23 moves, but a player who matches mindlessly may notice they're using more moves. This subtly teaches that planning matches is better than random swapping. This is also the registration prompt level (per PRD: registration nudge after L3 completion).

---

#### Level 4 -- "Line Up"

| Property | Value |
|----------|-------|
| Move Limit | 22 |
| Star Thresholds | 1,000 / 2,800 / 5,000 |
| Color Count | 5 |
| Special Gems | `["line_clear"]` |
| Objective | Score 1,000 |
| Seed | `level_004_v1` |

**Design Notes:** First level with line clear enabled. The name hints at the mechanic. When a player matches 4 in a row, a line clear gem appears -- this should feel like a discovery moment. The seed should be tuned to offer at least one obvious 4-in-a-row opportunity in the opening board state. The 1-star threshold (1,000) is calibrated so that a player who never triggers a line clear can still pass, but it will be tight. A player who activates even one line clear will pass comfortably.

---

#### Level 5 -- "Clear Skies"

| Property | Value |
|----------|-------|
| Move Limit | 22 |
| Star Thresholds | 1,200 / 3,200 / 5,500 |
| Color Count | 5 |
| Special Gems | `["line_clear"]` |
| Objective | Score 1,200 |
| Seed | `level_005_v1` |

**Design Notes:** Line clear reinforcement. Slightly higher threshold than L4 encourages the player to actively seek 4-matches rather than stumbling into them. This level should feel like the player is "getting the hang of it." The gap between 1-star (1,200) and 3-star (5,500) is wide -- the player needs multiple line clears and cascades to reach mastery. This is the last tutorial level; after this, the game begins in earnest.

---

### ZONE 2: FOUNDATION (Levels 6-10)

**Zone Goal:** Build player confidence with special gems. Introduce the bomb. Culminate in a boss level that tests everything learned so far.

**Zone Characteristics:**
- Moderate move counts (18-22)
- Line Clear mastery expected
- Bomb introduced at L8
- L7 is a breather
- L10 is a boss level

---

#### Level 6 -- "Gem Garden"

| Property | Value |
|----------|-------|
| Move Limit | 20 |
| Star Thresholds | 1,500 / 3,800 / 6,500 |
| Color Count | 5 |
| Special Gems | `["line_clear"]` |
| Objective | Score 1,500 |
| Seed | `level_006_v1` |

**Design Notes:** First "real" level. The move count drops to 20 and the 1-star threshold jumps to 1,500. Players who relied on brute-force matching will need to start using line clears intentionally. This is the first level where a careless player might fail on their first attempt -- and that's by design. Failure here teaches that moves are a resource to be managed.

---

#### Level 7 -- "Sparkling Stream" (BREATHER)

| Property | Value |
|----------|-------|
| Move Limit | 22 |
| Star Thresholds | 1,400 / 3,500 / 6,000 |
| Color Count | 5 |
| Special Gems | `["line_clear"]` |
| Objective | Score 1,400 |
| Seed | `level_007_v1` |

**Design Notes:** Breather level. After L6's difficulty bump, this level is deliberately more forgiving -- 2 extra moves and a lower 1-star threshold. The seed should produce a board with several natural 4-match opportunities. The player should feel rewarded and confident heading into the bomb introduction. This prevents a frustration spiral for players who struggled with L6.

---

#### Level 8 -- "Blast Zone"

| Property | Value |
|----------|-------|
| Move Limit | 20 |
| Star Thresholds | 1,800 / 4,500 / 7,500 |
| Color Count | 5 |
| Special Gems | `["line_clear", "bomb"]` |
| Objective | Score 1,800 |
| Seed | `level_008_v1` |

**Design Notes:** Bomb introduction. The name signals explosions. An L-shape or T-shape match now creates a bomb gem that clears a 3x3 area. The seed should include at least one near-obvious L or T formation. The 1-star threshold (1,800) is achievable with line clears alone, so a player who doesn't immediately grasp bombs can still pass. But the 3-star target (7,500) practically requires bomb usage, giving players a reason to experiment.

---

#### Level 9 -- "Double Trouble"

| Property | Value |
|----------|-------|
| Move Limit | 19 |
| Star Thresholds | 2,000 / 5,000 / 8,500 |
| Color Count | 5 |
| Special Gems | `["line_clear", "bomb"]` |
| Objective | Score 2,000 |
| Seed | `level_009_v1` |

**Design Notes:** Bomb reinforcement. The name suggests combining two mechanics. Move limit drops to 19, requiring efficient play. Players should be thinking about both line clears and bombs as tools. The 1-star threshold (2,000) is calibrated so that pure basic matching with 19 moves is insufficient -- the player must create at least 1-2 specials to pass. This is the skill check before the boss level.

---

#### Level 10 -- "Crystal Clash" (BOSS)

| Property | Value |
|----------|-------|
| Move Limit | 18 |
| Star Thresholds | 2,500 / 6,000 / 10,000 |
| Color Count | 5 |
| Special Gems | `["line_clear", "bomb"]` |
| Objective | Score 2,500 |
| Seed | `level_010_v1` |

**Design Notes:** First boss level. Named after the game itself. 18 moves and a 2,500-point threshold mean the player must use both line clears and bombs effectively. This is the first level where many players will fail on their first attempt -- target pass rate is 65-70%. The 3-star threshold (10,000) is deliberately aspirational; only players who chain specials with cascades will reach it. This level should feel like a satisfying gate -- passing it means "I've learned the fundamentals."

---

### ZONE 3: EXPANSION (Levels 11-15)

**Zone Goal:** Introduce the color bomb (the most powerful special). Bring all three specials together. Build toward the full toolkit.

**Zone Characteristics:**
- Color Bomb introduced at L11
- All three specials from L13 onward
- Move counts 16-20
- L13 is a breather
- Star thresholds increase noticeably

---

#### Level 11 -- "Prismatic Burst"

| Property | Value |
|----------|-------|
| Move Limit | 20 |
| Star Thresholds | 2,800 / 6,500 / 11,000 |
| Color Count | 5 |
| Special Gems | `["line_clear", "bomb", "color_bomb"]` |
| Objective | Score 2,800 |
| Seed | `level_011_v1` |

**Design Notes:** Color bomb introduction. The move count is generous (20) to give the player room to experiment with the new mechanic. Matching 5 in a row creates a color bomb that clears every gem of one color. The seed should offer at least one near-5-in-a-row setup. The 1-star target is achievable without using a color bomb, but activating one will likely push the player well past it. This is a "wow" moment -- the color bomb should feel overpowered and exciting.

---

#### Level 12 -- "Rainbow Road"

| Property | Value |
|----------|-------|
| Move Limit | 19 |
| Star Thresholds | 3,000 / 7,000 / 12,000 |
| Color Count | 5 |
| Special Gems | `["line_clear", "bomb", "color_bomb"]` |
| Objective | Score 3,000 |
| Seed | `level_012_v1` |

**Design Notes:** Color bomb reinforcement. The player should now be actively scanning for 5-in-a-row opportunities. The 3,000-point threshold requires more than basic matching -- the player needs at least a few specials. The seed should generate a board where 5-in-a-row is possible but not immediately obvious, encouraging pattern recognition.

---

#### Level 13 -- "Gentle Glow" (BREATHER)

| Property | Value |
|----------|-------|
| Move Limit | 20 |
| Star Thresholds | 2,800 / 6,800 / 11,500 |
| Color Count | 5 |
| Special Gems | `["line_clear", "bomb", "color_bomb"]` |
| Objective | Score 2,800 |
| Seed | `level_013_v1` |

**Design Notes:** Breather level. After learning the color bomb, players get a slightly easier board to consolidate all three specials. The threshold is equal to L11's -- intentionally the same to let the player feel how much better they've become with the full toolkit. A generous seed with multiple special-gem opportunities. This level is about confidence, not challenge.

---

#### Level 14 -- "Rising Tide"

| Property | Value |
|----------|-------|
| Move Limit | 18 |
| Star Thresholds | 3,500 / 8,000 / 13,500 |
| Color Count | 5 |
| Special Gems | `["line_clear", "bomb", "color_bomb"]` |
| Objective | Score 3,500 |
| Seed | `level_014_v1` |

**Design Notes:** The difficulty ramp begins. 18 moves with a 3,500-point threshold means the player needs to chain specials efficiently. This is where the game starts to demand strategy rather than just reaction. Players who have mastered the specials will find this satisfying; players who have been coasting may struggle. First level where the "Out of Moves" purchase prompt will appear for some players.

---

#### Level 15 -- "Storm Front"

| Property | Value |
|----------|-------|
| Move Limit | 17 |
| Star Thresholds | 4,000 / 9,000 / 15,000 |
| Color Count | 5 |
| Special Gems | `["line_clear", "bomb", "color_bomb"]` |
| Objective | Score 4,000 |
| Seed | `level_015_v1` |

**Design Notes:** Last 5-color level. 17 moves and 4,000 points is a meaningful challenge. This is the checkpoint before the 6th color arrives. The 3-star threshold (15,000) is very high -- only achievable with multiple specials, cascades, and efficient play. This level says: "You've mastered 5 colors. Something new is coming."

---

### ZONE 4: CHALLENGE (Levels 16-20)

**Zone Goal:** Introduce the 6th gem color and test adaptability. The additional color means fewer natural matches, making every move more precious.

**Zone Characteristics:**
- 6th gem color introduced at L16
- Move counts 15-18
- L18 is a breather
- L20 is a boss level
- Players may see their first IAP prompt here

---

#### Level 16 -- "New Horizons"

| Property | Value |
|----------|-------|
| Move Limit | 18 |
| Star Thresholds | 3,800 / 8,500 / 14,000 |
| Color Count | 6 |
| Special Gems | `["line_clear", "bomb", "color_bomb"]` |
| Objective | Score 3,800 |
| Seed | `level_016_v1` |

**Design Notes:** 6th color introduction. The name signals change. Going from 5 to 6 colors is a significant difficulty increase -- the probability of natural 3-matches drops considerably. The move limit is slightly generous (18) to cushion the transition, and the 1-star threshold (3,800) is actually slightly lower than L15's to account for the harder boards. Still, many players will feel the difference. The key message: "The board changed -- adapt your strategy."

---

#### Level 17 -- "Deep Current"

| Property | Value |
|----------|-------|
| Move Limit | 17 |
| Star Thresholds | 4,200 / 9,500 / 15,500 |
| Color Count | 6 |
| Special Gems | `["line_clear", "bomb", "color_bomb"]` |
| Objective | Score 4,200 |
| Seed | `level_017_v1` |

**Design Notes:** 6-color reinforcement. The threshold climbs while moves stay tight. Players who struggled with L16 should be adapting now. The key skill is recognizing that with 6 colors, special gems become even more valuable -- each one clears proportionally more of the board. Players who rely on basic 3-matches will increasingly struggle from here on.

---

#### Level 18 -- "Calm Waters" (BREATHER)

| Property | Value |
|----------|-------|
| Move Limit | 18 |
| Star Thresholds | 3,500 / 8,000 / 13,000 |
| Color Count | 6 |
| Special Gems | `["line_clear", "bomb", "color_bomb"]` |
| Objective | Score 3,500 |
| Seed | `level_018_v1` |

**Design Notes:** Critical breather. The 6th color is a significant shock -- players need relief. The threshold drops back to L14 levels and the seed should be generous. This level exists to prevent churn. A player who was frustrated by L16-17 should complete this comfortably, reinforcing that they can handle 6-color boards.

---

#### Level 19 -- "Ember Glow"

| Property | Value |
|----------|-------|
| Move Limit | 16 |
| Star Thresholds | 4,500 / 10,000 / 16,500 |
| Color Count | 6 |
| Special Gems | `["line_clear", "bomb", "color_bomb"]` |
| Objective | Score 4,500 |
| Seed | `level_019_v1` |

**Design Notes:** Pre-boss ramp. Only 16 moves with a 4,500-point requirement. This is where the "Out of Moves -- Buy 3 Extra Moves for $1" prompt becomes a regular sight for average players. The 3-star target (16,500) requires expert chaining. This level is the skill check before the Zone 4 boss.

---

#### Level 20 -- "Inferno" (BOSS)

| Property | Value |
|----------|-------|
| Move Limit | 15 |
| Star Thresholds | 5,000 / 11,000 / 18,000 |
| Color Count | 6 |
| Special Gems | `["line_clear", "bomb", "color_bomb"]` |
| Objective | Score 5,000 |
| Seed | `level_020_v1` |

**Design Notes:** Zone 4 boss. 15 moves, 6 colors, 5,000-point threshold. This is the hardest level so far. With only 15 moves on a 6-color board, every single move matters. Players need to create and activate multiple specials. The 3-star threshold (18,000) is aspirational -- it requires near-perfect play with cascading specials. Target first-attempt pass rate: ~50%. This is the first level where many players will purchase extra moves.

---

### ZONE 5: MASTERY (Levels 21-25)

**Zone Goal:** Push skilled players to their limits. Special gem combos are no longer optional -- they're required for meaningful scores. This is where the game separates casual players (who may buy extra moves) from experts (who optimize every swap).

**Zone Characteristics:**
- Tight move limits (13-18)
- High star thresholds
- L23 is a breather
- 6 colors throughout
- Special gem combos essential for 3 stars

---

#### Level 21 -- "Frost Peak"

| Property | Value |
|----------|-------|
| Move Limit | 16 |
| Star Thresholds | 5,500 / 12,000 / 19,500 |
| Color Count | 6 |
| Special Gems | `["line_clear", "bomb", "color_bomb"]` |
| Objective | Score 5,500 |
| Seed | `level_021_v1` |

**Design Notes:** Entry to mastery zone. 16 moves, 5,500 threshold. The player must consistently create specials to pass. Basic matching alone yields roughly 3,200 points with 16 moves -- well short of the target. The message is clear: specials are mandatory now, not bonus.

---

#### Level 22 -- "Twilight Summit"

| Property | Value |
|----------|-------|
| Move Limit | 15 |
| Star Thresholds | 5,800 / 12,500 / 20,500 |
| Color Count | 6 |
| Special Gems | `["line_clear", "bomb", "color_bomb"]` |
| Objective | Score 5,800 |
| Seed | `level_022_v1` |

**Design Notes:** Tightening the vise. 15 moves, 5,800 threshold. The player needs approximately 2-3 special gem activations plus good cascade luck. The 3-star target (20,500) requires exceptional play -- multiple specials chained in sequence. This is where replaying for 3 stars becomes a significant time investment.

---

#### Level 23 -- "Moonlit Clearing" (BREATHER)

| Property | Value |
|----------|-------|
| Move Limit | 18 |
| Star Thresholds | 5,000 / 11,000 / 18,000 |
| Color Count | 6 |
| Special Gems | `["line_clear", "bomb", "color_bomb"]` |
| Objective | Score 5,000 |
| Seed | `level_023_v1` |

**Design Notes:** Essential breather. After L21-22's intensity, players need a win. The move count jumps to 18 and the threshold drops to L20 levels. The seed should produce a generous board with good special-gem potential. This level exists to keep players in the game -- a frustrated player who quits at L22 is lost revenue. Players who pass L23 comfortably will think: "I can handle these hard levels."

---

#### Level 24 -- "Starfall"

| Property | Value |
|----------|-------|
| Move Limit | 14 |
| Star Thresholds | 6,000 / 13,000 / 21,000 |
| Color Count | 6 |
| Special Gems | `["line_clear", "bomb", "color_bomb"]` |
| Objective | Score 6,000 |
| Seed | `level_024_v1` |

**Design Notes:** Second-hardest level in the game at this point. Only 14 moves means every swap must count. The 6,000-point threshold with 14 moves requires an average of ~430 points per move -- impossible without specials and cascades. This is a "purchase driver" level: many players will see the "Out of Moves" prompt and seriously consider buying 3 extra.

---

#### Level 25 -- "Void's Edge"

| Property | Value |
|----------|-------|
| Move Limit | 13 |
| Star Thresholds | 6,500 / 14,000 / 22,500 |
| Color Count | 6 |
| Special Gems | `["line_clear", "bomb", "color_bomb"]` |
| Objective | Score 6,500 |
| Seed | `level_025_v1` |

**Design Notes:** Zone 5 capstone. 13 moves is brutal on a 6-color board. The player needs multiple specials in nearly every move sequence. The 3-star threshold (22,500) is essentially a "perfect game" -- it requires chaining color bombs with line clears and bombs across cascading sequences. Target first-attempt pass rate: ~40%. This is the true skill check of the game.

---

### ZONE 6: PINNACLE (Levels 26-30)

**Zone Goal:** Endgame content that is genuinely difficult. These levels exist to give expert players something to strive for and to drive IAP for extra moves among completionists. Three-starring all of Zone 6 is a badge of honor.

**Zone Characteristics:**
- Very tight move limits (12-16)
- Highest star thresholds in the game
- L27 is a breather
- L30 is the "final boss"
- Designed to be IAP-friendly without being pay-to-win

---

#### Level 26 -- "Obsidian Gate"

| Property | Value |
|----------|-------|
| Move Limit | 14 |
| Star Thresholds | 6,800 / 14,500 / 23,000 |
| Color Count | 6 |
| Special Gems | `["line_clear", "bomb", "color_bomb"]` |
| Objective | Score 6,800 |
| Seed | `level_026_v1` |

**Design Notes:** Endgame entry. The threshold continues climbing while moves stay at 14. The player is now in expert territory -- every level from here requires deliberate, planned play. Random matching is a guaranteed fail. The seed should still be fair (no dead-end boards), but the natural match density with 6 colors makes every move precious.

---

#### Level 27 -- "Oasis" (BREATHER)

| Property | Value |
|----------|-------|
| Move Limit | 16 |
| Star Thresholds | 6,000 / 13,000 / 21,000 |
| Color Count | 6 |
| Special Gems | `["line_clear", "bomb", "color_bomb"]` |
| Objective | Score 6,000 |
| Seed | `level_027_v1` |

**Design Notes:** Final breather. The name says it all -- an oasis in the desert. 16 moves and a threshold that matches L24. The seed should be the most generous in Zone 6. This level prevents the final stretch (L28-30) from feeling like an unbroken wall of difficulty. Players recharge here before the final push.

---

#### Level 28 -- "Crimson Peak"

| Property | Value |
|----------|-------|
| Move Limit | 13 |
| Star Thresholds | 7,000 / 15,000 / 24,000 |
| Color Count | 6 |
| Special Gems | `["line_clear", "bomb", "color_bomb"]` |
| Objective | Score 7,000 |
| Seed | `level_028_v1` |

**Design Notes:** Serious endgame. 13 moves, 7,000 threshold. The player needs roughly 540 points per move on average. Without specials, a basic match gives ~50 points -- meaning you'd need 140 basic matches in 13 moves (impossible). The math makes it clear: multiple specials per level are not optional. This is where the IAP conversion rate will be highest.

---

#### Level 29 -- "Abyssal Depths"

| Property | Value |
|----------|-------|
| Move Limit | 12 |
| Star Thresholds | 7,500 / 16,000 / 25,000 |
| Color Count | 6 |
| Special Gems | `["line_clear", "bomb", "color_bomb"]` |
| Objective | Score 7,500 |
| Seed | `level_029_v1` |

**Design Notes:** Penultimate level. 12 moves is the tightest in the game (tied with L30). 7,500 points in 12 moves requires an average of 625 points per move. The player needs a color bomb plus cascading specials to have any chance. This level exists to make L30 feel like the climax rather than a difficulty island. Target first-attempt pass rate: ~35%.

---

#### Level 30 -- "Final Clash" (FINAL BOSS)

| Property | Value |
|----------|-------|
| Move Limit | 12 |
| Star Thresholds | 8,000 / 17,000 / 27,000 |
| Color Count | 6 |
| Special Gems | `["line_clear", "bomb", "color_bomb"]` |
| Objective | Score 8,000 |
| Seed | `level_030_v1` |

**Design Notes:** The final level of Phase 1. Named to match the game title. 12 moves, 6 colors, 8,000-point threshold. This is the hardest level in the game. The 3-star threshold (27,000) is designed to be a trophy -- only players with deep pattern recognition, special-gem expertise, and some board luck will achieve it. Target first-attempt pass rate: 35%. Target 3-star rate: <5%. Completing this level should feel like an event. The PvP challenge system (Phase 2) will make "Beat my score on Level 30" the ultimate bragging-rights moment.

---

## 6. Replayability Design

### Star Gap Strategy

The gap between 1-star and 3-star thresholds is the primary replay driver. The ratio widens as levels progress:

| Zone | Avg 1-Star | Avg 3-Star | Gap Ratio (3-star / 1-star) |
|------|-----------|-----------|---------------------------|
| Tutorial (1-5) | 820 | 4,240 | 5.2x |
| Foundation (6-10) | 1,840 | 7,700 | 4.2x |
| Expansion (11-15) | 3,220 | 12,600 | 3.9x |
| Challenge (16-20) | 4,200 | 15,400 | 3.7x |
| Mastery (21-25) | 5,760 | 20,300 | 3.5x |
| Pinnacle (26-30) | 7,060 | 24,000 | 3.4x |

The gap ratio narrows as difficulty increases. This is intentional: on easy levels, the distance from "barely passing" to "mastery" is enormous, encouraging repeated play. On hard levels, the gap is smaller in ratio but larger in absolute points, meaning 3-starring requires near-perfect play rather than just "being better."

### Total Stars

- Total possible stars: **90** (30 levels x 3 stars)
- Expected star count for an average player completing all 30 levels: **45-55** (mix of 1-star and 2-star on harder levels)
- Expected star count for a skilled player: **70-80**
- Perfect 90 stars: requires mastery of every level -- a genuine achievement

### Star Collection as Progression

Even without new levels, star collection provides a sense of progress:
- "I have 42/90 stars" creates a natural goal to return and improve
- Phase 2 star milestones (50, 100, 200 stars) will add tangible rewards
- The level map showing 1-star and 2-star completions is a visual reminder of unrealized potential

### PvP Replay Value (Phase 2 Integration)

Every level is replayable via the challenge system:
- Seeds ensure identical boards for fair PvP comparison
- The same level can be challenged unlimited times
- Players naturally gravitate to replaying levels where they have high scores (to challenge friends)
- Level 30 challenges will become the ultimate competitive benchmark

---

## 7. Tuning Notes for Engineering

### Seed Generation Guidelines

Seeds follow the format `level_XXX_v1` where:
- `XXX` is the zero-padded level number (001-030)
- `v1` is the version suffix, incremented when a level is rebalanced

The Game Engineer should implement a seeded random number generator (e.g., mulberry32 or xoshiro128) that produces deterministic board layouts from these seeds. Requirements:
- Same seed must always produce the same starting board
- Board must have at least one valid move at generation
- No board should start with any pre-existing matches (all matches happen after the first player swap)

### Post-Launch Tuning

All thresholds and move counts in this document are initial values based on theoretical calculations and match-3 design heuristics. Post-launch, the Data Scientist should track:
- Actual completion rates per level (compare to targets in Section 2)
- Average score distribution per level (are thresholds too tight or too loose?)
- Move-remaining distribution at level end (are move counts appropriate?)
- Extra Moves purchase rate per level (are we monetizing at the right points?)

If a level's completion rate deviates more than 15% from its target, it should be rebalanced by adjusting the `moveLimit` or `starThresholds` and bumping the seed version (e.g., `level_014_v2`).

### Level Data File Location

Production-ready level data (without `designNotes`) is at:
```
gem-clash/assets/levels/levels.json
```

This file is the single source of truth consumed by the Game Engineer's level loader.

---

## Summary Table: All 30 Levels

| # | Name | Moves | 1-Star | 2-Star | 3-Star | Colors | Specials | Notes |
|---|------|-------|--------|--------|--------|--------|----------|-------|
| 1 | First Steps | 25 | 500 | 1,500 | 3,000 | 5 | None | Tutorial: basic swap |
| 2 | Getting Warmer | 24 | 600 | 1,800 | 3,500 | 5 | None | Tutorial: score awareness |
| 3 | Cascade Valley | 23 | 800 | 2,200 | 4,200 | 5 | None | Tutorial: cascade discovery |
| 4 | Line Up | 22 | 1,000 | 2,800 | 5,000 | 5 | Line Clear | Intro: line clear |
| 5 | Clear Skies | 22 | 1,200 | 3,200 | 5,500 | 5 | Line Clear | Reinforce: line clear |
| 6 | Gem Garden | 20 | 1,500 | 3,800 | 6,500 | 5 | Line Clear | First real challenge |
| 7 | Sparkling Stream | 22 | 1,400 | 3,500 | 6,000 | 5 | Line Clear | BREATHER |
| 8 | Blast Zone | 20 | 1,800 | 4,500 | 7,500 | 5 | Line Clear, Bomb | Intro: bomb |
| 9 | Double Trouble | 19 | 2,000 | 5,000 | 8,500 | 5 | Line Clear, Bomb | Combined specials |
| 10 | Crystal Clash | 18 | 2,500 | 6,000 | 10,000 | 5 | Line Clear, Bomb | BOSS: Zone 2 |
| 11 | Prismatic Burst | 20 | 2,800 | 6,500 | 11,000 | 5 | All Three | Intro: color bomb |
| 12 | Rainbow Road | 19 | 3,000 | 7,000 | 12,000 | 5 | All Three | Reinforce: color bomb |
| 13 | Gentle Glow | 20 | 2,800 | 6,800 | 11,500 | 5 | All Three | BREATHER |
| 14 | Rising Tide | 18 | 3,500 | 8,000 | 13,500 | 5 | All Three | Difficulty ramp |
| 15 | Storm Front | 17 | 4,000 | 9,000 | 15,000 | 5 | All Three | Last 5-color level |
| 16 | New Horizons | 18 | 3,800 | 8,500 | 14,000 | 6 | All Three | Intro: 6th color |
| 17 | Deep Current | 17 | 4,200 | 9,500 | 15,500 | 6 | All Three | 6-color reinforcement |
| 18 | Calm Waters | 18 | 3,500 | 8,000 | 13,000 | 6 | All Three | BREATHER |
| 19 | Ember Glow | 16 | 4,500 | 10,000 | 16,500 | 6 | All Three | Pre-boss ramp |
| 20 | Inferno | 15 | 5,000 | 11,000 | 18,000 | 6 | All Three | BOSS: Zone 4 |
| 21 | Frost Peak | 16 | 5,500 | 12,000 | 19,500 | 6 | All Three | Mastery entry |
| 22 | Twilight Summit | 15 | 5,800 | 12,500 | 20,500 | 6 | All Three | Tight constraints |
| 23 | Moonlit Clearing | 18 | 5,000 | 11,000 | 18,000 | 6 | All Three | BREATHER |
| 24 | Starfall | 14 | 6,000 | 13,000 | 21,000 | 6 | All Three | Purchase driver |
| 25 | Void's Edge | 13 | 6,500 | 14,000 | 22,500 | 6 | All Three | Zone 5 capstone |
| 26 | Obsidian Gate | 14 | 6,800 | 14,500 | 23,000 | 6 | All Three | Endgame entry |
| 27 | Oasis | 16 | 6,000 | 13,000 | 21,000 | 6 | All Three | BREATHER |
| 28 | Crimson Peak | 13 | 7,000 | 15,000 | 24,000 | 6 | All Three | Peak IAP conversion |
| 29 | Abyssal Depths | 12 | 7,500 | 16,000 | 25,000 | 6 | All Three | Penultimate |
| 30 | Final Clash | 12 | 8,000 | 17,000 | 27,000 | 6 | All Three | FINAL BOSS |

---

*Document authored by the Level Designer. All thresholds are initial values subject to post-launch tuning based on analytics data.*
