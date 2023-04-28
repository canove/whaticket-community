import { Router } from "express";

import isAuth from "../middleware/isAuth";
import * as MenuController from "../controllers/MenuController";

const menuRoutes = Router();

menuRoutes.get("/menus/", isAuth, MenuController.index);

menuRoutes.get("/menus/check", isAuth, MenuController.check);

menuRoutes.get("/menus/company", isAuth, MenuController.showCompany);

menuRoutes.get("/menus/layout", isAuth, MenuController.layout);

menuRoutes.get("/menus/:menuId", isAuth, MenuController.show);

menuRoutes.post("/menus/", isAuth, MenuController.store);

menuRoutes.put("/menus/:menuId", isAuth, MenuController.update);

menuRoutes.delete("/menus/:menuId", isAuth, MenuController.remove);

export default menuRoutes;
