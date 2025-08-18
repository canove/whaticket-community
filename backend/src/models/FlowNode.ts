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

  @AllowNull(false)
  @Column
  type: string;

  @Column(DataType.JSON)
  config: object;

  @Column(DataType.FLOAT)
  positionX: number;

  @Column(DataType.FLOAT)
  positionY: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default FlowNode;
