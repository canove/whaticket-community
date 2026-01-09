import {
    Injectable,
    NotFoundException,
    ConflictException,
    Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto, UpdateUserDto, UserListQueryDto, UserResponseDto } from './dto';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(private readonly prisma: PrismaService) { }

    async findAll(query: UserListQueryDto): Promise<{
        users: UserResponseDto[];
        total: number;
        page: number;
        totalPages: number;
    }> {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { email: { contains: query.search, mode: 'insensitive' } },
            ];
        }

        if (query.profile) {
            where.profile = query.profile;
        }

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { name: 'asc' },
                include: {
                    queues: {
                        include: {
                            queue: {
                                select: { id: true, name: true },
                            },
                        },
                    },
                },
            }),
            this.prisma.user.count({ where }),
        ]);

        return {
            users: users.map(this.formatUser),
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findOne(id: number): Promise<UserResponseDto> {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                queues: {
                    include: {
                        queue: {
                            select: { id: true, name: true },
                        },
                    },
                },
            },
        });

        if (!user) {
            throw new NotFoundException('Usuário não encontrado');
        }

        return this.formatUser(user);
    }

    async create(dto: CreateUserDto): Promise<UserResponseDto> {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (existingUser) {
            throw new ConflictException('Email já cadastrado');
        }

        const passwordHash = await bcrypt.hash(dto.password, 10);

        const user = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                passwordHash,
                profile: (dto.profile as any) || 'user',
                queues: dto.queueIds?.length ? {
                    create: dto.queueIds.map(queueId => ({ queueId })),
                } : undefined,
            },
            include: {
                queues: {
                    include: {
                        queue: {
                            select: { id: true, name: true },
                        },
                    },
                },
            },
        });

        this.logger.log(`User created: ${user.email}`);
        return this.formatUser(user);
    }

    async update(id: number, dto: UpdateUserDto): Promise<UserResponseDto> {
        const existingUser = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!existingUser) {
            throw new NotFoundException('Usuário não encontrado');
        }

        if (dto.email && dto.email !== existingUser.email) {
            const emailExists = await this.prisma.user.findUnique({
                where: { email: dto.email },
            });
            if (emailExists) {
                throw new ConflictException('Email já cadastrado');
            }
        }

        const updateData: any = {
            name: dto.name,
            email: dto.email,
            profile: dto.profile,
            isActive: dto.isActive,
        };

        if (dto.password) {
            updateData.passwordHash = await bcrypt.hash(dto.password, 10);
        }

        // Update queue associations
        if (dto.queueIds !== undefined) {
            await this.prisma.userQueue.deleteMany({ where: { userId: id } });
            if (dto.queueIds.length > 0) {
                await this.prisma.userQueue.createMany({
                    data: dto.queueIds.map(queueId => ({ userId: id, queueId })),
                });
            }
        }

        const user = await this.prisma.user.update({
            where: { id },
            data: updateData,
            include: {
                queues: {
                    include: {
                        queue: {
                            select: { id: true, name: true },
                        },
                    },
                },
            },
        });

        this.logger.log(`User updated: ${user.email}`);
        return this.formatUser(user);
    }

    async delete(id: number): Promise<void> {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException('Usuário não encontrado');
        }

        await this.prisma.user.delete({ where: { id } });
        this.logger.log(`User deleted: ${user.email}`);
    }

    private formatUser(user: any): UserResponseDto {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            profile: user.profile,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            queues: user.queues?.map((uq: any) => ({
                id: uq.queue.id,
                name: uq.queue.name,
            })),
        };
    }
}
