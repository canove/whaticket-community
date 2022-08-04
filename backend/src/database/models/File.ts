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
  BelongsTo,
  ForeignKey
} from "sequelize-typescript";
import User from "./User";

@Table
class File extends Model<File> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Unique
  @Column
  name: string;

  @Column
  url: string;

  @Column
  QtdeRegister: number

  @Column
  Status: number

  @CreatedAt
  CreatedAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => User)
  @Column
  ownerid: number;
}

export default File;
