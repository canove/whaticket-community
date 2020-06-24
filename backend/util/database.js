require("dotenv/config");
const Sequelize = require("sequelize");

const sequelize = new Sequelize({
	define: {
		charset: "utf8mb4",
		collate: "utf8mb4_bin",
	},
	dialect: "mysql",
	timezone: "-03:00",
	host: process.env.DB_HOST,
	database: process.env.DB_NAME,
	username: process.env.DB_USER,
	password: process.env.DB_PASS,
	logging: false,
});

module.exports = sequelize;
