import { PrismaService } from '../../database/prisma.service';
import { BaileysService } from './baileys.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Whatsapp, WhatsappStatus } from '@prisma/client';
export declare class WhatsappService {
    private readonly prisma;
    private readonly baileys;
    private readonly eventEmitter;
    private readonly logger;
    constructor(prisma: PrismaService, baileys: BaileysService, eventEmitter: EventEmitter2);
    findAll(): Promise<Whatsapp[]>;
    findOne(id: number): Promise<Whatsapp>;
    findDefault(): Promise<Whatsapp | null>;
    create(data: {
        name: string;
        greetingMessage?: string;
        farewellMessage?: string;
        isDefault?: boolean;
        queueIds?: number[];
    }): Promise<Whatsapp>;
    update(id: number, data: {
        name?: string;
        greetingMessage?: string;
        farewellMessage?: string;
        isDefault?: boolean;
        queueIds?: number[];
    }): Promise<Whatsapp>;
    delete(id: number): Promise<void>;
    initSession(id: number): Promise<{
        qrCode?: string;
        status: string;
    }>;
    logout(id: number): Promise<void>;
    updateStatus(id: number, status: WhatsappStatus, qrcode?: string): Promise<void>;
    startAllSessions(): Promise<void>;
    getSessionStatus(id: number): {
        connected: boolean;
        status: string;
    };
}
