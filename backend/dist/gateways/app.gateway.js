"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AppGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
let AppGateway = AppGateway_1 = class AppGateway {
    jwtService;
    configService;
    server;
    logger = new common_1.Logger(AppGateway_1.name);
    connectedUsers = new Map();
    constructor(jwtService, configService) {
        this.jwtService = jwtService;
        this.configService = configService;
    }
    afterInit(server) {
        this.logger.log('WebSocket Gateway initialized');
    }
    async handleConnection(client) {
        try {
            const token = this.extractToken(client);
            if (!token) {
                this.logger.warn(`Client ${client.id} connection rejected: No token`);
                client.disconnect();
                return;
            }
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get('jwt.secret'),
            });
            client.userId = payload.sub;
            client.userProfile = payload.profile;
            if (!this.connectedUsers.has(payload.sub)) {
                this.connectedUsers.set(payload.sub, new Set());
            }
            this.connectedUsers.get(payload.sub).add(client.id);
            client.join(`user:${payload.sub}`);
            client.join(`profile:${payload.profile}`);
            this.logger.log(`Client ${client.id} connected - User: ${payload.sub}, Profile: ${payload.profile}`);
            client.emit('connected', { userId: payload.sub });
        }
        catch (error) {
            this.logger.warn(`Client ${client.id} connection rejected: Invalid token`);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
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
    extractToken(client) {
        const authHeader = client.handshake.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7);
        }
        const token = client.handshake.auth?.token;
        if (token) {
            return token;
        }
        return client.handshake.query?.token;
    }
    handleTicketCreated(ticket) {
        this.logger.debug(`Broadcasting ticket.created: ${ticket.id}`);
        if (ticket.queueId) {
            this.server.to(`queue:${ticket.queueId}`).emit('ticket:created', ticket);
        }
        this.server.to('profile:admin').to('profile:supervisor').emit('ticket:created', ticket);
        if (!ticket.userId) {
            this.server.emit('ticket:created', ticket);
        }
    }
    handleTicketUpdated(ticket) {
        this.logger.debug(`Broadcasting ticket.updated: ${ticket.id}`);
        if (ticket.userId) {
            this.server.to(`user:${ticket.userId}`).emit('ticket:updated', ticket);
        }
        if (ticket.queueId) {
            this.server.to(`queue:${ticket.queueId}`).emit('ticket:updated', ticket);
        }
        this.server.to('profile:admin').to('profile:supervisor').emit('ticket:updated', ticket);
    }
    handleTicketTransferred(data) {
        const { ticket, previousQueue, previousUser } = data;
        if (previousUser) {
            this.server.to(`user:${previousUser.id}`).emit('ticket:transferred', {
                ticket,
                type: 'removed',
            });
        }
        if (ticket.userId) {
            this.server.to(`user:${ticket.userId}`).emit('ticket:transferred', {
                ticket,
                type: 'assigned',
            });
        }
        if (previousQueue) {
            this.server.to(`queue:${previousQueue.id}`).emit('ticket:transferred', { ticket });
        }
        if (ticket.queueId) {
            this.server.to(`queue:${ticket.queueId}`).emit('ticket:transferred', { ticket });
        }
    }
    handleTicketClosed(ticket) {
        this.logger.debug(`Broadcasting ticket.closed: ${ticket.id}`);
        this.server.emit('ticket:closed', ticket);
    }
    handleTicketReopened(ticket) {
        this.logger.debug(`Broadcasting ticket.reopened: ${ticket.id}`);
        this.server.emit('ticket:reopened', ticket);
    }
    handleMessageSent(data) {
        const { message, ticket } = data;
        this.logger.debug(`Broadcasting message.sent: ${message.id}`);
        this.server.to(`ticket:${ticket.id}`).emit('message:created', message);
        if (ticket.userId) {
            this.server.to(`user:${ticket.userId}`).emit('message:created', message);
        }
    }
    handleMessageReceived(data) {
        this.logger.debug(`Broadcasting whatsapp.message.received`);
        this.server.emit('message:received', data);
    }
    handleQRCode(data) {
        this.logger.debug(`Broadcasting whatsapp.qrcode: ${data.sessionId}`);
        this.server.to('profile:admin').emit('whatsapp:qrcode', data);
    }
    handleSessionUpdate(data) {
        this.logger.debug(`Broadcasting whatsapp.session.update: ${data.sessionId}`);
        this.server.to('profile:admin').emit('whatsapp:session', data);
    }
    handleWhatsAppConnection(data) {
        this.logger.debug(`Broadcasting whatsapp.connection: ${data.sessionId} - ${data.status}`);
        this.server.to('profile:admin').emit('whatsapp:connection', data);
    }
    handleJoinTicket(client, ticketId) {
        client.join(`ticket:${ticketId}`);
        this.logger.debug(`Client ${client.id} joined ticket:${ticketId}`);
        return { event: 'joined', data: { room: `ticket:${ticketId}` } };
    }
    handleLeaveTicket(client, ticketId) {
        client.leave(`ticket:${ticketId}`);
        this.logger.debug(`Client ${client.id} left ticket:${ticketId}`);
        return { event: 'left', data: { room: `ticket:${ticketId}` } };
    }
    handleJoinQueue(client, queueId) {
        client.join(`queue:${queueId}`);
        this.logger.debug(`Client ${client.id} joined queue:${queueId}`);
        return { event: 'joined', data: { room: `queue:${queueId}` } };
    }
    handleLeaveQueue(client, queueId) {
        client.leave(`queue:${queueId}`);
        this.logger.debug(`Client ${client.id} left queue:${queueId}`);
        return { event: 'left', data: { room: `queue:${queueId}` } };
    }
    handlePing(client) {
        return { event: 'pong', data: { timestamp: Date.now() } };
    }
    isUserOnline(userId) {
        return this.connectedUsers.has(userId);
    }
    getOnlineUserIds() {
        return Array.from(this.connectedUsers.keys());
    }
    emitToUser(userId, event, data) {
        this.server.to(`user:${userId}`).emit(event, data);
    }
    emitToTicket(ticketId, event, data) {
        this.server.to(`ticket:${ticketId}`).emit(event, data);
    }
    emitToQueue(queueId, event, data) {
        this.server.to(`queue:${queueId}`).emit(event, data);
    }
    broadcast(event, data) {
        this.server.emit(event, data);
    }
};
exports.AppGateway = AppGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], AppGateway.prototype, "server", void 0);
__decorate([
    (0, event_emitter_1.OnEvent)('ticket.created'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppGateway.prototype, "handleTicketCreated", null);
__decorate([
    (0, event_emitter_1.OnEvent)('ticket.updated'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppGateway.prototype, "handleTicketUpdated", null);
__decorate([
    (0, event_emitter_1.OnEvent)('ticket.transferred'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppGateway.prototype, "handleTicketTransferred", null);
__decorate([
    (0, event_emitter_1.OnEvent)('ticket.closed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppGateway.prototype, "handleTicketClosed", null);
__decorate([
    (0, event_emitter_1.OnEvent)('ticket.reopened'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppGateway.prototype, "handleTicketReopened", null);
__decorate([
    (0, event_emitter_1.OnEvent)('message.sent'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppGateway.prototype, "handleMessageSent", null);
__decorate([
    (0, event_emitter_1.OnEvent)('whatsapp.message.received'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppGateway.prototype, "handleMessageReceived", null);
__decorate([
    (0, event_emitter_1.OnEvent)('whatsapp.qrcode'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppGateway.prototype, "handleQRCode", null);
__decorate([
    (0, event_emitter_1.OnEvent)('whatsapp.session.update'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppGateway.prototype, "handleSessionUpdate", null);
__decorate([
    (0, event_emitter_1.OnEvent)('whatsapp.connection'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppGateway.prototype, "handleWhatsAppConnection", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('join:ticket'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], AppGateway.prototype, "handleJoinTicket", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave:ticket'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], AppGateway.prototype, "handleLeaveTicket", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('join:queue'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], AppGateway.prototype, "handleJoinQueue", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave:queue'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], AppGateway.prototype, "handleLeaveQueue", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('ping'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppGateway.prototype, "handlePing", null);
exports.AppGateway = AppGateway = AppGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
            credentials: true,
        },
        namespace: '/',
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService])
], AppGateway);
//# sourceMappingURL=app.gateway.js.map