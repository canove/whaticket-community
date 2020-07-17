const Sequelize = require("sequelize");

class Ticket extends Sequelize.Model {
	static init(sequelize) {
		super.init(
			{
				status: { type: Sequelize.STRING, defaultValue: "pending" },
				lastMessage: { type: Sequelize.STRING },
			},
			{
				sequelize,
			}
		);

		return this;
	}

	static associate(models) {
		this.belongsTo(models.Contact, { foreignKey: "contactId" });
		this.belongsTo(models.User, { foreignKey: "userId" });
		this.hasMany(models.Message, { foreignKey: "ticketId" });
	}
}

module.exports = Ticket;
