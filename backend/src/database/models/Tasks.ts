import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  HasMany,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import Company from "./Company";
import User from "./User";
import Ticket from "./Ticket";

@Table
class Tasks extends Model<Tasks> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  description: string;

  @Column
  dueDate: Date;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Ticket)
  @Column
  ticketId: number;

  @BelongsTo(() => Ticket)
  ticket: Ticket;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @Column
  finalizedAt: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default Tasks;
