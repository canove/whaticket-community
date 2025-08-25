import Redis from "ioredis";
import { logger } from "../utils/logger";

let redisClient: Redis | null = null;
let redisEnabled: boolean = false;

const isRedisEnabled = (): boolean => {
  return redisEnabled;
};

const createRedisConnection = (): Redis | null => {
  if (redisClient) {
    return redisClient;
  }

  // Verifica se Redis está habilitado via variável de ambiente
  const redisDisabled = process.env.REDIS_DISABLED === "true";
  if (redisDisabled) {
    logger.info("Redis is disabled via REDIS_DISABLED environment variable");
    return null;
  }

  try {
    const redisConfig = {
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB || "0"),
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      lazyConnect: true,
      connectionName: "whaticket-campaign-queue",
      connectTimeout: 5000, // 5 segundos timeout
      commandTimeout: 5000
    };

    redisClient = new Redis(redisConfig);

    redisClient.on("connect", () => {
      logger.info("Redis connected successfully");
      redisEnabled = true;
    });

    redisClient.on("error", (err) => {
      logger.warn("Redis connection error (running without Redis):", err.message);
      redisEnabled = false;
      redisClient = null;
    });

    redisClient.on("close", () => {
      logger.warn("Redis connection closed");
      redisEnabled = false;
    });

    // Tenta conectar imediatamente para verificar se está disponível
    redisClient.connect().catch((err) => {
      logger.warn("Redis not available, continuing without Redis support:", err.message);
      redisEnabled = false;
      redisClient = null;
    });

    return redisClient;
  } catch (error) {
    logger.warn("Failed to create Redis connection, continuing without Redis:", error);
    redisEnabled = false;
    return null;
  }
};

const getRedisConnection = (): Redis | null => {
  return redisClient;
};

export { createRedisConnection, getRedisConnection, isRedisEnabled };

// Tenta criar conexão na inicialização, mas não falha se Redis não estiver disponível
const initialConnection = createRedisConnection();
export default initialConnection;