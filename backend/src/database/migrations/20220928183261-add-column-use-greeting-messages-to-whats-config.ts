import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("WhatsappsConfigs", "useGreetingMessages", {
      type: DataTypes.BOOLEAN
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn(
      "WhatsappsConfigs",
      "useGreetingMessages"
    );
  }
};
