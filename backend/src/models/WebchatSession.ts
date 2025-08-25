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
import Ticket from "./Ticket";

@Table
class WebchatSession extends Model<WebchatSession> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Column
  sessionId: string;

  @Default(true)
  @Column
  isActive: boolean;

  @Column(DataType.DATE)
  lastActivity: Date;

  @Column(DataType.JSON)
  metadata: {
    userAgent?: string;
    ip?: string;
    referrer?: string;
    country?: string;
    city?: string;
    browserName?: string;
    browserVersion?: string;
    osName?: string;
    deviceType?: string;
  };

  @Column(DataType.JSON)
  visitorInfo: {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    customFields?: Record<string, any>;
  };

  @Column
  widgetId: string;

  @Column(DataType.TEXT)
  currentUrl: string;

  @Column(DataType.TEXT)
  pageTitle: string;

  @Default(0)
  @Column
  messageCount: number;

  @Column(DataType.DATE)
  firstMessageAt: Date;

  @Column(DataType.DATE)
  lastMessageAt: Date;

  @Column(DataType.DATE)
  endedAt: Date;

  @Column
  endReason: string;

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

  @ForeignKey(() => Ticket)
  @Column
  ticketId: number;

  @BelongsTo(() => Ticket)
  ticket: Ticket;
}

export default WebchatSession;