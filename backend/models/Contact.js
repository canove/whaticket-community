const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const Message = require("./Message");

const Contact = sequelize.define("contact", {
	id: {
		type: Sequelize.INTEGER,
		allowNull: false,
		primaryKey: true,
		autoIncrement: true,
	},
	name: { type: Sequelize.STRING(100), allowNull: false },
	number: { type: Sequelize.STRING(15), allowNull: false },
	imageURL: { type: Sequelize.STRING(200) },
});

Contact.hasMany(Message);

module.exports = Contact;
