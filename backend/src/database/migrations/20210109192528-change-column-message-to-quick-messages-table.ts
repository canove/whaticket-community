import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.changeColumn("QuickMessages", "message", {
      type: DataTypes.TEXT
    });
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.changeColumn("QuickMessages", "message", {
      type: DataTypes.STRING
    });
  }
};
