import { PrismaService } from '../../database/prisma.service';
export declare class HealthController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    check(): Promise<{
        status: string;
        timestamp: string;
        uptime: number;
        checks: {
            database: {
                status: string;
                latency?: number;
            };
        };
    }>;
    private checkDatabase;
}
