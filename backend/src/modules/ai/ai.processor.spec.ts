import { Job } from 'bullmq';

// Mock the MessagesService to avoid loading Baileys (ESM) which crashes Jest
jest.mock('../messages/messages.service', () => ({
    MessagesService: jest.fn().mockImplementation(() => ({
        send: jest.fn(),
    })),
}));

import { AIProcessor } from './ai.processor';
import { AIService } from './ai.service';
import { MessagesService } from '../messages/messages.service';
import { PrismaService } from '../../database/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('AIProcessor', () => {
    let processor: AIProcessor;
    let aiService: AIService;
    let messagesService: MessagesService;
    let prismaService: PrismaService;

    const mockAIService = {
        generate: jest.fn(),
    };

    const mockMessagesService = {
        send: jest.fn(),
    };

    const mockPrismaService = {
        prompt: {
            findUnique: jest.fn(),
        },
    };

    beforeEach(async () => {
        jest.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AIProcessor,
                { provide: AIService, useValue: mockAIService },
                { provide: MessagesService, useValue: mockMessagesService },
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        processor = module.get<AIProcessor>(AIProcessor);
        aiService = module.get<AIService>(AIService);
        messagesService = module.get<MessagesService>(MessagesService);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(processor).toBeDefined();
    });

    describe('process', () => {
        it('should process a valid job and send response via OpenAI', async () => {
            const job = {
                data: {
                    ticketId: 1,
                    messageBody: 'Hello',
                    contactName: 'John',
                    promptId: 1,
                },
            } as Job;

            const mockPrompt = {
                id: 1,
                name: 'Test Bot',
                apiKey: 'sk-123456',
                prompt: 'You are a bot, hello {name}',
                maxTokens: 100,
                temperature: 0.5,
            };

            const mockAIResponse = {
                text: 'Hello John!',
            };

            mockPrismaService.prompt.findUnique.mockResolvedValue(mockPrompt);
            mockAIService.generate.mockResolvedValue(mockAIResponse);

            await processor.process(job);

            expect(mockPrismaService.prompt.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });

            // Check if context variable was replaced
            const expectedSystemPrompt = 'You are a bot, hello John';

            // Check if correct provider was selected based on Key
            expect(mockAIService.generate).toHaveBeenCalledWith(
                'openai',
                expectedSystemPrompt,
                'Hello',
                {
                    apiKey: 'sk-123456',
                    maxTokens: 100,
                    temperature: 0.5
                }
            );

            expect(mockMessagesService.send).toHaveBeenCalledWith({
                ticketId: 1,
                body: '🤖 Hello John!',
                quotedMsgId: undefined
            }, null);
        });

        it('should process a valid job and send response via Gemini', async () => {
            const job = {
                data: {
                    ticketId: 2,
                    messageBody: 'Hi',
                    contactName: 'Jane',
                    promptId: 2,
                },
            } as Job;

            const mockPrompt = {
                id: 2,
                name: 'Gemini Bot',
                apiKey: 'AIzaSy123456', // Not starting with sk-
                prompt: 'Help me',
                maxTokens: 200,
                temperature: 0.8,
            };

            const mockAIResponse = {
                text: 'Hi Jane!',
            };

            mockPrismaService.prompt.findUnique.mockResolvedValue(mockPrompt);
            mockAIService.generate.mockResolvedValue(mockAIResponse);

            await processor.process(job);

            expect(mockAIService.generate).toHaveBeenCalledWith(
                'gemini',
                'Help me',
                'Hi',
                {
                    apiKey: 'AIzaSy123456',
                    maxTokens: 200,
                    temperature: 0.8
                }
            );
        });

        it('should skip processing if prompt is not found', async () => {
            const job = {
                data: { ticketId: 1, promptId: 999 },
            } as Job;

            mockPrismaService.prompt.findUnique.mockResolvedValue(null);

            await processor.process(job);

            expect(mockAIService.generate).not.toHaveBeenCalled();
            expect(mockMessagesService.send).not.toHaveBeenCalled();
        });

        it('should handle AI service errors gracefully', async () => {
            const job = {
                data: { ticketId: 1, promptId: 1, messageBody: 'Error' },
            } as Job;

            const mockPrompt = {
                id: 1,
                apiKey: 'sk-123',
                prompt: 'sys',
            };

            mockPrismaService.prompt.findUnique.mockResolvedValue(mockPrompt);
            mockAIService.generate.mockRejectedValue(new Error('API Error'));

            await processor.process(job);

            // Should check error logging if possible, but mainly ensure it doesn't crash the worker
            expect(mockMessagesService.send).not.toHaveBeenCalled();
        });
    });
});
