import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Contacts", "email", {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ""
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Contacts", "email");
  }
};
