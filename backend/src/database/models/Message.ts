import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  PrimaryKey,
  Default,
  BelongsTo,
  ForeignKey,
  HasOne
} from "sequelize-typescript";
import Contact from "./Contact";
import FileRegister from "./FileRegister";
import Ticket from "./Ticket";
import User from "./User";

@Table
class Message extends Model<Message> {
  @PrimaryKey
  @Column
  id: string;

  @Default(0)
  @Column
  ack: number;

  @Default(false)
  @Column
  read: boolean;

  @Default(false)
  @Column
  fromMe: boolean;

  @Column(DataType.TEXT)
  body: string;

  @Column(DataType.STRING)
  mediaUrl: string;

  @Column
  mediaType: string;

  @Default(false)
  @Column
  isDeleted: boolean;

  @Column
  author: string;

  @CreatedAt
  @Column(DataType.DATE(6))
  createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE(6))
  updatedAt: Date;

  @ForeignKey(() => Message)
  @Column
  quotedMsgId: string;

  @Column
  responseTime: number;

  @BelongsTo(() => Message, "quotedMsgId")
  quotedMsg: Message;

  @ForeignKey(() => Ticket)
  @Column
  ticketId: number;

  @BelongsTo(() => Ticket)
  ticket: Ticket;

  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Contact, "contactId")
  contact: Contact;

  @HasOne(() => FileRegister, "msgWhatsId")
  fileRegister: FileRegister

  @Column
  billingProcessedAt: Date

  @Column
  footer: string

  // Para Relatório
  lastMessage: string;
}

export default Message;
