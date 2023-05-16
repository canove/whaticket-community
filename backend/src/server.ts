import gracefulShutdown from "http-graceful-shutdown";
import app from "./app";
import { initIO } from "./libs/socket";
import { logger } from "./utils/logger";
import { initConsumer } from "./utils/initConsumer";
import { initBotMessageConsumer } from "./utils/initBotMessageConsumer";
import { initMessageResponseConsumer } from "./utils/initMessageResponseConsumer";
import { initMessageStatusConsumer } from "./utils/initMessageStatusConsumer";
// import { StartAllWhatsAppsSessions } from "./services/WbotServices/StartAllWhatsAppsSessions";
const cron = require('node-cron');

const server = app.listen(process.env.PORT, () => {
  logger.info(`Server started on port: ${process.env.PORT}`);
});

initIO(server);

initConsumer();
console.log('\n\nWelcome to SQS CONSUMER');
initBotMessageConsumer();
console.log('\n\nWelcome to SQS BOT MESSAGE CONSUMER');
initMessageResponseConsumer();
console.log('\n\nWelcome to SQS MESSAGE RESPONSE CONSUMER');

for(let i = 0; i < 2; i++) {
  initMessageStatusConsumer(i);
}

// !StartAllWhatsAppsSessions();

gracefulShutdown(server);
