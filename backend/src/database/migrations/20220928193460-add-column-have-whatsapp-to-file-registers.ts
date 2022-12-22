import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("FileRegisters", "haveWhatsapp", {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: null
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("FileRegisters", "haveWhatsapp");
  }
};
