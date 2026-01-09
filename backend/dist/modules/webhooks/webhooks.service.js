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
var WebhooksService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
let WebhooksService = WebhooksService_1 = class WebhooksService {
    prisma;
    webhookQueue;
    logger = new common_1.Logger(WebhooksService_1.name);
    constructor(prisma, webhookQueue) {
        this.prisma = prisma;
        this.webhookQueue = webhookQueue;
    }
    async create(dto) {
        return this.prisma.webhook.create({
            data: dto,
        });
    }
    async findAll() {
        return this.prisma.webhook.findMany();
    }
    async findOne(id) {
        return this.prisma.webhook.findUnique({ where: { id } });
    }
    async update(id, dto) {
        return this.prisma.webhook.update({
            where: { id },
            data: dto,
        });
    }
    async delete(id) {
        return this.prisma.webhook.delete({ where: { id } });
    }
    async trigger(event, payload) {
        const webhooks = await this.prisma.webhook.findMany({
            where: {
                enabled: true,
                events: { has: event },
            },
        });
        if (webhooks.length === 0)
            return;
        this.logger.log(`Triggering specific event: ${event} for ${webhooks.length} webhooks`);
        const jobs = webhooks.map((webhook) => ({
            name: 'dispatch',
            data: {
                webhook,
                event,
                payload,
            },
            opts: {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000,
                },
                removeOnComplete: true,
            },
        }));
        await this.webhookQueue.addBulk(jobs);
    }
};
exports.WebhooksService = WebhooksService;
exports.WebhooksService = WebhooksService = WebhooksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, bullmq_1.InjectQueue)('webhooks')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        bullmq_2.Queue])
], WebhooksService);
//# sourceMappingURL=webhooks.service.js.map