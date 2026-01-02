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
import Company from "../models/Company.js";
import Plan from "../models/Plan.js";
import TicketNote from "../models/TicketNote.js";
import QuickAnswer from "../models/QuickAnswer.js";
import Help from "../models/Help.js";
import TicketTraking from "../models/TicketTraking.js";
import UserRating from "../models/UserRating.js";
import QueueOption from "../models/QueueOption.js";
import Schedule from "../models/Schedule.js";
import Tag from "../models/Tag.js";
import TicketTag from "../models/TicketTag.js";
import Campaign from "../models/Campaign.js";
import CampaignSetting from "../models/CampaignSetting.js";
import Baileys from "../models/Baileys.js";
import CampaignShipping from "../models/CampaignShipping.js";
import Announcement from "../models/Announcement.js";
import ChatFlow from "../models/ChatFlow.js";
import dbConfig from "../config/database.js";

// @ts-ignore
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
  Company,
  Plan,
  TicketNote,
  QuickAnswer,
  Help,
  TicketTraking,
  UserRating,
  QueueOption,
  Schedule,
  Tag,
  TicketTag,
  Campaign,
  CampaignSetting,
  Baileys,
  CampaignShipping,
  Announcement,
  ChatFlow
];

sequelize.addModels(models);

export default sequelize;
