import express from "express";
import isAuth from "../middleware/isAuth";

import * as QuickAnswerController from "../controllers/QuickAnswerController";

const quickAnswerRoutes = express.Router();

quickAnswerRoutes.get("/quickAnswers", isAuth, QuickAnswerController.index);

quickAnswerRoutes.get(
  "/quickAnswers/:quickAnswerId",
  isAuth,
  QuickAnswerController.show
);

quickAnswerRoutes.post("/quickAnswers", isAuth, QuickAnswerController.store);

quickAnswerRoutes.put(
  "/quickAnswers/:quickAnswerId",
  isAuth,
  QuickAnswerController.update
);

quickAnswerRoutes.delete(
  "/quickAnswers/:quickAnswerId",
  isAuth,
  QuickAnswerController.remove
);

export default quickAnswerRoutes;
