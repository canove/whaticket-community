import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn("Whatsapps", "server", {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    });
    await queryInterface.addColumn("Whatsapps", "key", {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Whatsapps", "server");
    await queryInterface.removeColumn("Whatsapps", "key");
  }
};
