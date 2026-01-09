import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProvider, AIResponse } from './ai-provider.interface';
import axios from 'axios';

@Injectable()
export class OpenAIProvider implements AIProvider {
    name = 'openai';
    private readonly logger = new Logger(OpenAIProvider.name);
    private readonly apiKey: string;

    constructor(private readonly configService: ConfigService) {
        this.apiKey = this.configService.get<string>('OPENAI_API_KEY') || '';
    }

    async generateText(systemPrompt: string, userMessage: string, options?: any): Promise<AIResponse> {
        const apiKey = options?.apiKey || this.apiKey;
        const temperature = options?.temperature || 0.7;
        const maxTokens = options?.maxTokens || 500;

        if (!apiKey) {
            throw new Error('OpenAI API Key not configured');
        }

        try {
            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userMessage },
                    ],
                    max_tokens: maxTokens,
                    temperature: temperature,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            return {
                text: response.data.choices[0].message.content,
            };
        } catch (error: any) {
            this.logger.error(`OpenAI Request Failed: ${error.message}`);
            throw error;
        }
    }
}
