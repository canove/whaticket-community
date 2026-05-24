import "./bootstrap";
import "reflect-metadata";
import "express-async-errors";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import * as Sentry from "@sentry/node";

import "./database";
import uploadConfig from "./config/upload";
import AppError from "./errors/AppError";
import routes from "./routes";
import { logger } from "./utils/logger";
import InstagramWebhookController from "./controllers/InstagramWebhookController";
import WhatsAppCloudWebhookController from "./controllers/WhatsAppCloudWebhookController";
import { rawBodyMiddleware } from "./middleware/rawBody";

Sentry.init({ dsn: process.env.SENTRY_DSN });

const app = express();

app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL
  })
);
app.use(cookieParser());
app.use(compression());

// Webhook routes must be mounted BEFORE express.json()
// so HMAC signature verification can access the raw request body.
app.get("/instagram/webhook", InstagramWebhookController.verify);
app.post(
  "/instagram/webhook",
  express.raw({ type: "application/json" }),
  rawBodyMiddleware,
  InstagramWebhookController.receive
);

app.get("/whatsapp-cloud/webhook", WhatsAppCloudWebhookController.verify);
app.post(
  "/whatsapp-cloud/webhook",
  express.raw({ type: "application/json" }),
  rawBodyMiddleware,
  WhatsAppCloudWebhookController.receive
);

app.use(express.json());
app.use(
  "/public",
  express.static(uploadConfig.directory, { dotfiles: "allow" })
);

// Health check endpoint for Docker/load balancer probes
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PKG_VERSION: string = require("../package.json").version;
app.get("/health", (_req, res) =>
  res.json({
    status: "ok",
    ts: Date.now(),
    version: PKG_VERSION,
    commit: process.env.GIT_SHA || "local",
    builtAt: process.env.BUILD_DATE || null
  })
);

app.use(routes);

Sentry.setupExpressErrorHandler(app);

app.use(async (err: Error, req: Request, res: Response, _: NextFunction) => {
  if (err instanceof AppError) {
    logger.warn(err);
    return res.status(err.statusCode).json({ error: err.message });
  }

  logger.error(err);
  return res.status(500).json({ error: "Internal server error" });
});

export default app;
