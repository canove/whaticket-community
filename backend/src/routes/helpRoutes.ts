import express from "express";
import isAuth from "../middleware/isAuth";

import * as HelpController from "../controllers/HelpController";

const routes = express.Router();

routes.get("/helps/list", isAuth, HelpController.findList);

routes.get("/helps", isAuth, HelpController.index);

routes.get("/helps/:id", isAuth, HelpController.show);

routes.post("/helps", isAuth, HelpController.store);

routes.put("/helps/:id", isAuth, HelpController.update);

routes.delete("/helps/:id", isAuth, HelpController.remove);

export default routes;
