import {
  Table,
  Column,
  Model,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import Contact from "./Contact.js";

@Table({ tableName: "ContactCustomFields" })
class ContactCustomField extends Model<ContactCustomField> {
  @Column
  name: string;

  @Column
  value: string;

  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => Contact)
  contact: Contact;
}

export default ContactCustomField;
