import express from "express";
import isAuth from "../middleware/isAuth";

import * as GroupController from "../controllers/GroupController";
// import * as ImportPhoneContactsController from "../controllers/ImportPhoneContactsController";

const groupRoutes = express.Router();

groupRoutes.post("/group", isAuth, GroupController.store);

export default groupRoutes;
