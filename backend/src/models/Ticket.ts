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
  Default
} from "sequelize-typescript";
import Contact from "./Contact.js";
import Message from "./Message.js";
import User from "./User.js";
import Whatsapp from "./Whatsapp.js";
import Queue from "./Queue.js";
import Company from "./Company.js";
import Tag from "./Tag.js";
import TicketTag from "./TicketTag.js";
import { BelongsToMany } from "sequelize-typescript";

@Table({ tableName: "Tickets" })
class Ticket extends Model<Ticket> {
  @Column({ defaultValue: "pending" })
  status: string;

  @Column
  unreadMessages: number;

  @Column
  lastMessage: string;

  @Column
  isGroup: boolean;

  @Column
  isActiveDemand: boolean;

  @Column
  channel: string;

  @Column(DataType.UUID)
  @Default(DataType.UUIDV4)
  uuid: string;

  @Column(DataType.DECIMAL(10, 2))
  amount: number;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @ForeignKey(() => Whatsapp)
  @Column
  whatsappId: number;

  @ForeignKey(() => Queue)
  @Column
  queueId: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => Contact)
  contact: Contact;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Whatsapp)
  whatsapp: Whatsapp;

  @BelongsTo(() => Queue)
  queue: Queue;

  @BelongsTo(() => Company)
  company: Company;

  @HasMany(() => Message)
  messages: Message[];

  @BelongsToMany(() => Tag, () => TicketTag)
  tags: Tag[];
}

export default Ticket;
