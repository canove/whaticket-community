import { Worker, Job, Queue } from "bullmq";
import { createRedisConnection, isRedisEnabled } from "../../libs/redis";
import { logger } from "../../utils/logger";
import Campaign, { CampaignStatus } from "../../models/Campaign";
import CampaignExecution, { CampaignExecutionStatus } from "../../models/CampaignExecution";
import Contact from "../../models/Contact";
import Tenant from "../../models/Tenant";
import Whatsapp from "../../models/Whatsapp";
import MessageTemplateService from "./MessageTemplateService";
import { WhatsAppAdapter } from "../ChannelServices/WhatsAppAdapter";
import { CampaignJobData } from "./CampaignQueueService";

class CampaignProcessorService {
  private worker: Worker | null = null;
  private queue: Queue | null = null;
  private isRunning: boolean = false;
  private redisEnabled: boolean = false;
  private mockProcessingInterval: NodeJS.Timeout | null = null;

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

        // Create queue instance for job management
        this.queue = new Queue("campaign-queue", {
          connection: redisConnection
        });

        this.worker = new Worker(
          "campaign-queue",
          this.processJob.bind(this),
          {
            connection: redisConnection,
            concurrency: parseInt(process.env.CAMPAIGN_CONCURRENCY || "1"),
            limiter: {
              max: parseInt(process.env.CAMPAIGN_MAX_JOBS || "10"),
              duration: 60000, // 1 minute
            }
          }
        );

