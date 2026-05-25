import { Router } from "express";
import multer from "multer";
import isAuth from "../middleware/isAuth.js";
import uploadConfig from "../config/upload.js";

import * as MessageController from "../controllers/MessageController.js";

const messageRoutes = Router();

const upload = multer(uploadConfig);

messageRoutes.get(
  "/messages/:ticketId/summary",
  isAuth,
  MessageController.summary
);

messageRoutes.get("/messages/:ticketId", isAuth, MessageController.index);

messageRoutes.post(
  "/messages/:ticketId",
  isAuth,
  upload.array("medias"),
  MessageController.store
);

messageRoutes.delete("/messages/:messageId", isAuth, MessageController.remove);

export default messageRoutes;
