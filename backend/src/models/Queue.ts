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
  BelongsToMany
} from "sequelize-typescript";
import Ticket from "./Ticket.js";
import User from "./User.js";
import Company from "./Company.js";
import Whatsapp from "./Whatsapp.js";
import WhatsappQueue from "./WhatsappQueue.js";
import UserQueue from "./UserQueue.js";

@Table({ tableName: "Queues" })
class Queue extends Model<Queue> {
  @Column
  name: string;

  @Column
  color: string;

  @Column
  greetingMessage: string;

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

  @BelongsToMany(() => Whatsapp, () => WhatsappQueue)
  whatsapps: Whatsapp[];

  @BelongsToMany(() => User, () => UserQueue)
  users: User[];
}

export default Queue;
