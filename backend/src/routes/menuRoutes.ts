import { Router } from "express";

import isAuth from "../middleware/isAuth";
import * as MenuController from "../controllers/MenuController";

const menuRoutes = Router();

menuRoutes.get("/menus/", isAuth, MenuController.index);

menuRoutes.get("/menus/:menuId", isAuth, MenuController.show);

menuRoutes.get("/menus/company", isAuth, MenuController.showCompany);

menuRoutes.post("/menus/", isAuth, MenuController.store);

menuRoutes.put("/menus/:menuId", isAuth, MenuController.update);

export default menuRoutes;
