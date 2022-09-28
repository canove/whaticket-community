import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable('IntegratedImports', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      name: {
        type: DataTypes.STRING
      },
      method: {
        type: DataTypes.STRING
      },
      qtdeRegister: {
        type: DataTypes.INTEGER
      },
      status: {
        type: DataTypes.INTEGER
      },
      url: {
        type: DataTypes.STRING
      },
      key: {
        type: DataTypes.STRING
      },
      token: {
        type: DataTypes.STRING
      },
      mapping: {
        type: DataTypes.TEXT({ length: "long" })
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
    return queryInterface.dropTable('IntegratedImports');
  }
};