# Testing with the Jest hosted emulator

## Run a local build inside Jest.com

The hosted emulator lets you load your game from a local URL while still running inside the real Jest.com platform shell. Use it when you want to exercise the real platform integration with your local dev server (instead of using local mocks).

To use the hosted emulator, start your game locally (for example at http://localhost:3000), then open your game on Jest.com with the host query parameter:

```
/g/<your-game-slug>?host=http://localhost:3000
```

This feature is only enabled when you're logged in and your account is a developer on that game. Otherwise, the host parameter is ignored and Jest.com loads the uploaded version.

## Good for

- Verifying real platform integration while iterating locally (SDK initialization, session/player context, entry payloads)
- Testing platform-backed flows end-to-end with your local UI (registration gates, purchases, notifications, redirects)
- Catching differences between mock mode and real platform behavior earlier (timing, error shapes, platform UI interactions)
- Debugging issues that only appear when running inside the Jest.com container (embedding, viewport/safe-area quirks, navigation)

## Not good for

- Working offline or when Jest.com is unavailable (use local mocks)
- Sharing a reproducible link with someone who is not a developer on the game (Jest.com will ignore the host parameter for them)
- Measuring performance or production parity (local dev servers, caching, and network conditions differ)
- Validating your final uploaded build and release configuration (still test the deployed version before shipping)

If you want to test an uploaded build as a logged-in player, use sandbox users.
