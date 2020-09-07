"use strict";

module.exports = {
	up: queryInterface => {
		return queryInterface.bulkInsert(
			"Settings",
			[
				{
					key: "userCreation",
					value: "enabled",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			],
			{}
		);
	},

	down: queryInterface => {
		return queryInterface.bulkDelete("Settings", null, {});
	},
};
