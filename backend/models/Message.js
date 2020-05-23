const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const Message = sequelize.define("message", {
	userId: { type: Sequelize.INTEGER, defaultValue: 0 },
	messageBody: { type: Sequelize.STRING(250), allowNull: false },
	read: { type: Sequelize.BOOLEAN, defaultValue: false },
});

module.exports = Message;
