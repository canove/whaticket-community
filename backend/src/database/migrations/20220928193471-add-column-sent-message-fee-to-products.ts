import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Products", "sentMessageFee", {
      type: DataTypes.FLOAT,
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Products", "sentMessageFee");
  }
};
