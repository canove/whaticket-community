import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  ForeignKey,
  AutoIncrement,
  PrimaryKey
} from "sequelize-typescript";
import Company from "./Company";
import User from "./User";

@Table
class UserCompany extends Model<UserCompany> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default UserCompany;
