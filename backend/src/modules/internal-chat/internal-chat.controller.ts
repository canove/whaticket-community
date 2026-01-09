import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    ParseIntPipe,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../auth/decorators';
import { InternalChatService } from './internal-chat.service';
import { CreateInternalMessageDto } from './dto';

@ApiTags('Internal Chat')
@Controller('internal-chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InternalChatController {
    constructor(private readonly internalChatService: InternalChatService) { }

    @Get('unread')
    @ApiOperation({ summary: 'Obter contagem de mensagens não lidas por usuário' })
    getUnreadCount(@CurrentUser('id') userId: number) {
        return this.internalChatService.getUnreadCount(userId);
    }

    @Get(':userId')
    @ApiOperation({ summary: 'Obter conversa com outro usuário' })
    getConversation(
        @Param('userId', ParseIntPipe) otherUserId: number,
        @CurrentUser('id') userId: number,
    ) {
        return this.internalChatService.getConversation(userId, otherUserId);
    }

    @Post()
    @ApiOperation({ summary: 'Enviar mensagem interna' })
    send(
        @CurrentUser('id') fromUserId: number,
        @Body() dto: CreateInternalMessageDto,
    ) {
        return this.internalChatService.send(fromUserId, dto);
    }

    @Post(':userId/read')
    @ApiOperation({ summary: 'Marcar mensagens como lidas' })
    markAsRead(
        @Param('userId', ParseIntPipe) fromUserId: number,
        @CurrentUser('id') userId: number,
    ) {
        return this.internalChatService.markAsRead(userId, fromUserId);
    }
}
