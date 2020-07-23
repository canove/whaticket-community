const Sequelize = require("sequelize");

class Contact extends Sequelize.Model {
	static init(sequelize) {
		super.init(
			{
				name: { type: Sequelize.STRING },
				number: { type: Sequelize.STRING },
				profilePicUrl: { type: Sequelize.STRING },
			},
			{
				sequelize,
			}
		);

		return this;
	}

	static associate(models) {
		this.hasMany(models.Ticket, { foreignKey: "contactId" });
		this.hasMany(models.ContactCustomField, {
			foreignKey: "contactId",
			as: "extraInfo",
		});
	}
}

module.exports = Contact;
