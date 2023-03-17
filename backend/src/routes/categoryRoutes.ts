import { Router } from "express";

import isAuth from "../middleware/isAuth";
import * as CategoryController from "../controllers/CategoryController";

const categoryRoutes = Router();

categoryRoutes.get("/category", isAuth, CategoryController.index);

categoryRoutes.get("/category/count", isAuth, CategoryController.count);

categoryRoutes.get("/category/exportPDF", isAuth, CategoryController.exportPDF);

categoryRoutes.get("/category/exportCSV", isAuth, CategoryController.exportCSV);

categoryRoutes.post("/category", isAuth, CategoryController.store);

categoryRoutes.get("/category/:categoryId", isAuth, CategoryController.show);

categoryRoutes.put("/category/:categoryId", isAuth, CategoryController.update);

categoryRoutes.delete(
  "/category/:categoryId",
  isAuth,
  CategoryController.remove
);

export default categoryRoutes;
