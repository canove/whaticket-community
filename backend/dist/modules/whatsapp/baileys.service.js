"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var BaileysService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaileysService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
const baileys_1 = __importStar(require("@whiskeysockets/baileys"));
const qrcode = __importStar(require("qrcode-terminal"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
const pino_1 = __importDefault(require("pino"));
let BaileysService = BaileysService_1 = class BaileysService {
    configService;
    eventEmitter;
    logger = new common_1.Logger(BaileysService_1.name);
    sessions = new Map();
    sessionsPath;
    reconnectInterval;
    constructor(configService, eventEmitter) {
        this.configService = configService;
        this.eventEmitter = eventEmitter;
        this.sessionsPath = this.configService.get('whatsapp.sessionsPath', './sessions');
        this.reconnectInterval = this.configService.get('whatsapp.reconnectInterval', 5000);
    }
    async onModuleDestroy() {
        this.logger.log('Closing all WhatsApp sessions...');
        for (const [id, session] of this.sessions) {
            try {
                session.socket.end(undefined);
                this.logger.log(`Session ${id} closed`);
            }
            catch (error) {
                this.logger.error(`Error closing session ${id}:`, error);
            }
        }
        this.sessions.clear();
    }
    async initSession(whatsappId, name) {
        const existingSession = this.sessions.get(whatsappId);
        if (existingSession && existingSession.status === 'connected') {
            this.logger.log(`Session ${whatsappId} already connected`);
            return existingSession;
        }
        const sessionPath = path.join(this.sessionsPath, `session_${whatsappId}`);
        await fs.mkdir(sessionPath, { recursive: true });
        const { state, saveCreds } = await (0, baileys_1.useMultiFileAuthState)(sessionPath);
        const socket = (0, baileys_1.default)({
            auth: state,
            printQRInTerminal: true,
            logger: (0, pino_1.default)({ level: 'silent' }),
            browser: ['Whaticket Enterprise', 'Chrome', '22.0.0'],
            markOnlineOnConnect: true,
            syncFullHistory: false,
            generateHighQualityLinkPreview: true,
        });
        const session = {
            id: whatsappId,
            socket,
            status: 'connecting',
            retries: 0,
        };
        this.sessions.set(whatsappId, session);
        socket.ev.on('connection.update', async (update) => {
            await this.handleConnectionUpdate(session, update, name);
        });
        socket.ev.on('creds.update', saveCreds);
        socket.ev.on('messages.upsert', async ({ messages, type }) => {
            await this.handleMessagesUpsert(session, messages, type);
        });
        socket.ev.on('messages.update', async (updates) => {
            for (const update of updates) {
                this.eventEmitter.emit('whatsapp.message.update', {
                    sessionId: whatsappId,
                    messageId: update.key.id,
                    update,
                });
            }
        });
        return session;
    }
    async handleConnectionUpdate(session, update, name) {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            session.status = 'qrcode';
            session.qrCode = qr;
            this.logger.log(`Session ${session.id} (${name}): QR Code generated`);
            qrcode.generate(qr, { small: true });
            this.eventEmitter.emit('whatsapp.qrcode', {
                sessionId: session.id,
                qrCode: qr,
            });
        }
        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = statusCode !== baileys_1.DisconnectReason.loggedOut;
            this.logger.warn(`Session ${session.id} (${name}) disconnected. ` +
                `Reason: ${baileys_1.DisconnectReason[statusCode] || statusCode}. ` +
                `Reconnecting: ${shouldReconnect}`);
            session.status = 'disconnected';
            this.eventEmitter.emit('whatsapp.connection', {
                sessionId: session.id,
                status: 'disconnected',
                reason: baileys_1.DisconnectReason[statusCode] || `Status code: ${statusCode}`,
            });
            if (shouldReconnect) {
                session.retries++;
                if (session.retries < 5) {
                    setTimeout(() => {
                        this.initSession(session.id, name);
                    }, this.reconnectInterval * session.retries);
                }
                else {
                    this.logger.error(`Session ${session.id} max retries reached`);
                }
            }
            else {
                await this.clearSession(session.id);
            }
        }
        if (connection === 'open') {
            session.status = 'connected';
            session.retries = 0;
            session.qrCode = undefined;
            this.logger.log(`Session ${session.id} (${name}): Connected successfully`);
            this.eventEmitter.emit('whatsapp.connection', {
                sessionId: session.id,
                status: 'connected',
            });
        }
    }
    async handleMessagesUpsert(session, messages, type) {
        for (const message of messages) {
            if (message.key.remoteJid === 'status@broadcast') {
                continue;
            }
            this.logger.debug(`Session ${session.id}: Message received from ${message.key.remoteJid}`);
            this.eventEmitter.emit('whatsapp.message.received', {
                sessionId: session.id,
                message,
                type,
            });
        }
    }
    async sendTextMessage(whatsappId, to, text) {
        const session = this.sessions.get(whatsappId);
        if (!session || session.status !== 'connected') {
            throw new Error(`Session ${whatsappId} is not connected`);
        }
        const jid = this.formatJid(to);
        return session.socket.sendMessage(jid, { text });
    }
    async sendMediaMessage(whatsappId, to, media) {
        const session = this.sessions.get(whatsappId);
        if (!session || session.status !== 'connected') {
            throw new Error(`Session ${whatsappId} is not connected`);
        }
        const jid = this.formatJid(to);
        const mediaContent = media.buffer
            ? media.buffer
            : { url: media.url };
        const messageContent = {
            mimetype: media.mimetype,
            caption: media.caption,
        };
        switch (media.type) {
            case 'image':
                messageContent.image = mediaContent;
                break;
            case 'video':
                messageContent.video = mediaContent;
                break;
            case 'audio':
                messageContent.audio = mediaContent;
                messageContent.ptt = false;
                break;
            case 'document':
                messageContent.document = mediaContent;
                messageContent.fileName = media.filename;
                break;
        }
        return session.socket.sendMessage(jid, messageContent);
    }
    async getProfilePicture(whatsappId, contactNumber) {
        const session = this.sessions.get(whatsappId);
        if (!session || session.status !== 'connected') {
            return undefined;
        }
        try {
            const jid = this.formatJid(contactNumber);
            return await session.socket.profilePictureUrl(jid, 'image');
        }
        catch {
            return undefined;
        }
    }
    async checkNumberExists(whatsappId, number) {
        const session = this.sessions.get(whatsappId);
        if (!session || session.status !== 'connected') {
            throw new Error(`Session ${whatsappId} is not connected`);
        }
        try {
            const jid = this.formatJid(number);
            const results = await session.socket.onWhatsApp(jid);
            const result = results?.[0];
            return result?.exists || false;
        }
        catch {
            return false;
        }
    }
    async logout(whatsappId) {
        const session = this.sessions.get(whatsappId);
        if (session) {
            await session.socket.logout();
            await this.clearSession(whatsappId);
        }
    }
    async clearSession(whatsappId) {
        this.sessions.delete(whatsappId);
        const sessionPath = path.join(this.sessionsPath, `session_${whatsappId}`);
        try {
            await fs.rm(sessionPath, { recursive: true, force: true });
            this.logger.log(`Session ${whatsappId} cleared`);
        }
        catch (error) {
            this.logger.error(`Error clearing session ${whatsappId}:`, error);
        }
    }
    getSession(whatsappId) {
        return this.sessions.get(whatsappId);
    }
    getAllSessions() {
        return Array.from(this.sessions.values());
    }
    isConnected(whatsappId) {
        const session = this.sessions.get(whatsappId);
        return session?.status === 'connected';
    }
    formatJid(number) {
        const cleanNumber = number.replace(/\D/g, '');
        if (cleanNumber.includes('@')) {
            return cleanNumber;
        }
        return `${cleanNumber}@s.whatsapp.net`;
    }
};
exports.BaileysService = BaileysService;
exports.BaileysService = BaileysService = BaileysService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        event_emitter_1.EventEmitter2])
], BaileysService);
//# sourceMappingURL=baileys.service.js.map