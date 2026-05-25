import { getRedisClient } from "../libs/redisStore.js";
import { logger } from "../utils/logger.js";

const WINDOW_MS = 60_000; // 1 minute sliding window
const parsedRateLimit = parseInt(process.env.OUTBOUND_RATE_LIMIT || "", 10);
const MAX_SENDS =
  Number.isFinite(parsedRateLimit) && parsedRateLimit > 0
    ? parsedRateLimit
    : 20;

/**
 * Sliding-window rate limiter for outbound WhatsApp messages.
 * Tracks sends per whatsappId and waits if the limit is exceeded.
 * Falls back to a no-op when Redis is not configured.
 */
export const checkOutboundRateLimit = async (
  whatsappId: number
): Promise<void> => {
  const redis = getRedisClient();
  if (!redis) return;

  const key = `ratelimit:outbound:${whatsappId}`;
  const now = Date.now();

  // Remove timestamps older than the window
  await redis.zremrangebyscore(key, 0, now - WINDOW_MS);

  const count = await redis.zcard(key);

  if (count >= MAX_SENDS) {
    // Find out how long until the oldest entry expires from the window
    const oldest = await redis.zrange(key, 0, 0, "WITHSCORES");
    const oldestTs = oldest.length > 1 ? parseInt(oldest[1], 10) : now;
    const waitMs = Math.min(oldestTs + WINDOW_MS - now, 5_000);

    if (waitMs > 0) {
      logger.warn({
        info: "Outbound rate limit reached, throttling send",
        whatsappId,
        waitMs,
        count
      });
      await new Promise(r => setTimeout(r, waitMs));
    }
  }

  // Record this send in the window
  await redis.zadd(key, now, `${now}-${Math.random()}`);
  await redis.expire(key, Math.ceil(WINDOW_MS / 1000) + 1);
};
