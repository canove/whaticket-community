import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Flows", "clientEmail", {
      type: DataTypes.STRING
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Flows", "clientEmail");
  }
};
