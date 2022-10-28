import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("FlowsSessions", "variables", {
      type: DataTypes.TEXT({ length: "long" })
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("FlowsSessions", "variables");
  }
};
