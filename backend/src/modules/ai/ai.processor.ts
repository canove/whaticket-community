import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { AIService } from './ai.service';
import { MessagesService } from '../messages/messages.service';
import { PrismaService } from '../../database/prisma.service';

@Processor('ai_processing')
export class AIProcessor extends WorkerHost {
    private readonly logger = new Logger(AIProcessor.name);

    constructor(
        private readonly aiService: AIService,
        private readonly messagesService: MessagesService,
        private readonly prisma: PrismaService,
    ) {
        super();
    }

    async process(job: Job): Promise<any> {
        const { ticketId, messageBody, contactName, promptId } = job.data;
        this.logger.log(`Processing AI message for Ticket ${ticketId} with Prompt ${promptId}`);

        try {
            // 1. Fetch Prompt
            const prompt = await this.prisma.prompt.findUnique({ where: { id: promptId } });
            if (!prompt) {
                this.logger.warn(`Prompt ${promptId} not found, skipping AI.`);
                return;
            }

            // 2. Prepare Context
            let systemPrompt = prompt.prompt;
            systemPrompt = systemPrompt.replace('{name}', contactName);

            // 3. Generate Answer
            const providerName = prompt.apiKey.startsWith('sk-') ? 'openai' : 'gemini';
            const aiResponse = await this.aiService.generate(providerName, systemPrompt, messageBody, {
                apiKey: prompt.apiKey,
                temperature: prompt.temperature,
                maxTokens: prompt.maxTokens,
            });

            // 4. Send Response
            await this.messagesService.send({
                ticketId,
                body: `🤖 ${aiResponse.text}`,
                quotedMsgId: undefined
            }, null);

        } catch (error) {
            this.logger.error(`Failed to process AI message: ${error}`);
        }
    }
}
