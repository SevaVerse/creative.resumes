// Lightweight Upstash Redis client helper with safe optional initialization.
// If env vars are missing, this returns null so callers can gracefully fallback.
import { Redis } from "@upstash/redis";

export type RedisClient = InstanceType<typeof Redis>;

let cached: RedisClient | null | undefined;

export function getRedis(): RedisClient | null {
  if (cached !== undefined) return cached;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    cached = null;
    return cached;
  }
  try {
    cached = new Redis({ url, token });
  } catch {
    cached = null;
  }
  return cached;
}
