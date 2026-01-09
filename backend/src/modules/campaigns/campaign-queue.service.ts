import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../database/prisma.service';
import { CAMPAIGN_QUEUE, CampaignJobData } from './campaign.processor';

@Injectable()
export class CampaignQueueService {
    private readonly logger = new Logger(CampaignQueueService.name);
    private readonly MESSAGE_DELAY_MS = 3000; // 3 seconds between messages

    constructor(
        @InjectQueue(CAMPAIGN_QUEUE) private readonly campaignQueue: Queue<CampaignJobData>,
        private readonly prisma: PrismaService,
    ) { }

    async startCampaign(campaignId: number) {
        const campaign = await this.prisma.campaign.findUnique({
            where: { id: campaignId },
            include: { contacts: true },
        });

        if (!campaign) {
            throw new Error('Campaign not found');
        }

        this.logger.log(`Starting campaign ${campaignId} with ${campaign.contacts.length} contacts`);

        let delay = 0;
        for (const campaignContact of campaign.contacts) {
            if (campaignContact.status === 'pending') {
                await this.addToQueue(campaignId, campaignContact.contactId, campaignContact.id, delay);
                delay += this.MESSAGE_DELAY_MS;
            }
        }

        this.logger.log(`Queued ${campaign.contacts.length} messages for campaign ${campaignId}`);
    }

    private async addToQueue(campaignId: number, contactId: number, campaignContactId: number, delay: number) {
        await this.campaignQueue.add(
            'send-campaign-message',
            { campaignId, contactId, campaignContactId },
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
    }

    @OnEvent('campaign.completed')
    async handleCampaignCompleted(campaignId: number) {
        // Check if all contacts have been processed
        const pendingCount = await this.prisma.campaignContact.count({
            where: { campaignId, status: 'pending' },
        });

        if (pendingCount === 0) {
            await this.prisma.campaign.update({
                where: { id: campaignId },
                data: {
                    status: 'completed',
                    completedAt: new Date(),
                },
            });
            this.logger.log(`Campaign ${campaignId} completed`);
        }
    }
}
