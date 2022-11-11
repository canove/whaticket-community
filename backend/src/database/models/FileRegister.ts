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
import ExposedImport from "./ExposedImport";
import File from "./File";
import IntegratedImport from "./IntegratedImport";

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
  whatsappId: number;

  @AllowNull(true)
  @Column
  deliveredAt: Date;

  @AllowNull(true)
  @Column
  processedAt: Date;

  @AllowNull(true)
  @Column
  interactionAt: Date;

  @AllowNull(true)
  @Column
  billingProcessedAt: Date;

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

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @ForeignKey(() => File)
  @Column
  fileId: number;

  @ForeignKey(() => IntegratedImport)
  @Column
  integratedImportId: number;

  @ForeignKey(() => ExposedImport)
  @Column
  exposedImportId: string;

  @AllowNull(true)
  @Column
  var1: string;

  @AllowNull(true)
  @Column
  var2: string;

  @AllowNull(true)
  @Column
  var3: string;

  @AllowNull(true)
  @Column
  var4: string;

  @AllowNull(true)
  @Column
  var5: string;
}

export default FileRegister;
