// src/lib/rate-limit.ts
// Rate limiting middleware for API protection
import redis from "./redis";
import { CACHE_KEYS, CACHE_TTL } from "./redis";

export interface RateLimitConfig {
  limit: number; // Max requests
  window: number; // Time window in seconds
}

export const RATE_LIMITS = {
  AUTH: { limit: 5, window: 900 }, // 5 req per 15 min
  PRODUCT_SEARCH: { limit: 30, window: 60 }, // 30 req per minute
  COMPARISON: { limit: 20, window: 60 },
  AFFILIATE_CLICK: { limit: 100, window: 3600 }, // 100 per hour
  API_GENERAL: { limit: 100, window: 3600 }, // 100 per hour
};

export async function checkRateLimit(
  identifier: string,
  endpoint: string,
  config: RateLimitConfig,
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  const key = CACHE_KEYS.RATE_LIMIT(identifier, endpoint);

  try {
    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, config.window);
    }

    const ttl = await redis.ttl(key);
    const allowed = current <= config.limit;
    const remaining = Math.max(0, config.limit - current);

    return {
      allowed,
      remaining,
      resetIn: ttl,
    };
  } catch (error) {
    console.error("Rate limit check error:", error);
    // Fail open in case of Redis error
    return { allowed: true, remaining: config.limit, resetIn: config.window };
  }
}

export async function resetRateLimit(
  identifier: string,
  endpoint: string,
): Promise<void> {
  const key = CACHE_KEYS.RATE_LIMIT(identifier, endpoint);
  await redis.del(key);
}
