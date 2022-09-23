import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
} from "sequelize-typescript";
import User from "./User";

@Table
class Historic extends Model<Historic> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => User)
  @Column
  createdBy: number;

  @Column
  currentJSON: string;

  @Column
  updatedJSON: string;

  @Column
  systemChange: number;

  @Column
  registerId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default Historic;
