import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  ForeignKey,
  CreatedAt,
  UpdatedAt,
  BelongsTo
} from "sequelize-typescript";
import User from "./User";
import Queue from "./Queue";
import { DataTypes } from "sequelize";

@Table
class Distribution extends Model<Distribution> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Column(DataTypes.JSON)
  users: object;

  @AllowNull(false)
  @ForeignKey(() => Queue)
  @Column
  queueId: number;

  @BelongsTo(() => Queue)
  queue: Queue;

  @AllowNull(true)
  @ForeignKey(() => User)
  @Column(DataTypes.INTEGER)
  currentUserId: number | null;

  @BelongsTo(() => User,  "currentUserId")
  currentUser: User;

  @AllowNull(false)
  @Column
  isActive: boolean;

  @CreatedAt
  @Column
  createdAt: Date;

  @UpdatedAt
  @Column
  updatedAt: Date;
}

export default Distribution;