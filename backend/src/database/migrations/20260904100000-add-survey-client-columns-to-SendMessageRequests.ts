import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const table = await queryInterface.describeTable("SendMessageRequests") as any;

    const addSurveyName = table.surveyName
      ? Promise.resolve()
      : queryInterface.addColumn("SendMessageRequests", "surveyName", {
          type: DataTypes.TEXT,
          allowNull: true,
          defaultValue: null
        });

    const addClassification = table.classification
      ? Promise.resolve()
      : queryInterface.addColumn("SendMessageRequests", "classification", {
          type: DataTypes.TEXT,
          allowNull: true,
          defaultValue: null
        });

    const addClientName = table.clientName
      ? Promise.resolve()
      : queryInterface.addColumn("SendMessageRequests", "clientName", {
          type: DataTypes.TEXT,
          allowNull: true,
          defaultValue: null
        });

    const addClientPhone = table.clientPhone
      ? Promise.resolve()
      : queryInterface.addColumn("SendMessageRequests", "clientPhone", {
          type: DataTypes.TEXT,
          allowNull: true,
          defaultValue: null
        });

    return Promise.all([addSurveyName, addClassification, addClientName, addClientPhone]);
  },

  down: async (queryInterface: QueryInterface) => {
    const table = await queryInterface.describeTable("SendMessageRequests") as any;

    const removeSurveyName = table.surveyName
      ? queryInterface.removeColumn("SendMessageRequests", "surveyName")
      : Promise.resolve();

    const removeClassification = table.classification
      ? queryInterface.removeColumn("SendMessageRequests", "classification")
      : Promise.resolve();

    const removeClientName = table.clientName
      ? queryInterface.removeColumn("SendMessageRequests", "clientName")
      : Promise.resolve();

    const removeClientPhone = table.clientPhone
      ? queryInterface.removeColumn("SendMessageRequests", "clientPhone")
      : Promise.resolve();

    return Promise.all([removeSurveyName, removeClassification, removeClientName, removeClientPhone]);
  }
};
