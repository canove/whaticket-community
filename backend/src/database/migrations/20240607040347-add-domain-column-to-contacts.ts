import { DataTypes, QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Contacts", "domain", {
      type: DataTypes.STRING
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Contacts", "domain");
  }
};
