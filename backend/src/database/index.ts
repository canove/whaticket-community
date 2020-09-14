import { Sequelize } from "sequelize-typescript";
import User from "../models/User";

// eslint-disable-next-line
const dbConfig = require("../config/database");
// import dbConfig from "../config/database";

// const Contact = require("../models/Contact");
// const Ticket = require("../models/Ticket");
// const Message = require("../models/Message");
// const Whatsapp = require("../models/Whatsapp");
// const ContactCustomField = require("../models/ContactCustomField");
// const Setting = require("../models/Setting");

const sequelize = new Sequelize(dbConfig);

const models = [
  User
  // Contact,
  // Ticket,
  // Message,
  // Whatsapp,
  // ContactCustomField,
  // Setting,
];

sequelize.addModels(models);

export default sequelize;
