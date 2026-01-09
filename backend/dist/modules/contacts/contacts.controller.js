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
exports.ContactsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const contacts_service_1 = require("./contacts.service");
const dto_1 = require("./dto");
const auth_1 = require("../auth");
let ContactsController = class ContactsController {
    contactsService;
    constructor(contactsService) {
        this.contactsService = contactsService;
    }
    async findAll(query) {
        return this.contactsService.findAll(query);
    }
    async findOne(id) {
        return this.contactsService.findOne(id);
    }
    async create(dto) {
        return this.contactsService.create(dto);
    }
    async update(id, dto) {
        return this.contactsService.update(id, dto);
    }
    async delete(id) {
        await this.contactsService.delete(id);
    }
};
exports.ContactsController = ContactsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar contatos' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de contatos' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ContactListQueryDto]),
    __metadata("design:returntype", Promise)
], ContactsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar contato por ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Detalhes do contato' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Contato não encontrado' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ContactsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Criar contato' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Contato criado' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Contato já existe' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateContactDto]),
    __metadata("design:returntype", Promise)
], ContactsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar contato' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Contato atualizado' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Contato não encontrado' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, dto_1.UpdateContactDto]),
    __metadata("design:returntype", Promise)
], ContactsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Excluir contato' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Contato excluído' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Contato não encontrado' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ContactsController.prototype, "delete", null);
exports.ContactsController = ContactsController = __decorate([
    (0, swagger_1.ApiTags)('Contacts'),
    (0, common_1.Controller)('contacts'),
    (0, common_1.UseGuards)(auth_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [contacts_service_1.ContactsService])
], ContactsController);
//# sourceMappingURL=contacts.controller.js.map