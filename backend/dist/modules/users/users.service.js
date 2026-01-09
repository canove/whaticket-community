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
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcryptjs"));
const prisma_service_1 = require("../../database/prisma.service");
let UsersService = UsersService_1 = class UsersService {
    prisma;
    logger = new common_1.Logger(UsersService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { email: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        if (query.profile) {
            where.profile = query.profile;
        }
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { name: 'asc' },
                include: {
                    queues: {
                        include: {
                            queue: {
                                select: { id: true, name: true },
                            },
                        },
                    },
                },
            }),
            this.prisma.user.count({ where }),
        ]);
        return {
            users: users.map(this.formatUser),
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                queues: {
                    include: {
                        queue: {
                            select: { id: true, name: true },
                        },
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        return this.formatUser(user);
    }
    async create(dto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email já cadastrado');
        }
        const passwordHash = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                passwordHash,
                profile: dto.profile || 'user',
                queues: dto.queueIds?.length ? {
                    create: dto.queueIds.map(queueId => ({ queueId })),
                } : undefined,
            },
            include: {
                queues: {
                    include: {
                        queue: {
                            select: { id: true, name: true },
                        },
                    },
                },
            },
        });
        this.logger.log(`User created: ${user.email}`);
        return this.formatUser(user);
    }
    async update(id, dto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!existingUser) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        if (dto.email && dto.email !== existingUser.email) {
            const emailExists = await this.prisma.user.findUnique({
                where: { email: dto.email },
            });
            if (emailExists) {
                throw new common_1.ConflictException('Email já cadastrado');
            }
        }
        const updateData = {
            name: dto.name,
            email: dto.email,
            profile: dto.profile,
            isActive: dto.isActive,
        };
        if (dto.password) {
            updateData.passwordHash = await bcrypt.hash(dto.password, 10);
        }
        if (dto.queueIds !== undefined) {
            await this.prisma.userQueue.deleteMany({ where: { userId: id } });
            if (dto.queueIds.length > 0) {
                await this.prisma.userQueue.createMany({
                    data: dto.queueIds.map(queueId => ({ userId: id, queueId })),
                });
            }
        }
        const user = await this.prisma.user.update({
            where: { id },
            data: updateData,
            include: {
                queues: {
                    include: {
                        queue: {
                            select: { id: true, name: true },
                        },
                    },
                },
            },
        });
        this.logger.log(`User updated: ${user.email}`);
        return this.formatUser(user);
    }
    async delete(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        await this.prisma.user.delete({ where: { id } });
        this.logger.log(`User deleted: ${user.email}`);
    }
    formatUser(user) {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            profile: user.profile,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            queues: user.queues?.map((uq) => ({
                id: uq.queue.id,
                name: uq.queue.name,
            })),
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map