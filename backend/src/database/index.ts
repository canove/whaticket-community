import { Sequelize } from "sequelize-typescript";
import { resolve } from "path";
// import dbConfig from "../config/database";
import "dotenv/config";

// import User from "../models/User";
// const Contact = require("../models/Contact");
// const Ticket = require("../models/Ticket");
// const Message = require("../models/Message");
// const Whatsapp = require("../models/Whatsapp");
// const ContactCustomField = require("../models/ContactCustomField");
// const Setting = require("../models/Setting");

const sequelize = new Sequelize({
  define: {
    charset: "utf8mb4",
    collate: "utf8mb4_bin"
  },
  dialect: "mysql",
  timezone: "-03:00",
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  models: [resolve(__dirname, "..", "models")],
  logging: false
});

// const models = [
//   User
//   // Contact,
//   // Ticket,
//   // Message,
//   // Whatsapp,
//   // ContactCustomField,
//   // Setting,
// ];

// class Database {
//   constructor() {
//     this.init();
//   }

//   init() {
//     this.sequelize = new Sequelize(dbConfig);

//     models
//       .map(model => model.init(this.sequelize))
//       .map(model => model.associate && model.associate(this.sequelize.models));
//   }
// }

export default sequelize;
