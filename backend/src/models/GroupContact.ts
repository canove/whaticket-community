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
  @PrimaryKey
  @Column
  id: string;

  @ForeignKey(() => Contact)
  @Column
  groupContactId: number;

  @ForeignKey(() => Contact)
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
