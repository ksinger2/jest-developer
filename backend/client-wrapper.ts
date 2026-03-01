/**
 * Gem Clash - Client-Side Purchase Verification Wrapper
 *
 * Call this from the game client after Jest's `beginPurchase()` succeeds.
 * It sends the signed JWT to our Cloudflare Worker for server-side
 * verification before the game grants any items to the player.
 *
 * Usage:
 *   import { verifyPurchaseOnServer } from "./client-wrapper";
 *
 *   const result = await sdk.payments.beginPurchase({ sku: "gc_moves_3" });
 *   if (result.result === "success") {
 *     const verification = await verifyPurchaseOnServer(
 *       result.purchaseSigned,
 *       "gc_moves_3",
 *       currentPlayerId
 *     );
 *     if (verification.valid) {
 *       grantItem(verification.purchase);
 *       await sdk.payments.completePurchase(verification.purchase.purchaseToken);
 *     } else {
 *       showError(verification.error);
 *     }
 *   }
 */

// -- Types (mirrored from worker for client-side use) -----------------------

interface PurchaseData {
  purchaseToken: string;
  productSku: string;
  credits: number;
  createdAt: number;
  completedAt: number | null;
}

interface VerifySuccess {
  valid: true;
  purchase: PurchaseData;
}

interface VerifyFailure {
  valid: false;
  error: string;
}

type VerifyResult = VerifySuccess | VerifyFailure;

// -- Configuration ----------------------------------------------------------

/**
 * Replace with your deployed worker URL.
 * For local development, use: http://localhost:8787
 */
const WORKER_URL =
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  (typeof __WORKER_URL__ !== "undefined" && __WORKER_URL__) ||
  "https://gem-clash-verify.<YOUR_SUBDOMAIN>.workers.dev";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Sends the signed purchase JWT to our verification worker and returns the
 * result. The game should ONLY grant items when `result.valid === true`.
 *
 * @param signedToken - The `purchaseSigned` string from `beginPurchase()`
 * @param expectedSku - The SKU the client expects was purchased
 * @param expectedPlayerId - The authenticated player's ID
 * @returns Verification result with purchase data on success
 */
export async function verifyPurchaseOnServer(
  signedToken: string,
  expectedSku: string,
  expectedPlayerId: string
): Promise<VerifyResult> {
  try {
    const response = await fetch(`${WORKER_URL}/verify-purchase`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: signedToken,
        expectedSku,
        expectedPlayerId,
      }),
    });

    // Network-level errors (5xx, unexpected status).
    if (!response.ok && response.status !== 403 && response.status !== 429) {
      return {
        valid: false,
        error: `Verification service returned HTTP ${response.status}`,
      };
    }

    const data: VerifyResult = await response.json();
    return data;
  } catch (err: unknown) {
    // Network failure, DNS error, etc.
    const message = err instanceof Error ? err.message : "Unknown error";
    return {
      valid: false,
      error: `Network error contacting verification service: ${message}`,
    };
  }
}

// ---------------------------------------------------------------------------
// Full purchase flow helper (convenience)
// ---------------------------------------------------------------------------

/**
 * Higher-level wrapper that ties together: begin -> verify -> grant -> complete.
 *
 * @param sdk - The Jest SDK instance (must expose payments.beginPurchase / completePurchase)
 * @param sku - Product SKU to purchase
 * @param playerId - Current player ID
 * @param onGrant - Callback invoked with verified PurchaseData so the game can
 *                  grant the item locally. Called BEFORE completePurchase so the
 *                  player sees the item immediately.
 * @returns The final PurchaseData, or throws on any failure.
 */
export async function purchaseAndVerify(
  sdk: {
    payments: {
      beginPurchase(opts: { sku: string }): Promise<{
        result: string;
        purchase?: PurchaseData;
        purchaseSigned?: string;
      }>;
      completePurchase(token: string): Promise<void>;
    };
  },
  sku: string,
  playerId: string,
  onGrant: (purchase: PurchaseData) => void
): Promise<PurchaseData> {
  // 1. Begin the purchase through Jest's payment UI.
  const purchaseResult = await sdk.payments.beginPurchase({ sku });

  if (purchaseResult.result !== "success" || !purchaseResult.purchaseSigned) {
    throw new Error(
      `Purchase flow did not succeed: ${purchaseResult.result}`
    );
  }

  // 2. Verify the signed JWT server-side.
  const verification = await verifyPurchaseOnServer(
    purchaseResult.purchaseSigned,
    sku,
    playerId
  );

  if (!verification.valid) {
    throw new Error(`Purchase verification failed: ${verification.error}`);
  }

  // 3. Grant the item in-game (optimistic, before completePurchase round-trip).
  onGrant(verification.purchase);

  // 4. Finalise the purchase on the Jest platform.
  await sdk.payments.completePurchase(verification.purchase.purchaseToken);

  return verification.purchase;
}
