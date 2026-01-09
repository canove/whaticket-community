import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTagDto, UpdateTagDto } from './dto';

@Injectable()
export class TagsService {
    private readonly logger = new Logger(TagsService.name);

    constructor(private readonly prisma: PrismaService) { }

    async findAll(userId?: number) {
        return this.prisma.tag.findMany({
            orderBy: { name: 'asc' },
            include: {
                user: { select: { id: true, name: true } },
                _count: {
                    select: { tickets: true, contacts: true },
                },
            },
        });
    }

    async findOne(id: number) {
        const tag = await this.prisma.tag.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, name: true } },
                tickets: {
                    include: {
                        ticket: {
                            select: { id: true, status: true, contact: { select: { name: true } } }
                        }
                    },
                    take: 10
                },
                contacts: {
                    include: {
                        contact: { select: { id: true, name: true, number: true } }
                    },
                    take: 10
                },
            },
        });
        if (!tag) throw new NotFoundException('Etiqueta não encontrada');
        return tag;
    }

    async create(dto: CreateTagDto, userId?: number) {
        // Check for duplicate name within the same user context
        const existing = await this.prisma.tag.findFirst({
            where: {
                name: dto.name,
                userId: userId || null,
            },
        });
        if (existing) throw new ConflictException('Etiqueta já existe com este nome');

        const tag = await this.prisma.tag.create({
            data: {
                name: dto.name,
                color: dto.color || '#3498db',
                userId: userId || null,
            },
        });
        this.logger.log(`Tag created: ${tag.name} (ID: ${tag.id})`);
        return tag;
    }

    async update(id: number, dto: UpdateTagDto, userId?: number) {
        await this.findOne(id);

        if (dto.name) {
            const existing = await this.prisma.tag.findFirst({
                where: {
                    name: dto.name,
                    userId: userId || null,
                    id: { not: id },
                },
            });
            if (existing) throw new ConflictException('Etiqueta já existe com este nome');
        }

        const tag = await this.prisma.tag.update({
            where: { id },
            data: dto,
        });
        this.logger.log(`Tag updated: ${tag.name} (ID: ${tag.id})`);
        return tag;
    }

    async delete(id: number) {
        await this.findOne(id);
        await this.prisma.tag.delete({ where: { id } });
        this.logger.log(`Tag deleted: ${id}`);
    }

    // ==================== Ticket Relations ====================

    async attachToTicket(tagId: number, ticketId: number) {
        await this.findOne(tagId);

        const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } });
        if (!ticket) throw new NotFoundException('Ticket não encontrado');

        const existing = await this.prisma.tagTicket.findUnique({
            where: { tagId_ticketId: { tagId, ticketId } },
        });
        if (existing) throw new ConflictException('Etiqueta já está vinculada ao ticket');

        const relation = await this.prisma.tagTicket.create({
            data: { tagId, ticketId },
            include: {
                tag: true,
                ticket: { select: { id: true, status: true } }
            }
        });
        this.logger.log(`Tag ${tagId} attached to ticket ${ticketId}`);
        return relation;
    }

    async detachFromTicket(tagId: number, ticketId: number) {
        const existing = await this.prisma.tagTicket.findUnique({
            where: { tagId_ticketId: { tagId, ticketId } },
        });
        if (!existing) throw new NotFoundException('Vinculação não encontrada');

        await this.prisma.tagTicket.delete({
            where: { tagId_ticketId: { tagId, ticketId } },
        });
        this.logger.log(`Tag ${tagId} detached from ticket ${ticketId}`);
    }

    async getTicketTags(ticketId: number) {
        const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } });
        if (!ticket) throw new NotFoundException('Ticket não encontrado');

        return this.prisma.tagTicket.findMany({
            where: { ticketId },
            include: { tag: true },
        });
    }

    // ==================== Contact Relations ====================

    async attachToContact(tagId: number, contactId: number) {
        await this.findOne(tagId);

        const contact = await this.prisma.contact.findUnique({ where: { id: contactId } });
        if (!contact) throw new NotFoundException('Contato não encontrado');

        const existing = await this.prisma.tagContact.findUnique({
            where: { tagId_contactId: { tagId, contactId } },
        });
        if (existing) throw new ConflictException('Etiqueta já está vinculada ao contato');

        const relation = await this.prisma.tagContact.create({
            data: { tagId, contactId },
            include: {
                tag: true,
                contact: { select: { id: true, name: true, number: true } }
            }
        });
        this.logger.log(`Tag ${tagId} attached to contact ${contactId}`);
        return relation;
    }

    async detachFromContact(tagId: number, contactId: number) {
        const existing = await this.prisma.tagContact.findUnique({
            where: { tagId_contactId: { tagId, contactId } },
        });
        if (!existing) throw new NotFoundException('Vinculação não encontrada');

        await this.prisma.tagContact.delete({
            where: { tagId_contactId: { tagId, contactId } },
        });
        this.logger.log(`Tag ${tagId} detached from contact ${contactId}`);
    }

    async getContactTags(contactId: number) {
        const contact = await this.prisma.contact.findUnique({ where: { id: contactId } });
        if (!contact) throw new NotFoundException('Contato não encontrado');

        return this.prisma.tagContact.findMany({
            where: { contactId },
            include: { tag: true },
        });
    }
}
