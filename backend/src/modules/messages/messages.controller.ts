import { Controller, Get, Post, Delete, Body, Param, Query, ParseIntPipe, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { SendMessageDto, MessageListQueryDto } from './dto';
import { JwtAuthGuard, CurrentUser } from '../auth';

@ApiTags('Messages')
@Controller('messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) { }

    @Get('ticket/:ticketId')
    @ApiOperation({ summary: 'Listar mensagens do ticket' })
    async findByTicket(
        @Param('ticketId', ParseIntPipe) ticketId: number,
        @Query() query: MessageListQueryDto,
    ) {
        return this.messagesService.findByTicket(ticketId, query);
    }

    @Post()
    @ApiOperation({ summary: 'Enviar mensagem' })
    @ApiResponse({ status: 201, description: 'Mensagem enviada' })
    async send(@Body() dto: SendMessageDto, @CurrentUser('id') userId: number) {
        return this.messagesService.send(dto, userId);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Apagar mensagem' })
    async delete(@Param('id') id: string) {
        await this.messagesService.delete(id);
    }
}
