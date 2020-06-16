const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const Whatsapp = sequelize.define("whatsapp", {
	session: { type: Sequelize.TEXT() },
	qrcode: { type: Sequelize.TEXT() },
	status: { type: Sequelize.STRING(20) },
});

module.exports = Whatsapp;
