import express from "express";
import multer from "multer";
import uploadConfig from "../config/upload.js";

import * as ApiController from "../controllers/ApiController.js";
import isAuthApi from "../middleware/isAuthApi.js";

const upload = multer(uploadConfig);

const ApiRoutes = express.Router();

ApiRoutes.post("/send", isAuthApi, upload.array("medias"), ApiController.index);

export default ApiRoutes;
