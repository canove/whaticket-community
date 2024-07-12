import {
  AutoIncrement,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt
} from "sequelize-typescript";
import Ticket from "./Ticket";
import User from "./User";

@Table
class TicketLog extends Model<TicketLog> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @CreatedAt
  @Column(DataType.DATE(6))
  createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE(6))
  updatedAt: Date;

  @ForeignKey(() => Ticket)
  @Column
  ticketId: number;

  @BelongsTo(() => Ticket)
  ticket: Ticket;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => User)
  @Column
  newUserId: number;

  @BelongsTo(() => User)
  newUser: User;

  @Column
  logType: string;

  @Column
  ticketStatus: string;
}

export default TicketLog;
