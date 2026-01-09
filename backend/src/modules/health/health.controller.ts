import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../auth/decorators';
import { PrismaService } from '../../database/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
    constructor(private readonly prisma: PrismaService) { }

    @Get()
    @Public()
    @ApiOperation({ summary: 'Health check' })
    @ApiResponse({ status: 200, description: 'Service is healthy' })
    async check() {
        const dbCheck = await this.checkDatabase();

        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            checks: {
                database: dbCheck,
            },
        };
    }

    private async checkDatabase(): Promise<{ status: string; latency?: number }> {
        const start = Date.now();
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            return { status: 'ok', latency: Date.now() - start };
        } catch {
            return { status: 'error' };
        }
    }
}
