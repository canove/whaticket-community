const Sequelize = require("sequelize");

class Message extends Sequelize.Model {
	static init(sequelize) {
		super.init(
			{
				ack: { type: Sequelize.INTEGER, defaultValue: 0 },
				read: { type: Sequelize.BOOLEAN, defaultValue: false },
				body: { type: Sequelize.TEXT },
				mediaUrl: { type: Sequelize.STRING },
				mediaType: { type: Sequelize.STRING },
				createdAt: {
					type: Sequelize.DATE(6),
					allowNull: false,
				},
				updatedAt: {
					type: Sequelize.DATE(6),
					allowNull: false,
				},
			},
			{
				sequelize,
			}
		);

		return this;
	}

	static associate(models) {
		this.belongsTo(models.Ticket, { foreignKey: "ticketId" });
		this.belongsTo(models.User, { foreignKey: "userId" });
	}
}

module.exports = Message;
