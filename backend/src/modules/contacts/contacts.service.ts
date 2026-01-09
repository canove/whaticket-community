import {
    Injectable,
    NotFoundException,
    ConflictException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateContactDto, UpdateContactDto, ContactListQueryDto } from './dto';

@Injectable()
export class ContactsService {
    private readonly logger = new Logger(ContactsService.name);

    constructor(private readonly prisma: PrismaService) { }

    async findAll(query: ContactListQueryDto) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { number: { contains: query.search } },
                { email: { contains: query.search, mode: 'insensitive' } },
            ];
        }

        const [contacts, total] = await Promise.all([
            this.prisma.contact.findMany({
                where,
                skip,
                take: limit,
                orderBy: { name: 'asc' },
                include: {
                    customFields: true,
                    _count: {
                        select: { tickets: true },
                    },
                },
            }),
            this.prisma.contact.count({ where }),
        ]);

        return {
            contacts,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findOne(id: number) {
        const contact = await this.prisma.contact.findUnique({
            where: { id },
            include: {
                customFields: true,
                tickets: {
                    orderBy: { updatedAt: 'desc' },
                    take: 10,
                    include: {
                        queue: { select: { id: true, name: true, color: true } },
                    },
                },
            },
        });

        if (!contact) {
            throw new NotFoundException('Contato não encontrado');
        }

        return contact;
    }

    async findByNumber(number: string) {
        return this.prisma.contact.findUnique({
            where: { number },
            include: { customFields: true },
        });
    }

    async create(dto: CreateContactDto) {
        const existingContact = await this.prisma.contact.findUnique({
            where: { number: dto.number },
        });

        if (existingContact) {
            throw new ConflictException('Contato já cadastrado com este número');
        }

        const contact = await this.prisma.contact.create({
            data: {
                name: dto.name,
                number: dto.number,
                email: dto.email,
                profilePicUrl: dto.profilePicUrl,
                isGroup: dto.isGroup || false,
                extraInfo: dto.extraInfo,
            },
            include: { customFields: true },
        });

        this.logger.log(`Contact created: ${contact.number}`);
        return contact;
    }

    async update(id: number, dto: UpdateContactDto) {
        const contact = await this.findOne(id);

        if (dto.number && dto.number !== contact.number) {
            const existingContact = await this.prisma.contact.findUnique({
                where: { number: dto.number },
            });
            if (existingContact) {
                throw new ConflictException('Contato já cadastrado com este número');
            }
        }

        const updatedContact = await this.prisma.contact.update({
            where: { id },
            data: {
                name: dto.name,
                number: dto.number,
                email: dto.email,
                profilePicUrl: dto.profilePicUrl,
                isGroup: dto.isGroup,
                extraInfo: dto.extraInfo,
            },
            include: { customFields: true },
        });

        this.logger.log(`Contact updated: ${updatedContact.number}`);
        return updatedContact;
    }

    async delete(id: number) {
        const contact = await this.findOne(id);
        await this.prisma.contact.delete({ where: { id } });
        this.logger.log(`Contact deleted: ${contact.number}`);
    }

    async updateProfilePic(id: number, profilePicUrl: string) {
        return this.prisma.contact.update({
            where: { id },
            data: { profilePicUrl },
        });
    }

    async createOrUpdate(data: {
        name: string;
        number: string;
        profilePicUrl?: string;
        isGroup?: boolean;
    }) {
        const existingContact = await this.prisma.contact.findUnique({
            where: { number: data.number },
        });

        if (existingContact) {
            return this.prisma.contact.update({
                where: { number: data.number },
                data: {
                    name: data.name,
                    profilePicUrl: data.profilePicUrl,
                },
            });
        }

        return this.prisma.contact.create({
            data: {
                name: data.name,
                number: data.number,
                profilePicUrl: data.profilePicUrl,
                isGroup: data.isGroup || false,
            },
        });
    }
}
