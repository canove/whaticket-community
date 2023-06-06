import { Router } from "express";

import isAuth from "../middleware/isAuth";
import * as TaskController from "../controllers/TaskController";

const taskRoutes = Router();

taskRoutes.post("/task", isAuth, TaskController.store);

taskRoutes.get("/task/:taskId", isAuth, TaskController.show);

taskRoutes.put("/task/finalize/:taskId", isAuth, TaskController.finalize);

taskRoutes.put("/task/:taskId", isAuth, TaskController.update);

export default taskRoutes;
