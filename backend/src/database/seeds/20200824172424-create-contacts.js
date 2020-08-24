"use strict";

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.bulkInsert(
			"Contacts",
			[
				{
					name: "Joana Doe",
					profilePicUrl:
						"https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1834&q=80",
					number: 5512345678,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					name: "John Rulles",
					profilePicUrl:
						"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80",
					number: 5512345679,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					name: "Jonas Jhones",
					profilePicUrl:
						"https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80",
					number: 5512345680,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					name: "Julie June",
					profilePicUrl:
						"https://images.unsplash.com/photo-1493666438817-866a91353ca9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1049&q=80",
					number: 5512345681,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			],
			{}
		);
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.bulkDelete("Contacts", null, {});
	},
};
