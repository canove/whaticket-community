import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCampaignDto, UpdateCampaignDto } from './dto';

@Injectable()
export class CampaignsService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(userId: number) {
        return this.prisma.campaign.findMany({
            where: { userId },
            include: {
                _count: { select: { contacts: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: number, userId: number) {
        const campaign = await this.prisma.campaign.findFirst({
            where: { id, userId },
            include: {
                contacts: {
                    include: {
                        contact: { select: { id: true, name: true, number: true } },
                    },
                },
                _count: { select: { contacts: true } },
            },
        });

        if (!campaign) {
            throw new NotFoundException('Campanha não encontrada');
        }

        return campaign;
    }

    async create(userId: number, dto: CreateCampaignDto) {
        const campaign = await this.prisma.campaign.create({
            data: {
                name: dto.name,
                message: dto.message,
                userId,
            },
        });

        if (dto.contactIds?.length) {
            await this.addContacts(campaign.id, userId, dto.contactIds);
        }

        return this.findOne(campaign.id, userId);
    }

    async update(id: number, userId: number, dto: UpdateCampaignDto) {
        const campaign = await this.findOne(id, userId);

        if (campaign.status !== 'draft') {
            throw new BadRequestException('Apenas campanhas em rascunho podem ser editadas');
        }

        const data: any = {};
        if (dto.name) data.name = dto.name;
        if (dto.message) data.message = dto.message;

        await this.prisma.campaign.update({
            where: { id },
            data,
        });

        if (dto.contactIds) {
            await this.prisma.campaignContact.deleteMany({ where: { campaignId: id } });
            await this.addContacts(id, userId, dto.contactIds);
        }

        return this.findOne(id, userId);
    }

    async addContacts(campaignId: number, userId: number, contactIds: number[]) {
        const campaign = await this.findOne(campaignId, userId);

        if (campaign.status !== 'draft') {
            throw new BadRequestException('Apenas campanhas em rascunho podem ter contatos adicionados');
        }

        const contacts = await this.prisma.campaignContact.createMany({
            data: contactIds.map((contactId) => ({
                campaignId,
                contactId,
            })),
            skipDuplicates: true,
        });

        return contacts;
    }

    async start(id: number, userId: number) {
        const campaign = await this.findOne(id, userId);

        if (campaign.status !== 'draft') {
            throw new BadRequestException('Apenas campanhas em rascunho podem ser iniciadas');
        }

        if (!campaign.contacts.length) {
            throw new BadRequestException('Adicione contatos à campanha antes de iniciar');
        }

        return this.prisma.campaign.update({
            where: { id },
            data: {
                status: 'running',
                startedAt: new Date(),
            },
        });
    }

    async cancel(id: number, userId: number) {
        const campaign = await this.findOne(id, userId);

        if (!['draft', 'scheduled', 'running'].includes(campaign.status)) {
            throw new BadRequestException('Esta campanha não pode ser cancelada');
        }

        return this.prisma.campaign.update({
            where: { id },
            data: { status: 'cancelled' },
        });
    }

    async remove(id: number, userId: number) {
        const campaign = await this.findOne(id, userId);

        if (campaign.status === 'running') {
            throw new BadRequestException('Não é possível excluir campanhas em execução');
        }

        await this.prisma.campaignContact.deleteMany({ where: { campaignId: id } });
        return this.prisma.campaign.delete({ where: { id } });
    }
}
