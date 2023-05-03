import { DataTypes, QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("Schedules", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        unique: true
      },
      date: {
        type: DataTypes.STRING,
        allowNull: false
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      sent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      mediaType: {
        type: DataTypes.STRING
      },
      createdAt: {
        type: DataTypes.DATE(6)
      },
      updatedAt: {
        type: DataTypes.DATE(6)
      }
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("Schedules");
  }
};
