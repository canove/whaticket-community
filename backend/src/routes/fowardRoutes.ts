import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as MessageController from "../controllers/MessageController";

const forwardRoutes = Router();

forwardRoutes.post("/fw", isAuth, MessageController.forward);

export default forwardRoutes;