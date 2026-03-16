/**
 * Gem Link - JWT Purchase Verification Types
 *
 * Type definitions for the Jest platform payment verification flow.
 */

// -- Jest Platform Types --

export interface PurchaseData {
  purchaseToken: string;
  productSku: string;
  credits: number;
  createdAt: number;       // JS timestamp (ms since epoch)
  completedAt: number | null; // null until confirmed via completePurchase
}

export interface JwtPayload {
  purchase: PurchaseData;
  aud: string;  // Game ID
  sub: string;  // Player ID
  iat?: number;
  exp?: number;
}

// -- Worker Request / Response Types --

export interface VerifyRequest {
  token: string;
  expectedSku: string;
  expectedPlayerId: string;
}

export interface VerifySuccessResponse {
  valid: true;
  purchase: PurchaseData;
}

export interface VerifyErrorResponse {
  valid: false;
  error: string;
}

export type VerifyResponse = VerifySuccessResponse | VerifyErrorResponse;

// -- Worker Environment Bindings --

export interface Env {
  JEST_SHARED_SECRET: string;  // Base64-encoded HMAC-SHA256 shared secret
  JEST_GAME_ID: string;        // Our game's ID on the Jest platform
  RATE_LIMITER: KVNamespace;   // KV namespace for IP-based rate limiting
}

// -- Rate Limiting --

export interface RateLimitEntry {
  count: number;
  windowStart: number; // ms since epoch
}

// -- Allowed SKUs --

export const ALLOWED_SKUS: ReadonlySet<string> = new Set([
  "gl_moves_3",
  "gl_starter_pack",
  "gl_lives_refill",
]);

// -- Constants --

export const MAX_PURCHASE_AGE_MS = 10 * 60 * 1000; // 10 minutes
export const RATE_LIMIT_WINDOW_MS = 60 * 1000;      // 1 minute
export const RATE_LIMIT_MAX_REQUESTS = 100;          // per IP per window
