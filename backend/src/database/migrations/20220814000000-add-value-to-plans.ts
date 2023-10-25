import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Plans", "value", {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 199.99
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Plans", "value");
  }
};
