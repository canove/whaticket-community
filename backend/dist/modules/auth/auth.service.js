"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcryptjs"));
const prisma_service_1 = require("../../database/prisma.service");
const uuid_1 = require("uuid");
let AuthService = AuthService_1 = class AuthService {
    prisma;
    jwtService;
    configService;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async login(dto, userAgent, ipAddress) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Credenciais inválidas');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Usuário desativado');
        }
        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Credenciais inválidas');
        }
        const tokens = await this.generateTokens(user.id, user.email, user.profile);
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
    async register(dto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email já cadastrado');
        }
        const passwordHash = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                passwordHash,
                profile: 'user',
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
    async refreshToken(refreshToken) {
        const session = await this.prisma.session.findUnique({
            where: { refreshToken },
            include: { user: true },
        });
        if (!session) {
            throw new common_1.UnauthorizedException('Refresh token inválido');
        }
        if (session.expiresAt < new Date()) {
            await this.prisma.session.delete({ where: { id: session.id } });
            throw new common_1.UnauthorizedException('Refresh token expirado');
        }
        const user = session.user;
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Usuário desativado');
        }
        const tokens = await this.generateTokens(user.id, user.email, user.profile);
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
    async logout(refreshToken) {
        await this.prisma.session.deleteMany({
            where: { refreshToken },
        });
    }
    async logoutAll(userId) {
        await this.prisma.session.deleteMany({
            where: { userId },
        });
        await this.prisma.user.update({
            where: { id: userId },
            data: { tokenVersion: { increment: 1 } },
        });
    }
    async validateUser(userId, tokenVersion) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { tokenVersion: true, isActive: true },
        });
        if (!user || !user.isActive) {
            return false;
        }
        return user.tokenVersion === tokenVersion;
    }
    async generateTokens(userId, email, profile) {
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
                secret: this.configService.get('jwt.secret'),
                expiresIn: '15m',
            }),
            this.jwtService.signAsync({ sub: userId, type: 'refresh' }, {
                secret: this.configService.get('jwt.refreshSecret'),
                expiresIn: '7d',
            }),
        ]);
        return { accessToken, refreshToken };
    }
    async createSession(userId, refreshToken, userAgent, ipAddress) {
        await this.prisma.session.create({
            data: {
                id: (0, uuid_1.v4)(),
                userId,
                refreshToken,
                userAgent,
                ipAddress,
                expiresAt: this.getRefreshTokenExpiry(),
            },
        });
    }
    getRefreshTokenExpiry() {
        const expiresIn = this.configService.get('jwt.refreshExpiresIn', '7d');
        const days = parseInt(expiresIn.replace('d', ''), 10) || 7;
        return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map