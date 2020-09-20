import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as MessageController from "../controllers/MessageController";

const messageRoutes = Router();

messageRoutes.get("/messages/:ticketId", isAuth, MessageController.index);

messageRoutes.post("/messages/:ticketId", isAuth, MessageController.store);

export default messageRoutes;
