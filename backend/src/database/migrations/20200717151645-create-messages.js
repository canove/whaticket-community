"use strict";

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable("Messages", {
			id: {
				type: Sequelize.STRING,
				primaryKey: true,
				allowNull: false,
			},
			body: {
				type: Sequelize.TEXT,
				allowNull: false,
			},
			ack: {
				type: Sequelize.INTEGER,
				allowNull: false,
				defaultValue: 0,
			},
			read: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			mediaType: {
				type: Sequelize.STRING,
			},
			mediaUrl: {
				type: Sequelize.STRING,
			},
			userId: {
				type: Sequelize.INTEGER,
				references: { model: "Users", key: "id" },
				onUpdate: "CASCADE",
				onDelete: "SET NULL",
			},
			ticketId: {
				type: Sequelize.INTEGER,
				references: { model: "Tickets", key: "id" },
				onUpdate: "CASCADE",
				onDelete: "CASCADE",
				allowNull: false,
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
		return queryInterface.dropTable("Messages");
	},
};
