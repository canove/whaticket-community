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
import File from "./File";

@Table
class FileRegister extends Model<FileRegister> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Unique
  @Column
  name: string;

  @AllowNull(false)
  @Column
  phoneNumber: string;

  @AllowNull(true)
  @Column
  documentNumber: string;

  @AllowNull(true)
  @Column
  template: string;

  @AllowNull(true)
  @Column
  templateParams: string;

  @AllowNull(true)
  @Column
  message: string;

  @AllowNull(true)
  @Column
  msgWhatsId: string;

  @AllowNull(true)
  @Column
  errorAt: Date;

  @AllowNull(true)
  @Column
  errorMessage: string;

  @AllowNull(true)
  @Column
  deliveredAt: Date;

  @AllowNull(true)
  @Column
  processedAt: Date;

  @AllowNull(true)
  @Column
  sentAt: Date;

  @AllowNull(true)
  @Column
  readAt: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => File)
  file: File;

  @ForeignKey(() => File)
  @Column
  fileId: number;
}

export default FileRegister;
