// Simple in-memory rate limiting utilities.
// Not persistent across server restarts; suitable for low‑risk throttling.
// For production hardening, consider redis / durable KV.

export interface RateLimitResult { allowed: boolean; remaining: number; retryAfterMs?: number }

export interface RateLimiter {
  check(key: string): RateLimitResult;
}

interface Bucket {
  hits: number[]; // epoch ms timestamps
}

export function createRateLimiter(windowMs: number, max: number): RateLimiter {
  const store = new Map<string, Bucket>();

  function prune(now: number, bucket: Bucket) {
    const boundary = now - windowMs;
    // Remove outdated timestamps (in place)
    let i = 0;
    while (i < bucket.hits.length && bucket.hits[i] < boundary) i++;
    if (i > 0) bucket.hits.splice(0, i);
  }

  return {
    check(key: string): RateLimitResult {
      const now = Date.now();
      let bucket = store.get(key);
      if (!bucket) {
        bucket = { hits: [] };
        store.set(key, bucket);
      }
      prune(now, bucket);
      if (bucket.hits.length >= max) {
        const earliest = bucket.hits[0];
        const retryAfterMs = (earliest + windowMs) - now;
        return { allowed: false, remaining: 0, retryAfterMs };
      }
      bucket.hits.push(now);
      return { allowed: true, remaining: Math.max(0, max - bucket.hits.length) };
    },
  };
}

// Shared limiter instances (tunable via env if desired later)
const DEFAULT_WINDOW_MS = 60_000; // 1 minute
const LOGIN_MAX = 5; // per minute per key
const PDF_MAX = 10; // more generous

export const loginLimiter = createRateLimiter(DEFAULT_WINDOW_MS, LOGIN_MAX);
export const pdfLimiter = createRateLimiter(DEFAULT_WINDOW_MS, PDF_MAX);

// Helper to derive composite keys
export function buildKey(parts: (string | undefined | null)[]): string {
  return parts.filter(Boolean).join(":");
}
