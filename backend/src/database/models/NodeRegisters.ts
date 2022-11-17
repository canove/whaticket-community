import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import Company from "./Company";
import Flows from "./Flows";

@Table
class NodeRegisters extends Model<NodeRegisters> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  phoneNumber: string;

  @Column
  text: string;

  @Column
  response: string;

  @Column
  nodeId: string;

  @ForeignKey(() => Flows)
  @Column
  flowId: number;

  @BelongsTo(() => Flows)
  flow: Flows;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default NodeRegisters;
