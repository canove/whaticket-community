import { WebhooksService } from './webhooks.service';
import { CreateWebhookDto, UpdateWebhookDto } from './dto';
export declare class WebhooksController {
    private readonly webhooksService;
    constructor(webhooksService: WebhooksService);
    create(dto: CreateWebhookDto): Promise<{
        url: string;
        name: string;
        token: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        enabled: boolean;
        events: string[];
    }>;
    findAll(): Promise<{
        url: string;
        name: string;
        token: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        enabled: boolean;
        events: string[];
    }[]>;
    findOne(id: number): Promise<{
        url: string;
        name: string;
        token: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        enabled: boolean;
        events: string[];
    } | null>;
    update(id: number, dto: UpdateWebhookDto): Promise<{
        url: string;
        name: string;
        token: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        enabled: boolean;
        events: string[];
    }>;
    delete(id: number): Promise<{
        url: string;
        name: string;
        token: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        enabled: boolean;
        events: string[];
    }>;
}
