import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.changeColumn("Templates", "text", {
        type: DataTypes.TEXT({ length: "long" })
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.changeColumn("Templates", "text", {
        type: DataTypes.STRING
      })
    ]);
  }
};
