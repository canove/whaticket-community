import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Companies", "status", {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "ativo"
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Companies", "status");
  }
};
