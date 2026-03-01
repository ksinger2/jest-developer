# Manage games

The Developer Console allows you to create and manage your Jest games. After creating a game, you can control how it appears on the platform, upload and manage builds, configure in-game products, manage images, and access analytics and security credentials.

## Create a game

To create a new game:
1. Open the Jest Developer Console and log in.
2. Select Games from the left-hand navigation and click Create New Game.
3. Enter a Game Name and a Game Slug. The slug determines your game's URL: `https://jest.com/g/<game-slug>`. The game slug cannot be changed after creation.
4. (Optional) Provide additional properties:
   - Description – A short summary of your game.
   - Card Color – The color of your game card in the Explore and Library sections.
5. Set the Visibility:
   - Hidden – The game is not visible to users.
   - Visible – The game can appear on the platform.
6. Click Create Game.

## Configuring game properties

You can edit your game's properties at any time from the Overview tab. Properties include:
- Game name
- Description – Displayed in the Explore section
- Logo – A square image that represents your game across the platform.
- Hero image – A wide banner image that represents the game on the platform.

## Submit a game for review

Before your game can go live, it must be submitted for review and approved.

### Before you submit

You must upload and activate at least one build in the Versions tab before submitting your game for review.

### Submit for review

1. Navigate to Games > Manage Game.
2. Open the Overview tab.
3. Click Edit.
4. Scroll to the bottom of the page.
5. Select Submit for Review.

Once submitted, the game status changes to In Review.

### Review outcome

- **Approved** – Your game goes live on the Jest platform.
- **Rejected** – Your game remains unpublished, and a reason for the decision is provided.

A game is displayed on the Jest platform only when it is both approved and marked as Public. If your game is approved but still set to Hidden, it will not appear on the platform. If rejected, you can make the necessary updates and resubmit for review.

## Updating a live game

After your game has been approved and is live, future updates (such as new builds or game property changes) are subject to ongoing review. These reviews are non-blocking - you can continue updating and deploying builds without waiting for additional approval.

## Events

The Events tab provides visibility into moderation actions and runtime errors related to your game.

### Moderation

Lists notifications that were blocked due to content policy violations. Use this section to:
- Identify blocked notifications
- Understand why they were blocked
- Adjust your content or validation logic accordingly

### Errors

Lists error-related events for your game. Errors may appear at the notification level when validating the imageReference parameter. Possible error types:
- The provided reference does not exist.
- The referenced image has not passed review.
- The referenced image has been archived.

## Secrets

The Secrets tab provides access to your game's credentials:
- **Shared Secret** – Used to authenticate your game server with the Jest API and verify requests. You can regenerate this value if needed.
- **Upload Token** – Used to upload builds programmatically via the upload API.

Keep these credentials secure and never expose them in client-side code.

## Players

The Players tab lets you look up an individual player's state by their player ID. Useful for customer support. Requires at least a Viewer role on the game's team.

## Analytics

The Analytics tab provides high-level performance insights: daily active users (DAU), new users, and retention.
