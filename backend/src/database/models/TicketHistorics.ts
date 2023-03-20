import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  BeforeCreate,
  BeforeUpdate,
  PrimaryKey,
  AutoIncrement,
  Default,
  HasMany,
  BelongsToMany,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import { hash, compare } from "bcryptjs";
import Ticket from "./Ticket";
import Queue from "./Queue";
import UserQueue from "./UserQueue";
import Company from "./Company";
import Profiles from "./Profiles";
import User from "./User";

@Table
class TicketHistorics extends Model<TicketHistorics> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

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

  @ForeignKey(() => Queue)
  @Column
  queueId: number;

  @BelongsTo(() => Queue)
  queue: Queue;

  @Column
  status: string;

  @Column
  finalizedAt: Date;

  @Column
  transferedAt: Date;

  @Column
  reopenedAt: Date;

  @Column
  acceptedAt: Date;

  @Column
  ticketUpdatedAt: Date;

  @Column
  ticketCreatedAt: Date;

  @UpdatedAt
  @Column
  updatedAt: Date;

  @CreatedAt
  @Column
  createdAt: Date;
}

export default TicketHistorics;
