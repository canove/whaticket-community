import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("OfficialTemplates", "bodyExample", {
      type: DataTypes.TEXT({ length: "long" })
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("OfficialTemplates", "bodyExample");
  }
};
