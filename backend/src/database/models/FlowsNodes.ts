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
class FlowsNodes extends Model<FlowsNodes> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Flows)
  @Column
  flowId: number;

  @BelongsTo(() => Flows)
  flow: Flows;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @Column
  json: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default FlowsNodes;
