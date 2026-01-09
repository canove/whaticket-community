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
exports.WhatsappController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const whatsapp_service_1 = require("./whatsapp.service");
let WhatsappController = class WhatsappController {
    whatsappService;
    constructor(whatsappService) {
        this.whatsappService = whatsappService;
    }
    async findAll() {
        return this.whatsappService.findAll();
    }
    async findOne(id) {
        return this.whatsappService.findOne(id);
    }
    async create(body) {
        return this.whatsappService.create(body);
    }
    async update(id, body) {
        return this.whatsappService.update(id, body);
    }
    async delete(id) {
        await this.whatsappService.delete(id);
    }
    async startSession(id) {
        return this.whatsappService.initSession(id);
    }
    async logout(id) {
        await this.whatsappService.logout(id);
    }
    async getStatus(id) {
        return this.whatsappService.getSessionStatus(id);
    }
};
exports.WhatsappController = WhatsappController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all WhatsApp connections' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of WhatsApp connections' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a WhatsApp connection by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'WhatsApp connection details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Connection not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new WhatsApp connection' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Connection created' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a WhatsApp connection' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Connection updated' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a WhatsApp connection' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Connection deleted' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/session'),
    (0, swagger_1.ApiOperation)({ summary: 'Start a WhatsApp session' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Session started, QR code returned if needed' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "startSession", null);
__decorate([
    (0, common_1.Delete)(':id/session'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Disconnect a WhatsApp session' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Session disconnected' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get WhatsApp session status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Session status' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "getStatus", null);
exports.WhatsappController = WhatsappController = __decorate([
    (0, swagger_1.ApiTags)('WhatsApp'),
    (0, common_1.Controller)('whatsapp'),
    __metadata("design:paramtypes", [whatsapp_service_1.WhatsappService])
], WhatsappController);
//# sourceMappingURL=whatsapp.controller.js.map