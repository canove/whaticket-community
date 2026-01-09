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
import { ContactsService } from './contacts.service';
import { CreateContactDto, UpdateContactDto, ContactListQueryDto } from './dto';
import { JwtAuthGuard } from '../auth';

@ApiTags('Contacts')
@Controller('contacts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ContactsController {
    constructor(private readonly contactsService: ContactsService) { }

    @Get()
    @ApiOperation({ summary: 'Listar contatos' })
    @ApiResponse({ status: 200, description: 'Lista de contatos' })
    async findAll(@Query() query: ContactListQueryDto) {
        return this.contactsService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar contato por ID' })
    @ApiResponse({ status: 200, description: 'Detalhes do contato' })
    @ApiResponse({ status: 404, description: 'Contato não encontrado' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.contactsService.findOne(id);
    }

    @Post()
    @ApiOperation({ summary: 'Criar contato' })
    @ApiResponse({ status: 201, description: 'Contato criado' })
    @ApiResponse({ status: 409, description: 'Contato já existe' })
    async create(@Body() dto: CreateContactDto) {
        return this.contactsService.create(dto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Atualizar contato' })
    @ApiResponse({ status: 200, description: 'Contato atualizado' })
    @ApiResponse({ status: 404, description: 'Contato não encontrado' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateContactDto,
    ) {
        return this.contactsService.update(id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Excluir contato' })
    @ApiResponse({ status: 204, description: 'Contato excluído' })
    @ApiResponse({ status: 404, description: 'Contato não encontrado' })
    async delete(@Param('id', ParseIntPipe) id: number) {
        await this.contactsService.delete(id);
    }
}
