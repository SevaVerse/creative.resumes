import { logger } from './logger';
// Simple in-memory rate limiting, per server instance (resets on restart and is not shared
// across instances). Fine for cheap, low-risk throttling; costly or public-facing limits use the
// shared limiter in src/lib/db/rateLimits.ts.

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
        logger.warn('rate_limit.block', { key, max, windowMs, retryAfterMs });
        return { allowed: false, remaining: 0, retryAfterMs };
      }
      bucket.hits.push(now);
      return { allowed: true, remaining: Math.max(0, max - bucket.hits.length) };
    },
  };
}
