const express = require("express");

const AuthRoutes = require("./routes/auth");
const TicketsRoutes = require("./routes/tickets");
const MessagesRoutes = require("./routes/messages");
const ContactsRoutes = require("./routes/contacts");
const WhatsRoutes = require("./routes/whatsapp");
const UsersRoutes = require("./routes/users");
const SettingsRoutes = require("./routes/settings");

const routes = express.Router();

routes.use("/auth", AuthRoutes);
routes.use(TicketsRoutes);
routes.use(MessagesRoutes);
routes.use(ContactsRoutes);
routes.use(WhatsRoutes);
routes.use(UsersRoutes);
routes.use(SettingsRoutes);

module.exports = routes;
