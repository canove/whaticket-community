import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    queryInterface.addColumn("FileRegisters", "errorMessage", {
      type: DataTypes.TEXT,
      allowNull: true
    });
    return queryInterface.addColumn("FileRegisters", "errorAt", {
      type: DataTypes.DATE,
      allowNull: true
    });
  },

  down: (queryInterface: QueryInterface) => {
    queryInterface.removeColumn("FileRegisters", "errorMessage");
    return queryInterface.removeColumn("FileRegisters", "errorAt");
  }
};
