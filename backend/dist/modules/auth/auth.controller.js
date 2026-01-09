"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const dto_1 = require("./dto");
const decorators_1 = require("./decorators");
const guards_1 = require("./guards");
const decorators_2 = require("./decorators");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async login(dto, req) {
        const userAgent = req.headers['user-agent'];
        const ipAddress = req.ip || req.socket.remoteAddress;
        return this.authService.login(dto, userAgent, ipAddress);
    }
    async register(dto) {
        return this.authService.register(dto);
    }
    async refresh(dto) {
        return this.authService.refreshToken(dto.refreshToken);
    }
    async logout(dto) {
        await this.authService.logout(dto.refreshToken);
    }
    async logoutAll(userId) {
        await this.authService.logoutAll(userId);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    (0, decorators_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Fazer login' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Login realizado com sucesso', type: dto_1.AuthResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Credenciais inválidas' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('register'),
    (0, decorators_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Registrar novo usuário' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Usuário criado com sucesso', type: dto_1.AuthResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Email já cadastrado' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, decorators_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Renovar token de acesso' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token renovado com sucesso', type: dto_1.AuthResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Refresh token inválido' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.RefreshTokenDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Fazer logout (invalida o refresh token atual)' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Logout realizado com sucesso' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.RefreshTokenDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('logout-all'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Fazer logout de todos os dispositivos' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Logout de todos os dispositivos realizado' }),
    __param(0, (0, decorators_2.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logoutAll", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map