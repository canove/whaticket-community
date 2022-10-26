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
  HasMany
} from "sequelize-typescript";
import Company from "./Company";
import FlowsNodes from "./FlowsNodes";

@Table
class Flows extends Model<Flows> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @AllowNull(false)
  @Column
  name: string;

  @Column
  status: string;

  @Column
  projectId: string;

  @Column
  agentId: string;

  @Column
  location: string;

  @Column
  clientEmail: string;

  @Column
  privateKey: string;

  @Column
  type: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default Flows;
