# Gem Clash -- Purchase Verification Backend

Cloudflare Worker that verifies signed JWT purchase tokens from the Jest
platform before the game client grants items to a player.

## Architecture

```
Player buys item              Game client                 This worker
      |                           |                           |
      |-- beginPurchase() ------->|                           |
      |<--- purchaseSigned JWT ---|                           |
      |                           |-- POST /verify-purchase ->|
      |                           |     { token, sku, pid }   |
      |                           |<-- { valid, purchase } ---|
      |                           |                           |
      |  (grant item locally)     |                           |
      |                           |-- completePurchase() ---->| (Jest API)
```

Single endpoint: `POST /verify-purchase`

## Prerequisites

- Node.js >= 18
- A Cloudflare account with Workers enabled
- `wrangler` CLI (installed as a dev dependency, or globally)
- Your Jest Developer Console credentials:
  - **Shared secret** (base64-encoded HMAC key) -- Games > Secrets
  - **Game ID**

## Setup

```bash
cd backend/worker
npm install
```

### Create the KV namespace for rate limiting

```bash
npx wrangler kv namespace create RATE_LIMITER
```

Copy the returned `id` into `wrangler.toml` replacing `REPLACE_WITH_KV_NAMESPACE_ID`.

### Set secrets

```bash
npx wrangler secret put JEST_SHARED_SECRET
# Paste the base64-encoded secret from Jest Developer Console

npx wrangler secret put JEST_GAME_ID
# Paste your game's ID
```

## Local Development

```bash
npm run dev
```

This starts a local dev server at `http://localhost:8787`. You will need to
provide the secrets via a `.dev.vars` file (git-ignored):

```
# backend/worker/.dev.vars
JEST_SHARED_SECRET=base64encodedkey==
JEST_GAME_ID=your-game-id
```

For local KV, wrangler automatically creates a local SQLite store.

## Deploy

```bash
npm run deploy
```

The worker will be available at:
`https://gem-clash-verify.<your-subdomain>.workers.dev/verify-purchase`

## Monitoring

```bash
npm run tail
```

Every verification attempt is logged as structured JSON with:
- timestamp, outcome (success/failure), purchaseToken, detail, client IP

Connect Cloudflare Logpush for long-term storage.

## Endpoint Reference

### POST /verify-purchase

**Request body:**
```json
{
  "token": "<purchaseSigned JWT from beginPurchase()>",
  "expectedSku": "gc_moves_3",
  "expectedPlayerId": "player-uuid"
}
```

**Success (200):**
```json
{
  "valid": true,
  "purchase": {
    "purchaseToken": "tok_abc123",
    "productSku": "gc_moves_3",
    "credits": 100,
    "createdAt": 1700000000000,
    "completedAt": null
  }
}
```

**Failure (403):**
```json
{
  "valid": false,
  "error": "Player ID mismatch: JWT sub does not match expectedPlayerId"
}
```

**Rate limited (429):**
```json
{
  "valid": false,
  "error": "Rate limit exceeded. Try again shortly."
}
```

### Validation checks (in order)

1. JWT signature (HMAC-SHA256)
2. Payload shape matches Jest PurchaseData
3. `aud` matches JEST_GAME_ID
4. `sub` matches expectedPlayerId
5. `purchase.productSku` matches expectedSku
6. `purchase.productSku` is in allowed SKU list
7. `purchase.completedAt` is null
8. `purchase.createdAt` is within last 10 minutes

## Client Integration

See `client-wrapper.ts` for the game-side wrapper. Quick usage:

```typescript
import { verifyPurchaseOnServer } from "./client-wrapper";

const result = await verifyPurchaseOnServer(purchaseSigned, "gc_moves_3", playerId);
if (result.valid) {
  grantMoves(3);
  await sdk.payments.completePurchase(result.purchase.purchaseToken);
}
```

## Allowed SKUs (Phase 1)

| SKU                | Description       |
|--------------------|--------------------|
| `gc_moves_3`       | 3 extra moves     |
| `gc_starter_pack`  | Starter pack      |
| `gc_lives_refill`  | Refill lives      |

To add new SKUs, update the `ALLOWED_SKUS` set in `src/types.ts`.
