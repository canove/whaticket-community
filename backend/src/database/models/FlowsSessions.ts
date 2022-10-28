import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  ForeignKey,
  AutoIncrement
} from "sequelize-typescript";
import Company from "./Company";
import Flows from "./Flows";

@Table
class FlowsSessions extends Model<FlowsSessions> {
  @PrimaryKey
  @AutoIncrement
  @Column
  uniqueId: number;

  @Column
  id: string;

  @Column
  nodeId: string;

  @Column
  variables: string;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @ForeignKey(() => Flows)
  @Column
  flowId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default FlowsSessions;
