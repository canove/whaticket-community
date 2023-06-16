import { Router } from "express";
import multer from "multer";
import isAuth from "../middleware/isAuth";
import uploadConfig from "../config/upload";

import * as MessageController from "../controllers/MessageController";

const messageRoutes = Router();

const upload = multer(uploadConfig);

messageRoutes.get("/messages/:ticketId", isAuth, MessageController.index);

messageRoutes.post("/messages/resend", isAuth, MessageController.resend);

messageRoutes.post(
  "/messages/:ticketId",
  isAuth,
  upload.array("medias"),
  MessageController.store
);

messageRoutes.delete("/messages/:messageId", isAuth, MessageController.remove);

messageRoutes.get("/error/messages", isAuth, MessageController.errorMessages);

messageRoutes.post("/error/messages/resend", isAuth, MessageController.errorMessagesResend)

export default messageRoutes;
