# Manage products

Jest allows you to sell in-game products using the payments SDK methods. Products are configured in the Developer Console and then retrieved in your game using JestSDK.payments.getProducts().

Navigate to: Games > Manage Game > Products

## How products work

Each product represents a purchasable item in your game. You define:
- **SKU** – A unique identifier used in your game code.
- **Name** – The display name shown during checkout.
- **Description** (optional) – A short description shown during checkout.
- **Price** – The cost in Jest Tokens (1 token = $1 USD).

When your game calls:
- `getProducts()` – The configured products are returned.
- `beginPurchase({ productSku })` – The player can purchase a specific SKU.

For details on the full purchase lifecycle, see Payments SDK documentation.

## Add a product

1. Click Create Product.
2. Enter: SKU (required), Name (required), Price in Jest Tokens (required), Description (optional).
3. Click Create Product.

> Note: The SKU cannot be changed after creation. If you need to modify a SKU, archive the existing product and create a new one.

## Edit a product

Click Edit next to the product. Update the name, description, or price. Save your changes. Price changes apply to future purchases only.

## Archive a product

Click Archive next to the product. Archived products:
- Are no longer returned by getProducts().
- Cannot be purchased.
- Do not affect past completed purchases.

If your game attempts to purchase an archived or invalid SKU, beginPurchase will return an invalid_product error.

## Testing purchases

When using a sandbox user, product prices are automatically discounted to 0, allowing you to test the full purchase flow without spending Jest Tokens.
