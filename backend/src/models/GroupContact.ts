import {
  Column,
  CreatedAt,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt
} from "sequelize-typescript";
import Contact from "./Contact";
import Whatsapp from "./Whatsapp";

@Table
class GroupContact extends Model<GroupContact> {
  @ForeignKey(() => Contact)
  @PrimaryKey
  @Column
  groupContactId: number;

  @ForeignKey(() => Contact)
  @PrimaryKey
  @Column
  participantContactId: number;

  @ForeignKey(() => Whatsapp)
  @Column
  whatsappId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default GroupContact;
