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
  BelongsTo,
  HasMany
} from "sequelize-typescript";
import Tenant from "./Tenant";
import User from "./User";

export enum CampaignType {
  INSTANT = "instant",
  SCHEDULED = "scheduled",
  RECURRING = "recurring"
}

export enum CampaignStatus {
  DRAFT = "draft",
  SCHEDULED = "scheduled",
  RUNNING = "running",
  PAUSED = "paused",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  FAILED = "failed"
}

@Table
class Campaign extends Model<Campaign> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Column
  name: string;

  @Column(DataType.TEXT)
  description: string;

  @AllowNull(false)
  @Default(CampaignType.INSTANT)
  @Column(DataType.ENUM(...Object.values(CampaignType)))
  type: CampaignType;

  @AllowNull(false)
  @Default(CampaignStatus.DRAFT)
  @Column(DataType.ENUM(...Object.values(CampaignStatus)))
  status: CampaignStatus;

  @Column(DataType.JSON)
  targetAudience: {
    contactIds?: number[];
    tags?: string[];
    filters?: any;
  };

  @AllowNull(false)
  @Column(DataType.TEXT)
  messageTemplate: string;

  @Column(DataType.DATE)
  scheduledAt: Date;

  @Column(DataType.DATE)
  startedAt: Date;

  @Column(DataType.DATE)
  completedAt: Date;

  @Column(DataType.JSON)
  recurringConfig: {
    frequency?: 'daily' | 'weekly' | 'monthly';
    interval?: number;
    endDate?: Date;
  };

  @Column(DataType.JSON)
  statistics: {
    totalContacts?: number;
    sent?: number;
    delivered?: number;
    failed?: number;
    pending?: number;
  };

  @Default(1)
  @Column
  messagesPerSecond: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @ForeignKey(() => Tenant)
  @Column
  tenantId: number;

  @BelongsTo(() => Tenant)
  tenant: Tenant;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @HasMany(() => require("./CampaignExecution").default)
  executions: any[];
}

export default Campaign;