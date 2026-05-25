import { Queue, Worker, Job, QueueEvents } from "bullmq";
import { getRedisClient } from "./redisStore.js";
import { logger } from "../utils/logger.js";

// Re-use the existing Redis connection options — BullMQ needs its own client
// instances (publisher + subscriber internally), so we pass connection options
// rather than a shared client.
const getConnectionOpts = () => {
  const url = process.env.REDIS_URL;
  if (!url) throw new Error("REDIS_URL is required for job queues");
  return { url };
};

// ─── Inbound message queue ────────────────────────────────────────────────────
// Holds raw WhatsApp payloads waiting to be persisted and processed.
// Returns null when REDIS_URL is not configured (falls back to direct processing).
let inboundQueue: Queue | null = null;

export const getInboundQueue = (): Queue | null => {
  if (!process.env.REDIS_URL) return null;

  if (!inboundQueue) {
    inboundQueue = new Queue("inbound-messages", {
      connection: getConnectionOpts(),
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 500 }
      }
    });

    inboundQueue.on("error", err => {
      logger.error({ info: "Inbound queue error", err });
    });
  }
  return inboundQueue;
};

// ─── Outbound message queue ───────────────────────────────────────────────────
// Holds outbound messages to be sent via WhatsApp with rate limiting.
// Returns null when REDIS_URL is not configured (falls back to direct send).
let outboundQueue: Queue | null = null;

export const getOutboundQueue = (): Queue | null => {
  if (!process.env.REDIS_URL) return null;

  if (!outboundQueue) {
    outboundQueue = new Queue("outbound-messages", {
      connection: getConnectionOpts(),
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 3000 },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 500 }
      }
    });

    outboundQueue.on("error", err => {
      logger.error({ info: "Outbound queue error", err });
    });
  }
  return outboundQueue;
};

// ─── Worker factory ───────────────────────────────────────────────────────────
export const createWorker = <T>(
  queueName: string,
  processor: (job: Job<T>) => Promise<void>,
  concurrency = 5
): Worker<T> => {
  const worker = new Worker<T>(queueName, processor, {
    connection: getConnectionOpts(),
    concurrency
  });

  worker.on("completed", job => {
    logger.debug({ info: `Job completed`, queueName, jobId: job.id });
  });

  worker.on("failed", (job, err) => {
    logger.error({ info: "Job failed", queueName, jobId: job?.id, err });
  });

  worker.on("error", err => {
    logger.error({ info: "Worker error", queueName, err });
  });

  return worker;
};

// ─── Graceful shutdown ────────────────────────────────────────────────────────
export const closeQueues = async (): Promise<void> => {
  const closes: Promise<void>[] = [];
  if (inboundQueue) closes.push(inboundQueue.close());
  if (outboundQueue) closes.push(outboundQueue.close());
  await Promise.all(closes);
};
