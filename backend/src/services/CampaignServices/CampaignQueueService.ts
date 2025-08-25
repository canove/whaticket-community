import { Queue, Worker, Job, QueueEvents } from "bullmq";
import { createRedisConnection, isRedisEnabled } from "../../libs/redis";
import { logger } from "../../utils/logger";
import Campaign, { CampaignStatus } from "../../models/Campaign";
import CampaignExecution, { CampaignExecutionStatus } from "../../models/CampaignExecution";
import Contact from "../../models/Contact";

export interface CampaignJobData {
  campaignId: number;
  contactId: number;
  tenantId: number;
  executionId: number;
  messageTemplate: string;
  variables?: Record<string, any>;
}

export interface CampaignBatchJobData {
  campaignId: number;
  tenantId: number;
  contactIds: number[];
  messageTemplate: string;
}

class CampaignQueueService {
  private campaignQueue: Queue | null = null;
  private campaignWorker: Worker | null = null;
  private queueEvents: QueueEvents | null = null;
  private redis = createRedisConnection();
  private redisEnabled = false;
  private mockJobs: Map<string, any> = new Map();

  constructor() {
    this.redisEnabled = isRedisEnabled();
    
    if (this.redisEnabled) {
      try {
        const redisConnection = {
          host: process.env.REDIS_HOST || "localhost",
          port: parseInt(process.env.REDIS_PORT || "6379"),
          password: process.env.REDIS_PASSWORD || undefined,
          db: parseInt(process.env.REDIS_DB || "0")
        };

        this.campaignQueue = new Queue("campaign-queue", {
          connection: redisConnection,
          defaultJobOptions: {
            removeOnComplete: 50,
            removeOnFail: 100,
            attempts: 3,
            backoff: {
              type: "exponential",
              delay: 2000,
            },
          },
        });

        this.queueEvents = new QueueEvents("campaign-queue", {
          connection: redisConnection,
        });

        this.setupEventListeners();
        logger.info("Campaign queue service initialized with Redis");
      } catch (error) {
        logger.warn("Failed to initialize Redis queue, falling back to mock mode:", error);
        this.redisEnabled = false;
      }
    } else {
      logger.info("Campaign queue service initialized in mock mode (Redis disabled)");
    }
  }

  private setupEventListeners(): void {
    if (!this.queueEvents) return;
    
    this.queueEvents.on("completed", async ({ jobId, returnvalue }) => {
      logger.info(`Campaign job ${jobId} completed successfully`);
    });

    this.queueEvents.on("failed", async ({ jobId, failedReason }) => {
      logger.error(`Campaign job ${jobId} failed: ${failedReason}`);
    });

    this.queueEvents.on("progress", async ({ jobId, data }) => {
      logger.info(`Campaign job ${jobId} progress: ${data}`);
    });
  }

  async addCampaignJob(
    jobData: CampaignJobData,
    options?: {
      delay?: number;
      priority?: number;
      attempts?: number;
    }
  ): Promise<Job | any> {
    const jobId = `campaign-${jobData.campaignId}-contact-${jobData.contactId}`;
    
    if (this.redisEnabled && this.campaignQueue) {
      return await this.campaignQueue.add("send-campaign-message", jobData, {
        ...options,
        jobId,
      });
    } else {
      // Mock job for fallback mode
      const mockJob = {
        id: jobId,
        data: jobData,
        opts: options || {},
        processedOn: null,
        finishedOn: null,
        failedReason: null,
        remove: async () => { this.mockJobs.delete(jobId); },
        retry: async () => { logger.info(`Mock retry for job ${jobId}`); }
      };
      this.mockJobs.set(jobId, mockJob);
      logger.info(`Mock campaign job added: ${jobId}`);
      return mockJob;
    }
  }

  async addBatchCampaignJob(
    jobData: CampaignBatchJobData,
    options?: {
      delay?: number;
      rateLimit?: number; // messages per second
    }
  ): Promise<void> {
    const { campaignId, tenantId, contactIds, messageTemplate } = jobData;
    const rateLimit = options?.rateLimit || 1; // 1 message per second by default
    const delay = options?.delay || 0;

    // Create individual campaign executions
    const executions = [];
    for (const contactId of contactIds) {
      const execution = await CampaignExecution.create({
        campaignId,
        contactId,
        tenantId,
        status: CampaignExecutionStatus.PENDING,
      });
      executions.push(execution);
    }

    // Add jobs with rate limiting
    for (let i = 0; i < executions.length; i++) {
      const execution = executions[i];
      const jobDelay = delay + (i * (1000 / rateLimit)); // Calculate delay for rate limiting

      await this.addCampaignJob(
        {
          campaignId,
          contactId: execution.contactId,
          tenantId,
          executionId: execution.id,
          messageTemplate,
        },
        {
          delay: jobDelay,
          priority: 1,
        }
      );
    }

    logger.info(`Added ${executions.length} campaign jobs with ${rateLimit} msg/s rate limit`);
  }

  async pauseCampaign(campaignId: number): Promise<void> {
    if (this.redisEnabled && this.campaignQueue) {
      // Get all pending jobs for this campaign
      const jobs = await this.campaignQueue.getJobs(["waiting", "delayed"]);
      const campaignJobs = jobs.filter(job =>
        job.data.campaignId === campaignId
      );

      // Remove all pending jobs
      for (const job of campaignJobs) {
        await job.remove();
      }

      logger.info(`Paused campaign ${campaignId} and removed ${campaignJobs.length} pending jobs`);
    } else {
      // Mock mode - remove jobs from memory
      const removedJobs = [];
      for (const [jobId, job] of this.mockJobs.entries()) {
        if (job.data.campaignId === campaignId) {
          this.mockJobs.delete(jobId);
          removedJobs.push(jobId);
        }
      }
      logger.info(`Mock: Paused campaign ${campaignId} and removed ${removedJobs.length} pending jobs`);
    }

    // Update campaign status
    await Campaign.update(
      { status: CampaignStatus.PAUSED },
      { where: { id: campaignId } }
    );
  }

