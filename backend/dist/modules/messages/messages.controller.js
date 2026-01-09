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
exports.MessagesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const messages_service_1 = require("./messages.service");
const dto_1 = require("./dto");
const auth_1 = require("../auth");
let MessagesController = class MessagesController {
    messagesService;
    constructor(messagesService) {
        this.messagesService = messagesService;
    }
    async findByTicket(ticketId, query) {
        return this.messagesService.findByTicket(ticketId, query);
    }
    async send(dto, userId) {
        return this.messagesService.send(dto, userId);
    }
    async delete(id) {
        await this.messagesService.delete(id);
    }
};
exports.MessagesController = MessagesController;
__decorate([
    (0, common_1.Get)('ticket/:ticketId'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar mensagens do ticket' }),
    __param(0, (0, common_1.Param)('ticketId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, dto_1.MessageListQueryDto]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "findByTicket", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Enviar mensagem' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Mensagem enviada' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.SendMessageDto, Number]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "send", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Apagar mensagem' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "delete", null);
exports.MessagesController = MessagesController = __decorate([
    (0, swagger_1.ApiTags)('Messages'),
    (0, common_1.Controller)('messages'),
    (0, common_1.UseGuards)(auth_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [messages_service_1.MessagesService])
], MessagesController);
//# sourceMappingURL=messages.controller.js.map