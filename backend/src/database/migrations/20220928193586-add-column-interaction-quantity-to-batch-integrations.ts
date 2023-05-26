import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("BatchIntegrations", "interactionQuantity", {
      type: DataTypes.INTEGER,
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("BatchIntegrations", "interactionQuantity");
  }
};
