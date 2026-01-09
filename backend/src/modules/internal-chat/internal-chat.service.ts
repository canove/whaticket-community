import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateInternalMessageDto } from './dto';

@Injectable()
export class InternalChatService {
    constructor(private readonly prisma: PrismaService) { }

    async getConversation(userId: number, otherUserId: number) {
        // Mark messages as read
        await this.prisma.internalMessage.updateMany({
            where: {
                fromUserId: otherUserId,
                toUserId: userId,
                read: false,
            },
            data: { read: true },
        });

        return this.prisma.internalMessage.findMany({
            where: {
                OR: [
                    { fromUserId: userId, toUserId: otherUserId },
                    { fromUserId: otherUserId, toUserId: userId },
                ],
            },
            orderBy: { createdAt: 'asc' },
        });
    }

    async getUnreadCount(userId: number) {
        const counts = await this.prisma.internalMessage.groupBy({
            by: ['fromUserId'],
            where: {
                toUserId: userId,
                read: false,
            },
            _count: { id: true },
        });

        return counts.reduce((acc: Record<number, number>, item: { fromUserId: number; _count: { id: number } }) => {
            acc[item.fromUserId] = item._count.id;
            return acc;
        }, {} as Record<number, number>);
    }

    async send(fromUserId: number, dto: CreateInternalMessageDto) {
        const toUser = await this.prisma.user.findUnique({
            where: { id: dto.toUserId },
        });

        if (!toUser) {
            throw new NotFoundException('Usuário destinatário não encontrado');
        }

        if (toUser.id === fromUserId) {
            throw new NotFoundException('Não é possível enviar mensagem para si mesmo');
        }

        return this.prisma.internalMessage.create({
            data: {
                body: dto.body,
                fromUserId,
                toUserId: dto.toUserId,
            },
        });
    }

    async markAsRead(userId: number, fromUserId: number) {
        return this.prisma.internalMessage.updateMany({
            where: {
                fromUserId,
                toUserId: userId,
                read: false,
            },
            data: { read: true },
        });
    }
}
