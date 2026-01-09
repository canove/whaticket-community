export type WhatsAppStatus =
    | 'qrcode'
    | 'connected'
    | 'disconnected'
    | 'opening'
    | 'pairing'
    | 'QRCODE'
    | 'CONNECTED'
    | 'DISCONNECTED'
    | 'OPENING'
    | 'PAIRING';

export interface WhatsApp {
    id: number;
    name: string;
    status: WhatsAppStatus;
    isDefault: boolean;
    token?: string;
    number?: string;
    qrcode?: string;
    promptId?: number;
    createdAt: string;
    updatedAt: string;
}

export interface WhatsAppUpdate {
    id: number;
    status?: WhatsAppStatus;
    qrcode?: string;
}
