import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("ExposedImports", "qtdeRegister", {
      type: DataTypes.INTEGER
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("ExposedImports", "qtdeRegister");
  }
};
