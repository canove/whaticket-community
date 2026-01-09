export interface Message {
    id: string;
    messageId: string;
    ticketId: number;
    contactId: number | null;
    body: string;
    fromMe: boolean;
    read: boolean;
    mediaType: string;
    mediaUrl: string | null;
    timestamp: number;
    createdAt: string;
    updatedAt: string;
    quotedMsgId?: string | null;
    // contact?: Contact; // if needed
}
