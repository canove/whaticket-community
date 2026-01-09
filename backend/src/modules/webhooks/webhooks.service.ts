import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateWebhookDto, UpdateWebhookDto } from './dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Webhook } from '@prisma/client';

@Injectable()
export class WebhooksService {
    private readonly logger = new Logger(WebhooksService.name);

    constructor(
        private readonly prisma: PrismaService,
        @InjectQueue('webhooks') private readonly webhookQueue: Queue,
    ) { }

    async create(dto: CreateWebhookDto) {
        return this.prisma.webhook.create({
            data: dto,
        });
    }

    async findAll() {
        return this.prisma.webhook.findMany();
    }

    async findOne(id: number) {
        return this.prisma.webhook.findUnique({ where: { id } });
    }

    async update(id: number, dto: UpdateWebhookDto) {
        return this.prisma.webhook.update({
            where: { id },
            data: dto,
        });
    }

    async delete(id: number) {
        return this.prisma.webhook.delete({ where: { id } });
    }

    async trigger(event: string, payload: any) {
        const webhooks = await this.prisma.webhook.findMany({
            where: {
                enabled: true,
                events: { has: event },
            },
        });

        if (webhooks.length === 0) return;

        this.logger.log(`Triggering specific event: ${event} for ${webhooks.length} webhooks`);

        const jobs = webhooks.map((webhook: Webhook) => ({
            name: 'dispatch',
            data: {
                webhook,
                event,
                payload,
            },
            opts: {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000,
                },
                removeOnComplete: true,
            },
        }));

        await this.webhookQueue.addBulk(jobs);
    }
}
