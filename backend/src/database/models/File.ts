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
  ForeignKey,
  Default
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
  QtdeRegister: number;

  @Default(0)
  @Column
  Status: number;

  @CreatedAt
  CreatedAt: Date;

  @Column
  official: boolean;

  @AllowNull(true)
  @Column
  approvedOrRefusedId: number;

  @Column
  approvedAt: Date;

  @Column
  refusedAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => User)
  @Column
  ownerid: number;
}

export default File;
