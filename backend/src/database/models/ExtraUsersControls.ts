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
} from "sequelize-typescript";
import Company from "./Company";

@Table
class ExtraUsersControls extends Model<ExtraUsersControls> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;
  
  @Column
  extraUsers: number;

  @Column
  canceledUsers: number;

  @Column
  processedAt: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;
}

export default ExtraUsersControls;
