const Sequelize = require("sequelize");

const sequelize = require("../database");

const Message = require("./Message");

const Contact = sequelize.define("contact", {
	name: { type: Sequelize.STRING(100), allowNull: false },
	number: { type: Sequelize.STRING(15), allowNull: false },
	profilePicUrl: { type: Sequelize.STRING(200) },
	lastMessage: { type: Sequelize.TEXT },
});

Contact.hasMany(Message, {
	onDelete: "CASCADE",
	onUpdate: "RESTRICT",
});

module.exports = Contact;
