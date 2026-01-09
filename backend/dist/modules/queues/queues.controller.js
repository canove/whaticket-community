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
exports.QueuesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const queues_service_1 = require("./queues.service");
const dto_1 = require("./dto");
const auth_1 = require("../auth");
let QueuesController = class QueuesController {
    queuesService;
    constructor(queuesService) {
        this.queuesService = queuesService;
    }
    async findAll() { return this.queuesService.findAll(); }
    async findOne(id) { return this.queuesService.findOne(id); }
    async create(dto) { return this.queuesService.create(dto); }
    async update(id, dto) { return this.queuesService.update(id, dto); }
    async delete(id) { await this.queuesService.delete(id); }
};
exports.QueuesController = QueuesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar filas' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], QueuesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar fila por ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], QueuesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, auth_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Criar fila' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateQueueDto]),
    __metadata("design:returntype", Promise)
], QueuesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, auth_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar fila' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, dto_1.UpdateQueueDto]),
    __metadata("design:returntype", Promise)
], QueuesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, auth_1.Roles)('admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Excluir fila' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], QueuesController.prototype, "delete", null);
exports.QueuesController = QueuesController = __decorate([
    (0, swagger_1.ApiTags)('Queues'),
    (0, common_1.Controller)('queues'),
    (0, common_1.UseGuards)(auth_1.JwtAuthGuard, auth_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [queues_service_1.QueuesService])
], QueuesController);
//# sourceMappingURL=queues.controller.js.map