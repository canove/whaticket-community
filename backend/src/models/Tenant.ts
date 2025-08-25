import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Unique,
  Default,
  DataType,
  HasMany
} from "sequelize-typescript";
import User from "./User";
import Contact from "./Contact";
import Ticket from "./Ticket";
import Message from "./Message";
import Queue from "./Queue";
import QuickAnswer from "./QuickAnswer";
import Whatsapp from "./Whatsapp";

@Table
class Tenant extends Model<Tenant> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Column
  name: string;

  @Unique
  @AllowNull(true)
  @Column
  domain: string;

  @AllowNull(false)
  @Default("basic")
  @Column
  planId: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  settings: string;

  @AllowNull(false)
  @Default("active")
  @Column(DataType.ENUM("active", "inactive", "suspended"))
  status: string;

  @AllowNull(false)
  @Default(10)
  @Column
  maxUsers: number;

  @AllowNull(false)
  @Default(1)
  @Column
  maxWhatsapps: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @HasMany(() => User)
  users: User[];

  @HasMany(() => Contact)
  contacts: Contact[];

  @HasMany(() => Ticket)
  tickets: Ticket[];

  @HasMany(() => Message)
  messages: Message[];

  @HasMany(() => Queue)
  queues: Queue[];

  @HasMany(() => QuickAnswer)
  quickAnswers: QuickAnswer[];

  @HasMany(() => Whatsapp)
  whatsapps: Whatsapp[];

  get settingsObj(): any {
    try {
      return JSON.parse(this.settings || "{}");
    } catch {
      return {};
    }
  }

  set settingsObj(value: any) {
    this.settings = JSON.stringify(value || {});
  }
}

export default Tenant;