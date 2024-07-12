import {
  AutoIncrement,
  BelongsTo,
  BelongsToMany,
  Column,
  CreatedAt,
  Default,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt
} from "sequelize-typescript";

import Category from "./Category";
import Contact from "./Contact";
import Message from "./Message";
import Queue from "./Queue";
import TicketCategory from "./TicketCategory";
import TicketHelpUser from "./TicketHelpUser";
import TicketParticipantUsers from "./TicketParticipantUsers";
import User from "./User";
import Whatsapp from "./Whatsapp";

@Table
class Ticket extends Model<Ticket> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column({ defaultValue: "pending" })
  status: string;

  @Column
  unreadMessages: number;

  @Column
  lastMessageTimestamp: number;

  @Column
  lastMessage: string;

  @Column
  privateNote: string;

  @Default(false)
  @Column
  isGroup: boolean;

  @Column
  userHadContact: boolean;

  @Column
  transferred: boolean;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @BelongsTo(() => Contact)
  contact: Contact;

  @ForeignKey(() => Whatsapp)
  @Column
  whatsappId: number;

  @BelongsTo(() => Whatsapp)
  whatsapp: Whatsapp;

  @ForeignKey(() => Queue)
  @Column
  queueId: number;

  @BelongsTo(() => Queue)
  queue: Queue;

  @HasMany(() => Message)
  messages: Message[];

  @HasMany(() => Message)
  firstClientMessageAfterLastUserMessage: Message[];

  @BelongsToMany(() => Category, () => TicketCategory)
  categories: Category[];

  @BelongsToMany(() => User, () => TicketHelpUser)
  helpUsers: User[];

  @BelongsToMany(() => User, () => TicketParticipantUsers)
  participantUsers: User[];
}

export default Ticket;
