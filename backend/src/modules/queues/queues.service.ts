import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateQueueDto, UpdateQueueDto } from './dto';

@Injectable()
export class QueuesService {
    private readonly logger = new Logger(QueuesService.name);

    constructor(private readonly prisma: PrismaService) { }

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

    async findOne(id: number) {
        const queue = await this.prisma.queue.findUnique({
            where: { id },
            include: {
                users: { include: { user: { select: { id: true, name: true, email: true } } } },
                whatsapps: { include: { whatsapp: { select: { id: true, name: true } } } },
            },
        });
        if (!queue) throw new NotFoundException('Fila não encontrada');
        return queue;
    }

    async create(dto: CreateQueueDto) {
        const existing = await this.prisma.queue.findUnique({ where: { name: dto.name } });
        if (existing) throw new ConflictException('Fila já existe com este nome');
        const queue = await this.prisma.queue.create({ data: dto });
        this.logger.log(`Queue created: ${queue.name}`);
        return queue;
    }

    async update(id: number, dto: UpdateQueueDto) {
        await this.findOne(id);
        if (dto.name) {
            const existing = await this.prisma.queue.findFirst({ where: { name: dto.name, id: { not: id } } });
            if (existing) throw new ConflictException('Fila já existe com este nome');
        }
        return this.prisma.queue.update({ where: { id }, data: dto });
    }

    async delete(id: number) {
        await this.findOne(id);
        await this.prisma.queue.delete({ where: { id } });
        this.logger.log(`Queue deleted: ${id}`);
    }
}
