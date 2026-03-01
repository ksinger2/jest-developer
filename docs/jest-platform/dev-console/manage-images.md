# Manage images

Developers can use the Image Library to upload and manage game images used in notifications. Images are managed in the Jest Developer Console.

Navigate to: Games > Your Game > Image Library tab.

## Add a new image

1. Select the Image Library tab.
2. Click Add Image in the top-right corner.
3. Enter a Reference - a unique string used to identify this image when scheduling notifications.
4. Select a file from your local machine.
5. Click Create Image to confirm.

The image will appear with a status of Pending, indicating it has been submitted for review.

## Image approval process

All uploaded game images must be approved before they can be used in notifications. Statuses:
- **Pending** – Under review.
- **Pass** – Approved and can be used.
- **Fail** – Rejected and cannot be used. A reason is provided.

If an image fails review, you may upload a new image, which will automatically be submitted for approval.

## Remove (archive) an image

Click the Archive icon at the end of the row.

> Note: Archived images are immediately unavailable for use in notifications. Make sure to remove or update any references to the image in your game.

## Use an image in notifications

Pass the image's Reference as the imageReference parameter when calling scheduleNotification():

```js
JestSDK.notifications.scheduleNotification({
  title: "Daily Reward",
  body: "Your reward is ready!",
  imageReference: "daily_reward_banner",
});
```

If the imageReference is invalid or the image status is not Pass, the notification will not be scheduled.
