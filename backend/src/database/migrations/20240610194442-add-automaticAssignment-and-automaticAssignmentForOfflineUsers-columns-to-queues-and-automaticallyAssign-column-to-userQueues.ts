import { BOOLEAN, QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn(
          "Queues",
          "automaticAssignment",
          {
            type: BOOLEAN,
            allowNull: true,
            defaultValue: false
          },
          {
            transaction: t
          }
        ),
        queryInterface.addColumn(
          "Queues",
          "automaticAssignmentForOfflineUsers",
          {
            type: BOOLEAN,
            allowNull: true,
            defaultValue: false
          },
          {
            transaction: t
          }
        ),
        queryInterface.addColumn(
          "UserQueues",
          "automaticallyAssign",
          {
            type: BOOLEAN,
            allowNull: true,
            defaultValue: false
          },
          {
            transaction: t
          }
        )
      ]);
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn("Queues", "automaticAssignment", {
          transaction: t
        }),
        queryInterface.removeColumn(
          "Queues",
          "automaticAssignmentForOfflineUsers",
          { transaction: t }
        ),
        queryInterface.removeColumn("UserQueues", "automaticallyAssign", {
          transaction: t
        })
      ]);
    });
  }
};
