import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { InternalChatService } from './internal-chat.service';

interface AuthenticatedSocket extends Socket {
    userId?: number;
}

@WebSocketGateway({
    namespace: '/internal-chat',
    cors: { origin: '*' },
})
export class InternalChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server!: Server;
    private readonly logger = new Logger(InternalChatGateway.name);
    private userSockets = new Map<number, string[]>();

    constructor(private readonly internalChatService: InternalChatService) { }

    handleConnection(client: AuthenticatedSocket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: AuthenticatedSocket) {
        this.logger.log(`Client disconnected: ${client.id}`);

        // Remove from userSockets
        if (client.userId) {
            const sockets = this.userSockets.get(client.userId) || [];
            const filtered = sockets.filter(id => id !== client.id);
            if (filtered.length === 0) {
                this.userSockets.delete(client.userId);
            } else {
                this.userSockets.set(client.userId, filtered);
            }
        }
    }

    @SubscribeMessage('register')
    handleRegister(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { userId: number },
    ) {
        client.userId = data.userId;

        const sockets = this.userSockets.get(data.userId) || [];
        sockets.push(client.id);
        this.userSockets.set(data.userId, sockets);

        this.logger.log(`User ${data.userId} registered with socket ${client.id}`);
        return { success: true };
    }

    @SubscribeMessage('send-message')
    async handleSendMessage(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { toUserId: number; body: string },
    ) {
        if (!client.userId) {
            return { error: 'Not authenticated' };
        }

        try {
            const message = await this.internalChatService.send(client.userId, {
                toUserId: data.toUserId,
                body: data.body,
            });

            // Send to recipient if online
            const recipientSockets = this.userSockets.get(data.toUserId) || [];
            for (const socketId of recipientSockets) {
                this.server.to(socketId).emit('new-message', message);
            }

            return { success: true, message };
        } catch (error) {
            this.logger.error('Error sending message:', error);
            return { error: 'Failed to send message' };
        }
    }

    @SubscribeMessage('mark-read')
    async handleMarkRead(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { fromUserId: number },
    ) {
        if (!client.userId) {
            return { error: 'Not authenticated' };
        }

        await this.internalChatService.markAsRead(client.userId, data.fromUserId);
        return { success: true };
    }

    // Method to send notification to specific user
    notifyUser(userId: number, event: string, data: any) {
        const sockets = this.userSockets.get(userId) || [];
        for (const socketId of sockets) {
            this.server.to(socketId).emit(event, data);
        }
    }
}
