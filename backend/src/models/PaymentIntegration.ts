import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Default,
  DataType,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import Tenant from "./Tenant";
import Contact from "./Contact";

export enum PaymentProvider {
  ASAAS = "asaas",
  PAGHIPER = "paghiper"
}

export enum PaymentStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  RECEIVED = "received",
  OVERDUE = "overdue",
  REFUNDED = "refunded",
  RECEIVED_IN_CASH = "received_in_cash",
  REFUND_REQUESTED = "refund_requested",
  REFUND_IN_PROGRESS = "refund_in_progress",
  CHARGEBACK_REQUESTED = "chargeback_requested",
  CHARGEBACK_DISPUTE = "chargeback_dispute",
  AWAITING_CHARGEBACK_REVERSAL = "awaiting_chargeback_reversal",
  DUNNING_REQUESTED = "dunning_requested",
  DUNNING_RECEIVED = "dunning_received",
  AWAITING_RISK_ANALYSIS = "awaiting_risk_analysis"
}

export enum PaymentMethod {
  BOLETO = "boleto",
  CREDIT_CARD = "credit_card",
  PIX = "pix",
  DEBIT_CARD = "debit_card",
  TRANSFER = "transfer"
}

@Table
class PaymentIntegration extends Model<PaymentIntegration> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(PaymentProvider)))
  provider: PaymentProvider;

  @AllowNull(false)
  @Column
  externalId: string;

  @AllowNull(false)
  @Default(PaymentStatus.PENDING)
  @Column(DataType.ENUM(...Object.values(PaymentStatus)))
  status: PaymentStatus;

  @AllowNull(false)
  @Column(DataType.DECIMAL(10, 2))
  amount: number;

  @Column
  description: string;

  @Column(DataType.DATE)
  dueDate: Date;

  @Column(DataType.ENUM(...Object.values(PaymentMethod)))
  paymentMethod: PaymentMethod;

  @Column(DataType.TEXT)
  paymentUrl: string;

  @Column(DataType.TEXT)
  boletoUrl: string;

  @Column
  pixCode: string;

  @Column
  pixQrCode: string;

  @Column(DataType.DATE)
  paymentDate: Date;

  @Column(DataType.DECIMAL(10, 2))
  netValue: number;

  @Column(DataType.JSON)
  fees: {
    total?: number;
    gateway?: number;
    transfer?: number;
  };

  @Column(DataType.JSON)
  externalData: Record<string, any>;

  @Column(DataType.JSON)
  customer: {
    name?: string;
    email?: string;
    phone?: string;
    cpfCnpj?: string;
  };

  @Column(DataType.TEXT)
  webhookResponse: string;

  @Column(DataType.DATE)
  lastSyncAt: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @ForeignKey(() => Tenant)
  @Column
  tenantId: number;

  @BelongsTo(() => Tenant)
  tenant: Tenant;

  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @BelongsTo(() => Contact)
  contact: Contact;
}

export default PaymentIntegration;