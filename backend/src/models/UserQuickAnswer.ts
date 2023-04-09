import {
  Column,
  CreatedAt,
  ForeignKey,
  Model,
  Table,
  UpdatedAt
} from "sequelize-typescript";
import QuickAnswer from "./QuickAnswer";
import User from "./User";

@Table
class UserQuickAnswer extends Model<UserQuickAnswer> {
  @ForeignKey(() => User)
  @Column
  userId: number;

  @ForeignKey(() => QuickAnswer)
  @Column
  quickAnswerId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default UserQuickAnswer;
