import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Products", "receivedMessageFee", {
      type: DataTypes.FLOAT,
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Products", "receivedMessageFee");
  }
};
