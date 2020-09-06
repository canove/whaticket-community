const Sequelize = require("sequelize");

class Whatsapp extends Sequelize.Model {
	static init(sequelize) {
		super.init(
			{
				session: { type: Sequelize.TEXT },
				qrcode: { type: Sequelize.TEXT },
				name: { type: Sequelize.STRING, unique: true, allowNull: false },
				status: { type: Sequelize.STRING },
				battery: { type: Sequelize.STRING },
				plugged: { type: Sequelize.BOOLEAN },
				default: {
					type: Sequelize.BOOLEAN,
					defaultValue: false,
					allowNull: false,
				},
			},
			{
				sequelize,
			}
		);

		return this;
	}
}

module.exports = Whatsapp;
