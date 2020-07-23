"use strict";

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable("ContactCustomFields", {
			id: {
				type: Sequelize.INTEGER,
				autoIncrement: true,
				primaryKey: true,
				allowNull: false,
			},
			name: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			value: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			contactId: {
				type: Sequelize.INTEGER,
				references: { model: "Contacts", key: "id" },
				onUpdate: "CASCADE",
				onDelete: "CASCADE",
				allowNull: false,
			},
			createdAt: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			updatedAt: {
				type: Sequelize.DATE,
				allowNull: false,
			},
		});
	},

	down: queryInterface => {
		return queryInterface.dropTable("ContactCustomFields");
	},
};
