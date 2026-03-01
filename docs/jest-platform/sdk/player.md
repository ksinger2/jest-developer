# Player

## Player identification and authentication

On the Jest platform, each user has a unique playerId per game. This identifier remains the same if a player starts as a guest and later registers, allowing you to track player progress and store player data.

### JestSDK.getPlayer()

Returns the current player identifier and indicates whether the player is registered or playing as a guest.

```ts
JestSDK.getPlayer(): {
  playerId: string;
  registered: boolean;
};
```

Example:
```js
const player = JestSDK.getPlayer();
if (!player.registered) {
  // Guest player: notifications cannot be scheduled
  // Consider prompting the player to register
} else {
  JestSDK.notifications.scheduleNotification({ /*...*/ });
}
```

### JestSDK.getPlayerSigned()

If your game has a backend, use this method to obtain a signed payload that can be sent to your server to authenticate the player and attach to authenticated requests.

```ts
JestSDK.getPlayerSigned(): Promise<{
  player: { playerId: string; registered: boolean };
  playerSigned: string; // JWS with { playerId: string; registered: boolean; iat: number }
}>;
```

The returned playerSigned value is a JSON Web Signature (JWS) signed using your game's shared secret with the HS-256 algorithm. You can use any standard JWS/JWT library on your backend to verify the signature and extract the player information.

The shared secret shown in the Developer Console is base64-encoded. Most JWT libraries expect the decoded key when verifying the signature.

The signed payload includes an issued-at (iat) timestamp that can be used to verify token freshness. Jest does not set an explicit expiration time; you may reject tokens older than a chosen threshold and have the client request a new token.

**Server-side verification examples available for:** Node.js, PHP, Ruby, Python, Java, C#

### JestSDK.login()

Use this method to prompt a guest player to register or sign in on the Jest platform.

```js
JestSDK.login({
  entryPayload: {
    // Data associated with the login entry (optional).
  },
});
```

This method triggers the Jest login and registration flow. Players complete the registration flow via SMS or RCS and are redirected back into the game. If provided, the entryPayload is passed back to the game on login.

## Player data

If your game does not have a backend, Jest provides a simple key-value store for per-player data. Player data is stored alongside the player record on the Jest platform and is persistent across sessions and devices. All values must be serializable to JSON.

> Note: Player data is written directly from the game client and must not be used to store sensitive information or data that requires strong security guarantees.

> Note: Player data is limited to 1 MB per game; if this limit is exceeded, further writes will fail until the stored data size is reduced.

### JestSDK.data.getAll()

Returns a snapshot of all key-value data stored for the current player.

```ts
JestSDK.data.getAll(): { [key: string]: unknown };
```

### JestSDK.data.get(key)

Returns the value stored for the given key in the player data, or undefined if the key does not exist.

```ts
JestSDK.data.get(key: string): unknown;
```

### JestSDK.data.set(data)

Merges the provided key-value pairs into the player data, setting multiple keys at once.

> Note: This method performs a shallow merge and does not replace existing data. To remove a key, use JestSDK.data.delete(key) or set its value to undefined.

```ts
JestSDK.data.set(data: { [key: string]: unknown }): void;
```

### JestSDK.data.set(key, value)

Sets the value for the given key in the player data. This is a shorthand for setting a single key.

```ts
JestSDK.data.set(key: string, value: unknown): void;
```

### JestSDK.data.delete(key)

Deletes the given key from the player data.

```ts
JestSDK.data.delete(key: string): void;
```

### JestSDK.data.flush()

Flushes any pending player data changes to the server. The SDK batches multiple updates to reduce network requests; calling this method ensures all pending changes are sent immediately.

```ts
JestSDK.data.flush(): Promise<void>;
```

> Important: Call flush() before navigating away or when data must be persisted immediately.
