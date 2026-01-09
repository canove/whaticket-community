import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    ParseIntPipe,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../auth/decorators';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto, UpdateScheduleDto } from './dto';

@ApiTags('Schedules')
@Controller('schedules')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SchedulesController {
    constructor(private readonly schedulesService: SchedulesService) { }

    @Get()
    @ApiOperation({ summary: 'Listar agendamentos do usuário' })
    findAll(@CurrentUser('id') userId: number) {
        return this.schedulesService.findAll(userId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar agendamento por ID' })
    findOne(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser('id') userId: number,
    ) {
        return this.schedulesService.findOne(id, userId);
    }

    @Post()
    @ApiOperation({ summary: 'Criar novo agendamento' })
    create(
        @CurrentUser('id') userId: number,
        @Body() dto: CreateScheduleDto,
    ) {
        return this.schedulesService.create(userId, dto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Atualizar agendamento' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser('id') userId: number,
        @Body() dto: UpdateScheduleDto,
    ) {
        return this.schedulesService.update(id, userId, dto);
    }

    @Post(':id/cancel')
    @ApiOperation({ summary: 'Cancelar agendamento' })
    cancel(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser('id') userId: number,
    ) {
        return this.schedulesService.cancel(id, userId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Excluir agendamento' })
    remove(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser('id') userId: number,
    ) {
        return this.schedulesService.remove(id, userId);
    }
}
