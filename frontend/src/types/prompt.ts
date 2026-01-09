export interface Prompt {
    id: number;
    name: string;
    apiKey: string;
    prompt: string;
    maxTokens: number;
    temperature: number;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    voice?: string;
    voiceKey?: string;
    voiceRegion?: string;
    createdAt: string;
    updatedAt: string;
}
