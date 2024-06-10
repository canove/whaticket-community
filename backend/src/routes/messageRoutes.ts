import { Router } from "express";
import multer from "multer";
import uploadConfig from "../config/upload";
import isAuth from "../middleware/isAuth";

import * as MessageController from "../controllers/MessageController";

const messageRoutes = Router();

const upload = multer(uploadConfig);

messageRoutes.get("/messages/:ticketId", isAuth, MessageController.index);

messageRoutes.post(
  "/messages/:ticketId",
  isAuth,
  upload.array("medias"),
  MessageController.store
);

messageRoutes.post(
  "/privateMessages/:ticketId",
  isAuth,
  MessageController.storePrivate
);

messageRoutes.delete("/messages/:messageId", isAuth, MessageController.remove);

export default messageRoutes;
