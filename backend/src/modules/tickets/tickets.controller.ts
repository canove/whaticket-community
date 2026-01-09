import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { CreateTicketDto, UpdateTicketDto, TicketListQueryDto, TransferTicketDto } from './dto';
import { JwtAuthGuard, CurrentUser } from '../auth';

@ApiTags('Tickets')
@Controller('tickets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TicketsController {
    constructor(private readonly ticketsService: TicketsService) { }

    @Get()
    @ApiOperation({ summary: 'Listar tickets' })
    @ApiResponse({ status: 200, description: 'Lista de tickets' })
    async findAll(
        @Query() query: TicketListQueryDto,
        @CurrentUser('id') userId: number,
    ) {
        return this.ticketsService.findAll(query, userId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar ticket por ID' })
    @ApiResponse({ status: 200, description: 'Detalhes do ticket' })
    @ApiResponse({ status: 404, description: 'Ticket não encontrado' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.ticketsService.findOne(id);
    }

    @Post()
    @ApiOperation({ summary: 'Criar ticket' })
    @ApiResponse({ status: 201, description: 'Ticket criado' })
    async create(@Body() dto: CreateTicketDto) {
        return this.ticketsService.create(dto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Atualizar ticket' })
    @ApiResponse({ status: 200, description: 'Ticket atualizado' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateTicketDto,
    ) {
        return this.ticketsService.update(id, dto);
    }

    @Post(':id/transfer')
    @ApiOperation({ summary: 'Transferir ticket' })
    @ApiResponse({ status: 200, description: 'Ticket transferido' })
    async transfer(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: TransferTicketDto,
    ) {
        return this.ticketsService.transfer(id, dto);
    }

    @Post(':id/close')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Fechar ticket' })
    @ApiResponse({ status: 200, description: 'Ticket fechado' })
    async close(@Param('id', ParseIntPipe) id: number) {
        return this.ticketsService.close(id);
    }

    @Post(':id/reopen')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Reabrir ticket' })
    @ApiResponse({ status: 200, description: 'Ticket reaberto' })
    async reopen(@Param('id', ParseIntPipe) id: number) {
        return this.ticketsService.reopen(id);
    }

    @Post(':id/read')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Marcar ticket como lido' })
    @ApiResponse({ status: 204, description: 'Marcado como lido' })
    async markAsRead(@Param('id', ParseIntPipe) id: number) {
        await this.ticketsService.markAsRead(id);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Excluir ticket' })
    @ApiResponse({ status: 204, description: 'Ticket excluído' })
    async delete(@Param('id', ParseIntPipe) id: number) {
        await this.ticketsService.delete(id);
    }
}
