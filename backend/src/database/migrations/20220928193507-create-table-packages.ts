import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("Packages", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
      },
      maxUsers: {
        type: DataTypes.INTEGER,
      },
      extraUserPrice: {
        type: DataTypes.FLOAT,
      },
      maxTicketsByMonth: {
        type: DataTypes.INTEGER,
      },
      extraTicketPrice: {
        type: DataTypes.FLOAT,
      },
      whatsappMonthlyPrice: {
        type: DataTypes.FLOAT,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    });
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("Packages");
  }
};
