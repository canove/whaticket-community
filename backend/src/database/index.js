const Sequelize = require("sequelize");
const dbConfig = require("../config/database");

const User = require("../models/User");

const models = [User];

class Database {
	constructor() {
		this.init();
	}

	init() {
		this.sequelize = new Sequelize(dbConfig);

		models.map(model => model.init(this.sequelize));
	}
}

module.exports = new Database();
