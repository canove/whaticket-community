const Sequelize = require("sequelize");

const sequelize = new Sequelize("econo_whatsbot", "root", "nodecomplete", {
	dialect: "mysql",
	host: "localhost",
	logging: false,
});

module.exports = sequelize;
