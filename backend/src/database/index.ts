import { Sequelize } from "sequelize-typescript";
import Category from "../models/Category";
import ChatbotOption from "../models/ChatbotOption";
import Contact from "../models/Contact";
import ContactCustomField from "../models/ContactCustomField";
import GroupContact from "../models/GroupContact";
import Message from "../models/Message";
import Queue from "../models/Queue";
import QueueCategory from "../models/QueueCategory";
import QuickAnswer from "../models/QuickAnswer";
import Setting from "../models/Setting";
import Ticket from "../models/Ticket";
import TicketCategory from "../models/TicketCategory";
import TicketHelpUser from "../models/TicketHelpUser";
import TicketLog from "../models/TicketLog";
import TicketParticipantUsers from "../models/TicketParticipantUsers";
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
  TicketHelpUser,
  Message,
  Whatsapp,
  GroupContact,
  ContactCustomField,
  Setting,
  Queue,
  QueueCategory,
  WhatsappQueue,
  UserQueue,
  QuickAnswer,
  ChatbotOption,
  TicketParticipantUsers,
  TicketLog
];

sequelize.addModels(models);

export default sequelize;
