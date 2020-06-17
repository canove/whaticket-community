const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const Message = require("./Message");

const Contact = sequelize.define("contact", {
	name: { type: Sequelize.STRING(100), allowNull: false },
	number: { type: Sequelize.STRING(15), allowNull: false },
	imageURL: { type: Sequelize.STRING(200) },
	lastMessage: { type: Sequelize.TEXT },
});

Contact.hasMany(Message, {
	onDelete: "CASCADE",
	onUpdate: "RESTRICT",
});

module.exports = Contact;
