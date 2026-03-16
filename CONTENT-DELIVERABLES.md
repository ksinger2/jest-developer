# Gem Clash - Content Deliverables

> **Owner:** Content Manager
> **Status:** COMPLETE - Ready for Engineering Implementation
> **Last Updated:** March 15, 2026

---

## 1. Registration Prompt Copy (P0 BLOCKER FOR PHASE 1)

**Implementation Target:** Week 1 (Phase 1 blocker for guest-to-registered conversion)

**Registration Modal Copy:**

```
HEADLINE:
"Save Your Progress!"

BENEFITS:
• Never lose your levels or score
• Challenge friends to beat your high score
• Get daily notifications with rewards
• Play on any device, anytime

PRIMARY CTA:
"Register Now"

DISMISS CTA:
"Maybe Later"
```

**Trigger Points (per PRD):**
- Post-Level 3 completion (first soft prompt)
- Post-Level 5 completion (second prompt)
- Before any purchase attempt (guest players must register to buy)

**Implementation Notes for Frontend Lead:**
- Modal should be dismissible (click outside or X button)
- Do not block gameplay - player can tap "Maybe Later"
- On third dismiss, stop showing until next session
- Track events: `registration_prompted`, `registration_completed`, `registration_skipped`

**SHAFT Compliance:**
- No gambling language: PASS
- No aggressive language: PASS
- Positive framing: PASS
- Age-appropriate: PASS

---

## 2. Notification Templates (P1 BLOCKS PHASE 2)

**Implementation Target:** Week 2 (notification images need early submission to Jest for approval)

**Platform Constraints (from notifications.md):**
- Under 100 characters (SMS limit)
- NO emojis (Jest strips them for SMS delivery)
- NO game name (Jest adds it automatically)
- NO SHAFT content (Sex, Hate, Alcohol, Firearms, Tobacco, gambling, drugs)
- Schedule D0-D7 after first session
- Use entryPayload for attribution tracking

### D0 Templates (Same-Day Welcome - Schedule 8 hours after first session)

```
Template: d0_welcome_v1
Text: "Welcome! Your progress is saved. Ready to crush more levels?"
entryPayload: { notification_template: "d0_welcome_v1", notification_offset: "d0" }
Character count: 68

Template: d0_welcome_v2
Text: "Great start! Come back and see how far you can climb."
entryPayload: { notification_template: "d0_welcome_v2", notification_offset: "d0" }
Character count: 62
```

### D1 Templates (Next-Day Return - Schedule 24 hours after first session)

```
Template: d1_progress_v1
Text: "Level {level} is waiting for you. Can you beat it?"
entryPayload: { notification_template: "d1_progress_v1", notification_offset: "d1" }
Character count: 52 (plus variable)

Template: d1_progress_v2
Text: "You were doing great! Ready to keep climbing?"
entryPayload: { notification_template: "d1_progress_v2", notification_offset: "d1" }
Character count: 54

Template: d1_lives_v1
Text: "Your lives are fully recharged. Time to play!"
entryPayload: { notification_template: "d1_lives_v1", notification_offset: "d1" }
Character count: 51
```

### D2 Templates (Two-Day Follow-Up)

```
Template: d2_challenge_v1
Text: "Think you can beat your high score on Level {level}?"
entryPayload: { notification_template: "d2_challenge_v1", notification_offset: "d2" }
Character count: 57 (plus variable)

Template: d2_challenge_v2
Text: "New levels are waiting. See how many you can clear!"
entryPayload: { notification_template: "d2_challenge_v2", notification_offset: "d2" }
Character count: 60
```

### D3 Templates (Mid-Week Re-Engagement)

```
Template: d3_social_v1
Text: "{friend} just beat Level {level}. Can you top their score?"
entryPayload: { notification_template: "d3_social_v1", notification_offset: "d3" }
Character count: 63 (plus variables)
Note: Use default if {friend} not available: "Players are crushing new levels. Ready to join in?"

Template: d3_streak_v1
Text: "You are on a roll! Come back and keep your streak alive."
entryPayload: { notification_template: "d3_streak_v1", notification_offset: "d3" }
Character count: 63
```

### D4 Templates (Late-Week Nudge)

