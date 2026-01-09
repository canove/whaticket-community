"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const event_emitter_1 = require("@nestjs/event-emitter");
const bullmq_1 = require("@nestjs/bullmq");
const config_2 = require("./config");
const database_1 = require("./database");
const auth_1 = require("./modules/auth");
const users_1 = require("./modules/users");
const whatsapp_module_1 = require("./modules/whatsapp/whatsapp.module");
const contacts_1 = require("./modules/contacts");
const queues_1 = require("./modules/queues");
const tickets_1 = require("./modules/tickets");
const messages_1 = require("./modules/messages");
const health_1 = require("./modules/health");
const gateways_1 = require("./gateways");
const webhooks_module_1 = require("./modules/webhooks/webhooks.module");
const ai_module_1 = require("./modules/ai/ai.module");
const prompts_module_1 = require("./modules/prompts/prompts.module");
const tags_1 = require("./modules/tags");
const schedules_1 = require("./modules/schedules");
const internal_chat_1 = require("./modules/internal-chat");
const campaigns_1 = require("./modules/campaigns");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [config_2.appConfig, config_2.databaseConfig, config_2.jwtConfig, config_2.redisConfig, config_2.whatsappConfig],
                envFilePath: ['.env', '.env.example'],
            }),
            event_emitter_1.EventEmitterModule.forRoot({
                wildcard: true,
                delimiter: '.',
                maxListeners: 20,
                verboseMemoryLeak: true,
            }),
            throttler_1.ThrottlerModule.forRoot([{
                    ttl: 60000,
                    limit: 100,
                }]),
            bullmq_1.BullModule.forRoot({
                connection: {
                    host: process.env.REDIS_HOST || 'localhost',
                    port: parseInt(process.env.REDIS_PORT || '6379', 10),
                    password: process.env.REDIS_PASSWORD || undefined,
                },
            }),
            database_1.DatabaseModule,
            health_1.HealthModule,
            auth_1.AuthModule,
            users_1.UsersModule,
            whatsapp_module_1.WhatsappModule,
            contacts_1.ContactsModule,
            queues_1.QueuesModule,
            tickets_1.TicketsModule,
            messages_1.MessagesModule,
            gateways_1.GatewaysModule,
            webhooks_module_1.WebhooksModule,
            ai_module_1.AIModule,
            prompts_module_1.PromptsModule,
            tags_1.TagsModule,
            schedules_1.SchedulesModule,
            internal_chat_1.InternalChatModule,
            campaigns_1.CampaignsModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map