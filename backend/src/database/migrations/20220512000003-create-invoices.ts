import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
    up: (queryInterface: QueryInterface) => {
        return queryInterface.createTable("Invoices", {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },
            detail: {
                type: DataTypes.STRING,
            },
            status: {
                type: DataTypes.STRING,
            },
            value: {
                type: DataTypes.FLOAT
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false
            },
            dueDate: {
                type: DataTypes.STRING,
            },
            companyId: {
                type: DataTypes.INTEGER,
                references: { model: "Companies", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "CASCADE"
            }
        });
    },

    down: (queryInterface: QueryInterface) => {
        return queryInterface.dropTable("Invoices");
    }
};