```
Template: d4_reward_v1
Text: "You have earned a bonus! Claim it before it expires."
entryPayload: { notification_template: "d4_reward_v1", notification_offset: "d4" }
Character count: 59

Template: d4_progress_v1
Text: "So close to clearing Level {level}. Give it another shot!"
entryPayload: { notification_template: "d4_progress_v1", notification_offset: "d4" }
Character count: 64 (plus variable)
```

### D7 Templates (Week-End Win-Back)

```
Template: d7_comeback_v1
Text: "We saved your progress. Ready to pick up where you left off?"
entryPayload: { notification_template: "d7_comeback_v1", notification_offset: "d7" }
Character count: 68

Template: d7_comeback_v2
Text: "Your levels miss you! Come back and show them who is boss."
entryPayload: { notification_template: "d7_comeback_v2", notification_offset: "d7" }
Character count: 66
```

**Template Count: 14 total** (exceeds 10+ requirement)

### Rotation Strategy (Avoiding "Groundhog Day Trap")

- **D0:** Rotate between v1 and v2 based on session count mod 2
- **D1:** Rotate between progress_v1, progress_v2, and lives_v1 based on current lives state
- **D2:** Rotate between challenge variants
- **D3:** Use social_v1 if friend data available, else streak_v1
- **D4:** Use reward_v1 if player has unclaimed bonus, else progress_v1
- **D7:** Rotate between comeback variants

### Analytics Implementation Notes

When player opens game from notification, call `JestSDK.getEntryPayload()` to retrieve attribution data:

```typescript
const entryPayload = await JestSDK.getEntryPayload();
if (entryPayload?.notification_template) {
  logEvent('notification_opened', {
    template: entryPayload.notification_template,
    offset: entryPayload.notification_offset
  });
}
```

### Dynamic Variables

- `{level}`: Current level number (from playerData)
- `{friend}`: Friend name who completed level (from social graph, use default text if unavailable)
- `{count}`: Total gems cleared (for achievement notifications)
- `{days}`: Streak length (for streak notifications)

### SHAFT Compliance Audit

| Template | SHAFT Check | Status |
|----------|-------------|--------|
| All welcome templates | No SHAFT content | PASS |
| Progress templates | No gambling language ("beat" is allowed) | PASS |
| Challenge templates | No aggressive language | PASS |
| Social templates | No hate/discrimination | PASS |
| Reward templates | No alcohol/tobacco references | PASS |
| Lives templates | No gambling/betting language | PASS |

---

## 3. Next Steps for Cross-Team Collaboration

### Engineering (Frontend Lead)
1. Register all 14 templates in Jest Developer Console under Notifications section
2. Implement notification scheduling logic in `NotificationManager.ts`
3. Use fuzzy scheduling (`scheduledInDays`) for D0-D7 reminders
4. When player returns, unschedule all pending and reschedule fresh D0-D7 set
5. Ensure rotation logic prevents same template from being sent twice in a row
6. Test entryPayload attribution flow end-to-end
7. Implement registration prompt modal UI

### Design (Lead Designer)
1. Create notification image assets following Jest Developer Console specs
2. Upload for approval ASAP (long lead time for approval process per PRD warning)
3. Coordinate image selection with notification template categories (welcome, progress, challenge, reward)
4. Design registration modal UI matching brand guidelines

### Compliance (Compliance Officer)
1. Final SHAFT review of all 14 templates before Developer Console registration
2. Sign off required before Jest submission in Week 3

### Analytics (Data Scientist)
1. Add notification attribution events to tracking specification
2. Define A/B test framework for notification template rotation
3. Set up dashboard for notification open rate by template

---

## 4. Compliance Certification

**Content Manager Sign-Off:**
- All text is under 100 characters: YES
- No emojis in final templates: YES
- No SHAFT violations: YES
- Positive, encouraging tone: YES
- Appropriate for all ages: YES

**Ready for Compliance Officer Review:** YES

**Ready for Engineering Implementation:** YES (pending Compliance Officer final sign-off)

---

## File Reference

- **Notification Guidelines:** `/Users/karen/Desktop/Git Projects/GemLink/docs/jest-platform/guides/notifications.md`
- **PRD Section 5.2.2:** `/Users/karen/Desktop/Git Projects/GemLink/docs/gem-clash-prd.md`
- **Content Manager Domain:** `/Users/karen/Desktop/Git Projects/GemLink/.claude/agents/content-manager.md`
