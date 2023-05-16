import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Files", "sendByAllConnections", {
      type: DataTypes.BOOLEAN,
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Files", "sendByAllConnections");
  }
};
