"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
const bullmq_1 = require("@nestjs/bullmq");
const baileys_service_1 = require("./baileys.service");
const whatsapp_controller_1 = require("./whatsapp.controller");
const whatsapp_service_1 = require("./whatsapp.service");
const message_handler_1 = require("./handlers/message.handler");
let WhatsappModule = class WhatsappModule {
};
exports.WhatsappModule = WhatsappModule;
exports.WhatsappModule = WhatsappModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            event_emitter_1.EventEmitterModule.forRoot({
                wildcard: true,
                delimiter: '.',
                maxListeners: 20,
                verboseMemoryLeak: true,
            }),
            bullmq_1.BullModule.registerQueue({
                name: 'ai_processing',
            }),
        ],
        controllers: [whatsapp_controller_1.WhatsappController],
        providers: [baileys_service_1.BaileysService, whatsapp_service_1.WhatsappService, message_handler_1.MessageHandler],
        exports: [baileys_service_1.BaileysService, whatsapp_service_1.WhatsappService],
    })
], WhatsappModule);
//# sourceMappingURL=whatsapp.module.js.map