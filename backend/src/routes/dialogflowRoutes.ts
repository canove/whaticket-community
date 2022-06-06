import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as DialogflowController from "../controllers/DialogflowController";

const dialogflowRoutes = Router();

dialogflowRoutes.get("/dialogflow", isAuth, DialogflowController.index);

dialogflowRoutes.post("/dialogflow", isAuth, DialogflowController.store);

dialogflowRoutes.get("/dialogflow/:dialogflowId", isAuth, DialogflowController.show);

dialogflowRoutes.put("/dialogflow/:dialogflowId", isAuth, DialogflowController.update);

dialogflowRoutes.delete("/dialogflow/:dialogflowId", isAuth, DialogflowController.remove);

dialogflowRoutes.post("/dialogflow/testsession", isAuth, DialogflowController.testSession);

export default dialogflowRoutes;
