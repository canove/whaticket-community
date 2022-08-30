import { QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.bulkInsert(
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
          name: "Official Connections",
          icon: "SyncAltIcon",
          parentId: 2,
          isParent: false,
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
          name: "Connections",
          icon: "SyncAltIcon",
          parentId: 4,
          isParent: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "Whats Config",
          icon: "SettingsOutlinedIcon",
          parentId: 4,
          isParent: false,
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
        },
        {
          name: "Users",
          icon: "PeopleAltOutlinedIcon",
          parentId: 12,
          isParent: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "Company",
          icon: "ApartmentIcon",
          parentId: 12,
          isParent: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "Queues",
          icon: "AccountTreeOutlinedIcon",
          parentId: 12,
          isParent: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "Settings",
          icon: "SettingsOutlinedIcon",
          parentId: 12,
          isParent: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "Reports",
          icon: "EqualizerIcon",
          parentId: 12,
          isParent: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "Reports",
          icon: "AssessmentOutlinedIcon",
          parentId: 16,
          isParent: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "Reports Ticket",
          icon: "AssessmentOutlinedIcon",
          parentId: 16,
          isParent: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "Registers Reports",
          icon: "AssessmentOutlinedIcon",
          parentId: 16,
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
