import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Categories", "companyId", {
      type: DataTypes.INTEGER,
      references: { model: "Companies", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Categories", "companyId");
  }
};
