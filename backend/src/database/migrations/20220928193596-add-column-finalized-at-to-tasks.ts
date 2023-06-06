import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Tasks", "finalizedAt", {
      type: DataTypes.DATE,
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Tasks", "finalizedAt");
  }
};
