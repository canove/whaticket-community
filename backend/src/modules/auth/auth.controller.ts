import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    Req,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto, AuthResponseDto } from './dto';
import { Public } from './decorators';
import { JwtAuthGuard } from './guards';
import { CurrentUser } from './decorators';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Fazer login' })
    @ApiResponse({ status: 200, description: 'Login realizado com sucesso', type: AuthResponseDto })
    @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
    async login(@Body() dto: LoginDto, @Req() req: Request): Promise<AuthResponseDto> {
        const userAgent = req.headers['user-agent'];
        const ipAddress = req.ip || req.socket.remoteAddress;
        return this.authService.login(dto, userAgent, ipAddress);
    }

    @Post('register')
    @Public()
    @ApiOperation({ summary: 'Registrar novo usuário' })
    @ApiResponse({ status: 201, description: 'Usuário criado com sucesso', type: AuthResponseDto })
    @ApiResponse({ status: 409, description: 'Email já cadastrado' })
    async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
        return this.authService.register(dto);
    }

    @Post('refresh')
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Renovar token de acesso' })
    @ApiResponse({ status: 200, description: 'Token renovado com sucesso', type: AuthResponseDto })
    @ApiResponse({ status: 401, description: 'Refresh token inválido' })
    async refresh(@Body() dto: RefreshTokenDto): Promise<AuthResponseDto> {
        return this.authService.refreshToken(dto.refreshToken);
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Fazer logout (invalida o refresh token atual)' })
    @ApiResponse({ status: 204, description: 'Logout realizado com sucesso' })
    async logout(@Body() dto: RefreshTokenDto): Promise<void> {
        await this.authService.logout(dto.refreshToken);
    }

    @Post('logout-all')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Fazer logout de todos os dispositivos' })
    @ApiResponse({ status: 204, description: 'Logout de todos os dispositivos realizado' })
    async logoutAll(@CurrentUser('id') userId: number): Promise<void> {
        await this.authService.logoutAll(userId);
    }
}
