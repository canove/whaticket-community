/*eslint-disable*/
import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const Menus: any = await queryInterface.sequelize.query(
      'SELECT id FROM whaticket.Menus WHERE name="Menus" and isParent=true;'
    );

    await queryInterface.bulkInsert(
      "Menus",
      [
        {
          name: "Menu Link",
          icon: "ListAltIcon",
          parentId: Menus[0][0].id,
          isParent: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "Registration",
          icon: "BallotIcon",
          parentId: Menus[0][0].id,
          isParent: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
      ]
    );
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Menus", {});
  }
};
