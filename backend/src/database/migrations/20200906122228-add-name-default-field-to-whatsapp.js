"use strict";

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.addColumn("Whatsapps", "default", {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		});
	},

	down: queryInterface => {
		return queryInterface.removeColumn("Whatsapps", "default");
	},
};
