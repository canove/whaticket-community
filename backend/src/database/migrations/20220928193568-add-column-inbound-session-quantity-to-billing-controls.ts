import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("BillingControls", "inboundSessionQuantity", {
      type: DataTypes.INTEGER,
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("BillingControls", "inboundSessionQuantity");
  }
};
