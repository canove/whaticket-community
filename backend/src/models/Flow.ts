import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  HasMany,
  ForeignKey,
  BelongsTo,
  DataType,
  Default
} from "sequelize-typescript";

import FlowNode from "./FlowNode";
import Tenant from "./Tenant";

@Table
class Flow extends Model<Flow> {
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

  @AllowNull(false)
  @Column
  name: string;

  @Column(DataType.TEXT)
  description: string;

  @AllowNull(false)
  @Default(1)
  @Column
  version: number;

  @AllowNull(false)
  @Default("draft")
  @Column(DataType.ENUM("draft", "active", "archived"))
  status: "draft" | "active" | "archived";

  @AllowNull(false)
  @Default("manual")
  @Column(DataType.ENUM("keyword", "intent", "event", "manual"))
  triggerType: "keyword" | "intent" | "event" | "manual";

  @Column(DataType.JSON)
  triggerConfig: object;

  @AllowNull(false)
  @Default(false)
  @Column
  isActive: boolean;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @HasMany(() => FlowNode)
  nodes: FlowNode[];
}

export default Flow;
