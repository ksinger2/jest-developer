# P0 Blocker Coordination Plan

> **Created:** March 15, 2026
> **Coordinator:** Project Manager
> **Next Review:** March 17, 2026 EOD

---

## Executive Summary

Four P0 blockers have been identified that require cross-team coordination. This document provides:
- Full analysis of each blocker
- Owner assignments with clear accountability
- Decision requirements (yes/no)
- 48-hour resolution timeline
- Escalation paths if not resolved

---

## P0 Blockers Summary

| ID | Blocker | Owner | Decision Required | Status | Target Resolution | Escalation Path |
|----|---------|-------|-------------------|--------|-------------------|-----------------|
| B-1 | Trademark Conflict | Compliance Officer | YES | OPEN | March 17, 2026 | Principal PM + Legal Counsel |
| B-2 | Jest Developer Console Access | Release Manager | NO | BLOCKED | March 17, 2026 | Principal PM to Jest contact |
| B-3 | Level Data Discrepancy | Level Designer + Game Producer | YES | OPEN | March 17, 2026 | Principal PM decides |
| B-4 | Challenge Wager Feature | Principal PM | NO | **RESOLVED** | COMPLETE | N/A |

---

## B-1: Trademark Conflict

### Status
OPEN - Requires decision

### Context
Compliance Officer found potential conflict with "Gems Clash" (an Android game with 720 levels). The game slug `gem-clash` is immutable once registered in Jest Developer Console per PRD Section 6 (SKU/slug immutability constraint).

### Owner
Compliance Officer

### Decision Required
YES - Proceed with "Gem Clash" or rebrand before Developer Console registration?

### Options
1. **Proceed with "Gem Clash"** - Different platform (Jest vs Android), different capitalization, different name ("Gem" singular vs "Gems" plural). Risk: potential C&D letter post-launch.
2. **Rebrand now** - Choose alternative name before any Developer Console registration. Cost: delay of 1-2 days for name selection + asset updates.

### Analysis Needed
- [ ] Formal trademark search (USPTO, common law)
- [ ] Risk assessment: likelihood of enforcement from "Gems Clash" owner
- [ ] Alternative name options if rebranding required

### Dependencies (B-1 Blocks)
- B-2: Developer Console access requires game slug decision
- All SKU creation (SKUs are namespaced by game)
- Backend deployment (JEST_GAME_ID derived from slug)
- Developer Console asset uploads

### Timeline
- **March 16 EOD:** Compliance Officer provides trademark analysis and recommendation
- **March 17 AM:** Principal PM makes final decision
- **March 17 PM:** If proceeding, register game slug; if rebranding, begin name selection

### Escalation
If no decision by March 17 EOD, escalate to Principal PM + external legal counsel.

---

## B-2: Jest Developer Console Access

### Status
BLOCKED - Awaiting account approval

### Context
Multiple teams are blocked waiting for Developer Console access:
- DevOps: Cannot execute Track B spike (test fetch() from Jest webview)
- Revenue Ops: Cannot create SKUs
- Backend Lead: Cannot retrieve Shared Secret for worker deployment
- Release Manager: Cannot upload test builds
- Lead Designer: Cannot upload notification images for approval

### Owner
Release Manager

### Decision Required
NO - This is an operational task, not a decision.

### Actions
- [ ] Determine current application status (has anyone applied?)
- [ ] If not applied: Submit application immediately
- [ ] If applied: Follow up with Jest support for timeline
- [ ] Identify any prerequisites (company verification, tax forms, etc.)

### Dependencies
- Blocked by B-1 (game slug selection must be decided first)
- Blocks Track B spike (TASK-004)
- Blocks SKU creation
- Blocks upload testing
- Blocks backend deployment
- Blocks notification image approval pipeline

### Timeline
- **March 16 AM:** Release Manager confirms application status
- **March 16 PM:** If B-1 resolved, register game in Developer Console
- **March 17:** Access confirmed OR escalation to Jest contact

