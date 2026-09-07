import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const table = await queryInterface.describeTable("SendMessageRequests") as any;

    const addChannel = table.channel
      ? Promise.resolve()
      : queryInterface.addColumn("SendMessageRequests", "channel", {
          type: DataTypes.TEXT,
          allowNull: true,
          defaultValue: null
        });

    const addLocalId = table.localId
      ? Promise.resolve()
      : queryInterface.addColumn("SendMessageRequests", "localId", {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: null
        });

    const addRecipientName = table.recipientName
      ? Promise.resolve()
      : queryInterface.addColumn("SendMessageRequests", "recipientName", {
          type: DataTypes.TEXT,
          allowNull: true,
          defaultValue: null
        });

    const addNotificationType = table.notificationType
      ? Promise.resolve()
      : queryInterface.addColumn("SendMessageRequests", "notificationType", {
          type: DataTypes.TEXT,
          allowNull: true,
          defaultValue: null
        });

    return Promise.all([addChannel, addLocalId, addRecipientName, addNotificationType]);
  },

  down: async (queryInterface: QueryInterface) => {
    const table = await queryInterface.describeTable("SendMessageRequests") as any;

    const removeChannel = table.channel
      ? queryInterface.removeColumn("SendMessageRequests", "channel")
      : Promise.resolve();

    const removeLocalId = table.localId
      ? queryInterface.removeColumn("SendMessageRequests", "localId")
      : Promise.resolve();

    const removeRecipientName = table.recipientName
      ? queryInterface.removeColumn("SendMessageRequests", "recipientName")
      : Promise.resolve();

    const removeNotificationType = table.notificationType
      ? queryInterface.removeColumn("SendMessageRequests", "notificationType")
      : Promise.resolve();

    return Promise.all([removeChannel, removeLocalId, removeRecipientName, removeNotificationType]);
  }
};
