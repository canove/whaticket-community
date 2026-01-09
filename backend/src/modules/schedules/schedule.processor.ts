import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

export const SCHEDULE_QUEUE = 'schedule-queue';

export interface ScheduleJobData {
    scheduleId: number;
}

@Injectable()
@Processor(SCHEDULE_QUEUE)
export class ScheduleProcessor extends WorkerHost {
    private readonly logger = new Logger(ScheduleProcessor.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly eventEmitter: EventEmitter2,
    ) {
        super();
    }

    async process(job: Job<ScheduleJobData>): Promise<void> {
        const { scheduleId } = job.data;
        this.logger.log(`Processing scheduled message: ${scheduleId}`);

        try {
            const schedule = await this.prisma.schedule.findUnique({
                where: { id: scheduleId },
                include: {
                    contact: true,
                    ticket: true,
                },
            });

            if (!schedule) {
                this.logger.warn(`Schedule ${scheduleId} not found`);
                return;
            }

            if (schedule.status !== 'pending') {
                this.logger.warn(`Schedule ${scheduleId} is not pending (status: ${schedule.status})`);
                return;
            }

            // Emit event to send message via WhatsApp
            this.eventEmitter.emit('schedule.send', {
                scheduleId: schedule.id,
                contactId: schedule.contactId,
                contactNumber: schedule.contact.number,
                body: schedule.body,
                ticketId: schedule.ticketId,
            });

            // Update schedule status
            await this.prisma.schedule.update({
                where: { id: scheduleId },
                data: {
                    status: 'sent',
                    sentAt: new Date(),
                },
            });

            this.logger.log(`Schedule ${scheduleId} sent successfully`);
        } catch (error) {
            this.logger.error(`Failed to process schedule ${scheduleId}:`, error);

            await this.prisma.schedule.update({
                where: { id: scheduleId },
                data: { status: 'failed' },
            });

            throw error;
        }
    }
}
