import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { CampaignProcessor, CAMPAIGN_QUEUE } from './campaign.processor';
import { CampaignQueueService } from './campaign-queue.service';

@Module({
    imports: [
        BullModule.registerQueue({ name: CAMPAIGN_QUEUE }),
    ],
    controllers: [CampaignsController],
    providers: [CampaignsService, CampaignProcessor, CampaignQueueService],
    exports: [CampaignsService, CampaignQueueService],
})
export class CampaignsModule { }
