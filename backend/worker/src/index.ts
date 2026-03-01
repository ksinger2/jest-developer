/**
 * Gem Clash - Purchase Verification Worker
 *
 * Cloudflare Worker that exposes a single POST /verify-purchase endpoint.
 * Validates signed JWT purchase tokens from the Jest platform before the
 * game client grants items to the player.
 */

import { verifyPurchase } from "./verify";
import {
  type Env,
  type VerifyRequest,
  type VerifyResponse,
  type RateLimitEntry,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS,
} from "./types";

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "https://jest.com",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

function withCors(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function jsonResponse(body: VerifyResponse | { error: string }, status = 200): Response {
  return withCors(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    })
  );
}

// ---------------------------------------------------------------------------
// Rate Limiting (KV-backed, per-IP, sliding window)
// ---------------------------------------------------------------------------

async function checkRateLimit(
  ip: string,
  kv: KVNamespace
): Promise<{ allowed: boolean; remaining: number }> {
  const key = `rl:${ip}`;
  const now = Date.now();

  const raw = await kv.get(key);
  let entry: RateLimitEntry = raw
    ? JSON.parse(raw)
    : { count: 0, windowStart: now };

  // Reset window if it has expired.
  if (now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
    entry = { count: 0, windowStart: now };
  }

  entry.count += 1;

  // TTL: keep the key alive only for the remainder of the current window,
  // plus a small buffer so we don't leak stale keys.
  const ttlSeconds = Math.ceil(
    (RATE_LIMIT_WINDOW_MS - (now - entry.windowStart)) / 1000
  ) + 5;

  await kv.put(key, JSON.stringify(entry), { expirationTtl: ttlSeconds });

  const remaining = Math.max(0, RATE_LIMIT_MAX_REQUESTS - entry.count);
  return { allowed: entry.count <= RATE_LIMIT_MAX_REQUESTS, remaining };
}

// ---------------------------------------------------------------------------
// Audit Logging
// ---------------------------------------------------------------------------

function logAudit(
  outcome: "success" | "failure",
  purchaseToken: string | undefined,
  detail: string,
  ip: string
): void {
  // Cloudflare Workers' console.log is captured by `wrangler tail` and
  // forwarded to any connected log sinks (Logpush, etc.).
  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      event: "purchase_verification",
      outcome,
      purchaseToken: purchaseToken ?? "unknown",
      detail,
      ip,
    })
  );
}

// ---------------------------------------------------------------------------
// Request Validation
// ---------------------------------------------------------------------------

function isValidVerifyRequest(body: unknown): body is VerifyRequest {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.token === "string" &&
    typeof b.expectedSku === "string" &&
    typeof b.expectedPlayerId === "string" &&
    b.token.length > 0 &&
    b.expectedSku.length > 0 &&
    b.expectedPlayerId.length > 0
  );
}

// ---------------------------------------------------------------------------
// Worker Entry Point
// ---------------------------------------------------------------------------

export default {
  async fetch(
    request: Request,
    env: Env,
    _ctx: ExecutionContext
  ): Promise<Response> {
    // -- Preflight -----------------------------------------------------------
    if (request.method === "OPTIONS") {
      return withCors(new Response(null, { status: 204 }));
    }

    // -- Route: POST /verify-purchase ----------------------------------------
    const url = new URL(request.url);

    if (url.pathname !== "/verify-purchase") {
      return jsonResponse({ valid: false, error: "Not found" } as VerifyResponse, 404);
    }

    if (request.method !== "POST") {
      return jsonResponse(
        { valid: false, error: "Method not allowed" } as VerifyResponse,
        405
      );
    }

    // -- Client IP -----------------------------------------------------------
    const ip =
      request.headers.get("CF-Connecting-IP") ??
      request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ??
      "unknown";

    // -- Rate limit ----------------------------------------------------------
    const { allowed, remaining } = await checkRateLimit(ip, env.RATE_LIMITER);

    if (!allowed) {
      logAudit("failure", undefined, "rate_limited", ip);
      const res = jsonResponse(
        { valid: false, error: "Rate limit exceeded. Try again shortly." } as VerifyResponse,
        429
      );
      res.headers.set("Retry-After", "60");
      res.headers.set("X-RateLimit-Remaining", "0");
      return res;
    }

    // -- Parse body ----------------------------------------------------------
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      logAudit("failure", undefined, "invalid_json_body", ip);
      return jsonResponse(
        { valid: false, error: "Request body must be valid JSON" } as VerifyResponse,
        400
      );
    }

    if (!isValidVerifyRequest(body)) {
      logAudit("failure", undefined, "missing_required_fields", ip);
      return jsonResponse(
        {
          valid: false,
          error:
            "Request must include non-empty string fields: token, expectedSku, expectedPlayerId",
        } as VerifyResponse,
        400
      );
    }

    // -- Verify purchase JWT -------------------------------------------------
    const result = await verifyPurchase(body, env);

    // -- Audit log -----------------------------------------------------------
    // On success, `result.purchase` is available. On failure it is not, but we
    // can still try to extract the purchaseToken from the (unverified) JWT for
    // logging purposes. We intentionally do NOT trust this value for anything
    // other than log correlation.
    let tokenForLog: string | undefined;
    if (result.valid) {
      tokenForLog = result.purchase.purchaseToken;
    } else {
      try {
        // Quick peek at the payload without verification (base64url decode).
        const parts = body.token.split(".");
        if (parts.length === 3) {
          const payloadJson = atob(
            parts[1].replace(/-/g, "+").replace(/_/g, "/")
          );
          const payload = JSON.parse(payloadJson);
          tokenForLog = payload?.purchase?.purchaseToken;
        }
      } catch {
        // Swallow -- token is garbage; we already logged the error.
      }
    }

    if (result.valid) {
      logAudit("success", tokenForLog, "verified", ip);
    } else {
      logAudit("failure", tokenForLog, result.error, ip);
    }

    // -- Respond -------------------------------------------------------------
    const response = jsonResponse(result, result.valid ? 200 : 403);
    response.headers.set("X-RateLimit-Remaining", String(remaining));
    return response;
  },
} satisfies ExportedHandler<Env>;
