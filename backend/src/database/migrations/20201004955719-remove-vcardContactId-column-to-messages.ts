import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Messages", "vcardContactId");
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Messages", "vcardContactId", {
      type: DataTypes.INTEGER,
      references: { model: "Contacts", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE"
    });
  }
};
