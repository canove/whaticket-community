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
  HasMany,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import ContactCustomField from "./ContactCustomField";
import Ticket from "./Ticket";
import Tenant from "./Tenant";

@Table
class Contact extends Model<Contact> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @AllowNull(false)
  @Unique
  @Column
  number: string;

  @AllowNull(false)
  @Default("")
  @Column
  email: string;

  @Column
  profilePicUrl: string;

  @Default(false)
  @Column
  isGroup: boolean;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @HasMany(() => Ticket)
  tickets: Ticket[];

  @HasMany(() => ContactCustomField)
  extraInfo: ContactCustomField[];

  @ForeignKey(() => Tenant)
  @Column
  tenantId: number;

  @BelongsTo(() => Tenant)
  tenant: Tenant;
}

export default Contact;
