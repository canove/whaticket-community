import express from "express";
import isAuth from "../middleware/isAuth";

import * as ContactBlacklistController from "../controllers/ContactBlacklistController";

const contactBlacklistRoutes = express.Router();

contactBlacklistRoutes.get("/contactBlacklist", isAuth, ContactBlacklistController.index);

contactBlacklistRoutes.delete("/contactBlacklist/:contactId", isAuth, ContactBlacklistController.remove);

export default contactBlacklistRoutes;
