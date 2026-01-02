import {
  Table,
  Column,
  Model,
  CreatedAt,
  UpdatedAt,
  DataType,
  HasMany,
  BelongsTo,
  ForeignKey,
  BelongsToMany
} from "sequelize-typescript";
import Ticket from "./Ticket.js";
import Queue from "./Queue.js";
import UserQueue from "./UserQueue.js";
import Company from "./Company.js";
import QuickAnswer from "./QuickAnswer.js";

@Table({ tableName: "Users" })
class User extends Model<User> {
  @Column
  name: string;

  @Column
  email: string;

  @Column
  passwordHash: string;

  @Column({ defaultValue: "admin" })
  profile: string;

  @Column
  tokenVersion: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => Company)
  company: Company;

  @HasMany(() => Ticket)
  tickets: Ticket[];

  @HasMany(() => QuickAnswer)
  quickAnswers: QuickAnswer[];

  @BelongsToMany(() => Queue, () => UserQueue)
  queues: Queue[];
}

export default User;
