# Notifications Guide

## Overview

Jest allows games to re-engage players through notifications delivered on the platform and, selectively, to the user's messaging inbox. This guide covers best practices for designing notification strategies on Jest, including scheduling patterns, reminder content, and attribution.

For API usage and implementation details, see the Notifications SDK documentation.

## How notifications work on Jest

1. Games schedule notifications using the Jest SDK.
2. Scheduled notifications always appear in the Library tab on Jest.com.
3. At most one notification per user per day across all games on the platform may also be delivered to the user's messaging inbox.
4. The platform selects which notification to deliver and when, taking into account notification priority, observed player behavior, delivery availability, and compliance requirements.

## Notification recommendations

### General guidelines

- Deeply integrate notifications with your game. Reference real in-game state (rewards waiting, time-limited events, progress).
- Keep notification text to 100 characters (SMS character limits).
- Only use basic characters. Emojis may get removed for SMS delivery.
- Do not mention the game's name (automatically shown by platform).
- Avoid sensitive content (SHAFT: Sex, Hate, Alcohol, Firearms, Tobacco - including gambling/drugs). Will be blocked.
- Avoid time-critical notifications. Texting has mandated quiet hours; messages may be delivered earlier or later.
- Schedule notifications generously for maximum impact. The platform handles delivery ensuring minimal spam.

### Scheduling recommendations

- When a user logs in for the first time, schedule daily notifications for D0-D7.
- Schedule reminders as soon as a registered user logs in.
- Use fuzzy scheduling (scheduledInDays) when timing within the day doesn't matter.
- Use exact scheduling (scheduledAt) for fixed events or deadlines.
- As players progress, replace generic reminders with progress-based notifications.
- When a player returns, unschedule queued notifications and replace with updated ones.

### Beware the Inbox Groundhog Day trap

When highly engaged users return daily, they may receive the same D1 reminder repeatedly. Solutions:
- **Tie notifications to player progress:** base notifications on actual player state so they naturally evolve.
- **Rotate through a notification bank:** cycle through a predefined pool of variants to prevent repetition.

## Notification content

### Ingredients of a compelling notification

- Make each notification feel fresh — small variations go a long way.
- Keep notifications short and intriguing — tease the experience, don't explain everything.
- Lead with emotional relevance — reference something the player cares about.

### Call to action (CTA)

Use strong verbs and direct language. Best CTAs are tied to game context: "Finish your next level," "Claim your reward," "Your puppy is hungry."

### Customization

Jest supports dynamic variables in messages. Onboarding inputs (player/character/pet names) can be reused in notifications via entryPayload. Always set default values for when no custom input is available.

## Notification analytics

Use the entryPayload field when scheduling notifications for analytics and attribution. Data passed in entryPayload is preserved when a player opens the game from a notification and can be accessed via JestSDK.getEntryPayload().

Recommended entryPayload fields:
- `notification_template` — for A/B testing different notifications
- `notification_offset` — for analyzing when players return (D1, D2, etc.)
