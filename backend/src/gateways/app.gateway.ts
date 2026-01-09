import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';

interface AuthenticatedSocket extends Socket {
    userId?: number;
    userProfile?: string;
}

@WebSocketGateway({
    cors: {
        origin: '*',
        credentials: true,
    },
    namespace: '/',
})
export class AppGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server!: Server;

    private readonly logger = new Logger(AppGateway.name);
    private connectedUsers: Map<number, Set<string>> = new Map();

    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    afterInit(server: Server) {
        this.logger.log('WebSocket Gateway initialized');
    }

    async handleConnection(client: AuthenticatedSocket) {
        try {
            const token = this.extractToken(client);
            if (!token) {
                this.logger.warn(`Client ${client.id} connection rejected: No token`);
                client.disconnect();
                return;
            }

            this.logger.log(`Verifying token: ${token.substring(0, 10)}...`);
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get<string>('jwt.secret'),
            });

            client.userId = payload.sub;
            client.userProfile = payload.profile;

            // Track connected users
            if (!this.connectedUsers.has(payload.sub)) {
                this.connectedUsers.set(payload.sub, new Set());
            }
            this.connectedUsers.get(payload.sub)!.add(client.id);

            // Join user-specific room
            client.join(`user:${payload.sub}`);

            // Join profile-based room
            client.join(`profile:${payload.profile}`);

            this.logger.log(
                `Client ${client.id} connected - User: ${payload.sub}, Profile: ${payload.profile}`,
            );

            // Emit connection status
            client.emit('connected', { userId: payload.sub });
        } catch (error: any) {
            this.logger.warn(`Client ${client.id} connection rejected: Invalid token. Error: ${error.message}`);
            client.disconnect();
        }
    }

    handleDisconnect(client: AuthenticatedSocket) {
        if (client.userId) {
            const userSockets = this.connectedUsers.get(client.userId);
            if (userSockets) {
                userSockets.delete(client.id);
                if (userSockets.size === 0) {
                    this.connectedUsers.delete(client.userId);
                }
            }
        }
        this.logger.log(`Client ${client.id} disconnected`);
    }

    private extractToken(client: Socket): string | null {
        const authHeader = client.handshake.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7);
        }

        const token = client.handshake.auth?.token;
        if (token) {
            // Frontend may send "Bearer TOKEN" format, strip the prefix
            if (token.startsWith('Bearer ')) {
                return token.substring(7);
            }
            return token;
        }

        return client.handshake.query?.token as string | null;
    }

    // ==================== Event Handlers ====================

    @OnEvent('ticket.created')
    handleTicketCreated(ticket: any) {
        this.logger.debug(`Broadcasting ticket.created: ${ticket.id}`);

        // Emit to all users in the queue
        if (ticket.queueId) {
            this.server.to(`queue:${ticket.queueId}`).emit('ticket:created', ticket);
        }

        // Emit to admins and supervisors
        this.server.to('profile:admin').to('profile:supervisor').emit('ticket:created', ticket);

        // Emit to unassigned tickets room if no user
        if (!ticket.userId) {
            this.server.emit('ticket:created', ticket);
        }
    }

    @OnEvent('ticket.updated')
    handleTicketUpdated(ticket: any) {
        this.logger.debug(`Broadcasting ticket.updated: ${ticket.id}`);

        // Emit to assigned user
        if (ticket.userId) {
            this.server.to(`user:${ticket.userId}`).emit('ticket:updated', ticket);
        }

        // Emit to queue room
        if (ticket.queueId) {
            this.server.to(`queue:${ticket.queueId}`).emit('ticket:updated', ticket);
        }

        this.server.to('profile:admin').to('profile:supervisor').emit('ticket:updated', ticket);
    }

    @OnEvent('ticket.transferred')
    handleTicketTransferred(data: { ticket: any; previousQueue: any; previousUser: any }) {
        const { ticket, previousQueue, previousUser } = data;

        // Notify previous user
        if (previousUser) {
            this.server.to(`user:${previousUser.id}`).emit('ticket:transferred', {
                ticket,
                type: 'removed',
            });
        }

        // Notify new user
        if (ticket.userId) {
            this.server.to(`user:${ticket.userId}`).emit('ticket:transferred', {
                ticket,
                type: 'assigned',
            });
        }

        // Notify queue changes
        if (previousQueue) {
            this.server.to(`queue:${previousQueue.id}`).emit('ticket:transferred', { ticket });
        }
        if (ticket.queueId) {
            this.server.to(`queue:${ticket.queueId}`).emit('ticket:transferred', { ticket });
        }
    }

    @OnEvent('ticket.closed')
    handleTicketClosed(ticket: any) {
        this.logger.debug(`Broadcasting ticket.closed: ${ticket.id}`);
        this.server.emit('ticket:closed', ticket);
    }

    @OnEvent('ticket.reopened')
    handleTicketReopened(ticket: any) {
        this.logger.debug(`Broadcasting ticket.reopened: ${ticket.id}`);
        this.server.emit('ticket:reopened', ticket);
    }

    @OnEvent('message.sent')
    handleMessageSent(data: { message: any; ticket: any }) {
        const { message, ticket } = data;
        this.logger.debug(`Broadcasting message.sent: ${message.id}`);

        // Emit to ticket room
        this.server.to(`ticket:${ticket.id}`).emit('message:created', message);

        // Emit to assigned user
        if (ticket.userId) {
            this.server.to(`user:${ticket.userId}`).emit('message:created', message);
        }
    }

    @OnEvent('whatsapp.message.received')
    handleMessageReceived(data: { sessionId: number; message: any }) {
        this.logger.debug(`Broadcasting whatsapp.message.received`);
        this.server.emit('message:received', data);
    }

    @OnEvent('whatsapp.qrcode')
    handleQRCode(data: { sessionId: number; qrCode: string }) {
        this.logger.debug(`Broadcasting whatsapp.qrcode: ${data.sessionId}`);
        this.server.to('profile:admin').emit('whatsapp:qrcode', data);
    }

    @OnEvent('whatsapp.session.update')
    handleSessionUpdate(data: { sessionId: number; status: string; qrcode?: string }) {
        this.logger.debug(`Broadcasting whatsapp.session.update: ${data.sessionId}`);
        this.server.to('profile:admin').emit('whatsapp:session', data);
    }

    @OnEvent('whatsapp.connection')
    handleWhatsAppConnection(data: { sessionId: number; status: string; reason?: string }) {
        this.logger.debug(`Broadcasting whatsapp.connection: ${data.sessionId} - ${data.status}`);
        this.server.to('profile:admin').emit('whatsapp:connection', data);
    }

    @OnEvent('message.upsert')
    handleMessageUpsert(data: { message: any; ticket: any }) {
        const { message, ticket } = data;
        this.logger.debug(`Broadcasting message.upsert: ${message.id} to ticket:${ticket.id}`);

        // Emit to users viewing this specific ticket
        this.emitToTicket(ticket.id, 'message:created', {
            message,
            ticket,
            contact: ticket.contact,
        });

        // Also broadcast globally for ticket list updates
        this.server.emit('ticket:updated', ticket);
    }

    // ==================== Client Messages ====================

    @SubscribeMessage('join:ticket')
    handleJoinTicket(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() ticketId: number,
    ) {
        client.join(`ticket:${ticketId}`);
        this.logger.debug(`Client ${client.id} joined ticket:${ticketId}`);
        return { event: 'joined', data: { room: `ticket:${ticketId}` } };
    }

    @SubscribeMessage('leave:ticket')
    handleLeaveTicket(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() ticketId: number,
    ) {
        client.leave(`ticket:${ticketId}`);
        this.logger.debug(`Client ${client.id} left ticket:${ticketId}`);
        return { event: 'left', data: { room: `ticket:${ticketId}` } };
    }

    @SubscribeMessage('join:queue')
    handleJoinQueue(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() queueId: number,
    ) {
        client.join(`queue:${queueId}`);
        this.logger.debug(`Client ${client.id} joined queue:${queueId}`);
        return { event: 'joined', data: { room: `queue:${queueId}` } };
    }

    @SubscribeMessage('leave:queue')
    handleLeaveQueue(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() queueId: number,
    ) {
        client.leave(`queue:${queueId}`);
        this.logger.debug(`Client ${client.id} left queue:${queueId}`);
        return { event: 'left', data: { room: `queue:${queueId}` } };
    }

    @SubscribeMessage('ping')
    handlePing(@ConnectedSocket() client: AuthenticatedSocket) {
        return { event: 'pong', data: { timestamp: Date.now() } };
    }

    // ==================== Utility Methods ====================

    isUserOnline(userId: number): boolean {
        return this.connectedUsers.has(userId);
    }

    getOnlineUserIds(): number[] {
        return Array.from(this.connectedUsers.keys());
    }

    emitToUser(userId: number, event: string, data: any) {
        this.server.to(`user:${userId}`).emit(event, data);
    }

    emitToTicket(ticketId: number, event: string, data: any) {
        this.server.to(`ticket:${ticketId}`).emit(event, data);
    }

    emitToQueue(queueId: number, event: string, data: any) {
        this.server.to(`queue:${queueId}`).emit(event, data);
    }

    broadcast(event: string, data: any) {
        this.server.emit(event, data);
    }
}
