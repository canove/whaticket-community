import { ContactsService } from './contacts.service';
import { CreateContactDto, UpdateContactDto, ContactListQueryDto } from './dto';
export declare class ContactsController {
    private readonly contactsService;
    constructor(contactsService: ContactsService);
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
}
