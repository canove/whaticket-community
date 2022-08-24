import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("WhatsappsConfigs", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      triggerInterval: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      whatsappIds: {
        type: DataTypes.STRING,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("WhatsappsConfigs");
  }
};
