import { PrismaService } from '../../database/prisma.service';
import { BaileysService } from '../whatsapp/baileys.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SendMessageDto, MessageListQueryDto } from './dto';
export declare class MessagesService {
    private readonly prisma;
    private readonly baileys;
    private readonly eventEmitter;
    private readonly logger;
    constructor(prisma: PrismaService, baileys: BaileysService, eventEmitter: EventEmitter2);
    findByTicket(ticketId: number, query: MessageListQueryDto): Promise<{
        messages: ({
            contact: {
                name: string;
                id: number;
                profilePicUrl: string | null;
            } | null;
            quotedMsg: {
                id: string;
                body: string;
                fromMe: boolean;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: number | null;
            whatsappId: number | null;
            contactId: number | null;
            body: string;
            mediaType: import("@prisma/client").$Enums.MessageType | null;
            mediaUrl: string | null;
            ack: number;
            read: boolean;
            fromMe: boolean;
            isDeleted: boolean;
            ticketId: number;
            quotedMsgId: string | null;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    send(dto: SendMessageDto, userId: number | null): Promise<{
        contact: {
            name: string;
            id: number;
            profilePicUrl: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: number | null;
        whatsappId: number | null;
        contactId: number | null;
        body: string;
        mediaType: import("@prisma/client").$Enums.MessageType | null;
        mediaUrl: string | null;
        ack: number;
        read: boolean;
        fromMe: boolean;
        isDeleted: boolean;
        ticketId: number;
        quotedMsgId: string | null;
    }>;
    delete(messageId: string): Promise<void>;
}
