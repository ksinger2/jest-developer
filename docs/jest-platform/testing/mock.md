# Testing locally with mocks

## Run locally in mock mode

Jest is a hosted gaming platform. On Jest.com, your game runs inside the platform and the Jest SDK communicates to the platform to fetch player/session context and perform platform-backed actions (such as reading player data, scheduling notifications, or starting purchase flows).

When you run the game on localhost (or anywhere outside jest.com), the SDK automatically switches into mock mode. In mock mode, platform calls are handled in-process so you can simulate platform state and responses while you iterate.

In mock mode, a JestSDK button appears in the top-right corner of the game. Click it to open the debug menu and interact with the platform mocks: edit player state and entry payloads, and simulate notifications and in-app purchases.

## Good for

- Iterating quickly without needing a live platform environment
- Developing and debugging SDK-dependent UI flows (onboarding/login gates, entry payload handling, player-data-driven screens)
- Forcing edge cases on demand (logged out vs logged in, missing or invalid data, errors) to validate your handling
- Reproducing scenarios deterministically when debugging game logic that depends on platform state

## Not good for

- Validating real platform behavior and configuration (auth/login UX, real player identity, product configuration, notification delivery)
- Catching issues that only appear inside Jest.com (embedding, redirects, permissions, platform UI interactions)
- Measuring production-like performance, latency, or reliability
- Getting end-to-end confidence that your uploaded build works on Jest.com

Use mock mode for day-to-day development, then validate on Jest.com with the hosted emulator and sandbox users.
