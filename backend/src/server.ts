import "reflect-metadata";
import "dotenv/config";
import "express-async-errors";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import * as Sentry from "@sentry/node";

import uploadConfig from "./config/upload";
import "./database";
import AppError from "./errors/AppError";
import routes from "./routes";
import { initIO } from "./libs/socket";
import { StartWhatsAppSessions } from "./services/WbotServices/StartWhatsAppSessions";

Sentry.init({ dsn: process.env.SENTRY_DSN });

const app = express();

app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(Sentry.Handlers.requestHandler());
app.use("/public", express.static(uploadConfig.directory));
app.use(routes);

const server = app.listen(process.env.PORT, () => {
  console.log(`Server started on port: ${process.env.PORT}`);
});

initIO(server);
StartWhatsAppSessions();

app.use(Sentry.Handlers.errorHandler());

app.use(async (err: Error, req: Request, res: Response, _: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  console.error(err);
  return res.status(500).json({ error: "Internal server error" });
});
