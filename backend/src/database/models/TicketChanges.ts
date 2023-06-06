import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import Ticket from "./Ticket";
import Queue from "./Queue";
import Company from "./Company";
import User from "./User";

@Table
class TicketChanges extends Model<TicketChanges> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Ticket)
  @Column
  ticketId: number;

  @BelongsTo(() => Ticket)
  ticket: Ticket;

  @ForeignKey(() => User)
  @Column
  oldUserId: number;

  @BelongsTo(() => User, "oldUserId")
  oldUser: User;

  @ForeignKey(() => User)
  @Column
  newUserId: number;

  @BelongsTo(() => User, "newUserId")
  newUser: User;

  @ForeignKey(() => Queue)
  @Column
  oldQueueId: number;

  @BelongsTo(() => Queue, "oldQueueId")
  oldQueue: Queue;

  @ForeignKey(() => Queue)
  @Column
  newQueueId: number;

  @BelongsTo(() => Queue, "newQueueId")
  newQueue: Queue;

  @Column
  oldStatus: string;

  @Column
  newStatus: string;

  @Column
  change: string;

  @Column
  observation: string;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @UpdatedAt
  @Column
  updatedAt: Date;

  @CreatedAt
  @Column
  createdAt: Date;
}

export default TicketChanges;
