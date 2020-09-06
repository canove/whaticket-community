"use strict";

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.addColumn("Tickets", "whatsappId", {
			type: Sequelize.INTEGER,
			references: { model: "Whatsapps", key: "id" },
			onUpdate: "CASCADE",
			onDelete: "SET NULL",
		});
	},

	down: queryInterface => {
		return queryInterface.removeColumn("Tickets", "whatsappId");
	},
};
