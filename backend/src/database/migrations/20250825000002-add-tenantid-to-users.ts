import { QueryInterface, DataTypes, QueryTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface): Promise<void> => {
    return queryInterface.addColumn("Users", "tenantId", {
      type: DataTypes.INTEGER,
      allowNull: true, // Permite null temporariamente
      references: {
        model: "Tenants",
        key: "id"
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE"
    }).then(() => {
      // Verificar se tenant padrão já existe antes de inserir
      return queryInterface.sequelize.query(
        'SELECT id FROM Tenants WHERE id = 1',
        { type: QueryTypes.SELECT }
      ).then((result: any[]) => {
        if (result.length === 0) {
          // Inserir tenant padrão se não existir
          return queryInterface.bulkInsert("Tenants", [{
            id: 1,
            name: "Default Company",
            domain: null,
            planId: "basic",
            settings: JSON.stringify({}),
            status: "active",
            maxUsers: 50,
            maxWhatsapps: 5,
            createdAt: new Date(),
            updatedAt: new Date()
          }]);
        }
      });
    }).then(() => {
      // Atualizar registros existentes
      return queryInterface.sequelize.query(
        'UPDATE Users SET tenantId = 1 WHERE tenantId IS NULL'
      );
    }).then(() => {
      // Tornar coluna not null
      return queryInterface.changeColumn("Users", "tenantId", {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        references: {
          model: "Tenants",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      });
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Users", "tenantId");
  }
};