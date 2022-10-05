import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    return await queryInterface.bulkInsert(
      "Menus",
      [
        {
          name: "Flows",
          icon: "TimelineIcon",
          parentId: null,
          isParent: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
      ],
      {}
    );
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Menus", {});
  }
};
