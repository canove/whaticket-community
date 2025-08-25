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

export interface WebhookRetryConfig {
  maxRetries: number;
  retryDelays: number[]; // in milliseconds
  exponentialBackoff: boolean;
}

@Table
class Webhook extends Model<Webhook> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Column
  name: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  url: string;

  @AllowNull(false)
  @Column(DataType.JSON)
  events: string[];

  @Column
  secret: string;

  @Default(true)
  @Column
  isActive: boolean;

  @Column(DataType.JSON)
  retryConfig: WebhookRetryConfig;

  @Column(DataType.JSON)
  headers: Record<string, string>;

  @Default(30000) // 30 seconds
  @Column
  timeout: number;

  @Default(0)
  @Column
  successCount: number;

  @Default(0)
  @Column
  failureCount: number;

  @Column(DataType.DATE)
  lastDeliveryAt: Date;

  @Column(DataType.DATE)
  lastSuccessAt: Date;

  @Column(DataType.DATE)
  lastFailureAt: Date;

  @Column(DataType.TEXT)
  lastError: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @ForeignKey(() => Tenant)
  @Column
  tenantId: number;

  @BelongsTo(() => Tenant)
  tenant: Tenant;
}

export default Webhook;