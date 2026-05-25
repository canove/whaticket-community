import "./bootstrap.js";
import "reflect-metadata";
import "express-async-errors";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import * as Sentry from "@sentry/node";

import "./database/index.js";
import uploadConfig from "./config/upload.js";
import AppError from "./errors/AppError.js";
import routes from "./routes/index.js";
import { logger } from "./utils/logger.js";
import InstagramWebhookController from "./controllers/InstagramWebhookController.js";
import WhatsAppCloudWebhookController from "./controllers/WhatsAppCloudWebhookController.js";
import { rawBodyMiddleware } from "./middleware/rawBody.js";

Sentry.init({ dsn: process.env.SENTRY_DSN });

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_VERSION: string = JSON.parse(
  readFileSync(join(__dirname, "..", "package.json"), "utf8")
).version;

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
