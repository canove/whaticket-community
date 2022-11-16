import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  ForeignKey
} from "sequelize-typescript";
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

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default NodeRegisters;
