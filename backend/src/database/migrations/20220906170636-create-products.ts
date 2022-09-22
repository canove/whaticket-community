import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("Products", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      monthlyFee: {
        type: DataTypes.FLOAT
      },
      triggerFee: {
        type: DataTypes.FLOAT
      },
      monthlyInterestRate: {
        type: DataTypes.FLOAT
      },
      lateFine: {
        type: DataTypes.FLOAT
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
    return queryInterface.dropTable("Products");
  }
};
