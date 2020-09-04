const Sequelize = require("sequelize");

class Setting extends Sequelize.Model {
	static init(sequelize) {
		super.init(
			{
				key: {
					type: Sequelize.STRING,
					primaryKey: true,
					allowNull: false,
					unique: true,
				},
				value: { type: Sequelize.TEXT, allowNull: false },
			},
			{
				sequelize,
			}
		);

		return this;
	}
}

module.exports = Setting;
