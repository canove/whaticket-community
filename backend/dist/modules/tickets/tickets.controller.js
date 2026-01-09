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
exports.TicketsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tickets_service_1 = require("./tickets.service");
const dto_1 = require("./dto");
const auth_1 = require("../auth");
let TicketsController = class TicketsController {
    ticketsService;
    constructor(ticketsService) {
        this.ticketsService = ticketsService;
    }
    async findAll(query, userId) {
        return this.ticketsService.findAll(query, userId);
    }
    async findOne(id) {
        return this.ticketsService.findOne(id);
    }
    async create(dto) {
        return this.ticketsService.create(dto);
    }
    async update(id, dto) {
        return this.ticketsService.update(id, dto);
    }
    async transfer(id, dto) {
        return this.ticketsService.transfer(id, dto);
    }
    async close(id) {
        return this.ticketsService.close(id);
    }
    async reopen(id) {
        return this.ticketsService.reopen(id);
    }
    async markAsRead(id) {
        await this.ticketsService.markAsRead(id);
    }
    async delete(id) {
        await this.ticketsService.delete(id);
    }
};
exports.TicketsController = TicketsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar tickets' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de tickets' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, auth_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.TicketListQueryDto, Number]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar ticket por ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Detalhes do ticket' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Ticket não encontrado' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Criar ticket' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Ticket criado' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateTicketDto]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar ticket' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ticket atualizado' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, dto_1.UpdateTicketDto]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/transfer'),
    (0, swagger_1.ApiOperation)({ summary: 'Transferir ticket' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ticket transferido' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, dto_1.TransferTicketDto]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "transfer", null);
__decorate([
    (0, common_1.Post)(':id/close'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Fechar ticket' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ticket fechado' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "close", null);
__decorate([
    (0, common_1.Post)(':id/reopen'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Reabrir ticket' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ticket reaberto' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "reopen", null);
__decorate([
    (0, common_1.Post)(':id/read'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Marcar ticket como lido' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Marcado como lido' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Excluir ticket' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Ticket excluído' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "delete", null);
exports.TicketsController = TicketsController = __decorate([
    (0, swagger_1.ApiTags)('Tickets'),
    (0, common_1.Controller)('tickets'),
    (0, common_1.UseGuards)(auth_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [tickets_service_1.TicketsService])
], TicketsController);
//# sourceMappingURL=tickets.controller.js.map