import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("WhatsappLearnings", "weekday", {
      type: DataTypes.BOOLEAN
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("WhatsappLearnings", "weekday");
  }
};
