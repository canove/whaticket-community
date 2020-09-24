import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Users", "profile", {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "admin"
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Users", "profile");
  }
};
