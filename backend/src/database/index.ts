import { Sequelize } from "sequelize-typescript";
import User from "../models/User.js";
import Setting from "../models/Setting.js";
import Contact from "../models/Contact.js";
import Ticket from "../models/Ticket.js";
import Whatsapp from "../models/Whatsapp.js";
import ContactCustomField from "../models/ContactCustomField.js";
import Message from "../models/Message.js";
import Queue from "../models/Queue.js";
import WhatsappQueue from "../models/WhatsappQueue.js";
import UserQueue from "../models/UserQueue.js";
import QuickAnswer from "../models/QuickAnswer.js";
import WppKey from "../models/WppKey.js";

import dbConfig from "../config/database.js";

const sequelize = new Sequelize(dbConfig as any);

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
  WppKey
];

sequelize.addModels(models);

export default sequelize;
