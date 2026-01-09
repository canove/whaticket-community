import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BaileysService } from '../whatsapp/baileys.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SendMessageDto, MessageListQueryDto } from './dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MessagesService {
    private readonly logger = new Logger(MessagesService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly baileys: BaileysService,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    async findByTicket(ticketId: number, query: MessageListQueryDto) {
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

    async send(dto: SendMessageDto, userId: number | null) {
        const ticket = await this.prisma.ticket.findUnique({
            where: { id: dto.ticketId },
            include: {
                contact: true,
                whatsapp: true,
            },
        });

        if (!ticket) {
            throw new NotFoundException('Ticket não encontrado');
        }

        if (!this.baileys.isConnected(ticket.whatsappId)) {
            throw new Error('WhatsApp não está conectado');
        }

        // Send via WhatsApp
        const sentMessage = await this.baileys.sendTextMessage(
            ticket.whatsappId,
            ticket.contact.number,
            dto.body,
        );

        const messageId = sentMessage?.key?.id || uuidv4();

        // Save to database
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

        // Update ticket
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

    async delete(messageId: string) {
        const message = await this.prisma.message.findUnique({
            where: { id: messageId },
            include: { ticket: { include: { contact: true } } },
        });

        if (!message) {
            throw new NotFoundException('Mensagem não encontrada');
        }

        // Mark as deleted (soft delete)
        await this.prisma.message.update({
            where: { id: messageId },
            data: { isDeleted: true, body: 'Mensagem apagada' },
        });

        this.eventEmitter.emit('message.deleted', message);
        this.logger.log(`Message deleted: ${messageId}`);
    }
}
