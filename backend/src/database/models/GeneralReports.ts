import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  Default
} from "sequelize-typescript";
import Company from "./Company";

@Table
class GeneralReports extends Model<GeneralReports> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;
  
  @Default(0)
  @Column
  imported: number;
  
  @Default(0)
  @Column
  sent: number;
  
  @Default(0)
  @Column
  delivered: number;
  
  @Default(0)
  @Column
  read: number;
  
  @Default(0)
  @Column
  error: number;
  
  @Default(0)
  @Column
  interaction: number;
  
  @Default(0)
  @Column
  noWhats: number;
  
  @Default(0)
  @Column
  sentMessages: number;
  
  @Default(0)
  @Column
  receivedMessages: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default GeneralReports;
