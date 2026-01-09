import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { LoginDto, RegisterDto, AuthResponseDto } from './dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    private readonly logger;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    login(dto: LoginDto, userAgent?: string, ipAddress?: string): Promise<AuthResponseDto>;
    register(dto: RegisterDto): Promise<AuthResponseDto>;
    refreshToken(refreshToken: string): Promise<AuthResponseDto>;
    logout(refreshToken: string): Promise<void>;
    logoutAll(userId: number): Promise<void>;
    validateUser(userId: number, tokenVersion: number): Promise<boolean>;
    private generateTokens;
    private createSession;
    private getRefreshTokenExpiry;
}
