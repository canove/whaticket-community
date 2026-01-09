import { Queue } from 'bullmq';
import { PrismaService } from '../../../database/prisma.service';
import type { MessageReceivedEvent, QRCodeEvent, ConnectionEvent } from '../baileys.service';
export declare class MessageHandler {
    private readonly prisma;
    private readonly aiQueue;
    private readonly logger;
    constructor(prisma: PrismaService, aiQueue: Queue);
    handleMessageReceived(event: MessageReceivedEvent): Promise<void>;
    private processMessage;
    private dispatchToAI;
    private extractMessageContent;
    handleQRCode(event: QRCodeEvent): Promise<void>;
    handleConnection(event: ConnectionEvent): Promise<void>;
}
