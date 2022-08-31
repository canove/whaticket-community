import { Router } from "express";

import isAuth from "../middleware/isAuth";
import * as CompanyController from "../controllers/CompanyController";

const companyRoutes = Router();

companyRoutes.get("/company", isAuth, CompanyController.index);

companyRoutes.post("/companies", isAuth, CompanyController.store);

companyRoutes.put("/companies/:companyId", isAuth, CompanyController.update);

companyRoutes.get("/companies/:companyId", isAuth, CompanyController.show);

companyRoutes.delete("/companies/:companyId", isAuth, CompanyController.remove);

companyRoutes.get("/company/noAuth", CompanyController.indexNoAuth);

export default companyRoutes;