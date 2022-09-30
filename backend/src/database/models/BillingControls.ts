import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey
} from "sequelize-typescript";
import Billings from "./Billings";
import Company from "./Company";

@Table
class BillingControls extends Model<BillingControls> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @Column
  quantity: number;

  @Column
  triggerFee: number;

  @ForeignKey(() => Billings)
  @Column
  billingId: number;

  @Column
  processedAt: Date;

  @Column
  usedGraceTriggers: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default BillingControls;
