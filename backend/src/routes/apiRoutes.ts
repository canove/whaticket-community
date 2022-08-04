import express from "express";
import multer from "multer";
import uploadConfig from "../config/upload";

import * as ApiController from "../controllers/ApiController";
import * as WhatsAppController from "../controllers/WhatsAppController";
import isAuthApi from "../middleware/isAuthApi";

const upload = multer(uploadConfig);

const ApiRoutes = express.Router();

ApiRoutes.post(
  "/whatsapp/newMessage",
  isAuthApi,
  WhatsAppController.newMessage
);

ApiRoutes.post("/send", isAuthApi, upload.array("medias"), ApiController.index);

export default ApiRoutes;
