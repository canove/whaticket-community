"use strict";

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable("Tickets", {
			id: {
				type: Sequelize.INTEGER,
				autoIncrement: true,
				primaryKey: true,
				allowNull: false,
			},
			status: {
				type: Sequelize.STRING,
				defaultValue: "pending",
				allowNull: false,
			},
			lastMessage: {
				type: Sequelize.STRING,
			},
			contactId: {
				type: Sequelize.INTEGER,
				references: { model: "Contacts", key: "id" },
				onUpdate: "CASCADE",
				onDelete: "CASCADE",
			},
			userId: {
				type: Sequelize.INTEGER,
				references: { model: "Users", key: "id" },
				onUpdate: "CASCADE",
				onDelete: "SET NULL",
			},
			createdAt: {
				type: Sequelize.DATE(6),
				allowNull: false,
			},
			updatedAt: {
				type: Sequelize.DATE(6),
				allowNull: false,
			},
		});
	},

	down: queryInterface => {
		return queryInterface.dropTable("Tickets");
	},
};
