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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthResponseDto = exports.RefreshTokenDto = exports.RegisterDto = exports.LoginDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class LoginDto {
    email;
    password;
}
exports.LoginDto = LoginDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'admin@whaticket.com' }),
    (0, class_validator_1.IsEmail)({}, { message: 'Email inválido' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Email é obrigatório' }),
    __metadata("design:type", String)
], LoginDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'password123' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Senha é obrigatória' }),
    (0, class_validator_1.MinLength)(6, { message: 'Senha deve ter no mínimo 6 caracteres' }),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);
class RegisterDto {
    name;
    email;
    password;
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Admin User' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Nome é obrigatório' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'admin@whaticket.com' }),
    (0, class_validator_1.IsEmail)({}, { message: 'Email inválido' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Email é obrigatório' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'password123' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Senha é obrigatória' }),
    (0, class_validator_1.MinLength)(6, { message: 'Senha deve ter no mínimo 6 caracteres' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
class RefreshTokenDto {
    refreshToken;
}
exports.RefreshTokenDto = RefreshTokenDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Refresh token é obrigatório' }),
    __metadata("design:type", String)
], RefreshTokenDto.prototype, "refreshToken", void 0);
class AuthResponseDto {
    token;
    refreshToken;
    user;
}
exports.AuthResponseDto = AuthResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AuthResponseDto.prototype, "token", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AuthResponseDto.prototype, "refreshToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], AuthResponseDto.prototype, "user", void 0);
//# sourceMappingURL=auth.dto.js.map