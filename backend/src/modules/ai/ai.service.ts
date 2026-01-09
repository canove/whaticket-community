import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { AIProvider } from './providers/ai-provider.interface';
import { OpenAIProvider } from './providers/openai.provider';
import { GeminiProvider } from './providers/gemini.provider';

@Injectable()
export class AIService {
    private providers: Map<string, AIProvider> = new Map();

    constructor(
        private readonly openaiHelper: OpenAIProvider,
        private readonly geminiHelper: GeminiProvider,
    ) {
        this.registerProvider(openaiHelper);
        this.registerProvider(geminiHelper);
    }

    private registerProvider(provider: AIProvider) {
        this.providers.set(provider.name, provider);
    }

    async generate(providerName: string, systemPrompt: string, userMessage: string, options?: any) {
        const provider = this.providers.get(providerName);
        if (!provider) {
            throw new Error(`Provider ${providerName} not found`);
        }
        return provider.generateText(systemPrompt, userMessage, options);
    }
}
