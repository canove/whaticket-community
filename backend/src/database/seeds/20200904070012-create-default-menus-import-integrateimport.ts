/*eslint-disable */
import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
   const importation: any = await queryInterface.sequelize.query(
      'SELECT id FROM whaticket.Menus WHERE name="Importation" and isParent=true;'
    );

    return await queryInterface.bulkInsert(
      "Menus",
      [
        {
          name: "File Import",
          icon: "ArchiveIcon",
          parentId: importation[0][0].id,
          isParent: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "Integrated Import",
          icon: "LanguageIcon",
          parentId: importation[0][0].id,
          isParent: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
      ],
      {}
    );
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("MenuCompanies", {});
  }
};
