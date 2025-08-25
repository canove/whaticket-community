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
  DataType
} from "sequelize-typescript";

import Flow from "./Flow";

export type NodeType =
  | "send_text"
  | "send_media"
  | "wait_input"
  | "condition"
  | "webhook"
  | "ai_node"
  | "start"
  | "end";

@Table
class FlowNode extends Model<FlowNode> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Flow)
  @AllowNull(false)
  @Column
  flowId: number;

  @BelongsTo(() => Flow)
  flow: Flow;

  @Column
  nodeId: string;

  @AllowNull(false)
  @Column
  type: NodeType;

  @Column
  label: string;

  @Column(DataType.JSON)
  config: object;

  @Column(DataType.JSON)
  data: object;

  @Column(DataType.FLOAT)
  positionX: number;

  @Column(DataType.FLOAT)
  positionY: number;

  @Column
  sourcePosition: string;

  @Column
  targetPosition: string;

  @Column(DataType.FLOAT)
  width: number;

  @Column(DataType.FLOAT)
  height: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default FlowNode;
