import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
interface AuthenticatedSocket extends Socket {
    userId?: number;
    userProfile?: string;
}
export declare class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly jwtService;
    private readonly configService;
    server: Server;
    private readonly logger;
    private connectedUsers;
    constructor(jwtService: JwtService, configService: ConfigService);
    afterInit(server: Server): void;
    handleConnection(client: AuthenticatedSocket): Promise<void>;
    handleDisconnect(client: AuthenticatedSocket): void;
    private extractToken;
    handleTicketCreated(ticket: any): void;
    handleTicketUpdated(ticket: any): void;
    handleTicketTransferred(data: {
        ticket: any;
        previousQueue: any;
        previousUser: any;
    }): void;
    handleTicketClosed(ticket: any): void;
    handleTicketReopened(ticket: any): void;
    handleMessageSent(data: {
        message: any;
        ticket: any;
    }): void;
    handleMessageReceived(data: {
        sessionId: number;
        message: any;
    }): void;
    handleQRCode(data: {
        sessionId: number;
        qrCode: string;
    }): void;
    handleSessionUpdate(data: {
        sessionId: number;
        status: string;
        qrcode?: string;
    }): void;
    handleWhatsAppConnection(data: {
        sessionId: number;
        status: string;
        reason?: string;
    }): void;
    handleJoinTicket(client: AuthenticatedSocket, ticketId: number): {
        event: string;
        data: {
            room: string;
        };
    };
    handleLeaveTicket(client: AuthenticatedSocket, ticketId: number): {
        event: string;
        data: {
            room: string;
        };
    };
    handleJoinQueue(client: AuthenticatedSocket, queueId: number): {
        event: string;
        data: {
            room: string;
        };
    };
    handleLeaveQueue(client: AuthenticatedSocket, queueId: number): {
        event: string;
        data: {
            room: string;
        };
    };
    handlePing(client: AuthenticatedSocket): {
        event: string;
        data: {
            timestamp: number;
        };
    };
    isUserOnline(userId: number): boolean;
    getOnlineUserIds(): number[];
    emitToUser(userId: number, event: string, data: any): void;
    emitToTicket(ticketId: number, event: string, data: any): void;
    emitToQueue(queueId: number, event: string, data: any): void;
    broadcast(event: string, data: any): void;
}
export {};
