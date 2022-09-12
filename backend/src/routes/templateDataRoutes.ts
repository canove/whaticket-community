import express from "express";
import isAuth from "../middleware/isAuth";

import * as TemplateDataController from "../controllers/TemplateDataController";

const templateDataRoutes = express.Router();

templateDataRoutes.get("/TemplatesData/list/", isAuth, TemplateDataController.index);

templateDataRoutes.post("/TemplatesData/create/", isAuth, TemplateDataController.store);

templateDataRoutes.get("/TemplatesData/show/:templatesId", isAuth, TemplateDataController.show);

templateDataRoutes.put("/TemplatesData/edit/:templatesId", isAuth, TemplateDataController.update);

templateDataRoutes.delete("/TemplatesData/delete/:templateId", isAuth, TemplateDataController.remove);

export default templateDataRoutes;