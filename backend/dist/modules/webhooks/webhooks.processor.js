"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var WebhooksProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
let WebhooksProcessor = WebhooksProcessor_1 = class WebhooksProcessor extends bullmq_1.WorkerHost {
    logger = new common_1.Logger(WebhooksProcessor_1.name);
    async process(job) {
        const { webhook, event, payload } = job.data;
        this.logger.log(`Processing webhook ${webhook.name} for event ${event}`);
        try {
            const headers = {
                'Content-Type': 'application/json',
                'X-Event': event,
            };
            if (webhook.token) {
                headers['Authorization'] = `Bearer ${webhook.token}`;
            }
            const response = await axios_1.default.post(webhook.url, {
                event,
                timestamp: new Date().toISOString(),
                payload,
            }, {
                headers,
                timeout: 5000,
            });
            this.logger.log(`Webhook ${webhook.name} sent successfully. Status: ${response.status}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to send webhook ${webhook.name}: ${error.message}`);
            throw error;
        }
    }
};
exports.WebhooksProcessor = WebhooksProcessor;
exports.WebhooksProcessor = WebhooksProcessor = WebhooksProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('webhooks')
], WebhooksProcessor);
//# sourceMappingURL=webhooks.processor.js.map