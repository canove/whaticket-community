import { QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.bulkInsert(
      "Companies",
      [
        {
          name: 'WhaTicket Company 1',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'WhaTicket Company 2',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    );
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Companies", {});
  }
};

