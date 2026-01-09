import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { QueuesService } from './queues.service';
import { CreateQueueDto, UpdateQueueDto } from './dto';
import { JwtAuthGuard, Roles, RolesGuard } from '../auth';

@ApiTags('Queues')
@Controller('queues')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class QueuesController {
    constructor(private readonly queuesService: QueuesService) { }

    @Get()
    @ApiOperation({ summary: 'Listar filas' })
    async findAll() { return this.queuesService.findAll(); }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar fila por ID' })
    async findOne(@Param('id', ParseIntPipe) id: number) { return this.queuesService.findOne(id); }

    @Post()
    @Roles('admin')
    @ApiOperation({ summary: 'Criar fila' })
    async create(@Body() dto: CreateQueueDto) { return this.queuesService.create(dto); }

    @Put(':id')
    @Roles('admin')
    @ApiOperation({ summary: 'Atualizar fila' })
    async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateQueueDto) { return this.queuesService.update(id, dto); }

    @Delete(':id')
    @Roles('admin')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Excluir fila' })
    async delete(@Param('id', ParseIntPipe) id: number) { await this.queuesService.delete(id); }
}
