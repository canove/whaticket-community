import { TicketsService } from './tickets.service';
import { CreateTicketDto, UpdateTicketDto, TicketListQueryDto, TransferTicketDto } from './dto';
export declare class TicketsController {
    private readonly ticketsService;
    constructor(ticketsService: TicketsService);
    findAll(query: TicketListQueryDto, userId: number): Promise<{
        tickets: ({
            whatsapp: {
                name: string;
                id: number;
            };
            user: {
                name: string;
                id: number;
            } | null;
            contact: {
                number: string;
                email: string | null;
                name: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                profilePicUrl: string | null;
                isGroup: boolean;
                extraInfo: import("@prisma/client/runtime/client").JsonValue | null;
            };
            queue: {
                name: string;
                id: number;
                color: string;
            } | null;
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: number | null;
            queueId: number | null;
            status: import("@prisma/client").$Enums.TicketStatus;
            whatsappId: number;
            isGroup: boolean;
            unreadMessages: number;
            lastMessage: string | null;
            contactId: number;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    findOne(id: number): Promise<{
        whatsapp: {
            name: string;
            id: number;
        };
        user: {
            name: string;
            id: number;
        } | null;
        contact: {
            number: string;
            email: string | null;
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            profilePicUrl: string | null;
            isGroup: boolean;
            extraInfo: import("@prisma/client/runtime/client").JsonValue | null;
        };
        queue: {
            name: string;
            id: number;
            color: string;
        } | null;
        messages: ({
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
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number | null;
        queueId: number | null;
        status: import("@prisma/client").$Enums.TicketStatus;
        whatsappId: number;
        isGroup: boolean;
        unreadMessages: number;
        lastMessage: string | null;
        contactId: number;
    }>;
    create(dto: CreateTicketDto): Promise<{
        whatsapp: {
            name: string;
            id: number;
        };
        user: {
            name: string;
            id: number;
        } | null;
        contact: {
            number: string;
            email: string | null;
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            profilePicUrl: string | null;
            isGroup: boolean;
            extraInfo: import("@prisma/client/runtime/client").JsonValue | null;
        };
        queue: {
            name: string;
            id: number;
            color: string;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number | null;
        queueId: number | null;
        status: import("@prisma/client").$Enums.TicketStatus;
        whatsappId: number;
        isGroup: boolean;
        unreadMessages: number;
        lastMessage: string | null;
        contactId: number;
    }>;
    update(id: number, dto: UpdateTicketDto): Promise<{
        whatsapp: {
            name: string;
            id: number;
        };
        user: {
            name: string;
            id: number;
        } | null;
        contact: {
            number: string;
            email: string | null;
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            profilePicUrl: string | null;
            isGroup: boolean;
            extraInfo: import("@prisma/client/runtime/client").JsonValue | null;
        };
        queue: {
            name: string;
            id: number;
            color: string;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number | null;
        queueId: number | null;
        status: import("@prisma/client").$Enums.TicketStatus;
        whatsappId: number;
        isGroup: boolean;
        unreadMessages: number;
        lastMessage: string | null;
        contactId: number;
    }>;
    transfer(id: number, dto: TransferTicketDto): Promise<{
        whatsapp: {
            name: string;
            id: number;
        };
        user: {
            name: string;
            id: number;
        } | null;
        contact: {
            number: string;
            email: string | null;
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            profilePicUrl: string | null;
            isGroup: boolean;
            extraInfo: import("@prisma/client/runtime/client").JsonValue | null;
        };
        queue: {
            name: string;
            id: number;
            color: string;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number | null;
        queueId: number | null;
        status: import("@prisma/client").$Enums.TicketStatus;
        whatsappId: number;
        isGroup: boolean;
        unreadMessages: number;
        lastMessage: string | null;
        contactId: number;
    }>;
    close(id: number): Promise<{
        whatsapp: {
            session: string | null;
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            greetingMessage: string | null;
            promptId: number | null;
            qrcode: string | null;
            status: import("@prisma/client").$Enums.WhatsappStatus;
            battery: string | null;
            plugged: boolean | null;
            retries: number;
            farewellMessage: string | null;
            isDefault: boolean;
        };
        contact: {
            number: string;
            email: string | null;
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            profilePicUrl: string | null;
            isGroup: boolean;
            extraInfo: import("@prisma/client/runtime/client").JsonValue | null;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number | null;
        queueId: number | null;
        status: import("@prisma/client").$Enums.TicketStatus;
        whatsappId: number;
        isGroup: boolean;
        unreadMessages: number;
        lastMessage: string | null;
        contactId: number;
    }>;
    reopen(id: number): Promise<{
        whatsapp: {
            name: string;
            id: number;
        };
        user: {
            name: string;
            id: number;
        } | null;
        contact: {
            number: string;
            email: string | null;
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            profilePicUrl: string | null;
            isGroup: boolean;
            extraInfo: import("@prisma/client/runtime/client").JsonValue | null;
        };
        queue: {
            name: string;
            id: number;
            color: string;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number | null;
        queueId: number | null;
        status: import("@prisma/client").$Enums.TicketStatus;
        whatsappId: number;
        isGroup: boolean;
        unreadMessages: number;
        lastMessage: string | null;
        contactId: number;
    }>;
    markAsRead(id: number): Promise<void>;
    delete(id: number): Promise<void>;
}
