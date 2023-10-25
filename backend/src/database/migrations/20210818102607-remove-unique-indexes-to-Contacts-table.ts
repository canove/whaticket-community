import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.removeConstraint("Contacts","number_companyid_unique" )

  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeConstraint(
      "Contacts",
      "number_companyid_unique"
    );
  }
};
