import { Queue, Worker } from "bullmq";
import { logger } from "../utils/logger.js";

const connection = {
    host: process.env.REDIS_HOST || "redis",
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD
};

export const messageQueue = new Queue("messageQueue", { connection });

export const setupQueues = () => {
    const worker = new Worker("messageQueue", async job => {
        logger.info(`Processing job ${job.id}`);
        // Here we will call the HandleMessageService
        // const { message, whatsapp } = job.data;
        // await HandleMessageService(message, whatsapp);
    }, { connection });

    worker.on("completed", job => {
        logger.info(`Job ${job.id} completed`);
    });

    worker.on("failed", (job, err) => {
        logger.error(`Job ${job?.id} failed with ${err.message}`);
    });
};
