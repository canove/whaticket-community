"use strict";

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.bulkInsert(
			"Messages",
			[
				{
					id: "12312321342",
					body:
						"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
					ack: 0,
					ticketId: 1,
					fromMe: false,
					read: 1,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					id: "12312321313",
					body:
						"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
					ack: 3,
					ticketId: 1,
					fromMe: true,
					read: 1,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					id: "12312321314",
					body:
						"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
					ack: 3,
					ticketId: 1,
					fromMe: true,
					read: 1,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					id: "12312321315",
					body:
						"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
					ack: 0,
					ticketId: 1,
					fromMe: false,
					read: 1,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					id: "12312321316",
					body:
						"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
					ack: 0,
					ticketId: 5,
					fromMe: false,
					read: 1,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					id: "12312321355",
					body:
						"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
					ack: 3,
					ticketId: 5,
					fromMe: true,
					read: 1,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					id: "12312321318",
					body:
						"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
					ack: 3,
					ticketId: 5,
					fromMe: true,
					read: 1,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					id: "12312321319",
					body:
						"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
					ack: 0,
					ticketId: 5,
					fromMe: false,
					read: 1,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					id: "12312321399",
					body:
						"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
					ack: 0,
					ticketId: 11,
					fromMe: false,
					read: 1,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					id: "12312321391",
					body:
						"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
					ack: 3,
					ticketId: 11,
					fromMe: true,
					read: 1,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					id: "12312321392",
					body:
						"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
					ack: 3,
					ticketId: 11,
					fromMe: true,
					read: 1,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					id: "12312321393",
					body:
						"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
					ack: 0,
					ticketId: 11,
					fromMe: false,
					read: 1,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			],
			{}
		);
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.bulkDelete("Messages", null, {});
	},
};
