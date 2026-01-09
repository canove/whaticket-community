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
var TicketsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const event_emitter_1 = require("@nestjs/event-emitter");
let TicketsService = TicketsService_1 = class TicketsService {
    prisma;
    eventEmitter;
    logger = new common_1.Logger(TicketsService_1.name);
    constructor(prisma, eventEmitter) {
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
    }
    async findAll(query, userId) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.status) {
            where.status = query.status;
        }
        if (query.queueId) {
            where.queueId = query.queueId;
        }
        if (!query.showAll && userId) {
            where.OR = [
                { userId },
                { userId: null },
            ];
        }
        if (query.search) {
            where.contact = {
                OR: [
                    { name: { contains: query.search, mode: 'insensitive' } },
                    { number: { contains: query.search } },
                ],
            };
        }
        const [tickets, total] = await Promise.all([
            this.prisma.ticket.findMany({
                where,
                skip,
                take: limit,
                orderBy: { updatedAt: 'desc' },
                include: {
                    contact: true,
                    user: { select: { id: true, name: true } },
                    queue: { select: { id: true, name: true, color: true } },
                    whatsapp: { select: { id: true, name: true } },
                },
            }),
            this.prisma.ticket.count({ where }),
        ]);
        return {
            tickets,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(id) {
        const ticket = await this.prisma.ticket.findUnique({
            where: { id },
            include: {
                contact: true,
                user: { select: { id: true, name: true } },
                queue: { select: { id: true, name: true, color: true } },
                whatsapp: { select: { id: true, name: true } },
                messages: {
                    orderBy: { createdAt: 'asc' },
                    take: 50,
                    include: {
                        contact: { select: { id: true, name: true, profilePicUrl: true } },
                    },
                },
            },
        });
        if (!ticket) {
            throw new common_1.NotFoundException('Ticket não encontrado');
        }
        return ticket;
    }
    async create(dto) {
        const ticket = await this.prisma.ticket.create({
            data: {
                contactId: dto.contactId,
                whatsappId: dto.whatsappId,
                queueId: dto.queueId,
                userId: dto.userId,
                status: dto.status || 'pending',
            },
            include: {
                contact: true,
                user: { select: { id: true, name: true } },
                queue: { select: { id: true, name: true, color: true } },
                whatsapp: { select: { id: true, name: true } },
            },
        });
        this.eventEmitter.emit('ticket.created', ticket);
        this.logger.log(`Ticket created: ${ticket.id}`);
        return ticket;
    }
    async update(id, dto) {
        await this.findOne(id);
        const ticket = await this.prisma.ticket.update({
            where: { id },
            data: {
                status: dto.status,
                queueId: dto.queueId,
                userId: dto.userId,
            },
            include: {
                contact: true,
                user: { select: { id: true, name: true } },
                queue: { select: { id: true, name: true, color: true } },
                whatsapp: { select: { id: true, name: true } },
            },
        });
        this.eventEmitter.emit('ticket.updated', ticket);
        return ticket;
    }
    async transfer(id, dto) {
        const ticket = await this.findOne(id);
        const updatedTicket = await this.prisma.ticket.update({
            where: { id },
            data: {
                queueId: dto.queueId,
                userId: dto.userId,
            },
            include: {
                contact: true,
                user: { select: { id: true, name: true } },
                queue: { select: { id: true, name: true, color: true } },
                whatsapp: { select: { id: true, name: true } },
            },
        });
        this.eventEmitter.emit('ticket.transferred', {
            ticket: updatedTicket,
            previousQueue: ticket.queue,
            previousUser: ticket.user,
        });
        this.logger.log(`Ticket ${id} transferred`);
        return updatedTicket;
    }
    async close(id) {
        const ticket = await this.prisma.ticket.update({
            where: { id },
            data: { status: 'closed' },
            include: {
                contact: true,
                whatsapp: true,
            },
        });
        this.eventEmitter.emit('ticket.closed', ticket);
        this.logger.log(`Ticket closed: ${id}`);
        return ticket;
    }
    async reopen(id) {
        const ticket = await this.prisma.ticket.update({
            where: { id },
            data: { status: 'open' },
            include: {
                contact: true,
                user: { select: { id: true, name: true } },
                queue: { select: { id: true, name: true, color: true } },
                whatsapp: { select: { id: true, name: true } },
            },
        });
        this.eventEmitter.emit('ticket.reopened', ticket);
        this.logger.log(`Ticket reopened: ${id}`);
        return ticket;
    }
    async markAsRead(id) {
        await this.prisma.ticket.update({
            where: { id },
            data: { unreadMessages: 0 },
        });
        await this.prisma.message.updateMany({
            where: { ticketId: id, read: false },
            data: { read: true },
        });
    }
    async delete(id) {
        await this.findOne(id);
        await this.prisma.ticket.delete({ where: { id } });
        this.logger.log(`Ticket deleted: ${id}`);
    }
};
exports.TicketsService = TicketsService;
exports.TicketsService = TicketsService = TicketsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_emitter_1.EventEmitter2])
], TicketsService);
//# sourceMappingURL=tickets.service.js.map