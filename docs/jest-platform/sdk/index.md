# Jest SDK

This section describes the Jest SDK and how to integrate it into your game. The Jest SDK is currently available in two flavors: HTML5 (JavaScript/TypeScript) and Unity (C#). This guide focuses on the HTML5 SDK.

## SDK initialization

1. Open your game's index.html file in your favorite code editor.
2. Add the Jest platform script before the closing `</head>` tag:

```html
<script src="https://cdn.jest.com/sdk/latest/jestsdk.js"></script>
```

3. Initialize the Jest SDK before calling any other SDK methods.

```js
// Initialize Jest
JestSDK.init().then(() => {
  // initialized
});
```

or using async/await:

```js
// Initialize Jest
await JestSDK.init();
```

## Using the SDK

The remainder of this guide walks through the SDK's modules and how to use them in your game. This includes retrieving player data and authenticating players, passing data into your game, scheduling and managing notifications, and using in-app payments. It also includes sharing your game with referral links and tracking conversions.

## Unity SDK

For Unity projects, see the Jest Unity SDK repository: https://github.com/jest-com/jest-unity-sdk
