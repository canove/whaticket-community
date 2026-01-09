export declare enum TicketStatus {
    OPEN = "open",
    PENDING = "pending",
    CLOSED = "closed"
}
export declare class CreateTicketDto {
    contactId: number;
    whatsappId: number;
    queueId?: number;
    userId?: number;
    status?: TicketStatus;
}
export declare class UpdateTicketDto {
    status?: TicketStatus;
    queueId?: number;
    userId?: number;
}
export declare class TicketListQueryDto {
    page?: number;
    limit?: number;
    status?: TicketStatus;
    queueId?: number;
    userId?: number;
    showAll?: boolean;
    search?: string;
}
export declare class TransferTicketDto {
    queueId?: number;
    userId?: number;
}
