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
import FileRegister from "./FileRegister";

@Table
class BatchIntegrations extends Model<BatchIntegrations> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  batchId: string;

  @Column
  batchQuantity: number;

  @Column
  processedQuantity: number;

  @Column
  isBillet: boolean;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @HasMany(() => FileRegister, "batchId")
  registers: FileRegister[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default BatchIntegrations;
