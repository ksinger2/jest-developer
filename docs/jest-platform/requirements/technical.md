# Technical requirements

Before starting integration, ensure your game meets Jest's technical requirements.

## Web build

Since Jest is a web-based platform, all published games must be playable in a web browser. The steps for creating a web build depend on your game's technology stack, but most game engines support exporting to WebGL or WebGPU. Refer to your engine's documentation for engine-specific instructions.

## Mobile-friendly

Mobile phones are the primary devices used to play games on Jest. Your game must be optimized for mobile, including support for touch input, a responsive layout that adapts to different screen sizes, and performance suitable for a range of mobile hardware.

## Optimal loading times

Web-based games do not have an explicit installation phase, so the first run includes downloading all required assets and starting the game. To reduce player churn, minimize your game's initial load time.

### Minimize build size

Use high compression settings for assets where possible (for example, .webp or .avif images and mono audio for sound effects). Use appropriate dimensions for all assets.

### Optimize loading sequence

Load only the assets required for the initial scene to make the game interactive as quickly as possible. For example, in a match-three game that starts in the main menu, load only main-menu assets on startup. Once the main menu is shown, asynchronously load assets required for gameplay.

## Do not load external assets

All assets required by your game must be included in the uploaded build archive. Requests to third-party servers are restricted on the Jest platform, so assets must not be loaded from external sources.

## Load assets from relative paths

Each build uploaded to Jest is hosted on a CDN subdomain and within a subdirectory. All asset paths must be relative to index.html, for example assets/myImage.jpg. Do not use absolute paths such as /assets/myImage.jpg.

## Do not rely on URL parameters or location

To pass custom data into your game, use the entry payload mechanism. entryPayload is a JSON-encoded parameter set on the game page. Arbitrary URL parameters are not available on the Jest platform, except for marketing-related UTM tags. Additionally, the URL exposed via window.location is not guaranteed to be consistent and should not be relied on.
