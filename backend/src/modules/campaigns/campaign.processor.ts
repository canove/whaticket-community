import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

export const CAMPAIGN_QUEUE = 'campaign-queue';

export interface CampaignJobData {
    campaignId: number;
    contactId: number;
    campaignContactId: number;
}

@Injectable()
@Processor(CAMPAIGN_QUEUE)
export class CampaignProcessor extends WorkerHost {
    private readonly logger = new Logger(CampaignProcessor.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly eventEmitter: EventEmitter2,
    ) {
        super();
    }

    async process(job: Job<CampaignJobData>): Promise<void> {
        const { campaignId, contactId, campaignContactId } = job.data;
        this.logger.log(`Processing campaign ${campaignId} for contact ${contactId}`);

        try {
            const campaign = await this.prisma.campaign.findUnique({
                where: { id: campaignId },
            });

            if (!campaign || campaign.status !== 'running') {
                this.logger.warn(`Campaign ${campaignId} is not running`);
                return;
            }

            const contact = await this.prisma.contact.findUnique({
                where: { id: contactId },
            });

            if (!contact) {
                this.logger.warn(`Contact ${contactId} not found`);
                return;
            }

            // Personalize message
            const personalizedMessage = campaign.message.replace(/{nome}/gi, contact.name);

            // Emit event to send message via WhatsApp
            this.eventEmitter.emit('campaign.send', {
                campaignId,
                contactId,
                contactNumber: contact.number,
                body: personalizedMessage,
            });

            // Update campaign contact status
            await this.prisma.campaignContact.update({
                where: { id: campaignContactId },
                data: {
                    status: 'sent',
                    sentAt: new Date(),
                },
            });

            this.logger.log(`Campaign ${campaignId} message sent to contact ${contactId}`);
        } catch (error) {
            this.logger.error(`Failed to send campaign message:`, error);

            await this.prisma.campaignContact.update({
                where: { id: campaignContactId },
                data: { status: 'failed' },
            });

            throw error;
        }
    }
}
