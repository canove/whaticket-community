import { DATE, INTEGER, QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("QueueCategories", {
      categoryId: {
        type: INTEGER,
        primaryKey: true
      },
      queueId: {
        type: INTEGER,
        primaryKey: true
      },
      createdAt: {
        type: DATE,
        allowNull: false
      },
      updatedAt: {
        type: DATE,
        allowNull: false
      }
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("QueueCategories");
  }
};
