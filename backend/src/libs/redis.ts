import Redis from "ioredis";
import { logger } from "../utils/logger";

let redisClient: Redis | null = null;

const createRedisConnection = (): Redis => {
  if (redisClient) {
    return redisClient;
  }

  const redisConfig = {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || "0"),
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    lazyConnect: true,
    connectionName: "whaticket-campaign-queue"
  };

  redisClient = new Redis(redisConfig);

  redisClient.on("connect", () => {
    logger.info("Redis connected successfully");
  });

  redisClient.on("error", (err) => {
    logger.error("Redis connection error:", err);
  });

  redisClient.on("close", () => {
    logger.warn("Redis connection closed");
  });

  return redisClient;
};

export { createRedisConnection };
export default createRedisConnection();