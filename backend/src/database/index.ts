import { Sequelize } from "sequelize-typescript";
import User from "../models/User";
import Setting from "../models/Setting";
import Contact from "../models/Contact";
import Ticket from "../models/Ticket";

// eslint-disable-next-line
const dbConfig = require("../config/database");
// import dbConfig from "../config/database";

// const Message = require("../models/Message");
// const Whatsapp = require("../models/Whatsapp");
// const ContactCustomField = require("../models/ContactCustomField");

const sequelize = new Sequelize(dbConfig);

const models = [
  User,
  Contact,
  Ticket,
  // Message,
  // Whatsapp,
  // ContactCustomField,
  Setting
];

sequelize.addModels(models);

export default sequelize;
