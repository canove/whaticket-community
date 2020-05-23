const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const User = sequelize.define("user", {
	id: {
		type: Sequelize.INTEGER,
		allowNull: false,
		primaryKey: true,
		autoIncrement: true,
	},
	name: { type: Sequelize.STRING(100), allowNull: false },
	password: { type: Sequelize.STRING(100), allowNull: false },
	email: { type: Sequelize.STRING(100), allowNull: false },
});

module.exports = User;
