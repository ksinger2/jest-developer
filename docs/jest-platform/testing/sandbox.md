# Testing with sandbox users

## Test uploaded builds with sandbox users

Sandbox users are real, logged-in Jest accounts created from the Developer Console. Use them to test an uploaded build of your game inside the live Jest.com platform as a logged-in player. Sandbox users only see your team's games (games your developer account can access).

## Create a sandbox user

1. Open the Developer Console.
2. In the left sidebar navigation, select Sandbox Users.
3. Select Create Sandbox User.

## Log in as a sandbox user

1. In the Developer Console, go to Sandbox Users.
2. Select Generate Login Link for the user you want.
3. Open the link in a browser.

A small "Sandbox user" overlay at the top of the page indicates you are in sandbox mode.

## What you can do with sandbox users

Sandbox users are best suited for testing platform-backed features against an uploaded version of your game. From the Developer Console, you can also inspect and manage a sandbox user while you test:

- Inspect scheduled notifications and see what arrives in the sandbox user's inbox
- Test purchase flows end-to-end without being charged (prices show as 0)
- Reset the user state to re-test first-time or onboarding flows

## Good for

- End-to-end testing of SDK features on the real platform with an uploaded build
- Testing flows that require a logged-in user (registration gates, player identity, persistent state)
- Verifying that platform features behave correctly (notifications, payments, redirects)
- Debugging issues that only show up in the real hosted environment (embedding, platform UI, mobile viewport behaviors)

## Not good for

- Iterating quickly on local UI/logic (use local mocks)
- Testing local code inside Jest.com without uploading a new build (use the hosted emulator)
