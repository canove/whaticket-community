import "reflect-metadata";
import "dotenv/config";
import "express-async-errors";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import multer from "multer";
import * as Sentry from "@sentry/node";

import "./database";
import uploadConfig from "./config/upload";
import AppError from "./errors/AppError";
import routes from "./routes";
import { initIO } from "./libs/socket";
import { initWbot } from "./libs/wbot";

// const wbotMonitor = require("./services/wbotMonitor");
import Whatsapp from "./models/Whatsapp";
import wbotMessageListener from "./services/WbotServices/wbotMessageListener";
import wbotMonitor from "./services/WbotServices/wbotMonitor";

Sentry.init({ dsn: process.env.SENTRY_DSN });

const upload = multer(uploadConfig);
const app = express();

app.use(cors());
app.use(express.json());
app.use(Sentry.Handlers.requestHandler());
app.use(upload.single("media"));
app.use("/public", express.static(uploadConfig.directory));
app.use(routes);

const server = app.listen(process.env.PORT, () => {
  console.log(`Server started on port: ${process.env.PORT}`);
});

const io = initIO(server);
io.on("connection", socket => {
  console.log("Client Connected");
  socket.on("joinChatBox", ticketId => {
    console.log("A client joined a ticket channel");
    socket.join(ticketId);
  });

  socket.on("joinNotification", () => {
    console.log("A client joined notification channel");
    socket.join("notification");
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const startWhatsAppSessions = async () => {
  const whatsapps = await Whatsapp.findAll();
  if (whatsapps.length > 0) {
    whatsapps.forEach(whatsapp => {
      initWbot(whatsapp)
        .then(() => {
          wbotMessageListener(whatsapp);
          wbotMonitor(whatsapp);
        })
        .catch(err => console.log(err));
    });
  }
};
startWhatsAppSessions();

app.use(Sentry.Handlers.errorHandler());

app.use(async (err: Error, req: Request, res: Response, _: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  console.error(err);
  return res.status(500).json({ error: "Internal server error" });
});
