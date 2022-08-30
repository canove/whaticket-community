import { QueryInterface } from "sequelize";

interface IdObject {
  id?: string | number;
}

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkInsert(
      "Menus",
      [
        {
          name: "Dashboard",
          icon: "DashboardOutlinedIcon",
          parentId: null,
          isParent: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "WhatsApp",
          icon: "WhatsAppIcon",
          parentId: null,
          isParent: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "WhatsApp 2",
          icon: "WhatsAppIcon",
          parentId: null,
          isParent: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "Templates",
          icon: "DvrIcon",
          parentId: null,
          isParent: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "Tickets",
          icon: "ChatIcon",
          parentId: null,
          isParent: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "Contacts",
          icon: "ContactPhoneOutlinedIcon",
          parentId: null,
          isParent: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "Quick Answers",
          icon: "QuestionAnswerOutlinedIcon",
          parentId: null,
          isParent: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "Importation",
          icon: "ImportExportOutlinedIcon",
          parentId: null,
          isParent: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "Administration",
          icon: "AccountCircleIcon",
          parentId: null,
          isParent: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    );

    const whatsApp: any = await queryInterface.sequelize.query(
      'SELECT id FROM whaticket.Menus WHERE name="WhatsApp" and isParent=true;'
    );

    await queryInterface.bulkInsert(
      "Menus",
      [
        {
          name: "Official Connections",
          icon: "SyncAltIcon",
          parentId: whatsApp[0][0].id,
          isParent: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    );

    const whatsApp2: any = await queryInterface.sequelize.query(
      'SELECT id FROM whaticket.Menus WHERE name="WhatsApp 2" and isParent=true;'
    );

    await queryInterface.bulkInsert(
      "Menus",
      [
        {
          name: "Connections",
          icon: "SyncAltIcon",
          parentId: whatsApp2[0][0].id,
          isParent: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "Whats Config",
          icon: "SettingsOutlinedIcon",
          parentId: whatsApp2[0][0].id,
          isParent: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    );

    const Administration: any = await queryInterface.sequelize.query(
      'SELECT id FROM whaticket.Menus WHERE name="Administration" and isParent=true;'
    );

    await queryInterface.bulkInsert(
      "Menus",
      [
        {
          name: "Users",
          icon: "PeopleAltOutlinedIcon",
          parentId: Administration[0][0].id,
          isParent: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "Company",
          icon: "ApartmentIcon",
          parentId: Administration[0][0].id,
          isParent: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "Menus",
          icon: "ListAltIcon",
          parentId: Administration[0][0].id,
          isParent: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "Queues",
          icon: "AccountTreeOutlinedIcon",
          parentId: Administration[0][0].id,
          isParent: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "Settings",
          icon: "SettingsOutlinedIcon",
          parentId: Administration[0][0].id,
          isParent: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "Reports",
          icon: "EqualizerIcon",
          parentId: Administration[0][0].id,
          isParent: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    );

    const Reports: any = await queryInterface.sequelize.query(
      'SELECT id FROM whaticket.Menus WHERE name="Reports" and isParent=true;'
    );

    // eslint-disable-next-line no-return-await
    return await queryInterface.bulkInsert(
      "Menus",
      [
        {
          name: "Reports",
          icon: "AssessmentOutlinedIcon",
          parentId: Reports[0][0].id,
          isParent: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "Reports Ticket",
          icon: "AssessmentOutlinedIcon",
          parentId: Reports[0][0].id,
          isParent: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "Registers Reports",
          icon: "AssessmentOutlinedIcon",
          parentId: Reports[0][0].id,
          isParent: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    );
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Menus", {});
  }
};
