"use strict";

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.addColumn("Users", "profile", {
			type: Sequelize.STRING,
			allowNull: false,
			defaultValue: "admin",
		});
	},

	down: queryInterface => {
		return queryInterface.removeColumn("Users", "profile");
	},
};
