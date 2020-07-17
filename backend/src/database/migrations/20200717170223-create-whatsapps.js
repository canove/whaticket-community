"use strict";

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable("Whatsapps", {
			id: {
				type: Sequelize.INTEGER,
				autoIncrement: true,
				primaryKey: true,
				allowNull: false,
			},
			session: {
				type: Sequelize.TEXT,
			},
			qrcode: {
				type: Sequelize.TEXT,
			},
			status: {
				type: Sequelize.STRING,
			},
			battery: {
				type: Sequelize.STRING,
			},
			plugged: {
				type: Sequelize.BOOLEAN,
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
		return queryInterface.dropTable("Whatsapps");
	},
};
