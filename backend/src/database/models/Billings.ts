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

  @Column
  totalExtraUserValue: number;

  @Column
  totalExtraTicketValue: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => Company)
  company: Company;

  @Column
  totalInboundSessionValue: number;

  @Column
  totalOutboundSessionValue: number;

  @Column
  totalConnectedWhatsappsValue: number;
}

export default Billings;
