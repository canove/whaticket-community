import {
  Table,
  Column,
  Model,
  CreatedAt,
  UpdatedAt,
  DataType,
  HasMany,
  BelongsTo,
  ForeignKey
} from "sequelize-typescript";
import ContactCustomField from "./ContactCustomField.js";
import Ticket from "./Ticket.js";
import Company from "./Company.js";
import User from "./User.js";

@Table({ tableName: "Contacts" })
class Contact extends Model<Contact> {
  @Column
  name: string;

  @Column(DataType.STRING)
  number: string;

  @Column(DataType.STRING)
  email: string;

  @Column
  profilePicUrl: string;

  @Column
  isGroup: boolean;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @ForeignKey(() => User)
  @Column
  walletId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @HasMany(() => ContactCustomField)
  extraInfo: ContactCustomField[];

  @HasMany(() => Ticket)
  tickets: Ticket[];

  @BelongsTo(() => Company)
  company: Company;

  @BelongsTo(() => User)
  wallet: User;
}

export default Contact;
