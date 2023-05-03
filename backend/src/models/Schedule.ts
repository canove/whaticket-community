import {
  AutoIncrement,
  BelongsToMany,
  Column,
  CreatedAt,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
  Unique,
  UpdatedAt
} from "sequelize-typescript";

import Contact from "./Contact";
import ScheduleContact from "./ScheduleContact";

@Table
class Schedule extends Model<Schedule> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Unique
  @Column
  name: string;

  @Column
  date: string;

  @Default(false)
  @Column
  sent: boolean;

  @Column(DataType.TEXT)
  body: string;

  @Column
  mediaType: string;

  @CreatedAt
  @Column(DataType.DATE(6))
  createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE(6))
  updatedAt: Date;

  @BelongsToMany(() => Contact, () => ScheduleContact)
  contacts: Contact[];
}

export default Schedule;
