const Sequelize = require("sequelize");
const bcrypt = require("bcryptjs");

class User extends Sequelize.Model {
	static init(sequelize) {
		super.init(
			{
				name: { type: Sequelize.STRING },
				password: { type: Sequelize.VIRTUAL },
				passwordHash: { type: Sequelize.STRING },
				email: { type: Sequelize.STRING },
			},
			{
				sequelize,
			}
		);

		this.addHook("beforeSave", async user => {
			if (user.password) {
				user.passwordHash = await bcrypt.hash(user.password, 8);
			}
		});
		return this;
	}

	checkPassword(password) {
		return bcrypt.compare(password, this.passwordHash);
	}
}

module.exports = User;
