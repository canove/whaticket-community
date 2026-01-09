import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePromptDto, UpdatePromptDto } from './dto';

@Injectable()
export class PromptsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreatePromptDto) {
        return this.prisma.prompt.create({
            data: dto,
        });
    }

    async findAll() {
        return this.prisma.prompt.findMany();
    }

    async findOne(id: number) {
        return this.prisma.prompt.findUnique({ where: { id } });
    }

    async update(id: number, dto: UpdatePromptDto) {
        return this.prisma.prompt.update({
            where: { id },
            data: dto,
        });
    }

    async delete(id: number) {
        return this.prisma.prompt.delete({ where: { id } });
    }
}
