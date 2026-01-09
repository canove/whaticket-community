import {
    Injectable,
    NotFoundException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
    CreateTicketDto,
    UpdateTicketDto,
    TicketListQueryDto,
    TransferTicketDto,
} from './dto';

@Injectable()
export class TicketsService {
    private readonly logger = new Logger(TicketsService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    async findAll(query: TicketListQueryDto, userId?: number) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;

        const where: any = {};

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

    async findOne(id: number) {
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
            throw new NotFoundException('Ticket não encontrado');
        }

        return ticket;
    }

    async create(dto: CreateTicketDto) {
        const ticket = await this.prisma.ticket.create({
            data: {
                contactId: dto.contactId,
                whatsappId: dto.whatsappId,
                queueId: dto.queueId,
                userId: dto.userId,
                status: (dto.status as any) || 'pending',
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

    async update(id: number, dto: UpdateTicketDto) {
        await this.findOne(id);

        const ticket = await this.prisma.ticket.update({
            where: { id },
            data: {
                status: dto.status as any,
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

    async transfer(id: number, dto: TransferTicketDto) {
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

    async close(id: number) {
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

    async reopen(id: number) {
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

    async markAsRead(id: number) {
        await this.prisma.ticket.update({
            where: { id },
            data: { unreadMessages: 0 },
        });

        await this.prisma.message.updateMany({
            where: { ticketId: id, read: false },
            data: { read: true },
        });
    }

    async delete(id: number) {
        await this.findOne(id);
        await this.prisma.ticket.delete({ where: { id } });
        this.logger.log(`Ticket deleted: ${id}`);
    }
}
