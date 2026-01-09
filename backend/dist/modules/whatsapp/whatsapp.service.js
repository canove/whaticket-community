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
var WhatsappService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const baileys_service_1 = require("./baileys.service");
const event_emitter_1 = require("@nestjs/event-emitter");
let WhatsappService = WhatsappService_1 = class WhatsappService {
    prisma;
    baileys;
    eventEmitter;
    logger = new common_1.Logger(WhatsappService_1.name);
    constructor(prisma, baileys, eventEmitter) {
        this.prisma = prisma;
        this.baileys = baileys;
        this.eventEmitter = eventEmitter;
    }
    async findAll() {
        return this.prisma.whatsapp.findMany({
            include: {
                queues: {
                    include: {
                        queue: true,
                    },
                },
            },
            orderBy: { name: 'asc' },
        });
    }
    async findOne(id) {
        const whatsapp = await this.prisma.whatsapp.findUnique({
            where: { id },
            include: {
                queues: {
                    include: {
                        queue: true,
                    },
                },
            },
        });
        if (!whatsapp) {
            throw new common_1.NotFoundException(`WhatsApp connection ${id} not found`);
        }
        return whatsapp;
    }
    async findDefault() {
        return this.prisma.whatsapp.findFirst({
            where: { isDefault: true },
        });
    }
    async create(data) {
        if (data.isDefault) {
            await this.prisma.whatsapp.updateMany({
                where: { isDefault: true },
                data: { isDefault: false },
            });
        }
        const whatsapp = await this.prisma.whatsapp.create({
            data: {
                name: data.name,
                greetingMessage: data.greetingMessage,
                farewellMessage: data.farewellMessage,
                isDefault: data.isDefault || false,
                queues: data.queueIds ? {
                    create: data.queueIds.map(queueId => ({ queueId })),
                } : undefined,
            },
            include: {
                queues: {
                    include: {
                        queue: true,
                    },
                },
            },
        });
        this.logger.log(`WhatsApp connection created: ${whatsapp.name}`);
        return whatsapp;
    }
    async update(id, data) {
        await this.findOne(id);
        if (data.isDefault) {
            await this.prisma.whatsapp.updateMany({
                where: { isDefault: true, id: { not: id } },
                data: { isDefault: false },
            });
        }
        if (data.queueIds) {
            await this.prisma.whatsappQueue.deleteMany({
                where: { whatsappId: id },
            });
            await this.prisma.whatsappQueue.createMany({
                data: data.queueIds.map(queueId => ({ whatsappId: id, queueId })),
            });
        }
        return this.prisma.whatsapp.update({
            where: { id },
            data: {
                name: data.name,
                greetingMessage: data.greetingMessage,
                farewellMessage: data.farewellMessage,
                isDefault: data.isDefault,
            },
            include: {
                queues: {
                    include: {
                        queue: true,
                    },
                },
            },
        });
    }
    async delete(id) {
        await this.findOne(id);
        await this.logout(id);
        await this.prisma.whatsapp.delete({
            where: { id },
        });
        this.logger.log(`WhatsApp connection deleted: ${id}`);
    }
    async initSession(id) {
        const whatsapp = await this.findOne(id);
        await this.prisma.whatsapp.update({
            where: { id },
            data: { status: 'OPENING' },
        });
        const session = await this.baileys.initSession(id, whatsapp.name);
        return {
            qrCode: session.qrCode,
            status: session.status,
        };
    }
    async logout(id) {
        await this.baileys.logout(id);
        await this.prisma.whatsapp.update({
            where: { id },
            data: {
                status: 'DISCONNECTED',
                qrcode: null,
                session: null,
            },
        });
        this.eventEmitter.emit('whatsapp.session.update', {
            sessionId: id,
            status: 'DISCONNECTED',
        });
    }
    async updateStatus(id, status, qrcode) {
        await this.prisma.whatsapp.update({
            where: { id },
            data: { status, qrcode },
        });
        this.eventEmitter.emit('whatsapp.session.update', {
            sessionId: id,
            status,
            qrcode,
        });
    }
    async startAllSessions() {
        const whatsapps = await this.prisma.whatsapp.findMany({
            where: { status: { not: 'DISCONNECTED' } },
        });
        this.logger.log(`Starting ${whatsapps.length} WhatsApp sessions...`);
        for (const whatsapp of whatsapps) {
            try {
                await this.initSession(whatsapp.id);
            }
            catch (error) {
                this.logger.error(`Error starting session ${whatsapp.id}:`, error);
            }
        }
    }
    getSessionStatus(id) {
        const session = this.baileys.getSession(id);
        return {
            connected: session?.status === 'connected',
            status: session?.status || 'disconnected',
        };
    }
};
exports.WhatsappService = WhatsappService;
exports.WhatsappService = WhatsappService = WhatsappService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        baileys_service_1.BaileysService,
        event_emitter_1.EventEmitter2])
], WhatsappService);
//# sourceMappingURL=whatsapp.service.js.map