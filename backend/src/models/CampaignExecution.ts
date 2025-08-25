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
import Contact from "./Contact";
import Tenant from "./Tenant";

export enum CampaignExecutionStatus {
  PENDING = "pending",
  SENDING = "sending", 
  SENT = "sent",
  DELIVERED = "delivered",
  READ = "read",
  FAILED = "failed",
  CANCELLED = "cancelled"
}

@Table
class CampaignExecution extends Model<CampaignExecution> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Default(CampaignExecutionStatus.PENDING)
  @Column(DataType.ENUM(...Object.values(CampaignExecutionStatus)))
  status: CampaignExecutionStatus;

  @Column(DataType.DATE)
  sentAt: Date;

  @Column(DataType.DATE)
  deliveredAt: Date;

  @Column(DataType.DATE)
  readAt: Date;

  @Column(DataType.TEXT)
  errorMessage: string;

  @Column(DataType.TEXT)
  processedMessage: string;

  @Default(0)
  @Column
  retryCount: number;

  @Column(DataType.DATE)
  nextRetryAt: Date;

  @Column(DataType.JSON)
  metadata: {
    messageId?: string;
    externalId?: string;
    channel?: string;
    variables?: Record<string, any>;
  };

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @ForeignKey(() => require("./Campaign").default)
  @Column
  campaignId: number;

  @BelongsTo(() => require("./Campaign").default)
  campaign: any;

  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @BelongsTo(() => Contact)
  contact: Contact;

  @ForeignKey(() => Tenant)
  @Column
  tenantId: number;

  @BelongsTo(() => Tenant)
  tenant: Tenant;
}

export default CampaignExecution;