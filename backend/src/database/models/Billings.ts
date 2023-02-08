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
import BillingControls from "./BillingControls";
import Company from "./Company";

@Table
class Billings extends Model<Billings> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @Column
  totalValue: number;

  @Column
  totalTriggerValue: number;

  @Column
  totalMonthValue: number;

  @Column
  totalSentMessageValue: number;

  @Column
  totalReceivedMessageValue: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => Company)
  company: Company;
}

export default Billings;
