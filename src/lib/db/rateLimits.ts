import "server-only";
import { createHmac } from "node:crypto";
import { getDb } from "./client";
import { createRateLimiter, type RateLimiter, type RateLimitResult } from "@/utils/rateLimit";
import { logger } from "@/utils/logger";

// Rate limits shared by every server instance (the in-memory limiter in utils/rateLimit.ts resets
// per instance, which serverless scaling makes easy to bypass). Fixed windows stored in Turso.
//
// Privacy: the subject (a client IP or user id) is never stored. Rows are keyed by an HMAC of
// scope + subject under a server secret, and are deleted once their window has passed.

const SECRET = process.env.AUTH_SECRET || "securecv-dev-rate-limit-key";
const CLEANUP_PROBABILITY = 0.02;

/** Per-instance fallback, used only if the database is unreachable (fail open, but still throttled). */
const fallbacks = new Map<string, RateLimiter>();

function fallbackCheck(scope: string, subject: string, windowMs: number, max: number): RateLimitResult {
  const id = `${scope}:${windowMs}:${max}`;
  let limiter = fallbacks.get(id);
  if (!limiter) {
    limiter = createRateLimiter(windowMs, max);
    fallbacks.set(id, limiter);
  }
  return limiter.check(`${scope}:${subject}`);
}

function hashKey(scope: string, subject: string): string {
  return createHmac("sha256", SECRET).update(`${scope}\n${subject}`).digest("hex").slice(0, 40);
}

/**
 * Counts one hit for `subject` in `scope` and reports whether it is within `max` per `windowMs`.
 * Hits over the limit are still counted, so a client that keeps retrying stays blocked for the window.
 */
export async function checkRateLimit(scope: string, subject: string, windowMs: number, max: number): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = now - (now % windowMs);
  const expiresAt = windowStart + windowMs;
  try {
    const db = await getDb();
    const rs = await db.execute({
      sql: `INSERT INTO rate_limits (key, window_start, hits, expires_at) VALUES (?, ?, 1, ?)
            ON CONFLICT (key) DO UPDATE SET
              hits = CASE WHEN rate_limits.window_start = excluded.window_start THEN rate_limits.hits + 1 ELSE 1 END,
              window_start = excluded.window_start,
              expires_at = excluded.expires_at
            RETURNING hits`,
      args: [hashKey(scope, subject), windowStart, expiresAt],
    });
    const hits = Number(rs.rows[0]?.hits ?? 1);
    if (Math.random() < CLEANUP_PROBABILITY) {
      db.execute({ sql: "DELETE FROM rate_limits WHERE expires_at < ?", args: [now] }).catch(() => {});
    }
    if (hits > max) {
      logger.warn("rate_limit.block", { scope, max, windowMs });
      return { allowed: false, remaining: 0, retryAfterMs: expiresAt - now };
    }
    return { allowed: true, remaining: max - hits };
  } catch (error) {
    logger.warn("rate_limit.store_unavailable", { scope, error: (error as Error).message });
    return fallbackCheck(scope, subject, windowMs, max);
  }
}
