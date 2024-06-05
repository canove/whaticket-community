import { DataTypes, QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Categories", "color", {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Categories", "color");
  }
};
