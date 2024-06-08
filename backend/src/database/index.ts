import { Sequelize } from "sequelize-typescript";
import Category from "../models/Category";
import Contact from "../models/Contact";
import ContactCustomField from "../models/ContactCustomField";
import Message from "../models/Message";
import Queue from "../models/Queue";
import QueueCategory from "../models/QueueCategory";
import QuickAnswer from "../models/QuickAnswer";
import Setting from "../models/Setting";
import Ticket from "../models/Ticket";
import TicketCategory from "../models/TicketCategory";
import User from "../models/User";
import UserQueue from "../models/UserQueue";
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
  Category,
  TicketCategory,
  Message,
  Whatsapp,
  ContactCustomField,
  Setting,
  Queue,
  QueueCategory,
  WhatsappQueue,
  UserQueue,
  QuickAnswer
];

sequelize.addModels(models);

export default sequelize;
