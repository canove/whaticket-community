import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);
    private pool: Pool;

    constructor() {
        const connectionString = process.env.DATABASE_URL;

        if (!connectionString) {
            throw new Error('DATABASE_URL environment variable is required');
        }

        const pool = new Pool({ connectionString });
        const adapter = new PrismaPg(pool);

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

        // Delete in order respecting foreign keys
        const models = Reflect.ownKeys(this).filter(
            (key): key is string => typeof key === 'string' && !key.startsWith('_') && !key.startsWith('$')
        );

        return Promise.all(
            models.map((modelKey) => {
                const model = this[modelKey as keyof this];
                if (model && typeof model === 'object' && 'deleteMany' in model) {
                    return (model as { deleteMany: () => Promise<unknown> }).deleteMany();
                }
                return Promise.resolve();
            })
        );
    }
}
