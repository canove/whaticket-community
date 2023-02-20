import express from "express";
import isAuth from "../middleware/isAuth";

import * as TemplateController from "../controllers/TemplateController";

const templateRoutes = express.Router();

templateRoutes.get(
  "/whatsappTemplate/",
  isAuth,
  TemplateController.index
);

templateRoutes.get(
  "/whatsappTemplate/show/:templateId",
  isAuth,
  TemplateController.show
);

templateRoutes.put(
  "/whatsappTemplate/:templateId",
  isAuth,
  TemplateController.update
);

templateRoutes.get(
  "/whatsappTemplate/getWhatsapps",
  isAuth,
  TemplateController.getWhatsapps
);

templateRoutes.get(
  "/whatsappTemplate/list/:whatsAppId",
  isAuth,
  TemplateController.list
);

templateRoutes.post(
  "/whatsappTemplate/bind/",
  isAuth,
  TemplateController.bind
);

templateRoutes.post(
  "/whatsappTemplate/create/",
  isAuth,
  TemplateController.store
);

templateRoutes.post(
  "/whatsappTemplate/createOfficialTemplate/",
  isAuth,
  TemplateController.createOfficialTemplate
);

templateRoutes.delete(
  "/whatsappTemplate/delete/meta",
  isAuth,
  TemplateController.removeMeta
);

templateRoutes.delete(
  "/whatsappTemplate/delete/bits",
  isAuth,
  TemplateController.removeBits
);

export default templateRoutes;