  async resumeCampaign(campaignId: number): Promise<void> {
    const campaign = await Campaign.findByPk(campaignId);
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    // Get all pending executions
    const pendingExecutions = await CampaignExecution.findAll({
      where: {
        campaignId,
        status: CampaignExecutionStatus.PENDING
      },
      include: [Contact]
    });

    // Re-add jobs for pending executions with rate limiting
    const rateLimit = campaign.messagesPerSecond || 1;
    for (let i = 0; i < pendingExecutions.length; i++) {
      const execution = pendingExecutions[i];
      const delay = i * (1000 / rateLimit);

      await this.addCampaignJob(
        {
          campaignId,
          contactId: execution.contactId,
          tenantId: execution.tenantId,
          executionId: execution.id,
          messageTemplate: campaign.messageTemplate,
        },
        { delay }
      );
    }

    // Update campaign status
    await Campaign.update(
      { status: CampaignStatus.RUNNING },
      { where: { id: campaignId } }
    );

    logger.info(`Resumed campaign ${campaignId} with ${pendingExecutions.length} jobs`);
  }

  async getCampaignStats(campaignId: number) {
    if (this.redisEnabled && this.campaignQueue) {
      const jobs = await this.campaignQueue.getJobs(["completed", "failed", "waiting", "active"]);
      const campaignJobs = jobs.filter(job => job.data.campaignId === campaignId);

      return {
        total: campaignJobs.length,
        completed: campaignJobs.filter(job => job.finishedOn).length,
        failed: campaignJobs.filter(job => job.failedReason).length,
        pending: campaignJobs.filter(job => !job.processedOn).length,
        active: campaignJobs.filter(job => job.processedOn && !job.finishedOn).length,
      };
    } else {
      // Mock stats from database
      const executions = await CampaignExecution.findAll({
        where: { campaignId }
      });
      
      return {
        total: executions.length,
        completed: executions.filter(e => e.status === CampaignExecutionStatus.SENT || e.status === CampaignExecutionStatus.DELIVERED).length,
        failed: executions.filter(e => e.status === CampaignExecutionStatus.FAILED).length,
        pending: executions.filter(e => e.status === CampaignExecutionStatus.PENDING).length,
        active: executions.filter(e => e.status === CampaignExecutionStatus.SENDING).length,
      };
    }
  }

  async getQueueHealth() {
    if (this.redisEnabled && this.campaignQueue) {
      const waiting = await this.campaignQueue.getWaiting();
      const active = await this.campaignQueue.getActive();
      const completed = await this.campaignQueue.getCompleted();
      const failed = await this.campaignQueue.getFailed();

      return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        total: waiting.length + active.length + completed.length + failed.length,
      };
    } else {
      // Mock health from database
      const executions = await CampaignExecution.findAll();
      return {
        waiting: executions.filter(e => e.status === CampaignExecutionStatus.PENDING).length,
        active: executions.filter(e => e.status === CampaignExecutionStatus.SENDING).length,
        completed: executions.filter(e => e.status === CampaignExecutionStatus.SENT || e.status === CampaignExecutionStatus.DELIVERED).length,
        failed: executions.filter(e => e.status === CampaignExecutionStatus.FAILED).length,
        total: executions.length,
      };
    }
  }

  async retryFailedJobs(campaignId?: number): Promise<number> {
    if (this.redisEnabled && this.campaignQueue) {
      const failed = await this.campaignQueue.getFailed();
      let retriedCount = 0;

      for (const job of failed) {
        if (!campaignId || job.data.campaignId === campaignId) {
          await job.retry();
          retriedCount++;
        }
      }

      logger.info(`Retried ${retriedCount} failed jobs` + (campaignId ? ` for campaign ${campaignId}` : ""));
      return retriedCount;
    } else {
      // Mock retry - update failed executions to pending
      const whereCondition: any = { status: CampaignExecutionStatus.FAILED };
      if (campaignId) {
        whereCondition.campaignId = campaignId;
      }
      
      const [retriedCount] = await CampaignExecution.update(
        { status: CampaignExecutionStatus.PENDING },
        { where: whereCondition }
      );

      logger.info(`Mock: Retried ${retriedCount} failed jobs` + (campaignId ? ` for campaign ${campaignId}` : ""));
      return retriedCount;
    }
  }

  async cleanQueue(): Promise<void> {
    if (this.redisEnabled && this.campaignQueue) {
      await this.campaignQueue.clean(24 * 60 * 60 * 1000, 100, "completed"); // Clean completed jobs older than 24h
      await this.campaignQueue.clean(48 * 60 * 60 * 1000, 50, "failed"); // Clean failed jobs older than 48h
      logger.info("Queue cleanup completed");
    } else {
      // Mock cleanup - clear old mock jobs
      this.mockJobs.clear();
      logger.info("Mock queue cleanup completed");
    }
  }

  getQueue(): Queue | null {
    return this.campaignQueue;
  }

  getWorker(): Worker | null {
    return this.campaignWorker;
  }

  async close(): Promise<void> {
    if (this.redisEnabled) {
      await this.campaignWorker?.close();
      await this.campaignQueue?.close();
      await this.queueEvents?.close();
    } else {
      this.mockJobs.clear();
    }
  }
}

export default new CampaignQueueService();