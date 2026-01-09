import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import makeWASocket, {
    DisconnectReason,
    useMultiFileAuthState,
    WASocket,
    ConnectionState,
    MessageUpsertType,
    WAMessage,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import * as qrcode from 'qrcode-terminal';
import * as path from 'path';
import * as fs from 'fs/promises';
import pino from 'pino';

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

@Injectable()
export class BaileysService implements OnModuleDestroy {
    private readonly logger = new Logger(BaileysService.name);
    private sessions: Map<number, WhatsAppSession> = new Map();
    private readonly sessionsPath: string;
    private readonly reconnectInterval: number;

    constructor(
        private readonly configService: ConfigService,
        private readonly eventEmitter: EventEmitter2,
    ) {
        this.sessionsPath = this.configService.get<string>('whatsapp.sessionsPath', './sessions');
        this.reconnectInterval = this.configService.get<number>('whatsapp.reconnectInterval', 5000);
    }

    async onModuleDestroy() {
        this.logger.log('Closing all WhatsApp sessions...');
        for (const [id, session] of this.sessions) {
            try {
                session.socket.end(undefined);
                this.logger.log(`Session ${id} closed`);
            } catch (error) {
                this.logger.error(`Error closing session ${id}:`, error);
            }
        }
        this.sessions.clear();
    }

    async initSession(whatsappId: number, name: string): Promise<WhatsAppSession> {
        const existingSession = this.sessions.get(whatsappId);
        if (existingSession && existingSession.status === 'connected') {
            this.logger.log(`Session ${whatsappId} already connected`);
            return existingSession;
        }

        const sessionPath = path.join(this.sessionsPath, `session_${whatsappId}`);
        await fs.mkdir(sessionPath, { recursive: true });

        const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

        const socket = makeWASocket({
            auth: state,
            logger: pino({ level: 'silent' }) as any,
            browser: ['Whaticket Enterprise', 'Chrome', '22.0.0'],
            markOnlineOnConnect: true,
            syncFullHistory: false,
            generateHighQualityLinkPreview: true,
            connectTimeoutMs: 60000, // 60 seconds timeout
            defaultQueryTimeoutMs: 60000,
            keepAliveIntervalMs: 25000,
            retryRequestDelayMs: 250,
        });

        const session: WhatsAppSession = {
            id: whatsappId,
            socket,
            status: 'connecting',
            retries: 0,
        };

        this.sessions.set(whatsappId, session);

        // Handle connection updates
        socket.ev.on('connection.update', async (update: Partial<ConnectionState>) => {
            await this.handleConnectionUpdate(session, update, name);
        });

        // Save credentials on update
        socket.ev.on('creds.update', saveCreds);

        // Handle incoming messages
        socket.ev.on('messages.upsert', async ({ messages, type }) => {
            await this.handleMessagesUpsert(session, messages, type);
        });

        // Handle message status updates
        socket.ev.on('messages.update', async (updates) => {
            for (const update of updates) {
                this.eventEmitter.emit('whatsapp.message.update', {
                    sessionId: whatsappId,
                    messageId: update.key.id,
                    update,
                });
            }
        });

        return session;
    }

    private async handleConnectionUpdate(
        session: WhatsAppSession,
        update: Partial<ConnectionState>,
        name: string,
    ): Promise<void> {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            session.status = 'qrcode';
            session.qrCode = qr;

            this.logger.log(`Session ${session.id} (${name}): QR Code generated`);
            qrcode.generate(qr, { small: true });

            this.eventEmitter.emit('whatsapp.qrcode', {
                sessionId: session.id,
                qrCode: qr,
            } as QRCodeEvent);
        }

        if (connection === 'close') {
            const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

            this.logger.warn(
                `Session ${session.id} (${name}) disconnected. ` +
                `Reason: ${DisconnectReason[statusCode] || statusCode}. ` +
                `Reconnecting: ${shouldReconnect}`
            );

            session.status = 'disconnected';

            this.eventEmitter.emit('whatsapp.connection', {
                sessionId: session.id,
                status: 'disconnected',
                reason: DisconnectReason[statusCode] || `Status code: ${statusCode}`,
            } as ConnectionEvent);

            if (shouldReconnect) {
                session.retries++;
                if (session.retries < 5) {
                    setTimeout(() => {
                        this.initSession(session.id, name);
                    }, this.reconnectInterval * session.retries);
                } else {
                    this.logger.error(`Session ${session.id} max retries reached`);
                }
            } else {
                // Logged out - clear session
                await this.clearSession(session.id);
            }
        }

        if (connection === 'open') {
            session.status = 'connected';
            session.retries = 0;
            session.qrCode = undefined;

            this.logger.log(`Session ${session.id} (${name}): Connected successfully`);

            this.eventEmitter.emit('whatsapp.connection', {
                sessionId: session.id,
                status: 'connected',
            } as ConnectionEvent);
        }
    }

    private async handleMessagesUpsert(
        session: WhatsAppSession,
        messages: WAMessage[],
        type: MessageUpsertType,
    ): Promise<void> {
        for (const message of messages) {
            // Ignore status broadcast messages
            if (message.key.remoteJid === 'status@broadcast') {
                continue;
            }

            this.logger.debug(
                `Session ${session.id}: Message received from ${message.key.remoteJid}`
            );

            this.eventEmitter.emit('whatsapp.message.received', {
                sessionId: session.id,
                message,
                type,
            } as MessageReceivedEvent);
        }
    }

    async sendTextMessage(
        whatsappId: number,
        to: string,
        text: string,
    ): Promise<WAMessage | undefined> {
        const session = this.sessions.get(whatsappId);
        if (!session || session.status !== 'connected') {
            throw new Error(`Session ${whatsappId} is not connected`);
        }

        const jid = this.formatJid(to);
        return session.socket.sendMessage(jid, { text });
    }

    async sendMediaMessage(
        whatsappId: number,
        to: string,
        media: {
            type: 'image' | 'video' | 'audio' | 'document';
            url?: string;
            buffer?: Buffer;
            mimetype: string;
            filename?: string;
            caption?: string;
        },
    ): Promise<WAMessage | undefined> {
        const session = this.sessions.get(whatsappId);
        if (!session || session.status !== 'connected') {
            throw new Error(`Session ${whatsappId} is not connected`);
        }

        const jid = this.formatJid(to);

        const mediaContent = media.buffer
            ? media.buffer
            : { url: media.url! };

        const messageContent: Record<string, unknown> = {
            mimetype: media.mimetype,
            caption: media.caption,
        };

        switch (media.type) {
            case 'image':
                messageContent.image = mediaContent;
                break;
            case 'video':
                messageContent.video = mediaContent;
                break;
            case 'audio':
                messageContent.audio = mediaContent;
                messageContent.ptt = false;
                break;
            case 'document':
                messageContent.document = mediaContent;
                messageContent.fileName = media.filename;
                break;
        }

        return session.socket.sendMessage(jid, messageContent as any);
    }

    async getProfilePicture(
        whatsappId: number,
        contactNumber: string,
    ): Promise<string | undefined> {
        const session = this.sessions.get(whatsappId);
        if (!session || session.status !== 'connected') {
            return undefined;
        }

        try {
            const jid = this.formatJid(contactNumber);
            return await session.socket.profilePictureUrl(jid, 'image');
        } catch {
            return undefined;
        }
    }

    async checkNumberExists(
        whatsappId: number,
        number: string,
    ): Promise<boolean> {
        const session = this.sessions.get(whatsappId);
        if (!session || session.status !== 'connected') {
            throw new Error(`Session ${whatsappId} is not connected`);
        }

        try {
            const jid = this.formatJid(number);
            const results = await session.socket.onWhatsApp(jid);
            const result = results?.[0];
            return result?.exists || false;
        } catch {
            return false;
        }
    }

    async logout(whatsappId: number): Promise<void> {
        const session = this.sessions.get(whatsappId);
        if (session) {
            await session.socket.logout();
            await this.clearSession(whatsappId);
        }
    }

    async clearSession(whatsappId: number): Promise<void> {
        this.sessions.delete(whatsappId);
        const sessionPath = path.join(this.sessionsPath, `session_${whatsappId}`);
        try {
            await fs.rm(sessionPath, { recursive: true, force: true });
            this.logger.log(`Session ${whatsappId} cleared`);
        } catch (error) {
            this.logger.error(`Error clearing session ${whatsappId}:`, error);
        }
    }

    getSession(whatsappId: number): WhatsAppSession | undefined {
        return this.sessions.get(whatsappId);
    }

    getAllSessions(): WhatsAppSession[] {
        return Array.from(this.sessions.values());
    }

    isConnected(whatsappId: number): boolean {
        const session = this.sessions.get(whatsappId);
        return session?.status === 'connected';
    }

    private formatJid(number: string): string {
        const cleanNumber = number.replace(/\D/g, '');
        if (cleanNumber.includes('@')) {
            return cleanNumber;
        }
        return `${cleanNumber}@s.whatsapp.net`;
    }
}
