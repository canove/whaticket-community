import { Injectable, Logger, NotFoundException, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BaileysService } from './baileys.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Whatsapp, WhatsappStatus } from '@prisma/client';

@Injectable()
export class WhatsappService implements OnApplicationBootstrap {
    private readonly logger = new Logger(WhatsappService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly baileys: BaileysService,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    async onApplicationBootstrap() {
        await this.startAllSessions();
    }

    async findAll(): Promise<Whatsapp[]> {
        return this.prisma.whatsapp.findMany({
            include: {
                queues: {
                    include: {
                        queue: true,
                    },
                },
            },
            orderBy: { name: 'asc' },
        });
    }

    async findOne(id: number): Promise<Whatsapp> {
        const whatsapp = await this.prisma.whatsapp.findUnique({
            where: { id },
            include: {
                queues: {
                    include: {
                        queue: true,
                    },
                },
            },
        });

        if (!whatsapp) {
            throw new NotFoundException(`WhatsApp connection ${id} not found`);
        }

        return whatsapp;
    }

    async findDefault(): Promise<Whatsapp | null> {
        return this.prisma.whatsapp.findFirst({
            where: { isDefault: true },
        });
    }

    async create(data: {
        name: string;
        greetingMessage?: string;
        farewellMessage?: string;
        isDefault?: boolean;
        queueIds?: number[];
    }): Promise<Whatsapp> {
        // If this will be default, unset others
        if (data.isDefault) {
            await this.prisma.whatsapp.updateMany({
                where: { isDefault: true },
                data: { isDefault: false },
            });
        }

        const whatsapp = await this.prisma.whatsapp.create({
            data: {
                name: data.name,
                greetingMessage: data.greetingMessage,
                farewellMessage: data.farewellMessage,
                isDefault: data.isDefault || false,
                queues: data.queueIds ? {
                    create: data.queueIds.map(queueId => ({ queueId })),
                } : undefined,
            },
            include: {
                queues: {
                    include: {
                        queue: true,
                    },
                },
            },
        });

        this.logger.log(`WhatsApp connection created: ${whatsapp.name}`);
        return whatsapp;
    }

    async update(
        id: number,
        data: {
            name?: string;
            greetingMessage?: string;
            farewellMessage?: string;
            isDefault?: boolean;
            queueIds?: number[];
        },
    ): Promise<Whatsapp> {
        await this.findOne(id);

        // If this will be default, unset others
        if (data.isDefault) {
            await this.prisma.whatsapp.updateMany({
                where: { isDefault: true, id: { not: id } },
                data: { isDefault: false },
            });
        }

        // Update queue associations if provided
        if (data.queueIds) {
            await this.prisma.whatsappQueue.deleteMany({
                where: { whatsappId: id },
            });
            await this.prisma.whatsappQueue.createMany({
                data: data.queueIds.map(queueId => ({ whatsappId: id, queueId })),
            });
        }

        return this.prisma.whatsapp.update({
            where: { id },
            data: {
                name: data.name,
                greetingMessage: data.greetingMessage,
                farewellMessage: data.farewellMessage,
                isDefault: data.isDefault,
            },
            include: {
                queues: {
                    include: {
                        queue: true,
                    },
                },
            },
        });
    }

    async delete(id: number): Promise<void> {
        await this.findOne(id);

        // Disconnect session if active
        await this.logout(id);

        // Usage of transaction to ensure all related data is cleaned up
        await this.prisma.$transaction(async (prisma) => {
            // Delete Tickets associated with this WhatsApp
            // Note: This will cascade delete messages belonging to these tickets due to schema
            await prisma.ticket.deleteMany({
                where: { whatsappId: id },
            });

            // Delete any messages that might be directly linked to this WhatsApp (if any remaining)
            await prisma.message.deleteMany({
                where: { whatsappId: id },
            });

            // Delete the WhatsApp connection itself
            await prisma.whatsapp.delete({
                where: { id },
            });
        });

        this.logger.log(`WhatsApp connection deleted: ${id}`);
    }

    async initSession(id: number): Promise<{ qrCode?: string; status: string }> {
        const whatsapp = await this.findOne(id);

        await this.prisma.whatsapp.update({
            where: { id },
            data: { status: 'OPENING' as WhatsappStatus },
        });

        const session = await this.baileys.initSession(id, whatsapp.name);

        return {
            qrCode: session.qrCode,
            status: session.status,
        };
    }

    async logout(id: number): Promise<void> {
        await this.baileys.logout(id);

        await this.prisma.whatsapp.update({
            where: { id },
            data: {
                status: 'DISCONNECTED' as WhatsappStatus,
                qrcode: null,
                session: null,
            },
        });

        this.eventEmitter.emit('whatsapp.session.update', {
            sessionId: id,
            status: 'DISCONNECTED',
        });
    }

    async updateStatus(id: number, status: WhatsappStatus, qrcode?: string): Promise<void> {
        await this.prisma.whatsapp.update({
            where: { id },
            data: { status, qrcode },
        });

        this.eventEmitter.emit('whatsapp.session.update', {
            sessionId: id,
            status,
            qrcode,
        });
    }

    async startAllSessions(): Promise<void> {
        const whatsapps = await this.prisma.whatsapp.findMany({
            where: { status: { not: 'DISCONNECTED' } },
        });

        this.logger.log(`Starting ${whatsapps.length} WhatsApp sessions...`);

        for (const whatsapp of whatsapps) {
            try {
                await this.initSession(whatsapp.id);
            } catch (error) {
                this.logger.error(`Error starting session ${whatsapp.id}:`, error);
            }
        }
    }

    getSessionStatus(id: number): { connected: boolean; status: string } {
        const session = this.baileys.getSession(id);
        return {
            connected: session?.status === 'connected',
            status: session?.status || 'disconnected',
        };
    }

    async restart(id: number): Promise<void> {
        await this.logout(id);
        setTimeout(async () => {
            await this.initSession(id);
        }, 1000);
    }
}
