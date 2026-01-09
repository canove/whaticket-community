import { Injectable, Logger } from '@nestjs/common';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../../database/prisma.service';
import type {
    MessageReceivedEvent,
    QRCodeEvent,
    ConnectionEvent
} from '../baileys.service';
import type { WAMessage } from '@whiskeysockets/baileys';
import { getContentType } from '@whiskeysockets/baileys';

@Injectable()
export class MessageHandler {
    private readonly logger = new Logger(MessageHandler.name);

    constructor(
        private readonly prisma: PrismaService,
        @InjectQueue('ai_processing') private readonly aiQueue: Queue,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    @OnEvent('whatsapp.message.received')
    async handleMessageReceived(event: MessageReceivedEvent): Promise<void> {
        const { sessionId, message, type } = event;

        // Skip if not a new message
        if (type !== 'notify') {
            return;
        }

        try {
            await this.processMessage(sessionId, message);
        } catch (error) {
            this.logger.error(`Error processing message:`, error);
        }
    }

    private async processMessage(sessionId: number, message: WAMessage): Promise<void> {
        const key = message.key;
        const remoteJid = key.remoteJid;

        if (!remoteJid) {
            return;
        }

        // Extract contact number
        const isGroup = remoteJid.endsWith('@g.us');
        const contactNumber = isGroup
            ? remoteJid.replace('@g.us', '')
            : remoteJid.replace('@s.whatsapp.net', '');

        // Get or create contact
        let contact = await this.prisma.contact.findUnique({
            where: { number: contactNumber },
        });

        if (!contact) {
            contact = await this.prisma.contact.create({
                data: {
                    name: message.pushName || contactNumber,
                    number: contactNumber,
                    isGroup,
                },
            });
            this.logger.log(`New contact created: ${contact.number}`);
        } else if (message.pushName && contact.name !== message.pushName) {
            // Update contact name if changed
            contact = await this.prisma.contact.update({
                where: { id: contact.id },
                data: { name: message.pushName },
            });
        }

        // Find or create ticket
        let ticket = await this.prisma.ticket.findFirst({
            where: {
                contactId: contact.id,
                whatsappId: sessionId,
                status: { not: 'closed' },
            },
            include: { contact: true },
        });

        if (!ticket) {
            ticket = await this.prisma.ticket.create({
                data: {
                    contactId: contact.id,
                    whatsappId: sessionId,
                    status: 'pending',
                    isGroup,
                    unreadMessages: 1,
                },
                include: { contact: true },
            });
            this.logger.log(`New ticket created: ${ticket.id}`);
        } else if (!key.fromMe) {
            // Increment unread count for incoming messages
            ticket = await this.prisma.ticket.update({
                where: { id: ticket.id },
                data: { unreadMessages: { increment: 1 } },
                include: { contact: true },
            });
        }

        // Extract message content
        const { body, mediaType, mediaUrl } = await this.extractMessageContent(message);

        // Create message record
        const savedMessage = await this.prisma.message.create({
            data: {
                id: key.id!,
                ticketId: ticket.id,
                contactId: key.fromMe ? undefined : contact.id,
                whatsappId: sessionId,
                body: body || '',
                fromMe: key.fromMe || false,
                mediaType: mediaType as any,
                mediaUrl,
                read: key.fromMe || false,
            },
        });

        // Update ticket last message
        await this.prisma.ticket.update({
            where: { id: ticket.id },
            data: {
                lastMessage: body?.substring(0, 255) || '[Media]',
                updatedAt: new Date(),
            },
        });

        this.logger.debug(`Message saved: ${savedMessage.id}`);

        // Emit event for real-time updates
        this.eventEmitter.emit('message.upsert', {
            message: savedMessage,
            ticket: ticket,
        });

        // Dispatch to AI if applicable
        if (!savedMessage.fromMe && !savedMessage.isDeleted) {
            await this.dispatchToAI(ticket.id, savedMessage.body, contact.name);
        }
    }

    private async dispatchToAI(ticketId: number, messageBody: string, contactName: string) {
        try {
            const ticket = await this.prisma.ticket.findUnique({
                where: { id: ticketId },
                include: {
                    queue: { select: { promptId: true } },
                    whatsapp: { select: { promptId: true } },
                }
            });

            if (!ticket) return;

            const promptId = ticket.queue?.promptId || ticket.whatsapp?.promptId;

            if (promptId) {
                await this.aiQueue.add('handle_message', {
                    ticketId,
                    messageBody,
                    contactName,
                    promptId,
                }, {
                    removeOnComplete: true,
                    attempts: 3,
                    backoff: { type: 'exponential', delay: 1000 },
                });
                this.logger.log(`Dispatched message to AI (Ticket ${ticketId}, Prompt ${promptId})`);
            }
        } catch (error) {
            this.logger.error(`Error dispatching to AI: ${error}`);
        }
    }

    private async extractMessageContent(message: WAMessage): Promise<{
        body: string | null;
        mediaType: string | null;
        mediaUrl: string | null;
    }> {
        const messageContent = message.message;
        if (!messageContent) {
            return { body: null, mediaType: null, mediaUrl: null };
        }

        const contentType = getContentType(messageContent);

        switch (contentType) {
            case 'conversation':
                return {
                    body: messageContent.conversation || null,
                    mediaType: 'chat',
                    mediaUrl: null
                };

            case 'extendedTextMessage':
                return {
                    body: messageContent.extendedTextMessage?.text || null,
                    mediaType: 'chat',
                    mediaUrl: null
                };

            case 'imageMessage':
                return {
                    body: messageContent.imageMessage?.caption || null,
                    mediaType: 'image',
                    mediaUrl: null // Would need to download and store
                };

            case 'videoMessage':
                return {
                    body: messageContent.videoMessage?.caption || null,
                    mediaType: 'video',
                    mediaUrl: null
                };

            case 'audioMessage':
                return {
                    body: null,
                    mediaType: messageContent.audioMessage?.ptt ? 'ptt' : 'audio',
                    mediaUrl: null
                };

            case 'documentMessage':
                return {
                    body: messageContent.documentMessage?.fileName || null,
                    mediaType: 'document',
                    mediaUrl: null
                };

            case 'stickerMessage':
                return {
                    body: null,
                    mediaType: 'sticker',
                    mediaUrl: null
                };

            case 'locationMessage':
                const loc = messageContent.locationMessage;
                return {
                    body: loc ? `${loc.degreesLatitude},${loc.degreesLongitude}` : null,
                    mediaType: 'location',
                    mediaUrl: null
                };

            case 'contactMessage':
                return {
                    body: messageContent.contactMessage?.displayName || null,
                    mediaType: 'vcard',
                    mediaUrl: null
                };

            default:
                return { body: null, mediaType: null, mediaUrl: null };
        }
    }

    @OnEvent('whatsapp.qrcode')
    async handleQRCode(event: QRCodeEvent): Promise<void> {
        const { sessionId, qrCode } = event;

        try {
            await this.prisma.whatsapp.update({
                where: { id: sessionId },
                data: {
                    qrcode: qrCode,
                    status: 'qrcode',
                },
            });
            this.logger.log(`QR Code updated for session ${sessionId}`);
        } catch (error) {
            // Record might have been deleted - log warning but don't crash
            this.logger.warn(`Could not update QR code for session ${sessionId}: record may not exist`);
        }
    }

    @OnEvent('whatsapp.connection')
    async handleConnection(event: ConnectionEvent): Promise<void> {
        const { sessionId, status, reason } = event;

        const dbStatus = status === 'connected'
            ? 'CONNECTED'
            : status === 'disconnected'
                ? 'DISCONNECTED'
                : 'OPENING';

        try {
            await this.prisma.whatsapp.update({
                where: { id: sessionId },
                data: {
                    status: dbStatus as any,
                    qrcode: status === 'connected' ? null : undefined,
                },
            });

            this.logger.log(
                `Session ${sessionId} status updated to ${status}` +
                (reason ? ` (${reason})` : '')
            );
        } catch (error) {
            // Record might have been deleted - log warning but don't crash
            this.logger.warn(`Could not update status for session ${sessionId}: record may not exist`);
        }
    }
}
