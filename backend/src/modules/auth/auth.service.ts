import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    Logger,
    OnApplicationBootstrap,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../database/prisma.service';
import { LoginDto, RegisterDto, AuthResponseDto } from './dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService implements OnApplicationBootstrap {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async onApplicationBootstrap() {
        await this.createDefaultAdmin();
    }

    private async createDefaultAdmin() {
        const adminEmail = 'admin@whaticket.com';
        const defaultPassword = 'admin123'; // Meets MinLength(6) validation

        const userExists = await this.prisma.user.findUnique({
            where: { email: adminEmail },
        });

        if (!userExists) {
            this.logger.log('Creating default admin user...');
            const passwordHash = await bcrypt.hash(defaultPassword, 10);

            await this.prisma.user.create({
                data: {
                    name: 'Admin',
                    email: adminEmail,
                    passwordHash,
                    profile: 'admin',
                    isActive: true,
                },
            });
            this.logger.log(`Default admin created: ${adminEmail} / ${defaultPassword}`);
        } else {
            // Optional: Reset password if requested, but better to leave existing user alone to avoid overwriting production data
            this.logger.log('Default admin already exists.');
        }
    }

    async login(dto: LoginDto, userAgent?: string, ipAddress?: string): Promise<AuthResponseDto> {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (!user) {
            throw new UnauthorizedException('Credenciais inválidas');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('Usuário desativado');
        }

        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Credenciais inválidas');
        }

        const tokens = await this.generateTokens(user.id, user.email, user.profile);

        // Store refresh token session
        await this.createSession(user.id, tokens.refreshToken, userAgent, ipAddress);

        this.logger.log(`User logged in: ${user.email}`);

        return {
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                profile: user.profile,
            },
        };
    }

    async register(dto: RegisterDto): Promise<AuthResponseDto> {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (existingUser) {
            throw new ConflictException('Email já cadastrado');
        }

        const passwordHash = await bcrypt.hash(dto.password, 10);

        // Check if this is the first user - if so, make them admin
        const userCount = await this.prisma.user.count();
        const profile = userCount === 0 ? 'admin' : 'user';

        const user = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                passwordHash,
                profile,
            },
        });

        const tokens = await this.generateTokens(user.id, user.email, user.profile);
        await this.createSession(user.id, tokens.refreshToken);

        this.logger.log(`User registered: ${user.email}`);

        return {
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                profile: user.profile,
            },
        };
    }

    async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
        const session = await this.prisma.session.findUnique({
            where: { refreshToken },
            include: { user: true },
        });

        if (!session) {
            throw new UnauthorizedException('Refresh token inválido');
        }

        if (session.expiresAt < new Date()) {
            await this.prisma.session.delete({ where: { id: session.id } });
            throw new UnauthorizedException('Refresh token expirado');
        }

        const user = session.user;
        if (!user.isActive) {
            throw new UnauthorizedException('Usuário desativado');
        }

        // Generate new tokens
        const tokens = await this.generateTokens(user.id, user.email, user.profile);

        // Update session with new refresh token
        await this.prisma.session.update({
            where: { id: session.id },
            data: {
                refreshToken: tokens.refreshToken,
                expiresAt: this.getRefreshTokenExpiry(),
            },
        });

        return {
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                profile: user.profile,
            },
        };
    }

    async logout(refreshToken: string): Promise<void> {
        await this.prisma.session.deleteMany({
            where: { refreshToken },
        });
    }

    async logoutAll(userId: number): Promise<void> {
        await this.prisma.session.deleteMany({
            where: { userId },
        });

        // Increment token version to invalidate all existing access tokens
        await this.prisma.user.update({
            where: { id: userId },
            data: { tokenVersion: { increment: 1 } },
        });
    }

    async validateUser(userId: number, tokenVersion: number): Promise<boolean> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { tokenVersion: true, isActive: true },
        });

        if (!user || !user.isActive) {
            return false;
        }

        return user.tokenVersion === tokenVersion;
    }

    private async generateTokens(
        userId: number,
        email: string,
        profile: string,
    ): Promise<{ accessToken: string; refreshToken: string }> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { tokenVersion: true },
        });

        const payload = {
            sub: userId,
            email,
            profile,
            tokenVersion: user?.tokenVersion || 0,
        };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get<string>('jwt.secret'),
                expiresIn: '15m' as const,
            }),
            this.jwtService.signAsync(
                { sub: userId, type: 'refresh' },
                {
                    secret: this.configService.get<string>('jwt.refreshSecret'),
                    expiresIn: '7d' as const,
                },
            ),
        ]);

        return { accessToken, refreshToken };
    }

    private async createSession(
        userId: number,
        refreshToken: string,
        userAgent?: string,
        ipAddress?: string,
    ): Promise<void> {
        await this.prisma.session.create({
            data: {
                id: uuidv4(),
                userId,
                refreshToken,
                userAgent,
                ipAddress,
                expiresAt: this.getRefreshTokenExpiry(),
            },
        });
    }

    private getRefreshTokenExpiry(): Date {
        const expiresIn = this.configService.get<string>('jwt.refreshExpiresIn', '7d');
        const days = parseInt(expiresIn.replace('d', ''), 10) || 7;
        return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    }
}
