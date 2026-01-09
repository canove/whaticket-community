export interface AIResponse {
    text: string;
    // can add more metadata (usage tokens, etc)
}

export interface AIOptions {
    apiKey?: string;
    temperature?: number;
    maxTokens?: number;
    model?: string;
}

export interface AIProvider {
    name: string;
    generateText(systemPrompt: string, userMessage: string, options?: AIOptions): Promise<AIResponse>;
}
