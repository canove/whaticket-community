import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
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
import { TagsService } from './tags.service';
import { CreateTagDto, UpdateTagDto } from './dto';
import { JwtAuthGuard, CurrentUser, Roles, RolesGuard } from '../auth';

@ApiTags('Tags')
@Controller('tags')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TagsController {
    constructor(private readonly tagsService: TagsService) { }

    // ==================== CRUD ====================

    @Get()
    @ApiOperation({ summary: 'Listar etiquetas' })
    @ApiResponse({ status: 200, description: 'Lista de etiquetas' })
    async findAll(@CurrentUser('id') userId: number) {
        return this.tagsService.findAll(userId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar etiqueta por ID' })
    @ApiResponse({ status: 200, description: 'Detalhes da etiqueta' })
    @ApiResponse({ status: 404, description: 'Etiqueta não encontrada' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.tagsService.findOne(id);
    }

    @Post()
    @ApiOperation({ summary: 'Criar etiqueta' })
    @ApiResponse({ status: 201, description: 'Etiqueta criada' })
    @ApiResponse({ status: 409, description: 'Etiqueta já existe' })
    async create(
        @Body() dto: CreateTagDto,
        @CurrentUser('id') userId: number,
    ) {
        return this.tagsService.create(dto, userId);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Atualizar etiqueta' })
    @ApiResponse({ status: 200, description: 'Etiqueta atualizada' })
    @ApiResponse({ status: 404, description: 'Etiqueta não encontrada' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateTagDto,
        @CurrentUser('id') userId: number,
    ) {
        return this.tagsService.update(id, dto, userId);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Excluir etiqueta' })
    @ApiResponse({ status: 204, description: 'Etiqueta excluída' })
    @ApiResponse({ status: 404, description: 'Etiqueta não encontrada' })
    async delete(@Param('id', ParseIntPipe) id: number) {
        await this.tagsService.delete(id);
    }

    // ==================== Ticket Relations ====================

    @Post(':id/tickets/:ticketId')
    @ApiOperation({ summary: 'Vincular etiqueta a um ticket' })
    @ApiResponse({ status: 201, description: 'Etiqueta vinculada ao ticket' })
    @ApiResponse({ status: 404, description: 'Etiqueta ou ticket não encontrado' })
    @ApiResponse({ status: 409, description: 'Etiqueta já vinculada ao ticket' })
    async attachToTicket(
        @Param('id', ParseIntPipe) tagId: number,
        @Param('ticketId', ParseIntPipe) ticketId: number,
    ) {
        return this.tagsService.attachToTicket(tagId, ticketId);
    }

    @Delete(':id/tickets/:ticketId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Desvincular etiqueta de um ticket' })
    @ApiResponse({ status: 204, description: 'Etiqueta desvinculada do ticket' })
    @ApiResponse({ status: 404, description: 'Vinculação não encontrada' })
    async detachFromTicket(
        @Param('id', ParseIntPipe) tagId: number,
        @Param('ticketId', ParseIntPipe) ticketId: number,
    ) {
        await this.tagsService.detachFromTicket(tagId, ticketId);
    }

    @Get('tickets/:ticketId')
    @ApiOperation({ summary: 'Listar etiquetas de um ticket' })
    @ApiResponse({ status: 200, description: 'Lista de etiquetas do ticket' })
    @ApiResponse({ status: 404, description: 'Ticket não encontrado' })
    async getTicketTags(@Param('ticketId', ParseIntPipe) ticketId: number) {
        return this.tagsService.getTicketTags(ticketId);
    }

    // ==================== Contact Relations ====================

    @Post(':id/contacts/:contactId')
    @ApiOperation({ summary: 'Vincular etiqueta a um contato' })
    @ApiResponse({ status: 201, description: 'Etiqueta vinculada ao contato' })
    @ApiResponse({ status: 404, description: 'Etiqueta ou contato não encontrado' })
    @ApiResponse({ status: 409, description: 'Etiqueta já vinculada ao contato' })
    async attachToContact(
        @Param('id', ParseIntPipe) tagId: number,
        @Param('contactId', ParseIntPipe) contactId: number,
    ) {
        return this.tagsService.attachToContact(tagId, contactId);
    }

    @Delete(':id/contacts/:contactId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Desvincular etiqueta de um contato' })
    @ApiResponse({ status: 204, description: 'Etiqueta desvinculada do contato' })
    @ApiResponse({ status: 404, description: 'Vinculação não encontrada' })
    async detachFromContact(
        @Param('id', ParseIntPipe) tagId: number,
        @Param('contactId', ParseIntPipe) contactId: number,
    ) {
        await this.tagsService.detachFromContact(tagId, contactId);
    }

    @Get('contacts/:contactId')
    @ApiOperation({ summary: 'Listar etiquetas de um contato' })
    @ApiResponse({ status: 200, description: 'Lista de etiquetas do contato' })
    @ApiResponse({ status: 404, description: 'Contato não encontrado' })
    async getContactTags(@Param('contactId', ParseIntPipe) contactId: number) {
        return this.tagsService.getContactTags(contactId);
    }
}
