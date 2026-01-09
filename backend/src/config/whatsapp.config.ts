import { registerAs } from '@nestjs/config';

export default registerAs('whatsapp', () => ({
    sessionsPath: process.env.WHATSAPP_SESSIONS_PATH || './sessions',
    reconnectInterval: parseInt(process.env.WHATSAPP_RECONNECT_INTERVAL || '5000', 10),
}));
