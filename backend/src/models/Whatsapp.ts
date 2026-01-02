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
  BelongsToMany,
  Default
} from "sequelize-typescript";
import Ticket from "./Ticket.js";
import Queue from "./Queue.js";
import WhatsappQueue from "./WhatsappQueue.js";
import Company from "./Company.js";

@Table({ tableName: "Whatsapps" })
class Whatsapp extends Model<Whatsapp> {
  @Column
  name: string;

  @Column(DataType.TEXT)
  session: string;

  @Column(DataType.TEXT)
  qrcode: string;

  @Column
  status: string;

  @Column
  battery: string;

  @Column
  plugged: boolean;

  @Column
  retries: number;

  @Column(DataType.TEXT)
  greetingMessage: string;

  @Column(DataType.TEXT)
  farewellMessage: string;

  @Column
  isDefault: boolean;

  @Default(false)
  @Column
  isMultidevice: boolean;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => Company)
  company: Company;

  @HasMany(() => Ticket)
  tickets: Ticket[];

  @BelongsToMany(() => Queue, () => WhatsappQueue)
  queues: Queue[];
}

export default Whatsapp;
