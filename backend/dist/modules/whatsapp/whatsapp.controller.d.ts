import { WhatsappService } from './whatsapp.service';
export declare class WhatsappController {
    private readonly whatsappService;
    constructor(whatsappService: WhatsappService);
    findAll(): Promise<{
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
    }[]>;
    findOne(id: number): Promise<{
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
    }>;
    create(body: {
        name: string;
        greetingMessage?: string;
        farewellMessage?: string;
        isDefault?: boolean;
        queueIds?: number[];
    }): Promise<{
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
    }>;
    update(id: number, body: {
        name?: string;
        greetingMessage?: string;
        farewellMessage?: string;
        isDefault?: boolean;
        queueIds?: number[];
    }): Promise<{
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
    }>;
    delete(id: number): Promise<void>;
    startSession(id: number): Promise<{
        qrCode?: string;
        status: string;
    }>;
    logout(id: number): Promise<void>;
    getStatus(id: number): Promise<{
        connected: boolean;
        status: string;
    }>;
}
