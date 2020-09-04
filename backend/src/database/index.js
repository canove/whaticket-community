const Sequelize = require("sequelize");
const dbConfig = require("../config/database");

const User = require("../models/User");
const Contact = require("../models/Contact");
const Ticket = require("../models/Ticket");
const Message = require("../models/Message");
const Whatsapp = require("../models/Whatsapp");
const ContactCustomField = require("../models/ContactCustomField");
const Setting = require("../models/Setting");

const models = [
	User,
	Contact,
	Ticket,
	Message,
	Whatsapp,
	ContactCustomField,
	Setting,
];

class Database {
	constructor() {
		this.init();
	}

	init() {
		this.sequelize = new Sequelize(dbConfig);

		models
			.map(model => model.init(this.sequelize))
			.map(model => model.associate && model.associate(this.sequelize.models));
	}
}

module.exports = new Database();
