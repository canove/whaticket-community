import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  HasMany,
  AutoIncrement,
  AfterFind,
  BeforeUpdate,
  Default
} from "sequelize-typescript";

import Contact from "./Contact";
import Message from "./Message";
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

  @Column(DataType.VIRTUAL)
  unreadMessages: number;

  @Column
  lastMessage: string;

  @Default(false)
  @Column
  isGroup: boolean;

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

  @HasMany(() => Message)
  messages: Message[];

  @AfterFind
  static async countTicketsUnreadMessages(tickets: Ticket[]): Promise<void> {
    if (tickets && tickets.length > 0) {
      await Promise.all(
        tickets.map(async ticket => {
          ticket.unreadMessages = await Message.count({
            where: { ticketId: ticket.id, read: false }
          });
        })
      );
    }
  }

  @BeforeUpdate
  static async countTicketUnreadMessags(ticket: Ticket): Promise<void> {
    ticket.unreadMessages = await Message.count({
      where: { ticketId: ticket.id, read: false }
    });
  }
}

export default Ticket;
