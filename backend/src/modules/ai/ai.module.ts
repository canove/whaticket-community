import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AIService } from './ai.service';
import { OpenAIProvider } from './providers/openai.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { AIProcessor } from './ai.processor';
import { MessagesModule } from '../messages';
import { PrismaService } from '../../database/prisma.service';

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'ai_processing',
        }),
        MessagesModule,
    ],
    providers: [
        AIService,
        OpenAIProvider,
        GeminiProvider,
        AIProcessor,
        PrismaService,
    ],
    exports: [AIService],
})
export class AIModule { }
