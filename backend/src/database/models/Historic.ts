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
  actionType: string;

  @Column
  systemChange: number;

  @Column
  registerId: number;

  @BelongsTo(() => User)
  user: User;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default Historic;
