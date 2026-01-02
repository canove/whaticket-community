import gracefulShutdown from "http-graceful-shutdown";
import app from "./app.js";
import { initIO } from "./libs/socket.js";
import { logger } from "./utils/logger.js";
import { StartAllWhatsAppsSessions } from "./services/WbotServices/StartAllWhatsAppsSessions.js";

const server = app.listen(process.env.PORT, () => {
  logger.info(`Server started on port: ${process.env.PORT}`);
});

initIO(server);
StartAllWhatsAppsSessions();
gracefulShutdown(server);
