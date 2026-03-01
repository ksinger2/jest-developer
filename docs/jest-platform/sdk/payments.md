# Payments

The Jest platform allows developers to sell in-game products using the payments SDK methods. Jest handles checkout with the player, while your game is responsible for granting the purchased items and confirming the purchase.

## Jest Tokens

Players purchase Jest Tokens on the Jest platform (1 token = $1 USD) and use them to buy in-game products. As a developer, you define the products and prices available in your game. When your game calls beginPurchase, Jest handles checkout and ensures the player has sufficient tokens, prompting them to purchase more if needed.

> Note: Product prices (products[].price) and purchase totals (purchase.credits) are denominated in Jest Tokens. In PurchaseData, the token amount field is named credits.

> Note: When using a sandbox user, product prices are automatically discounted to 0, allowing you to test purchases without spending Jest Tokens.

## Purchase lifecycle

A purchase represents a single successful checkout of a product by a specific player.

1. Display available products to the player (via getProducts()).
2. Start checkout by calling beginPurchase({ productSku }).
3. If checkout succeeds, the SDK returns an incomplete purchase containing a purchaseToken.
4. Grant the purchased item in your game, then confirm the purchase by calling completePurchase({ purchaseToken }).
5. Until completed, the purchase remains incomplete and will continue to be returned by getIncompletePurchases() (for example, after a crash).

Checkout cancellation and error handling are managed by your game.

## How to use the SDK

### Set up products

Set up and price products using the Jest Developer Console. For more information, see Manage products.

### List products (getProducts)

```ts
const products = await JestSDK.payments.getProducts();
```

Products include:
| Property | Note |
|----------|------|
| sku | Product identifier, configured in Developer Console |
| name | Display name shown during checkout |
| description | Nullable short description shown during checkout |
| price | Price in Jest Tokens |

### Start a purchase (beginPurchase)

Call beginPurchase with the sku of a product returned by getProducts().

Returns one of:

**Success** `{ result: "success"; purchase: PurchaseData; purchaseSigned: string }`
Checkout completed successfully. The returned purchase is incomplete and must be granted and confirmed.

**Cancellation** `{ result: "cancel" }`
The player canceled the checkout flow.

**Error** `{ result: "error"; error: string }`
Error codes:
- `login_required` — Player not logged in. Platform will prompt login.
- `internal_error` — Transient error. May retry.
- `invalid_product` — SKU not available. Do not retry with same SKU.

> Note: beginPurchase may also throw (e.g., timeout). Treat thrown errors as retryable.

### Grant and confirm a purchase (completePurchase)

When beginPurchase returns success:
1. Grant the purchased product to the player.
2. Confirm by calling `completePurchase({ purchaseToken })`.

> Warning: Only call completePurchase AFTER you have durably granted the purchase. If you confirm first and crash before granting, getIncompletePurchases() cannot recover because it's already confirmed.

completePurchase returns:
- Success: `{ result: "success" }`
- Error: `{ result: "error"; error: "internal_error" | "invalid_token" }`
  - `internal_error`: retry
  - `invalid_token`: don't retry with same token

> Tip: Use purchase.purchaseToken as an idempotency key to prevent double grants.

### Recover incomplete purchases (getIncompletePurchases)

Your game must check for incomplete purchases every time it starts and after login. This makes purchases resilient to crashes, power loss, and network failures.

> Note: getIncompletePurchases and completePurchase require a registered player. If guest, skip recovery and retry after login.

The response is capped (currently 50 purchases per call). If hasMore is true, confirm the returned purchases and call again until it is false.

## Signed purchase data (JWT)

beginPurchase and getIncompletePurchases return purchase data in two forms:
- As plain objects (purchase / purchases) for convenience.
- As signed tokens (purchaseSigned / purchasesSigned) as a signed JSON Web Token (JWT).

For critical actions (granting items, crediting accounts), you must only trust the signed token after verifying its signature.

### Shared secret

Each game has a shared secret configured in the Developer Console (Games > Secrets). This secret is base64-encoded and must be kept confidential.

> Warning: If the shared secret is ever leaked, rotate it immediately.

### Payload shapes

**PurchaseData:**
```ts
{
  purchaseToken: string;    // Required to call completePurchase
  productSku: string;       // The product purchased
  credits: number;          // Transaction value in Jest Tokens
  createdAt: number;        // JS timestamp (ms since epoch)
  completedAt: number | null; // null until confirmed
}
```

**Signed JWT from beginPurchase (purchaseSigned):**
```ts
{ purchase: PurchaseData; aud: string; sub: string; }
```

**Signed JWT from getIncompletePurchases (purchasesSigned):**
```ts
{ purchases: PurchaseData[]; aud: string; sub: string; }
```

### Verifying and decoding (server-side)

Use a standard JWT/JWS library on your backend to verify the token signature. Validate:
- `aud` (audience): your game ID (from Developer Console)
- `sub` (subject): the player ID (from JestSDK.getPlayer())

Server-side verification examples available in Node.js using jose library.
