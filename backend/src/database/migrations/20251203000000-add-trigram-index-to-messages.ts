import { QueryInterface } from "sequelize";

module.exports = {
    up: (queryInterface: QueryInterface) => {
        return queryInterface.addIndex("Messages", ["body"], {
            name: "idx_messages_body_fulltext",
            type: "FULLTEXT"
        });
    },

    down: (queryInterface: QueryInterface) => {
        return queryInterface.removeIndex("Messages", "idx_messages_body_fulltext");
    }
};
