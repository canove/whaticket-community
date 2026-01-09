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
var ContactsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let ContactsService = ContactsService_1 = class ContactsService {
    prisma;
    logger = new common_1.Logger(ContactsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;
        const where = {};
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
    async findOne(id) {
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
            throw new common_1.NotFoundException('Contato não encontrado');
        }
        return contact;
    }
    async findByNumber(number) {
        return this.prisma.contact.findUnique({
            where: { number },
            include: { customFields: true },
        });
    }
    async create(dto) {
        const existingContact = await this.prisma.contact.findUnique({
            where: { number: dto.number },
        });
        if (existingContact) {
            throw new common_1.ConflictException('Contato já cadastrado com este número');
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
    async update(id, dto) {
        const contact = await this.findOne(id);
        if (dto.number && dto.number !== contact.number) {
            const existingContact = await this.prisma.contact.findUnique({
                where: { number: dto.number },
            });
            if (existingContact) {
                throw new common_1.ConflictException('Contato já cadastrado com este número');
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
    async delete(id) {
        const contact = await this.findOne(id);
        await this.prisma.contact.delete({ where: { id } });
        this.logger.log(`Contact deleted: ${contact.number}`);
    }
    async updateProfilePic(id, profilePicUrl) {
        return this.prisma.contact.update({
            where: { id },
            data: { profilePicUrl },
        });
    }
    async createOrUpdate(data) {
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
};
exports.ContactsService = ContactsService;
exports.ContactsService = ContactsService = ContactsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ContactsService);
//# sourceMappingURL=contacts.service.js.map