import { Sequelize } from "sequelize-typescript";
import Contact from "../models/Contact";
import ContactCustomField from "../models/ContactCustomField";
import Message from "../models/Message";
import Queue from "../models/Queue";
import QuickAnswer from "../models/QuickAnswer";
import Setting from "../models/Setting";
import Ticket from "../models/Ticket";
import User from "../models/User";
import UserQueue from "../models/UserQueue";
import UserQuickAnswer from "../models/UserQuickAnswer";
import Whatsapp from "../models/Whatsapp";
import WhatsappQueue from "../models/WhatsappQueue";

// eslint-disable-next-line
const dbConfig = require("../config/database");
// import dbConfig from "../config/database";

const sequelize = new Sequelize(dbConfig);

const models = [
  User,
  Contact,
  Ticket,
  Message,
  Whatsapp,
  ContactCustomField,
  Setting,
  Queue,
  WhatsappQueue,
  UserQueue,
  QuickAnswer,
  UserQuickAnswer
];

sequelize.addModels(models);

export default sequelize;
