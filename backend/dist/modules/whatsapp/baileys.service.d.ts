import { OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WASocket, MessageUpsertType, WAMessage } from '@whiskeysockets/baileys';
export interface WhatsAppSession {
    id: number;
    socket: WASocket;
    status: 'connecting' | 'connected' | 'disconnected' | 'qrcode';
    qrCode?: string;
    retries: number;
}
export interface MessageReceivedEvent {
    sessionId: number;
    message: WAMessage;
    type: MessageUpsertType;
}
export interface QRCodeEvent {
    sessionId: number;
    qrCode: string;
}
export interface ConnectionEvent {
    sessionId: number;
    status: 'connected' | 'disconnected' | 'connecting';
    reason?: string;
}
export declare class BaileysService implements OnModuleDestroy {
    private readonly configService;
    private readonly eventEmitter;
    private readonly logger;
    private sessions;
    private readonly sessionsPath;
    private readonly reconnectInterval;
    constructor(configService: ConfigService, eventEmitter: EventEmitter2);
    onModuleDestroy(): Promise<void>;
    initSession(whatsappId: number, name: string): Promise<WhatsAppSession>;
    private handleConnectionUpdate;
    private handleMessagesUpsert;
    sendTextMessage(whatsappId: number, to: string, text: string): Promise<WAMessage | undefined>;
    sendMediaMessage(whatsappId: number, to: string, media: {
        type: 'image' | 'video' | 'audio' | 'document';
        url?: string;
        buffer?: Buffer;
        mimetype: string;
        filename?: string;
        caption?: string;
    }): Promise<WAMessage | undefined>;
    getProfilePicture(whatsappId: number, contactNumber: string): Promise<string | undefined>;
    checkNumberExists(whatsappId: number, number: string): Promise<boolean>;
    logout(whatsappId: number): Promise<void>;
    clearSession(whatsappId: number): Promise<void>;
    getSession(whatsappId: number): WhatsAppSession | undefined;
    getAllSessions(): WhatsAppSession[];
    isConnected(whatsappId: number): boolean;
    private formatJid;
}
