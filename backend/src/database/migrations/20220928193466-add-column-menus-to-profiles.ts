import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Profiles", "menus", {
      type: DataTypes.TEXT({ length: "long" })
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Profiles", "menus");
  }
};
