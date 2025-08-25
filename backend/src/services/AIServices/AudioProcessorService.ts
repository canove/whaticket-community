import { Queue, Worker, Job } from "bullmq";
import { logger } from "../../utils/logger";
import AudioTranscriptionService from "./AudioTranscriptionService";
import { getIO } from "../../libs/socket";
import Redis from "ioredis";

// Interface para dados do job de transcrição
interface AudioTranscriptionJobData {
  messageId: string;
  tenantId: number;
  priority?: number;
  retryAttempts?: number;
}

class AudioProcessorService {
  private static audioQueue: Queue;
  private static worker: Worker;
  private static redis: Redis;

  /**
   * Inicializa o serviço de processamento de áudio
   */
  static async initialize(): Promise<void> {
    try {
      // Configura Redis
      this.redis = new Redis({
        host: process.env.IO_REDIS_SERVER || "localhost",
        port: parseInt(process.env.IO_REDIS_PORT || "6379"),
        password: process.env.IO_REDIS_PASSWORD || undefined,
        db: parseInt(process.env.REDIS_DB_AUDIO || "3")
      });

      // Configura a fila de transcrição
      this.audioQueue = new Queue("audio-transcription", {
        connection: this.redis,
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 5000
          }
        }
      });

      // Configura o worker
      this.worker = new Worker(
        "audio-transcription",
        this.processTranscriptionJob.bind(this),
        {
          connection: this.redis,
          concurrency: parseInt(process.env.AUDIO_WORKER_CONCURRENCY || "2"),
          limiter: {
            max: 10,
            duration: 60000 // 10 jobs por minuto para evitar rate limiting nas APIs
          }
        }
      );

      // Event listeners
      this.setupEventListeners();

