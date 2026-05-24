import gracefulShutdown from "http-graceful-shutdown";
import app from "./app";
import { initIO } from "./libs/socket";
import { logger } from "./utils/logger";
import { initRedis } from "./libs/redisStore";
import { StartAllWhatsAppsSessions } from "./services/WbotServices/StartAllWhatsAppsSessions";
import { startAutoCloseJob } from "./jobs/AutoCloseTicketsJob";
import { refreshInstagramTokens } from "./providers/WhatsApp/Implementations/instagram";
import { TOKEN_REFRESH_INTERVAL_MS } from "./helpers/instagram";
import { startMessageWorker } from "./workers/messageWorker";
import { startOutboundWorker } from "./workers/outboundWorker";
import { closeQueues } from "./libs/queue";

const server = app.listen(process.env.PORT, () => {
  logger.info(`Server started on port: ${process.env.PORT}`);
});

const bootstrap = async () => {
  // Initialize Socket.io (with Redis adapter when available)
  await initIO(server);

  // Initialize Redis, then start the message worker
  await initRedis();
  if (process.env.REDIS_URL) {
    startMessageWorker();
    startOutboundWorker();
  }

  StartAllWhatsAppsSessions();
  startAutoCloseJob();

  // Refresh Instagram long-lived tokens daily (they expire after 60 days)
  refreshInstagramTokens().catch(() => {});
  setInterval(
    () => refreshInstagramTokens().catch(() => {}),
    TOKEN_REFRESH_INTERVAL_MS
  );
};

bootstrap().catch(err => {
  logger.error({ info: "Fatal error during bootstrap", err });
  process.exit(1);
});

gracefulShutdown(server, {
  finally: async () => {
    await closeQueues();
  }
});

process.on("uncaughtException", err => {
  logger.error({ info: "Global uncaught exception", err });
});

process.on("unhandledRejection", err => {
  if (err) logger.error({ info: "Global unhandled rejection", err });
});
