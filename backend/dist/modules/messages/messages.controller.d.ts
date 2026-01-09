import { MessagesService } from './messages.service';
import { SendMessageDto, MessageListQueryDto } from './dto';
export declare class MessagesController {
    private readonly messagesService;
    constructor(messagesService: MessagesService);
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
    send(dto: SendMessageDto, userId: number): Promise<{
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
    delete(id: string): Promise<void>;
}
