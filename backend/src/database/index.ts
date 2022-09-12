import { Sequelize } from "sequelize-typescript";
import User from "./models/User";
import Setting from "./models/Setting";
import Contact from "./models/Contact";
import Ticket from "./models/Ticket";
import Whatsapp from "./models/Whatsapp";
import ContactCustomField from "./models/ContactCustomField";
import Message from "./models/Message";
import Queue from "./models/Queue";
import WhatsappQueue from "./models/WhatsappQueue";
import UserQueue from "./models/UserQueue";
import QuickAnswer from "./models/QuickAnswer";
import File from "./models/File";
import FileRegister from "./models/FileRegister";
import WhatsappsConfig from "./models/WhatsappsConfig";
import GreetingMessages from "./models/GreetingMessages";
import Company from "./models/Company";
import Menu from "./models/Menu";
import MenuCompanies from "./models/MenuCompanies";
import Templates from "./models/TemplatesData";
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
  File,
  FileRegister,
  WhatsappsConfig,
  GreetingMessages,
  Company,
  Menu,
  MenuCompanies,
  Templates,
];

sequelize.addModels(models);

export default sequelize;
