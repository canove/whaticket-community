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
exports.UpdateWebhookDto = exports.CreateWebhookDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateWebhookDto {
    name;
    url;
    enabled;
    events;
    token;
}
exports.CreateWebhookDto = CreateWebhookDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'My Webhook' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateWebhookDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://mysystem.com/webhook' }),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateWebhookDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateWebhookDto.prototype, "enabled", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['ticket.created', 'message.received'] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateWebhookDto.prototype, "events", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWebhookDto.prototype, "token", void 0);
class UpdateWebhookDto extends (0, swagger_1.PartialType)(CreateWebhookDto) {
}
exports.UpdateWebhookDto = UpdateWebhookDto;
//# sourceMappingURL=webhook.dto.js.map