import express from "express";
import * as TagController from "../controllers/TagController";
import isAuth from "../middleware/isAuth";
import tenantContext from "../middleware/tenantContext";

const tagRoutes = express.Router();

tagRoutes.get("/tags", isAuth, tenantContext, TagController.index);
tagRoutes.post("/tags", isAuth, tenantContext, TagController.store);
tagRoutes.put("/tags/:tagId", isAuth, tenantContext, TagController.update);
tagRoutes.delete("/tags/:tagId", isAuth, tenantContext, TagController.remove);

export default tagRoutes;