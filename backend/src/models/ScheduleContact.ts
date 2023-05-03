import {
  Column,
  CreatedAt,
  ForeignKey,
  Model,
  Table,
  UpdatedAt
} from "sequelize-typescript";
import Contact from "./Contact";
import Schedule from "./Schedule";

@Table
class ScheduleContact extends Model<ScheduleContact> {
  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @ForeignKey(() => Schedule)
  @Column
  scheduleId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default ScheduleContact;
