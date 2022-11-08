import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("FileRegisters", "var3", {
      type: DataTypes.STRING,
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("FileRegisters", "var3");
  }
};
