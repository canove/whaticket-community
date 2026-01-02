import {
  Table,
  Column,
  Model,
  CreatedAt,
  UpdatedAt,
  DataType,
  BelongsTo,
  ForeignKey,
  Default
} from "sequelize-typescript";
import Ticket from "./Ticket.js";
import Contact from "./Contact.js";
import Company from "./Company.js";

@Table({ tableName: "Messages" })
class Message extends Model<Message> {
  @Column(DataType.TEXT)
  body: string;

  @Column
  ack: number;

  @Column
  read: boolean;

  @Column
  mediaType: string;

  @Column
  mediaUrl: string;

  @Default(false)
  @Column
  isRecorded: boolean;

  @Column
  remoteJid: string; // WhatsApp ID (e.g. 3EB0...)

  @ForeignKey(() => Message)
  @Column
  quotedMsgId: number;

  @ForeignKey(() => Ticket)
  @Column
  ticketId: number;

  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => Ticket)
  ticket: Ticket;

  @BelongsTo(() => Contact)
  contact: Contact;

  @BelongsTo(() => Message)
  quotedMsg: Message;

  @BelongsTo(() => Company)
  company: Company;
}

export default Message;
