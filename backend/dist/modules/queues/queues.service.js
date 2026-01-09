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
var QueuesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueuesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let QueuesService = QueuesService_1 = class QueuesService {
    prisma;
    logger = new common_1.Logger(QueuesService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.queue.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { users: true, whatsapps: true, tickets: true },
                },
            },
        });
    }
    async findOne(id) {
        const queue = await this.prisma.queue.findUnique({
            where: { id },
            include: {
                users: { include: { user: { select: { id: true, name: true, email: true } } } },
                whatsapps: { include: { whatsapp: { select: { id: true, name: true } } } },
            },
        });
        if (!queue)
            throw new common_1.NotFoundException('Fila não encontrada');
        return queue;
    }
    async create(dto) {
        const existing = await this.prisma.queue.findUnique({ where: { name: dto.name } });
        if (existing)
            throw new common_1.ConflictException('Fila já existe com este nome');
        const queue = await this.prisma.queue.create({ data: dto });
        this.logger.log(`Queue created: ${queue.name}`);
        return queue;
    }
    async update(id, dto) {
        await this.findOne(id);
        if (dto.name) {
            const existing = await this.prisma.queue.findFirst({ where: { name: dto.name, id: { not: id } } });
            if (existing)
                throw new common_1.ConflictException('Fila já existe com este nome');
        }
        return this.prisma.queue.update({ where: { id }, data: dto });
    }
    async delete(id) {
        await this.findOne(id);
        await this.prisma.queue.delete({ where: { id } });
        this.logger.log(`Queue deleted: ${id}`);
    }
};
exports.QueuesService = QueuesService;
exports.QueuesService = QueuesService = QueuesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], QueuesService);
//# sourceMappingURL=queues.service.js.map