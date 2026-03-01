# Notifications

Jest allows developers to schedule notification messages to re-engage players and drive retention. Using the Jest SDK, you can customize a notification's text, call to action (CTA), and image. The Jest platform handles messaging infrastructure and delivery, subsidizing 100% of messaging costs and abstracting away operational complexity. This includes managing regulated messaging requirements such as consent collection, required disclosures, and robust opt-out mechanisms.

For guidance on designing effective notification strategies, copywriting, and scheduling patterns, see Notifications best practices.

## Notification channels

There are two notification delivery channels on Jest: the platform Library tab and SMS / RCS text messages.

### Library tab

When your game is Approved and set to Public, all scheduled notifications appear in the Jest platform Library tab.

### SMS / RCS messages

Jest may also deliver notifications via SMS or RCS. Channel selection is based on availability and the user's messaging settings.

## Notification mechanics

Jest games use the Jest SDK notification methods to schedule notifications. At the scheduled time, notifications are shown in the Library tab on Jest.com. Once per day, Jest selects at most one scheduled notification per user across all games on the platform to deliver to the user's messaging inbox. The platform selects the notification most likely to convert, taking into account the priority provided by the SDK.

Delivery time is determined per user based on the scheduled time defined by the game and observed engagement patterns, while respecting compliance requirements. Messages are delivered via SMS or RCS, depending on availability and user preferences.

## Notifications API

> Note: The Jest platform will only send notifications to registered users. You can check a user's status with JestSDK.getPlayer() and prompt players to log in via the SDK.

### JestSDK.notifications.scheduleNotification

To schedule a notification, use this method. Notifications can only be scheduled up to 7 days ahead.

- `scheduledInDays` must be between 1 and 7 days (inclusive)
- `scheduledAt` must be within the next 7 days
- Values outside these ranges throw an INVALID_ARGUMENTS error

**Two scheduling modes:**
- **Exact scheduling** using `scheduledAt` — ensures the notification becomes eligible for delivery after the specified date and time. Note that delivery is not guaranteed at the exact scheduled moment, as messaging must comply with mandated quiet hours and other delivery constraints.
- **Fuzzy scheduling** using `scheduledInDays` — schedules a notification 1 to 7 days from now and allows the platform to determine an appropriate delivery time for each user.

```ts
JestSDK.notifications.scheduleNotification({
  scheduledAt?: Date;           // Exact datetime (within next 7 days)
  scheduledInDays?: number;     // 1-7 days from now (fuzzy)
  // Either scheduledAt OR scheduledInDays must be provided, but not both

  identifier: string;           // Unique ID; reusing an ID replaces the previous notification
  priority?: 'low' | 'medium' | 'high';  // Default: 'medium'
  imageReference?: string;      // Pre-approved image from Developer Console
  body: string;                 // Main notification text
  ctaText: string;              // Button text
  entryPayload?: { [key: string]: string };  // Custom data passed back to game on open
});
```

- If you schedule a notification with an existing identifier, the original is replaced.
- Images must be uploaded and approved in the Developer Console before use.
- If imageReference is invalid/unapproved/archived, the notification will not be scheduled.
- If no image is set, the game's Hero image is used.

### JestSDK.notifications.unscheduleNotification

```ts
JestSDK.notifications.unscheduleNotification({
  identifier: "my_notification_id",
});
```

## Error handling

scheduleNotification and unscheduleNotification can throw an INVALID_ARGUMENTS error if the provided arguments do not match the required schema.

Notifications may also be blocked due to:
- Invalid or unapproved image references
- Content that violates platform moderation rules

Blocked notifications are logged in the Events > Moderation or Events > Errors tabs in the Developer Console. End users do not see internal error codes.

## Moderation and delivery constraints

Notifications are subject to platform review and moderation. Content that violates the Acceptable Use Policy may be blocked from delivery. See Review and moderation for details.
