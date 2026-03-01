/**
 * Gem Clash - JWT Purchase Verification
 *
 * Decodes and validates signed purchase JWTs from the Jest platform.
 * Uses the `jose` library which is fully compatible with Cloudflare Workers
 * (no Node.js crypto dependency -- uses WebCrypto under the hood).
 */

import { jwtVerify, type JWTPayload } from "jose";

import {
  type Env,
  type JwtPayload,
  type PurchaseData,
  type VerifyRequest,
  type VerifyResponse,
  ALLOWED_SKUS,
  MAX_PURCHASE_AGE_MS,
} from "./types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Import the base64-encoded shared secret into a CryptoKey suitable for
 * HMAC-SHA256 verification via the `jose` library.
 */
async function importSecret(base64Secret: string): Promise<Uint8Array> {
  const binaryString = atob(base64Secret);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Type-guard: ensure the decoded JWT payload has the shape we expect from
 * the Jest platform (`purchase`, `aud`, `sub`).
 */
function isJestPayload(
  payload: JWTPayload
): payload is JWTPayload & JwtPayload {
  if (typeof payload.sub !== "string") return false;
  if (typeof payload.aud !== "string") return false;
  const p = (payload as Partial<JwtPayload>).purchase;
  if (!p || typeof p !== "object") return false;
  if (typeof p.purchaseToken !== "string") return false;
  if (typeof p.productSku !== "string") return false;
  if (typeof p.credits !== "number") return false;
  if (typeof p.createdAt !== "number") return false;
  if (p.completedAt !== null && typeof p.completedAt !== "number") return false;
  return true;
}

// ---------------------------------------------------------------------------
// Main verification function
// ---------------------------------------------------------------------------

export async function verifyPurchase(
  request: VerifyRequest,
  env: Env
): Promise<VerifyResponse> {
  const { token, expectedSku, expectedPlayerId } = request;

  // ---- 1. Decode & verify JWT signature (HMAC-SHA256) ---------------------

  let payload: JWTPayload;
  try {
    const secret = await importSecret(env.JEST_SHARED_SECRET);
    const result = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });
    payload = result.payload;
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "unknown verification error";
    return { valid: false, error: `JWT verification failed: ${message}` };
  }

  // ---- 2. Validate payload shape ------------------------------------------

  if (!isJestPayload(payload)) {
    return { valid: false, error: "JWT payload does not match expected Jest purchase shape" };
  }

  const { purchase } = payload;

  // ---- 3. Audience (game ID) check ----------------------------------------

  // `jose` normalises `aud` to string | string[]. The Jest SDK sets it as a
  // plain string, but we handle both for safety.
  const audiences = Array.isArray(payload.aud)
    ? payload.aud
    : [payload.aud as string];

  if (!audiences.includes(env.JEST_GAME_ID)) {
    return {
      valid: false,
      error: `Audience mismatch: expected ${env.JEST_GAME_ID}`,
    };
  }

  // ---- 4. Subject (player ID) check --------------------------------------

  if (payload.sub !== expectedPlayerId) {
    return {
      valid: false,
      error: "Player ID mismatch: JWT sub does not match expectedPlayerId",
    };
  }

  // ---- 5. SKU checks ------------------------------------------------------

  if (purchase.productSku !== expectedSku) {
    return {
      valid: false,
      error: `SKU mismatch: JWT contains ${purchase.productSku}, expected ${expectedSku}`,
    };
  }

  if (!ALLOWED_SKUS.has(purchase.productSku)) {
    return {
      valid: false,
      error: `Unknown SKU: ${purchase.productSku} is not in the allowed list`,
    };
  }

  // ---- 6. Not already completed -------------------------------------------

  if (purchase.completedAt !== null) {
    return {
      valid: false,
      error: "Purchase has already been completed (completedAt is not null)",
    };
  }

  // ---- 7. Freshness / replay-attack guard ---------------------------------

  const now = Date.now();
  const age = now - purchase.createdAt;

  if (age < 0) {
    return { valid: false, error: "Purchase createdAt is in the future" };
  }

  if (age > MAX_PURCHASE_AGE_MS) {
    return {
      valid: false,
      error: `Purchase is too old (${Math.round(age / 1000)}s). Max allowed: ${MAX_PURCHASE_AGE_MS / 1000}s`,
    };
  }

  // ---- All checks passed --------------------------------------------------

  return { valid: true, purchase };
}
