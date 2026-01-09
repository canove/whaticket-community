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
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserListQueryDto, UserResponseDto } from './dto';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @Roles('admin', 'supervisor')
    @ApiOperation({ summary: 'Listar usuários' })
    @ApiResponse({ status: 200, description: 'Lista de usuários' })
    async findAll(@Query() query: UserListQueryDto) {
        return this.usersService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar usuário por ID' })
    @ApiResponse({ status: 200, description: 'Detalhes do usuário', type: UserResponseDto })
    @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
        return this.usersService.findOne(id);
    }

    @Post()
    @Roles('admin')
    @ApiOperation({ summary: 'Criar usuário' })
    @ApiResponse({ status: 201, description: 'Usuário criado', type: UserResponseDto })
    @ApiResponse({ status: 409, description: 'Email já cadastrado' })
    async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
        return this.usersService.create(dto);
    }

    @Put(':id')
    @Roles('admin')
    @ApiOperation({ summary: 'Atualizar usuário' })
    @ApiResponse({ status: 200, description: 'Usuário atualizado', type: UserResponseDto })
    @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateUserDto,
    ): Promise<UserResponseDto> {
        return this.usersService.update(id, dto);
    }

    @Delete(':id')
    @Roles('admin')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Excluir usuário' })
    @ApiResponse({ status: 204, description: 'Usuário excluído' })
    @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
    async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
        await this.usersService.delete(id);
    }
}
