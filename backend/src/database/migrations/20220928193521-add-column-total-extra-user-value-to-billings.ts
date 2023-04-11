import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Billings", "totalExtraUserValue", {
      type: DataTypes.FLOAT,
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Billings", "totalExtraUserValue");
  }
};
