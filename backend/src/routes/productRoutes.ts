import { Router } from "express";

import isAuth from "../middleware/isAuth";
import * as ProductController from "../controllers/ProductController";

const productRoutes = Router();

productRoutes.get("/products", isAuth, ProductController.index);

productRoutes.post("/products", isAuth, ProductController.store);

productRoutes.get("/products/:productId", isAuth, ProductController.show);

productRoutes.put("/products/:productId", isAuth, ProductController.update);

productRoutes.delete("/products/:productId", isAuth, ProductController.remove);

export default productRoutes;
