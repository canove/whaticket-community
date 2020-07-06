const Sequelize = require("sequelize");
const dbConfig = require("../config/dbConfig");

const sequelize = new Sequelize(dbConfig);

module.exports = sequelize;
