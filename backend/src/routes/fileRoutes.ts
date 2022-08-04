import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as FileController from "../controllers/FileController";
import * as UploadFileController from "../controllers/UploadFileController";

const fileRoutes = Router();

fileRoutes.get("/file/list", isAuth, FileController.store);

fileRoutes.post("/file/upload", isAuth, UploadFileController.store);




export default fileRoutes;