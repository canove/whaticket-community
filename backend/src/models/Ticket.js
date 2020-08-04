const Sequelize = require("sequelize");
const Message = require("./Message");

class Ticket extends Sequelize.Model {
	static init(sequelize) {
		super.init(
			{
				status: { type: Sequelize.STRING, defaultValue: "pending" },
				userId: { type: Sequelize.INTEGER, defaultValue: null },
				unreadMessages: { type: Sequelize.VIRTUAL },
				lastMessage: { type: Sequelize.STRING },
			},
			{
				sequelize,
			}
		);

		this.addHook("afterFind", async result => {
			if (result.length > 0) {
				await Promise.all(
					result.map(async ticket => {
						ticket.unreadMessages = await Message.count({
							where: { ticketId: ticket.id, read: false },
						});
					})
				);
			}
		});

		this.addHook("afterUpdate", async ticket => {
			ticket.unreadMessages = await Message.count({
				where: { ticketId: ticket.id, read: false },
			});
		});

		return this;
	}

	static associate(models) {
		this.belongsTo(models.Contact, { foreignKey: "contactId", as: "contact" });
		this.belongsTo(models.User, { foreignKey: "userId", as: "user" });
		this.hasMany(models.Message, { foreignKey: "ticketId" });
	}
}

module.exports = Ticket;
