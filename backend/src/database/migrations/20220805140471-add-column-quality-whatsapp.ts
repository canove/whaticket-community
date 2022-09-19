import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    queryInterface.addColumn("Whatsapps", "tierLimit", {
      type: DataTypes.TEXT,
      allowNull: true
    });

    return queryInterface.addColumn("Whatsapps", "quality", {
      type: DataTypes.TEXT,
      allowNull: true
    });
  },

  down: (queryInterface: QueryInterface) => {
    queryInterface.removeColumn("Whatsapps", "tierLimit");
    return queryInterface.removeColumn("Whatsapps", "quality");
  }
};
