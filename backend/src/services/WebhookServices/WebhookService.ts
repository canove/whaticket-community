import { Queue, Worker, Job } from "bullmq";
import { createRedisConnection } from "../../libs/redis";
import { logger } from "../../utils/logger";
import Webhook from "../../models/Webhook";
import axios from "axios";
import crypto from "crypto";

export interface WebhookEventData {
  event: string;
  tenantId: number;
  timestamp: Date;
  data: Record<string, any>;
  webhookId?: number;
}

export interface WebhookJobData extends WebhookEventData {
  webhookId: number;
  retryCount?: number;
}

class WebhookService {
  private webhookQueue: Queue;
  private webhookWorker: Worker;
  private deadLetterQueue: Queue;

  constructor() {
    const redisConnection = {
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB || "0")
    };

    // Main webhook queue
    this.webhookQueue = new Queue("webhook-delivery", {
      connection: redisConnection,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 200,
        attempts: 1, // We handle retries manually
        backoff: {
          type: "exponential",
          delay: 2000,
        },
      },
    });

    // Dead letter queue for persistent failures
    this.deadLetterQueue = new Queue("webhook-dead-letter", {
      connection: redisConnection,
      defaultJobOptions: {
        removeOnComplete: 500,
        removeOnFail: 1000,
      },
    });

    // Worker to process webhooks
    this.webhookWorker = new Worker(
      "webhook-delivery",
      this.processWebhook.bind(this),
      {
        connection: redisConnection,
        concurrency: parseInt(process.env.WEBHOOK_CONCURRENCY || "5"),
        limiter: {
          max: parseInt(process.env.WEBHOOK_RATE_LIMIT || "50"),
          duration: 60000, // 1 minute
        },
      }
    );

    this.setupWorkerEvents();
  }

  private setupWorkerEvents(): void {
    this.webhookWorker.on("completed", (job) => {
      logger.info(`Webhook job ${job.id} completed successfully`);
    });

    this.webhookWorker.on("failed", async (job, error) => {
      logger.error(`Webhook job ${job?.id} failed:`, error);
      
      if (job) {
        const webhook = await Webhook.findByPk(job.data.webhookId);
        if (webhook) {
          await webhook.update({
            failureCount: webhook.failureCount + 1,
            lastFailureAt: new Date(),
            lastError: error.message
          });
        }
      }
    });

    this.webhookWorker.on("stalled", (jobId) => {
      logger.warn(`Webhook job ${jobId} stalled`);
    });
  }

  async sendWebhook(eventData: WebhookEventData): Promise<void> {
    try {
      // Find all webhooks for this tenant that are subscribed to this event
      const webhooks = await Webhook.findAll({
        where: {
          tenantId: eventData.tenantId,
          isActive: true,
          events: {
            [require('sequelize').Op.contains]: [eventData.event]
          }
        }
      });

      // Add webhook delivery jobs
      for (const webhook of webhooks) {
        await this.addWebhookJob({
          ...eventData,
          webhookId: webhook.id
        });
      }

      logger.info(`Added ${webhooks.length} webhook jobs for event ${eventData.event}`);
    } catch (error) {
      logger.error("Error sending webhook:", error);
      throw error;
    }
  }

  private async addWebhookJob(jobData: WebhookJobData): Promise<Job> {
    return await this.webhookQueue.add(
      "deliver-webhook",
      jobData,
      {
        jobId: `webhook-${jobData.webhookId}-${Date.now()}`,
        delay: 0
      }
    );
  }

  private async processWebhook(job: Job<WebhookJobData>): Promise<void> {
    const { webhookId, event, tenantId, timestamp, data, retryCount = 0 } = job.data;

    try {
      const webhook = await Webhook.findByPk(webhookId);
      if (!webhook || !webhook.isActive) {
        logger.warn(`Webhook ${webhookId} not found or inactive, skipping`);
        return;
      }

      await job.updateProgress(20);

      // Prepare payload
      const payload = {
        event,
        tenantId,
        timestamp: timestamp.toISOString(),
        data,
        webhook: {
          id: webhook.id,
          name: webhook.name
        }
      };

      await job.updateProgress(40);

      // Generate HMAC signature if secret is configured
      const signature = webhook.secret 
        ? this.generateHMACSignature(JSON.stringify(payload), webhook.secret)
        : undefined;

      await job.updateProgress(60);

      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Whaticket-Webhook/1.0',
        'X-Webhook-Event': event,
        'X-Webhook-Timestamp': timestamp.toISOString(),
        'X-Webhook-ID': webhook.id.toString(),
        ...webhook.headers
      };

      if (signature) {
        headers['X-Webhook-Signature'] = signature;
      }

      await job.updateProgress(80);

      // Make HTTP request
      const response = await axios.post(webhook.url, payload, {
        headers,
        timeout: webhook.timeout || 30000,
        validateStatus: (status) => status >= 200 && status < 300
      });

      await job.updateProgress(100);

      // Update webhook success statistics
      await webhook.update({
        successCount: webhook.successCount + 1,
        lastDeliveryAt: new Date(),
        lastSuccessAt: new Date()
      });

      logger.info(`Webhook ${webhookId} delivered successfully with status ${response.status}`);

    } catch (error) {
      logger.error(`Webhook ${webhookId} delivery failed:`, error);

      const webhook = await Webhook.findByPk(webhookId);
      if (!webhook) return;

      // Get retry configuration
      const retryConfig = webhook.retryConfig || {
        maxRetries: 3,
        retryDelays: [1000, 2000, 4000], // 1s, 2s, 4s
        exponentialBackoff: true
      };

      const nextRetryCount = retryCount + 1;

      if (nextRetryCount <= retryConfig.maxRetries) {
        // Schedule retry
        let retryDelay = retryConfig.retryDelays[Math.min(nextRetryCount - 1, retryConfig.retryDelays.length - 1)];
        
        if (retryConfig.exponentialBackoff && nextRetryCount > retryConfig.retryDelays.length) {
          retryDelay = retryConfig.retryDelays[retryConfig.retryDelays.length - 1] * Math.pow(2, nextRetryCount - retryConfig.retryDelays.length);
        }

        await this.webhookQueue.add(
          "deliver-webhook",
          {
            ...job.data,
            retryCount: nextRetryCount
          },
          {
            delay: retryDelay,
            jobId: `webhook-${webhookId}-retry-${nextRetryCount}-${Date.now()}`
          }
        );

        logger.info(`Webhook ${webhookId} scheduled for retry ${nextRetryCount} in ${retryDelay}ms`);
      } else {
        // Max retries reached, send to dead letter queue
        await this.deadLetterQueue.add(
          "webhook-dead-letter",
          {
            ...job.data,
            finalError: error.message,
            totalRetries: nextRetryCount
          }
        );

        logger.error(`Webhook ${webhookId} moved to dead letter queue after ${nextRetryCount} attempts`);
      }

      // Update webhook failure statistics
      await webhook.update({
        failureCount: webhook.failureCount + 1,
        lastFailureAt: new Date(),
        lastError: error.message
      });

      throw error; // Re-throw to mark job as failed
    }
  }

  private generateHMACSignature(payload: string, secret: string): string {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    return `sha256=${hmac.digest('hex')}`;
  }

  async verifyWebhookSignature(payload: string, signature: string, secret: string): Promise<boolean> {
    const expectedSignature = this.generateHMACSignature(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  async testWebhook(webhookId: number): Promise<{ success: boolean; error?: string; response?: any }> {
    try {
      const webhook = await Webhook.findByPk(webhookId);
      if (!webhook) {
        return { success: false, error: "Webhook not found" };
      }

      const testPayload = {
        event: "test.webhook",
        tenantId: webhook.tenantId,
        timestamp: new Date().toISOString(),
        data: {
          message: "This is a test webhook"
        },
        webhook: {
          id: webhook.id,
          name: webhook.name
        }
      };

      const signature = webhook.secret 
        ? this.generateHMACSignature(JSON.stringify(testPayload), webhook.secret)
        : undefined;

      const headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Whaticket-Webhook/1.0',
        'X-Webhook-Event': 'test.webhook',
        'X-Webhook-Timestamp': testPayload.timestamp,
        'X-Webhook-ID': webhook.id.toString(),
        ...webhook.headers
      };

      if (signature) {
        headers['X-Webhook-Signature'] = signature;
      }

      const response = await axios.post(webhook.url, testPayload, {
        headers,
        timeout: webhook.timeout || 30000,
        validateStatus: (status) => status >= 200 && status < 500 // Accept 4xx as well for testing
      });

      return {
        success: response.status >= 200 && response.status < 300,
        response: {
          status: response.status,
          statusText: response.statusText,
          data: response.data
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getWebhookStats(webhookId: number) {
    const webhook = await Webhook.findByPk(webhookId);
    if (!webhook) {
      throw new Error("Webhook not found");
    }

    const jobs = await this.webhookQueue.getJobs(["completed", "failed", "waiting", "active"]);
    const webhookJobs = jobs.filter(job => job.data.webhookId === webhookId);

    return {
      successCount: webhook.successCount,
      failureCount: webhook.failureCount,
      lastDeliveryAt: webhook.lastDeliveryAt,
      lastSuccessAt: webhook.lastSuccessAt,
      lastFailureAt: webhook.lastFailureAt,
      lastError: webhook.lastError,
      queueStats: {
        total: webhookJobs.length,
        completed: webhookJobs.filter(job => job.finishedOn).length,
        failed: webhookJobs.filter(job => job.failedReason).length,
        pending: webhookJobs.filter(job => !job.processedOn).length,
        active: webhookJobs.filter(job => job.processedOn && !job.finishedOn).length
      }
    };
  }

  async retryFailedWebhooks(webhookId?: number): Promise<number> {
    const deadLetterJobs = await this.deadLetterQueue.getJobs(["completed"]);
    let retriedCount = 0;

    for (const job of deadLetterJobs) {
      if (!webhookId || job.data.webhookId === webhookId) {
        // Reset retry count and re-add to main queue
        await this.addWebhookJob({
          ...job.data,
          retryCount: 0
        });
        
        await job.remove();
        retriedCount++;
      }
    }

    logger.info(`Retried ${retriedCount} dead letter webhook jobs` + (webhookId ? ` for webhook ${webhookId}` : ""));
    return retriedCount;
  }

  getAvailableEvents(): string[] {
    return [
      "message.received",
      "message.sent", 
      "ticket.created",
      "ticket.updated",
      "ticket.closed",
      "campaign.started",
      "campaign.completed",
      "campaign.paused",
      "flow.completed",
      "contact.created",
      "contact.updated"
    ];
  }

  async close(): Promise<void> {
    await this.webhookWorker.close();
    await this.webhookQueue.close();
    await this.deadLetterQueue.close();
  }
}

export default new WebhookService();