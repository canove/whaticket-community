import { QueryInterface } from "sequelize";

module.exports = {
    up: async (queryInterface: QueryInterface) => {
        // 1. Drop existing index if it exists (to avoid conflicts during alteration)
        try {
            await queryInterface.removeIndex("Messages", "idx_messages_body_fulltext");
        } catch (e) {
            // Ignore if index doesn't exist
        }

        // 2. Change collation of body column to utf8mb4_general_ci (Case/Accent Insensitive)
        // We use raw query to ensure we can modify the column type and collation correctly
        await queryInterface.sequelize.query(
            "ALTER TABLE Messages MODIFY body TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"
        );

        // 3. Add FULLTEXT index
        await queryInterface.addIndex("Messages", ["body"], {
            name: "idx_messages_body_fulltext",
            type: "FULLTEXT",
        });
    },

    down: async (queryInterface: QueryInterface) => {
        await queryInterface.removeIndex("Messages", "idx_messages_body_fulltext");

        // Revert collation (assuming default was utf8mb4_bin from database config)
        await queryInterface.sequelize.query(
            "ALTER TABLE Messages MODIFY body TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;"
        );
    },
};