      logger.info("AudioProcessorService inicializado com sucesso");

    } catch (error) {
      logger.error("Erro ao inicializar AudioProcessorService:", error);
      throw error;
    }
  }

  /**
   * Configura os event listeners do worker
   */
  private static setupEventListeners(): void {
    this.worker.on("completed", (job: Job) => {
      logger.info(`Job de transcrição ${job.id} concluído para mensagem ${job.data.messageId}`);
      
      // Emite evento via socket para atualizar interface em tempo real
      const io = getIO();
      io.to(`tenant:${job.data.tenantId}`).emit("audio:transcription:completed", {
        messageId: job.data.messageId,
        jobId: job.id
      });
    });

    this.worker.on("failed", (job: Job | undefined, err: Error) => {
      logger.error(`Job de transcrição ${job?.id} falhou:`, {
        messageId: job?.data.messageId,
        error: err.message,
        tenantId: job?.data.tenantId
      });

      // Emite evento de falha
      if (job) {
        const io = getIO();
        io.to(`tenant:${job.data.tenantId}`).emit("audio:transcription:failed", {
          messageId: job.data.messageId,
          error: err.message,
          jobId: job.id
        });
      }
    });

    this.worker.on("progress", (job: Job, progress: number) => {
      logger.debug(`Job ${job.id} progresso: ${progress}%`);
      
      const io = getIO();
      io.to(`tenant:${job.data.tenantId}`).emit("audio:transcription:progress", {
        messageId: job.data.messageId,
        progress,
        jobId: job.id
      });
    });

    this.worker.on("stalled", (jobId: string) => {
      logger.warn(`Job de transcrição ${jobId} travado, será reprocessado`);
    });
  }

  /**
   * Processa um job de transcrição
   */
  private static async processTranscriptionJob(job: Job<AudioTranscriptionJobData>) {
    const { messageId, tenantId } = job.data;
    
    try {
      logger.info(`Iniciando transcrição para mensagem ${messageId}, tenant ${tenantId}`);
      
      // Atualiza progresso
      await job.updateProgress(10);

      // Executa a transcrição
      const result = await AudioTranscriptionService.processAudioMessage(messageId, tenantId);
      
      await job.updateProgress(90);

      if (!result) {
        throw new Error("Transcrição não pôde ser processada");
      }

      if (result.status === "failed") {
        throw new Error(result.errorMessage || "Falha na transcrição");
      }

      await job.updateProgress(100);

      return {
        transcriptionId: result.id,
        transcription: result.transcription,
        confidence: result.confidence,
        provider: result.provider,
        processingTime: result.processingTimeMs
      };

    } catch (error) {
      logger.error(`Erro no job de transcrição ${job.id}:`, error);
      throw error;
    }
  }

  /**
   * Adiciona uma mensagem de áudio à fila para transcrição
   */
  static async queueAudioTranscription(
    messageId: string,
    tenantId: number,
    options: {
      priority?: number;
      delay?: number;
      retryAttempts?: number;
    } = {}
  ): Promise<string> {
    try {
      const job = await this.audioQueue.add(
        "transcribe-audio",
        {
          messageId,
          tenantId,
          retryAttempts: options.retryAttempts || 3
        },
        {
          priority: options.priority || 0,
          delay: options.delay || 0,
          attempts: options.retryAttempts || 3
        }
      );

      logger.info(`Job de transcrição ${job.id} adicionado à fila para mensagem ${messageId}`);
      
      return job.id!;

    } catch (error) {
      logger.error("Erro ao adicionar job à fila:", error);
      throw error;
    }
  }

  /**
   * Obtém estatísticas da fila
   */
  static async getQueueStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    const stats = await this.audioQueue.getJobCounts(
      "waiting",
      "active",
      "completed",
      "failed",
      "delayed"
    );

    return {
      waiting: stats.waiting || 0,
      active: stats.active || 0,
      completed: stats.completed || 0,
      failed: stats.failed || 0,
      delayed: stats.delayed || 0
    };
  }

  /**
   * Lista jobs ativos na fila
   */
  static async getActiveJobs(): Promise<Job[]> {
    return await this.audioQueue.getJobs(["active"], 0, 50);
  }

  /**
   * Lista jobs aguardando na fila
   */
  static async getWaitingJobs(): Promise<Job[]> {
    return await this.audioQueue.getJobs(["waiting"], 0, 50);
  }

  /**
   * Obtém informações sobre um job específico
   */
  static async getJobInfo(jobId: string): Promise<Job | null> {
    return await this.audioQueue.getJob(jobId);
  }

  /**
   * Remove job da fila
   */
  static async removeJob(jobId: string): Promise<void> {
    const job = await this.audioQueue.getJob(jobId);
    if (job) {
      await job.remove();
      logger.info(`Job ${jobId} removido da fila`);
    }
  }

  /**
   * Pausa a fila
   */
  static async pauseQueue(): Promise<void> {
    await this.audioQueue.pause();
    logger.info("Fila de transcrição pausada");
  }

  /**
   * Resume a fila
   */
  static async resumeQueue(): Promise<void> {
    await this.audioQueue.resume();
    logger.info("Fila de transcrição resumida");
  }

  /**
   * Limpa a fila (remove todos os jobs)
   */
  static async clearQueue(): Promise<void> {
    await this.audioQueue.obliterate({ force: true });
    logger.info("Fila de transcrição limpa");
  }

  /**
   * Verifica se um job está na fila
   */
  static async hasJobForMessage(messageId: string): Promise<boolean> {
    const jobs = await this.audioQueue.getJobs(["waiting", "active", "delayed"], 0, 1000);
    return jobs.some(job => job.data.messageId === messageId);
  }

  /**
   * Obtém métricas de performance
   */
  static async getPerformanceMetrics(hours = 24): Promise<{
    totalProcessed: number;
    avgProcessingTime: number;
    successRate: number;
    errorRate: number;
  }> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const completedJobs = await this.audioQueue.getJobs(["completed"], 0, 1000);
    const failedJobs = await this.audioQueue.getJobs(["failed"], 0, 1000);
    
    const recentCompleted = completedJobs.filter(job => 
      job.finishedOn && new Date(job.finishedOn) > since
    );
    
    const recentFailed = failedJobs.filter(job => 
      job.finishedOn && new Date(job.finishedOn) > since
    );

    const totalProcessed = recentCompleted.length + recentFailed.length;
    const avgProcessingTime = recentCompleted.length > 0 
      ? recentCompleted.reduce((sum, job) => {
          return sum + (job.finishedOn! - job.processedOn!);
        }, 0) / recentCompleted.length
      : 0;

    const successRate = totalProcessed > 0 
      ? (recentCompleted.length / totalProcessed) * 100 
      : 100;

    const errorRate = totalProcessed > 0 
      ? (recentFailed.length / totalProcessed) * 100 
      : 0;

    return {
      totalProcessed,
      avgProcessingTime,
      successRate,
      errorRate
    };
  }

  /**
   * Encerra o serviço
   */
  static async shutdown(): Promise<void> {
    try {
      if (this.worker) {
        await this.worker.close();
      }
      
      if (this.audioQueue) {
        await this.audioQueue.close();
      }

      if (this.redis) {
        await this.redis.quit();
      }

      logger.info("AudioProcessorService encerrado");

    } catch (error) {
      logger.error("Erro ao encerrar AudioProcessorService:", error);
    }
  }
}

export default AudioProcessorService;