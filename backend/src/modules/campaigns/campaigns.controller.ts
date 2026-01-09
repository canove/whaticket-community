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
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles, CurrentUser } from '../auth/decorators';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto, UpdateCampaignDto } from './dto';

@ApiTags('Campaigns')
@Controller('campaigns')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth()
export class CampaignsController {
    constructor(private readonly campaignsService: CampaignsService) { }

    @Get()
    @ApiOperation({ summary: 'Listar campanhas' })
    findAll(@CurrentUser('id') userId: number) {
        return this.campaignsService.findAll(userId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar campanha por ID' })
    findOne(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser('id') userId: number,
    ) {
        return this.campaignsService.findOne(id, userId);
    }

    @Post()
    @ApiOperation({ summary: 'Criar nova campanha' })
    create(
        @CurrentUser('id') userId: number,
        @Body() dto: CreateCampaignDto,
    ) {
        return this.campaignsService.create(userId, dto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Atualizar campanha' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser('id') userId: number,
        @Body() dto: UpdateCampaignDto,
    ) {
        return this.campaignsService.update(id, userId, dto);
    }

    @Post(':id/contacts')
    @ApiOperation({ summary: 'Adicionar contatos à campanha' })
    addContacts(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser('id') userId: number,
        @Body() body: { contactIds: number[] },
    ) {
        return this.campaignsService.addContacts(id, userId, body.contactIds);
    }

    @Post(':id/start')
    @ApiOperation({ summary: 'Iniciar campanha' })
    start(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser('id') userId: number,
    ) {
        return this.campaignsService.start(id, userId);
    }

    @Post(':id/cancel')
    @ApiOperation({ summary: 'Cancelar campanha' })
    cancel(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser('id') userId: number,
    ) {
        return this.campaignsService.cancel(id, userId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Excluir campanha' })
    remove(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser('id') userId: number,
    ) {
        return this.campaignsService.remove(id, userId);
    }
}
