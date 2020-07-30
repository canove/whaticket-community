"use strict";

module.exports = {
	up: queryInterface => {
		return queryInterface.removeColumn("Messages", "userId");
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.addColumn("Messages", "userId", {
			type: Sequelize.INTEGER,
			references: { model: "Users", key: "id" },
			onUpdate: "CASCADE",
			onDelete: "SET NULL",
		});
	},
};
