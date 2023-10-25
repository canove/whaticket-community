import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
    up: (queryInterface: QueryInterface) => {
        return queryInterface.changeColumn("Tickets", "lastMessage", {
            defaultValue: "",
            type: DataTypes.TEXT
        });
    },

    down: (queryInterface: QueryInterface) => {
        return queryInterface.changeColumn("Tickets", "lastMessage", {
            defaultValue: "",
            type: DataTypes.TEXT
        });
    }
};