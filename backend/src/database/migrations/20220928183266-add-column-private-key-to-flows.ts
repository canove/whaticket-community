import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Flows", "privateKey", {
      type: DataTypes.STRING
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Flows", "privateKey");
  }
};
