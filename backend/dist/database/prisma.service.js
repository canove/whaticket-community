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
var PrismaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
let PrismaService = PrismaService_1 = class PrismaService extends client_1.PrismaClient {
    logger = new common_1.Logger(PrismaService_1.name);
    pool;
    constructor() {
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
            throw new Error('DATABASE_URL environment variable is required');
        }
        const pool = new pg_1.Pool({ connectionString });
        const adapter = new adapter_pg_1.PrismaPg(pool);
        super({
            adapter,
            log: process.env.NODE_ENV === 'development'
                ? ['query', 'info', 'warn', 'error']
                : ['error'],
        });
        this.pool = pool;
    }
    async onModuleInit() {
        await this.$connect();
        this.logger.log('Prisma connected to database');
    }
    async onModuleDestroy() {
        await this.$disconnect();
        await this.pool.end();
        this.logger.log('Prisma disconnected from database');
    }
    async cleanDatabase() {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('cleanDatabase is not allowed in production');
        }
        const models = Reflect.ownKeys(this).filter((key) => typeof key === 'string' && !key.startsWith('_') && !key.startsWith('$'));
        return Promise.all(models.map((modelKey) => {
            const model = this[modelKey];
            if (model && typeof model === 'object' && 'deleteMany' in model) {
                return model.deleteMany();
            }
            return Promise.resolve();
        }));
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = PrismaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map