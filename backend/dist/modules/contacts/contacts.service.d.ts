import { PrismaService } from '../../database/prisma.service';
import { CreateContactDto, UpdateContactDto, ContactListQueryDto } from './dto';
export declare class ContactsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAll(query: ContactListQueryDto): Promise<{
        contacts: ({
            _count: {
                tickets: number;
            };
            customFields: {
                name: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                contactId: number;
                value: string;
            }[];
        } & {
            number: string;
            email: string | null;
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            profilePicUrl: string | null;
            isGroup: boolean;
            extraInfo: import("@prisma/client/runtime/client").JsonValue | null;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    findOne(id: number): Promise<{
        tickets: ({
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
        customFields: {
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            contactId: number;
            value: string;
        }[];
    } & {
        number: string;
        email: string | null;
        name: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        profilePicUrl: string | null;
        isGroup: boolean;
        extraInfo: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    findByNumber(number: string): Promise<({
        customFields: {
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            contactId: number;
            value: string;
        }[];
    } & {
        number: string;
        email: string | null;
        name: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        profilePicUrl: string | null;
        isGroup: boolean;
        extraInfo: import("@prisma/client/runtime/client").JsonValue | null;
    }) | null>;
    create(dto: CreateContactDto): Promise<{
        customFields: {
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            contactId: number;
            value: string;
        }[];
    } & {
        number: string;
        email: string | null;
        name: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        profilePicUrl: string | null;
        isGroup: boolean;
        extraInfo: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    update(id: number, dto: UpdateContactDto): Promise<{
        customFields: {
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            contactId: number;
            value: string;
        }[];
    } & {
        number: string;
        email: string | null;
        name: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        profilePicUrl: string | null;
        isGroup: boolean;
        extraInfo: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    delete(id: number): Promise<void>;
    updateProfilePic(id: number, profilePicUrl: string): Promise<{
        number: string;
        email: string | null;
        name: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        profilePicUrl: string | null;
        isGroup: boolean;
        extraInfo: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    createOrUpdate(data: {
        name: string;
        number: string;
        profilePicUrl?: string;
        isGroup?: boolean;
    }): Promise<{
        number: string;
        email: string | null;
        name: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        profilePicUrl: string | null;
        isGroup: boolean;
        extraInfo: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
}
