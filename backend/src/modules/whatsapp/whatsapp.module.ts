import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bullmq';
import { BaileysService } from './baileys.service';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';
import { MessageHandler } from './handlers/message.handler';

@Module({
    imports: [
        ConfigModule,
        EventEmitterModule.forRoot({
            wildcard: true,
            delimiter: '.',
            maxListeners: 20,
            verboseMemoryLeak: true,
        }),
        BullModule.registerQueue({
            name: 'ai_processing',
        }),
    ],
    controllers: [WhatsappController],
    providers: [BaileysService, WhatsappService, MessageHandler],
    exports: [BaileysService, WhatsappService],
})
export class WhatsappModule { }