### Escalation
If no access by March 18, Principal PM reaches out to Jest business contact directly.

---

## B-3: Level Data Discrepancy

### Status
OPEN - Requires decision on authoritative source

### Context
The level design document and implementation have diverged significantly:

| Level | Design Doc Moves | Implementation Moves | Difference |
|-------|------------------|---------------------|------------|
| 1     | 25               | 18                  | -28% |
| 10    | 18               | 12                  | -33% |
| 20    | 15               | 9                   | -40% |
| 30    | 12               | 7                   | -42% |

The implementation is 28-42% harder than the design document intended. Star thresholds also differ significantly.

### Files in Conflict
- Design doc: `/Users/karen/Desktop/Git Projects/GemLink/gem-clash-level-design.md` (25-12 moves)
- Implementation: `/Users/karen/Desktop/Git Projects/GemLink/gem-clash/assets/levels/levels.json` (18-7 moves)

### Owner
Level Designer (primary) + Game Producer (secondary)

### Decision Required
YES - Which source is authoritative?
1. **Design Document is authoritative** - Update levels.json to match gem-clash-level-design.md
2. **Implementation is authoritative** - Update gem-clash-level-design.md to match levels.json

### Impact Analysis
- If design doc is correct: Tutorial levels (1-5) are currently too hard; first-attempt pass rates will be below 90-95% target
- If implementation is correct: Design document needs wholesale revision; difficulty curve steeper than originally intended
- Either way: One document needs to be updated to maintain single source of truth

### Recommendation
Accept implementation values (levels.json) as the new baseline. Rationale:
1. Implementation represents actual engineering work already completed
2. Tighter move counts increase "Extra Moves" IAP appeal (revenue positive)
3. Can validate via playtesting rather than delaying for document reconciliation
4. Post-launch analytics will allow further tuning via seed versioning (level_XXX_v2)

### Actions
- [ ] Level Designer and Game Producer meet to decide authoritative source (March 16)
- [ ] Losing source updated to match winning source (March 16-17)
- [ ] Playtest levels 1-10 to validate difficulty with chosen values (March 17)
- [ ] Establish process to prevent future divergence (JSON generates docs OR docs validate JSON)

### Timeline
- **March 16 AM:** Level Designer + Game Producer sync meeting
- **March 16 PM:** Decision made and documented
- **March 17:** Reconciliation complete; playtesting begins

### Escalation
If no agreement by March 17 AM, Principal PM makes the call.

---

## B-4: Challenge Wager Feature - RESOLVED

### Status
RESOLVED - Feature killed

### Context
The strategy assessment proposed a "Challenge Wager" feature where players bet Tokens ($1) on score outcomes. This constitutes gambling under SHAFT policy (Sex, Hate, Alcohol, Firearms, Tobacco, gambling, drugs) per PRD Section 6 and docs/jest-platform/requirements/gameplay.md.

### Decision
KILL THIS FEATURE. Replace with non-monetary stakes (cosmetic rewards, bragging rights).

### Owner
Principal PM (decision made)

### Verification
- [x] Feature not referenced in current codebase (confirmed: no "wager" or "bet" references)
- [x] PRD flagged this for removal (Section 9.5)
- [ ] Ensure no PRD/design doc updates add this feature back

### No further action required.

---

## Cross-Team Dependency Map

```
B-1 Trademark Decision
         |
         v
B-2 Developer Console Access
         |
    +----+----+----+----+
    |    |    |    |    |
    v    v    v    v    v
  SKUs  Track B  Upload  Shared  Notif
        Spike    Testing Secret  Images
          |               |
          v               v
    If fetch() works --> Backend Deploy
```

```
B-3 Level Data Decision
         |
         v
    Update Docs OR JSON
         |
         v
    Playtest Validation
         |
         v
    Difficulty Curve Signed Off
```

---

## Blocker Resolution Checklist (Next 48 Hours)

### Day 1 (March 16, 2026)

