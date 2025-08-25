import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  ForeignKey,
  BelongsTo,
  DataType,
  Default
} from "sequelize-typescript";

import Flow from "./Flow";
import FlowNode from "./FlowNode";
import Contact from "./Contact";
import Ticket from "./Ticket";
import Tenant from "./Tenant";

export type ExecutionStatus = "active" | "completed" | "failed" | "paused";

@Table
class FlowExecution extends Model<FlowExecution> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Tenant)
  @AllowNull(false)
  @Column
  tenantId: number;

  @BelongsTo(() => Tenant)
  tenant: Tenant;

  @ForeignKey(() => Flow)
  @AllowNull(false)
  @Column
  flowId: number;

  @BelongsTo(() => Flow)
  flow: Flow;

  @ForeignKey(() => Contact)
  @AllowNull(false)
  @Column
  contactId: number;

  @BelongsTo(() => Contact)
  contact: Contact;

  @ForeignKey(() => Ticket)
  @Column
  ticketId: number;

  @BelongsTo(() => Ticket)
  ticket: Ticket;

  @AllowNull(false)
  @Default("active")
  @Column(DataType.ENUM("active", "completed", "failed", "paused"))
  status: ExecutionStatus;

  @ForeignKey(() => FlowNode)
  @Column
  currentNodeId: number;

  @BelongsTo(() => FlowNode)
  currentNode: FlowNode;

  @Column(DataType.JSON)
  variables: object;

  @Column(DataType.JSON)
  stepHistory: object[];

  @Column
  completedAt: Date;

  @Column
  failedAt: Date;

  @Column(DataType.TEXT)
  errorMessage: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default FlowExecution;