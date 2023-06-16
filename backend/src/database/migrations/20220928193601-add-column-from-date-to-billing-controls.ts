import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("BillingControls", "fromDate", {
      type: DataTypes.DATE,
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("BillingControls", "fromDate");
  }
};
