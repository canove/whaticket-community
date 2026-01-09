import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { WebhooksProcessor } from './webhooks.processor';
import { PrismaService } from '../../database/prisma.service';

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'webhooks',
        }),
    ],
    controllers: [WebhooksController],
    providers: [WebhooksService, WebhooksProcessor, PrismaService],
    exports: [WebhooksService],
})
export class WebhooksModule { }
