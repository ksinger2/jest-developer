# Gameplay requirements

In addition to technical requirements, games published on Jest must meet the following gameplay requirements.

## Guest mode

Jest allows players to start playing as guests before signing up. Your game must support gameplay without a signed-in account and prompt players to sign in or register at appropriate moments. Guest accounts have the following limitations:

- Guests cannot receive notifications, so notifications must not be scheduled for them.
- Guests cannot make purchases.
- You can retain state for guest players. When a guest registers, their progress will be transferred to their signed-in account.

## Prompting players to register / sign in

Prompt players to register or sign in at appropriate moments in gameplay. For example, you might prompt them when they reach a certain level or attempt to access a feature that benefits from notifications.

## Notification-driven re-engagement mechanics

To make effective use of Jest's messaging-based retention features, your game should include re-engagement mechanics that give players a clear reason to return after a period of inactivity. These mechanics should be surfaced through notifications and resolved in-game on return. Examples include appointment mechanics, time-limited events, daily rewards, or other incentives tied to the player's in-game state.

## No rewarded ads

Jest does not currently support rewarded ads. Games must not include mechanics that rely on rewarded ads for progression, rewards, or other gameplay elements. Consider alternative monetization strategies that are supported on Jest, such as in-app purchases (IAP).

> Note: We are actively working on adding in-app advertising (IAA) as a monetization option on Jest. If you are interested in early access to upcoming advertising capabilities, please get in touch with us.
