import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("FileRegisters", "whatsappId", {
      type: DataTypes.INTEGER,
      allowNull: true
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("FileRegisters", "whatsappId");
  }
};