| Time | Task | Owner | Status |
|------|------|-------|--------|
| 9:00 AM | Confirm Developer Console application status | Release Manager | [ ] |
| 10:00 AM | Deliver trademark analysis for B-1 | Compliance Officer | [ ] |
| 11:00 AM | Sync on B-3 (level data decision) | Level Designer + Game Producer | [ ] |
| 2:00 PM | Review trademark recommendation | Principal PM | [ ] |
| 4:00 PM | Level data decision made and documented | Level Designer + Game Producer | [ ] |
| EOD | B-1 decision made OR escalation path activated | Compliance Officer + Principal PM | [ ] |

### Day 2 (March 17, 2026)

| Time | Task | Owner | Status |
|------|------|-------|--------|
| 9:00 AM | If B-1 resolved, register game slug in Developer Console | Release Manager | [ ] |
| 10:00 AM | Level data reconciliation complete (docs updated) | Level Designer | [ ] |
| 11:00 AM | Playtest levels 1-10 with finalized values | Game Producer | [ ] |
| 2:00 PM | Track B spike execution (if Console access obtained) | DevOps + Frontend Lead | [ ] |
| 4:00 PM | SKU creation (if Console access obtained) | Revenue Ops Analyst | [ ] |
| EOD | All P0 blockers resolved OR escalation to Principal PM + Legal | All | [ ] |

---

## Owner Assignment Summary

| Role | Blockers Owned | Actions Due | Deadline |
|------|---------------|-------------|----------|
| Compliance Officer | B-1 | Trademark analysis with recommendation | March 16 EOD |
| Release Manager | B-2 | Developer Console status confirmation | March 16 AM |
| Level Designer | B-3 (primary) | Decision meeting with Game Producer | March 16 AM |
| Game Producer | B-3 (secondary) | Decision meeting with Level Designer | March 16 AM |
| Principal PM | B-4 (resolved), All escalations | Final decisions if unresolved | March 17 EOD |
| DevOps Engineer | Track B Spike | Execute once B-2 resolved | March 17 PM |
| Revenue Ops Analyst | SKU Creation | Execute once B-1 and B-2 resolved | March 17 PM |
| Backend Lead | Worker Deploy | Execute once Track B confirms fetch() | March 18 |

---

## P1 Blockers (High Priority - Not Ship-Stopping But Require Coordination)

| Blocker | Owner | Status | Impact | Target Date |
|---------|-------|--------|--------|-------------|
| Image Assets Missing | Lead Designer | CRITICAL | Game unplayable without sprites | March 20 |
| Track B Spike Not Executed | DevOps + Frontend Lead | BLOCKED on B-2 | Cannot confirm fetch() | March 17 |
| Lives System Not Implemented | Game Engineer | IN PROGRESS | Required for Phase 1 | March 19 |
| Registration Prompt Missing | Content Manager + Frontend Lead | NOT STARTED | Blocks conversion KPI | March 18 |
| Analytics Tasks Missing from Sprint | Project Manager | NOT STARTED | No sprint allocation | March 17 |
| Analytics Validation Missing from QA | QA Engineer | NOT STARTED | Events untested | March 18 |

---

## Success Criteria

All P0 blockers are considered resolved when:

1. **B-1 (Trademark):** Decision documented with rationale; if proceeding, game slug registered; if rebranding, alternative name selected and communicated
2. **B-2 (Console Access):** Developer Console access confirmed; at least one team member can log in and access game management
3. **B-3 (Level Data):** Authoritative source identified; losing source updated to match; single source of truth established
4. **B-4 (Challenge Wager):** Already resolved; verified not in codebase

---

## Communication Protocol

- **Status updates:** All blockers updated in this document daily until resolved
- **Escalation:** If any blocker misses its target date, escalation email to Principal PM within 1 hour
- **Decision documentation:** All decisions logged with rationale and date in this document
- **Cross-team notifications:** When a blocker is resolved, notify dependent teams immediately via team channel

---

*This document should be integrated into NextSteps.md "Critical Blockers" section. Created by Project Manager on March 15, 2026.*
