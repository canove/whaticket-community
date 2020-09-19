const Sequelize = require("sequelize");

class ContactCustomField extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        name: { type: Sequelize.STRING },
        value: { type: Sequelize.STRING }
      },
      {
        sequelize
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Contact, {
      foreignKey: "contactId",
      as: "extraInfo"
    });
  }
}

module.exports = ContactCustomField;
