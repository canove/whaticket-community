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
import Company from "./Company";
import User from "./User";
import Whatsapp from "./Whatsapp";

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
  whatsappIds: string;

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

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => User)
  @Column
  ownerid: number;
}

export default File;
