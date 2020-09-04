"use strict";

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.addColumn("Whatsapps", "name", {
			type: Sequelize.STRING,
			allowNull: false,
			unique: true,
		});
	},

	down: queryInterface => {
		return queryInterface.removeColumn("Whatsapps", "name");
	},
};
