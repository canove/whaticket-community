import gracefulShutdown from "http-graceful-shutdown";
import app from "./app";
import { initIO } from "./libs/socket";
import { logger } from "./utils/logger";
import { initConsumer } from "./utils/initConsumer";
import { initBotMessageConsumer } from "./utils/initBotMessageConsumer";
import { initMessageResponseConsumer } from "./utils/initMessageResponseConsumer";
// import { StartAllWhatsAppsSessions } from "./services/WbotServices/StartAllWhatsAppsSessions";

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
// StartAllWhatsAppsSessions();

gracefulShutdown(server);
