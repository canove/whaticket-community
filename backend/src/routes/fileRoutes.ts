import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as FileController from "../controllers/FileController";
import * as UploadFileController from "../controllers/UploadFileController";
import * as FileRegisterController from "../controllers/FileRegisterController";

const fileRoutes = Router();

fileRoutes.get("/file/list", isAuth, FileController.store);

fileRoutes.post("/file/upload", isAuth, UploadFileController.store);

fileRoutes.get("/file/listRegister", isAuth, FileRegisterController.store);

export default fileRoutes;