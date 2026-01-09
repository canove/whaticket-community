import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProvider, AIResponse } from './ai-provider.interface';
import axios from 'axios';

@Injectable()
export class GeminiProvider implements AIProvider {
    name = 'gemini';
    private readonly logger = new Logger(GeminiProvider.name);
    private readonly apiKey: string;

    constructor(private readonly configService: ConfigService) {
        this.apiKey = this.configService.get<string>('GEMINI_API_KEY') || '';
    }

    async generateText(systemPrompt: string, userMessage: string, options?: any): Promise<AIResponse> {
        const apiKey = options?.apiKey || this.apiKey;
        const maxTokens = options?.maxTokens || 500;

        if (!apiKey) {
            throw new Error('Gemini API Key not configured');
        }

        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
            const response = await axios.post(
                url,
                {
                    contents: [
                        {
                            role: 'user',
                            parts: [{ text: `${systemPrompt}\n\nUser: ${userMessage}` }]
                        }
                    ],
                    generationConfig: {
                        maxOutputTokens: maxTokens,
                    }
                },
                {
                    headers: { 'Content-Type': 'application/json' },
                }
            );

            // Gemini response structure
            const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            return {
                text,
            };
        } catch (error: any) {
            this.logger.error(`Gemini Request Failed: ${error.message}`);
            throw error;
        }
    }
}
