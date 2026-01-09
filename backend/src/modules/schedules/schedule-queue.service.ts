import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../database/prisma.service';
import { SCHEDULE_QUEUE, ScheduleJobData } from './schedule.processor';

@Injectable()
export class ScheduleQueueService implements OnModuleInit {
    private readonly logger = new Logger(ScheduleQueueService.name);

    constructor(
        @InjectQueue(SCHEDULE_QUEUE) private readonly scheduleQueue: Queue<ScheduleJobData>,
        private readonly prisma: PrismaService,
    ) { }

    async onModuleInit() {
        this.logger.log('Schedule Queue Service initialized');
        await this.processPendingSchedules();
    }

    @Cron(CronExpression.EVERY_MINUTE)
    async processPendingSchedules() {
        const now = new Date();

        const pendingSchedules = await this.prisma.schedule.findMany({
            where: {
                status: 'pending',
                sendAt: { lte: now },
            },
            take: 100,
        });

        if (pendingSchedules.length > 0) {
            this.logger.log(`Found ${pendingSchedules.length} pending schedules to process`);
        }

        for (const schedule of pendingSchedules) {
            await this.addToQueue(schedule.id);
        }
    }

    async addToQueue(scheduleId: number, delay?: number) {
        await this.scheduleQueue.add(
            'send-scheduled-message',
            { scheduleId },
            {
                delay,
                removeOnComplete: true,
                removeOnFail: false,
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
            },
        );
        this.logger.log(`Added schedule ${scheduleId} to queue`);
    }

    async scheduleMessage(scheduleId: number, sendAt: Date) {
        const delay = sendAt.getTime() - Date.now();

        if (delay <= 0) {
            await this.addToQueue(scheduleId);
        } else {
            await this.addToQueue(scheduleId, delay);
        }
    }
}
