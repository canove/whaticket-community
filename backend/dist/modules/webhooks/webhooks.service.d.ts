import { PrismaService } from '../../database/prisma.service';
import { CreateWebhookDto, UpdateWebhookDto } from './dto';
import { Queue } from 'bullmq';
export declare class WebhooksService {
    private readonly prisma;
    private readonly webhookQueue;
    private readonly logger;
    constructor(prisma: PrismaService, webhookQueue: Queue);
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
    trigger(event: string, payload: any): Promise<void>;
}
