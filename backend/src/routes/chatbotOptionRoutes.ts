import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as ChatbotOptionController from "../controllers/ChatbotOptionController";

const chatbotOptionRoutes = Router();

chatbotOptionRoutes.get(
  "/chatbotOptions",
  isAuth,
  ChatbotOptionController.index
);

chatbotOptionRoutes.post(
  "/chatbotOption",
  isAuth,
  ChatbotOptionController.store
);

chatbotOptionRoutes.get(
  "/chatbotOption/:chatbotOptionId",
  isAuth,
  ChatbotOptionController.show
);

chatbotOptionRoutes.put(
  "/chatbotOption/:chatbotOptionId",
  isAuth,
  ChatbotOptionController.update
);

chatbotOptionRoutes.delete(
  "/chatbotOption/:chatbotOptionId",
  isAuth,
  ChatbotOptionController.remove
);

export default chatbotOptionRoutes;
