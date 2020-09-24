import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Tickets", "whatsappId", {
      type: DataTypes.INTEGER,
      references: { model: "Whatsapps", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Tickets", "whatsappId");
  }
};
