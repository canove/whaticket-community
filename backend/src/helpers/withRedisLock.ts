import { getRedisClient } from "../libs/redisStore.js";
import { logger } from "../utils/logger.js";

const LOCK_TTL_SECONDS = 10;
const RETRY_DELAY_MS = 150;
const MAX_RETRIES = 5;

/**
 * Acquires a Redis distributed lock, executes fn, then releases it.
 * Falls back to calling fn directly when Redis is not available.
 */
export const withRedisLock = async <T>(
  lockKey: string,
  fn: () => Promise<T>
): Promise<T> => {
  const redis = getRedisClient();

  if (!redis) {
    // Redis not configured — run without lock (legacy behaviour)
    return fn();
  }

  let attempts = 0;

  while (attempts < MAX_RETRIES) {
    const acquired = await redis.set(
      lockKey,
      "1",
      "EX",
      LOCK_TTL_SECONDS,
      "NX"
    );

    if (acquired === "OK") {
      try {
        return await fn();
      } finally {
        await redis.del(lockKey).catch((err: unknown) => {
          logger.warn({ info: "Failed to release Redis lock", lockKey, err });
        });
      }
    }

    attempts++;
    logger.debug({
      info: "Lock contention, retrying",
      lockKey,
      attempt: attempts
    });
    await new Promise(r => setTimeout(r, RETRY_DELAY_MS * attempts));
  }

  // All retries exhausted — run without lock to avoid message loss
  logger.warn({
    info: "Could not acquire Redis lock after retries, running without lock",
    lockKey
  });
  return fn();
};
