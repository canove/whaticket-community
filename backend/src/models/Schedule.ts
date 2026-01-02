import {
  Table,
  Column,
  Model,
  CreatedAt,
  UpdatedAt,
  DataType,
  BelongsTo,
  ForeignKey
} from "sequelize-typescript";
import Contact from "./Contact.js";
import Ticket from "./Ticket.js";
import User from "./User.js";
import Company from "./Company.js";

@Table({ tableName: "Schedules" })
class Schedule extends Model<Schedule> {
  @Column(DataType.TEXT)
  body: string;

  @Column
  sendAt: Date;

  @Column
  sentAt: Date;

  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @ForeignKey(() => Ticket)
  @Column
  ticketId: number;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @Column
  status: string;

  @Column
  recurrenceType: string; // daily, weekly, monthly

  @Column
  repeatEvery: number;

  @Column
  endDate: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => Contact)
  contact: Contact;

  @BelongsTo(() => Ticket)
  ticket: Ticket;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Company)
  company: Company;
}

export default Schedule;
