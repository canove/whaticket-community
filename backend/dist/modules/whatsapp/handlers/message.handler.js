"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var MessageHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageHandler = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const prisma_service_1 = require("../../../database/prisma.service");
const baileys_1 = require("@whiskeysockets/baileys");
let MessageHandler = MessageHandler_1 = class MessageHandler {
    prisma;
    aiQueue;
    logger = new common_1.Logger(MessageHandler_1.name);
    constructor(prisma, aiQueue) {
        this.prisma = prisma;
        this.aiQueue = aiQueue;
    }
    async handleMessageReceived(event) {
        const { sessionId, message, type } = event;
        if (type !== 'notify') {
            return;
        }
        try {
            await this.processMessage(sessionId, message);
        }
        catch (error) {
            this.logger.error(`Error processing message:`, error);
        }
    }
    async processMessage(sessionId, message) {
        const key = message.key;
        const remoteJid = key.remoteJid;
        if (!remoteJid) {
            return;
        }
        const isGroup = remoteJid.endsWith('@g.us');
        const contactNumber = isGroup
            ? remoteJid.replace('@g.us', '')
            : remoteJid.replace('@s.whatsapp.net', '');
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
        }
        else if (message.pushName && contact.name !== message.pushName) {
            contact = await this.prisma.contact.update({
                where: { id: contact.id },
                data: { name: message.pushName },
            });
        }
        let ticket = await this.prisma.ticket.findFirst({
            where: {
                contactId: contact.id,
                whatsappId: sessionId,
                status: { not: 'closed' },
            },
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
            });
            this.logger.log(`New ticket created: ${ticket.id}`);
        }
        else if (!key.fromMe) {
            ticket = await this.prisma.ticket.update({
                where: { id: ticket.id },
                data: { unreadMessages: { increment: 1 } },
            });
        }
        const { body, mediaType, mediaUrl } = await this.extractMessageContent(message);
        const savedMessage = await this.prisma.message.create({
            data: {
                id: key.id,
                ticketId: ticket.id,
                contactId: key.fromMe ? undefined : contact.id,
                whatsappId: sessionId,
                body: body || '',
                fromMe: key.fromMe || false,
                mediaType: mediaType,
                mediaUrl,
                read: key.fromMe || false,
            },
        });
        await this.prisma.ticket.update({
            where: { id: ticket.id },
            data: {
                lastMessage: body?.substring(0, 255) || '[Media]',
                updatedAt: new Date(),
            },
        });
        this.logger.debug(`Message saved: ${savedMessage.id}`);
        if (!savedMessage.fromMe && !savedMessage.isDeleted) {
            await this.dispatchToAI(ticket.id, savedMessage.body, contact.name);
        }
    }
    async dispatchToAI(ticketId, messageBody, contactName) {
        try {
            const ticket = await this.prisma.ticket.findUnique({
                where: { id: ticketId },
                include: {
                    queue: { select: { promptId: true } },
                    whatsapp: { select: { promptId: true } },
                }
            });
            if (!ticket)
                return;
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
        }
        catch (error) {
            this.logger.error(`Error dispatching to AI: ${error}`);
        }
    }
    async extractMessageContent(message) {
        const messageContent = message.message;
        if (!messageContent) {
            return { body: null, mediaType: null, mediaUrl: null };
        }
        const contentType = (0, baileys_1.getContentType)(messageContent);
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
                    mediaUrl: null
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
    async handleQRCode(event) {
        const { sessionId, qrCode } = event;
        await this.prisma.whatsapp.update({
            where: { id: sessionId },
            data: {
                qrcode: qrCode,
                status: 'qrcode',
            },
        });
        this.logger.log(`QR Code updated for session ${sessionId}`);
    }
    async handleConnection(event) {
        const { sessionId, status, reason } = event;
        const dbStatus = status === 'connected'
            ? 'CONNECTED'
            : status === 'disconnected'
                ? 'DISCONNECTED'
                : 'OPENING';
        await this.prisma.whatsapp.update({
            where: { id: sessionId },
            data: {
                status: dbStatus,
                qrcode: status === 'connected' ? null : undefined,
            },
        });
        this.logger.log(`Session ${sessionId} status updated to ${status}` +
            (reason ? ` (${reason})` : ''));
    }
};
exports.MessageHandler = MessageHandler;
__decorate([
    (0, event_emitter_1.OnEvent)('whatsapp.message.received'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MessageHandler.prototype, "handleMessageReceived", null);
__decorate([
    (0, event_emitter_1.OnEvent)('whatsapp.qrcode'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MessageHandler.prototype, "handleQRCode", null);
__decorate([
    (0, event_emitter_1.OnEvent)('whatsapp.connection'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MessageHandler.prototype, "handleConnection", null);
exports.MessageHandler = MessageHandler = MessageHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, bullmq_1.InjectQueue)('ai_processing')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        bullmq_2.Queue])
], MessageHandler);
//# sourceMappingURL=message.handler.js.map