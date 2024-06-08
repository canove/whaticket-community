import { DATE, INTEGER, QueryInterface, STRING } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.createTable(
          "Categories",
          {
            id: {
              type: INTEGER,
              autoIncrement: true,
              primaryKey: true,
              allowNull: false
            },
            name: {
              type: STRING,
              allowNull: false,
              unique: true
            },
            createdAt: {
              type: DATE,
              allowNull: false
            },
            updatedAt: {
              type: DATE,
              allowNull: false
            }
          },
          { transaction: t }
        ),
        queryInterface.createTable(
          "TicketCategories",
          {
            categoryId: {
              type: INTEGER,
              primaryKey: true
            },
            ticketId: {
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
          },
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.dropTable("Categories", { transaction: t }),
        queryInterface.dropTable("TicketCategories", { transaction: t })
      ]);
    });
  }
};
