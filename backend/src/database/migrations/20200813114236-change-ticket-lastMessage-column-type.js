"use strict";

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.changeColumn("Tickets", "lastMessage", {
			type: Sequelize.TEXT,
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.changeColumn("Tickets", "lastMessage", {
			type: Sequelize.STRING,
		});
	},
};
