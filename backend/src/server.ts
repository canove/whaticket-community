import "reflect-metadata";
import "dotenv/config";
import "express-async-errors";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import multer from "multer";
import Sentry from "@sentry/node";

import uploadConfig from "./config/upload";
import AppError from "./errors/AppError";
import routes from "./routes";
import "./database";

// import path from "path";

// const { initWbot } = require("./libs/wbot");
// const wbotMessageListener = require("./services/wbotMessageListener");
// const wbotMonitor = require("./services/wbotMonitor");
// const Whatsapp = require("./models/Whatsapp");

Sentry.init({ dsn: process.env.SENTRY_DSN });

const upload = multer(uploadConfig);
const app = express();

app.use(cors());
app.use(express.json());
app.use(Sentry.Handlers.requestHandler());
app.use(upload.single("media"));
app.use("/public", express.static(uploadConfig.directory));
app.use(routes);

app.use(async (err: Error, req: Request, res: Response, _: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  console.error(err);
  return res.status(500).json({ error: "Internal server error" });
});

const server = app.listen(process.env.PORT, () => {
  console.log(`Server started on port: ${process.env.PORT}`);
});

// const io = require("./libs/socket").init(server);
// io.on("connection", socket => {
// 	console.log("Client Connected");
// 	socket.on("joinChatBox", ticketId => {
// 		console.log("A client joined a ticket channel");
// 		socket.join(ticketId);
// 	});

// 	socket.on("joinNotification", () => {
// 		console.log("A client joined notification channel");
// 		socket.join("notification");
// 	});

// 	socket.on("disconnect", () => {
// 		console.log("Client disconnected");
// 	});
// });

// const startWhatsAppSessions = async () => {
// 	const whatsapps = await Whatsapp.findAll();

// 	if (whatsapps.length > 0) {
// 		whatsapps.forEach(whatsapp => {
// 			initWbot(whatsapp)
// 				.then(() => {
// 					wbotMessageListener(whatsapp);
// 					wbotMonitor(whatsapp);
// 				})
// 				.catch(err => console.log(err));
// 		});
// 	}
// };
// startWhatsAppSessions();

// app.use(Sentry.Handlers.errorHandler());

// app.use(async (err, req, res, next) => {
// 	if (process.env.NODE_ENV === "DEVELOPMENT") {
// 		const errors = await new Youch(err, req).toJSON();
// 		console.log(err);
// 		return res.status(500).json(errors);
// 	}

// 	return res.status(500).json({ error: "Internal server error" });
// });
