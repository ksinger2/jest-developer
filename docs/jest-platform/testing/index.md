# Testing your game

There are three primary ways to test your Jest SDK integration:

1. **Testing locally with mocks** — Best for day-to-day local development; no platform required. Use the JestSDK debug menu to adjust player state and simulate platform responses.

2. **Testing with the hosted emulator** — Load your local dev server inside the live Jest.com platform shell by appending `?host=http://localhost:3000` to the game URL. Useful for testing the real platform integration without uploading a new build.

3. **Sandbox users** — Test an uploaded build on Jest.com using a logged-in sandbox account. Useful for end-to-end validation of platform-backed features (notifications, payments, persistence) and for inspecting/resetting user state in the Developer Console.

In practice, most teams iterate locally in mock mode, then optionally use the hosted emulator for integration testing, and finally validate an uploaded build with sandbox users. Developers can also preview a specific uploaded build using their own account via the version preview link before releasing.
