# Manage builds

The Jest Developer Console allows you to upload and manage game builds. Each uploaded build is stored as a version, and you can control which version is active. You must create a Jest game before uploading a build.

## Upload a build (web interface)

1. Open the Jest Developer Console and log in.
2. Navigate to Games, then select your game, then click Manage Game.
3. Open the Versions tab and click Upload New Version.
4. Enter a new version number (for example, 1.0.0).
5. Select Choose File and upload a .zip archive containing your build files.
6. (Optional) Enable automatic activation if you want this version to become active immediately.
7. Click Create Version to upload the build.

> Note: When a version is set as Active, it is served to users. If your game is set to Hidden, it will not appear in the Jest platform Explore or Library sections - even if a build is active.

## Preview a build

If you want to test a specific version of a build, you can select the Preview link. This allows you to test a specific build without releasing it to your player base.

## Upload a build programmatically

You can upload builds programmatically (for example, from a CI/CD pipeline) using the upload API and your game's Upload Token.

### Get your Upload Token

1. Open Games > Manage Game
2. Navigate to Secrets
3. Copy the Upload token

Keep this token secure. It authorizes build uploads for your game.

### API endpoint

```
POST /api/management/games/:id/upload-build
```

Replace :id with your game ID.

### Headers

- `x-build-version` (required): the version string (e.g., "1.0.0")
- `x-game-upload-token` (required): Your game's Upload Token

### Request body (multipart/form-data)

- `file` (required): The .zip archive containing your game build
- `isActive` (optional): "true" or "false"; defaults to "false"

### Example

```bash
curl -X POST https://jest.com/api/management/games/GAME_ID/upload-build \
  -H "x-build-version: 1.0.0" \
  -H "x-game-upload-token: YOUR_TOKEN" \
  -F "file=@build.zip" \
  -F "isActive=true"
```
