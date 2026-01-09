"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('whatsapp', () => ({
    sessionsPath: process.env.WHATSAPP_SESSIONS_PATH || './sessions',
    reconnectInterval: parseInt(process.env.WHATSAPP_RECONNECT_INTERVAL || '5000', 10),
}));
//# sourceMappingURL=whatsapp.config.js.map