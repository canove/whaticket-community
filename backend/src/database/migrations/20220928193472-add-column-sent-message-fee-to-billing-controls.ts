import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("BillingControls", "sentMessageFee", {
      type: DataTypes.FLOAT,
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("BillingControls", "sentMessageFee");
  }
};
