import express from "express";

import * as CompanyController from "../controllers/CompanyController";

const companyRoutes = express.Router();

companyRoutes.get("/companies", CompanyController.index);

export default companyRoutes;
