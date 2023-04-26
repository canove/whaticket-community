import {
  Column,
  CreatedAt,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt
} from "sequelize-typescript";

import Contact from "./Contact";
import Ticket from "./Ticket";

@Table
class Schedule extends Model<Schedule> {
  @PrimaryKey
  @Column
  id: string;

  @Default(0)
  @Column
  ack: number;

  @Default(false)
  @Column
  sent: boolean;

  @Column(DataType.TEXT)
  body: string;

  @Column(DataType.STRING)
  get mediaUrl(): string | null {
    if (this.getDataValue("mediaUrl")) {
      return `${process.env.BACKEND_URL}:${
        process.env.PROXY_PORT
      }/public/${this.getDataValue("mediaUrl")}`;
    }
    return null;
  }

  @Column
  mediaType: string;

  @CreatedAt
  @Column(DataType.DATE(6))
  createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE(6))
  updatedAt: Date;

  @ForeignKey(() => Ticket)
  @Column
  ticketId: number;

  @HasMany(() => Contact)
  contactsId: number[];
}

export default Schedule;
