import express from "express";
import isAuth from "../middleware/isAuth";

import * as TemplateController from "../controllers/TemplateController";

const templateRoutes = express.Router();

templateRoutes.get(
  "/whatsappTemplate/list/:whatsAppId",
  isAuth,
  TemplateController.index
);

templateRoutes.post(
  "/whatsappTemplate/create/",
  isAuth,
  TemplateController.store
);

templateRoutes.post(
  "/whatsappTemplate/edit/",
  isAuth,
  TemplateController.update
);

templateRoutes.delete(
  "/whatsappTemplate/delete/:whatsAppId/:templateName",
  isAuth,
  TemplateController.remove
);

export default templateRoutes;
