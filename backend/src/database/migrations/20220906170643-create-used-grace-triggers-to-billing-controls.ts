import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("BillingControls", "usedGraceTriggers", {
      type: DataTypes.INTEGER
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("BillingControls", "usedGraceTriggers");
  }
};
