import {
  Table,
  Column,
  Model,
  CreatedAt,
  UpdatedAt,
  DataType,
  HasMany
} from "sequelize-typescript";
import User from "./User.js";

@Table({ tableName: "Companies" })
class Company extends Model<Company> {
  @Column
  name: string;

  @Column
  status: boolean;

  @Column
  planId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @HasMany(() => User)
  users: User[];
}

export default Company;
