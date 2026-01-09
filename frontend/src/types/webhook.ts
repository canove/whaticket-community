export interface Webhook {
    id: number;
    name: string;
    url: string;
    enabled: boolean;
    events: string[];
    token?: string;
    createdAt: string;
    updatedAt: string;
}

export interface WebhookListParams {
    search?: string;
    page?: number;
    limit?: number;
}