        this.setupWorkerEvents();
        logger.info("Campaign processor service initialized with Redis");
      } catch (error) {
        logger.warn("Failed to initialize Redis campaign processor, falling back to mock mode:", error);
        this.redisEnabled = false;
      }
    } else {
      logger.info("Campaign processor service initialized in mock mode (Redis disabled)");
    }
  }

  private setupWorkerEvents(): void {
    if (!this.worker) return;
    
    this.worker.on("ready", () => {
      logger.info("Campaign processor worker is ready");
      this.isRunning = true;
    });

    this.worker.on("error", (error) => {
      logger.error("Campaign processor worker error:", error);
    });

    this.worker.on("stalled", (jobId) => {
      logger.warn(`Campaign job ${jobId} stalled`);
    });

    this.worker.on("failed", (job, error) => {
      logger.error(`Campaign job ${job?.id} failed:`, error);
    });

    this.worker.on("completed", (job) => {
      logger.info(`Campaign job ${job.id} completed successfully`);
    });
  }

  private async startMockProcessor(): Promise<void> {
    if (this.mockProcessingInterval) return;
    
    this.mockProcessingInterval = setInterval(async () => {
      try {
        // Process pending executions directly from database
        const pendingExecutions = await CampaignExecution.findAll({
          where: { status: CampaignExecutionStatus.PENDING },
          limit: parseInt(process.env.CAMPAIGN_CONCURRENCY || "1"),
          include: [
            {
              model: Contact,
              include: [{ model: Tenant }]
            },
            { model: Campaign }
          ]
        });

        for (const execution of pendingExecutions) {
          const jobData: CampaignJobData = {
            campaignId: execution.campaignId,
            contactId: execution.contactId,
            tenantId: execution.tenantId,
            executionId: execution.id,
            messageTemplate: execution.campaign.messageTemplate
          };

          // Create mock job
          const mockJob = {
            id: `mock-${execution.id}`,
            data: jobData,
            updateProgress: async (progress: number) => {
              logger.info(`Mock job progress: ${progress}%`);
            }
          } as Job<CampaignJobData>;

          await this.processJob(mockJob);
        }
      } catch (error) {
        logger.error("Error in mock processor:", error);
      }
    }, 5000); // Process every 5 seconds

    logger.info("Mock campaign processor started");
  }

  private stopMockProcessor(): void {
    if (this.mockProcessingInterval) {
      clearInterval(this.mockProcessingInterval);
      this.mockProcessingInterval = null;
      logger.info("Mock campaign processor stopped");
    }
  }

  private async processJob(job: Job<CampaignJobData>): Promise<void> {
    const { campaignId, contactId, tenantId, executionId, messageTemplate } = job.data;

    try {
      // Update job progress
      await job.updateProgress(10);
      logger.info(`Processing campaign job for campaign ${campaignId}, contact ${contactId}`);

      // Get campaign execution
      const execution = await CampaignExecution.findOne({
        where: { id: executionId },
        include: [
          {
            model: Contact,
            include: [{ model: Tenant }]
          },
          { model: Campaign }
        ]
      });

      if (!execution) {
        throw new Error(`Campaign execution ${executionId} not found`);
      }

      if (execution.status !== CampaignExecutionStatus.PENDING) {
        logger.info(`Execution ${executionId} already processed, skipping`);
        return;
      }

      await job.updateProgress(20);

      // Update execution status to sending
      await execution.update({
        status: CampaignExecutionStatus.SENDING
      });

      // Get tenant and contact
      const contact = execution.contact;
      const tenant = contact.tenant;
      const campaign = execution.campaign;

      await job.updateProgress(30);

      // Process message template
      const processedMessage = await MessageTemplateService.processTemplate(
        messageTemplate,
        contact,
        tenant
      );

      await job.updateProgress(50);

      // Get WhatsApp channel for this tenant
      const whatsapp = await Whatsapp.findOne({
        where: {
          tenantId: tenantId,
          status: "CONNECTED"
        }
      });

      if (!whatsapp) {
        throw new Error(`No connected WhatsApp found for tenant ${tenantId}`);
      }

      await job.updateProgress(60);

      // Create channel adapter
      const channelAdapter = new WhatsAppAdapter({
        tenantId: tenantId,
        channelId: whatsapp.id,
        settings: {}
      });

      // Validate connection
      const isConnected = await channelAdapter.validateConnection();
      if (!isConnected) {
        throw new Error("WhatsApp channel not connected");
      }

      await job.updateProgress(70);

      // Send message
      const result = await channelAdapter.sendMessage(
        contact.number,
        processedMessage
      );

      await job.updateProgress(90);

      if (result.success) {
        // Update execution as sent
        await execution.update({
          status: CampaignExecutionStatus.SENT,
          sentAt: new Date(),
          processedMessage: processedMessage,
          metadata: {
            ...execution.metadata,
            messageId: result.messageId,
            externalId: result.externalId,
            channel: "whatsapp"
          }
        });

        // Update campaign statistics
        await this.updateCampaignStats(campaignId);

        logger.info(`Campaign message sent successfully to ${contact.number}`);
      } else {
        throw new Error(result.error || "Failed to send message");
      }

      await job.updateProgress(100);

    } catch (error) {
      logger.error(`Campaign job processing error:`, error);

      // Update execution as failed
      if (executionId) {
        try {
          const execution = await CampaignExecution.findByPk(executionId);
          if (execution) {
            const retryCount = (execution.retryCount || 0) + 1;
            const maxRetries = 3;

            if (retryCount < maxRetries) {
              // Schedule retry with exponential backoff
              const retryDelay = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s
              await execution.update({
                status: CampaignExecutionStatus.PENDING,
                retryCount: retryCount,
                nextRetryAt: new Date(Date.now() + retryDelay),
                errorMessage: error.message
              });

              // Re-throw to trigger Bull retry
              throw error;
            } else {
              // Max retries reached, mark as failed
              await execution.update({
                status: CampaignExecutionStatus.FAILED,
                errorMessage: error.message,
                retryCount: retryCount
              });
            }
          }
        } catch (updateError) {
          logger.error("Error updating execution status:", updateError);
        }
      }

      throw error;
    }
  }

  private async updateCampaignStats(campaignId: number): Promise<void> {
    try {
      const stats = await CampaignExecution.findAll({
        where: { campaignId },
        attributes: [
          'status',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
        ],
        group: ['status'],
        raw: true
      }) as any[];

      const statistics = stats.reduce((acc, stat) => {
        acc[stat.status] = parseInt(stat.count);
        return acc;
      }, {} as Record<string, number>);

      const totalContacts = Object.values(statistics).reduce((sum: number, count) => sum + (count as number), 0);

      const campaign = await Campaign.findByPk(campaignId);
      if (campaign) {
        await campaign.update({
          statistics: {
            totalContacts: totalContacts as number,
            sent: statistics[CampaignExecutionStatus.SENT] || 0,
            delivered: statistics[CampaignExecutionStatus.DELIVERED] || 0,
            failed: statistics[CampaignExecutionStatus.FAILED] || 0,
            pending: statistics[CampaignExecutionStatus.PENDING] || 0
          }
        });

        // Check if campaign is completed
        const pendingCount = statistics[CampaignExecutionStatus.PENDING] || 0;
        const sendingCount = statistics[CampaignExecutionStatus.SENDING] || 0;

        if (pendingCount === 0 && sendingCount === 0) {
          await campaign.update({
            status: CampaignStatus.COMPLETED,
            completedAt: new Date()
          });
          logger.info(`Campaign ${campaignId} completed`);
        }
      }
    } catch (error) {
      logger.error("Error updating campaign statistics:", error);
    }
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn("Campaign processor is already running");
      return;
    }

    try {
      logger.info("Starting campaign processor worker...");
      
      if (this.redisEnabled && this.worker) {
        // Worker starts automatically when created
        this.isRunning = true;
      } else {
        // Start mock processor
        await this.startMockProcessor();
        this.isRunning = true;
      }
      
      logger.info("Campaign processor worker started successfully");
    } catch (error) {
      logger.error("Error starting campaign processor:", error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      logger.warn("Campaign processor is not running");
      return;
    }

    try {
      logger.info("Stopping campaign processor worker...");
      
      if (this.redisEnabled) {
        await this.worker?.close();
        await this.queue?.close();
      } else {
        this.stopMockProcessor();
      }
      
      this.isRunning = false;
      logger.info("Campaign processor worker stopped successfully");
    } catch (error) {
      logger.error("Error stopping campaign processor:", error);
      throw error;
    }
  }

  isProcessorRunning(): boolean {
    return this.isRunning;
  }

  getWorker(): Worker | null {
    return this.worker;
  }

  async getProcessorStats() {
    try {
      if (this.redisEnabled && this.queue) {
        // Get job counts from queue
        const [active, waiting, completed, failed] = await Promise.all([
          this.queue.getActive(),
          this.queue.getWaiting(),
          this.queue.getCompleted(),
          this.queue.getFailed()
        ]);

        const processing = active.length;
        const pending = waiting.length;
        const totalCompleted = completed.length;
        const totalFailed = failed.length;
        const total = processing + pending + totalCompleted + totalFailed;

        return {
          concurrency: this.worker?.opts.concurrency || 1,
          processing,
          pending,
          completed: totalCompleted,
          failed: totalFailed,
          total,
          isRunning: this.isRunning
        };
      } else {
        // Mock stats from database
        const executions = await CampaignExecution.findAll();
        return {
          concurrency: parseInt(process.env.CAMPAIGN_CONCURRENCY || "1"),
          processing: executions.filter(e => e.status === CampaignExecutionStatus.SENDING).length,
          pending: executions.filter(e => e.status === CampaignExecutionStatus.PENDING).length,
          completed: executions.filter(e => e.status === CampaignExecutionStatus.SENT || e.status === CampaignExecutionStatus.DELIVERED).length,
          failed: executions.filter(e => e.status === CampaignExecutionStatus.FAILED).length,
          total: executions.length,
          isRunning: this.isRunning
        };
      }
    } catch (error) {
      logger.error("Error getting processor stats:", error);
      return {
        concurrency: parseInt(process.env.CAMPAIGN_CONCURRENCY || "1"),
        processing: 0,
        pending: 0,
        completed: 0,
        failed: 0,
        total: 0,
        isRunning: this.isRunning
      };
    }
  }
}

export default new CampaignProcessorService();