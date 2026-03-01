# Entry payload

Games can be launched with an entry payload attached to the link used to enter the game. The entry payload is arbitrary metadata that is made available to the game on startup.

Entry payloads enable a range of use cases, such as:
- Carrying over onboarding choices into the full game (for example, a chosen name or cosmetic option).
- Encoding referral or invite information, such as which player sent an invite and for which feature. This allows games to reward players for successful invitations.

## JestSDK.getEntryPayload()

Returns the entry payload provided when the game was launched, or an empty object if no payload was supplied.

```ts
JestSDK.getEntryPayload(): { [key: string]: unknown };
```

Example:
```js
await JestSDK.init();
const entryPayload = JestSDK.getEntryPayload();
const difficulty = entryPayload.difficulty ?? "normal";
const debugMode = entryPayload.mode === "debug";
console.log("Entry payload:", entryPayload);
```

## Test entry payload

You can test entry payload handling during development by passing an encoded payload via the URL:

```
npm run dev
open http://localhost:5173/?entryPayload=%7B%22difficulty%22:%22hard%22%7D
```
