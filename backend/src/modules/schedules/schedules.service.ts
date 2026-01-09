import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateScheduleDto, UpdateScheduleDto } from './dto';

@Injectable()
export class SchedulesService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(userId: number) {
        return this.prisma.schedule.findMany({
            where: { userId },
            include: {
                contact: { select: { id: true, name: true, number: true } },
                ticket: { select: { id: true, status: true } },
            },
            orderBy: { sendAt: 'asc' },
        });
    }

    async findOne(id: number, userId: number) {
        const schedule = await this.prisma.schedule.findFirst({
            where: { id, userId },
            include: {
                contact: { select: { id: true, name: true, number: true } },
                ticket: { select: { id: true, status: true } },
            },
        });

        if (!schedule) {
            throw new NotFoundException('Agendamento não encontrado');
        }

        return schedule;
    }

    async create(userId: number, dto: CreateScheduleDto) {
        const sendAt = new Date(dto.sendAt);

        if (sendAt <= new Date()) {
            throw new BadRequestException('A data de envio deve ser no futuro');
        }

        const contact = await this.prisma.contact.findUnique({
            where: { id: dto.contactId },
        });

        if (!contact) {
            throw new NotFoundException('Contato não encontrado');
        }

        return this.prisma.schedule.create({
            data: {
                body: dto.body,
                sendAt,
                contactId: dto.contactId,
                ticketId: dto.ticketId,
                userId,
            },
            include: {
                contact: { select: { id: true, name: true, number: true } },
            },
        });
    }

    async update(id: number, userId: number, dto: UpdateScheduleDto) {
        const schedule = await this.findOne(id, userId);

        if (schedule.status !== 'pending') {
            throw new BadRequestException('Apenas agendamentos pendentes podem ser editados');
        }

        const data: any = {};
        if (dto.body) data.body = dto.body;
        if (dto.sendAt) {
            const sendAt = new Date(dto.sendAt);
            if (sendAt <= new Date()) {
                throw new BadRequestException('A data de envio deve ser no futuro');
            }
            data.sendAt = sendAt;
        }

        return this.prisma.schedule.update({
            where: { id },
            data,
            include: {
                contact: { select: { id: true, name: true, number: true } },
            },
        });
    }

    async cancel(id: number, userId: number) {
        const schedule = await this.findOne(id, userId);

        if (schedule.status !== 'pending') {
            throw new BadRequestException('Apenas agendamentos pendentes podem ser cancelados');
        }

        return this.prisma.schedule.update({
            where: { id },
            data: { status: 'cancelled' },
        });
    }

    async remove(id: number, userId: number) {
        await this.findOne(id, userId);
        return this.prisma.schedule.delete({ where: { id } });
    }
}
