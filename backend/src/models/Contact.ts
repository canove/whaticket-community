import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Unique,
  Default
} from "sequelize-typescript";

@Table
class Contact extends Model<Contact> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column(DataType.STRING)
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

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default Contact;
