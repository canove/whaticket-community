import { DATE, INTEGER, QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("TicketHelpUsers", {
      userId: {
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
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("TicketHelpUsers");
  }
};
