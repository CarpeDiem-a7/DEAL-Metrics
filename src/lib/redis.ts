// src/lib/redis.ts
// Redis client for caching prices, rate limiting, and session management
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

export default redis;

// Cache key patterns
export const CACHE_KEYS = {
  PRODUCT: (id: string) => `product:${id}`,
  PRICES: (productId: string) => `prices:${productId}`,
  OFFERS: (storeId: string) => `offers:${storeId}`,
  BANK_OFFERS: () => "bank_offers",
  COUPONS: () => "coupons:active",
  USER_ALERTS: (userId: string) => `alerts:${userId}`,
  COMPARISON: (productId: string) => `comparison:${productId}`,
  EXTENSION_CACHE: (extensionId: string) => `ext:${extensionId}`,
  RATE_LIMIT: (identifier: string, endpoint: string) =>
    `ratelimit:${identifier}:${endpoint}`,
};

// Cache durations (in seconds)
export const CACHE_TTL = {
  PRICES: 3600, // 1 hour
  OFFERS: 7200, // 2 hours
  BANK_OFFERS: 86400, // 24 hours
  COUPONS: 3600, // 1 hour
  USER_DATA: 1800, // 30 minutes
  RATE_LIMIT: 60, // 1 minute
};
