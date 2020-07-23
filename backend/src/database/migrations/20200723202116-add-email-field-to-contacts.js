"use strict";

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.addColumn("Contacts", "email", {
			type: Sequelize.STRING,
			allowNull: false,
			defaultValue: "",
		});
	},

	down: queryInterface => {
		return queryInterface.removeColumn("Contacts", "email");
	},
};
