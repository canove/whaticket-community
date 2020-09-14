const express = require("express");
const isAuth = require("../../middleware/is-auth");

const SettingController = require("../../controllers/SettingController");

const routes = express.Router();

routes.get("/settings", isAuth, SettingController.index);

// routes.get("/settings/:settingKey", isAuth, SettingsController.show);

routes.put("/settings/:settingKey", isAuth, SettingController.update);

module.exports = routes;
