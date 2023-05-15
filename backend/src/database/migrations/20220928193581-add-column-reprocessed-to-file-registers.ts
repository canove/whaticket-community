import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("FileRegisters", "reprocessed", {
      type: DataTypes.INTEGER,
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("FileRegisters", "reprocessed");
  }
};
