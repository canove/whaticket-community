const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const Message = sequelize.define("message", {
	id: {
		type: Sequelize.STRING(50),
		allowNull: false,
		primaryKey: true,
	},
	userId: { type: Sequelize.INTEGER, defaultValue: 0 },
	ack: { type: Sequelize.INTEGER, defaultValue: 0 },
	messageBody: { type: Sequelize.STRING(250), allowNull: false },
	read: { type: Sequelize.BOOLEAN, defaultValue: false },
	mediaUrl: { type: Sequelize.STRING(250) },
	mediaType: { type: Sequelize.STRING(250) },
});

module.exports = Message;
