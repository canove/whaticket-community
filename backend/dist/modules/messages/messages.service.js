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
var MessagesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const baileys_service_1 = require("../whatsapp/baileys.service");
const event_emitter_1 = require("@nestjs/event-emitter");
const uuid_1 = require("uuid");
let MessagesService = MessagesService_1 = class MessagesService {
    prisma;
    baileys;
    eventEmitter;
    logger = new common_1.Logger(MessagesService_1.name);
    constructor(prisma, baileys, eventEmitter) {
        this.prisma = prisma;
        this.baileys = baileys;
        this.eventEmitter = eventEmitter;
    }
    async findByTicket(ticketId, query) {
        const page = query.page || 1;
        const limit = query.limit || 50;
        const skip = (page - 1) * limit;
        const [messages, total] = await Promise.all([
            this.prisma.message.findMany({
                where: { ticketId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    contact: { select: { id: true, name: true, profilePicUrl: true } },
                    quotedMsg: {
                        select: { id: true, body: true, fromMe: true },
                    },
                },
            }),
            this.prisma.message.count({ where: { ticketId } }),
        ]);
        return {
            messages: messages.reverse(),
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
    async send(dto, userId) {
        const ticket = await this.prisma.ticket.findUnique({
            where: { id: dto.ticketId },
            include: {
                contact: true,
                whatsapp: true,
            },
        });
        if (!ticket) {
            throw new common_1.NotFoundException('Ticket não encontrado');
        }
        if (!this.baileys.isConnected(ticket.whatsappId)) {
            throw new Error('WhatsApp não está conectado');
        }
        const sentMessage = await this.baileys.sendTextMessage(ticket.whatsappId, ticket.contact.number, dto.body);
        const messageId = sentMessage?.key?.id || (0, uuid_1.v4)();
        const message = await this.prisma.message.create({
            data: {
                id: messageId,
                ticketId: dto.ticketId,
                body: dto.body,
                fromMe: true,
                read: true,
                mediaType: 'chat',
                userId,
                whatsappId: ticket.whatsappId,
                quotedMsgId: dto.quotedMsgId,
            },
            include: {
                contact: { select: { id: true, name: true, profilePicUrl: true } },
            },
        });
        await this.prisma.ticket.update({
            where: { id: dto.ticketId },
            data: {
                lastMessage: dto.body.substring(0, 255),
                status: 'open',
            },
        });
        this.eventEmitter.emit('message.sent', { message, ticket });
        this.logger.log(`Message sent: ${message.id}`);
        return message;
    }
    async delete(messageId) {
        const message = await this.prisma.message.findUnique({
            where: { id: messageId },
            include: { ticket: { include: { contact: true } } },
        });
        if (!message) {
            throw new common_1.NotFoundException('Mensagem não encontrada');
        }
        await this.prisma.message.update({
            where: { id: messageId },
            data: { isDeleted: true, body: 'Mensagem apagada' },
        });
        this.eventEmitter.emit('message.deleted', message);
        this.logger.log(`Message deleted: ${messageId}`);
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = MessagesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        baileys_service_1.BaileysService,
        event_emitter_1.EventEmitter2])
], MessagesService);
//# sourceMappingURL=messages.service.js.map