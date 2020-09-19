import { QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.renameColumn("Whatsapps", "default", "isDefault");
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.renameColumn("Whatsapps", "isDefault", "default");
  }
};
