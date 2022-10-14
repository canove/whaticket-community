import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn(
      "IntegratedImports",
      "approvedOrRefusedId",
      {
        type: DataTypes.INTEGER,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      }
    );
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn(
      "IntegratedImports",
      "approvedOrRefusedId"
    );
  }
};
