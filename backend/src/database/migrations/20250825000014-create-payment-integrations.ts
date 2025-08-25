import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("PaymentIntegrations", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      provider: {
        type: DataTypes.ENUM("asaas", "paghiper"),
        allowNull: false
      },
      externalId: {
        type: DataTypes.STRING,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM(
          "pending", "confirmed", "received", "overdue", "refunded", 
          "received_in_cash", "refund_requested", "refund_in_progress", 
          "chargeback_requested", "chargeback_dispute", "awaiting_chargeback_reversal",
          "dunning_requested", "dunning_received", "awaiting_risk_analysis"
        ),
        allowNull: false,
        defaultValue: "pending"
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true
      },
      dueDate: {
        type: DataTypes.DATE,
        allowNull: true
      },
      paymentMethod: {
        type: DataTypes.ENUM("boleto", "credit_card", "pix", "debit_card", "transfer"),
        allowNull: true
      },
      paymentUrl: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      boletoUrl: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      pixCode: {
        type: DataTypes.STRING,
        allowNull: true
      },
      pixQrCode: {
        type: DataTypes.STRING,
        allowNull: true
      },
      paymentDate: {
        type: DataTypes.DATE,
        allowNull: true
      },
      netValue: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      fees: {
        type: DataTypes.JSON,
        allowNull: true
      },
      externalData: {
        type: DataTypes.JSON,
        allowNull: true
      },
      customer: {
        type: DataTypes.JSON,
        allowNull: true
      },
      webhookResponse: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      lastSyncAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Tenants",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      contactId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Contacts",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("PaymentIntegrations");
  }
};